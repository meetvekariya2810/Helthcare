require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Role = require('../models/Role');
const Attendance = require('../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../models/hrms/AttendanceImportBatch');

async function verifyCompleteIntegration() {
  await connectDB();
  console.log('=====================================================');
  console.log('  BJK HEALTHCARE: SEPTEMBER 2026 VERIFICATION AUDIT  ');
  console.log('=====================================================\n');

  let allPassed = true;
  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  [PASS] ${msg}`);
    } else {
      console.error(`  [FAIL] ${msg}`);
      allPassed = false;
    }
  };

  // TEST 1: Database Integrity & Master Isolation
  console.log('--- TEST 1: MASTER DATA INTEGRITY & ISOLATION ---');
  const [usersCount, deptsCount, rolesCount, employeesCount] = await Promise.all([
    User.countDocuments({}),
    Department.countDocuments({}),
    Role.countDocuments({}),
    Employee.countDocuments({})
  ]);
  assert(usersCount === 82, `User Collection count: ${usersCount} (Expected: 82)`);
  assert(deptsCount === 20, `Department Collection count: ${deptsCount} (Expected: 20)`);
  assert(rolesCount === 8, `Role Collection count: ${rolesCount} (Expected: 8)`);
  assert(employeesCount === 91, `Employee Master Collection count: ${employeesCount} (Expected: 91)`);

  // TEST 2: August 2026 Protection
  console.log('\n--- TEST 2: AUGUST 2026 DATA INTEGRITY (100% UNTOUCHED) ---');
  const [augustSummaries, augustDaily] = await Promise.all([
    AttendanceMonthlySummary.find({ month: 8, year: 2026 }).lean(),
    Attendance.find({ month: 8, year: 2026 }).lean()
  ]);
  assert(augustSummaries.length === 47, `August Summaries count: ${augustSummaries.length} (Expected: 47)`);
  assert(augustDaily.length === 1129, `August Daily Records count: ${augustDaily.length} (Expected: 1,129)`);

  // TEST 3: September 2026 Dataset Verification
  console.log('\n--- TEST 3: SEPTEMBER 2026 ATTENDANCE INTEGRATION ---');
  const [septemberSummaries, septemberDaily, septemberBatch] = await Promise.all([
    AttendanceMonthlySummary.find({ month: 9, year: 2026 }).lean(),
    Attendance.find({ month: 9, year: 2026 }).lean(),
    AttendanceImportBatch.findOne({ month: 9, year: 2026, status: 'IMPORTED' }).lean()
  ]);
  assert(septemberSummaries.length === 51, `September Summaries count: ${septemberSummaries.length} (Expected: 51)`);
  assert(septemberDaily.length === 1530, `September Daily Records count: ${septemberDaily.length} (Expected: 1,530 = 51 x 30)`);
  assert(!!septemberBatch, `Active September Batch exists: ${septemberBatch?.importBatchId}`);

  // TEST 4: Day-Column Verification (1 to 30)
  console.log('\n--- TEST 4: DAILY ATTENDANCE COLUMNS (1 - 30) ---');
  const distinctDays = await Attendance.distinct('attendanceDate', { month: 9, year: 2026 });
  distinctDays.sort();
  assert(distinctDays.length === 30, `Total unique September days: ${distinctDays.length} (Expected: 30)`);
  assert(distinctDays[0] === '2026-09-01', `First day is: ${distinctDays[0]}`);
  assert(distinctDays[29] === '2026-09-30', `Last day is: ${distinctDays[29]}`);

  // TEST 5: Source of Truth Values & Code Preservation (BH1022 - Dixita Makwana)
  console.log('\n--- TEST 5: SPOT CHECK EMPLOYEE 1 (BH1022 - Dixita Makwana) ---');
  const emp22Summary = await AttendanceMonthlySummary.findOne({ employeeCode: 'BH1022', month: 9, year: 2026 }).lean();
  const emp22Daily = await Attendance.find({ employeeCode: 'BH1022', month: 9, year: 2026 }).sort({ attendanceDate: 1 }).lean();

  assert(emp22Summary?.present === 24.5, `Present: ${emp22Summary?.present} (Expected: 24.5)`);
  assert(emp22Summary?.weeklyOff === 3.0, `Weekly Off: ${emp22Summary?.weeklyOff} (Expected: 3.0)`);
  assert(emp22Summary?.publicHoliday === 1.0, `Public Holiday: ${emp22Summary?.publicHoliday} (Expected: 1.0)`);
  assert(emp22Summary?.sickLeave === 0.5, `Sick Leave: ${emp22Summary?.sickLeave} (Expected: 0.5)`);
  assert(emp22Summary?.compensatoryOff === 1.0, `Compensatory Off: ${emp22Summary?.compensatoryOff} (Expected: 1.0)`);
  assert(emp22Summary?.absentPayDays === 30.0, `A.Pay Days: ${emp22Summary?.absentPayDays} (Expected: 30.0)`);
  assert(emp22Summary?.totalDays === 30.0, `Total Days: ${emp22Summary?.totalDays} (Expected: 30.0)`);

  assert(emp22Daily[0]?.attendanceStatus === 'SL1/2', `Day 1 Status preserved: ${emp22Daily[0]?.attendanceStatus} (Expected: SL1/2)`);
  assert(emp22Daily[3]?.attendanceStatus === 'PH', `Day 4 Status preserved: ${emp22Daily[3]?.attendanceStatus} (Expected: PH)`);
  assert(emp22Daily[18]?.attendanceStatus === 'CO', `Day 19 Status preserved: ${emp22Daily[18]?.attendanceStatus} (Expected: CO)`);
  assert(emp22Daily[29]?.attendanceStatus === 'P', `Day 30 Status preserved: ${emp22Daily[29]?.attendanceStatus} (Expected: P)`);

  // TEST 6: Spot Check Employee 49 (Renish Suvagiya - Admin)
  console.log('\n--- TEST 6: SPOT CHECK EMPLOYEE 49 (Renish Suvagiya - Admin) ---');
  const renishSummary = await AttendanceMonthlySummary.findOne({ sourceEmployeeName: /Renish Suvagiya/i, month: 9, year: 2026 }).lean();
  const renishDaily = await Attendance.find({ sourceEmployeeName: /Renish Suvagiya/i, month: 9, year: 2026 }).sort({ attendanceDate: 1 }).lean();

  assert(!!renishSummary, `Renish Suvagiya summary exists`);
  assert(renishSummary?.sourceDepartment === 'Admin', `Department: ${renishSummary?.sourceDepartment} (Expected: Admin)`);
  assert(renishSummary?.present === 21.0, `Present: ${renishSummary?.present} (Expected: 21.0)`);
  assert(renishSummary?.weeklyOff === 4.0, `Weekly Off: ${renishSummary?.weeklyOff} (Expected: 4.0)`);
  assert(renishSummary?.leaveWithoutPay === 5.0, `LWP: ${renishSummary?.leaveWithoutPay} (Expected: 5.0)`);
  assert(renishDaily.length === 30, `Renish Daily Records: ${renishDaily.length} (Expected: 30)`);
  assert(renishDaily[0]?.attendanceStatus === 'AB', `Renish Day 1 Status: ${renishDaily[0]?.attendanceStatus} (Expected: AB)`);
  assert(renishDaily[5]?.attendanceStatus === 'P', `Renish Day 6 Status: ${renishDaily[5]?.attendanceStatus} (Expected: P)`);

  // TEST 7: Spot Check Employee 51 (BH1083 - Ravindrasinh D. Thakor - QC)
  console.log('\n--- TEST 7: SPOT CHECK EMPLOYEE 51 (BH1083 - Ravindrasinh D. Thakor - QC) ---');
  const emp83Summary = await AttendanceMonthlySummary.findOne({ employeeCode: 'BH1083', month: 9, year: 2026 }).lean();
  const emp83Daily = await Attendance.find({ employeeCode: 'BH1083', month: 9, year: 2026 }).sort({ attendanceDate: 1 }).lean();

  assert(emp83Summary?.present === 5.0, `Present: ${emp83Summary?.present} (Expected: 5.0)`);
  assert(emp83Summary?.weeklyOff === 1.0, `WO: ${emp83Summary?.weeklyOff} (Expected: 1.0)`);
  assert(emp83Summary?.leaveWithoutPay === 24.0, `LWP: ${emp83Summary?.leaveWithoutPay} (Expected: 24.0)`);
  assert(emp83Daily.length === 30, `Daily Records: ${emp83Daily.length} (Expected: 30)`);
  assert(emp83Daily[24]?.attendanceStatus === 'P', `Day 25 Status: ${emp83Daily[24]?.attendanceStatus} (Expected: P)`);

  // TEST 8: Department Filter Tests
  console.log('\n--- TEST 8: DEPARTMENT FILTER INTEGRITY ---');
  const depts = await AttendanceMonthlySummary.aggregate([
    { $match: { month: 9, year: 2026 } },
    { $group: { _id: '$sourceDepartment', count: { $sum: 1 } } }
  ]);
  const deptMap = Object.fromEntries(depts.map(d => [d._id, d.count]));
  console.log('September Department Staff Breakdown:', deptMap);
  assert(deptMap['Production'] === 17, `Production: ${deptMap['Production']} employees (Expected: 17)`);
  assert(deptMap['QC'] === 12, `QC: ${deptMap['QC']} employees (Expected: 12)`);
  assert(deptMap['QA'] === 9, `QA: ${deptMap['QA']} employees (Expected: 9)`);
  assert(deptMap['Warehouse'] === 3, `Warehouse: ${deptMap['Warehouse']} employees (Expected: 3)`);
  assert(deptMap['HR & Admin'] === 2, `HR & Admin: ${deptMap['HR & Admin']} employees (Expected: 2)`);
  assert(deptMap['Engg.'] === 2, `Engg.: ${deptMap['Engg.']} employees (Expected: 2)`);
  assert(deptMap['QC Micro'] === 2, `QC Micro: ${deptMap['QC Micro']} employees (Expected: 2)`);
  assert(deptMap['Admin'] === 1, `Admin: ${deptMap['Admin']} employees (Expected: 1)`);
  assert(deptMap['Purchase'] === 1, `Purchase: ${deptMap['Purchase']} employees (Expected: 1)`);
  assert(deptMap['Accounts'] === 1, `Accounts: ${deptMap['Accounts']} employees (Expected: 1)`);
  assert(deptMap['BD'] === 1, `BD: ${deptMap['BD']} employees (Expected: 1)`);

  // TEST 9: Search Tests
  console.log('\n--- TEST 9: SEARCH INTEGRITY ---');
  const searchCode = await AttendanceMonthlySummary.find({ employeeCode: 'BH1022', month: 9, year: 2026 });
  assert(searchCode.length === 1 && searchCode[0].sourceEmployeeName === 'Dixita Jayantibhai Makwana', `Search 'BH1022' returned Dixita Jayantibhai Makwana`);

  const searchName = await AttendanceMonthlySummary.find({ sourceEmployeeName: /Dixita/i, month: 9, year: 2026 });
  assert(searchName.length === 1 && searchName[0].employeeCode === 'BH1022', `Search 'Dixita' returned BH1022`);

  const searchDept = await AttendanceMonthlySummary.find({ sourceDepartment: 'Production', month: 9, year: 2026 });
  assert(searchDept.length === 17, `Search 'Production' returned 17 employees`);

  console.log('\n=====================================================');
  if (allPassed) {
    console.log('  ALL SEPTEMBER 2026 VERIFICATION TESTS PASSED (100%) ');
  } else {
    console.log('  SOME VERIFICATION TESTS FAILED                    ');
  }
  console.log('=====================================================\n');

  process.exit(allPassed ? 0 : 1);
}

verifyCompleteIntegration().catch(err => {
  console.error(err);
  process.exit(1);
});
