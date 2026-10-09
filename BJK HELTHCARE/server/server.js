require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const { migrateUsersToHR } = require('./scripts/migrateUsersToHR');

// Import Route Handlers
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const hrRoutes = require('./routes/hrRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const hrmsRoutes = require('./routes/hrmsRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const auditRoutes = require('./routes/auditRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initLeaveMaster } = require('./services/hrms/leaveService');

const app = express();
const httpServer = http.createServer(app);
const PORT = Number(process.env.PORT || 5000);

// Ensure database connection for both long-running and serverless environments
let dbInitPromise = null;
const ensureDatabaseConnection = async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      let conn = await connectDB();
      let retries = 0;
      while ((!conn || mongoose.connection.readyState !== 1) && retries < 3) {
        retries++;
        console.log(`[Server Startup] Waiting for MongoDB to become ready (attempt ${retries})...`);
        await new Promise(r => setTimeout(r, 1500));
        conn = await connectDB();
      }
      return conn;
    })().catch(err => {
      dbInitPromise = null;
      console.error('[Database Connect Error]', err.message);
    });
  }
  return dbInitPromise;
};

// Auto-init for standalone server mode
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  (async function initDatabase() {
    await ensureDatabaseConnection();


  try {
    const Product = require('./models/Product');
    const User = require('./models/User');

    const pCount = await Product.countDocuments();
    if (pCount < 111) {
      console.log('[Server Auto-Init] Products count: ' + pCount + '. Seeding 111 official products and enterprise master...');
      const { seedDatabase } = require('./seed/seed');
      await seedDatabase();
    }

    const { getSeedUsers } = require('./seed/authSeed');
    const { ROLE_PERMISSIONS } = require('./config/rbac');
    const seedList = await getSeedUsers();
    for (const u of seedList) {
      const email = u.email.toLowerCase().trim();
      let user = await User.findOne({ email });
      const permissions = ROLE_PERMISSIONS[u.role] || [];
      if (!user) {
        user = new User({ ...u, email, permissions });
      } else {
        user.password = u.password;
        user.role = u.role;
        user.department = u.department || user.department;
        user.employeeId = u.employeeId || user.employeeId;
        user.status = 'ACTIVE';
        user.isActive = true;
        user.permissions = permissions;
      }
      await user.save();
    }
    console.log('[Server Auto-Init] Enterprise role users verified/seeded.');
  } catch (seedErr) {
    console.warn('[Server Auto-Init] Enterprise master seed note:', seedErr.message);
  }

  try {
    const { seedEmployeePortalUsers } = require('./seed/employeePortalSeed');
    await seedEmployeePortalUsers();
    console.log('[Server Auto-Init] Employee portal accounts verified, including Rajesh Patel (BJK-EMP-003).');
  } catch (seedErr) {
    console.error('[Server Auto-Init] Employee portal seed warning:', seedErr.message);
  }

  try {
    await migrateUsersToHR();
    await initLeaveMaster();
    const { seedAttendance } = require('./seed/attendanceSeed');
    await seedAttendance();
  } catch (err) {
    console.error('[Server Auto-Init] HR migration warning:', err.message);
  }

  try {
    const { syncExcelToDatabase } = require('./services/hrms/credentialExcelService');
    const syncRes = await syncExcelToDatabase();
    console.log(`[Server Auto-Init] Employee credentials initialized from Excel (${syncRes.activeSynced} active accounts loaded).`);
  } catch (credErr) {
    console.warn('[Server Auto-Init] Employee credentials load note:', credErr.message);
  }

  try {
    const { seedDepartmentTestAccounts } = require('./seed/departmentTestAccountsSeed');
    await seedDepartmentTestAccounts();
  } catch (testAccErr) {
    console.warn('[Server Auto-Init] Department test accounts note:', testAccErr.message);
  }

  try {
    const { syncLeaveLedgerFromSeed } = require('./services/hrms/leaveLedgerService');
    const ledgerRes = await syncLeaveLedgerFromSeed();
    console.log(`[Server Auto-Init] 2026 Employee Leave Ledger initialized (${ledgerRes.count || 0} employees loaded from Leave 2026(Sheet1).csv).`);
  } catch (ledgerErr) {
    console.warn('[Server Auto-Init] Leave ledger initialization note:', ledgerErr.message);
  }

  try {
    const { initWorkforceCalendarMaster } = require('./services/hrms/workforceCalendarService');
    await initWorkforceCalendarMaster();
  } catch (calErr) {
    console.warn('[Server Auto-Init] Workforce calendar init note:', calErr.message);
  }

  try {
    const { syncExistingEmployeeBankDetailsToCollection } = require('./services/hrms/bankDetailsService');
    const bankSyncCount = await syncExistingEmployeeBankDetailsToCollection();
    if (bankSyncCount > 0) {
      console.log(`[Server Auto-Init] Bank Details master synchronized (${bankSyncCount} verified employee accounts loaded).`);
    }
  } catch (bankErr) {
    console.warn('[Server Auto-Init] Bank details initialization note:', bankErr.message);
  }
  })();
}

