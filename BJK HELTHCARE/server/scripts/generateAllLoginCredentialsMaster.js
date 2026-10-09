const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { getSeedUsers } = require('../seed/authSeed');
const {
  readEmployeeMasterRecords,
  processEmployeeCredentials
} = require('../services/hrms/credentialExcelService');

// Styling Constants
const THEME = {
  navyDark: 'FF0F172A',     // Slate 900
  navyHeader: 'FF1E293B',   // Slate 800
  primaryBlue: 'FF1E40AF',  // Blue 800
  primaryBlueLight: 'FFDBEAFE', // Blue 100
  accentCyan: 'FF0284C7',   // Sky 600
  accentEmerald: 'FF059669',// Emerald 600
  emeraldLight: 'FFD1FAE5', // Emerald 100
  amberDark: 'FFB45309',    // Amber 700
  amberLight: 'FFFEF3C7',   // Amber 100
  roseDark: 'FFE11D48',     // Rose 600
  roseLight: 'FFFFE4E6',    // Rose 100
  purpleDark: 'FF7E22CE',   // Purple 700
  purpleLight: 'FFF3E8FF',  // Purple 100
  grayBg: 'FFF8FAFC',       // Slate 50
  grayBorder: 'FFE2E8F0',   // Slate 200
  white: 'FFFFFFFF',
  textDark: 'FF0F172A',
  textMuted: 'FF64748B'
};

function applyHeaderStyle(row, bgColor = THEME.primaryBlue) {
  row.height = 28;
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: bgColor }
    };
    cell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: THEME.white }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: THEME.navyDark } },
      bottom: { style: 'medium', color: { argb: THEME.navyDark } },
      left: { style: 'thin', color: { argb: 'FF94A3B8' } },
      right: { style: 'thin', color: { argb: 'FF94A3B8' } }
    };
  });
}

function applyDataRowStyle(row, isEven = false) {
  row.height = 22;
  const bg = isEven ? THEME.grayBg : THEME.white;
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: bg }
    };
    cell.font = {
      name: 'Calibri',
      size: 10,
      color: { argb: THEME.textDark }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: false
    };
    cell.border = {
      top: { style: 'thin', color: { argb: THEME.grayBorder } },
      bottom: { style: 'thin', color: { argb: THEME.grayBorder } },
      left: { style: 'thin', color: { argb: THEME.grayBorder } },
      right: { style: 'thin', color: { argb: THEME.grayBorder } }
    };
  });
}

function addTitleBanner(ws, title, subtitle, columnsCount = 10) {
  ws.mergeCells(1, 1, 1, columnsCount);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `  ${title.toUpperCase()}`;
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: THEME.navyHeader }
  };
  titleCell.font = {
    name: 'Calibri',
    size: 16,
    bold: true,
    color: { argb: THEME.white }
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(1).height = 36;

  ws.mergeCells(2, 1, 2, columnsCount);
  const subCell = ws.getCell(2, 1);
  subCell.value = `  ${subtitle} | Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST) | Environment: Enterprise 2026 Production & Dev`;
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: THEME.primaryBlue }
  };
  subCell.font = {
    name: 'Calibri',
    size: 9.5,
    italic: true,
    color: { argb: 'FFE2E8F0' }
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'left' };
  ws.getRow(2).height = 22;

  ws.addRow([]); // Blank row 3
  ws.getRow(3).height = 10;
}

function autoFitColumns(ws) {
  ws.columns.forEach((col) => {
    let maxLength = 12;
    col.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      if (rowNumber > 2) { // Skip banner rows
        const valStr = cell.value ? cell.value.toString() : '';
        if (valStr.length > maxLength) {
          maxLength = Math.min(valStr.length + 3, 50);
        }
      }
    });
    col.width = maxLength;
  });
}

