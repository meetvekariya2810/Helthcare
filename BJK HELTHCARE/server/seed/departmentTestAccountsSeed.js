require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { LeaveBalance } = require('../models/hrms/Leave');
const { ROLE_PERMISSIONS } = require('../config/rbac');

const COMMON_PASSWORD = 'Bjk@2026';

const DEPARTMENT_TEST_ACCOUNTS = [
  // 1. EXECUTIVE SUPER ADMINS
  {
    name: 'Ketan (Super Admin)',
    email: 'ketan@bjkhealthcare.com',
    employeeCode: 'BJK-ADM-KETAN',
    role: 'SUPER_ADMIN',
    department: 'Executive Management',
    designation: 'Managing Director & Super Admin'
  },
  {
    name: 'Haresh (Super Admin)',
    email: 'haresh@bjkhealthcare.com',
    employeeCode: 'BJK-ADM-HARESH',
    role: 'SUPER_ADMIN',
    department: 'Executive Management',
    designation: 'Executive Director & Super Admin'
  },
  {
    name: 'Ravi (Super Admin)',
    email: 'ravi@bjkhealthcare.com',
    employeeCode: 'BJK-ADM-RAVI',
    role: 'SUPER_ADMIN',
    department: 'Executive Management',
    designation: 'Chief Technology Officer & Super Admin'
  },
  {
    name: 'Meet (Super Admin)',
    email: 'meet@bjkhealthcare.com',
    employeeCode: 'BJK-ADM-MEET',
    role: 'SUPER_ADMIN',
    department: 'Executive Management',
    designation: 'Principal Architect & Super Admin'
  },
  {
    name: 'Test Admin (Executive)',
    email: 'admin.test@bjkhealthcare.com',
    employeeCode: 'TEST-ADM-01',
    role: 'SUPER_ADMIN',
    department: 'Executive Management',
    designation: 'System Administrator'
  },

  // 2. HUMAN RESOURCES (HR)
  {
    name: 'Test HR Manager',
    email: 'hr.test@bjkhealthcare.com',
    employeeCode: 'TEST-HR-01',
    role: 'HR_MANAGER',
    department: 'Human Resources',
    designation: 'HR & Personnel Manager'
  },

  // 3. PRODUCTION (PRD)
  {
    name: 'Test Production Manager',
    email: 'prd.manager@bjkhealthcare.com',
    employeeCode: 'TEST-PRD-MGR',
    role: 'PRODUCTION_MANAGER',
    department: 'Production',
    designation: 'Production Head'
  },
  {
    name: 'Test Production Officer',
    email: 'prd.test@bjkhealthcare.com',
    employeeCode: 'TEST-PRD-01',
    role: 'EMPLOYEE',
    department: 'Production',
    designation: 'Formulation Production Chemist'
  },

  // 4. QUALITY CONTROL (QC)
  {
    name: 'Test QC Manager',
    email: 'qc.manager@bjkhealthcare.com',
    employeeCode: 'TEST-QC-MGR',
    role: 'QC_MANAGER',
    department: 'Quality Control',
    designation: 'QC Department Head'
  },
  {
    name: 'Test QC Chemist',
    email: 'qc.test@bjkhealthcare.com',
    employeeCode: 'TEST-QC-01',
    role: 'EMPLOYEE',
    department: 'Quality Control',
    designation: 'QC Analytical Chemist'
  },

  // 5. QUALITY ASSURANCE (QA)
  {
    name: 'Test QA Manager',
    email: 'qa.manager@bjkhealthcare.com',
    employeeCode: 'TEST-QA-MGR',
    role: 'QA_MANAGER',
    department: 'Quality Assurance',
    designation: 'QA Department Head'
  },
  {
    name: 'Test QA Officer',
    email: 'qa.test@bjkhealthcare.com',
    employeeCode: 'TEST-QA-01',
    role: 'EMPLOYEE',
    department: 'Quality Assurance',
    designation: 'QA Documentation & Compliance Officer'
  },

  // 6. WAREHOUSE & INVENTORY
  {
    name: 'Test Warehouse Manager',
    email: 'wh.manager@bjkhealthcare.com',
    employeeCode: 'TEST-WH-MGR',
    role: 'WAREHOUSE_MANAGER',
    department: 'Warehouse',
    designation: 'Warehouse In-Charge'
  },
  {
    name: 'Test Warehouse Executive',
    email: 'warehouse.test@bjkhealthcare.com',
    employeeCode: 'TEST-WH-01',
    role: 'EMPLOYEE',
    department: 'Warehouse',
    designation: 'Inventory & Store Officer'
  },

  // 7. MAINTENANCE & ENGINEERING
  {
    name: 'Test Engineering Manager',
    email: 'engg.manager@bjkhealthcare.com',
    employeeCode: 'TEST-ENG-MGR',
    role: 'OPERATIONS_MANAGER',
    department: 'Engineering',
    designation: 'Plant Maintenance & Engineering Manager'
  },
  {
    name: 'Test Engineering Technician',
    email: 'engg.test@bjkhealthcare.com',
    employeeCode: 'TEST-ENG-01',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'HVAC & Utility Technician'
  },

  // 8. ACCOUNTS & FINANCE
  {
    name: 'Test Finance Manager',
    email: 'accounts.manager@bjkhealthcare.com',
    employeeCode: 'TEST-ACC-MGR',
    role: 'FINANCE_MANAGER',
    department: 'Accounts',
    designation: 'Finance & Accounts Head'
  },
  {
    name: 'Test Accounts Executive',
    email: 'accounts.test@bjkhealthcare.com',
    employeeCode: 'TEST-ACC-01',
    role: 'EMPLOYEE',
    department: 'Accounts',
    designation: 'Senior Accountant'
  },

  // 9. PURCHASE & PROCUREMENT
  {
    name: 'Test Purchase Officer',
    email: 'purchase.test@bjkhealthcare.com',
    employeeCode: 'TEST-PUR-01',
    role: 'OPERATIONS_MANAGER',
    department: 'Purchase',
    designation: 'Raw Material Purchase Executive'
  },

  // 10. REGULATORY AFFAIRS
  {
    name: 'Test Regulatory Officer',
    email: 'regulatory.test@bjkhealthcare.com',
    employeeCode: 'TEST-RA-01',
    role: 'REGULATORY_MANAGER',
    department: 'Regulatory Affairs',
    designation: 'Regulatory Affairs Manager'
  },

  // 11. SALES & BUSINESS DEVELOPMENT
  {
    name: 'Test Sales Manager',
    email: 'sales.test@bjkhealthcare.com',
    employeeCode: 'TEST-SALES-01',
    role: 'SALES_MANAGER',
    department: 'Sales & Marketing',
    designation: 'Business Development Manager'
  },

  // 12. MICROBIOLOGY QC
  {
    name: 'Test Microbiologist',
    email: 'micro.test@bjkhealthcare.com',
    employeeCode: 'TEST-MIC-01',
    role: 'EMPLOYEE',
    department: 'QC Micro',
    designation: 'Microbiologist Specialist'
  },

  // 13. ADMIN & FACILITIES
  {
    name: 'Test Admin Executive',
    email: 'facility.test@bjkhealthcare.com',
    employeeCode: 'TEST-FCL-01',
    role: 'ADMIN',
    department: 'Admin',
    designation: 'General Facilities & Admin Officer'
  }
];

