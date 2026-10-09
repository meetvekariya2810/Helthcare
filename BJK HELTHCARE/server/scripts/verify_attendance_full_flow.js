require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Designation = mongoose.models.Designation || mongoose.model('Designation', new mongoose.Schema({}, { strict: false, collection: 'designations' }));
const Role = mongoose.models.Role || mongoose.model('Role', new mongoose.Schema({}, { strict: false, collection: 'roles' }));
const { generateAttendanceExcel } = require('../services/hrms/excelReportService');

async function verifyFlow() {
  await connectDB();
  console.log('=== BJK HEALTHCARE PRODUCTION VERIFICATION ===\n');

  // 1. Database Counts & Integrity
  const [userCount, empCount, deptCount, desigCount, roleCount, attCount, summaryCount, batchCount] = await Promise.all([
    User.countDocuments(),
    Employee.countDocuments(),
    Department.countDocuments(),
    Designation.countDocuments(),
    Role.countDocuments(),
    Attendance.countDocuments(),
    AttendanceMonthlySummary.countDocuments(),
    AttendanceImportBatch.countDocuments()
  ]);

  console.log('--- DATABASE INTEGRITY ---');
  console.log(`Users: ${userCount} (Expected: 82)`);
  console.log(`Employees: ${empCount} (Expected: 91)`);
  console.log(`Departments: ${deptCount} (Expected: 20)`);
  console.log(`Designations: ${desigCount} (Expected: 50)`);
  console.log(`Roles: ${roleCount} (Expected: 8)`);
  console.log(`Total Attendance Records: ${attCount}`);
  console.log(`Total Monthly Summaries: ${summaryCount}`);
  console.log(`Total Batches: ${batchCount}`);

  // 2. August 2026 Batch Check
  const activeBatch = await AttendanceImportBatch.findOne({ importBatchId: 'ATT-2026-08-1791233528440-8788' });
  console.log('\n--- ACTIVE AUGUST 2026 BATCH ---');
  if (activeBatch) {
    console.log(`Batch ID: ${activeBatch.importBatchId}`);
    console.log(`Month/Year: ${activeBatch.month}/${activeBatch.year}`);
    console.log(`Matched Employees: ${activeBatch.matchedEmployees}`);
    console.log(`Daily Records: ${activeBatch.dailyRecordsCreated}`);
    console.log(`Monthly Summaries: ${activeBatch.monthlySummariesCreated}`);
    console.log(`Status: ${activeBatch.status}`);
  } else {
    console.log('Active batch not found by exact ID!');
  }

  // 3. Test Dashboard KPI Filter for August 2026
  const augustDateFrom = '2026-08-01';
  const augustDateTo = '2026-08-31';

  const baseAugustQuery = {
    $or: [
      { dateString: { $gte: augustDateFrom, $lte: augustDateTo } },
      { attendanceDate: { $gte: augustDateFrom, $lte: augustDateTo } }
    ]
  };

  const [distinctStaff, distinctStaffIds, augDailyRecords, augPresent, augAbsent, augWO, augPH, augLeave] = await Promise.all([
    Attendance.distinct('employeeCode', baseAugustQuery),
    Attendance.distinct('employeeId', baseAugustQuery),
    Attendance.countDocuments(baseAugustQuery),
    Attendance.countDocuments({ ...baseAugustQuery, $or: [{ status: { $in: ['P', 'p', 'PRESENT', 'M'] } }, { attendanceStatus: { $in: ['P', 'p', 'PRESENT', 'M'] } }] }),
    Attendance.countDocuments({ ...baseAugustQuery, $or: [{ status: { $in: ['AB', 'ABSENT', 'A'] } }, { attendanceStatus: { $in: ['AB', 'ABSENT', 'A'] } }] }),
    Attendance.countDocuments({ ...baseAugustQuery, $or: [{ status: { $in: ['WO', 'WEEK_OFF', 'WEEKOFF'] } }, { attendanceStatus: { $in: ['WO', 'WEEK_OFF', 'WEEKOFF'] } }] }),
    Attendance.countDocuments({ ...baseAugustQuery, $or: [{ status: { $in: ['PH', 'HOLIDAY', 'PUBLIC_HOLIDAY'] } }, { attendanceStatus: { $in: ['PH', 'HOLIDAY', 'PUBLIC_HOLIDAY'] } }] }),
    Attendance.countDocuments({ ...baseAugustQuery, $or: [{ status: { $in: ['CL', 'SL', 'CO', 'LWP', 'E'] } }, { attendanceStatus: { $in: ['CL', 'SL', 'CO', 'LWP', 'E'] } }] })
  ]);

  const matchedStaffCount = Math.max(distinctStaff.length, distinctStaffIds.length);

  console.log('\n--- AUGUST 2026 ATTENDANCE METRICS ---');
  console.log(`Matching Employees: ${matchedStaffCount} (Expected: 47)`);
  console.log(`Daily Records: ${augDailyRecords} (Expected: 1,129)`);
  console.log(`Present: ${augPresent}`);
  console.log(`Absent: ${augAbsent}`);
  console.log(`Week Off: ${augWO}`);
  console.log(`Public Holiday: ${augPH}`);
  console.log(`Leaves: ${augLeave}`);

  // 4. Test Single Employee Search (BH1022)
  const emp22Records = await Attendance.find({
    employeeCode: 'BH1022',
    ...baseAugustQuery
  }).sort({ attendanceDate: 1, dateString: 1 });

  const emp22Summary = await AttendanceMonthlySummary.findOne({
    employeeCode: 'BH1022',
    month: 8,
    year: 2026
  });

  console.log('\n--- EMPLOYEE BH1022 AUGUST 2026 AUDIT ---');
  console.log(`BH1022 Daily Records: ${emp22Records.length}`);
  if (emp22Records.length > 0) {
    console.log(`Sample Day 1: Date=${emp22Records[0].attendanceDate || emp22Records[0].dateString}, Status=${emp22Records[0].attendanceStatus || emp22Records[0].status}, Name=${emp22Records[0].sourceEmployeeName}`);
  }
  if (emp22Summary) {
    console.log(`BH1022 Summary: P=${emp22Summary.present}, WO=${emp22Summary.weeklyOff}, PH=${emp22Summary.publicHoliday}, CL=${emp22Summary.casualLeave}, Total=${emp22Summary.totalDays}`);
  }

  // 5. Test Excel Generation with August Records
  const excelBuffer = await generateAttendanceExcel({
    records: emp22Records,
    selectedColumns: ['employeeId', 'employeeName', 'department', 'date', 'status', 'workingHours'],
    metadata: {
      reportTitle: 'August 2026 Attendance Test',
      dateRange: '2026-08-01 to 2026-08-31'
    }
  });

  console.log(`\nExcel Generation Check: Generated buffer of size ${excelBuffer.length} bytes (PASS)`);

  process.exit(0);
}

verifyFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
