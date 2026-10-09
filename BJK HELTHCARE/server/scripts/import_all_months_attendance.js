require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');

const DIR = 'C:\\Users\\Meet Vekariya\\OneDrive\\Desktop\\BJK HEALTHCARE raw data\\Aatanace';

const MONTHS_CONFIG = [
  { month: 1, year: 2026, days: 31, file: "Attendance Sheet_Jan'25(Jan 2026).csv", batchPrefix: "ATT-2026-01" },
  { month: 2, year: 2026, days: 28, file: "Attendance Sheet_Feb'25(FEB 2026).csv", batchPrefix: "ATT-2026-02" },
  { month: 3, year: 2026, days: 31, file: "Attendance Sheet_Mar'26(MAR 2026).csv", batchPrefix: "ATT-2026-03" },
  { month: 4, year: 2026, days: 30, file: "Attendance Sheet_Apr'26(APR 2026).csv", batchPrefix: "ATT-2026-04" },
  { month: 5, year: 2026, days: 31, file: "Attendance Sheet_May'26(MAY 2026).csv", batchPrefix: "ATT-2026-05" },
  { month: 6, year: 2026, days: 30, file: "Attendance Sheet_June'26(JUNE 2026).csv", batchPrefix: "ATT-2026-06" },
  { month: 7, year: 2026, days: 31, file: "Attendance Sheet_July 2026(JULY 2026).csv", batchPrefix: "ATT-2026-07" },
  { month: 8, year: 2026, days: 31, file: "08 Attendance Sheet_Aug 2026(AUG 2026).csv", batchPrefix: "ATT-2026-08", isExistingAugust: true },
  { month: 9, year: 2026, days: 30, file: "Attendance Sheet_Sep 2026(SEP 2026).csv", batchPrefix: "ATT-2026-09" }
];

// Explicit name-to-code mapping for January where code header was absent
const JAN_NAME_MAP = {
  'nitin gajjar': 'BH1021',
  'kirtankumar jayantibhai patel': 'BH1024',
  'dixita jayantibhai makwana': 'BH1022',
  'milan dilipbhai mayani': 'BH1023',
  'nidhi kushwah': 'BH1026',
  'shwetasingh kurm kshatriya': 'BH1029',
  'hiteshkumar amarsinh chauhan': 'BH1028',
  'pinkybahen patel': 'BH1027',
  'karina lalitbhai patel': 'BH1031',
  'lalsinh zala': 'BH1036',
  'krunal patel': 'BH1011',
  'sureshkumar r. chauhan': 'BH1035',
  'sureshkumar rajendrasinh chauhan': 'BH1035',
  'kartikkumar patel': 'BH1032',
  'ayushkumar patel': 'BH1033',
  'rutulkumar patel': 'BH1034',
  'rajendrasinh makwana': 'BH1037',
  'vishalkumar patel': 'BH1038',
  'daksheshkumar nayi': 'BH1039',
  'payal chirag chodvadiya': 'BH1040',
  'hetalben jitendrakumar pandit': 'BH1041',
  'kinjal kathiriya': 'BH1042',
  'payalben dilipbhai darji': 'BH1030',
  'nigamkumar rohitbhai raval': 'BH1047',
  'balvantsinh dinusinh rathod': 'BH1044',
  'hina pankaj chowdhry': 'BH1043',
  'kishan haresh patel': 'BH1045',
  'krutika parmar': 'BH1046'
};

function normalizeStatus(rawVal) {
  if (!rawVal) return '';
  const trimmed = rawVal.trim();
  if (['LEFT', 'Not Joined', '-'].includes(trimmed)) return '';
  return trimmed;
}