const seedDepartmentTestAccounts = async () => {
  console.log('[Seed] Initializing Department-Wise Test Accounts (Password: Bjk@2026)...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(COMMON_PASSWORD, salt);

  let createdCount = 0;
  let updatedCount = 0;

  for (const acc of DEPARTMENT_TEST_ACCOUNTS) {
    const email = acc.email.toLowerCase().trim();
    const permissions = ROLE_PERMISSIONS[acc.role] || [];

    // 1. Upsert User model
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: acc.name,
        email,
        workEmail: email,
        password: passwordHash,
        passwordHash,
        role: acc.role,
        department: acc.department,
        designation: acc.designation,
        employeeId: acc.employeeCode,
        employeeCode: acc.employeeCode,
        permissions,
        status: 'ACTIVE',
        isActive: true,
        dataScope: acc.role === 'SUPER_ADMIN' ? 'SYSTEM' : 'DEPARTMENT',
        firstLogin: false,
        mustChangePassword: false
      });
      await user.save();
      createdCount++;
    } else {
      user.name = acc.name;
      user.password = passwordHash;
      user.passwordHash = passwordHash;
      user.role = acc.role;
      user.department = acc.department;
      user.designation = acc.designation;
      user.employeeId = acc.employeeCode;
      user.employeeCode = acc.employeeCode;
      user.permissions = permissions;
      user.status = 'ACTIVE';
      user.isActive = true;
      user.firstLogin = false;
      user.mustChangePassword = false;
      await user.save();
      updatedCount++;
    }

    // 2. Upsert Employee model (for Employee Portal login & Leave engine)
    let emp = await Employee.findOne({
      $or: [
        { employeeId: acc.employeeCode },
        { employeeCode: acc.employeeCode },
        { email: email },
        { workEmail: email }
      ]
    });

    const [firstName, ...restName] = acc.name.split(' ');
    const lastName = restName.join(' ') || 'Account';

    if (!emp) {
      emp = new Employee({
        employeeId: acc.employeeCode,
        employeeCode: acc.employeeCode,
        firstName,
        lastName,
        fullName: acc.name,
        email,
        workEmail: email,
        user: user._id,
        userRole: acc.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : acc.role.includes('MANAGER') ? 'MANAGER' : 'EMPLOYEE',
        systemRole: acc.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : acc.role.includes('MANAGER') ? 'MANAGER' : 'EMPLOYEE',
        department: acc.department,
        departmentName: acc.department,
        designation: acc.designation,
        designationTitle: acc.designation,
        joiningDate: new Date('2025-01-01'),
        status: 'Active',
        workLocation: 'BJK Healthcare HQ & Manufacturing Facility',
        branch: 'Ahmedabad Plant'
      });
      await emp.save();
    } else {
      emp.fullName = acc.name;
      emp.email = email;
      emp.workEmail = email;
      emp.user = user._id;
      emp.department = acc.department;
      emp.departmentName = acc.department;
      emp.designation = acc.designation;
      emp.designationTitle = acc.designation;
      emp.status = 'Active';
      await emp.save();
    }

    // 3. Ensure Leave Balances for 2026
    let balanceDoc = await LeaveBalance.findOne({
      $or: [
        { employeeId: acc.employeeCode },
        { employeeCode: acc.employeeCode }
      ],
      leaveYear: 2026
    });

    if (!balanceDoc) {
      await LeaveBalance.create({
        employeeId: acc.employeeCode,
        employeeCode: acc.employeeCode,
        employeeName: acc.name,
        department: acc.department,
        leaveYear: 2026,
        balances: [
          { leaveType: 'CASUAL_LEAVE', opening: 7, allocated: 7, used: 0, pending: 0, remaining: 7 },
          { leaveType: 'SICK_LEAVE', opening: 7, allocated: 7, used: 0, pending: 0, remaining: 7 },
          { leaveType: 'LEAVE_WITHOUT_PAY', opening: 0, allocated: 0, used: 0, pending: 0, remaining: 0 }
        ],
        totalClosingBalance: 14,
        status: 'ACTIVE'
      });
    }
  }

  console.log(`[Seed] Department-Wise Test Accounts Complete: ${createdCount} created, ${updatedCount} updated. All passwords set to 'Bjk@2026'.`);
  return { success: true, createdCount, updatedCount, totalAccounts: DEPARTMENT_TEST_ACCOUNTS.length };
};

module.exports = {
  DEPARTMENT_TEST_ACCOUNTS,
  COMMON_PASSWORD,
  seedDepartmentTestAccounts
};
