const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB, getDBName, closeDB } = require('../config/db');
const {
  User,
  Employee,
  Department,
  Role,
  AuditLog
} = require('../models');

// 20 Official Enterprise Departments
const ENTERPRISE_DEPARTMENTS = [
  { name: 'Human Resources', code: 'DEPT-HR', division: 'Corporate Administration', description: 'Central employee identity, onboarding, credential, document, and access management.' },
  { name: 'Finance', code: 'DEPT-FIN', division: 'Finance & Strategy', description: 'Financial planning, accounting operations, budget governance, and audit compliance.' },
  { name: 'Accounts', code: 'DEPT-ACC', division: 'Finance & Strategy', description: 'General ledger, statutory invoicing, payroll disbursement, and tax accounts.' },
  { name: 'Production', code: 'DEPT-PROD', division: 'Manufacturing Operations', description: 'Solid oral dosage execution, compression, coating, and syrup formulation lines.' },
  { name: 'Manufacturing', code: 'DEPT-MFG', division: 'Manufacturing Operations', description: 'Plant facilities, machinery maintenance, cleanroom HVAC, and batch execution.' },
  { name: 'Quality Control', code: 'DEPT-QC', division: 'Quality & Compliance', description: 'LIMS laboratory assays, chromatographic analysis, raw material & finished goods release testing.' },
  { name: 'Quality Assurance', code: 'DEPT-QA', division: 'Quality & Compliance', description: 'QMS governance, cGMP compliance, deviations, CAPA, change controls, and batch certification.' },
  { name: 'Regulatory Affairs', code: 'DEPT-RA', division: 'Global Regulatory', description: 'Global market dossiers, CTD/eCTD submissions, CDSCO filings, and product registrations.' },
  { name: 'Research & Development', code: 'DEPT-RND', division: 'Technical Innovation', description: 'Formulation development, stability studies, analytical method validation, and DPI innovation.' },
  { name: 'Warehouse', code: 'DEPT-WH', division: 'Supply Chain & Logistics', description: 'Finished goods storage, raw material quarantine, temperature-controlled cold chain.' },
  { name: 'Inventory', code: 'DEPT-INV', division: 'Supply Chain & Logistics', description: 'ERP stock transactions, reorder levels, batch reconciliation, and FIFO governance.' },
  { name: 'Procurement', code: 'DEPT-PROC', division: 'Supply Chain & Logistics', description: 'API vendor qualification, excipient procurement, packaging materials, and purchase orders.' },
  { name: 'Sales', code: 'DEPT-SALES', division: 'Commercial Operations', description: 'Domestic sales, distribution network management, institutional tenders, and orders.' },
  { name: 'Marketing', code: 'DEPT-MKTG', division: 'Commercial Operations', description: 'Brand management, pharmaceutical product brochures, digital campaigns, and market research.' },
  { name: 'CRM', code: 'DEPT-CRM', division: 'Commercial Operations', description: 'Client relationship management, institutional customer support, and order tracking.' },
  { name: 'Export', code: 'DEPT-EXPORT', division: 'International Business', description: 'Overseas shipments, international commercial dossiers, freight logistics, and customs.' },
  { name: 'IT', code: 'DEPT-IT', division: 'Digital Technology', description: 'Digital Brain enterprise infrastructure, cybersecurity, network uptime, and access controls.' },
  { name: 'Administration', code: 'DEPT-ADMIN', division: 'Corporate Administration', description: 'Facility management, security operations, travel logistics, and corporate services.' },
  { name: 'Legal', code: 'DEPT-LEGAL', division: 'Corporate Governance', description: 'Commercial contracts, IP patents, regulatory compliance legal defense, and NDAs.' },
  { name: 'Management', code: 'DEPT-MGMT', division: 'Executive Directorate', description: 'Board of Directors, corporate vision, executive leadership, and strategic investments.' }
];

