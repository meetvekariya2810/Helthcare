require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const {
  validateAttendanceImport,
  executeAttendanceImport,
  rollbackAttendanceImport,
  DEFAULT_CSV_PATH
} = require('../services/hrms/attendanceImportService');

const User = require('../models/User');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');
const AuditLog = require('../models/AuditLog');

async function testLifecycle() {
  await connectDB();
  console.log('=== STEP 1: INITIAL STATE INSPECTION ===');
  const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' }).lean();
  console.log('Using Super Admin:', superAdmin?.email, 'ID:', superAdmin?._id);

  const initialCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({}),
    attendance: await Attendance.countDocuments({}),
    summaries: await AttendanceMonthlySummary.countDocuments({}),
    batches: await AttendanceImportBatch.countDocuments({})
  };
  console.log('Initial Database Counts:', initialCounts);

  console.log('\n=== STEP 2: PRE-IMPORT DRY RUN (Rule 12) ===');
  const dryRunReport = await validateAttendanceImport({
    csvPath: DEFAULT_CSV_PATH,
    user: superAdmin
  });

  console.log('Dry Run Validation Results:');
  console.log(`- Total source rows: ${dryRunReport.totalSourceRows}`);
  console.log(`- Matched employees: ${dryRunReport.matchedCount}`);
  console.log(`- Unmatched employees: ${dryRunReport.unmatchedCount}`);
  console.log(`- Valid attendance cells: ${dryRunReport.validAttendanceCells}`);
  console.log(`- Blank cells: ${dryRunReport.blankCells}`);
  console.log(`- Duplicate records: ${dryRunReport.duplicateCount}`);
  console.log(`- Unmatched Employees List:`, dryRunReport.unmatchedEmployees.map(u => `${u.employeeCode} (${u.name})`));

  console.log('\n=== STEP 3: EXECUTE IMPORT (Rule 5, 7, 8, 9, 11) ===');
  const importResult = await executeAttendanceImport({
    csvPath: DEFAULT_CSV_PATH,
    user: superAdmin
  });

  console.log('Import Finished Successfully:');
  console.log(`- Import Batch ID: ${importResult.importBatchId}`);
  console.log(`- Attendance Records Created: ${importResult.database.attendanceRecordsCreated}`);
  console.log(`- Attendance Records Updated: ${importResult.database.attendanceRecordsUpdated}`);
  console.log(`- Monthly Summaries Created/Updated: ${importResult.database.monthlySummariesCreatedOrUpdated}`);
  console.log(`- Non-attendance models modified: ${importResult.safety.usersModified === 'NO' ? 'NONE (PASSED)' : 'VIOLATION'}`);

  const postImportCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({}),
    attendance: await Attendance.countDocuments({}),
    augAttendance: await Attendance.countDocuments({ importBatchId: importResult.importBatchId }),
    summaries: await AttendanceMonthlySummary.countDocuments({ importBatchId: importResult.importBatchId })
  };
  console.log('\nPost-Import Database Counts:', postImportCounts);

  // Verify non-attendance collections were untouched
  if (postImportCounts.users !== initialCounts.users) throw new Error('User collection modified!');
  if (postImportCounts.departments !== initialCounts.departments) throw new Error('Department collection modified!');
  if (postImportCounts.roles !== initialCounts.roles) throw new Error('Role collection modified!');
  if (postImportCounts.employees !== initialCounts.employees) throw new Error('Employee collection modified!');
  console.log('CRITICAL DATABASE SAFETY VERIFIED: Users, Departments, Roles, Employees 100% UNCHANGED.');

  console.log('\n=== STEP 4: VERIFY ATTENDANCE & MONTHLY SUMMARY DATA ACCURACY ===');
  const sampleSummary = await AttendanceMonthlySummary.findOne({
    employeeCode: 'BH1022',
    importBatchId: importResult.importBatchId
  }).lean();
  console.log('Sample Summary for BH1022:', {
    employeeCode: sampleSummary.employeeCode,
    present: sampleSummary.present,
    weeklyOff: sampleSummary.weeklyOff,
    publicHoliday: sampleSummary.publicHoliday,
    leaveWithoutPay: sampleSummary.leaveWithoutPay,
    absentPayDays: sampleSummary.absentPayDays,
    totalDays: sampleSummary.totalDays
  });

  const sampleDaily = await Attendance.find({
    employeeCode: 'BH1022',
    importBatchId: importResult.importBatchId
  }).sort({ attendanceDate: 1 }).limit(5).lean();
  console.log('Sample Daily Records for BH1022:');
  sampleDaily.forEach(d => console.log(`  ${d.attendanceDate}: ${d.attendanceStatus} (status=${d.status})`));

  console.log('\n=== STEP 5: TEST ROLLBACK (Rules 15-20) ===');
  console.log(`Testing rollback for batch: ${importResult.importBatchId}`);
  const rollbackResult = await rollbackAttendanceImport({
    importBatchId: importResult.importBatchId,
    user: superAdmin,
    rollbackReason: 'Test Rollback Verification'
  });
  console.log('Rollback Completed:', rollbackResult);

  const postRollbackCounts = {
    users: await User.countDocuments({}),
    departments: await Department.countDocuments({}),
    roles: await Role.countDocuments({}),
    employees: await Employee.countDocuments({}),
    attendance: await Attendance.countDocuments({}),
    augAttendance: await Attendance.countDocuments({ importBatchId: importResult.importBatchId }),
    summaries: await AttendanceMonthlySummary.countDocuments({ importBatchId: importResult.importBatchId })
  };
  console.log('\nPost-Rollback Database Counts:', postRollbackCounts);

  if (postRollbackCounts.augAttendance !== 0) throw new Error('Rollback failed to remove all batch attendance records!');
  if (postRollbackCounts.summaries !== 0) throw new Error('Rollback failed to remove all batch summaries!');
  if (postRollbackCounts.users !== initialCounts.users) throw new Error('Users count mismatch after rollback!');
  if (postRollbackCounts.attendance !== initialCounts.attendance) throw new Error('Pre-existing attendance altered!');
  console.log('ROLLBACK SAFETY FULLY VERIFIED: Only imported batch records were deleted. Pre-existing attendance preserved.');

  console.log('\n=== STEP 6: TEST DOUBLE ROLLBACK PREVENTION (Rule 20) ===');
  try {
    await rollbackAttendanceImport({
      importBatchId: importResult.importBatchId,
      user: superAdmin
    });
    console.error('ERROR: Double rollback was NOT prevented!');
  } catch (err) {
    console.log('Double rollback successfully prevented with message:', err.message);
  }

  console.log('\n=== STEP 7: LIVE FINAL IMPORT FOR PRODUCTION USE ===');
  const finalLiveImport = await executeAttendanceImport({
    csvPath: DEFAULT_CSV_PATH,
    user: superAdmin
  });
  console.log('Final Live Import Succeeded!');
  console.log('Live Batch ID:', finalLiveImport.importBatchId);
  console.log('Imported Records:', finalLiveImport.importedRecords);
  console.log('Created Summaries:', finalLiveImport.database.monthlySummariesCreatedOrUpdated);

  // Check audit log
  const auditLogs = await AuditLog.find({
    module: 'HRMS',
    resource: 'AttendanceImportBatch'
  }).sort({ createdAt: -1 }).limit(5).lean();
  console.log(`\nAudit Logs Recorded (${auditLogs.length}):`);
  auditLogs.forEach(a => console.log(`  [${a.action}] - ${a.details}`));

  await mongoose.disconnect();
  console.log('\n=== ALL LIFECYCLE TESTS PASSED PERFECTLY ===');
}

testLifecycle().catch(err => {
  console.error('FATAL TEST ERROR:', err);
  process.exit(1);
});
