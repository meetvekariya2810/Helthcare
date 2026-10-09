const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateTestAccountsExcel() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BJK Healthcare Digital Brain';
  workbook.lastModifiedBy = 'BJK Enterprise System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // =========================================================================
  // SHEET 1: DEPARTMENT-WISE TEST ACCOUNTS (Password: Bjk@2026)
  // =========================================================================
  const sheet1 = workbook.addWorksheet('Department Test Accounts', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  sheet1.mergeCells('A1:I2');
  const titleCell = sheet1.getCell('A1');
  titleCell.value = 'BJK HEALTHCARE PVT. LTD. — DEPARTMENT TEST ACCOUNTS DIRECTORY (YEAR 2026)';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' } // Teal 700
  };

  // Subtitle Banner
  sheet1.mergeCells('A3:I3');
  const subCell = sheet1.getCell('A3');
  subCell.value = 'Universal Test Password for all accounts below: Bjk@2026 | Dual Login Support: Email or Employee Code';
  subCell.font = { name: 'Calibri', size: 10, italic: true, bold: true, color: { argb: 'FF0F172A' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF0FDFA' } // Teal 50
  };

  // Headers
  const headers = [
    'Sr. No.',
    'Department',
    'Account Name / Designation',
    'System Role',
    'Portal Access',
    'Login Email / Identifier',
    'Employee Code',
    'Password',
    'Access Scope & Authority'
  ];

  sheet1.getRow(5).values = headers;
  const headerRow = sheet1.getRow(5);
  headerRow.height = 28;
  headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate 800
  };

  const testAccountsData = [
    // Executive Management
    [1, 'Executive Management', 'Ketan (Super Admin)', 'SUPER_ADMIN', 'Executive / Master Admin', 'ketan@bjkhealthcare.com', 'BJK-ADM-KETAN', 'Bjk@2026', 'Full Global Enterprise Access'],
    [2, 'Executive Management', 'Haresh (Super Admin)', 'SUPER_ADMIN', 'Executive / Master Admin', 'haresh@bjkhealthcare.com', 'BJK-ADM-HARESH', 'Bjk@2026', 'Full Global Enterprise Access'],
    [3, 'Executive Management', 'Ravi (Super Admin)', 'SUPER_ADMIN', 'Executive / Master Admin', 'ravi@bjkhealthcare.com', 'BJK-ADM-RAVI', 'Bjk@2026', 'Full Global Enterprise Access'],
    [4, 'Executive Management', 'Meet (Super Admin)', 'SUPER_ADMIN', 'Executive / Master Admin', 'meet@bjkhealthcare.com', 'BJK-ADM-MEET', 'Bjk@2026', 'Full Global Enterprise Access'],
    [5, 'Executive Management', 'Test Admin (Executive)', 'SUPER_ADMIN', 'Executive / Master Admin', 'admin.test@bjkhealthcare.com', 'TEST-ADM-01', 'Bjk@2026', 'Full Global Enterprise Access'],
    
    // HR
    [6, 'Human Resources (HR)', 'Test HR Manager', 'HR_MANAGER', 'HR Master / Command Center', 'hr.test@bjkhealthcare.com', 'TEST-HR-01', 'Bjk@2026', 'Universal Leave Bypass & All Dept Approvals'],
    
    // Production
    [7, 'Production (PRD)', 'Test Production Manager', 'PRODUCTION_MANAGER', 'Manager / Portal', 'prd.manager@bjkhealthcare.com', 'TEST-PRD-MGR', 'Bjk@2026', 'Production Queue & Team Leave Approvals'],
    [8, 'Production (PRD)', 'Test Production Officer', 'EMPLOYEE', 'Employee Self Service', 'prd.test@bjkhealthcare.com', 'TEST-PRD-01', 'Bjk@2026', 'Production Shift, Attendance & Leave Apply'],
    
    // Quality Control
    [9, 'Quality Control (QC)', 'Test QC Manager', 'QC_MANAGER', 'Manager / Portal', 'qc.manager@bjkhealthcare.com', 'TEST-QC-MGR', 'Bjk@2026', 'QC Analytical Queue & Leave Approvals'],
    [10, 'Quality Control (QC)', 'Test QC Chemist', 'EMPLOYEE', 'Employee Self Service', 'qc.test@bjkhealthcare.com', 'TEST-QC-01', 'Bjk@2026', 'QC Testing Lab, Attendance & Leave Apply'],
    
    // Quality Assurance
    [11, 'Quality Assurance (QA)', 'Test QA Manager', 'QA_MANAGER', 'Manager / Portal', 'qa.manager@bjkhealthcare.com', 'TEST-QA-MGR', 'Bjk@2026', 'QA Compliance, Audits & Leave Approvals'],
    [12, 'Quality Assurance (QA)', 'Test QA Officer', 'EMPLOYEE', 'Employee Self Service', 'qa.test@bjkhealthcare.com', 'TEST-QA-01', 'Bjk@2026', 'QA Docs, Batch Release & Leave Apply'],
    
    // Warehouse
    [13, 'Warehouse & Inventory', 'Test Warehouse Manager', 'WAREHOUSE_MANAGER', 'Manager / Portal', 'wh.manager@bjkhealthcare.com', 'TEST-WH-MGR', 'Bjk@2026', 'Inventory Stock, Dispatch & Leave Approvals'],
    [14, 'Warehouse & Inventory', 'Test Warehouse Executive', 'EMPLOYEE', 'Employee Self Service', 'warehouse.test@bjkhealthcare.com', 'TEST-WH-01', 'Bjk@2026', 'Store Operations, Attendance & Leave Apply'],
    
    // Engineering
    [15, 'Engineering & Maintenance', 'Test Engineering Manager', 'OPERATIONS_MANAGER', 'Manager / Portal', 'engg.manager@bjkhealthcare.com', 'TEST-ENG-MGR', 'Bjk@2026', 'HVAC/Plant Maintenance & Leave Approvals'],
    [16, 'Engineering & Maintenance', 'Test Engineering Technician', 'EMPLOYEE', 'Employee Self Service', 'engg.test@bjkhealthcare.com', 'TEST-ENG-01', 'Bjk@2026', 'Plant Engineering, Attendance & Leave Apply'],
    
    // Accounts
    [17, 'Accounts & Finance', 'Test Finance Manager', 'FINANCE_MANAGER', 'Manager / Portal', 'accounts.manager@bjkhealthcare.com', 'TEST-ACC-MGR', 'Bjk@2026', 'Payroll, Invoices & Leave Approvals'],
    [18, 'Accounts & Finance', 'Test Accounts Executive', 'EMPLOYEE', 'Employee Self Service', 'accounts.test@bjkhealthcare.com', 'TEST-ACC-01', 'Bjk@2026', 'Accounts Vouchers, Attendance & Leave Apply'],
    
    // Purchase
    [19, 'Purchase & Procurement', 'Test Purchase Officer', 'OPERATIONS_MANAGER', 'Manager / Portal', 'purchase.test@bjkhealthcare.com', 'TEST-PUR-01', 'Bjk@2026', 'Raw Material Procurement & Leave Approvals'],
    
    // Regulatory Affairs
    [20, 'Regulatory Affairs (RA)', 'Test Regulatory Officer', 'REGULATORY_MANAGER', 'Manager / Portal', 'regulatory.test@bjkhealthcare.com', 'TEST-RA-01', 'Bjk@2026', 'FDA/GMP Dossiers & Regulatory Submissions'],
    
    // Sales & BD
    [21, 'Sales & Marketing', 'Test Sales Manager', 'SALES_MANAGER', 'Manager / Portal', 'sales.test@bjkhealthcare.com', 'TEST-SALES-01', 'Bjk@2026', 'Commercial Leads, CRM & Sales Governance'],
    
    // QC Micro
    [22, 'QC Micro', 'Test Microbiologist', 'EMPLOYEE', 'Employee Self Service', 'micro.test@bjkhealthcare.com', 'TEST-MIC-01', 'Bjk@2026', 'Microbiology Testing & Leave Apply'],
    
    // Admin & Facilities
    [23, 'General Admin & Facilities', 'Test Admin Executive', 'ADMIN', 'Admin / Facilities', 'facility.test@bjkhealthcare.com', 'TEST-FCL-01', 'Bjk@2026', 'Canteen, Security & Facilities Management']
  ];

  testAccountsData.forEach((row, idx) => {
    const r = sheet1.addRow(row);
    r.height = 22;
    r.font = { name: 'Calibri', size: 10 };
    r.alignment = { vertical: 'middle' };

    // Zebra striping
    if (idx % 2 === 0) {
      r.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' } // Slate 50
      };
    }

    // Alignments
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
    r.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };

    // Bold Password & Employee Code
    r.getCell(7).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F766E' } };
    r.getCell(8).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFBE123C' } }; // Rose 700

    // Borders
    for (let c = 1; c <= 9; c++) {
      r.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }
  });

  // Auto-fit column widths
  sheet1.columns = [
    { width: 8 },  // Sr. No.
    { width: 26 }, // Department
    { width: 28 }, // Name
    { width: 22 }, // Role
    { width: 24 }, // Portal Access
    { width: 32 }, // Email
    { width: 18 }, // Employee Code
    { width: 14 }, // Password
    { width: 42 }  // Scope
  ];

  // =========================================================================
  // SHEET 2: QUICK LOGIN URLS & GUIDE
  // =========================================================================
  const sheet2 = workbook.addWorksheet('Portal URLs & Guide', {
    views: [{ showGridLines: true }]
  });

  sheet2.mergeCells('A1:E2');
  const guideTitle = sheet2.getCell('A1');
  guideTitle.value = 'BJK HEALTHCARE — SYSTEM ACCESS & PORTAL NAVIGATION GUIDE';
  guideTitle.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  guideTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  guideTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }
  };

  sheet2.getRow(4).values = ['Portal Name', 'Target User Roles', 'Direct URL', 'Sample Test Account', 'Default Password'];
  const guideHeaderRow = sheet2.getRow(4);
  guideHeaderRow.height = 26;
  guideHeaderRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  guideHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };
  guideHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' }
  };

  const portalGuideData = [
    ['Executive / Admin Portal', 'Super Admin, Directors, IT Admin', 'http://localhost:5173/login', 'admin.test@bjkhealthcare.com (or ketan@bjkhealthcare.com)', 'Bjk@2026'],
    ['HR Master Command Center', 'HR Managers, HR Executives', 'http://localhost:5173/leave-management', 'hr.test@bjkhealthcare.com', 'Bjk@2026'],
    ['Employee Self Service Portal', 'All Department Employees & Officers', 'http://localhost:5173/employee/login', 'prd.test@bjkhealthcare.com (or TEST-PRD-01)', 'Bjk@2026'],
    ['Production Department Queue', 'Production Managers & Supervisors', 'http://localhost:5173/leave-management', 'prd.manager@bjkhealthcare.com', 'Bjk@2026'],
    ['Quality Control Lab Portal', 'QC Managers & Analysts', 'http://localhost:5173/leave-management', 'qc.manager@bjkhealthcare.com', 'Bjk@2026'],
    ['Quality Assurance Compliance', 'QA Managers & Auditors', 'http://localhost:5173/leave-management', 'qa.manager@bjkhealthcare.com', 'Bjk@2026'],
    ['Warehouse & Stores Hub', 'Warehouse Managers & Storekeepers', 'http://localhost:5173/leave-management', 'wh.manager@bjkhealthcare.com', 'Bjk@2026'],
    ['Finance & Accounts Module', 'Finance Managers & Accountants', 'http://localhost:5173/leave-management', 'accounts.manager@bjkhealthcare.com', 'Bjk@2026']
  ];

  portalGuideData.forEach((row, idx) => {
    const r = sheet2.addRow(row);
    r.height = 24;
    r.font = { name: 'Calibri', size: 10 };
    r.alignment = { vertical: 'middle' };
    if (idx % 2 === 0) {
      r.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' }
      };
    }
    r.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFBE123C' } };
    for (let c = 1; c <= 5; c++) {
      r.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }
  });

  sheet2.columns = [
    { width: 28 },
    { width: 34 },
    { width: 42 },
    { width: 44 },
    { width: 18 }
  ];

  // Output Paths
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const clientPublicDir = path.join(__dirname, '..', '..', 'client', 'public');
  if (!fs.existsSync(clientPublicDir)) fs.mkdirSync(clientPublicDir, { recursive: true });

  const serverFilePath = path.join(uploadDir, 'BJK_Healthcare_Department_Test_Accounts_2026.xlsx');
  const clientFilePath = path.join(clientPublicDir, 'BJK_Healthcare_Department_Test_Accounts_2026.xlsx');

  await workbook.xlsx.writeFile(serverFilePath);
  await workbook.xlsx.writeFile(clientFilePath);

  console.log('✅ Excel Sheet Generated Successfully:');
  console.log(' - Server path:', serverFilePath);
  console.log(' - Client download path:', clientFilePath);
}

generateTestAccountsExcel().catch(console.error);
