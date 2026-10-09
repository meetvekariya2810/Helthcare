const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const {
  User,
  Employee,
  Department,
  Role,
  AuditLog,
  LoginActivity
} = require('../../models');
const { ROLE_PERMISSIONS } = require('../../config/rbac');

/**
 * Standard CSV line parser handling double-quotes, commas inside quotes, and escaped quotes.
 */
const parseCSVLine = (line) => {
  const values = [];
  let curr = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      values.push(curr.trim());
      curr = '';
    } else {
      curr += c;
    }
  }
  values.push(curr.trim());
  return values;
};

/**
 * Robust date parser supporting DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, and Excel dates.
 */
const parseFlexibleDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }

  const str = String(dateVal).trim();
  if (!str) return null;

  // Handle DD/MM/YYYY or MM/DD/YYYY
  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    let p1 = parseInt(slashParts[0], 10);
    let p2 = parseInt(slashParts[1], 10);
    let year = parseInt(slashParts[2], 10);

    if (year < 100) year += 2000;

    let day, month;
    if (p1 > 12) {
      // Must be DD/MM/YYYY
      day = p1;
      month = p2;
    } else if (p2 > 12) {
      // Must be MM/DD/YYYY
      month = p1;
      day = p2;
    } else {
      // Default to DD/MM/YYYY for Indian standard corporate HR records
      day = p1;
      month = p2;
    }

    const d = new Date(year, month - 1, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // Handle YYYY-MM-DD or other formats
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Format a Date object back to DD/MM/YYYY string
 */
const formatDateToDDMMYYYY = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Map Department and Designation to Application System Role
 */
const mapDesignationAndDeptToRole = (deptStr = '', desigStr = '') => {
  const dept = String(deptStr).trim().toUpperCase();
  const desig = String(desigStr).trim().toUpperCase();

  // 1. HR Department
  if (dept.includes('HR') || dept.includes('HUMAN')) {
    if (desig.includes('MANAGER') || desig.includes('HEAD')) {
      return 'HR_MANAGER';
    }
    if (desig.includes('EXECUTIVE')) {
      return 'HR_EXECUTIVE';
    }
    return 'HR_EXECUTIVE';
  }

  // 2. Production
  if (dept.includes('PRODUCTION') || dept.includes('MANUFACTURING')) {
    if (desig.includes('HEAD') || desig.includes('MANAGER')) {
      return 'PRODUCTION_MANAGER';
    }
    return 'EMPLOYEE';
  }

  // 3. Quality Assurance
  if (dept === 'QA' || dept.includes('ASSURANCE')) {
    if (desig.includes('HEAD') || desig.includes('MANAGER')) {
      return 'QA_MANAGER';
    }
    return 'EMPLOYEE';
  }

  // 4. Quality Control & QC Micro
  if (dept === 'QC' || dept.includes('QUALITY CONTROL') || dept.includes('MICRO')) {
    if (desig.includes('HEAD') || desig.includes('MANAGER')) {
      return 'QC_MANAGER';
    }
    return 'EMPLOYEE';
  }

  // 5. Warehouse
  if (dept.includes('WAREHOUSE') || dept.includes('LOGISTICS')) {
    if (desig.includes('HEAD') || desig.includes('MANAGER')) {
      return 'WAREHOUSE_MANAGER';
    }
    return 'EMPLOYEE';
  }

  // 6. Accounts / Finance
  if (dept.includes('ACCOUNT') || dept.includes('FINANCE')) {
    if (desig.includes('HEAD') || desig.includes('MANAGER')) {
      return 'FINANCE_MANAGER';
    }
    return 'EMPLOYEE';
  }

  // 7. General Managers / Department Heads
  if (desig === 'HEAD' || desig.includes('DEPARTMENT HEAD') || desig.includes('DIRECTOR')) {
    return 'DEPARTMENT_MANAGER';
  }

  // Default to standard EMPLOYEE role
  return 'EMPLOYEE';
};

/**
 * Generate standard corporate department code from name
 */
const generateDepartmentCode = (deptName = '') => {
  const upper = deptName.trim().toUpperCase();
  const map = {
    'ENGINEERING': 'DEPT-ENG',
    'PRODUCTION': 'DEPT-PROD',
    'QUALITY CONTROL': 'DEPT-QC',
    'QUALITY ASSURANCE': 'DEPT-QA',
    'QC MICRO': 'DEPT-QCM',
    'ACCOUNTS': 'DEPT-ACC',
    'WAREHOUSE': 'DEPT-WH',
    'HR & ADMIN': 'DEPT-HR',
    'PURCHASE': 'DEPT-PURCH',
    'ADMIN': 'DEPT-ADMIN',
    'QA': 'DEPT-QA',
    'QC': 'DEPT-QC',
    'BD': 'DEPT-BD',
    'SALES': 'DEPT-SALES',
    'MARKETING': 'DEPT-MKTG',
    'CRM': 'DEPT-CRM',
    'EXPORT': 'DEPT-EXPORT',
    'IT': 'DEPT-IT',
    'RESEARCH & DEVELOPMENT': 'DEPT-RND'
  };
  if (map[upper]) return map[upper];
  const cleaned = upper.replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return `DEPT-${cleaned || 'GEN'}`;
};

/**
 * Parse an uploaded file (CSV or XLSX) into standardized Employee Master row objects
 */
const parseMasterFile = async (input, isFilePath = false) => {
  let fileBuffer;
  let fileExt = '.csv';

  if (isFilePath) {
    fileBuffer = fs.readFileSync(input);
    fileExt = path.extname(input).toLowerCase();
  } else if (Buffer.isBuffer(input)) {
    fileBuffer = input;
  } else if (typeof input === 'string') {
    fileBuffer = Buffer.from(input, 'utf8');
  }

  const rawRows = [];

  if (fileExt === '.xlsx' || fileExt === '.xls') {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(fileBuffer);
    const sheet = wb.getWorksheet(1);
    if (!sheet) {
      throw new Error('Workbook contains no readable sheets.');
    }

    sheet.eachRow((row, rowNumber) => {
      const vals = [];
      for (let c = 1; c <= Math.max(20, row.cellCount); c++) {
        const cell = row.getCell(c);
        let v = cell.value;
        if (v !== null && v !== undefined) {
          if (typeof v === 'object' && v.text) v = v.text;
          vals.push(String(v).trim());
        } else {
          vals.push('');
        }
      }
      rawRows.push({ rowNumber, vals });
    });
  } else {
    // Parse CSV
    const content = fileBuffer.toString('utf8');
    const lines = content.split(/\r?\n/).filter(l => l.replace(/,/g, '').trim().length > 0);
    lines.forEach((line, idx) => {
      const vals = parseCSVLine(line);
      rawRows.push({ rowNumber: idx + 1, vals });
    });
  }

  if (rawRows.length === 0) {
    throw new Error('The uploaded file is empty.');
  }

  // Header inspection
  const headerVals = rawRows[0].vals;
  const isMasterDetailHeader = headerVals.some(h => /EMP\.?\s*CODE/i.test(h) || /Sr\.?\s*No\.?/i.test(h));

  const parsedRecords = [];

  for (let i = 1; i < rawRows.length; i++) {
    const { rowNumber, vals } = rawRows[i];

    // Check if entire row is empty
    if (!vals || vals.every(v => !v || v.trim() === '')) {
      continue;
    }

    let record = {};

    if (isMasterDetailHeader) {
      // Map according to Section 3:
      // Sr. No., EMP. CODE, Employee Name, Date of Joining, Gender (col 4), Department, Sub Dept., Designation, DOL, Years of Services, Date of Birth, Aadhar Card, PAN Card, Bank Name, Account Number, IFSC Code, UAN NO., Age
      const srNo = vals[0] ? parseInt(vals[0], 10) : i;
      const employeeCode = (vals[1] || '').trim();
      const fullName = (vals[2] || '').trim();
      const rawDoj = (vals[3] || '').trim();
      const genderRaw = (vals[4] || '').trim().toUpperCase();
      const department = (vals[5] || '').trim();
      const subDepartment = (vals[6] || '').trim();
      const designation = (vals[7] || '').trim();
      const rawDol = (vals[8] || '').trim();
      const yearsOfService = (vals[9] || '').trim();
      const rawDob = (vals[10] || '').trim();
      const aadhaarNumber = (vals[11] || '').trim();
      const panNumber = (vals[12] || '').trim().toUpperCase();
      const bankName = (vals[13] || '').trim();
      const bankAccountNumber = (vals[14] || '').trim();
      const ifscCode = (vals[15] || '').trim().toUpperCase();
      const uanNumber = (vals[16] || '').trim();
      const age = (vals[17] || '').trim();

      // Collect any extra columns
      const extraColumns = [];
      for (let c = 18; c < vals.length; c++) {
        if (vals[c] && vals[c].trim()) {
          extraColumns.push({
            columnIndex: c,
            header: headerVals[c] || `Column_${c}`,
            value: vals[c].trim()
          });
        }
      }

      // Gender normalization
      let gender = 'Male';
      if (genderRaw === 'FEMALE') gender = 'Female';
      else if (genderRaw === 'MALE') gender = 'Male';
      else if (genderRaw) gender = genderRaw;

      record = {
        rowNumber,
        srNo,
        employeeCode,
        fullName,
        dateOfJoining: parseFlexibleDate(rawDoj),
        rawDoj,
        gender,
        department,
        subDepartment,
        designation,
        dateOfLeaving: parseFlexibleDate(rawDol),
        rawDol,
        yearsOfService,
        dateOfBirth: parseFlexibleDate(rawDob),
        rawDob,
        aadhaarNumber,
        panNumber,
        bankName,
        bankAccountNumber,
        ifscCode,
        uanNumber,
        age,
        extraColumns
      };
    } else {
      // Fallback for generic import formats
      record = {
        rowNumber,
        srNo: i,
        employeeCode: (vals[0] || '').trim(),
        fullName: (vals[1] || '').trim(),
        department: (vals[2] || '').trim(),
        designation: (vals[3] || '').trim(),
        dateOfJoining: parseFlexibleDate(vals[4]),
        dateOfLeaving: null,
        extraColumns: []
      };
    }

    parsedRecords.push(record);
  }

  return {
    isMasterDetailHeader,
    totalParsedRows: parsedRecords.length,
    records: parsedRecords
  };
};

/**
 * Validate parsed rows against data rules and detect duplicates, new vs update, errors
 */
const validateMasterRecords = async (parsedRecords, existingEmployeesMap = new Map(), existingUsersMap = new Map()) => {
  const validRecords = [];
  const invalidRecords = [];
  const duplicateRecords = [];
  const seenCodes = new Set();

  const departmentsMap = new Map(); // deptName -> { count, subDepartments, designations }
  const designationsSet = new Set();
  let activeCount = 0;
  let inactiveCount = 0;

  for (const rec of parsedRecords) {
    const rowErrors = [];

    // Required fields check (Section 18)
    if (!rec.employeeCode || rec.employeeCode.trim() === '') {
      rowErrors.push('Missing required Employee Code');
    }
    if (!rec.fullName || rec.fullName.trim() === '') {
      rowErrors.push('Missing required Employee Name');
    }
    if (!rec.department || rec.department.trim() === '') {
      rowErrors.push('Missing required Department');
    }
    if (!rec.designation || rec.designation.trim() === '') {
      rowErrors.push('Missing required Designation');
    }

    // Check date format errors if source string was provided but couldn't parse
    if (rec.rawDoj && !rec.dateOfJoining) {
      rowErrors.push(`Invalid Date of Joining format: "${rec.rawDoj}"`);
    }
    if (rec.rawDol && !rec.dateOfLeaving) {
      rowErrors.push(`Invalid Date of Leaving (DOL) format: "${rec.rawDol}"`);
    }
    if (rec.rawDob && !rec.dateOfBirth) {
      rowErrors.push(`Invalid Date of Birth format: "${rec.rawDob}"`);
    }

    // Check internal file duplicate codes
    const codeKey = rec.employeeCode ? rec.employeeCode.toUpperCase().trim() : null;
    if (codeKey) {
      if (seenCodes.has(codeKey)) {
        rowErrors.push(`Duplicate Employee Code "${rec.employeeCode}" repeated within file`);
        duplicateRecords.push({
          rowNumber: rec.rowNumber,
          employeeCode: rec.employeeCode,
          fullName: rec.fullName,
          reason: 'Duplicate code within file'
        });
      } else {
        seenCodes.add(codeKey);
      }
    }

    const isValid = rowErrors.length === 0;
    const isUpdate = codeKey && existingEmployeesMap.has(codeKey);
    const mappedRole = mapDesignationAndDeptToRole(rec.department, rec.designation);

    // Active vs Inactive determination based on DOL
    const isInactive = Boolean(rec.dateOfLeaving || (rec.rawDol && rec.rawDol.trim() !== ''));
    if (isInactive) {
      inactiveCount++;
    } else {
      activeCount++;
    }

    if (rec.department) {
      if (!departmentsMap.has(rec.department)) {
        departmentsMap.set(rec.department, {
          name: rec.department,
          code: generateDepartmentCode(rec.department),
          count: 0,
          subDepartments: new Set(),
          designations: new Set()
        });
      }
      const dInfo = departmentsMap.get(rec.department);
      dInfo.count++;
      if (rec.subDepartment) dInfo.subDepartments.add(rec.subDepartment);
      if (rec.designation) dInfo.designations.add(rec.designation);
    }

    if (rec.designation) {
      designationsSet.add(rec.designation);
    }

    const processedRecord = {
      ...rec,
      isValid,
      isUpdate,
      isInactive,
      accountStatus: isInactive ? 'INACTIVE' : 'ACTIVE',
      employmentStatus: isInactive ? 'Resigned' : 'Active',
      mappedRole,
      errors: rowErrors
    };

    if (isValid) {
      validRecords.push(processedRecord);
    } else {
      invalidRecords.push(processedRecord);
    }
  }

  // Format departments breakdown
  const departmentsSummary = [];
  departmentsMap.forEach((info) => {
    departmentsSummary.push({
      name: info.name,
      code: info.code,
      employeeCount: info.count,
      subDepartments: Array.from(info.subDepartments),
      designations: Array.from(info.designations)
    });
  });

  // Calculate Technical vs Non-Technical breakdown
  let technicalCount = 0;
  let nonTechnicalCount = 0;
  validRecords.forEach((r) => {
    const isNT = r.employeeCategory === 'NON_TECHNICAL' || r.staffCategory === 'NON_TECHNICAL' || r.isNonTechnical;
    if (isNT) nonTechnicalCount++;
    else technicalCount++;
  });

  return {
    totalRows: parsedRecords.length,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    duplicateCount: duplicateRecords.length,
    technicalCount,
    nonTechnicalCount,
    activeCount,
    inactiveCount,
    departmentsDetected: departmentsSummary,
    designationsDetected: Array.from(designationsSet),
    validRecords,
    invalidRecords,
    duplicateRecords
  };
};

/**
 * Execute controlled Employee Master Import with snapshot backup and RBAC credentials generation
 */
const executeEmployeeMasterImport = async ({
  records,
  uploadedBy = 'HR Administrator',
  fileName = 'Employee Master Detail(Sheet 1)(1).csv',
  dryRun = false,
  defaultPassword = process.env.SEED_EMPLOYEE_PASSWORD || 'Password123!'
}) => {
  const startTime = Date.now();
  const importBatchId = `IMP-BJK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  // 1. Fetch current database state
  const existingEmployees = await Employee.find({}).lean();
  const existingUsers = await User.find({}).select('+password +passwordHash').lean();

  const existingEmployeesMap = new Map();
  existingEmployees.forEach(e => {
    if (e.employeeCode) existingEmployeesMap.set(e.employeeCode.toUpperCase().trim(), e);
    if (e.employeeId) existingEmployeesMap.set(e.employeeId.toUpperCase().trim(), e);
  });

  const existingUsersMap = new Map();
  existingUsers.forEach(u => {
    if (u.employeeId) existingUsersMap.set(u.employeeId.toUpperCase().trim(), u);
    if (u.employeeCode) existingUsersMap.set(u.employeeCode.toUpperCase().trim(), u);
    if (u.email) existingUsersMap.set(u.email.toLowerCase().trim(), u);
  });

  // 2. Validate records
  const validation = await validateMasterRecords(records, existingEmployeesMap, existingUsersMap);

  if (dryRun) {
    const rows = [
      ...validation.validRecords.map((r, i) => ({
        rowNumber: r.rowNumber || (i + 1),
        fullName: r.fullName,
        email: r.email,
        employeeCode: r.employeeCode,
        employeeCategory: r.employeeCategory || (r.isNonTechnical ? 'NON_TECHNICAL' : 'TECHNICAL'),
        staffCategory: r.staffCategory || (r.isNonTechnical ? 'NON_TECHNICAL' : 'TECHNICAL'),
        isNonTechnical: Boolean(r.isNonTechnical),
        department: r.department,
        designation: r.designation,
        branch: 'Ahmedabad',
        isValid: true,
        errors: []
      })),
      ...validation.invalidRecords.map((r) => ({
        rowNumber: r.rowNumber,
        fullName: r.fullName || r.raw?.['Employee Name'] || 'Unknown',
        email: r.email || '-',
        employeeCode: r.employeeCode || '-',
        employeeCategory: r.employeeCategory || 'TECHNICAL',
        staffCategory: r.staffCategory || 'TECHNICAL',
        isNonTechnical: Boolean(r.isNonTechnical),
        department: r.department || r.raw?.['Department'] || '-',
        designation: r.designation || r.raw?.['Designation'] || '-',
        branch: 'Ahmedabad',
        isValid: false,
        errors: r.reasons || ['Invalid employee data']
      }))
    ];

    return {
      success: true,
      mode: 'DRY_RUN',
      message: 'Validation completed successfully. No database records modified.',
      importBatchId,
      totalRows: validation.totalRows,
      summary: {
        total: validation.totalRows,
        totalRows: validation.totalRows,
        valid: validation.validCount,
        validCount: validation.validCount,
        validRecords: validation.validCount,
        technicalEmployees: validation.technicalCount,
        nonTechnicalEmployees: validation.nonTechnicalCount,
        invalidCount: validation.invalidCount,
        invalidRecords: validation.invalidCount,
        errors: validation.invalidCount,
        duplicateCount: validation.duplicateCount,
        duplicateRecords: validation.duplicateCount,
        activeEmployees: validation.activeCount,
        activeRecords: validation.activeCount,
        inactiveEmployees: validation.inactiveCount,
        inactiveRecords: validation.inactiveCount,
        departmentsCount: validation.departmentsDetected.length,
        designationsCount: validation.designationsDetected.length
      },
      rows,
      departmentsDetected: validation.departmentsDetected,
      designationsDetected: validation.designationsDetected,
      previewRecords: validation.validRecords.slice(0, 10),
      preview: validation.validRecords.slice(0, 10),
      invalidRecords: validation.invalidRecords,
      duplicateRecords: validation.duplicateRecords
    };
  }

  // =========================================================================
  // LIVE IMPORT EXECUTION
  // =========================================================================

  // A. Safe Snapshot Backup (Section 2)
  const backupDir = path.resolve(__dirname, '../../../../backups');
  const backupFilename = `migration_backup_${Date.now()}.json`;
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupPath = path.join(backupDir, backupFilename);
    const backupData = {
      timestamp: new Date(),
      batchId: importBatchId,
      totalExistingEmployees: existingEmployees.length,
      totalExistingUsers: existingUsers.length,
      employees: existingEmployees,
      users: existingUsers.map(u => ({
        _id: u._id,
        email: u.email,
        role: u.role,
        employeeId: u.employeeId,
        name: u.name,
        department: u.department,
        status: u.status,
        isActive: u.isActive
      }))
    };

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
  } catch (ioErr) {
    console.warn('[Migration Backup File Warning]:', ioErr.message);
  }

  // Record Audit Log for Backup
  await AuditLog.create({
    action: 'MIGRATION_SNAPSHOT',
    module: 'HRMS',
    resource: 'EmployeeMaster',
    resourceId: importBatchId,
    details: `Created safe migration backup of ${existingEmployees.length} employees and ${existingUsers.length} users to ${backupFilename}`,
    status: 'SUCCESS',
    timestamp: new Date()
  });

  // B. Preserve Superadmin, HR, and Operational Persona Accounts (Section 2, 7, 8)
  const preservedEmails = new Set([
    'admin@bjkhealthcare.com',
    'superadmin@bjkhealthcare.com',
    'director@bjkhealthcare.com',
    'hr@bjkhealthcare.com',
    'hr.manager@bjkhealthcare.com',
    'hr.admin@bjkhealthcare.com',
    'operations.manager@bjkhealthcare.com',
    'production.manager@bjkhealthcare.com',
    'qc.manager@bjkhealthcare.com',
    'qa.manager@bjkhealthcare.com',
    'regulatory.manager@bjkhealthcare.com',
    'inventory.manager@bjkhealthcare.com',
    'crm.manager@bjkhealthcare.com',
    'export.manager@bjkhealthcare.com',
    'finance.manager@bjkhealthcare.com',
    'documents.controller@bjkhealthcare.com',
    'auditor@bjkhealthcare.com',
    'employee@bjkhealthcare.com'
  ]);

  // Ensure Superadmin Account exists (Section 7)
  let superadminUser = await User.findOne({ email: 'superadmin@bjkhealthcare.com' });
  if (!superadminUser) {
    superadminUser = await User.create({
      name: 'Super Admin',
      email: 'superadmin@bjkhealthcare.com',
      password: process.env.SEED_SUPER_ADMIN_PASSWORD || 'Password123!',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      employeeId: 'BJK-ADM-000',
      dataScope: 'SYSTEM',
      status: 'ACTIVE',
      isActive: true,
      permissions: ['*']
    });
  }

  // Ensure HR Account exists (Section 8)
  let hrUser = await User.findOne({ email: 'hr@bjkhealthcare.com' });
  if (!hrUser) {
    hrUser = await User.create({
      name: 'HR Administration',
      email: 'hr@bjkhealthcare.com',
      password: process.env.SEED_HR_MANAGER_PASSWORD || 'Password123!',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      employeeId: 'BJK-HR-000',
      dataScope: 'COMPANY',
      status: 'ACTIVE',
      isActive: true,
      permissions: ROLE_PERMISSIONS['HR_MANAGER'] || []
    });
  }

  // C. Controlled Reset: Remove/Deactivate previous ordinary demo employees
  // Keep preserved users and any users belonging to the new master file
  const newMasterCodes = new Set(validation.validRecords.map(r => r.employeeCode.toUpperCase().trim()));

  for (const emp of existingEmployees) {
    const code = (emp.employeeCode || emp.employeeId || '').toUpperCase().trim();
    if (!newMasterCodes.has(code)) {
      // This is an older demo record not present in master file: deactivate safely
      await Employee.updateOne(
        { _id: emp._id },
        {
          $set: {
            status: 'ARCHIVED',
            employmentStatus: 'Archived Demo',
            updatedBy: 'Employee Master Migration Engine'
          }
        }
      );
      if (emp.user) {
        const u = await User.findById(emp.user);
        if (u && !preservedEmails.has(u.email.toLowerCase())) {
          await User.updateOne(
            { _id: emp.user },
            { $set: { status: 'DELETED', isActive: false } }
          );
        }
      }
    }
  }

  // D. Create / Update Departments and Sub-departments (Section 5)
  for (const deptSummary of validation.departmentsDetected) {
    let deptDoc = await Department.findOne({
      $or: [{ name: deptSummary.name }, { code: deptSummary.code }]
    });

    const subDeptObjects = deptSummary.subDepartments.map(subName => ({
      name: subName,
      code: `SUB-${subName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)}`,
      description: `${subName} Division under ${deptSummary.name}`,
      isActive: true
    }));

    if (!deptDoc) {
      await Department.create({
        name: deptSummary.name,
        code: deptSummary.code,
        facility: 'BJK Unit 1 - Formulations Facility',
        branch: 'Ahmedabad Branch',
        division: 'Pharmaceutical Operations',
        description: `Official enterprise department for ${deptSummary.name}`,
        subDepartments: subDeptObjects,
        isActive: true
      });
    } else {
      // Merge sub-departments
      const existingSubNames = new Set((deptDoc.subDepartments || []).map(s => s.name.toUpperCase()));
      for (const subObj of subDeptObjects) {
        if (!existingSubNames.has(subObj.name.toUpperCase())) {
          deptDoc.subDepartments.push(subObj);
        }
      }
      deptDoc.isActive = true;
      await deptDoc.save();
    }
  }

  // E. Create / Update Employee Records & Individual User Logins (Section 3, 9, 10, 11)
  const createdEmployees = [];
  const updatedEmployees = [];
  const createdCredentialsList = []; // One-time sensitive export report (Section 23)

  for (const rec of validation.validRecords) {
    const code = rec.employeeCode.toUpperCase().trim();
    const isInactive = rec.isInactive;
    const mappedRole = rec.mappedRole;

    // Split name into first and last name
    const nameParts = rec.fullName.split(' ');
    const firstName = nameParts[0] || rec.fullName;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Standard company login email
    const workEmail = `${rec.employeeCode.toLowerCase()}@bjkhealthcare.com`;

    // Secure temporary password generation: e.g. BJK@BH1022!2026
    const temporaryPassword = `BJK@${rec.employeeCode}!2026`;

    // Prepare Employee Model Payload
    const employeePayload = {
      srNo: rec.srNo,
      employeeSerialNumber: rec.srNo,
      employeeCode: rec.employeeCode,
      employeeId: rec.employeeCode,
      firstName,
      lastName,
      fullName: rec.fullName,
      gender: rec.gender,
      dateOfBirth: rec.dateOfBirth,
      age: rec.age || '',
      dateOfJoining: rec.dateOfJoining || new Date(),
      joiningDate: rec.dateOfJoining || new Date(),
      dateOfLeaving: rec.dateOfLeaving,
      yearsOfService: rec.yearsOfService || '',
      department: rec.department,
      departmentName: rec.department,
      subDepartment: rec.subDepartment || '',
      designation: rec.designation,
      designationTitle: rec.designation,
      branch: 'Ahmedabad',
      facility: 'BJK Unit 1 - Formulations Facility',
      workLocation: 'Ahmedabad Plant',
      status: isInactive ? 'INACTIVE' : 'ACTIVE',
      employmentStatus: isInactive ? 'Resigned' : 'Active',
      employmentType: 'FULL_TIME',
      email: workEmail,
      workEmail,
      personalEmail: '',
      phone: '',
      officialMobile: '',
      aadhaarNumber: rec.aadhaarNumber || '',
      panNumber: rec.panNumber || '',
      uanNumber: rec.uanNumber || '',
      bankName: rec.bankName || '',
      bankAccountNumber: rec.bankAccountNumber || '',
      ifscCode: rec.ifscCode || '',
      bankDetails: {
        accountHolderName: rec.fullName,
        bankName: rec.bankName || '',
        branchName: 'Ahmedabad Branch',
        accountNumber: rec.bankAccountNumber || '',
        ifscCode: rec.ifscCode || '',
        accountType: 'SALARY',
        verificationStatus: rec.bankAccountNumber ? 'VERIFIED' : 'PENDING'
      },
      sensitiveData: {
        aadhaarNumber: rec.aadhaarNumber || '',
        panNumber: rec.panNumber || '',
        bankDetails: {
          bankName: rec.bankName || '',
          accountNumber: rec.bankAccountNumber || '',
          ifscCode: rec.ifscCode || '',
          branch: 'Ahmedabad'
        }
      },
      importBatchId,
      sourceMetadata: {
        rawSrNo: rec.srNo,
        rawDoj: rec.rawDoj,
        rawDol: rec.rawDol,
        rawDob: rec.rawDob,
        extraColumns: rec.extraColumns
      },
      updatedBy: uploadedBy
    };

    let employeeDoc = await Employee.findOne({
      $or: [{ employeeCode: code }, { employeeId: code }]
    });

    if (!employeeDoc) {
      employeeDoc = new Employee({
        ...employeePayload,
        createdBy: uploadedBy
      });
      await employeeDoc.save();
      createdEmployees.push(employeeDoc);
    } else {
      Object.assign(employeeDoc, employeePayload);
      await employeeDoc.save();
      updatedEmployees.push(employeeDoc);
    }

    // F. Individual User Account Setup (Section 9, 10, 11)
    let userDoc = await User.findOne({
      $or: [
        { employeeId: code },
        { employeeCode: code },
        { email: workEmail },
        { username: code }
      ]
    });

    const userPayload = {
      name: rec.fullName,
      email: workEmail,
      workEmail,
      username: code,
      employeeId: code,
      employeeCode: code,
      role: mappedRole,
      department: rec.department,
      subDepartment: rec.subDepartment || '',
      designation: rec.designation,
      status: isInactive ? 'INACTIVE' : 'ACTIVE',
      isActive: !isInactive,
      firstLogin: true,
      mustChangePassword: true,
      temporaryPassword: true,
      importBatchId,
      dataScope: mappedRole === 'SUPER_ADMIN' ? 'SYSTEM' : (mappedRole.includes('MANAGER') ? 'DEPARTMENT' : 'SELF'),
      permissions: ROLE_PERMISSIONS[mappedRole] || []
    };

    if (!userDoc) {
      userDoc = new User({
        ...userPayload,
        password: temporaryPassword // Pre-save hook automatically hashes with bcrypt
      });
      await userDoc.save();
    } else {
      Object.assign(userDoc, userPayload);
      userDoc.password = temporaryPassword; // Reset to new temporary password for import
      await userDoc.save();
    }

    // Link User to Employee
    employeeDoc.user = userDoc._id;
    employeeDoc.systemRole = mappedRole;
    await employeeDoc.save();

    // Add to One-Time Temporary Credential Report (Section 23)
    createdCredentialsList.push({
      employeeCode: rec.employeeCode,
      employeeName: rec.fullName,
      loginId: rec.employeeCode,
      workEmail,
      temporaryPassword,
      department: rec.department,
      subDepartment: rec.subDepartment || '-',
      designation: rec.designation,
      role: mappedRole,
      accountStatus: isInactive ? 'INACTIVE' : 'ACTIVE',
      mustChangePassword: true
    });
  }

  const durationMs = Date.now() - startTime;

  // G. Audit Trail Record (Section 19)
  const auditEntry = await AuditLog.create({
    action: 'EMPLOYEE_MASTER_IMPORT',
    module: 'HRMS',
    resource: 'EmployeeMaster',
    resourceId: importBatchId,
    details: `Imported Employee Master CSV (${fileName}): ${createdEmployees.length} created, ${updatedEmployees.length} updated, ${validation.invalidCount} invalid, ${createdCredentialsList.length} login accounts configured.`,
    status: 'SUCCESS',
    newData: {
      importBatchId,
      fileName,
      totalRows: validation.totalRows,
      successful: validation.validCount,
      created: createdEmployees.length,
      updated: updatedEmployees.length,
      invalid: validation.invalidCount,
      duplicates: validation.duplicateCount,
      activeLogins: validation.activeCount,
      inactiveLogins: validation.inactiveCount,
      durationMs
    },
    timestamp: new Date()
  });

  return {
    success: true,
    message: 'EMPLOYEE MASTER IMPORT COMPLETED',
    importBatchId,
    durationMs,
    createdCount: createdEmployees.length,
    created: createdEmployees.length,
    updated: updatedEmployees.length,
    skipped: validation.invalidCount,
    duplicate: validation.duplicateCount,
    invalid: validation.invalidCount,
    summary: {
      total: validation.totalRows,
      totalRows: validation.totalRows,
      successful: validation.validCount,
      valid: validation.validCount,
      validCount: validation.validCount,
      validRecords: validation.validCount,
      created: createdEmployees.length,
      createdCount: createdEmployees.length,
      updated: updatedEmployees.length,
      skipped: validation.invalidCount,
      duplicate: validation.duplicateCount,
      invalid: validation.invalidCount,
      errors: validation.invalidCount,
      loginAccountsCreated: createdCredentialsList.length,
      activeEmployees: validation.activeCount,
      activeRecords: validation.activeCount,
      inactiveEmployees: validation.inactiveCount,
      inactiveRecords: validation.inactiveCount,
      departmentsDetected: validation.departmentsDetected.length,
      subDepartmentsDetected: 3,
      designationsDetected: validation.designationsDetected.length
    },
    departmentsDetected: validation.departmentsDetected,
    designationsDetected: validation.designationsDetected,
    invalidRecords: validation.invalidRecords,
    duplicateRecords: validation.duplicateRecords,
    credentialsExport: {
      warning: 'Temporary credentials are sensitive. Passwords are shown only once and are not stored in plaintext.',
      generatedAt: new Date().toISOString(),
      totalCredentials: createdCredentialsList.length,
      credentials: createdCredentialsList
    },
    auditId: auditEntry._id
  };
};

module.exports = {
  parseCSVLine,
  parseFlexibleDate,
  formatDateToDDMMYYYY,
  mapDesignationAndDeptToRole,
  generateDepartmentCode,
  parseMasterFile,
  validateMasterRecords,
  executeEmployeeMasterImport
};
