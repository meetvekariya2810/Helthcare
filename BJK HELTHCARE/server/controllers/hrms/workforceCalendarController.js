const WorkSchedule = require('../../models/hrms/WorkSchedule');
const WorkforceHoliday = require('../../models/hrms/WorkforceHoliday');
const CalendarSpecialDay = require('../../models/hrms/CalendarSpecialDay');
const CompanyCalendarEvent = require('../../models/hrms/CompanyCalendarEvent');
const CalendarException = require('../../models/hrms/CalendarException');
const WorkforceRoster = require('../../models/hrms/WorkforceRoster');
const Shift = require('../../models/hrms/Shift');
const Employee = require('../../models/hrms/Employee');
const Department = require('../../models/hrms/Department');
const { LeaveRequest } = require('../../models/hrms/Leave');
const AuditLog = require('../../models/AuditLog');
const {
  resolveDaySchedule,
  getEmployeeMonthlyCalendar,
  getCompanyMonthlyCalendar,
  getMasterCalendarStats,
  validateLeaveAgainstCalendar
} = require('../../services/hrms/workforceCalendarService');

// Helper to log audit actions
async function recordAudit(req, action, resource, resourceId, details, oldData = null, newData = null) {
  try {
    const user = req.user || { name: 'HR Admin', email: 'hr@bjkhealthcare.com', role: 'HR_MANAGER' };
    await AuditLog.create({
      user: {
        id: user._id || user.id,
        name: user.name || user.fullName || 'HR Administrator',
        email: user.email || 'hr@bjkhealthcare.com',
        role: user.role || 'HR_MANAGER'
      },
      action,
      module: 'HRMS',
      resource: resource || 'WorkforceCalendar',
      resourceId: resourceId ? String(resourceId) : null,
      details: details || '',
      oldData,
      newData,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS'
    });
  } catch (err) {
    console.warn('[WorkforceCalendar Audit Note]:', err.message);
  }
}

