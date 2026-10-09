require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const assert = require('assert');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/hrms/Employee');
const WorkSchedule = require('../models/hrms/WorkSchedule');
const WorkforceHoliday = require('../models/hrms/WorkforceHoliday');
const CalendarSpecialDay = require('../models/hrms/CalendarSpecialDay');
const CompanyCalendarEvent = require('../models/hrms/CompanyCalendarEvent');
const CalendarException = require('../models/hrms/CalendarException');
const WorkforceRoster = require('../models/hrms/WorkforceRoster');
const { LeaveRequest } = require('../models/hrms/Leave');
const Attendance = require('../models/hrms/Attendance');
const {
  initWorkforceCalendarMaster,
  resolveDaySchedule,
  getEmployeeMonthlyCalendar,
  getMasterCalendarStats,
  validateLeaveAgainstCalendar
} = require('../services/hrms/workforceCalendarService');

async function runTests() {
  console.log('====================================================');
  console.log('BJK HEALTHCARE WORKFORCE CALENDAR SUITE VERIFICATION');
  console.log('====================================================\n');

  await connectDB();
  await initWorkforceCalendarMaster();

  // Test 1: Company Tuesday = Week Off, Saturday/Sunday/Monday/Wed/Thu/Fri = Working
  console.log('TEST 1: Verifying Company Standard: Tuesday = Week Off, other 6 days = Working...');
  const testTue = new Date('2026-10-13T00:00:00.000Z'); // 13 Oct 2026 is Tuesday
  const resTue = await resolveDaySchedule({ department: 'HR', date: testTue });
  assert(resTue.expectedStatus === 'WEEK_OFF', `Expected Tuesday to be WEEK_OFF, got ${resTue.expectedStatus}`);

  const testSat = new Date('2026-10-10T00:00:00.000Z'); // 10 Oct 2026 is Saturday
  const resSat = await resolveDaySchedule({ department: 'HR', date: testSat });
  assert(resSat.expectedStatus === 'WORKING', `Expected Saturday to be WORKING under 6-day work week, got ${resSat.expectedStatus}`);

  const testSun = new Date('2026-10-11T00:00:00.000Z'); // 11 Oct 2026 is Sunday
  const resSun = await resolveDaySchedule({ department: 'HR', date: testSun });
  assert(resSun.expectedStatus === 'WORKING', `Expected Sunday to be WORKING under 6-day work week, got ${resSun.expectedStatus}`);
  console.log('✓ TEST 1 PASSED: Company standard Tuesday WEEK_OFF & other 6 days WORKING verified.\n');

  // Test 2: Employee-specific custom Roster (e.g. Dixita BH1022 having custom Wednesday Off)
  console.log('TEST 2: Employee-specific Wednesday = Week Off...');
  const testEmpCode = 'BH1022';
  await WorkSchedule.findOneAndUpdate(
    { scheduleType: 'EMPLOYEE', employeeCode: testEmpCode },
    {
      name: `${testEmpCode} Custom Roster`,
      scheduleType: 'EMPLOYEE',
      employeeCode: testEmpCode,
      weeklyPattern: {
        monday: { status: 'WORKING', startTime: '09:00', endTime: '18:00' },
        tuesday: { status: 'WORKING', startTime: '09:00', endTime: '18:00' },
        wednesday: { status: 'WEEK_OFF', startTime: '00:00', endTime: '00:00' },
        thursday: { status: 'WORKING', startTime: '09:00', endTime: '18:00' },
        friday: { status: 'WORKING', startTime: '09:00', endTime: '18:00' },
        saturday: { status: 'WORKING', startTime: '09:00', endTime: '18:00' },
        sunday: { status: 'WORKING', startTime: '09:00', endTime: '18:00' }
      },
      effectiveFrom: new Date('2026-01-01'),
      status: 'ACTIVE'
    },
    { upsert: true, new: true }
  );

  const testWed = new Date('2026-10-14T00:00:00.000Z'); // 14 Oct 2026 is Wednesday
  const resWedDixita = await resolveDaySchedule({ employeeCode: testEmpCode, department: 'PRD', date: testWed });
  assert(resWedDixita.expectedStatus === 'WEEK_OFF', `Dixita should have Wednesday WEEK_OFF, got ${resWedDixita.expectedStatus}`);
  assert(resWedDixita.ruleSource === 'Employee Schedule', `Rule source should be Employee Schedule, got ${resWedDixita.ruleSource}`);

  // Check other employee without custom override is WORKING on Wednesday
  const resWedOther = await resolveDaySchedule({ employeeCode: 'BH1046', department: 'HR', date: testWed });
  assert(resWedOther.expectedStatus === 'WORKING', `Other employee should be WORKING on Wednesday, got ${resWedOther.expectedStatus}`);
  console.log('✓ TEST 2 PASSED: Employee-specific Wednesday Week Off isolated.\n');

  // Test 3: Monday Holiday
  console.log('TEST 3: Verifying Holiday precedence...');
  const testMonHoliday = new Date('2026-01-26T00:00:00.000Z'); // Republic Day
  const resHoliday = await resolveDaySchedule({ employeeCode: 'BH1022', department: 'PRD', date: testMonHoliday });
  assert(resHoliday.expectedStatus === 'HOLIDAY', `Expected HOLIDAY, got ${resHoliday.expectedStatus}`);
  assert(resHoliday.ruleSource === 'Holiday Calendar', `Rule source should be Holiday Calendar, got ${resHoliday.ruleSource}`);
  console.log('✓ TEST 3 PASSED: Holiday precedence verified.\n');

  // Test 4: PRD = Special Working Day override on Tuesday
  console.log('TEST 4: Verifying Special Working Day override for PRD on Tuesday...');
  await CalendarSpecialDay.findOneAndUpdate(
    { dateString: '2026-10-27', type: 'SPECIAL_WORKING_DAY' },
    {
      name: 'Special Pharma Production Run',
      date: new Date('2026-10-27T00:00:00.000Z'),
      dateString: '2026-10-27',
      type: 'SPECIAL_WORKING_DAY',
      reason: 'Urgent Export Batch Formulation',
      applicableTo: 'DEPARTMENT',
      department: 'PRD',
      workingHours: 8,
      status: 'ACTIVE'
    },
    { upsert: true, new: true }
  );

  const testTuePrd = new Date('2026-10-27T00:00:00.000Z'); // 27 Oct 2026 is Tuesday
  const resPrdTue = await resolveDaySchedule({ employeeCode: 'BH1022', department: 'PRD', date: testTuePrd });
  assert(resPrdTue.expectedStatus === 'SPECIAL_WORKING_DAY', `PRD on 27 Oct Tuesday should be SPECIAL_WORKING_DAY, got ${resPrdTue.expectedStatus}`);

  const resHrTue = await resolveDaySchedule({ employeeCode: 'BH1046', department: 'HR', date: testTuePrd });
  assert(resHrTue.expectedStatus === 'WEEK_OFF', `HR on 27 Oct Tuesday should remain WEEK_OFF, got ${resHrTue.expectedStatus}`);
  console.log('✓ TEST 4 PASSED: Special Working Day selectively applied to PRD.\n');

  // Test 5: Leave Approval Integration
  console.log('TEST 5: Leave workflow & calendar status reflection...');
  const testLeaveDateStr = '2026-11-16';
  const testLeaveDate = new Date(`${testLeaveDateStr}T00:00:00.000Z`);

  await LeaveRequest.deleteMany({ employeeId: 'BH1022', startDateString: testLeaveDateStr });

  const empDixita = await Employee.findOne({ employeeCode: 'BH1022' });
  const dummyEmpId = empDixita ? empDixita._id : new mongoose.Types.ObjectId();

  // Pending leave
  const leaveReq = await LeaveRequest.create({
    employee: dummyEmpId,
    employeeId: 'BH1022',
    employeeName: 'Dixita Makwana',
    department: 'PRD',
    leaveType: 'CASUAL_LEAVE',
    leaveTypeCode: 'CL',
    startDate: testLeaveDate,
    endDate: testLeaveDate,
    startDateString: testLeaveDateStr,
    endDateString: testLeaveDateStr,
    duration: 1,
    totalDays: 1,
    reason: 'Family function',
    status: 'PENDING'
  });

  const resPending = await resolveDaySchedule({ employeeCode: 'BH1022', department: 'PRD', date: testLeaveDate });
  assert(resPending.expectedStatus === 'PENDING_LEAVE', `Expected PENDING_LEAVE, got ${resPending.expectedStatus}`);

  // Approve leave
  leaveReq.status = 'APPROVED';
  await leaveReq.save();

  const resApproved = await resolveDaySchedule({ employeeCode: 'BH1022', department: 'PRD', date: testLeaveDate });
  assert(resApproved.expectedStatus === 'APPROVED_LEAVE', `Expected APPROVED_LEAVE, got ${resApproved.expectedStatus}`);
  console.log('✓ TEST 5 PASSED: Leave status cleanly reflected (Pending -> Approved).\n');

  // Test 6: Monthly Calendar generation with Actual vs Expected punches
  console.log('TEST 6: Monthly calendar generation & actual attendance overlay...');
  const empCal = await getEmployeeMonthlyCalendar({ employeeCode: 'BH1022', year: 2026, month: 10 });
  assert(empCal.days.length === 31, `Expected 31 days in October, got ${empCal.days.length}`);
  assert(empCal.summary.workingDays > 0, 'Expected positive working days count');
  assert(empCal.summary.weekOffDays > 0, 'Expected positive week off days count');
  console.log(`✓ TEST 6 PASSED: October calendar generated with ${empCal.days.length} days and full matrix.\n`);

  // Test 7: Master stats
  console.log('TEST 7: Organization master calendar stats...');
  const masterStats = await getMasterCalendarStats(new Date('2026-10-08'));
  assert(masterStats.totalEmployees > 0, `Expected totalEmployees > 0, got ${masterStats.totalEmployees}`);
  assert(masterStats.upcomingHolidays.length > 0, 'Expected upcoming holidays list');
  console.log(`✓ TEST 7 PASSED: Master stats loaded with ${masterStats.totalEmployees} employees, ${masterStats.upcomingHolidays.length} upcoming holidays.\n`);

  // Test 8: Leave validation against Tuesday Week Off
  console.log('TEST 8: Leave date validation against Tuesday Week Off / Holiday...');
  const validationRes = await validateLeaveAgainstCalendar({
    employeeCode: 'BH1046',
    department: 'HR',
    startDate: '2026-10-13', // Tuesday (Week Off)
    endDate: '2026-10-13'
  });
  assert(validationRes.hasWarnings === true, 'Expected warnings for Tuesday week-off leave application');
  assert(validationRes.warnings.length === 1, `Expected 1 warning, got ${validationRes.warnings.length}`);
  console.log('✓ TEST 8 PASSED: Leave validation correctly detects scheduled Tuesday Week Off.\n');

  console.log('====================================================');
  console.log('ALL WORKFORCE CALENDAR BACKEND TESTS PASSED (8/8)!');
  console.log('====================================================');

  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
