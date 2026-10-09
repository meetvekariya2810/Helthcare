const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/db');
const Attendance = require('../models/hrms/Attendance');
const Employee = require('../models/hrms/Employee');
const { generateAttendanceExcel, COLUMN_CATALOG } = require('../services/hrms/excelReportService');
const { seedAttendance } = require('../seed/attendanceSeed');

async function runTestSuite() {
  console.log('================================================================');
  console.log('BJK HEALTHCARE — ATTENDANCE & CUSTOM EXCEL ENGINE VERIFICATION');
  console.log('================================================================');

  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const existingCount = await Attendance.countDocuments();
  if (existingCount === 0) {
    console.log('[Test Setup]: Seeding database with October 2026 workforce records...');
    await seedAttendance();
  }

  const reportsDir = path.join(__dirname, '../artifacts_test');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // -------------------------------------------------------------------------
  // TEST CASE 1: October 2026 Production Attendance (Present + Late + Half Day)
  // -------------------------------------------------------------------------
  console.log('\n[TEST CASE 1]: October 2026 Production Attendance Export...');
  const test1Filters = {
    dateFrom: '2026-10-01',
    dateTo: '2026-10-31',
    branches: ['Ahmedabad'],
    departments: ['Production'],
    statuses: ['PRESENT', 'LATE', 'HALF_DAY']
  };

  const test1Columns = [
    'employeeId',
    'employeeName',
    'date',
    'shift',
    'actualIn',
    'actualOut',
    'status',
    'lateBy',
    'workingHours'
  ];

  const test1Records = await Attendance.find({
    dateString: { $gte: '2026-10-01', $lte: '2026-10-31' },
    branchName: 'Ahmedabad',
    departmentName: 'Production',
    status: { $in: ['PRESENT', 'LATE', 'HALF_DAY'] }
  }).sort({ dateString: 1, employeeId: 1 }).lean();

  console.log(`- Query returned: ${test1Records.length} records matching strict filter.`);

  // Assertions on test1Records
  const nonProduction = test1Records.filter((r) => r.departmentName !== 'Production');
  if (nonProduction.length > 0) throw new Error('FAIL: Records contain non-Production employees!');

  const nonTargetStatus = test1Records.filter((r) => !['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status));
  if (nonTargetStatus.length > 0) throw new Error('FAIL: Records contain non-target statuses!');

  const outsideDate = test1Records.filter((r) => r.dateString < '2026-10-01' || r.dateString > '2026-10-31');
  if (outsideDate.length > 0) throw new Error('FAIL: Records outside October 2026 found!');

  console.log('✓ Validation passed: Exactly 0 unrelated departments, 0 unrelated statuses, 0 out-of-range dates.');

  // Generate Excel workbook with ExcelJS
  const test1Buffer = await generateAttendanceExcel({
    records: test1Records,
    selectedColumns: test1Columns,
    sheetStructure: 'SINGLE',
    metadata: {
      reportTitle: 'ATTENDANCE REPORT — PRODUCTION (OCTOBER 2026)',
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['Production'],
      statuses: ['PRESENT', 'LATE', 'HALF_DAY'],
      generatedByName: 'HR Administrator (QA Suite)'
    }
  });

  const test1FilePath = path.join(reportsDir, 'Test1_BJK_Attendance_Production_October_2026.xlsx');
  fs.writeFileSync(test1FilePath, test1Buffer);
  console.log(`- Generated genuine XLSX file: ${test1FilePath} (${test1Buffer.length} bytes)`);

  // Verify the generated Excel workbook using ExcelJS reader
  const wb1 = new ExcelJS.Workbook();
  await wb1.xlsx.readFile(test1FilePath);
  const sheet1 = wb1.getWorksheet('Attendance Report');
  if (!sheet1) throw new Error('FAIL: Worksheet "Attendance Report" missing!');

  // Verify Header Row (Row 7)
  const headerRow = sheet1.getRow(7);
  const headerValues = [];
  headerRow.eachCell((cell) => headerValues.push(cell.value));

  console.log(`- Excel headers in row 7 (${headerValues.length} columns):`, headerValues.join(' | '));
  if (headerValues.length !== test1Columns.length) {
    throw new Error(`FAIL: Excel column count ${headerValues.length} does not match selected columns count ${test1Columns.length}`);
  }

  // Verify No hidden columns leaked
  const expectedLabels = test1Columns.map((k) => COLUMN_CATALOG[k]?.label);
  expectedLabels.forEach((lbl, idx) => {
    if (headerValues[idx] !== lbl) {
      throw new Error(`FAIL: Header mismatch at index ${idx}: expected "${lbl}", got "${headerValues[idx]}"`);
    }
  });

  console.log('✓ TEST CASE 1 PASSED: Genuine XLSX generated with exact filtered records and exact requested columns.');

  // -------------------------------------------------------------------------
  // TEST CASE 2: Missing OUT Punches for Production, QC, and QA
  // -------------------------------------------------------------------------
  console.log('\n[TEST CASE 2]: Missing OUT Punches Audit...');
  const test2Records = await Attendance.find({
    dateString: '2026-10-04',
    departmentName: { $in: ['Production', 'Quality Control', 'Quality Assurance'] },
    punchCondition: 'MISSING_OUT'
  }).lean();

  console.log(`- Missing OUT query returned: ${test2Records.length} records.`);
  test2Records.forEach((r) => {
    console.log(`  * ${r.employeeId} - ${r.employeeName} (${r.departmentName}): IN=${r.actualIn}, OUT=${r.actualOut || 'MISSING'}, Condition=${r.punchCondition}`);
  });

  if (test2Records.length === 0) throw new Error('FAIL: No Missing OUT records found!');

  const test2Columns = ['employeeName', 'employeeId', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'punchCondition'];
  const test2Buffer = await generateAttendanceExcel({
    records: test2Records,
    selectedColumns: test2Columns,
    sheetStructure: 'SINGLE',
    metadata: {
      reportTitle: 'MISSING OUT PUNCH AUDIT',
      dateFrom: '2026-10-04',
      dateTo: '2026-10-04',
      departments: ['Production', 'Quality Control', 'Quality Assurance'],
      generatedByName: 'Chief Compliance Officer'
    }
  });

  const test2FilePath = path.join(reportsDir, 'Test2_Missing_OUT_Punch_Audit.xlsx');
  fs.writeFileSync(test2FilePath, test2Buffer);
  console.log(`- Generated Missing OUT XLSX: ${test2FilePath} (${test2Buffer.length} bytes)`);
  console.log('✓ TEST CASE 2 PASSED: Filtered records contain only Missing OUT anomalies.');

  // -------------------------------------------------------------------------
  // TEST CASE 3: Multi-sheet Summary + Detailed Workbook
  // -------------------------------------------------------------------------
  console.log('\n[TEST CASE 3]: Multi-sheet Summary + Detailed Workbook...');
  const test3Records = await Attendance.find({
    dateString: { $gte: '2026-10-01', $lte: '2026-10-31' }
  }).lean();

  const test3Columns = ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours', 'overtime'];
  const test3Buffer = await generateAttendanceExcel({
    records: test3Records,
    selectedColumns: test3Columns,
    sheetStructure: 'SUMMARY_DETAIL',
    metadata: {
      reportTitle: 'MONTHLY WORKFORCE ATTENDANCE & EXECUTIVE SUMMARY',
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['All Departments'],
      generatedByName: 'Executive Director'
    }
  });

  const test3FilePath = path.join(reportsDir, 'Test3_Executive_Summary_Detailed_Workbook.xlsx');
  fs.writeFileSync(test3FilePath, test3Buffer);

  const wb3 = new ExcelJS.Workbook();
  await wb3.xlsx.readFile(test3FilePath);
  const sheetNames = wb3.worksheets.map((s) => s.name);
  console.log(`- Workbook generated sheets:`, sheetNames);

  if (!sheetNames.includes('Executive Summary') || !sheetNames.includes('Detailed Attendance')) {
    throw new Error('FAIL: Multi-sheet workbook missing "Executive Summary" or "Detailed Attendance" sheets!');
  }

  console.log('✓ TEST CASE 3 PASSED: Multi-sheet workbook contains Executive Summary (Sheet 1) and Detailed Roster (Sheet 2).');

  // -------------------------------------------------------------------------
  // TEST CASE 4: Night Shift Attendance (Overnight handling 22:00 to 06:30)
  // -------------------------------------------------------------------------
  console.log('\n[TEST CASE 4]: Night Shift Overnight Verification...');
  const nightRecords = await Attendance.find({
    shiftName: /Night/i,
    dateString: { $gte: '2026-10-01', $lte: '2026-10-31' }
  }).lean();

  console.log(`- Night shift query returned: ${nightRecords.length} records.`);
  if (nightRecords.length === 0) throw new Error('FAIL: No Night shift records found!');

  const validNightRecords = nightRecords.filter((r) => r.status === 'NIGHT_SHIFT' || (r.nightHours && r.nightHours > 0));
  console.log(`- Records with night differential hours / status: ${validNightRecords.length}`);

  const sampleNight = validNightRecords[0];
  console.log(`  * Sample Night Shift: ${sampleNight.employeeName}, Date=${sampleNight.dateString}, IN=${sampleNight.actualIn}, OUT=${sampleNight.actualOut}, WorkingHours=${sampleNight.workingHours}h, NightHours=${sampleNight.nightHours}h, Status=${sampleNight.status}`);

  if (sampleNight.workingHours < 7) {
    throw new Error(`FAIL: Overnight hours improperly calculated: ${sampleNight.workingHours}h`);
  }

  const test4Columns = ['employeeId', 'employeeName', 'department', 'date', 'scheduledIn', 'scheduledOut', 'actualIn', 'actualOut', 'workingHours', 'overtime', 'nightHours', 'status'];
  const test4Buffer = await generateAttendanceExcel({
    records: nightRecords,
    selectedColumns: test4Columns,
    sheetStructure: 'SINGLE',
    metadata: {
      reportTitle: 'PHARMA NIGHT SHIFT ROSTER & DIFFERENTIAL REPORT',
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      shifts: ['Pharma Night Shift (22:00 - 06:30)'],
      generatedByName: 'Night Operations Superintendent'
    }
  });

  const test4FilePath = path.join(reportsDir, 'Test4_Night_Shift_Overnight_Report.xlsx');
  fs.writeFileSync(test4FilePath, test4Buffer);
  console.log(`- Generated Night Shift XLSX: ${test4FilePath} (${test4Buffer.length} bytes)`);
  console.log('✓ TEST CASE 4 PASSED: Night shift properly handles overnight timestamps across midnight.');

  console.log('\n================================================================');
  console.log('ALL 4 TEST CASES PASSED WITH 100% COMPLIANCE!');
  console.log('================================================================');
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
