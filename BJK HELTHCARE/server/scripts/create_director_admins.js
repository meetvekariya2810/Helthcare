const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Employee = require('../models/Employee');

const ADMIN_ACCOUNTS = [
  {
    name: 'Ketan',
    fullName: 'Ketan Patel',
    email: 'ketan@bjkhealthcare.com',
    employeeId: 'BJK-ADM-001',
    employeeCode: 'BJK-ADM-001',
    password: 'Ketan@BJK2026!',
    role: 'SUPER_ADMIN',
    department: 'EXECUTIVE_MANAGEMENT',
    designation: 'Director & Executive Super Administrator'
  },
  {
    name: 'Haresh',
    fullName: 'Haresh Patel',
    email: 'haresh@bjkhealthcare.com',
    employeeId: 'BJK-ADM-002',
    employeeCode: 'BJK-ADM-002',
    password: 'Haresh@BJK2026!',
    role: 'SUPER_ADMIN',
    department: 'EXECUTIVE_MANAGEMENT',
    designation: 'Director & Executive Super Administrator'
  },
  {
    name: 'Ravi',
    fullName: 'Ravi Patel',
    email: 'ravi@bjkhealthcare.com',
    employeeId: 'BJK-ADM-003',
    employeeCode: 'BJK-ADM-003',
    password: 'Ravi@BJK2026!',
    role: 'SUPER_ADMIN',
    department: 'EXECUTIVE_MANAGEMENT',
    designation: 'Director & Executive Super Administrator'
  },
  {
    name: 'Meet',
    fullName: 'Meet Vekariya',
    email: 'meet@bjkhealthcare.com',
    employeeId: 'BJK-ADM-004',
    employeeCode: 'BJK-ADM-004',
    password: 'Meet@BJK2026!',
    role: 'SUPER_ADMIN',
    department: 'EXECUTIVE_MANAGEMENT',
    designation: 'Director & Executive Super Administrator'
  }
];

const ALL_PERMISSIONS = [
  '*',
  'system:all',
  'admin:all',
  'dashboard:view',
  'operations:view',
  'operations:manage',
  'factory:view',
  'factory:manage',
  'production:view',
  'production:manage',
  'quality:qc',
  'quality:qa',
  'regulatory:view',
  'regulatory:manage',
  'inventory:view',
  'inventory:manage',
  'crm:view',
  'crm:manage',
  'export:view',
  'export:manage',
  'finance:view',
  'finance:manage',
  'documents:view',
  'documents:manage',
  'ai_copilot:access',
  'audit:view',
  'database:manage',
  'hrms:all',
  'employee:read',
  'employee:write',
  'employee:manage',
  'attendance:read',
  'attendance:write',
  'attendance:manage',
  'leave:read',
  'leave:approve',
  'leave:manage',
  'payroll:read',
  'payroll:write',
  'payroll:manage'
];

const FULL_ACCESS_CONFIG = {
  dashboard: { enabled: true, fullAccess: true },
  operations: { enabled: true, fullAccess: true },
  factory: { enabled: true, fullAccess: true },
  production: { enabled: true, fullAccess: true },
  qc: { enabled: true, fullAccess: true },
  qa: { enabled: true, fullAccess: true },
  regulatory: { enabled: true, fullAccess: true },
  inventory: { enabled: true, fullAccess: true },
  crm: { enabled: true, fullAccess: true },
  export: { enabled: true, fullAccess: true },
  finance: { enabled: true, fullAccess: true },
  documents: { enabled: true, fullAccess: true },
  ai_copilot: { enabled: true, fullAccess: true },
  audit: { enabled: true, fullAccess: true },
  database: { enabled: true, fullAccess: true },
  hrms: { enabled: true, fullAccess: true },
  employee_portal: { enabled: true, fullAccess: true },
  canteen: { enabled: true, fullAccess: true }
};