function parseNum(val) {
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

async function runImport() {
  await connectDB();
  console.log('=== BJK HEALTHCARE JANUARY-SEPTEMBER 2026 ATTENDANCE INTEGRATION ===\n');

  // Load Master Users & Employees
  const allUsers = await User.find({}).lean();
  const allEmployees = await Employee.find({}).lean();

  const userMap = new Map();
  allUsers.forEach(u => {
    if (u.employeeCode) userMap.set(u.employeeCode.toUpperCase().trim(), u);
    if (u.employeeId) userMap.set(u.employeeId.toUpperCase().trim(), u);
  });

  const empMap = new Map();
  allEmployees.forEach(e => {
    const code = (e.employeeCode || e.employeeId || '').toUpperCase().trim();
    if (code) empMap.set(code, e);
  });

  for (const cfg of MONTHS_CONFIG) {
    if (cfg.isExistingAugust) {
      console.log(`\n--- MONTH 8 / 2026 (August) ---`);
      console.log(`Existing August attendance batch is preserved. Skipping re-import.`);
      const augCount = await Attendance.countDocuments({ month: 8, year: 2026 });
      const augSummaries = await AttendanceMonthlySummary.countDocuments({ month: 8, year: 2026 });
      console.log(`August Daily Records in DB: ${augCount}, Summaries: ${augSummaries}`);
      continue;
    }

    console.log(`\n======================================================`);
    console.log(`PROCESSING MONTH ${cfg.month} / ${cfg.year} (${cfg.file})`);
    console.log(`======================================================`);

    const filePath = path.join(DIR, cfg.file);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);

    // Identify header line with day numbers (1, 2, ... days)
    const headerLine = lines[1].split(',');
    const dayCols = [];
    let summaryStartIndex = -1;

    for (let c = 1; c < headerLine.length; c++) {
      const val = parseInt(headerLine[c]?.trim(), 10);
      if (!isNaN(val) && val >= 1 && val <= cfg.days) {
        dayCols.push({ day: val, colIndex: c });
      } else if (dayCols.length > 0 && summaryStartIndex === -1) {
        summaryStartIndex = c;
      }
    }

    const maxDayFound = dayCols.length;
    console.log(`Detected Days Columns: 1 to ${maxDayFound} (Summary starts at col ${summaryStartIndex})`);

    // Parse summary header map
    const summaryHeaders = {};
    for (let c = summaryStartIndex; c < headerLine.length; c++) {
      const h = headerLine[c]?.trim();
      if (h) summaryHeaders[h.toLowerCase().replace(/[^a-z]/g, '')] = c;
    }

    // Check if batch already exists for this month
    const batchId = `${cfg.batchPrefix}-${Date.now().toString().slice(-6)}`;
    let dailyRecordsToInsert = [];
    let summariesToInsert = [];
    let matchedEmployeesCount = 0;
    let unmatchedEmployeesCount = 0;

    for (let r = 3; r < lines.length; r++) {
      const rawCols = lines[r].split(',');
      const sr = rawCols[0]?.trim();
      if (!sr || isNaN(parseInt(sr, 10))) continue;

      let rawEmpCode = '';
      let rawName = '';
      let rawDept = '';

      if (cfg.month === 1) {
        rawName = rawCols[1]?.trim();
        rawDept = rawCols[2]?.trim();
        const cleanName = (rawName || '').toLowerCase().trim();
        rawEmpCode = JAN_NAME_MAP[cleanName] || '';
      } else {
        rawEmpCode = rawCols[1]?.trim();
        rawName = rawCols[2]?.trim();
        rawDept = rawCols[3]?.trim();

        // Correction for April CSV typo where Bhaveshkumar Prajapati was labeled BH1056 instead of BH1058
        if (rawName && rawName.toLowerCase().includes('bhaveshkumar') && rawName.toLowerCase().includes('prajapati')) {
          rawEmpCode = 'BH1058';
        }
      }

      if (!rawEmpCode && !rawName) continue;

      const normCode = (rawEmpCode || '').toUpperCase().trim();
      const matchedUser = userMap.get(normCode);
      const matchedEmp = empMap.get(normCode);

      const employeeId = matchedUser ? matchedUser._id : (matchedEmp ? matchedEmp._id : new mongoose.Types.ObjectId());
      const employeeName = matchedUser?.name || matchedEmp?.fullName || rawName;
      const department = rawDept || matchedUser?.department || matchedEmp?.department || 'General';

      if (normCode) {
        matchedEmployeesCount++;
      } else {
        unmatchedEmployeesCount++;
      }

      // 1. Process Daily Attendance
      for (const { day, colIndex } of dayCols) {
        const rawStatus = rawCols[colIndex]?.trim();
        const status = normalizeStatus(rawStatus);

        if (!status) continue; // Skip days with no punch (e.g. Left/Not Joined)

        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(cfg.month).padStart(2, '0');
        const dateStr = `${cfg.year}-${monthStr}-${dayStr}`;

        const isPresent = ['P', 'p', 'M', 'PRESENT'].includes(status);
        const isHalfDay = ['P1/2', 'CL1/2', 'SL1/2', 'HALF_DAY'].includes(status);

        dailyRecordsToInsert.push({
          employee: employeeId,
          employeeId: normCode || rawName,
          employeeCode: normCode || rawName,
          employeeName: employeeName,
          sourceEmployeeName: rawName || employeeName,
          sourceDepartment: department,
          departmentName: department,
          branchName: 'Ahmedabad Branch',
          shiftName: 'General Shift (09:00 - 18:00)',
          attendanceDate: dateStr,
          dateString: dateStr,
          date: new Date(dateStr),
          dayOfMonth: day,
          month: cfg.month,
          year: cfg.year,
          attendanceStatus: status,
          status: status,
          workingHours: isPresent ? 8 : (isHalfDay ? 4 : 0),
          scheduledIn: '09:00',
          scheduledOut: '18:00',
          source: 'IMPORT',
          importBatchId: batchId,
          sourceFileName: cfg.file
        });
      }

      // 2. Process Monthly Summary
      // Find columns for Present, WO, PH, CO, LWP, Total Days
      let presentVal = 0;
      let woVal = 0;
      let phVal = 0;
      let coVal = 0;
      let lwpVal = 0;
      let clVal = 0;
      let slVal = 0;
      let totalDaysVal = cfg.days;

      // Scan summary cells
      for (let c = summaryStartIndex; c < rawCols.length; c++) {
        const hName = (headerLine[c] || '').toLowerCase().trim();
        const cellVal = parseNum(rawCols[c]);

        if (hName.includes('present')) presentVal = cellVal;
        else if (hName === 'wo' || hName.includes('week')) woVal = cellVal;
        else if (hName === 'ph' || hName.includes('holiday')) phVal = cellVal;
        else if (hName === 'co' || hName.includes('comp')) coVal = cellVal;
        else if (hName === 'lwp' || hName.includes('without')) lwpVal = cellVal;
        else if (hName === 'cl') clVal = cellVal;
        else if (hName === 'sl') slVal = cellVal;
        else if (hName.includes('total')) totalDaysVal = cellVal || cfg.days;
      }

      summariesToInsert.push({
        employee: employeeId,
        employeeId: employeeId,
        employeeCode: normCode || rawName,
        employeeName: employeeName,
        sourceEmployeeName: rawName || employeeName,
        department: department,
        sourceDepartment: department,
        month: cfg.month,
        year: cfg.year,
        present: presentVal,
        weeklyOff: woVal,
        publicHoliday: phVal,
        casualLeave: clVal,
        sickLeave: slVal,
        compensatoryOff: coVal,
        leaveWithoutPay: lwpVal,
        absentPayDays: presentVal + woVal + phVal + coVal,
        totalDays: totalDaysVal,
        importBatchId: batchId,
        sourceFileName: cfg.file
      });
    }

    console.log(`Inserting Month ${cfg.month}: ${dailyRecordsToInsert.length} daily records, ${summariesToInsert.length} monthly summaries...`);

    const monthPrefix = `2026-${String(cfg.month).padStart(2, '0')}`;

    // Clean any prior non-August records for this month
    await Attendance.deleteMany({
      $or: [
        { month: cfg.month, year: cfg.year },
        { dateString: { $regex: `^${monthPrefix}` } },
        { attendanceDate: { $regex: `^${monthPrefix}` } }
      ],
      importBatchId: { $ne: 'ATT-2026-08-1791233528440-8788' }
    });

    await AttendanceMonthlySummary.deleteMany({
      month: cfg.month,
      year: cfg.year,
      importBatchId: { $ne: 'ATT-2026-08-1791233528440-8788' }
    });

    await AttendanceImportBatch.deleteMany({
      month: cfg.month,
      year: cfg.year,
      importBatchId: { $ne: 'ATT-2026-08-1791233528440-8788' }
    });

    if (dailyRecordsToInsert.length > 0) {
      await Attendance.insertMany(dailyRecordsToInsert, { ordered: false });
    }
    if (summariesToInsert.length > 0) {
      await AttendanceMonthlySummary.insertMany(summariesToInsert, { ordered: false });
    }

    await AttendanceImportBatch.create({
      importBatchId: batchId,
      fileName: cfg.file,
      sourceFileName: cfg.file,
      originalFileName: cfg.file,
      month: cfg.month,
      year: cfg.year,
      totalRows: lines.length - 3,
      matchedEmployees: matchedEmployeesCount,
      unmatchedEmployees: unmatchedEmployeesCount,
      dailyRecordsCreated: dailyRecordsToInsert.length,
      monthlySummariesCreated: summariesToInsert.length,
      status: 'IMPORTED',
      importedByName: 'HR Admin'
    });

    console.log(`Month ${cfg.month} / ${cfg.year} successfully imported as batch ${batchId}!`);
  }

  // Verification of all 9 months
  console.log('\n======================================================');
  console.log('FINAL 9-MONTH ATTENDANCE VERIFICATION SUMMARY');
  console.log('======================================================');

  for (let m = 1; m <= 9; m++) {
    const dailyCount = await Attendance.countDocuments({ month: m, year: 2026 });
    const summaryCount = await AttendanceMonthlySummary.countDocuments({ month: m, year: 2026 });
    const distinctStaff = await Attendance.distinct('employeeCode', { month: m, year: 2026 });
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    console.log(`${monthNames[m]} 2026 (Month ${m}): ${dailyCount} daily records | ${summaryCount} summaries | ${distinctStaff.length} distinct employees`);
  }

  const [finalUsers, finalEmps, finalDepts, finalRoles] = await Promise.all([
    User.countDocuments(),
    Employee.countDocuments(),
    Department.countDocuments(),
    Role.countDocuments()
  ]);

  console.log('\nMaster Data Integrity:');
  console.log(`Users: ${finalUsers} (Must be 82)`);
  console.log(`Employees: ${finalEmps} (Must be 91)`);
  console.log(`Departments: ${finalDepts} (Must be 20)`);
  console.log(`Roles: ${finalRoles} (Must be 8)`);

  process.exit(0);
}

runImport().catch(err => {
  console.error(err);
  process.exit(1);
});
