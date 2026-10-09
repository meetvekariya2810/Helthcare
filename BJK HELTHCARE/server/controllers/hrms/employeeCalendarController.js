const Employee = require('../../models/hrms/Employee');
const WorkforceHoliday = require('../../models/hrms/WorkforceHoliday');
const CompanyCalendarEvent = require('../../models/hrms/CompanyCalendarEvent');
const {
  resolveDaySchedule,
  getEmployeeMonthlyCalendar,
  validateLeaveAgainstCalendar
} = require('../../services/hrms/workforceCalendarService');

// Helper to get authenticated employee code
function getAuthEmpCode(req) {
  if (req.employeeUser) {
    return req.employeeUser.employeeCode || req.employeeUser.employeeId || req.employeeUser.code;
  }
  if (req.user) {
    return req.user.employeeCode || req.user.employeeId;
  }
  return null;
}

// 1. Get Logged-in Employee's Own Monthly Calendar
exports.getMyCalendar = async (req, res) => {
  try {
    const employeeCode = getAuthEmpCode(req);
    if (!employeeCode) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Employee identity missing.' });
    }

    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const data = await getEmployeeMonthlyCalendar({ employeeCode, year, month });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Get Logged-in Employee's Schedule & Work Pattern
exports.getMySchedule = async (req, res) => {
  try {
    const employeeCode = getAuthEmpCode(req);
    if (!employeeCode) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Employee identity missing.' });
    }

    const emp = await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() });
    const department = emp ? emp.department : 'ALL';

    // Resolve 7 days of the current week
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Start on Monday

    const weekSchedule = [];
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
      const cur = new Date(weekStart);
      cur.setDate(weekStart.getDate() + i);

      const resolved = await resolveDaySchedule({
        employeeCode,
        department,
        date: cur
      });

      weekSchedule.push({
        dayName: dayLabels[i],
        date: cur,
        status: resolved.expectedStatus,
        shiftName: resolved.shiftName,
        startTime: resolved.startTime,
        endTime: resolved.endTime,
        workingHours: resolved.workingHours,
        ruleSource: resolved.ruleSource
      });
    }

    res.json({
      success: true,
      data: {
        employeeCode,
        department,
        shift: emp?.shift || 'General Shift (09:00 - 18:00)',
        weekSchedule,
        isReadOnly: true
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Today's Status & Dashboard Quick Widget Data
exports.getMyTodaySummary = async (req, res) => {
  try {
    const employeeCode = getAuthEmpCode(req);
    if (!employeeCode) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Employee identity missing.' });
    }

    const emp = await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() });
    const department = emp ? emp.department : 'ALL';

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayResolved = await resolveDaySchedule({ employeeCode, department, date: today });
    const tomorrowResolved = await resolveDaySchedule({ employeeCode, department, date: tomorrow });

    // Next upcoming holiday
    const futureDate = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
    const nextHoliday = await WorkforceHoliday.findOne({
      dateString: { $gte: today.toISOString().split('T')[0] },
      status: 'ACTIVE',
      $or: [
        { applicableTo: 'ALL' },
        { department: { $in: [department, 'ALL'] } },
        { employeeCodes: employeeCode.toUpperCase().trim() }
      ]
    }).sort({ dateString: 1 });

    // Next upcoming company event
    const nextEvent = await CompanyCalendarEvent.findOne({
      dateString: { $gte: today.toISOString().split('T')[0] },
      status: 'SCHEDULED',
      $or: [
        { applicableTo: 'ALL' },
        { department: { $in: [department, 'ALL'] } },
        { employeeCodes: employeeCode.toUpperCase().trim() }
      ]
    }).sort({ dateString: 1 });

    res.json({
      success: true,
      data: {
        today: {
          date: today,
          status: todayResolved.expectedStatus,
          shiftName: todayResolved.shiftName,
          startTime: todayResolved.startTime,
          endTime: todayResolved.endTime,
          ruleSource: todayResolved.ruleSource,
          reason: todayResolved.reason || todayResolved.name || ''
        },
        tomorrow: {
          date: tomorrow,
          status: tomorrowResolved.expectedStatus,
          shiftName: tomorrowResolved.shiftName,
          ruleSource: tomorrowResolved.ruleSource
        },
        nextHoliday,
        nextEvent
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Get Holidays Applicable to Me
exports.getMyHolidays = async (req, res) => {
  try {
    const employeeCode = getAuthEmpCode(req);
    const { year = new Date().getFullYear() } = req.query;

    const emp = employeeCode ? await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() }) : null;
    const department = emp ? emp.department : 'ALL';

    const holidays = await WorkforceHoliday.find({
      year: Number(year),
      status: 'ACTIVE',
      $or: [
        { applicableTo: 'ALL' },
        { department: { $in: [department, 'ALL'] } },
        { employeeCodes: employeeCode ? employeeCode.toUpperCase().trim() : 'NONE' }
      ]
    }).sort({ dateString: 1 });

    res.json({ success: true, count: holidays.length, data: holidays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Get Events Applicable to Me
exports.getMyEvents = async (req, res) => {
  try {
    const employeeCode = getAuthEmpCode(req);
    const { year = new Date().getFullYear() } = req.query;

    const emp = employeeCode ? await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() }) : null;
    const department = emp ? emp.department : 'ALL';
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;

    const events = await CompanyCalendarEvent.find({
      dateString: { $gte: startStr, $lte: endStr },
      status: 'SCHEDULED',
      $or: [
        { applicableTo: 'ALL' },
        { department: { $in: [department, 'ALL'] } },
        { employeeCodes: employeeCode ? employeeCode.toUpperCase().trim() : 'NONE' }
      ]
    }).sort({ dateString: 1 });

    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Validate Leave Date Against Calendar
exports.validateLeaveDate = async (req, res) => {
  try {
    const employeeCode = getAuthEmpCode(req);
    const { startDate, endDate } = req.body;

    const emp = employeeCode ? await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() }) : null;
    const department = emp ? emp.department : 'ALL';

    const validation = await validateLeaveAgainstCalendar({
      employeeCode,
      department,
      startDate,
      endDate
    });

    res.json({ success: true, data: validation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