async function createAdminAccounts() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.\n');

    for (const acc of ADMIN_ACCOUNTS) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(acc.password, salt);

      // 1. Sync User Document
      let userDoc = await User.findOne({
        $or: [
          { email: acc.email.toLowerCase() },
          { employeeId: acc.employeeId },
          { employeeCode: acc.employeeCode }
        ]
      });

      if (!userDoc) {
        userDoc = new User({
          name: acc.fullName,
          email: acc.email.toLowerCase(),
          workEmail: acc.email.toLowerCase(),
          employeeId: acc.employeeId,
          employeeCode: acc.employeeCode,
          password: hashedPassword,
          passwordHash: hashedPassword,
          role: acc.role,
          department: acc.department,
          designation: acc.designation,
          status: 'ACTIVE',
          dataScope: 'SYSTEM',
          firstLogin: false,
          mustChangePassword: false,
          isActive: true,
          permissions: ALL_PERMISSIONS,
          approvalPermissions: ALL_PERMISSIONS,
          accessConfig: FULL_ACCESS_CONFIG
        });
        await userDoc.save();
        console.log(`[CREATED] User account: ${acc.name} (${acc.email}) | ID: ${acc.employeeId}`);
      } else {
        userDoc.name = acc.fullName;
        userDoc.email = acc.email.toLowerCase();
        userDoc.workEmail = acc.email.toLowerCase();
        userDoc.employeeId = acc.employeeId;
        userDoc.employeeCode = acc.employeeCode;
        userDoc.password = hashedPassword;
        userDoc.passwordHash = hashedPassword;
        userDoc.role = acc.role;
        userDoc.department = acc.department;
        userDoc.designation = acc.designation;
        userDoc.status = 'ACTIVE';
        userDoc.dataScope = 'SYSTEM';
        userDoc.firstLogin = false;
        userDoc.mustChangePassword = false;
        userDoc.isActive = true;
        userDoc.permissions = ALL_PERMISSIONS;
        userDoc.approvalPermissions = ALL_PERMISSIONS;
        userDoc.accessConfig = FULL_ACCESS_CONFIG;
        await userDoc.save();
        console.log(`[UPDATED] User account: ${acc.name} (${acc.email}) | ID: ${acc.employeeId}`);
      }

      // 2. Sync Employee Document
      let empDoc = await Employee.findOne({
        $or: [
          { employeeId: acc.employeeId },
          { employeeCode: acc.employeeCode },
          { workEmail: acc.email.toLowerCase() }
        ]
      });

      if (!empDoc) {
        empDoc = new Employee({
          name: acc.fullName,
          fullName: acc.fullName,
          firstName: acc.name,
          lastName: acc.fullName.split(' ')[1] || 'Patel',
          employeeId: acc.employeeId,
          employeeCode: acc.employeeCode,
          email: acc.email.toLowerCase(),
          workEmail: acc.email.toLowerCase(),
          personalEmail: acc.email.toLowerCase(),
          phone: '+91 9876543210',
          officialMobile: '+91 9876543210',
          contactNumber: '+91 9876543210',
          role: acc.role,
          systemRole: acc.role,
          employeeCategory: 'TECHNICAL',
          staffCategory: 'TECHNICAL',
          isNonTechnical: false,
          department: acc.department,
          designation: acc.designation,
          status: 'ACTIVE',
          employmentStatus: 'ACTIVE',
          isActive: true,
          password: hashedPassword,
          passwordHash: hashedPassword,
          joiningDate: new Date('2024-01-01'),
          dateOfJoining: new Date('2024-01-01'),
          hireDate: new Date('2024-01-01'),
          permissions: ALL_PERMISSIONS,
          approvalPermissions: ALL_PERMISSIONS,
          accessConfig: FULL_ACCESS_CONFIG
        });
        await empDoc.save();
        console.log(`[CREATED] Employee profile: ${acc.name} (${acc.employeeId})`);
      } else {
        empDoc.name = acc.fullName;
        empDoc.fullName = acc.fullName;
        empDoc.firstName = acc.name;
        empDoc.lastName = acc.fullName.split(' ')[1] || 'Patel';
        empDoc.employeeId = acc.employeeId;
        empDoc.employeeCode = acc.employeeCode;
        empDoc.email = acc.email.toLowerCase();
        empDoc.workEmail = acc.email.toLowerCase();
        empDoc.personalEmail = acc.email.toLowerCase();
        empDoc.phone = '+91 9876543210';
        empDoc.officialMobile = '+91 9876543210';
        empDoc.contactNumber = '+91 9876543210';
        empDoc.role = acc.role;
        empDoc.systemRole = acc.role;
        empDoc.employeeCategory = 'TECHNICAL';
        empDoc.staffCategory = 'TECHNICAL';
        empDoc.isNonTechnical = false;
        empDoc.department = acc.department;
        empDoc.designation = acc.designation;
        empDoc.status = 'ACTIVE';
        empDoc.employmentStatus = 'ACTIVE';
        empDoc.isActive = true;
        empDoc.password = hashedPassword;
        empDoc.passwordHash = hashedPassword;
        empDoc.permissions = ALL_PERMISSIONS;
        empDoc.approvalPermissions = ALL_PERMISSIONS;
        empDoc.accessConfig = FULL_ACCESS_CONFIG;
        await empDoc.save();
        console.log(`[UPDATED] Employee profile: ${acc.name} (${acc.employeeId})`);
      }
    }

    console.log('\n======================================================');
    console.log('✅ ALL 4 ADMIN ACCOUNTS CREATED WITH FULL 100% ACCESS');
    console.log('======================================================');
    ADMIN_ACCOUNTS.forEach((a, i) => {
      console.log(`${i + 1}. Name: ${a.fullName}`);
      console.log(`   Email: ${a.email}`);
      console.log(`   Employee ID: ${a.employeeId}`);
      console.log(`   Password: ${a.password}`);
      console.log(`   Role: ${a.role} (Director & Super Admin - Full Platform Access)`);
      console.log('------------------------------------------------------');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin accounts:', err);
    process.exit(1);
  }
}

createAdminAccounts();