// 1. Master Calendar Overview & Stats
exports.getMasterOverview = async (req, res) => {
  try {
    const stats = await getMasterCalendarStats(req.query.date || new Date());
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Monthly Workforce Calendar Matrix
exports.getMonthCalendar = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1, department, employeeCode } = req.query;

    if (employeeCode) {
      const empCal = await getEmployeeMonthlyCalendar({ employeeCode, year, month });
      return res.json({ success: true, data: empCal });
    }

    const companyCal = await getCompanyMonthlyCalendar({ year, month, department });
    res.json({ success: true, data: companyCal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Employee Calendar Inspector (Dixita BH1022 or any specific employee)
exports.getEmployeeCalendarByCode = async (req, res) => {
  try {
    const { employeeCode } = req.params;
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    const data = await getEmployeeMonthlyCalendar({ employeeCode, year, month });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Work Schedules List & Create / Update / Delete
exports.getSchedules = async (req, res) => {
  try {
    const { type, department, status = 'ACTIVE' } = req.query;
    const query = { status };
    if (type) query.scheduleType = type;
    if (department && department !== 'ALL') query.department = department;

    const schedules = await WorkSchedule.find(query).sort({ scheduleType: 1, createdAt: -1 });
    res.json({ success: true, data: schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const {
      name,
      scheduleType,
      department,
      employeeCode,
      employeeName,
      weeklyPattern,
      alternateSaturdayRule,
      shift,
      shiftName,
      effectiveFrom,
      effectiveTo,
      notes
    } = req.body;

    if (!name || !scheduleType) {
      return res.status(400).json({ success: false, message: 'Schedule name and scheduleType are required.' });
    }

    // Auto-resolve employee ID if employee schedule
    let empId = null;
    let finalEmpName = employeeName || '';
    if (scheduleType === 'EMPLOYEE' && employeeCode) {
      const emp = await Employee.findOne({ employeeCode: employeeCode.toUpperCase().trim() });
      if (emp) {
        empId = emp._id;
        finalEmpName = emp.fullName || `${emp.firstName} ${emp.lastName}`.trim();
      }
    }

    const newSchedule = await WorkSchedule.create({
      name,
      scheduleType,
      department: department || 'ALL',
      employee: empId,
      employeeCode: employeeCode ? employeeCode.toUpperCase().trim() : '',
      employeeName: finalEmpName,
      weeklyPattern: weeklyPattern || {},
      alternateSaturdayRule: alternateSaturdayRule || { enabled: false, offSaturdays: [] },
      shift: shift || null,
      shiftName: shiftName || 'General Shift',
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      version: `BJK-${new Date().getFullYear()}-V${Date.now().toString().slice(-4)}`,
      isPublished: true,
      status: 'ACTIVE',
      createdBy: {
        id: req.user?._id,
        name: req.user?.name || req.user?.fullName || 'HR Administrator',
        role: req.user?.role || 'HR_MANAGER'
      },
      notes: notes || ''
    });

    const action = scheduleType === 'EMPLOYEE' ? 'EMPLOYEE_SCHEDULE_CREATED' : (scheduleType === 'DEPARTMENT' ? 'DEPARTMENT_SCHEDULE_CREATED' : 'WEEK_OFF_CREATED');
    await recordAudit(req, action, 'WorkSchedule', newSchedule._id, `Created ${scheduleType} schedule: ${name}`, null, newSchedule);

    res.status(201).json({ success: true, message: 'Work schedule created successfully.', data: newSchedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const oldSchedule = await WorkSchedule.findById(id);
    if (!oldSchedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    const updated = await WorkSchedule.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    await recordAudit(req, 'WEEK_OFF_UPDATED', 'WorkSchedule', id, `Updated schedule: ${updated.name}`, oldSchedule, updated);
    res.json({ success: true, message: 'Schedule updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await WorkSchedule.findById(id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found.' });

    // Archiving instead of permanent delete for audit integrity
    schedule.status = 'ARCHIVED';
    await schedule.save();

    await recordAudit(req, 'SCHEDULE_ARCHIVED', 'WorkSchedule', id, `Archived schedule: ${schedule.name}`);
    res.json({ success: true, message: 'Schedule archived successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Rosters (Week A / Week B multi-week rotational patterns)
exports.getRosters = async (req, res) => {
  try {
    const rosters = await WorkforceRoster.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
    res.json({ success: true, data: rosters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRoster = async (req, res) => {
  try {
    const { name, code, cycleLengthDays, weeks, shift, shiftName, applicableTo, department, employeeCodes, effectiveFrom, effectiveTo } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Roster name and unique code are required.' });
    }

    const newRoster = await WorkforceRoster.create({
      name,
      code: code.toUpperCase().trim(),
      cycleLengthDays: cycleLengthDays || 14,
      weeks: weeks || [],
      shift: shift || null,
      shiftName: shiftName || 'General Shift',
      applicableTo: applicableTo || 'DEPARTMENT',
      department: department || 'ALL',
      employeeCodes: (employeeCodes || []).map(c => c.toUpperCase().trim()),
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      status: 'ACTIVE',
      createdBy: {
        id: req.user?._id,
        name: req.user?.name || 'HR Administrator',
        role: req.user?.role || 'HR_MANAGER'
      }
    });

    await recordAudit(req, 'ROSTER_CREATED', 'WorkforceRoster', newRoster._id, `Created Roster ${name} (${code})`, null, newRoster);
    res.status(201).json({ success: true, message: 'Workforce roster created successfully.', data: newRoster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignRoster = async (req, res) => {
  try {
    const { rosterId, applicableTo, department, employeeCodes } = req.body;
    const roster = await WorkforceRoster.findById(rosterId);
    if (!roster) return res.status(404).json({ success: false, message: 'Roster not found.' });

    roster.applicableTo = applicableTo || roster.applicableTo;
    if (department) roster.department = department;
    if (employeeCodes) roster.employeeCodes = employeeCodes.map(c => c.toUpperCase().trim());
    await roster.save();

    await recordAudit(req, 'ROSTER_ASSIGNED', 'WorkforceRoster', rosterId, `Assigned Roster ${roster.name} to ${applicableTo}`);
    res.json({ success: true, message: 'Roster assigned successfully.', data: roster });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. Holidays CRUD
exports.getHolidays = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), department } = req.query;
    const query = { status: 'ACTIVE', year: Number(year) };
    if (department && department !== 'ALL') {
      query.$or = [{ applicableTo: 'ALL' }, { department: { $in: [department, 'ALL'] } }];
    }
    const holidays = await WorkforceHoliday.find(query).sort({ dateString: 1 });
    res.json({ success: true, data: holidays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const { name, dateString, type, applicableTo, department, employeeCodes, description, isOptional } = req.body;

    if (!name || !dateString) {
      return res.status(400).json({ success: false, message: 'Holiday name and date are required.' });
    }

    const d = new Date(`${dateString}T00:00:00.000Z`);
    const newHoliday = await WorkforceHoliday.create({
      name,
      date: d,
      dateString,
      year: d.getFullYear(),
      type: type || 'COMPANY_HOLIDAY',
      applicableTo: applicableTo || 'ALL',
      department: department || 'ALL',
      employeeCodes: (employeeCodes || []).map(c => c.toUpperCase().trim()),
      description: description || '',
      isOptional: Boolean(isOptional),
      status: 'ACTIVE',
      createdBy: {
        id: req.user?._id,
        name: req.user?.name || 'HR Administrator',
        role: req.user?.role || 'HR_MANAGER'
      }
    });

    await recordAudit(req, 'HOLIDAY_CREATED', 'WorkforceHoliday', newHoliday._id, `Created holiday: ${name} on ${dateString}`, null, newHoliday);
    res.status(201).json({ success: true, message: 'Holiday created successfully.', data: newHoliday });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const old = await WorkforceHoliday.findById(id);
    if (!old) return res.status(404).json({ success: false, message: 'Holiday not found.' });

    const updated = await WorkforceHoliday.findByIdAndUpdate(id, req.body, { new: true });
    await recordAudit(req, 'HOLIDAY_UPDATED', 'WorkforceHoliday', id, `Updated holiday: ${updated.name}`, old, updated);
    res.json({ success: true, message: 'Holiday updated successfully.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await WorkforceHoliday.findById(id);
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found.' });

    holiday.status = 'CANCELLED';
    await holiday.save();

    await recordAudit(req, 'HOLIDAY_CANCELLED', 'WorkforceHoliday', id, `Cancelled holiday: ${holiday.name} on ${holiday.dateString}`);
    res.json({ success: true, message: 'Holiday cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 7. Special Days (Special Working Day & Special Holiday)
exports.getSpecialDays = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), type } = req.query;
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;
    const query = { dateString: { $gte: startStr, $lte: endStr }, status: 'ACTIVE' };
    if (type) query.type = type;

    const specialDays = await CalendarSpecialDay.find(query).sort({ dateString: 1 });
    res.json({ success: true, data: specialDays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSpecialDay = async (req, res) => {
  try {
    const { name, dateString, type, reason, applicableTo, department, employeeCodes, shift, shiftName, workingHours, notes } = req.body;

    if (!name || !dateString || !reason) {
      return res.status(400).json({ success: false, message: 'Name, dateString, and reason are required.' });
    }

    const d = new Date(`${dateString}T00:00:00.000Z`);
    const newSpecialDay = await CalendarSpecialDay.create({
      name,
      date: d,
      dateString,
      type: type || 'SPECIAL_WORKING_DAY',
      reason,
      applicableTo: applicableTo || 'DEPARTMENT',
      department: department || 'PRD',
      employeeCodes: (employeeCodes || []).map(c => c.toUpperCase().trim()),
      shift: shift || null,
      shiftName: shiftName || 'General Shift (09:00 - 18:00)',
      workingHours: workingHours || 8,
      notes: notes || '',
      status: 'ACTIVE',
      createdBy: {
        id: req.user?._id,
        name: req.user?.name || 'HR Administrator',
        role: req.user?.role || 'HR_MANAGER'
      }
    });

    const action = type === 'SPECIAL_WORKING_DAY' ? 'SPECIAL_WORKING_DAY_CREATED' : 'SPECIAL_HOLIDAY_CREATED';
    await recordAudit(req, action, 'CalendarSpecialDay', newSpecialDay._id, `Created ${type}: ${name} on ${dateString} for ${department || 'ALL'}`, null, newSpecialDay);

    res.status(201).json({ success: true, message: `${type === 'SPECIAL_WORKING_DAY' ? 'Special Working Day' : 'Special Holiday'} created successfully.`, data: newSpecialDay });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSpecialDay = async (req, res) => {
  try {
    const { id } = req.params;
    const specialDay = await CalendarSpecialDay.findById(id);
    if (!specialDay) return res.status(404).json({ success: false, message: 'Record not found.' });

    specialDay.status = 'CANCELLED';
    await specialDay.save();

    await recordAudit(req, 'SPECIAL_DAY_CANCELLED', 'CalendarSpecialDay', id, `Cancelled special day: ${specialDay.name}`);
    res.json({ success: true, message: 'Special day cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Company Events, Celebrations & Functions
exports.getEvents = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), category, department } = req.query;
    const startStr = `${year}-01-01`;
    const endStr = `${year}-12-31`;
    const query = { dateString: { $gte: startStr, $lte: endStr }, status: 'SCHEDULED' };
    if (category) query.category = category;
    if (department && department !== 'ALL') query.$or = [{ applicableTo: 'ALL' }, { department: { $in: [department, 'ALL'] } }];

    const events = await CompanyCalendarEvent.find(query).sort({ dateString: 1, startTime: 1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, dateString, startTime, endTime, type, category, location, description, applicableTo, department, employeeCodes, organizer } = req.body;

    if (!title || !dateString) {
      return res.status(400).json({ success: false, message: 'Event title and date are required.' });
    }

    const d = new Date(`${dateString}T00:00:00.000Z`);
    const newEvent = await CompanyCalendarEvent.create({
      title,
      date: d,
      dateString,
      startTime: startTime || '10:00',
      endTime: endTime || '17:00',
      type: type || 'CORPORATE_EVENT',
      category: category || 'EVENT',
      location: location || 'Main Campus',
      description: description || '',
      applicableTo: applicableTo || 'ALL',
      department: department || 'ALL',
      employeeCodes: (employeeCodes || []).map(c => c.toUpperCase().trim()),
      organizer: organizer || 'HR Department',
      status: 'SCHEDULED',
      createdBy: {
        id: req.user?._id,
        name: req.user?.name || 'HR Administrator',
        role: req.user?.role || 'HR_MANAGER'
      }
    });

    await recordAudit(req, 'EVENT_CREATED', 'CompanyCalendarEvent', newEvent._id, `Created Event: ${title} on ${dateString}`, null, newEvent);
    res.status(201).json({ success: true, message: 'Event created successfully.', data: newEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const ev = await CompanyCalendarEvent.findById(id);
    if (!ev) return res.status(404).json({ success: false, message: 'Event not found.' });

    ev.status = 'CANCELLED';
    await ev.save();

    await recordAudit(req, 'EVENT_CANCELLED', 'CompanyCalendarEvent', id, `Cancelled Event: ${ev.title}`);
    res.json({ success: true, message: 'Event cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Calendar Exceptions (Single-employee Date Override)
exports.createException = async (req, res) => {
  try {
    const { employeeId, dateString, newStatus, reason, shift, shiftName } = req.body;

    if (!employeeId || !dateString || !newStatus || !reason) {
      return res.status(400).json({ success: false, message: 'employeeId, dateString, newStatus, and reason are required.' });
    }

    const empCode = employeeId.toUpperCase().trim();
    const emp = await Employee.findOne({ employeeCode: empCode });
    const d = new Date(`${dateString}T00:00:00.000Z`);

    const exception = await CalendarException.findOneAndUpdate(
      { employeeId: empCode, dateString },
      {
        employee: emp ? emp._id : null,
        employeeName: emp ? (emp.fullName || `${emp.firstName} ${emp.lastName}`.trim()) : '',
        date: d,
        dateString,
        newStatus,
        reason,
        shift: shift || null,
        shiftName: shiftName || '',
        status: 'ACTIVE',
        createdBy: {
          id: req.user?._id,
          name: req.user?.name || 'HR Administrator',
          role: req.user?.role || 'HR_MANAGER'
        }
      },
      { upsert: true, new: true }
    );

    await recordAudit(req, 'CALENDAR_EXCEPTION_CREATED', 'CalendarException', exception._id, `Created Exception for ${empCode} on ${dateString}: ${newStatus}`, null, exception);
    res.status(201).json({ success: true, message: 'Calendar exception created successfully.', data: exception });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Leave Approval Integration
exports.getPendingLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({
      status: { $in: ['PENDING', 'PENDING_APPROVAL', 'APPLIED', 'FORWARDED'] }
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });

    leave.status = 'APPROVED';
    leave.hrApproval = {
      approved: true,
      approvedBy: req.user?.name || 'HR Administrator',
      approvedAt: new Date(),
      remarks: remarks || 'Approved via HR Workforce Calendar'
    };
    await leave.save();

    await recordAudit(req, 'LEAVE_APPROVED', 'LeaveRequest', id, `Approved leave for ${leave.employeeId} (${leave.leaveType})`);
    res.json({ success: true, message: 'Leave request approved successfully.', data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await LeaveRequest.findById(id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found.' });

    leave.status = 'REJECTED';
    leave.hrApproval = {
      approved: false,
      approvedBy: req.user?.name || 'HR Administrator',
      approvedAt: new Date(),
      remarks: remarks || 'Rejected via HR Workforce Calendar'
    };
    await leave.save();

    await recordAudit(req, 'LEAVE_REJECTED', 'LeaveRequest', id, `Rejected leave for ${leave.employeeId} (${leave.leaveType})`);
    res.json({ success: true, message: 'Leave request rejected.', data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 11. Calendar Setup Wizard (11-Step Publish)
exports.publishWizardCalendar = async (req, res) => {
  try {
    const {
      companySchedule,
      departmentSchedules = [],
      employeeOverrides = [],
      holidays = [],
      specialDays = [],
      events = [],
      effectiveFrom = '2026-01-01',
      version = 'BJK-2026-V2'
    } = req.body;

    // 1. Publish / Update Company Schedule
    if (companySchedule) {
      await WorkSchedule.findOneAndUpdate(
        { scheduleType: 'COMPANY', status: 'ACTIVE' },
        {
          name: companySchedule.name || 'BJK Healthcare Master Company Schedule',
          weeklyPattern: companySchedule.weeklyPattern,
          effectiveFrom: new Date(effectiveFrom),
          version,
          isPublished: true,
          status: 'ACTIVE',
          notes: companySchedule.notes || 'Published via HR Calendar Setup Wizard.'
        },
        { upsert: true, new: true }
      );
    }

    // 2. Department Schedules
    for (const ds of departmentSchedules) {
      if (ds.department && ds.weeklyPattern) {
        await WorkSchedule.findOneAndUpdate(
          { scheduleType: 'DEPARTMENT', department: ds.department },
          {
            name: ds.name || `${ds.department} Department Schedule`,
            scheduleType: 'DEPARTMENT',
            department: ds.department,
            weeklyPattern: ds.weeklyPattern,
            effectiveFrom: new Date(effectiveFrom),
            version,
            isPublished: true,
            status: 'ACTIVE'
          },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Employee Overrides
    for (const eo of employeeOverrides) {
      if (eo.employeeCode && eo.weeklyPattern) {
        await WorkSchedule.findOneAndUpdate(
          { scheduleType: 'EMPLOYEE', employeeCode: eo.employeeCode.toUpperCase().trim() },
          {
            name: eo.name || `${eo.employeeCode} Custom Schedule`,
            scheduleType: 'EMPLOYEE',
            employeeCode: eo.employeeCode.toUpperCase().trim(),
            employeeName: eo.employeeName || '',
            weeklyPattern: eo.weeklyPattern,
            effectiveFrom: new Date(effectiveFrom),
            version,
            isPublished: true,
            status: 'ACTIVE'
          },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Record Audit
    await recordAudit(req, 'CALENDAR_WIZARD_PUBLISHED', 'WorkSchedule', null, `Published full workforce calendar version ${version} effective from ${effectiveFrom}`);

    res.json({
      success: true,
      message: `BJK Healthcare Workforce Calendar (${version}) published successfully.`,
      version,
      effectiveFrom
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 12. Calendar Reports Export
exports.getCalendarReports = async (req, res) => {
  try {
    const { type = 'MONTHLY_CALENDAR', year = new Date().getFullYear(), month = new Date().getMonth() + 1, department } = req.query;
    const y = Number(year);
    const m = Number(month);

    if (type === 'HOLIDAYS') {
      const holidays = await WorkforceHoliday.find({ year: y, status: 'ACTIVE' }).sort({ dateString: 1 });
      return res.json({ success: true, type, count: holidays.length, data: holidays });
    }

    if (type === 'SCHEDULES') {
      const schedules = await WorkSchedule.find({ status: 'ACTIVE' }).sort({ scheduleType: 1 });
      return res.json({ success: true, type, count: schedules.length, data: schedules });
    }

    if (type === 'EVENTS') {
      const startStr = `${y}-01-01`;
      const endStr = `${y}-12-31`;
      const events = await CompanyCalendarEvent.find({ dateString: { $gte: startStr, $lte: endStr }, status: 'SCHEDULED' }).sort({ dateString: 1 });
      return res.json({ success: true, type, count: events.length, data: events });
    }

    // Default: Department or All Employees Month Summary
    const query = { status: { $ne: 'TERMINATED' } };
    if (department && department !== 'ALL') query.department = department;

    const employees = await Employee.find(query).select('employeeCode firstName lastName fullName department designation').limit(100);
    const reports = [];

    for (const emp of employees) {
      const empCal = await getEmployeeMonthlyCalendar({ employeeCode: emp.employeeCode, year: y, month: m });
      reports.push({
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName || `${emp.firstName} ${emp.lastName}`.trim(),
        department: emp.department,
        designation: emp.designation,
        summary: empCal.summary
      });
    }

    res.json({ success: true, type, year: y, month: m, count: reports.length, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
