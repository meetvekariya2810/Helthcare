require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLE_PERMISSIONS } = require('../config/rbac');

const getSeedUsers = async () => {
  const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'Admin@BJK2026!';
  const hrPwd = process.env.SEED_HR_MANAGER_PASSWORD || 'Bjk@2810';
  const defaultPwd = 'Password123!';

  return [
    {
      name: 'Krutika Parmar',
      email: 'bh1046@bjkhealthcare.com',
      workEmail: 'bh1046@bjkhealthcare.com',
      password: hrPwd,
      role: 'HR_MANAGER',
      department: 'Human Resources',
      employeeId: 'BH1046',
      employeeCode: 'BH1046',
      dataScope: 'GLOBAL',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Super Admin',
      email: 'superadmin@bjkhealthcare.com',
      password: adminPwd,
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      employeeId: 'BJK-ADM-000',
      dataScope: 'SYSTEM',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Dr. Vikram Mehta',
      email: 'admin@bjkhealthcare.com',
      password: adminPwd,
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      employeeId: 'BJK-ADM-001',
      dataScope: 'SYSTEM',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'HR Administration',
      email: 'hr@bjkhealthcare.com',
      password: hrPwd,
      role: 'HR_MANAGER',
      department: 'Human Resources',
      employeeId: 'BJK-HR-000',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Rajesh Sharma',
      email: 'director@bjkhealthcare.com',
      password: defaultPwd,
      role: 'DIRECTOR',
      department: 'Executive Management',
      employeeId: 'BJK-DIR-001',
      dataScope: 'SYSTEM',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Kunal Verma',
      email: 'operations.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'OPERATIONS_MANAGER',
      department: 'Operations & Production',
      employeeId: 'BJK-OPS-001',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Amit Trivedi',
      email: 'production.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'PRODUCTION_MANAGER',
      department: 'Manufacturing Operations',
      employeeId: 'BJK-PRD-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'production@bjkhealthcare.com',
      email: 'production@bjkhealthcare.com',
      password: defaultPwd,
      role: 'PRODUCTION_MANAGER',
      department: 'Manufacturing Operations',
      employeeId: 'BJK-PRD-002',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Suresh Patel',
      email: 'qc.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'QC_MANAGER',
      department: 'Quality Control',
      employeeId: 'BJK-QC-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Dr. Anita Desai',
      email: 'qa.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
      employeeId: 'BJK-QA-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Pooja Iyer',
      email: 'regulatory.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'REGULATORY_MANAGER',
      department: 'Regulatory Affairs',
      employeeId: 'BJK-REG-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'regulatory@bjkhealthcare.com',
      email: 'regulatory@bjkhealthcare.com',
      password: defaultPwd,
      role: 'REGULATORY_MANAGER',
      department: 'Regulatory Affairs',
      employeeId: 'BJK-REG-002',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Mahesh Solanki',
      email: 'inventory.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'WAREHOUSE_MANAGER',
      department: 'Warehouse & Logistics',
      employeeId: 'BJK-WH-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Rohan Gupta',
      email: 'crm.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'CRM_MANAGER',
      department: 'Commercial & Sales',
      employeeId: 'BJK-CRM-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Sameer Joshi',
      email: 'export.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'EXPORT_MANAGER',
      department: 'International Business',
      employeeId: 'BJK-EXP-001',
      dataScope: 'DEPARTMENT',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Manish Parekh',
      email: 'finance.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'FINANCE_MANAGER',
      department: 'Finance & Accounts',
      employeeId: 'BJK-FIN-001',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Smita Kulkarni',
      email: 'documents.controller@bjkhealthcare.com',
      password: defaultPwd,
      role: 'DOCUMENT_CONTROLLER',
      department: 'Document Control Cell',
      employeeId: 'BJK-DOC-001',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Nehal Vora',
      email: 'hr.manager@bjkhealthcare.com',
      password: defaultPwd,
      role: 'HR_MANAGER',
      department: 'Human Resources',
      employeeId: 'BJK-HR-001',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Rajesh Patel',
      email: 'employee@bjkhealthcare.com',
      password: defaultPwd,
      role: 'EMPLOYEE',
      department: 'Production Operations',
      employeeId: 'BJK-EMP-003',
      dataScope: 'SELF',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'CA Alok Singhania',
      email: 'auditor@bjkhealthcare.com',
      password: defaultPwd,
      role: 'AUDITOR',
      department: 'Internal Quality Audit',
      employeeId: 'BJK-AUD-001',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Sunil Shah',
      email: 'regulatory.viewer@bjkhealthcare.com',
      password: defaultPwd,
      role: 'REGULATORY_VIEWER',
      department: 'Regulatory Affairs',
      employeeId: 'BJK-REG-003',
      dataScope: 'SELF',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'Arun Bhatia',
      email: 'executive.viewer@bjkhealthcare.com',
      password: defaultPwd,
      role: 'EXECUTIVE_VIEWER',
      department: 'Executive Management',
      employeeId: 'BJK-EXE-001',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    },
    {
      name: 'BJK Healthcare Canteen Department',
      email: 'canteen@bjkhealthcare.com',
      workEmail: 'canteen@bjkhealthcare.com',
      password: process.env.SEED_CANTEEN_PASSWORD || 'BJK@Canteen#2026',
      role: 'CANTEEN_ADMIN',
      department: 'Canteen Department',
      employeeId: 'BJK-CNT-001',
      employeeCode: 'BJK-CNT-001',
      dataScope: 'GLOBAL',
      status: 'ACTIVE',
      isActive: true,
      isDemo: true
    }
  ];
};

const seedAuthUsers = async () => {
  const usersToSeed = await getSeedUsers();
  const createdUsers = [];

  for (const userData of usersToSeed) {
    const normalizedEmail = userData.email.toLowerCase().trim();
    await User.deleteMany({ email: normalizedEmail });

    const rolePerms = ROLE_PERMISSIONS[userData.role] || [];
    const user = await User.create({
      ...userData,
      email: normalizedEmail,
      permissions: rolePerms
    });

    createdUsers.push({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId
    });
  }

  return createdUsers;
};

if (require.main === module) {
  (async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bjk_healthcare';
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      }

      const users = await seedAuthUsers();
      console.log(`[BJK Auth Seed] Successfully seeded ${users.length} enterprise role accounts.`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('[BJK Auth Seed] Error:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedAuthUsers, getSeedUsers };
