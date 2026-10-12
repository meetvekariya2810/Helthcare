const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const { protect, requireRole } = require('../middleware/auth');
const attendanceImportCtrl = require('../controllers/hrms/attendanceImportController');
const { biometricWebhook } = require('../controllers/hrms/attendanceController');
const hrmsRoutes = require('./hrmsRoutes');
const rateLimit = require('express-rate-limit');

const biometricLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const deviceId = req.headers['x-device-id'] || req.headers['x-biometric-device'] || req.body?.deviceId || req.body?.[0]?.deviceId || '';
    return deviceId ? `${ip}_${deviceId}` : ip;
  },
  message: { success: false, message: 'Too many requests from biometric device. Please retry in 1 minute.' }
});

// Biometric Hardware Webhook (Protected by X-Biometric-Secret header + rate limited)
router.post('/webhook', biometricLimiter, biometricWebhook);

// All other attendance routes require valid JWT authentication
router.use(protect);

// 1. Validation / Dry Run
router.post('/import/validate', upload.single('file'), attendanceImportCtrl.validateImport);

// 2. Import Execution
router.post('/import', upload.single('file'), attendanceImportCtrl.executeImport);

// 3. Batches History & Details
router.get('/imports', attendanceImportCtrl.getImportBatches);
router.get('/imports/:importBatchId', attendanceImportCtrl.getImportBatchById);

// 4. Safe Rollback
router.post('/imports/:importBatchId/rollback', protect, requireRole('HR_ADMIN', 'SUPER_ADMIN'), attendanceImportCtrl.rollbackImport);

// 5. Employee-specific attendance (Strictly isolated as per Rule 23 & 26)
router.get('/employee/:employeeCode', attendanceImportCtrl.getEmployeeAttendanceByCode);

// 6. Monthly overview
router.get('/month/:year/:month', attendanceImportCtrl.getMonthAttendance);

// 7. Department overview
router.get('/department/:departmentId', attendanceImportCtrl.getDepartmentAttendance);

// 8. Employee Master Non-Destructive Validation & Safe Profile Enrichment (Rules 1, 4, 7, 28, 29)
router.get('/master-validation', attendanceImportCtrl.validateMaster);
router.post('/master-validation', upload.single('file'), attendanceImportCtrl.validateMaster);
router.post('/master-enrich', upload.single('file'), attendanceImportCtrl.enrichMasterProfiles);

// Fallback for existing legacy attendance sub-routes (e.g. /dashboard, /punch, /reports)
router.use((req, res, next) => {
  req.url = '/attendance' + (req.url === '/' ? '' : req.url);
  hrmsRoutes(req, res, next);
});

module.exports = router;