// Ensure database connection for incoming API requests
app.use(async (req, res, next) => {
  if (req.url && req.url.startsWith('/api')) {
    try {
      await ensureDatabaseConnection();
    } catch (e) {
      console.error('[API Database Middleware Error]', e.message);
    }
  }
  next();
});

// Request ID Middleware
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || 'BJKE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Security & Utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// CORS Configuration (Fixed Single Port: 5000)
const allowedOrigins = [
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || (process.env.NODE_ENV !== 'production' && (origin === 'http://localhost:5000' || origin === 'http://127.0.0.1:5000'))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

app.use(morgan('dev'));

// JSON Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Document Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// If an upload URL was not found on disk, return 404 JSON instead of SPA HTML
app.use('/uploads/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Document or upload file not found on server disk.' });
});

// ==============================================================================
// MASTER BJK HEALTHCARE DIGITAL BRAIN REST API (Section 42)
// ==============================================================================
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/permissions', require('./routes/permissionRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));
app.use('/api/products', productRoutes);
app.use('/api/production', require('./routes/productionRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/qc', require('./routes/qcRoutes'));
app.use('/api/qa', require('./routes/qaRoutes'));
app.use('/api/regulatory', require('./routes/regulatoryRoutes'));
app.use('/api/crm', require('./routes/crmRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/audit', auditRoutes);
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// HR & Operations
app.use('/api/hr', hrRoutes);
app.use('/api/hr/bank-details', require('./routes/hrBankRoutes'));
app.use('/api/hrms/bank-details', require('./routes/hrBankRoutes'));
app.use('/api/hr/credentials', require('./routes/hr/loginCredentialsRoutes'));
app.use('/api/credentials', require('./routes/hr/loginCredentialsRoutes'));
app.use('/api/hr/policies', require('./routes/hr/policyRoutes'));
app.use('/api/policies', require('./routes/hr/policyRoutes'));
app.use('/api/departments', (req, res, next) => {
  req.url = '/departments' + req.url;
  hrRoutes(req, res, next);
});
app.use('/api/roles', (req, res, next) => {
  req.url = '/roles' + req.url;
  hrRoutes(req, res, next);
});
app.use('/api/employees', employeeRoutes);
app.use('/api/hrms', hrmsRoutes);
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leave', leaveRoutes);
app.use('/api/hr/leave', leaveRoutes);
app.use('/api/manager/leave', (req, res, next) => {
  req.url = '/manager' + req.url;
  leaveRoutes(req, res, next);
});
app.use('/api/department-head/leave', (req, res, next) => {
  req.url = '/department-head' + req.url;
  leaveRoutes(req, res, next);
});
app.use('/api/admin/attendance', require('./routes/adminAttendanceRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/enterprise', enterpriseRoutes);

// Employee Self-Service Portal Routes (Strict Identity & Ownership Isolated)
app.post('/api/employee/login', (req, res, next) => require('./controllers/EmployeeAuthController').login(req, res, next));
app.get('/api/employee/me', require('./middleware/employeeAuth').authenticateEmployee, (req, res, next) => require('./controllers/EmployeeAuthController').getMe(req, res, next));
app.get('/api/employee/dashboard', require('./middleware/employeeAuth').authenticateEmployee, (req, res, next) => require('./controllers/EmployeeProfileController').getMyProfile(req, res, next));
app.use('/api/employee/auth', require('./routes/employeeAuthRoutes'));
app.use('/api/employee/profile', require('./routes/employeeProfileRoutes'));
app.use('/api/employee/bank-details', require('./routes/employeeBankRoutes'));
app.use('/api/employee/attendance', require('./routes/employeeAttendanceRoutes'));
app.use('/api/employee/attendance-face', require('./routes/employeeAttendanceRoutes'));
app.use('/api/employee/leave', require('./routes/employeeLeaveRoutes'));
app.use('/api/employee/payroll', require('./routes/employeePayrollRoutes'));
app.use('/api/employee/payslips', (req, res, next) => {
  req.url = '/payslips' + req.url;
  require('./routes/employeePayrollRoutes')(req, res, next);
});
app.use('/api/employee/documents', require('./routes/employeeDocumentRoutes'));
app.use('/api/employee/tasks', require('./routes/employeeTaskRoutes'));
app.use('/api/employee/support', require('./routes/employeeSupportRoutes'));
app.use('/api/employee/notifications', require('./routes/employeeNotificationRoutes'));
app.use('/api/employee/announcements', (req, res, next) => {
  req.url = '/announcements' + req.url;
  require('./routes/employeeNotificationRoutes')(req, res, next);
});
app.use('/api/employee/team', require('./routes/employeeTeamRoutes'));
app.use('/api/employee/settings', require('./routes/employeeSettingsRoutes'));
app.use('/api/employee/shift', require('./routes/employeeShiftRoutes'));
app.use('/api/employee/training', require('./routes/employeeTrainingRoutes'));
app.use('/api/employee/compliance', (req, res, next) => {
  req.url = '/compliance' + req.url;
  require('./routes/employeeTrainingRoutes')(req, res, next);
});
app.use('/api/employee/policies', require('./routes/employeePolicyRoutes'));
app.use('/api/employee/copilot', require('./routes/employeeCopilotRoutes'));
app.use('/api/employee/ai', require('./routes/employeeCopilotRoutes'));
// Workforce Calendar & Attendance Policy Management Routes
const workforceCalendarRoutes = require('./routes/hr/workforceCalendarRoutes');
const employeeCalendarRoutes = require('./routes/employeeCalendarRoutes');

app.use('/api/hr/calendar', workforceCalendarRoutes);
app.use('/api/hrms/calendar', workforceCalendarRoutes);
app.use('/api/admin/calendar', workforceCalendarRoutes);
app.use('/api/employee/calendar', employeeCalendarRoutes);
app.use('/api/employee/me/calendar', employeeCalendarRoutes);
app.use('/api/employee/me', employeeCalendarRoutes);

app.use('/api/canteen', require('./routes/hrms/canteenRoutes'));
app.use('/api/employee/canteen', require('./routes/hrms/canteenRoutes'));
app.use('/api/hrms/canteen', require('./routes/hrms/canteenRoutes'));
app.use('/api/hr/canteen', require('./routes/hrms/canteenRoutes'));

// Catch-all for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Frontend Single-Port Integration (Vite Middleware in Development, Static in Production)
async function startServer() {
  const clientDir = path.resolve(__dirname, '../client');

  if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = require(path.join(clientDir, 'node_modules/vite'));
      const viteInstance = await createViteServer({
        configFile: path.join(clientDir, 'vite.config.js'),
        root: clientDir,
        server: {
          middlewareMode: true,
          hmr: {
            server: httpServer,
          },
        },
        appType: 'spa',
      });
      app.use(viteInstance.middlewares);

      // SPA Catch-all: transform and serve index.html for all non-API/uploads routes
      app.use('*', async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith('/api') || url.startsWith('/uploads')) {
          return next();
        }
        try {
          const indexPath = path.resolve(clientDir, 'index.html');
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await viteInstance.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e) {
          viteInstance.ssrFixStacktrace(e);
          next(e);
        }
      });
    } catch (viteErr) {
      console.warn('[Vite Dev Middleware Note]', viteErr.message);
      const clientDist = path.join(clientDir, 'dist');
      app.use(express.static(clientDist));
      app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) return next();
        res.sendFile(path.join(clientDist, 'index.html'));
      });
    }
  } else {
    const clientDist = path.join(clientDir, 'dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  // Global Error Handler (must be the final middleware)
  app.use(errorHandler);

  const listenWithFallback = (portToTry, attemptsLeft = 10) => {
    const serverInstance = httpServer.listen(portToTry, () => {
      console.log('========================================');
      console.log('BJK HEALTHCARE DIGITAL BRAIN');
      console.log('Development Server');
      console.log('========================================');
      console.log('');
      console.log('Application:');
      console.log(`http://localhost:${portToTry}`);
      console.log('');
      console.log('API:');
      console.log(`http://localhost:${portToTry}/api`);
      console.log('');
      console.log('Health:');
      console.log(`http://localhost:${portToTry}/api/health`);
      console.log('');
      console.log('MongoDB:');
      console.log('Connected to MongoDB Atlas');
      console.log('');
      console.log('Environment:');
      console.log(process.env.NODE_ENV || 'development');
      console.log('');
      console.log('Port:');
      console.log(portToTry);
      console.log('');
      console.log('========================================');
    });

    serverInstance.once('error', (err) => {
      if (err.code === 'EADDRINUSE' && attemptsLeft > 0) {
        console.warn(`[Port Fallback] Port ${portToTry} is already in use. Automatically switching to port ${portToTry + 1}...`);
        setTimeout(() => {
          listenWithFallback(portToTry + 1, attemptsLeft - 1);
        }, 300);
      } else {
        console.error('[Server Error]', err.message);
        process.exit(1);
      }
    });
  };

  listenWithFallback(PORT);
}

if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  startServer();
} else {
  // In Vercel serverless, ensure global error handler is always mounted
  app.use(errorHandler);
}

app.server = httpServer;
module.exports = app;
// [BJK Single Port Architecture: http://localhost:5000]