const migrateUsersToHR = async () => {
  console.log('========================================================');
  console.log('BJK HEALTHCARE - USER & HR ENTERPRISE MIGRATION ENGINE');
  console.log('========================================================');

  const conn = await connectDB();
  if (!conn) {
    throw new Error('Database connection failed. Migration aborted.');
  }

  const dbName = getDBName();
  console.log(`[Migration] Connected to database: ${dbName}`);

  const results = {
    departmentsCreated: 0,
    departmentsUpdated: 0,
    usersProcessed: 0,
    employeesLinked: 0,
    testAccountsCreated: 0
  };

  // 1. Seed / Verify All 20 Departments
  console.log('\n[Step 1] Verifying 20 Enterprise Departments...');
  for (const dept of ENTERPRISE_DEPARTMENTS) {
    const existing = await Department.findOne({
      $or: [{ code: dept.code }, { name: dept.name }]
    });

    if (!existing) {
      await Department.create({
        name: dept.name,
        code: dept.code,
        facility: 'BJK Unit 1 - Formulations Facility',
        division: dept.division,
        description: dept.description,
        isActive: true
      });
      results.departmentsCreated++;
    } else {
      existing.division = dept.division;
      existing.description = dept.description;
      existing.isActive = true;
      await existing.save();
      results.departmentsUpdated++;
    }
  }
  console.log(`[Step 1 Complete] Departments: ${results.departmentsCreated} created, ${results.departmentsUpdated} updated.`);

  // 2. Inspect Existing Users & Ensure Proper HR Data & Scope
  console.log('\n[Step 2] Migrating Existing User Records...');
  const users = await User.find({});
  console.log(`[Step 2] Found ${users.length} existing User accounts in MongoDB.`);

  for (const user of users) {
    let modified = false;

    // Resolve Scope
    if (!user.dataScope) {
      if (['SUPER_ADMIN', 'DIRECTOR'].includes(user.role)) user.dataScope = 'SYSTEM';
      else if (['HR_ADMIN', 'HR_MANAGER', 'IT_ADMIN'].includes(user.role)) user.dataScope = 'GLOBAL';
      else if (['HR_EXECUTIVE', 'FINANCE_MANAGER', 'PAYROLL_ADMIN', 'AUDITOR'].includes(user.role)) user.dataScope = 'COMPANY';
      else if (['QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'WAREHOUSE_MANAGER', 'SALES_MANAGER', 'EXPORT_MANAGER'].includes(user.role)) user.dataScope = 'DEPARTMENT';
      else if (user.role === 'TEAM_LEAD') user.dataScope = 'TEAM';
      else user.dataScope = 'SELF';
      modified = true;
    }

    if (user.firstLogin === undefined) { user.firstLogin = false; modified = true; }
    if (user.mustChangePassword === undefined) { user.mustChangePassword = false; modified = true; }
    if (user.temporaryPassword === undefined) { user.temporaryPassword = false; modified = true; }
    if (user.isLocked === undefined) { user.isLocked = false; modified = true; }
    if (!user.status) { user.status = user.isActive ? 'ACTIVE' : 'INACTIVE'; modified = true; }
    if (!user.workEmail) { user.workEmail = user.email; modified = true; }

    // Ensure user has valid employeeId
    if (!user.employeeId) {
      user.employeeId = `BJK-EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;
      modified = true;
    }

    if (modified) {
      await user.save({ validateBeforeSave: false });
    }

    // 3. Ensure corresponding Employee record exists and is linked
    let employee = await Employee.findOne({
      $or: [{ user: user._id }, { email: user.email }, { employeeId: user.employeeId }]
    });

    const nameParts = (user.name || 'BJK Operator').split(' ');
    const firstName = nameParts[0] || 'BJK';
    const lastName = nameParts.slice(1).join(' ') || 'Operator';

    if (!employee) {
      employee = new Employee({
        employeeId: user.employeeId,
        employeeCode: user.employeeId,
        firstName,
        lastName,
        fullName: user.name,
        email: user.email,
        workEmail: user.email,
        phone: user.phone || '+91 99744 86967',
        department: user.department || 'Operations',
        departmentName: user.department || 'Operations',
        designation: user.role.replace(/_/g, ' '),
        designationTitle: user.role.replace(/_/g, ' '),
        facility: user.facilityName || 'BJK Unit 1 - Formulations Facility',
        status: user.isActive ? 'ACTIVE' : 'INACTIVE',
        employmentStatus: user.isActive ? 'ACTIVE' : 'INACTIVE',
        employmentType: 'FULL_TIME',
        user: user._id,
        joiningDate: user.createdAt || new Date()
      });
      await employee.save();
      results.employeesLinked++;
    } else {
      if (!employee.user) {
        employee.user = user._id;
        await employee.save();
        results.employeesLinked++;
      }
    }

    results.usersProcessed++;
  }
  console.log(`[Step 2 Complete] Processed ${results.usersProcessed} users, linked ${results.employeesLinked} employees.`);

  // 4. Seed enterprise and test persona accounts
  console.log('\n[Step 3] Seeding Standard & Test Persona Accounts...');
  const testAccounts = [
    {
      name: 'Super Admin',
      email: 'superadmin@bjkhealthcare.com',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      employeeId: 'BJK-ADM-000',
      designation: 'Super Administrator',
      password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'Password123!'
    },
    {
      name: 'HR Administration',
      email: 'hr@bjkhealthcare.com',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      employeeId: 'BJK-HR-000',
      designation: 'HR Administration',
      password: process.env.SEED_HR_MANAGER_PASSWORD || 'Password123!'
    },
    {
      name: 'HR Manager',
      email: 'hr.manager@bjkhealthcare.com',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      employeeId: 'BJK-EMP-004',
      designation: 'HR Manager',
      password: process.env.SEED_HR_MANAGER_PASSWORD || 'Password123!'
    },
    {
      name: 'Dr. Vikram Mehta',
      email: 'admin@bjkhealthcare.com',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      employeeId: 'BJK-EMP-000',
      designation: 'Managing Director & CEO',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@BJK2026!'
    },
    {
      name: 'Executive Director',
      email: 'director@bjkhealthcare.com',
      role: 'DIRECTOR',
      department: 'Management',
      employeeId: 'BJK-EMP-001',
      designation: 'Executive Director',
      password: process.env.SEED_DIRECTOR_PASSWORD || 'Password123!'
    },
    {
      name: 'HR Administrator',
      email: 'hr.admin@bjkhealthcare.com',
      role: 'HR_ADMIN',
      department: 'Human Resources',
      employeeId: 'BJK-EMP-002',
      designation: 'HR Administrator',
      password: process.env.SEED_HR_ADMIN_PASSWORD || 'Password123!'
    },
    {
      name: 'Priya Sharma',
      email: 'qa.manager@bjkhealthcare.com',
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
      employeeId: 'BJK-EMP-005',
      designation: 'QA Manager',
      password: process.env.SEED_QA_MANAGER_PASSWORD || 'Password123!'
    },
    {
      name: 'Rajesh Patel',
      email: 'employee@bjkhealthcare.com',
      role: 'EMPLOYEE',
      department: 'Production',
      employeeId: 'BJK-EMP-003',
      designation: 'Production Specialist',
      password: process.env.SEED_EMPLOYEE_PASSWORD || 'Password123!'
    },
    {
      name: 'Test HR Administrator',
      email: 'hr.admin@test.bjkhealthcare.local',
      role: 'HR_ADMIN',
      department: 'Human Resources',
      employeeId: 'BJK-TEST-HR01',
      designation: 'HR Administrator',
      password: 'Password123!'
    },
    {
      name: 'Test QA Manager',
      email: 'qa.manager@test.bjkhealthcare.local',
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
      employeeId: 'BJK-TEST-QA01',
      designation: 'QA Manager',
      password: 'Password123!'
    },
    {
      name: 'Test Production Manager',
      email: 'production.manager@test.bjkhealthcare.local',
      role: 'PRODUCTION_MANAGER',
      department: 'Production',
      employeeId: 'BJK-TEST-PR01',
      designation: 'Production Manager',
      password: 'Password123!'
    },
    {
      name: 'Test Warehouse Manager',
      email: 'warehouse.manager@test.bjkhealthcare.local',
      role: 'WAREHOUSE_MANAGER',
      department: 'Warehouse',
      employeeId: 'BJK-TEST-WH01',
      designation: 'Warehouse Manager',
      password: 'Password123!'
    },
    {
      name: 'Test Line Operator',
      email: 'employee.test@test.bjkhealthcare.local',
      role: 'EMPLOYEE',
      department: 'Production',
      employeeId: 'BJK-TEST-EMP01',
      designation: 'Tablet Compression Operator',
      password: 'Password123!'
    }
  ];

  for (const t of testAccounts) {
    const rawPass = t.password || 'Password123!';
    const tSalt = await bcrypt.genSalt(10);
    const tHash = await bcrypt.hash(rawPass, tSalt);

    let tUser = await User.findOne({ email: t.email });
    let isNewUser = false;
    if (!tUser) {
      tUser = new User({
        name: t.name,
        email: t.email,
        workEmail: t.email,
        password: tHash,
        passwordHash: tHash,
        role: t.role,
        department: t.department,
        employeeId: t.employeeId,
        isActive: true,
        firstLogin: false,
        mustChangePassword: false,
        status: 'ACTIVE',
        isDemo: true
      });
      await tUser.save();
      isNewUser = true;
      results.testAccountsCreated++;
    } else {
      // Update password hash if existing demo user
      tUser.password = tHash;
      tUser.passwordHash = tHash;
      tUser.workEmail = t.email;
      tUser.employeeId = t.employeeId;
      tUser.isActive = true;
      await tUser.save();
    }

    let tEmp = await Employee.findOne({ email: t.email });
    if (!tEmp) {
      const parts = t.name.split(' ');
      tEmp = new Employee({
        employeeId: t.employeeId,
        employeeCode: t.employeeId,
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
        fullName: t.name,
        email: t.email,
        workEmail: t.email,
        phone: '+91 98765 43210',
        department: t.department,
        departmentName: t.department,
        designation: t.designation,
        designationTitle: t.designation,
        facility: 'BJK Unit 1 - Formulations Facility',
        status: 'ACTIVE',
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        user: tUser._id,
        isDemo: true
      });
      await tEmp.save();
    }
  }
  console.log(`[Step 3 Complete] Seeded ${results.testAccountsCreated} new test accounts.`);

  // 5. Record Migration Audit Log
  await AuditLog.logAction({
    action: 'MIGRATION',
    module: 'HRMS',
    resource: 'System',
    resourceId: 'MIGRATE_USERS_TO_HR',
    status: 'SUCCESS',
    details: `Idempotent HR migration completed. Departments: ${results.departmentsCreated + results.departmentsUpdated}, Users: ${results.usersProcessed}, Employees Linked: ${results.employeesLinked}.`
  });

  console.log('\n========================================================');
  console.log('MIGRATION SUMMARY');
  console.log('========================================================');
  console.log(`Database:              ${dbName}`);
  console.log(`Departments Total:     ${results.departmentsCreated + results.departmentsUpdated} (20 Verified)`);
  console.log(`Users Processed:       ${results.usersProcessed}`);
  console.log(`Employees Linked:      ${results.employeesLinked}`);
  console.log(`Test Personas Created: ${results.testAccountsCreated}`);
  console.log('STATUS:                SUCCESS & IDEMPOTENT');
  console.log('========================================================\n');

  return results;
};

if (require.main === module) {
  migrateUsersToHR()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Migration Error]:', err);
      await closeDB();
      process.exit(1);
    });
}

module.exports = { migrateUsersToHR };
