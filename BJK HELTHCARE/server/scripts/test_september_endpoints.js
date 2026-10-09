require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectDB } = require('../config/db');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');

async function testEndpoints() {
  await connectDB();
  console.log('=== VERIFYING ATTENDANCE DATA & MONTH SELECTION ===\n');

  // 1. Month 8 (August 2026)
  const augSummaries = await AttendanceMonthlySummary.find({ month: 8, year: 2026 }).lean();
  const augDaily = await Attendance.find({ month: 8, year: 2026 }).lean();
  console.log(`[August 2026]: Summaries = ${augSummaries.length}, Daily Records = ${augDaily.length}`);

  // 2. Month 9 (September 2026)
  const sepSummaries = await AttendanceMonthlySummary.find({ month: 9, year: 2026 }).lean();
  const sepDaily = await Attendance.find({ month: 9, year: 2026 }).lean();
  console.log(`[September 2026]: Summaries = ${sepSummaries.length}, Daily Records = ${sepDaily.length}`);

  // 3. Employee Search Tests: BH1022 (Dixita Makwana)
  const emp22Aug = await AttendanceMonthlySummary.findOne({ employeeCode: 'BH1022', month: 8, year: 2026 }).lean();
  const emp22Sep = await AttendanceMonthlySummary.findOne({ employeeCode: 'BH1022', month: 9, year: 2026 }).lean();
  const emp22SepDaily = await Attendance.find({ employeeCode: 'BH1022', month: 9, year: 2026 }).sort({ attendanceDate: 1 }).lean();

  console.log('\n--- BH1022 (Dixita Jayantibhai Makwana) ---');
  console.log('August Summary:', { Present: emp22Aug?.present, WO: emp22Aug?.weeklyOff, Total: emp22Aug?.totalDays });
  console.log('September Summary:', {
    Present: emp22Sep?.present,
    WO: emp22Sep?.weeklyOff,
    PH: emp22Sep?.publicHoliday,
    CL: emp22Sep?.casualLeave,
    SL: emp22Sep?.sickLeave,
    CO: emp22Sep?.compensatoryOff,
    LWP: emp22Sep?.leaveWithoutPay,
    APay: emp22Sep?.absentPayDays,
    Total: emp22Sep?.totalDays
  });
  console.log(`September Daily Days Count: ${emp22SepDaily.length} (Expected: 30)`);
  console.log('Day 1:', emp22SepDaily[0]?.attendanceDate, emp22SepDaily[0]?.attendanceStatus, '(Expected SL1/2)');
  console.log('Day 4:', emp22SepDaily[3]?.attendanceDate, emp22SepDaily[3]?.attendanceStatus, '(Expected PH)');
  console.log('Day 30:', emp22SepDaily[29]?.attendanceDate, emp22SepDaily[29]?.attendanceStatus, '(Expected P)');

  // 4. Employee 49 (Renish Suvagiya - Admin)
  const renishSep = await AttendanceMonthlySummary.findOne({ sourceEmployeeName: /Renish Suvagiya/i, month: 9, year: 2026 }).lean();
  const renishDaily = await Attendance.find({ sourceEmployeeName: /Renish Suvagiya/i, month: 9, year: 2026 }).lean();
  console.log('\n--- Employee 49: Renish Suvagiya ---');
  console.log('September Summary:', {
    Name: renishSep?.sourceEmployeeName,
    Dept: renishSep?.sourceDepartment,
    Code: renishSep?.employeeCode,
    Present: renishSep?.present,
    WO: renishSep?.weeklyOff,
    LWP: renishSep?.leaveWithoutPay,
    APay: renishSep?.absentPayDays,
    Total: renishSep?.totalDays
  });
  console.log(`Renish Daily Records Count: ${renishDaily.length} (Expected: 30)`);

  // 5. Department Breakdown for September 2026
  const depts = await AttendanceMonthlySummary.aggregate([
    { $match: { month: 9, year: 2026 } },
    { $group: { _id: '$sourceDepartment', count: { $sum: 1 }, totalPresent: { $sum: '$present' } } },
    { $sort: { count: -1 } }
  ]);
  console.log('\n--- September 2026 Department Breakdown ---');
  depts.forEach(d => console.log(`  ${d._id}: ${d.count} employees, Total Present: ${d.totalPresent}`));

  process.exit(0);
}

testEndpoints().catch(err => {
  console.error(err);
  process.exit(1);
});