async function buildMasterCredentialsExcel() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'BJK Healthcare Digital Brain Platform';
  wb.created = new Date();

  // -------------------------------------------------------------
  // 1. DATA SOURCE PREPARATION
  // -------------------------------------------------------------
  const seedUsers = await getSeedUsers();

  // Locate Master CSV
  let csvPath = 'C:/Users/Meet Vekariya/OneDrive/Desktop/Employee Master Detail(Sheet 1).csv';
  if (!fs.existsSync(csvPath)) {
    csvPath = path.resolve(__dirname, '../uploads/Employee Master Detail(Sheet 1).csv');
  }
  if (!fs.existsSync(csvPath)) {
    csvPath = path.resolve(__dirname, '../seed/Employee Master Detail(Sheet 1).csv');
  }

  const masterRecords = fs.existsSync(csvPath) ? readEmployeeMasterRecords(csvPath) : [];
  const processedData = masterRecords.length > 0 ? processEmployeeCredentials(masterRecords) : {
    credentialList: [],
    deptStats: {},
    summary: { totalEmployees: 0, activeEmployees: 0, inactiveEmployees: 0, loginsGenerated: 0 },
    exceptionRecords: []
  };

  // -------------------------------------------------------------
  // SHEET 1: SYSTEM & MANAGEMENT CREDENTIALS
  // -------------------------------------------------------------
  const wsSystem = wb.addWorksheet('01_System_&_Management_Logins', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });

  addTitleBanner(
    wsSystem,
    'BJK HEALTHCARE — SYSTEM, EXECUTIVE & DEPARTMENT HEAD CREDENTIALS',
    'Official enterprise access credentials for System Administrators, Directors, HR Leaders, and Department Managers',
    11
  );

  const systemHeaders = [
    'Sr No',
    'Designation / Role Title',
    'Official Name',
    'Email (Primary Login ID)',
    'Employee Code / ID',
    'System Role Code',
    'Department',
    'Data Scope',
    'Password',
    'Default Landing Route',
    'Core Functional Permissions'
  ];

  const sysHeaderRow = wsSystem.addRow(systemHeaders);
  applyHeaderStyle(sysHeaderRow, THEME.navyHeader);

  // Full catalog of System and Role personas
  const systemPersonas = [
    {
      sr: 1,
      roleTitle: 'Super Administrator / Platform Owner',
      name: 'Super Admin',
      email: 'superadmin@bjkhealthcare.com',
      empCode: 'BJK-ADM-000',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      scope: 'SYSTEM (All Plants & Modules)',
      password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'Admin@BJK2026!',
      route: '/admin/dashboard',
      perms: 'Complete platform configuration, full HRMS, database migrations, audit trails, user credential locks'
    },
    {
      sr: 2,
      roleTitle: 'Managing Director & Chief Executive',
      name: 'Dr. Vikram Mehta',
      email: 'admin@bjkhealthcare.com',
      empCode: 'BJK-ADM-001',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      scope: 'SYSTEM (Enterprise-wide)',
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@BJK2026!',
      route: '/admin/dashboard',
      perms: 'Executive executive dashboards, policy approvals, high-level financials, regulatory releases'
    },
    {
      sr: 3,
      roleTitle: 'Executive Director',
      name: 'Rajesh Sharma',
      email: 'director@bjkhealthcare.com',
      empCode: 'BJK-DIR-001',
      role: 'DIRECTOR',
      department: 'Executive Management',
      scope: 'SYSTEM (Enterprise-wide)',
      password: 'Password123!',
      route: '/admin/executive',
      perms: 'Enterprise KPI analytics, CAPA signoffs, multi-plant operations review, salary approvals'
    },
    {
      sr: 4,
      roleTitle: 'Lead HR Manager (Primary Operator)',
      name: 'Krutika Parmar',
      email: 'bh1046@bjkhealthcare.com',
      empCode: 'BH1046',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      scope: 'GLOBAL (All Employees & Plants)',
      password: process.env.SEED_HR_MANAGER_PASSWORD || 'Bjk@2810',
      route: '/hr/dashboard',
      perms: 'Full HRMS lifecycle: 9-Month Attendance import, Leave management, Employee Master, Credential provisioning, Offboarding'
    },
    {
      sr: 5,
      roleTitle: 'HR Administration Desk',
      name: 'HR Administration',
      email: 'hr@bjkhealthcare.com',
      empCode: 'BJK-HR-000',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      scope: 'GLOBAL (Company-wide)',
      password: process.env.SEED_HR_MANAGER_PASSWORD || 'Bjk@2810',
      route: '/hr/dashboard',
      perms: 'Onboarding approvals, document verification, biometric attendance adjustments, grievance resolution'
    },
    {
      sr: 6,
      roleTitle: 'HR Operations Manager',
      name: 'Nehal Vora',
      email: 'hr.manager@bjkhealthcare.com',
      empCode: 'BJK-HR-001',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      scope: 'COMPANY',
      password: 'Password123!',
      route: '/hr/dashboard',
      perms: 'HR operations, leave approvals, employee profile modifications, attendance reconciliation'
    },
    {
      sr: 7,
      roleTitle: 'Head of Plant Operations',
      name: 'Kunal Verma',
      email: 'operations.manager@bjkhealthcare.com',
      empCode: 'BJK-OPS-001',
      role: 'OPERATIONS_MANAGER',
      department: 'Operations & Production',
      scope: 'COMPANY',
      password: 'Password123!',
      route: '/operations/dashboard',
      perms: 'Plant shift management, utility monitoring, equipment uptime, batch manufacturing progress'
    },
    {
      sr: 8,
      roleTitle: 'Head of Manufacturing & Production',
      name: 'Amit Trivedi',
      email: 'production.manager@bjkhealthcare.com',
      empCode: 'BJK-PRD-001',
      role: 'PRODUCTION_MANAGER',
      department: 'Manufacturing Operations',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/production/dashboard',
      perms: 'Batch Production Records (BPR), formulation batch allocation, line clearance, operator shift rosters'
    },
    {
      sr: 9,
      roleTitle: 'Head of Quality Control (QC)',
      name: 'Suresh Patel',
      email: 'qc.manager@bjkhealthcare.com',
      empCode: 'BJK-QC-001',
      role: 'QC_MANAGER',
      department: 'Quality Control',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/qc/dashboard',
      perms: 'Analytical testing, Certificate of Analysis (CoA) release, HPLC/Dissolution approvals, OOS/OOT logging'
    },
    {
      sr: 10,
      roleTitle: 'Head of Quality Assurance (QA)',
      name: 'Dr. Anita Desai',
      email: 'qa.manager@bjkhealthcare.com',
      empCode: 'BJK-QA-001',
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/qa/dashboard',
      perms: 'Deviations, Change Controls, Market Complaints, CAPA sign-off, GMP compliance audits'
    },
    {
      sr: 11,
      roleTitle: 'Head of Regulatory Affairs',
      name: 'Pooja Iyer',
      email: 'regulatory.manager@bjkhealthcare.com',
      empCode: 'BJK-REG-001',
      role: 'REGULATORY_MANAGER',
      department: 'Regulatory Affairs',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/regulatory/dashboard',
      perms: 'Dossier submissions (eCTD/ACTD), product licenses (FDCA/WHO-GMP/USFDA), regulatory renewals'
    },
    {
      sr: 12,
      roleTitle: 'Head of Warehouse & Logistics',
      name: 'Mahesh Solanki',
      email: 'inventory.manager@bjkhealthcare.com',
      empCode: 'BJK-WH-001',
      role: 'WAREHOUSE_MANAGER',
      department: 'Warehouse & Logistics',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/warehouse/dashboard',
      perms: 'Raw Material (RM)/Packaging Material (PM) quarantine, dispensing, finished goods dispatch, FIFO control'
    },
    {
      sr: 13,
      roleTitle: 'Head of Commercial & Sales (CRM)',
      name: 'Rohan Gupta',
      email: 'crm.manager@bjkhealthcare.com',
      empCode: 'BJK-CRM-001',
      role: 'CRM_MANAGER',
      department: 'Commercial & Sales',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/crm/dashboard',
      perms: 'Customer leads, client PO tracking, tender documentation, distributor accounts'
    },
    {
      sr: 14,
      roleTitle: 'Head of International Business (Export)',
      name: 'Sameer Joshi',
      email: 'export.manager@bjkhealthcare.com',
      empCode: 'BJK-EXP-001',
      role: 'EXPORT_MANAGER',
      department: 'International Business',
      scope: 'DEPARTMENT',
      password: 'Password123!',
      route: '/export/dashboard',
      perms: 'Letter of Credit (LC), export shipping bills, COO documentation, container tracking'
    },
    {
      sr: 15,
      roleTitle: 'Head of Finance & Accounts',
      name: 'Manish Parekh',
      email: 'finance.manager@bjkhealthcare.com',
      empCode: 'BJK-FIN-001',
      role: 'FINANCE_MANAGER',
      department: 'Finance & Accounts',
      scope: 'COMPANY',
      password: 'Password123!',
      route: '/finance/dashboard',
      perms: 'Payroll cost verification, vendor invoices, tax reconciliations, statutory compliance'
    },
    {
      sr: 16,
      roleTitle: 'Document Controller & QA Archival',
      name: 'Smita Kulkarni',
      email: 'documents.controller@bjkhealthcare.com',
      empCode: 'BJK-DOC-001',
      role: 'DOCUMENT_CONTROLLER',
      department: 'Document Control Cell',
      scope: 'COMPANY',
      password: 'Password123!',
      route: '/documents/dashboard',
      perms: 'SOP distribution, revision master control, master formula records, controlled printing stamps'
    },
    {
      sr: 17,
      roleTitle: 'Internal Quality & Compliance Auditor',
      name: 'CA Alok Singhania',
      email: 'auditor@bjkhealthcare.com',
      empCode: 'BJK-AUD-001',
      role: 'AUDITOR',
      department: 'Internal Quality Audit',
      scope: 'COMPANY',
      password: 'Password123!',
      route: '/audit/dashboard',
      perms: 'Read-only immutable access to system logs, audit trails, deviation reports, attendance ledgers'
    },
    {
      sr: 18,
      roleTitle: 'Canteen Facility Administrator',
      name: 'BJK Canteen Department',
      email: 'canteen@bjkhealthcare.com',
      empCode: 'BJK-CNT-001',
      role: 'CANTEEN_ADMIN',
      department: 'Canteen Department',
      scope: 'GLOBAL',
      password: process.env.SEED_CANTEEN_PASSWORD || 'BJK@Canteen#2026',
      route: '/canteen/dashboard',
      perms: 'Meal kiosk attendance scanning, daily meal counting, dietary reporting, employee food subsidy ledgers'
    },
    {
      sr: 19,
      roleTitle: 'Executive Viewer (Board / Investor)',
      name: 'Arun Bhatia',
      email: 'executive.viewer@bjkhealthcare.com',
      empCode: 'BJK-EXE-001',
      role: 'EXECUTIVE_VIEWER',
      department: 'Executive Management',
      scope: 'COMPANY (Read-Only)',
      password: 'Password123!',
      route: '/executive/overview',
      perms: 'Read-only access to corporate metrics, output performance, attendance percentages'
    },
    {
      sr: 20,
      roleTitle: 'Regulatory Inspector / Auditor Viewer',
      name: 'Sunil Shah',
      email: 'regulatory.viewer@bjkhealthcare.com',
      empCode: 'BJK-REG-003',
      role: 'REGULATORY_VIEWER',
      department: 'Regulatory Affairs',
      scope: 'SELF / AUDIT',
      password: 'Password123!',
      route: '/regulatory/records',
      perms: 'Dedicated inspection portal for external health authorities (FDCA / CDSCO / WHO audits)'
    },
    {
      sr: 21,
      roleTitle: 'Senior Chemist (Employee Portal Reference)',
      name: 'Rajesh Patel',
      email: 'employee@bjkhealthcare.com',
      empCode: 'BJK-EMP-003',
      role: 'EMPLOYEE',
      department: 'Production Operations',
      scope: 'SELF (Individual Profile)',
      password: 'Password123!',
      route: '/employee/dashboard',
      perms: 'Employee self-service: Face attendance punch, leave requests, payslip downloads, daily task checklists'
    }
  ];

  systemPersonas.forEach((p, idx) => {
    const row = wsSystem.addRow([
      p.sr,
      p.roleTitle,
      p.name,
      p.email,
      p.empCode,
      p.role,
      p.department,
      p.scope,
      p.password,
      p.route,
      p.perms
    ]);
    applyDataRowStyle(row, idx % 2 === 1);

    // Style Password column cell with bold monospace font
    const pwdCell = row.getCell(9);
    pwdCell.font = { name: 'Consolas', size: 10, bold: true, color: { argb: THEME.primaryBlue } };
    pwdCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Center alignment for specific columns
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  autoFitColumns(wsSystem);

  // -------------------------------------------------------------
  // SHEET 2: ALL MASTER EMPLOYEE CREDENTIALS
  // -------------------------------------------------------------
  const wsEmployees = wb.addWorksheet('02_Employee_Master_Credentials', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });

  addTitleBanner(
    wsEmployees,
    'BJK HEALTHCARE — COMPLETE EMPLOYEE LOGIN CREDENTIALS DIRECTORY',
    `Active Employee Roster (${processedData.summary.activeEmployees} Active Accounts) with Individual Temporary Passwords`,
    12
  );

  const empHeaders = [
    'Sr No',
    'Employee Code (Login ID)',
    'Full Name',
    'Department',
    'Sub-Department',
    'Designation Title',
    'Official Work Email',
    'Temporary Password (12-Char)',
    'Account Status',
    'First Login Password Change',
    'Portal Login Access URL',
    'HR Compliance Notes'
  ];

  const empHeaderRow = wsEmployees.addRow(empHeaders);
  applyHeaderStyle(empHeaderRow, THEME.primaryBlue);

  processedData.credentialList.forEach((emp, idx) => {
    const isInactive = emp.accountStatus === 'INACTIVE';
    const isPending = emp.accountStatus === 'PENDING_HR_DETAILS';

    const workEmail = emp.rawRecord?.employeeCode 
      ? `${emp.rawRecord.employeeCode.toLowerCase()}@bjkhealthcare.com`
      : `${emp.loginId.toLowerCase()}@bjkhealthcare.com`;

    const row = wsEmployees.addRow([
      emp.srNo,
      emp.employeeCode,
      emp.fullName,
      emp.department,
      emp.subDepartment,
      emp.designation,
      workEmail,
      emp.tempPassword,
      emp.accountStatus,
      emp.mustChangePassword,
      'http://localhost:5000/login',
      emp.notes
    ]);

    applyDataRowStyle(row, idx % 2 === 1);

    // Password Cell Styling
    const pwdCell = row.getCell(8);
    pwdCell.font = {
      name: 'Consolas',
      size: 10,
      bold: true,
      color: { argb: isInactive ? THEME.textMuted : THEME.accentEmerald }
    };
    pwdCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Status Badge Styling
    const statusCell = row.getCell(9);
    statusCell.alignment = { horizontal: 'center', vertical: 'middle' };
    if (isInactive) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.roseLight } };
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: THEME.roseDark } };
    } else if (isPending) {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.amberLight } };
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: THEME.amberDark } };
    } else {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.emeraldLight } };
      statusCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: THEME.accentEmerald } };
    }

    // Alignments
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };
  });

  autoFitColumns(wsEmployees);

  // -------------------------------------------------------------
  // SHEET 3: HIERARCHY & FLOW-WISE LOGIN ARCHITECTURE
  // -------------------------------------------------------------
  const wsFlow = wb.addWorksheet('03_Login_Flow_&_Access_Matrix', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });

  addTitleBanner(
    wsFlow,
    'BJK HEALTHCARE — ROLE-WISE LOGIN FLOW & SYSTEM ACCESS WORKFLOW',
    'Step-by-step authentication flows, credential guidelines, and permissions breakdown',
    6
  );

  const flowHeaders = [
    'Flow Tier / Hierarchy Level',
    'Eligible Roles & Personas',
    'Supported Login Identifiers',
    'Authentication & Routing Flow',
    'Landing Page & Primary Features',
    'Security & Password Policy'
  ];

  const flowHeaderRow = wsFlow.addRow(flowHeaders);
  applyHeaderStyle(flowHeaderRow, THEME.purpleDark);

  const flowSteps = [
    {
      tier: '1. EXECUTIVE & ADMIN FLOW',
      roles: 'Super Admin, Managing Director, Executive Director',
      identifiers: 'Official Email (e.g. superadmin@bjkhealthcare.com, admin@bjkhealthcare.com, director@bjkhealthcare.com)',
      authFlow: '1. Navigate to http://localhost:5000/login\n2. Enter Executive Email and Secure Admin Password\n3. Gateway authenticates JWT with SYSTEM scope\n4. Automatically redirects to Executive Super Admin Control Hub (/admin/dashboard)',
      landing: '/admin/dashboard & /admin/executive\n- Enterprise HRMS full visibility\n- Real-time Plant Analytics & KPI meters\n- Global system logs, audit trail, security locks\n- Salary structure & policy release',
      security: 'Enterprise 12+ Character High-Entropy Password with 24h JWT session expiry and mandatory audit logging.'
    },
    {
      tier: '2. HR & PEOPLE OPERATIONS FLOW',
      roles: 'HR Manager (Krutika Parmar), HR Administration Desk, HR Officers',
      identifiers: 'Employee Code (BH1046) or HR Email (bh1046@bjkhealthcare.com, hr@bjkhealthcare.com, hr.manager@bjkhealthcare.com)',
      authFlow: '1. Open http://localhost:5000/login\n2. Enter Employee Code (BH1046) or Email and Password (Bjk@2810)\n3. System verifies GLOBAL HR scope permissions\n4. Redirects to Enterprise HRMS Operations Hub (/hr/dashboard)',
      landing: '/hr/dashboard\n- 9-Month Biometric Attendance Import & Summary\n- 2026 Leave Balances (PL/CL/SL/BL) & approvals\n- Employee Master profile database\n- Bulk Credential Generation & Excel export\n- Employee Onboarding & Offboarding workflow',
      security: 'Global scope access, credential reset authority, session termination privileges.'
    },
    {
      tier: '3. DEPARTMENT HEADS & MANAGERS FLOW',
      roles: 'QA Manager, QC Manager, Production Manager, Operations Manager, Warehouse Manager, Finance Manager, CRM Manager, Export Manager, Regulatory Manager, Document Controller',
      identifiers: 'Official Manager Email (e.g. qa.manager@bjkhealthcare.com, qc.manager@bjkhealthcare.com, production.manager@bjkhealthcare.com)',
      authFlow: '1. Navigate to http://localhost:5000/login\n2. Enter Manager Email and Password (Password123!)\n3. System resolves DEPARTMENT scope\n4. Routes to dedicated Department Management Dashboard',
      landing: 'Department Dashboards:\n- QA: /qa/dashboard (Deviations, CAPA, Changes)\n- QC: /qc/dashboard (CoA, HPLC, OOS Tests)\n- Production: /production/dashboard (BPR, Shifts)\n- Warehouse: /warehouse/dashboard (RM/PM Stocks)\n- Finance: /finance/dashboard (Payroll Costs)\n- Regulatory: /regulatory/dashboard (Dossiers)',
      security: 'Department isolated data scope. Cannot view salaries or confidential HR files outside their jurisdiction.'
    },
    {
      tier: '4. GENERAL EMPLOYEE SELF-SERVICE FLOW',
      roles: 'All Plant Operators, Quality Chemists, Team Leads, Maintenance Staff, Office Personnel',
      identifiers: 'Employee Code (e.g. BH1046, EMP001, BJK-EMP-003, BH1022) or Work Email (e.g. bh1022@bjkhealthcare.com)',
      authFlow: '1. Open http://localhost:5000/login\n2. Enter Employee Code (e.g., BH1022) and Temporary Password from Excel\n3. First-time login prompts mandatory PIN/New Password setup\n4. Directs to Employee Personal Dashboard (/employee/dashboard)',
      landing: '/employee/dashboard\n- Facial Recognition / Geolocation Attendance Punching\n- Personal Leave Balance & Instant Leave Application\n- Monthly Payslip Downloads & Tax Slips\n- Daily Shift Schedule & Assigned SOP Checklists\n- Personal Profile details & Bank Account verify',
      security: 'SELF scope restricted. Employees can only access their own attendance, salary, and task records.'
    },
    {
      tier: '5. CANTEEN DEPARTMENT KIOSK FLOW',
      roles: 'Canteen Facility Administrator & Meal Scanning Operators',
      identifiers: 'Canteen Email (canteen@bjkhealthcare.com) or Employee Code (BJK-CNT-001)',
      authFlow: '1. Open http://localhost:5000/canteen/login or /login\n2. Enter canteen@bjkhealthcare.com and Canteen Password (BJK@Canteen#2026)\n3. System loads live Canteen POS & Kiosk Terminal (/canteen/dashboard)',
      landing: '/canteen/dashboard\n- Biometric & Employee Code barcode meal scanning\n- Real-time Breakfast / Lunch / Dinner meal counts\n- Daily headcount summary for kitchen catering\n- Monthly canteen deduction report for HR payroll',
      security: 'Dedicated POS workstation session with fast token switching.'
    },
    {
      tier: '6. AUDITOR & REGULATORY INSPECTION FLOW',
      roles: 'Internal Quality Auditor, Regulatory Authority Inspector, Executive Viewer',
      identifiers: 'auditor@bjkhealthcare.com, regulatory.viewer@bjkhealthcare.com, executive.viewer@bjkhealthcare.com',
      authFlow: '1. Navigate to http://localhost:5000/login\n2. Enter Auditor Email and Password (Password123!)\n3. System verifies READ-ONLY audit compliance scope\n4. Routes to Regulatory Audit & Verification Center (/audit/dashboard)',
      landing: '/audit/dashboard & /regulatory/records\n- 100% Immutable 21 CFR Part 11 electronic audit trail\n- Batch history, quality records, user action ledger\n- Exportable compliance packages for WHO-GMP / USFDA inspections',
      security: 'Strictly Read-Only access. Prohibits any record deletion, alteration, or permission elevation.'
    }
  ];

  flowSteps.forEach((f, idx) => {
    const row = wsFlow.addRow([
      f.tier,
      f.roles,
      f.identifiers,
      f.authFlow,
      f.landing,
      f.security
    ]);
    applyDataRowStyle(row, idx % 2 === 1);
    row.height = 80; // Larger height for multi-line explanations

    row.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: THEME.primaryBlue } };
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row.getCell(4).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row.getCell(5).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
  });

  autoFitColumns(wsFlow);
  wsFlow.getColumn(4).width = 45;
  wsFlow.getColumn(5).width = 45;
  wsFlow.getColumn(6).width = 35;

  // -------------------------------------------------------------
  // SHEET 4: INACTIVE EMPLOYEES & HR EXCEPTION AUDIT
  // -------------------------------------------------------------
  const wsExceptions = wb.addWorksheet('04_Inactive_&_Exceptions_Audit', {
    views: [{ state: 'frozen', ySplit: 4 }]
  });

  addTitleBanner(
    wsExceptions,
    'BJK HEALTHCARE — INACTIVE EMPLOYEES & HR AUDIT EXCEPTIONS',
    `Audit of ${processedData.exceptionRecords.length} records requiring HR action (Employees with Date of Leaving or Missing Codes)`,
    7
  );

  const excHeaders = [
    'Sr No',
    'Employee Code',
    'Full Name',
    'Department',
    'Designation',
    'Audit Exception / Issue Type',
    'Details & Mandatory HR Resolution Action'
  ];

  const excHeaderRow = wsExceptions.addRow(excHeaders);
  applyHeaderStyle(excHeaderRow, THEME.roseDark);

  processedData.exceptionRecords.forEach((exc, idx) => {
    const row = wsExceptions.addRow([
      exc.srNo,
      exc.employeeCode,
      exc.fullName,
      exc.department,
      exc.designation,
      exc.issue,
      `${exc.details} -> ${exc.action}`
    ]);
    applyDataRowStyle(row, idx % 2 === 1);

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: THEME.roseDark } };
  });

  autoFitColumns(wsExceptions);
  wsExceptions.getColumn(7).width = 55;

  // -------------------------------------------------------------
  // SAVE WORKBOOK TO TARGET PATHS
  // -------------------------------------------------------------
  const targetPaths = [
    'C:/Users/Meet Vekariya/OneDrive/Desktop/BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx',
    'C:/Users/Meet Vekariya/OneDrive/Desktop/BJK_Employee_Login_Credentials.xlsx',
    path.resolve(__dirname, '../../../BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx'),
    path.resolve(__dirname, '../uploads/BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx')
  ];

  for (const p of targetPaths) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      await wb.xlsx.writeFile(p);
      console.log(`[Excel Generator] Successfully generated & saved master spreadsheet: ${p}`);
    } catch (err) {
      console.warn(`[Excel Generator] Warning for ${p}:`, err.message);
    }
  }

  return {
    systemPersonasCount: systemPersonas.length,
    activeEmployeesCount: processedData.summary.activeEmployees,
    inactiveEmployeesCount: processedData.summary.inactiveEmployees,
    totalRecords: systemPersonas.length + processedData.credentialList.length
  };
}

if (require.main === module) {
  buildMasterCredentialsExcel()
    .then((stats) => {
      console.log('\n===============================================================');
      console.log(' MASTER CREDENTIALS EXCEL WORKBOOK GENERATED SUCCESSFULLY');
      console.log('===============================================================');
      console.log(` System & Management Accounts: ${stats.systemPersonasCount}`);
      console.log(` Active Employee Credentials:   ${stats.activeEmployeesCount}`);
      console.log(` Inactive / DOL Audit Records:  ${stats.inactiveEmployeesCount}`);
      console.log(` Total Entries Processed:       ${stats.totalRecords}`);
      console.log('===============================================================\n');
    })
    .catch((err) => {
      console.error('Error generating master credentials Excel:', err);
      process.exitCode = 1;
    });
}

module.exports = { buildMasterCredentialsExcel };
