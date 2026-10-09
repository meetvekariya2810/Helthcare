const mongoose = require('mongoose');
const WorkSchedule = require('../../models/hrms/WorkSchedule');
const WorkforceHoliday = require('../../models/hrms/WorkforceHoliday');
const CalendarSpecialDay = require('../../models/hrms/CalendarSpecialDay');
const CompanyCalendarEvent = require('../../models/hrms/CompanyCalendarEvent');
const CalendarException = require('../../models/hrms/CalendarException');
const WorkforceRoster = require('../../models/hrms/WorkforceRoster');
const Shift = require('../../models/hrms/Shift');
const { LeaveRequest, HolidayCalendar } = require('../../models/hrms/Leave');
const Attendance = require('../../models/hrms/Attendance');
const Employee = require('../../models/hrms/Employee');
const AuditLog = require('../../models/AuditLog');

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * Format date object to YYYY-MM-DD
 */
function toDateString(d) {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Initialize Default Company Calendar, Standard Shifts, Holidays, and Events
 */
async function initWorkforceCalendarMaster() {
  try {
    // 1. Ensure Standard Shifts
    const standardShifts = [
      { name: 'General Shift', code: 'GEN', type: 'General', startTime: '09:00', endTime: '18:00', totalDurationHours: 9, gracePeriodMinutes: 15, breakDurationMinutes: 60 },
      { name: 'Morning Shift', code: 'MORN', type: 'Morning', startTime: '06:00', endTime: '14:00', totalDurationHours: 8, gracePeriodMinutes: 15, breakDurationMinutes: 30 },
      { name: 'Evening Shift', code: 'EVE', type: 'Evening', startTime: '14:00', endTime: '22:00', totalDurationHours: 8, gracePeriodMinutes: 15, breakDurationMinutes: 30 },
      { name: 'Night Shift', code: 'NGT', type: 'Night', startTime: '22:00', endTime: '06:00', totalDurationHours: 8, gracePeriodMinutes: 15, breakDurationMinutes: 30, nightRule: { isNightShift: true, differentialAllowanceRate: 250 } }
    ];

    for (const s of standardShifts) {
      await Shift.findOneAndUpdate({ code: s.code }, { $setOnInsert: s }, { upsert: true, new: true });
    }

    // 2. Ensure Company Default WorkSchedule (BJK Healthcare Standard: Tuesday Week Off, 6 Days Working)
    await WorkSchedule.findOneAndUpdate(
      { scheduleType: 'COMPANY' },
      {
        name: 'BJK Healthcare Master Company Schedule (Tuesday Week Off, 6-Day Week On)',
        scheduleType: 'COMPANY',
        department: 'ALL',
        weeklyPattern: {
          monday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          tuesday: { status: 'WEEK_OFF', startTime: '00:00', endTime: '00:00', workingHours: 0 },
          wednesday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          thursday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          friday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          saturday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          sunday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }
        },
        effectiveFrom: new Date('2026-01-01'),
        version: 'BJK-2026-V1',
        isPublished: true,
        status: 'ACTIVE',
        notes: 'BJK Healthcare standard organization-wide policy: Tuesday scheduled Week Off, other 6 days Week On.'
      },
      { upsert: true, new: true }
    );
    console.log('[WorkforceCalendar] Company Master Schedule (Tuesday Week Off, 6 Days Working) initialized.');

    // 3. Ensure PRD / Manufacturing 6-Day Department Schedule (Mon-Sat Working, Sunday Off)
    const existingPrdSchedule = await WorkSchedule.findOne({ scheduleType: 'DEPARTMENT', department: 'PRD', status: 'ACTIVE' });
    if (!existingPrdSchedule) {
      await WorkSchedule.create({
        name: 'Production & Manufacturing (PRD) 6-Day Operational Schedule',
        scheduleType: 'DEPARTMENT',
        department: 'PRD',
        weeklyPattern: {
          monday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          tuesday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          wednesday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          thursday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          friday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          saturday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
          sunday: { status: 'WEEK_OFF', startTime: '00:00', endTime: '00:00', workingHours: 0 }
        },
        effectiveFrom: new Date('2026-01-01'),
        version: 'BJK-PRD-2026-V1',
        isPublished: true,
        status: 'ACTIVE',
        notes: 'Production operations running on 6-day work week.'
      });
      console.log('[WorkforceCalendar] PRD Department Schedule initialized.');
    }

    // 4. Seed Official 2026 Workforce Holidays
    const defaultHolidays = [
      { name: 'Republic Day', dateString: '2026-01-26', year: 2026, type: 'NATIONAL_HOLIDAY', description: 'National Republic Day' },
      { name: 'Maha Shivratri', dateString: '2026-02-15', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Maha Shivratri' },
      { name: 'Holi (Dhuleti)', dateString: '2026-03-04', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Festival of Colors' },
      { name: 'Good Friday', dateString: '2026-04-03', year: 2026, type: 'PUBLIC_HOLIDAY', description: 'Good Friday' },
      { name: 'Dr. B.R. Ambedkar Jayanti', dateString: '2026-04-14', year: 2026, type: 'NATIONAL_HOLIDAY', description: 'Ambedkar Jayanti' },
      { name: 'Gujarat Day / Labour Day', dateString: '2026-05-01', year: 2026, type: 'PUBLIC_HOLIDAY', description: 'State Formation Day & May Day' },
      { name: 'Independence Day', dateString: '2026-08-15', year: 2026, type: 'NATIONAL_HOLIDAY', description: 'Indian Independence Day' },
      { name: 'Raksha Bandhan', dateString: '2026-08-28', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Raksha Bandhan' },
      { name: 'Janmashtami', dateString: '2026-09-04', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Lord Krishna Birthday' },
      { name: 'Mahatma Gandhi Jayanti', dateString: '2026-10-02', year: 2026, type: 'NATIONAL_HOLIDAY', description: 'Gandhi Jayanti' },
      { name: 'Dussehra (Vijayadashami)', dateString: '2026-10-20', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Vijayadashami' },
      { name: 'Diwali (Deepavali)', dateString: '2026-11-08', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Deepavali' },
      { name: 'Vikram Samvat New Year', dateString: '2026-11-09', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Gujarati New Year' },
      { name: 'Bhai Dooj', dateString: '2026-11-10', year: 2026, type: 'FESTIVAL_HOLIDAY', description: 'Bhai Dooj' },
      { name: 'Christmas Day', dateString: '2026-12-25', year: 2026, type: 'PUBLIC_HOLIDAY', description: 'Christmas Day' }
    ];

    for (const h of defaultHolidays) {
      await WorkforceHoliday.findOneAndUpdate(
        { dateString: h.dateString, name: h.name },
        {
          $setOnInsert: {
            ...h,
            date: new Date(`${h.dateString}T00:00:00.000Z`),
            applicableTo: 'ALL',
            department: 'ALL',
            status: 'ACTIVE'
          }
        },
        { upsert: true, new: true }
      );
    }

    // 5. Seed Official Company Events & Celebrations
    const defaultEvents = [
      {
        title: 'BJK Healthcare Annual Quality & Safety Town Hall',
        dateString: '2026-03-20',
        date: new Date('2026-03-20T00:00:00.000Z'),
        startTime: '10:00',
        endTime: '13:00',
        type: 'TOWN_HALL',
        category: 'EVENT',
        location: 'Main Auditorium / Campus',
        description: 'Annual corporate review, GMP quality awards, and workforce safety updates.',
        applicableTo: 'ALL',
        department: 'ALL'
      },
      {
        title: 'BJK Foundation Day Celebration',
        dateString: '2026-06-15',
        date: new Date('2026-06-15T00:00:00.000Z'),
        startTime: '15:00',
        endTime: '19:00',
        type: 'FOUNDATION_DAY',
        category: 'CELEBRATION',
        location: 'Executive Lawn & Auditorium',
        description: 'BJK Healthcare corporate anniversary, cultural functions, and milestone awards.',
        applicableTo: 'ALL',
        department: 'ALL'
      },
      {
        title: 'Annual Employee Health Checkup Camp',
        dateString: '2026-07-10',
        date: new Date('2026-07-10T00:00:00.000Z'),
        startTime: '09:00',
        endTime: '17:00',
        type: 'MEDICAL_CAMP',
        category: 'EVENT',
        location: 'Occupational Health Center (OHC)',
        description: 'Comprehensive occupational health and fitness checkups for all plant and office employees.',
        applicableTo: 'ALL',
        department: 'ALL'
      },
      {
        title: 'National Pharmacist Day Celebration',
        dateString: '2026-09-25',
        date: new Date('2026-09-25T00:00:00.000Z'),
        startTime: '14:00',
        endTime: '17:00',
        type: 'FESTIVAL_CELEBRATION',
        category: 'CELEBRATION',
        location: 'R&D / QC Seminar Hall',
        description: 'Honoring BJK Healthcare formulation, QC, QA, and production professionals.',
        applicableTo: 'ALL',
        department: 'ALL'
      },
      {
        title: 'Q4 cGMP Compliance & Data Integrity Workshop',
        dateString: '2026-11-20',
        date: new Date('2026-11-20T00:00:00.000Z'),
        startTime: '10:00',
        endTime: '16:00',
        type: 'COMPLIANCE_TRAINING',
        category: 'TRAINING',
        location: 'Training Hall 1',
        description: 'Refresher training on USFDA 21 CFR Part 11 and WHO-GMP data integrity standards.',
        applicableTo: 'ALL',
        department: 'ALL'
      }
    ];

    for (const ev of defaultEvents) {
      await CompanyCalendarEvent.findOneAndUpdate(
        { title: ev.title, dateString: ev.dateString },
        { $setOnInsert: ev },
        { upsert: true, new: true }
      );
    }

    console.log('[WorkforceCalendar] Master Workforce Calendar initialized successfully.');
  } catch (err) {
    console.warn('[WorkforceCalendar] Initialization note:', err.message);
  }
}

/**
 * Resolve the expected status and schedule for a given employee on a specific date.
 * PRIORITY ENGINE:
 * 1. Employee-specific Calendar Exception
 * 2. Approved Leave
 * 3. Special Working Day
 * 4. Special Holiday / Configured Workforce Holiday
 * 5. Pending Leave
 * 6. Employee-specific WorkSchedule
 * 7. Employee-specific WorkforceRoster
 * 8. Department-specific WorkSchedule
 * 9. Company Default WorkSchedule
 */
async function resolveDaySchedule({ employeeCode, department, date }) {
  const dateObj = new Date(date);
  const dateStr = toDateString(dateObj);
  const dayName = DAY_NAMES[dateObj.getUTCDay() !== undefined ? dateObj.getDay() : 0];

  // 1. Employee-specific Calendar Exception
  if (employeeCode) {
    const exception = await CalendarException.findOne({
      employeeId: employeeCode.toUpperCase().trim(),
      dateString: dateStr,
      status: 'ACTIVE'
    });
    if (exception) {
      return {
        expectedStatus: exception.newStatus,
        ruleSource: 'Employee Exception',
        reason: exception.reason,
        shiftName: exception.shiftName || 'Custom Shift',
        startTime: '09:00',
        endTime: '18:00',
        workingHours: exception.newStatus === 'WEEK_OFF' ? 0 : 9,
        isWorkDay: exception.newStatus !== 'WEEK_OFF' && exception.newStatus !== 'SPECIAL_HOLIDAY'
      };
    }
  }

  // 2. Approved Leave from Leave system
  if (employeeCode) {
    const approvedLeave = await LeaveRequest.findOne({
      employeeId: employeeCode.toUpperCase().trim(),
      status: { $in: ['APPROVED', 'HR_APPROVED', 'SANCTIONED', 'APPROVED_BY_HR'] },
      $or: [
        { startDateString: { $lte: dateStr }, endDateString: { $gte: dateStr } },
        { fromDateString: { $lte: dateStr }, toDateString: { $gte: dateStr } }
      ]
    });
    if (approvedLeave) {
      return {
        expectedStatus: 'APPROVED_LEAVE',
        ruleSource: 'Approved Leave',
        leaveType: approvedLeave.leaveType || approvedLeave.leaveTypeCode || 'LEAVE',
        reason: approvedLeave.reason || 'Approved Leave',
        shiftName: 'On Leave',
        startTime: '00:00',
        endTime: '00:00',
        workingHours: 0,
        isWorkDay: false
      };
    }
  }

  // 3. Special Working Day (Override weekend/holiday for specified Dept / Employees / All)
  const specialWorkingDay = await CalendarSpecialDay.findOne({
    dateString: dateStr,
    type: 'SPECIAL_WORKING_DAY',
    status: 'ACTIVE',
    $or: [
      { applicableTo: 'ALL' },
      { applicableTo: 'DEPARTMENT', department: { $in: [department, 'ALL'] } },
      { applicableTo: 'EMPLOYEES', employeeCodes: employeeCode ? employeeCode.toUpperCase().trim() : 'NONE' }
    ]
  });
  if (specialWorkingDay) {
    return {
      expectedStatus: 'SPECIAL_WORKING_DAY',
      ruleSource: 'Special Working Day',
      name: specialWorkingDay.name,
      reason: specialWorkingDay.reason,
      shiftName: specialWorkingDay.shiftName || 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      workingHours: specialWorkingDay.workingHours || 8,
      isWorkDay: true
    };
  }

  // 4. Special Holiday or Workforce Holiday
  const specialHoliday = await CalendarSpecialDay.findOne({
    dateString: dateStr,
    type: 'SPECIAL_HOLIDAY',
    status: 'ACTIVE',
    $or: [
      { applicableTo: 'ALL' },
      { applicableTo: 'DEPARTMENT', department: { $in: [department, 'ALL'] } },
      { applicableTo: 'EMPLOYEES', employeeCodes: employeeCode ? employeeCode.toUpperCase().trim() : 'NONE' }
    ]
  });
  if (specialHoliday) {
    return {
      expectedStatus: 'SPECIAL_HOLIDAY',
      ruleSource: 'Special Holiday',
      name: specialHoliday.name,
      reason: specialHoliday.reason,
      shiftName: 'Holiday',
      startTime: '00:00',
      endTime: '00:00',
      workingHours: 0,
      isWorkDay: false
    };
  }

  const holiday = await WorkforceHoliday.findOne({
    dateString: dateStr,
    status: 'ACTIVE',
    $or: [
      { applicableTo: 'ALL' },
      { applicableTo: 'DEPARTMENT', department: { $in: [department, 'ALL'] } },
      { applicableTo: 'EMPLOYEES', employeeCodes: employeeCode ? employeeCode.toUpperCase().trim() : 'NONE' }
    ]
  });
  if (holiday) {
    return {
      expectedStatus: 'HOLIDAY',
      ruleSource: 'Holiday Calendar',
      name: holiday.name,
      holidayType: holiday.type,
      description: holiday.description,
      shiftName: 'Company Holiday',
      startTime: '00:00',
      endTime: '00:00',
      workingHours: 0,
      isWorkDay: false
    };
  }

  // Also check legacy HolidayCalendar as fallback
  const legacyHoliday = await HolidayCalendar.findOne({ dateString: dateStr, isActive: true });
  if (legacyHoliday) {
    return {
      expectedStatus: 'HOLIDAY',
      ruleSource: 'Holiday Calendar',
      name: legacyHoliday.name,
      holidayType: legacyHoliday.type,
      shiftName: 'Company Holiday',
      startTime: '00:00',
      endTime: '00:00',
      workingHours: 0,
      isWorkDay: false
    };
  }

  // 5. Pending Leave (Visual flag)
  if (employeeCode) {
    const pendingLeave = await LeaveRequest.findOne({
      employeeId: employeeCode.toUpperCase().trim(),
      status: { $in: ['PENDING', 'PENDING_APPROVAL', 'APPLIED', 'FORWARDED'] },
      $or: [
        { startDateString: { $lte: dateStr }, endDateString: { $gte: dateStr } },
        { fromDateString: { $lte: dateStr }, toDateString: { $gte: dateStr } }
      ]
    });
    if (pendingLeave) {
      return {
        expectedStatus: 'PENDING_LEAVE',
        ruleSource: 'Pending Leave Request',
        leaveType: pendingLeave.leaveType || 'LEAVE',
        reason: pendingLeave.reason || 'Pending Leave Application',
        shiftName: 'Pending Leave',
        startTime: '00:00',
        endTime: '00:00',
        workingHours: 0,
        isWorkDay: false
      };
    }
  }

  // 6. Employee-Specific WorkSchedule (Highest regular schedule priority)
  if (employeeCode) {
    const empSchedule = await WorkSchedule.findOne({
      scheduleType: 'EMPLOYEE',
      employeeCode: employeeCode.toUpperCase().trim(),
      status: 'ACTIVE',
      effectiveFrom: { $lte: dateObj },
      $or: [{ effectiveTo: null }, { effectiveTo: { $gte: dateObj } }]
    }).sort({ effectiveFrom: -1 });

    if (empSchedule && empSchedule.weeklyPattern && empSchedule.weeklyPattern[dayName]) {
      const dayConf = empSchedule.weeklyPattern[dayName];
      const status = dayConf.status || 'WORKING';
      return {
        expectedStatus: status,
        ruleSource: 'Employee Schedule',
        scheduleName: empSchedule.name,
        shiftName: dayConf.shiftName || empSchedule.shiftName || 'General Shift',
        startTime: dayConf.startTime || '09:00',
        endTime: dayConf.endTime || '18:00',
        workingHours: status === 'WEEK_OFF' ? 0 : (dayConf.workingHours || 9),
        isWorkDay: status !== 'WEEK_OFF'
      };
    }
  }

  // 7. Multi-week Workforce Roster (e.g. Week A / Week B)
  const activeRoster = await WorkforceRoster.findOne({
    status: 'ACTIVE',
    effectiveFrom: { $lte: dateObj },
    $or: [{ effectiveTo: null }, { effectiveTo: { $gte: dateObj } }],
    $or: [
      { applicableTo: 'ALL' },
      { applicableTo: 'DEPARTMENT', department: { $in: [department, 'ALL'] } },
      { applicableTo: 'EMPLOYEES', employeeCodes: employeeCode ? employeeCode.toUpperCase().trim() : 'NONE' }
    ]
  });

  if (activeRoster && activeRoster.weeks && activeRoster.weeks.length > 0) {
    // Calculate week cycle index
    const diffTime = Math.abs(dateObj - new Date(activeRoster.effectiveFrom));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = diffDays % (activeRoster.cycleLengthDays || 14);
    const weekIndex = Math.floor(cycleDay / 7) % activeRoster.weeks.length;
    const currentWeekConf = activeRoster.weeks[weekIndex];
    if (currentWeekConf && currentWeekConf.pattern && currentWeekConf.pattern[dayName]) {
      const dayVal = currentWeekConf.pattern[dayName];
      const isOff = dayVal === 'OFF' || dayVal === 'WEEK_OFF';
      return {
        expectedStatus: isOff ? 'WEEK_OFF' : 'WORKING',
        ruleSource: `Roster (${activeRoster.name} - Week ${weekIndex + 1})`,
        shiftName: activeRoster.shiftName || 'Roster Shift',
        startTime: isOff ? '00:00' : '09:00',
        endTime: isOff ? '00:00' : '18:00',
        workingHours: isOff ? 0 : 9,
        isWorkDay: !isOff
      };
    }
  }

  // 8. Department-Specific WorkSchedule
  if (department) {
    const deptSchedule = await WorkSchedule.findOne({
      scheduleType: 'DEPARTMENT',
      department: department.trim(),
      status: 'ACTIVE',
      effectiveFrom: { $lte: dateObj },
      $or: [{ effectiveTo: null }, { effectiveTo: { $gte: dateObj } }]
    }).sort({ effectiveFrom: -1 });

    if (deptSchedule && deptSchedule.weeklyPattern && deptSchedule.weeklyPattern[dayName]) {
      const dayConf = deptSchedule.weeklyPattern[dayName];
      const status = dayConf.status || 'WORKING';
      return {
        expectedStatus: status,
        ruleSource: 'Department Schedule',
        scheduleName: deptSchedule.name,
        shiftName: dayConf.shiftName || deptSchedule.shiftName || 'Department Shift',
        startTime: dayConf.startTime || '09:00',
        endTime: dayConf.endTime || '18:00',
        workingHours: status === 'WEEK_OFF' ? 0 : (dayConf.workingHours || 9),
        isWorkDay: status !== 'WEEK_OFF'
      };
    }
  }

  // 9. Company Default WorkSchedule
  const companySchedule = await WorkSchedule.findOne({
    scheduleType: 'COMPANY',
    status: 'ACTIVE',
    effectiveFrom: { $lte: dateObj },
    $or: [{ effectiveTo: null }, { effectiveTo: { $gte: dateObj } }]
  }).sort({ effectiveFrom: -1 });

  if (companySchedule && companySchedule.weeklyPattern && companySchedule.weeklyPattern[dayName]) {
    const dayConf = companySchedule.weeklyPattern[dayName];
    const status = dayConf.status || (dayName === 'tuesday' ? 'WEEK_OFF' : 'WORKING');
    return {
      expectedStatus: status,
      ruleSource: 'Company Default',
      scheduleName: companySchedule.name,
      shiftName: dayConf.shiftName || companySchedule.shiftName || 'General Shift (09:00 - 18:00)',
      startTime: dayConf.startTime || (status === 'WEEK_OFF' ? '00:00' : '09:00'),
      endTime: dayConf.endTime || (status === 'WEEK_OFF' ? '00:00' : '18:00'),
      workingHours: status === 'WEEK_OFF' ? 0 : (dayConf.workingHours || 9),
      isWorkDay: status !== 'WEEK_OFF'
    };
  }

  // Standard Fallback if no records found: Tuesday is standard Week Off, other 6 days Working
  const isTuesday = dayName === 'tuesday';
  return {
    expectedStatus: isTuesday ? 'WEEK_OFF' : 'WORKING',
    ruleSource: 'Company Default',
    shiftName: isTuesday ? 'Scheduled Rest Day' : 'General Shift (09:00 - 18:00)',
    startTime: isTuesday ? '00:00' : '09:00',
    endTime: isTuesday ? '00:00' : '18:00',
    workingHours: isTuesday ? 0 : 9,
    isWorkDay: !isTuesday
  };
}

/**
 * Get monthly employee calendar overlaid with actual attendance punches and events
 */
async function getEmployeeMonthlyCalendar({ employeeCode, year, month }) {
  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || (new Date().getMonth() + 1);

  const empCode = employeeCode ? employeeCode.toUpperCase().trim() : '';
  const employee = await Employee.findOne({ employeeCode: empCode });
  const department = employee ? employee.department : 'ALL';

  const daysInMonth = new Date(y, m, 0).getDate();
  const calendarDays = [];

  // Batch load events for the month
  const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
  const endStr = `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const monthEvents = await CompanyCalendarEvent.find({
    dateString: { $gte: startStr, $lte: endStr },
    status: 'SCHEDULED',
    $or: [
      { applicableTo: 'ALL' },
      { applicableTo: 'DEPARTMENT', department: { $in: [department, 'ALL'] } },
      { applicableTo: 'EMPLOYEES', employeeCodes: empCode }
    ]
  }).sort({ startTime: 1 });

  // Batch load attendance records for this employee in this month
  const attendanceRecords = await Attendance.find({
    $or: [
      { employeeCode: empCode },
      { employeeId: empCode },
      { employeeId: employee ? employee._id : null }
    ],
    $or: [
      { dateString: { $gte: startStr, $lte: endStr } },
      { date: { $gte: new Date(`${startStr}T00:00:00.000Z`), $lte: new Date(`${endStr}T23:59:59.999Z`) } }
    ]
  });

  const attendanceMap = new Map();
  for (const att of attendanceRecords) {
    const key = att.dateString || toDateString(att.date);
    attendanceMap.set(key, att);
  }

  // Pre-load all employee schedules and holidays for high performance
  for (let d = 1; d <= daysInMonth; d++) {
    const curDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const curDate = new Date(`${curDateStr}T00:00:00.000Z`);

    const expected = await resolveDaySchedule({
      employeeCode: empCode,
      department,
      date: curDate
    });

    const dayEvents = monthEvents.filter(ev => ev.dateString === curDateStr);
    const actualAtt = attendanceMap.get(curDateStr);

    let actualStatus = null;
    let punchIn = null;
    let punchOut = null;
    let totalWorkHours = 0;

    if (actualAtt) {
      actualStatus = actualAtt.status || (actualAtt.punchIn ? 'PRESENT' : 'NO_PUNCH');
      punchIn = actualAtt.punchIn || actualAtt.firstPunchIn || null;
      punchOut = actualAtt.punchOut || actualAtt.lastPunchOut || null;
      totalWorkHours = actualAtt.totalWorkHours || actualAtt.workingHours || 0;
    }

    // Comparison classification (Expected vs Actual)
    let classification = expected.expectedStatus;
    if (actualAtt && actualAtt.punchIn) {
      if (expected.expectedStatus === 'WEEK_OFF') {
        classification = 'WORKED_ON_WEEK_OFF';
      } else if (expected.expectedStatus === 'HOLIDAY' || expected.expectedStatus === 'SPECIAL_HOLIDAY') {
        classification = 'WORKED_ON_HOLIDAY';
      } else {
        classification = actualStatus;
      }
    }

    calendarDays.push({
      date: curDate,
      dateString: curDateStr,
      dayNumber: d,
      dayName: DAY_NAMES[curDate.getDay()],
      expectedStatus: expected.expectedStatus,
      ruleSource: expected.ruleSource,
      shiftName: expected.shiftName,
      startTime: expected.startTime,
      endTime: expected.endTime,
      workingHours: expected.workingHours,
      isWorkDay: expected.isWorkDay,
      reason: expected.reason || expected.name || '',
      events: dayEvents,
      actualAttendance: actualAtt ? {
        status: actualStatus,
        punchIn,
        punchOut,
        totalWorkHours,
        isLate: actualAtt.isLate || false,
        isEarlyLeaving: actualAtt.isEarlyLeaving || false
      } : null,
      classification
    });
  }

  return {
    year: y,
    month: m,
    employee: employee ? {
      _id: employee._id,
      employeeCode: employee.employeeCode,
      name: employee.fullName || `${employee.firstName} ${employee.lastName}`.trim(),
      department: employee.department,
      designation: employee.designation
    } : { employeeCode: empCode, department },
    days: calendarDays,
    summary: {
      totalDays: daysInMonth,
      workingDays: calendarDays.filter(d => d.expectedStatus === 'WORKING' || d.expectedStatus === 'SPECIAL_WORKING_DAY').length,
      weekOffDays: calendarDays.filter(d => d.expectedStatus === 'WEEK_OFF').length,
      holidays: calendarDays.filter(d => d.expectedStatus === 'HOLIDAY' || d.expectedStatus === 'SPECIAL_HOLIDAY').length,
      approvedLeaves: calendarDays.filter(d => d.expectedStatus === 'APPROVED_LEAVE').length,
      pendingLeaves: calendarDays.filter(d => d.expectedStatus === 'PENDING_LEAVE').length,
      eventsCount: monthEvents.length
    }
  };
}

/**
 * Get company-wide monthly calendar with live daily statistics from DB
 */
async function getCompanyMonthlyCalendar({ year, month, department }) {
  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || (new Date().getMonth() + 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
  const endStr = `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const deptFilter = department && department !== 'ALL' ? { department } : {};
  const totalEmployees = await Employee.countDocuments({ status: { $ne: 'TERMINATED' }, ...deptFilter });
  const activeShiftsCount = await Shift.countDocuments({ isActive: true });

  // 1. Fetch holidays
  const holidays = await WorkforceHoliday.find({
    dateString: { $gte: startStr, $lte: endStr },
    status: 'ACTIVE',
    ...(department && department !== 'ALL' ? { $or: [{ applicableTo: 'ALL' }, { department: { $in: [department, 'ALL'] } }] } : {})
  });

  // 2. Fetch special days
  const specialDays = await CalendarSpecialDay.find({
    dateString: { $gte: startStr, $lte: endStr },
    status: 'ACTIVE',
    ...(department && department !== 'ALL' ? { $or: [{ applicableTo: 'ALL' }, { department: { $in: [department, 'ALL'] } }] } : {})
  });

  // 3. Fetch events
  const events = await CompanyCalendarEvent.find({
    dateString: { $gte: startStr, $lte: endStr },
    status: 'SCHEDULED',
    ...(department && department !== 'ALL' ? { $or: [{ applicableTo: 'ALL' }, { department: { $in: [department, 'ALL'] } }] } : {})
  });

  // 4. Fetch work schedule
  const companySchedule = await WorkSchedule.findOne({ scheduleType: 'COMPANY', status: 'ACTIVE' });
  const deptSchedule = department && department !== 'ALL' ? await WorkSchedule.findOne({ scheduleType: 'DEPARTMENT', department, status: 'ACTIVE' }) : null;
  const appliedSchedule = deptSchedule || companySchedule;
  const weeklyPattern = appliedSchedule?.weeklyPattern || {};

  // 5. Fetch actual attendance for this month from DB
  const attendanceRecords = await Attendance.find({
    dateString: { $gte: startStr, $lte: endStr }
  });

  const attendanceByDate = new Map();
  for (const att of attendanceRecords) {
    if (!attendanceByDate.has(att.dateString)) {
      attendanceByDate.set(att.dateString, []);
    }
    attendanceByDate.get(att.dateString).push(att);
  }

  // 6. Fetch approved leave requests spanning this month
  const approvedLeaves = await LeaveRequest.find({
    status: { $in: ['APPROVED', 'HR_APPROVED', 'SANCTIONED', 'APPROVED_BY_HR'] },
    $or: [
      { startDateString: { $lte: endStr }, endDateString: { $gte: startStr } },
      { fromDateString: { $lte: endStr }, toDateString: { $gte: startStr } }
    ]
  });

  // Build accurate dailyStats array
  const dailyStats = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const curDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const curDate = new Date(`${curDateStr}T00:00:00.000Z`);
    const dayName = DAY_NAMES[curDate.getUTCDay() !== undefined ? curDate.getDay() : 0];

    const hol = holidays.find(h => h.dateString === curDateStr);
    const spec = specialDays.find(s => s.dateString === curDateStr);
    const dayEvents = events.filter(e => e.dateString === curDateStr);

    let status = 'WORKING';
    if (hol) {
      status = 'HOLIDAY';
    } else if (spec) {
      status = spec.type || 'SPECIAL_WORKING_DAY';
    } else if (weeklyPattern[dayName]?.status === 'WEEK_OFF' || (!weeklyPattern[dayName] && dayName === 'tuesday')) {
      status = 'WEEK_OFF';
    }

    // Check leaves on this date
    const leavesOnDate = approvedLeaves.filter(l => {
      const sDate = l.startDateString || l.fromDateString || '';
      const eDate = l.endDateString || l.toDateString || '';
      return sDate <= curDateStr && eDate >= curDateStr;
    });

    const dayAtts = attendanceByDate.get(curDateStr) || [];

    let workingCount = 0;
    let leaveCount = leavesOnDate.length;
    let weekOffCount = 0;
    let shiftsCount = activeShiftsCount || 3;

    if (dayAtts.length > 0) {
      // Historical live attendance data logged in system
      const presentAtts = dayAtts.filter(a => a.punchIn || a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
      const absentAtts = dayAtts.filter(a => a.status === 'ABSENT' || a.status === 'ON_LEAVE' || a.status === 'LEAVE').length;
      const weekOffAtts = dayAtts.filter(a => a.status === 'WEEK_OFF').length;

      workingCount = presentAtts;
      leaveCount = Math.max(leaveCount, absentAtts);
      weekOffCount = weekOffAtts;
    } else {
      // Scheduled / Policy calculation for dates without punches
      if (status === 'HOLIDAY') {
        workingCount = 0;
        leaveCount = 0;
        weekOffCount = 0;
        shiftsCount = 0;
      } else if (status === 'WEEK_OFF') {
        workingCount = 0;
        weekOffCount = totalEmployees;
        leaveCount = 0;
        shiftsCount = 0;
      } else {
        // Working Day
        workingCount = Math.max(0, totalEmployees - leaveCount);
        weekOffCount = 0;
      }
    }

    dailyStats.push({
      dateString: curDateStr,
      dayNumber: d,
      dayName,
      status,
      holiday: hol || null,
      specialDay: spec || null,
      events: dayEvents,
      workingCount,
      leaveCount,
      weekOffCount,
      shiftsCount,
      totalEmployees
    });
  }

  return {
    year: y,
    month: m,
    daysInMonth,
    department: department || 'ALL',
    totalEmployees,
    holidays,
    specialDays,
    events,
    appliedSchedule,
    dailyStats
  };
}

/**
 * Get organization-wide master statistics for today
 */
async function getMasterCalendarStats(queryDate = new Date()) {
  const dateObj = new Date(queryDate);
  const dateStr = toDateString(dateObj);
  const dayName = DAY_NAMES[dateObj.getUTCDay() !== undefined ? dateObj.getDay() : 0];

  const totalEmployees = await Employee.countDocuments({ status: { $ne: 'TERMINATED' } });
  
  // Pending leaves
  const pendingLeavesCount = await LeaveRequest.countDocuments({
    status: { $in: ['PENDING', 'PENDING_APPROVAL', 'APPLIED', 'FORWARDED'] }
  });

  // Approved leaves active today
  const activeLeavesToday = await LeaveRequest.countDocuments({
    status: { $in: ['APPROVED', 'HR_APPROVED', 'SANCTIONED', 'APPROVED_BY_HR'] },
    $or: [
      { startDateString: { $lte: dateStr }, endDateString: { $gte: dateStr } },
      { fromDateString: { $lte: dateStr }, toDateString: { $gte: dateStr } }
    ]
  });

  // Current month bounds
  const currentYear = dateObj.getFullYear();
  const currentMonth = dateObj.getMonth() + 1;
  const monthStartStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const monthDays = new Date(currentYear, currentMonth, 0).getDate();
  const monthEndStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(monthDays).padStart(2, '0')}`;

  // Holidays this month & upcoming in year
  const holidaysThisMonth = await WorkforceHoliday.find({
    dateString: { $gte: monthStartStr, $lte: monthEndStr },
    status: 'ACTIVE'
  }).sort({ dateString: 1 });

  const futureDate = new Date(dateObj.getTime() + 60 * 24 * 60 * 60 * 1000);
  const upcomingHolidays = await WorkforceHoliday.find({
    dateString: { $gte: dateStr, $lte: toDateString(futureDate) },
    status: 'ACTIVE'
  }).sort({ dateString: 1 }).limit(10);

  // Events this month & upcoming in year
  const eventsThisMonth = await CompanyCalendarEvent.find({
    dateString: { $gte: monthStartStr, $lte: monthEndStr },
    status: 'SCHEDULED'
  }).sort({ dateString: 1 });

  const upcomingEvents = await CompanyCalendarEvent.find({
    dateString: { $gte: dateStr, $lte: toDateString(futureDate) },
    status: 'SCHEDULED'
  }).sort({ dateString: 1 }).limit(10);

  // Active rosters and shifts
  const activeRostersCount = await WorkforceRoster.countDocuments({ status: 'ACTIVE' });
  const activeShiftsCount = await Shift.countDocuments({ isActive: true });
  const activeSchedulesCount = await WorkSchedule.countDocuments({ status: 'ACTIVE' });

  // Today's attendance quick stats from Attendance collection
  const todayAttendance = await Attendance.find({
    $or: [
      { dateString: dateStr },
      { date: { $gte: new Date(`${dateStr}T00:00:00.000Z`), $lte: new Date(`${dateStr}T23:59:59.999Z`) } }
    ]
  });

  let workingToday = 0;
  let onLeaveToday = activeLeavesToday;
  let weekOffToday = 0;

  if (todayAttendance.length > 0) {
    workingToday = todayAttendance.filter(a => a.punchIn || a.status === 'PRESENT').length;
    onLeaveToday = Math.max(activeLeavesToday, todayAttendance.filter(a => a.status === 'ABSENT' || a.status === 'ON_LEAVE').length);
    weekOffToday = todayAttendance.filter(a => a.status === 'WEEK_OFF').length;
  } else {
    // Determine schedule for today
    const isHolidayToday = holidaysThisMonth.some(h => h.dateString === dateStr);
    const isWeekOffToday = dayName === 'tuesday';

    if (isHolidayToday) {
      workingToday = 0;
      onLeaveToday = 0;
      weekOffToday = 0;
    } else if (isWeekOffToday) {
      workingToday = 0;
      onLeaveToday = 0;
      weekOffToday = totalEmployees;
    } else {
      // Normal Working Day
      workingToday = Math.max(0, totalEmployees - onLeaveToday);
      weekOffToday = 0;
    }
  }

  const workingPercentage = totalEmployees > 0 ? ((workingToday / totalEmployees) * 100).toFixed(1) : '0.0';
  const leavePercentage = totalEmployees > 0 ? ((onLeaveToday / totalEmployees) * 100).toFixed(1) : '0.0';
  const weekOffPercentage = totalEmployees > 0 ? ((weekOffToday / totalEmployees) * 100).toFixed(1) : '0.0';

  return {
    date: dateStr,
    totalEmployees,
    workingToday,
    presentToday: workingToday,
    onLeaveToday,
    weekOffToday,
    workingPercentage,
    leavePercentage,
    weekOffPercentage,
    pendingLeaves: pendingLeavesCount,
    holidaysThisMonthCount: holidaysThisMonth.length,
    eventsThisMonthCount: eventsThisMonth.length,
    holidaysThisMonth,
    eventsThisMonth,
    upcomingHolidays,
    upcomingEvents,
    activeRostersCount,
    activeShiftsCount,
    activeSchedulesCount
  };
}

/**
 * Validate leave application against workforce calendar to check if dates fall on Week Off or Holiday
 */
async function validateLeaveAgainstCalendar({ employeeCode, department, startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const warnings = [];

  let cur = new Date(start);
  while (cur <= end) {
    const curDateStr = toDateString(cur);
    const daySchedule = await resolveDaySchedule({
      employeeCode,
      department,
      date: cur
    });

    if (daySchedule.expectedStatus === 'WEEK_OFF') {
      warnings.push({
        date: curDateStr,
        type: 'WEEK_OFF',
        message: `${curDateStr} is a scheduled Week Off.`
      });
    } else if (daySchedule.expectedStatus === 'HOLIDAY' || daySchedule.expectedStatus === 'SPECIAL_HOLIDAY') {
      warnings.push({
        date: curDateStr,
        type: 'HOLIDAY',
        message: `${curDateStr} is a configured Company Holiday (${daySchedule.name || 'Holiday'}).`
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  return {
    isValid: true,
    hasWarnings: warnings.length > 0,
    warnings
  };
}

module.exports = {
  initWorkforceCalendarMaster,
  resolveDaySchedule,
  getEmployeeMonthlyCalendar,
  getCompanyMonthlyCalendar,
  getMasterCalendarStats,
  validateLeaveAgainstCalendar
};
