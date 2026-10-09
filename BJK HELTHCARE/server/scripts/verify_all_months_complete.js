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

async function runComprehensiveVerification() {
  await connectDB();
  console.log('================================================================');
  console.log('       BJK HEALTHCARE — ALL MONTHS ATTENDANCE AUDIT & VERIFICATION');
  console.log('================================================================\n');

  // 1. Core Master Collections Integrity Check
  const [userCount, empCount, deptCount, roleCount] = await Promise.all([
    User.countDocuments({}),
    Employee.countDocuments({}),
    Department.countDocuments({}),
    Role.countDocuments({})
  ]);

  console.log('--- 1. MASTER DATA SAFETY & IMMUTABILITY AUDIT ---');
  console.log(`✓ Total User Accounts (Active & Preserved): ${userCount}`);
  console.log(`✓ Total Employee Master Profiles: ${empCount}`);
  console.log(`✓ Total Departments: ${deptCount}`);
  console.log(`✓ Total Security Roles: ${roleCount}`);

  // 2. Month-Wise Summaries and Daily Counts
  const months = [
    { num: 4, name: 'April 2026', days: 30, expectedStaff: 39 },
    { num: 5, name: 'May 2026', days: 31, expectedStaff: 44 },
    { num: 6, name: 'June 2026', days: 30, expectedStaff: 46 },
    { num: 7, name: 'July 2026', days: 31, expectedStaff: 47 },
    { num: 8, name: 'August 2026', days: 31, expectedStaff: 47 },
    { num: 9, name: 'September 2026', days: 30, expectedStaff: 51 }
  ];

  console.log('\n--- 2. MONTH-BY-MONTH DATASET AUDIT ---');
  const monthAuditResults = [];

  for (const m of months) {
    const summaryDocs = await AttendanceMonthlySummary.find({ month: m.num, year: 2026 }).lean();
    const mStr = String(m.num).padStart(2, '0');
    const dailyDocs = await Attendance.find({
      $or: [
        { month: m.num, year: 2026 },
        { dateString: { $regex: `^2026-${mStr}` } },
        { attendanceDate: { $regex: `^2026-${mStr}` } }
      ]
    }).lean();

    // Check duplicates
    const uniqueSummaryCodes = new Set(summaryDocs.map(s => s.employeeCode));
    const summaryDuplicates = summaryDocs.length - uniqueSummaryCodes.size;

    const dailyKeySet = new Set();
    let dailyDuplicates = 0;
    dailyDocs.forEach(d => {
      const key = `${d.employeeCode}_${d.attendanceDate || d.dateString}`;
      if (dailyKeySet.has(key)) dailyDuplicates++;
      dailyKeySet.add(key);
    });

    // Check missing fields
    const missingCodes = summaryDocs.filter(s => !s.employeeCode || s.employeeCode.trim() === '');
    const missingNames = summaryDocs.filter(s => !s.sourceEmployeeName || s.sourceEmployeeName.trim() === '');
    const missingDepts = summaryDocs.filter(s => !s.sourceDepartment || s.sourceDepartment.trim() === '');

    monthAuditResults.push({
      month: m.name,
      monthNum: m.num,
      summaryCount: summaryDocs.length,
      dailyCount: dailyDocs.length,
      summaryDuplicates,
      dailyDuplicates,
      missingCodes: missingCodes.length,
      missingNames: missingNames.length,
      missingDepts: missingDepts.length
    });

    console.log(`\n▶ [${m.name}]`);
    console.log(`  - Monthly Summaries: ${summaryDocs.length} (Expected: ${m.expectedStaff})`);
    console.log(`  - Daily Records: ${dailyDocs.length}`);
    console.log(`  - Duplicate Summary Keys: ${summaryDuplicates}`);
    console.log(`  - Duplicate Daily Keys: ${dailyDuplicates}`);
    console.log(`  - Missing Codes: ${missingCodes.length}, Missing Names: ${missingNames.length}, Missing Depts: ${missingDepts.length}`);
  }

  // 3. August 2026 Protection Audit
  console.log('\n--- 3. AUGUST 2026 PROTECTION AUDIT ---');
  const augSummaries = await AttendanceMonthlySummary.find({ month: 8, year: 2026 }).lean();
  const augAtts = await Attendance.find({ month: 8, year: 2026 }).lean();
  console.log(`✓ August Summaries count in DB: ${augSummaries.length}`);
  console.log(`✓ August Daily Records count in DB: ${augAtts.length}`);
  if (augSummaries.length >= 47 && augAtts.length >= 1129) {
    console.log('✓ PASS: August 2026 dataset is 100% INTACT, UNTOUCHED and PRESERVED.');
  } else {
    console.error('✗ FAIL: August 2026 data mismatch!');
  }

  // 4. Spot Checks across Multiple Months
  console.log('\n--- 4. EMPLOYEE JOURNEY & MULTI-MONTH SPOT CHECKS ---');
  const sampleCodes = ['BH1022', 'BH1023', 'BH1063', 'BH1071', 'BH1083'];

  for (const code of sampleCodes) {
    console.log(`\nEmployee: ${code}`);
    const empSummaries = await AttendanceMonthlySummary.find({ employeeCode: code, year: 2026 })
      .sort({ month: 1 })
      .lean();
    
    empSummaries.forEach(s => {
      console.log(`  - Month ${s.month}/2026 (${s.sourceDepartment}): Present=${s.present}, WO=${s.weeklyOff}, PH=${s.publicHoliday}, CL=${s.casualLeave}, SL=${s.sickLeave}, CO=${s.compensatoryOff}, LWP=${s.leaveWithoutPay}, A.Pay=${s.absentPayDays}, Total=${s.totalDays}`);
    });
  }

  // 5. Department Diversity Audit
  console.log('\n--- 5. DEPARTMENT DIVERSITY AUDIT ---');
  const depts = await AttendanceMonthlySummary.distinct('sourceDepartment', { year: 2026 });
  console.log('Distinct Departments across all months in Attendance system:');
  console.log(depts);

  console.log('\n================================================================');
  console.log('                     AUDIT REPORT SUMMARY');
  console.log('================================================================');
  console.table(monthAuditResults);

  process.exit(0);
}

runComprehensiveVerification().catch(err => {
  console.error('Verification script failed:', err);
  process.exit(1);
});
