const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const CanteenLunchRecord = require('../../models/hrms/CanteenLunchRecord');
const CanteenSetting = require('../../models/hrms/CanteenSetting');
const Employee = require('../../models/Employee');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');

/**
 * Helper: Get current date in Asia/Kolkata timezone as 'YYYY-MM-DD'
 */
function getTodayKolkataDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  // Format to Asia/Kolkata YYYY-MM-DD
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
}

/**
 * Helper: Format Date to DD-MMM-YYYY (e.g. 07-Oct-2026) in Asia/Kolkata
 */
function formatDateDisplay(dateInput) {
  if (!dateInput) return '--';
  const d = typeof dateInput === 'string' && dateInput.includes('-') && dateInput.length === 10
    ? new Date(`${dateInput}T12:00:00+05:30`)
    : new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  
  return d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '-');
}

/**
 * Helper: Format time to 12-hour AM/PM (e.g. 12:45 PM) in Asia/Kolkata
 */
function formatTimeDisplay(dateInput) {
  if (!dateInput) return '--';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '--';
  return d.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Helper: Extract Employee Identity from req.employee or req.user
 */
async function resolveEmployeeIdentity(req) {
  let employeeId = null;
  let employeeName = 'Employee';
  let department = 'General';
  let designation = 'Staff';
  let userId = null;
  let employeeRef = null;

  if (req.employee) {
    employeeId = (req.employee.employeeId || req.employee.employeeCode || '').toUpperCase();
    employeeName = req.employee.fullName || `${req.employee.firstName || ''} ${req.employee.lastName || ''}`.trim() || req.employee.name || 'Employee';
    department = req.employee.departmentName || req.employee.department || 'General';
    designation = req.employee.designationTitle || req.employee.designation || 'Staff';
    employeeRef = req.employee._id || null;
    userId = req.employee.user || req.user?._id || null;
  } else if (req.user) {
    userId = req.user._id || req.user.id;
    employeeId = (req.user.employeeId || req.user.employeeCode || '').toUpperCase();
    employeeName = req.user.name || 'Employee';
    department = req.user.department || 'General';
    designation = req.user.designation || 'Staff';
  }

  // If employeeId is missing or we need rich data, perform DB lookup
  if (mongoose.connection.readyState === 1) {
    if (employeeId) {
      const empDoc = await Employee.findOne({
        $or: [
          { employeeId: employeeId },
          { employeeCode: employeeId }
        ]
      }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle user');

      if (empDoc) {
        employeeId = (empDoc.employeeId || empDoc.employeeCode || employeeId).toUpperCase();
        employeeName = empDoc.fullName || `${empDoc.firstName || ''} ${empDoc.lastName || ''}`.trim() || employeeName;
        department = empDoc.departmentName || empDoc.department || department;
        designation = empDoc.designationTitle || empDoc.designation || designation;
        employeeRef = empDoc._id;
        if (!userId && empDoc.user) userId = empDoc.user;
      }
    } else if (userId) {
      const empDoc = await Employee.findOne({ user: userId }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle');
      if (empDoc) {
        employeeId = (empDoc.employeeId || empDoc.employeeCode || '').toUpperCase();
        employeeName = empDoc.fullName || `${empDoc.firstName || ''} ${empDoc.lastName || ''}`.trim() || employeeName;
        department = empDoc.departmentName || empDoc.department || department;
        designation = empDoc.designationTitle || empDoc.designation || designation;
        employeeRef = empDoc._id;
      }
    }
  }

  return {
    employeeId: employeeId ? employeeId.toUpperCase() : null,
    employeeName,
    department,
    designation,
    userId,
    employeeRef
  };
}

/**
 * Log an immutable audit entry for Canteen operations
 */
async function recordCanteenAudit({ req, action, details, recordId, targetEmployeeId, targetEmployeeName, oldData = null, newData = null, reason = '' }) {
  try {
    const userObj = {
      id: req.user?._id || req.user?.id || req.employee?.user || null,
      name: req.user?.name || req.employee?.fullName || 'System User',
      email: req.user?.email || req.employee?.email || 'user@bjkhealthcare.com',
      role: req.user?.role || req.employee?.systemRole || 'EMPLOYEE'
    };

    await AuditLog.create({
      user: userObj,
      action: action || 'CANTEEN_ACTION',
      module: 'CANTEEN',
      resource: 'CanteenLunchRecord',
      resourceId: recordId ? String(recordId) : null,
      recordId: recordId ? String(recordId) : null,
      oldData,
      newData,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      status: 'SUCCESS',
      targetUser: {
        employeeId: targetEmployeeId || '',
        name: targetEmployeeName || ''
      },
      reason: reason || details || '',
      details: details || ''
    });
  } catch (err) {
    console.warn('[Canteen Audit Log Warning]:', err.message);
  }
}

// ==============================================================================
// 1. EMPLOYEE CONTROLLER ACTIONS
// ==============================================================================

/**
 * POST /api/hrms/canteen/lunch-in (also /api/employee/canteen/lunch-in)
 * Records today's Lunch IN for the authenticated employee
 */
exports.lunchIn = async (req, res) => {
  try {
    const identity = await resolveEmployeeIdentity(req);
    if (!identity.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to identify employee. Please ensure your employee profile is linked.'
      });
    }

    const todayDate = getTodayKolkataDate();

    // Check if record exists for today
    let record = await CanteenLunchRecord.findOne({
      employeeId: identity.employeeId,
      date: todayDate
    });

    if (record && record.lunchInAt) {
      return res.status(400).json({
        success: false,
        message: `Duplicate Lunch IN not allowed. Lunch IN was already recorded for today at ${formatTimeDisplay(record.lunchInAt)}.`
      });
    }

    // Validate mandatory dishType: Full Dish or Half Dish
    let dishType = req.body?.dishType || req.query?.dishType;
    if (typeof dishType === 'string') {
      dishType = dishType.trim();
      if (/^full/i.test(dishType)) dishType = 'Full Dish';
      else if (/^half/i.test(dishType)) dishType = 'Half Dish';
    }

    if (!dishType || !['Full Dish', 'Half Dish'].includes(dishType)) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory Dish Type selection required: Please select either "Full Dish" or "Half Dish" before submitting Lunch IN.'
      });
    }

    const now = new Date();

    if (!record) {
      record = new CanteenLunchRecord({
        employeeId: identity.employeeId,
        employeeCode: identity.employeeId,
        employeeName: identity.employeeName,
        department: identity.department,
        designation: identity.designation,
        date: todayDate,
        dishType,
        lunchInAt: now,
        status: 'IN',
        userId: identity.userId,
        employeeRef: identity.employeeRef
      });
    } else {
      record.lunchInAt = now;
      record.dishType = dishType;
      record.status = 'IN';
      record.employeeName = identity.employeeName || record.employeeName;
      record.department = identity.department || record.department;
      record.designation = identity.designation || record.designation;
    }

    await record.save();

    await recordCanteenAudit({
      req,
      action: 'EMPLOYEE_LUNCH_IN',
      details: `Employee ${identity.employeeName} (${identity.employeeId}) recorded Lunch IN (${dishType}) at ${formatTimeDisplay(now)}`,
      recordId: record._id,
      targetEmployeeId: identity.employeeId,
      targetEmployeeName: identity.employeeName,
      newData: {
        lunchInAt: now,
        dishType,
        date: todayDate,
        status: 'IN'
      }
    });

    return res.status(200).json({
      success: true,
      message: `Lunch IN Recorded Successfully (${dishType})`,
      data: {
        id: record._id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department,
        designation: record.designation,
        date: record.date,
        dishType: record.dishType,
        lunchInAt: record.lunchInAt,
        lunchInDisplay: formatTimeDisplay(record.lunchInAt),
        lunchOutAt: record.lunchOutAt,
        lunchOutDisplay: formatTimeDisplay(record.lunchOutAt),
        durationMinutes: record.durationMinutes,
        status: record.status
      }
    });
  } catch (error) {
    console.error('[Canteen Lunch IN Error]:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Lunch IN already recorded for today.'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record Lunch IN. Please try again.'
    });
  }
};

/**
 * POST /api/hrms/canteen/lunch-out (also /api/employee/canteen/lunch-out)
 * Records today's Lunch OUT for the authenticated employee
 */
exports.lunchOut = async (req, res) => {
  try {
    const identity = await resolveEmployeeIdentity(req);
    if (!identity.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to identify employee. Please ensure your employee profile is linked.'
      });
    }

    const todayDate = getTodayKolkataDate();

    const record = await CanteenLunchRecord.findOne({
      employeeId: identity.employeeId,
      date: todayDate
    });

    if (!record || !record.lunchInAt) {
      return res.status(400).json({
        success: false,
        message: 'Cannot record Lunch OUT before Lunch IN has been recorded.'
      });
    }

    if (record.lunchOutAt) {
      return res.status(400).json({
        success: false,
        message: `Lunch OUT has already been recorded for today at ${formatTimeDisplay(record.lunchOutAt)}.`
      });
    }

    const now = new Date();
    const diffMs = now.getTime() - new Date(record.lunchInAt).getTime();
    const durationMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

    const oldData = {
      lunchInAt: record.lunchInAt,
      lunchOutAt: record.lunchOutAt,
      status: record.status
    };

    record.lunchOutAt = now;
    record.durationMinutes = durationMinutes;
    record.status = 'COMPLETED';

    await record.save();

    await recordCanteenAudit({
      req,
      action: 'EMPLOYEE_LUNCH_OUT',
      details: `Employee ${identity.employeeName} (${identity.employeeId}) recorded Lunch OUT at ${formatTimeDisplay(now)} (Portion: ${record.dishType || 'Full Dish'}, Duration: ${durationMinutes} mins)`,
      recordId: record._id,
      targetEmployeeId: identity.employeeId,
      targetEmployeeName: identity.employeeName,
      oldData,
      newData: {
        lunchOutAt: now,
        durationMinutes,
        status: 'COMPLETED'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Lunch OUT Recorded Successfully',
      data: {
        id: record._id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department,
        designation: record.designation,
        date: record.date,
        dishType: record.dishType || null,
        lunchInAt: record.lunchInAt,
        lunchInDisplay: formatTimeDisplay(record.lunchInAt),
        lunchOutAt: record.lunchOutAt,
        lunchOutDisplay: formatTimeDisplay(record.lunchOutAt),
        durationMinutes: record.durationMinutes,
        status: record.status
      }
    });
  } catch (error) {
    console.error('[Canteen Lunch OUT Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to record Lunch OUT. Please try again.'
    });
  }
};

/**
 * GET /api/hrms/canteen/my-today (also /api/employee/canteen/today)
 * Returns current employee's lunch status for today
 */
exports.getMyTodayStatus = async (req, res) => {
  try {
    const identity = await resolveEmployeeIdentity(req);
    if (!identity.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee identification required'
      });
    }

    const todayDate = getTodayKolkataDate();

    const record = await CanteenLunchRecord.findOne({
      employeeId: identity.employeeId,
      date: todayDate
    });

    let currentStatus = 'NOT_MARKED';
    let lunchInDisplay = '--';
    let lunchOutDisplay = '--';
    let durationDisplay = '--';

    if (record && record.lunchInAt) {
      lunchInDisplay = formatTimeDisplay(record.lunchInAt);
      if (record.lunchOutAt) {
        lunchOutDisplay = formatTimeDisplay(record.lunchOutAt);
        currentStatus = record.finalized ? 'FINALIZED' : 'COMPLETED';
        durationDisplay = `${record.durationMinutes} Minutes`;
      } else {
        currentStatus = 'IN';
        // Compute live elapsed minutes
        const elapsed = Math.max(0, Math.round((Date.now() - new Date(record.lunchInAt).getTime()) / (1000 * 60)));
        durationDisplay = `${elapsed} Minutes (Ongoing)`;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        employeeId: identity.employeeId,
        employeeName: identity.employeeName,
        department: identity.department,
        designation: identity.designation,
        date: todayDate,
        dateDisplay: formatDateDisplay(todayDate),
        dishType: record?.dishType || null,
        status: currentStatus,
        lunchInAt: record?.lunchInAt || null,
        lunchInDisplay,
        lunchOutAt: record?.lunchOutAt || null,
        lunchOutDisplay,
        durationMinutes: record?.durationMinutes || 0,
        durationDisplay,
        recordId: record?._id || null,
        finalized: Boolean(record?.finalized)
      }
    });
  } catch (error) {
    console.error('[Canteen getMyTodayStatus Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch today lunch status'
    });
  }
};

/**
 * GET /api/hrms/canteen/my-history (also /api/employee/canteen/my-history)
 * Returns authenticated employee's lunch history
 */
exports.getMyHistory = async (req, res) => {
  try {
    const identity = await resolveEmployeeIdentity(req);
    if (!identity.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee identification required'
      });
    }

    const { startDate, endDate, search, limit = 50 } = req.query;

    const query = {
      employeeId: identity.employeeId
    };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    const records = await CanteenLunchRecord.find(query)
      .sort({ date: -1, lunchInAt: -1 })
      .limit(Number(limit));

    const formattedRecords = records.map(r => ({
      id: r._id,
      date: r.date,
      dateDisplay: formatDateDisplay(r.date),
      dishType: r.dishType || null,
      lunchInAt: r.lunchInAt,
      lunchInDisplay: formatTimeDisplay(r.lunchInAt),
      lunchOutAt: r.lunchOutAt,
      lunchOutDisplay: formatTimeDisplay(r.lunchOutAt),
      durationMinutes: r.durationMinutes || 0,
      durationDisplay: r.lunchOutAt ? `${r.durationMinutes || 0} min` : (r.lunchInAt ? 'In Progress' : '--'),
      status: r.status,
      finalized: r.finalized,
      correctionReason: r.correctionReason
    }));

    return res.status(200).json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    console.error('[Canteen getMyHistory Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch lunch history'
    });
  }
};

/**
 * GET /api/hrms/canteen/my-summary (also /api/employee/canteen/my-summary)
 * Returns monthly lunch statistics for current employee
 */
exports.getMySummary = async (req, res) => {
  try {
    const identity = await resolveEmployeeIdentity(req);
    if (!identity.employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee identification required'
      });
    }

    const { year, month } = req.query;
    const now = new Date();
    const targetYear = year ? Number(year) : now.getFullYear();
    const targetMonth = month ? Number(month) : (now.getMonth() + 1);

    const monthStr = String(targetMonth).padStart(2, '0');
    const monthPrefix = `${targetYear}-${monthStr}`;

    const monthRecords = await CanteenLunchRecord.find({
      employeeId: identity.employeeId,
      date: { $regex: `^${monthPrefix}` }
    });

    const totalLunchRecords = monthRecords.length;
    const lunchInDays = monthRecords.filter(r => r.lunchInAt).length;
    const fullDishDays = monthRecords.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
    const halfDishDays = monthRecords.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;
    const lunchCompletedDays = monthRecords.filter(r => r.status === 'COMPLETED' || (r.lunchInAt && r.lunchOutAt)).length;
    const missingLunchEntries = monthRecords.filter(r => r.lunchInAt && !r.lunchOutAt).length;

    // Approximate working days in month (days elapsed excluding Sundays)
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const isCurrentMonth = (targetYear === now.getFullYear() && targetMonth === (now.getMonth() + 1));
    const maxDay = isCurrentMonth ? now.getDate() : daysInMonth;
    
    let workingDaysCount = 0;
    for (let d = 1; d <= maxDay; d++) {
      const checkDate = new Date(targetYear, targetMonth - 1, d);
      if (checkDate.getDay() !== 0) { // Not Sunday
        workingDaysCount++;
      }
    }

    const monthName = new Date(targetYear, targetMonth - 1, 1).toLocaleString('en-US', { month: 'long' });

    return res.status(200).json({
      success: true,
      data: {
        month: `${monthName} ${targetYear}`,
        year: targetYear,
        monthNumber: targetMonth,
        totalWorkingDays: workingDaysCount,
        lunchInDays,
        fullDishDays,
        halfDishDays,
        lunchCompletedDays,
        missingLunchEntries,
        totalLunchRecords
      }
    });
  } catch (error) {
    console.error('[Canteen getMySummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch monthly summary'
    });
  }
};

// ==============================================================================
// 2. HR CONTROLLER ACTIONS (FULL HRMS ACCESS & METRICS)
// ==============================================================================

/**
 * GET /api/hrms/canteen/today
 * HR Dashboard - Real-time Today's live count, metrics & employee list
 */
exports.getHRTodayDashboard = async (req, res) => {
  try {
    const selectedDate = req.query.date ? getTodayKolkataDate(req.query.date) : getTodayKolkataDate();

    // 1. Fetch all active employees in enterprise
    const activeEmployees = await Employee.find({
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle employeeCategory').lean();

    // Fallback if Employee collection is empty during test/dev
    let employeePool = activeEmployees;
    if (employeePool.length === 0) {
      const userPool = await User.find({ isActive: true }).select('employeeId name email department designation role').lean();
      employeePool = userPool.map(u => ({
        employeeId: u.employeeId || 'EMP-' + u._id.toString().slice(-4),
        fullName: u.name,
        departmentName: u.department || 'General',
        designationTitle: u.designation || 'Staff'
      }));
    }

    const totalEmployeesCount = employeePool.length;

    // 2. Fetch all Canteen records for selected date
    const records = await CanteenLunchRecord.find({ date: selectedDate }).lean();

    // Map records by employeeId
    const recordMap = new Map();
    records.forEach(r => {
      if (r.employeeId) recordMap.set(r.employeeId.toUpperCase(), r);
    });

    // 3. Compute live metrics
    // Unique lunch IN records
    const lunchInRecords = records.filter(r => r.lunchInAt);
    const lunchInCount = lunchInRecords.length; // Unique because compound index employeeId+date

    const fullDishRecords = records.filter(r => r.lunchInAt && r.dishType === 'Full Dish');
    const fullDishCount = fullDishRecords.length;

    const halfDishRecords = records.filter(r => r.lunchInAt && r.dishType === 'Half Dish');
    const halfDishCount = halfDishRecords.length;

    const lunchOutRecords = records.filter(r => r.lunchOutAt);
    const lunchOutCount = lunchOutRecords.length;

    const currentlyInRecords = records.filter(r => r.lunchInAt && !r.lunchOutAt);
    const currentlyInCount = currentlyInRecords.length;

    const completedRecords = records.filter(r => r.lunchInAt && r.lunchOutAt);
    const completedCount = completedRecords.length;

    const notMarkedCount = Math.max(0, totalEmployeesCount - lunchInCount);
    const expectedLunchCount = lunchInCount; // Lunch required = unique employees with Lunch IN

    const isFinalized = records.length > 0 && records.every(r => r.finalized);
    const firstFinalized = records.find(r => r.finalized);

    // 4. Build complete employee table with statuses
    const employeeRows = employeePool.map((emp, index) => {
      const empId = (emp.employeeId || emp.employeeCode || `EMP-${index + 1}`).toUpperCase();
      const rec = recordMap.get(empId);
      const name = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
      const dept = emp.departmentName || emp.department || 'General';
      const desig = emp.designationTitle || emp.designation || 'Staff';

      let status = 'NOT_MARKED';
      let durationDisplay = '--';
      let durationMinutes = 0;

      if (rec && rec.lunchInAt) {
        if (rec.lunchOutAt) {
          status = rec.finalized ? 'FINALIZED' : 'COMPLETED';
          durationMinutes = rec.durationMinutes || 0;
          durationDisplay = `${durationMinutes} min`;
        } else {
          status = 'IN';
          const elapsed = Math.max(0, Math.round((Date.now() - new Date(rec.lunchInAt).getTime()) / (1000 * 60)));
          durationMinutes = elapsed;
          durationDisplay = `${elapsed} min (In Progress)`;
        }
      }

      return {
        id: rec?._id || `temp-${empId}`,
        recordId: rec?._id || null,
        employeeId: empId,
        employeeName: name,
        department: dept,
        designation: desig,
        date: selectedDate,
        dateDisplay: formatDateDisplay(selectedDate),
        dishType: rec?.dishType || null,
        lunchInAt: rec?.lunchInAt || null,
        lunchInDisplay: formatTimeDisplay(rec?.lunchInAt),
        lunchOutAt: rec?.lunchOutAt || null,
        lunchOutDisplay: formatTimeDisplay(rec?.lunchOutAt),
        durationMinutes,
        durationDisplay,
        status,
        finalized: Boolean(rec?.finalized),
        correctionReason: rec?.correctionReason || null,
        createdAt: rec?.createdAt || null,
        updatedAt: rec?.updatedAt || null
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        date: selectedDate,
        dateDisplay: formatDateDisplay(selectedDate),
        summary: {
          totalEmployees: totalEmployeesCount,
          lunchRequired: expectedLunchCount,
          lunchIn: lunchInCount,
          fullDishCount,
          halfDishCount,
          lunchOut: lunchOutCount,
          currentlyIn: currentlyInCount,
          completed: completedCount,
          notMarked: notMarkedCount,
          expectedLunchCount: expectedLunchCount
        },
        isFinalized,
        finalizedAt: firstFinalized?.finalizedAt || null,
        finalizedByName: firstFinalized?.finalizedByName || null,
        employees: employeeRows
      }
    });
  } catch (error) {
    console.error('[Canteen getHRTodayDashboard Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch HR Canteen Dashboard'
    });
  }
};

/**
 * GET /api/hrms/canteen/department-summary
 * Returns department-wise counts for the selected date
 */
exports.getDepartmentSummary = async (req, res) => {
  try {
    const selectedDate = req.query.date ? getTodayKolkataDate(req.query.date) : getTodayKolkataDate();

    // Fetch active employees grouped by department
    const activeEmployees = await Employee.find({
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    }).select('employeeId employeeCode department departmentName').lean();

    const records = await CanteenLunchRecord.find({ date: selectedDate }).lean();
    const recordMap = new Map();
    records.forEach(r => {
      if (r.employeeId) recordMap.set(r.employeeId.toUpperCase(), r);
    });

    // Aggregate department metrics
    const deptMap = new Map();

    activeEmployees.forEach(emp => {
      const deptName = emp.departmentName || emp.department || 'General';
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          department: deptName,
          totalEmployees: 0,
          lunchIn: 0,
          fullDish: 0,
          halfDish: 0,
          lunchOut: 0,
          completed: 0,
          currentlyIn: 0,
          notMarked: 0,
          lunchRequired: 0
        });
      }

      const stat = deptMap.get(deptName);
      stat.totalEmployees++;

      const empId = (emp.employeeId || emp.employeeCode || '').toUpperCase();
      const rec = recordMap.get(empId);

      if (rec && rec.lunchInAt) {
        stat.lunchIn++;
        stat.lunchRequired++;
        if (rec.dishType === 'Full Dish') {
          stat.fullDish++;
        } else if (rec.dishType === 'Half Dish') {
          stat.halfDish++;
        }
        if (rec.lunchOutAt) {
          stat.lunchOut++;
          stat.completed++;
        } else {
          stat.currentlyIn++;
        }
      } else {
        stat.notMarked++;
      }
    });

    const departmentList = Array.from(deptMap.values()).sort((a, b) => b.totalEmployees - a.totalEmployees);

    return res.status(200).json({
      success: true,
      date: selectedDate,
      dateDisplay: formatDateDisplay(selectedDate),
      data: departmentList
    });
  } catch (error) {
    console.error('[Canteen getDepartmentSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch department summary'
    });
  }
};

/**
 * GET /api/hrms/canteen/history
 * HR historical records with filtering
 */
exports.getHRHistory = async (req, res) => {
  try {
    const { startDate, endDate, date, department, status, search, limit = 100 } = req.query;

    const query = {};

    if (date) {
      query.date = date;
    } else if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { employeeId: { $regex: s, $options: 'i' } },
        { employeeName: { $regex: s, $options: 'i' } },
        { department: { $regex: s, $options: 'i' } },
        { designation: { $regex: s, $options: 'i' } }
      ];
    }

    const records = await CanteenLunchRecord.find(query)
      .sort({ date: -1, lunchInAt: -1 })
      .limit(Number(limit))
      .lean();

    const formatted = records.map(r => ({
      id: r._id,
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      department: r.department,
      designation: r.designation,
      date: r.date,
      dateDisplay: formatDateDisplay(r.date),
      dishType: r.dishType || null,
      lunchInAt: r.lunchInAt,
      lunchInDisplay: formatTimeDisplay(r.lunchInAt),
      lunchOutAt: r.lunchOutAt,
      lunchOutDisplay: formatTimeDisplay(r.lunchOutAt),
      durationMinutes: r.durationMinutes || 0,
      durationDisplay: r.lunchOutAt ? `${r.durationMinutes || 0} min` : (r.lunchInAt ? 'In Progress' : '--'),
      status: r.status,
      finalized: r.finalized,
      correctionReason: r.correctionReason,
      correctedBy: r.correctedBy,
      correctedAt: r.correctedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('[Canteen getHRHistory Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch HR canteen history'
    });
  }
};

/**
 * POST /api/hrms/canteen/finalize
 * Finalize daily lunch count (Locks records & preserves audit snapshot)
 */
exports.finalizeDay = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date ? getTodayKolkataDate(date) : getTodayKolkataDate();

    const hrUser = req.user || { name: 'HR Admin', _id: null };
    const now = new Date();

    const updateResult = await CanteenLunchRecord.updateMany(
      { date: targetDate },
      {
        $set: {
          finalized: true,
          finalizedAt: now,
          finalizedBy: String(hrUser._id || hrUser.id || 'HR'),
          finalizedByName: hrUser.name || 'HR Administrator'
        }
      }
    );

    // Fetch final counts for audit logging
    const records = await CanteenLunchRecord.find({ date: targetDate });
    const lunchInCount = records.filter(r => r.lunchInAt).length;
    const lunchOutCount = records.filter(r => r.lunchOutAt).length;

    await recordCanteenAudit({
      req,
      action: 'DAY_FINALIZATION',
      details: `HR User ${hrUser.name} finalized Canteen Lunch records for date ${formatDateDisplay(targetDate)}. Total Lunch Records: ${records.length}, Lunch IN: ${lunchInCount}, Lunch OUT: ${lunchOutCount}.`,
      reason: req.body.reason || 'Official Daily Canteen Finalization',
      newData: {
        date: targetDate,
        finalizedCount: updateResult.modifiedCount,
        lunchInCount,
        lunchOutCount,
        finalizedAt: now,
        finalizedByName: hrUser.name
      }
    });

    return res.status(200).json({
      success: true,
      message: `Daily Canteen Count for ${formatDateDisplay(targetDate)} finalized successfully.`,
      data: {
        date: targetDate,
        dateDisplay: formatDateDisplay(targetDate),
        finalized: true,
        finalizedAt: now,
        finalizedByName: hrUser.name,
        recordsUpdated: updateResult.modifiedCount
      }
    });
  } catch (error) {
    console.error('[Canteen finalizeDay Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to finalize canteen day'
    });
  }
};

/**
 * POST /api/hrms/canteen/reopen
 * Reopen a finalized day (Requires authorization reason & audit log)
 */
exports.reopenDay = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed authorization reason (min 5 characters) is required to reopen a finalized day.'
      });
    }

    const targetDate = date ? getTodayKolkataDate(date) : getTodayKolkataDate();
    const hrUser = req.user || { name: 'HR Admin', _id: null };

    const updateResult = await CanteenLunchRecord.updateMany(
      { date: targetDate },
      {
        $set: {
          finalized: false,
          finalizedAt: null,
          finalizedBy: null,
          finalizedByName: null
        }
      }
    );

    await recordCanteenAudit({
      req,
      action: 'DAY_REOPEN',
      details: `HR User ${hrUser.name} unlocked/reopened Canteen Lunch records for date ${formatDateDisplay(targetDate)}. Reason: ${reason}`,
      reason: reason,
      newData: {
        date: targetDate,
        reopenedCount: updateResult.modifiedCount,
        reopenedBy: hrUser.name
      }
    });

    return res.status(200).json({
      success: true,
      message: `Canteen records for ${formatDateDisplay(targetDate)} reopened successfully.`,
      data: {
        date: targetDate,
        finalized: false
      }
    });
  } catch (error) {
    console.error('[Canteen reopenDay Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reopen canteen day'
    });
  }
};

/**
 * POST /api/hrms/canteen/correction
 * HR Correction of an employee lunch record with mandatory reason
 */
exports.correctRecord = async (req, res) => {
  try {
    const { recordId, employeeId, date, dishType, lunchInTime, lunchOutTime, status, reason } = req.body;

    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'A correction reason is required for audit compliance.'
      });
    }

    let record = null;
    if (recordId && mongoose.isValidObjectId(recordId)) {
      record = await CanteenLunchRecord.findById(recordId);
    }

    if (!record && employeeId && date) {
      record = await CanteenLunchRecord.findOne({
        employeeId: employeeId.toUpperCase(),
        date: getTodayKolkataDate(date)
      });
    }

    const targetDate = date ? getTodayKolkataDate(date) : (record?.date || getTodayKolkataDate());

    // If record doesn't exist yet, we can create one for the employee
    if (!record && employeeId) {
      const emp = await Employee.findOne({
        $or: [{ employeeId: employeeId.toUpperCase() }, { employeeCode: employeeId.toUpperCase() }]
      });

      record = new CanteenLunchRecord({
        employeeId: employeeId.toUpperCase(),
        employeeCode: employeeId.toUpperCase(),
        employeeName: emp?.fullName || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || 'Employee',
        department: emp?.departmentName || emp?.department || 'General',
        designation: emp?.designationTitle || emp?.designation || 'Staff',
        date: targetDate
      });
    }

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Canteen lunch record not found.'
      });
    }

    const oldData = {
      lunchInAt: record.lunchInAt,
      lunchOutAt: record.lunchOutAt,
      dishType: record.dishType,
      durationMinutes: record.durationMinutes,
      status: record.status
    };

    if (dishType && ['Full Dish', 'Half Dish'].includes(dishType)) {
      record.dishType = dishType;
    }

    // Parse provided times if given
    if (lunchInTime) {
      // Expecting 'HH:mm' or ISO date string
      if (lunchInTime.includes('T')) {
        record.lunchInAt = new Date(lunchInTime);
      } else {
        const [hh, mm] = lunchInTime.split(':');
        const inDate = new Date(`${targetDate}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+05:30`);
        record.lunchInAt = inDate;
      }
    }

    if (lunchOutTime) {
      if (lunchOutTime.includes('T')) {
        record.lunchOutAt = new Date(lunchOutTime);
      } else {
        const [hh, mm] = lunchOutTime.split(':');
        const outDate = new Date(`${targetDate}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+05:30`);
        record.lunchOutAt = outDate;
      }
    }

    // Calculate duration
    if (record.lunchInAt && record.lunchOutAt) {
      const diffMs = new Date(record.lunchOutAt).getTime() - new Date(record.lunchInAt).getTime();
      record.durationMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
      record.status = status || 'COMPLETED';
    } else if (record.lunchInAt) {
      record.status = status || 'IN';
    }

    const hrUser = req.user || { name: 'HR Admin' };
    record.correctionReason = reason;
    record.correctedBy = hrUser.name;
    record.correctedAt = new Date();

    await record.save();

    await recordCanteenAudit({
      req,
      action: 'HR_RECORD_CORRECTION',
      details: `HR User ${hrUser.name} corrected Canteen Lunch record for ${record.employeeName} (${record.employeeId}) on ${formatDateDisplay(targetDate)}. Reason: ${reason}`,
      recordId: record._id,
      targetEmployeeId: record.employeeId,
      targetEmployeeName: record.employeeName,
      oldData,
      newData: {
        lunchInAt: record.lunchInAt,
        lunchOutAt: record.lunchOutAt,
        dishType: record.dishType,
        durationMinutes: record.durationMinutes,
        status: record.status,
        correctionReason: reason
      },
      reason
    });

    return res.status(200).json({
      success: true,
      message: 'Canteen record corrected successfully',
      data: {
        id: record._id,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department,
        designation: record.designation,
        date: record.date,
        dishType: record.dishType || null,
        lunchInAt: record.lunchInAt,
        lunchInDisplay: formatTimeDisplay(record.lunchInAt),
        lunchOutAt: record.lunchOutAt,
        lunchOutDisplay: formatTimeDisplay(record.lunchOutAt),
        durationMinutes: record.durationMinutes,
        status: record.status,
        correctionReason: record.correctionReason
      }
    });
  } catch (error) {
    console.error('[Canteen correctRecord Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to correct canteen record'
    });
  }
};

// ==============================================================================
// 3. EXCEL EXPORT CONTROLLER (DAILY & MONTHLY PROFESSIONAL WORKBOOKS)
// ==============================================================================

/**
 * GET /api/hrms/canteen/export
 * Exports Daily Canteen Report (.xlsx) with 3 Sheets:
 * 1. Daily Summary
 * 2. Employee Lunch Details
 * 3. Department Summary
 */
exports.exportExcel = async (req, res) => {
  try {
    const selectedDate = req.query.date ? getTodayKolkataDate(req.query.date) : getTodayKolkataDate();
    const hrUser = req.user || { name: 'HR Administrator' };

    // 1. Fetch active employees
    const activeEmployees = await Employee.find({
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle').lean();

    const totalEmployeesCount = activeEmployees.length;

    // 2. Fetch Canteen records for selectedDate
    const records = await CanteenLunchRecord.find({ date: selectedDate }).lean();
    const recordMap = new Map();
    records.forEach(r => {
      if (r.employeeId) recordMap.set(r.employeeId.toUpperCase(), r);
    });

    // 3. Compute counts
    const lunchInCount = records.filter(r => r.lunchInAt).length;
    const lunchOutCount = records.filter(r => r.lunchOutAt).length;
    const currentlyInCount = records.filter(r => r.lunchInAt && !r.lunchOutAt).length;
    const completedCount = records.filter(r => r.lunchInAt && r.lunchOutAt).length;
    const notMarkedCount = Math.max(0, totalEmployeesCount - lunchInCount);
    const lunchRequired = lunchInCount;
    const fullDishCount = records.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
    const halfDishCount = records.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;

    // 4. Create ExcelJS Workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BJK Healthcare Digital Brain';
    workbook.lastModifiedBy = hrUser.name || 'HR Admin';
    workbook.created = new Date();
    workbook.modified = new Date();

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00A896' } // BJK Teal
    };
    const headerFont = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    const subHeaderFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F4F1' } // Pale Teal
    };
    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    // -------------------------------------------------------------
    // SHEET 1: Daily Summary
    // -------------------------------------------------------------
    const wsSummary = workbook.addWorksheet('Daily Summary', {
      views: [{ showGridLines: true }]
    });

    wsSummary.columns = [
      { width: 5 },
      { width: 32 },
      { width: 22 },
      { width: 20 }
    ];

    // Title Banner
    wsSummary.mergeCells('B2:D2');
    const titleCell = wsSummary.getCell('B2');
    titleCell.value = 'BJK HEALTHCARE — CANTEEN LUNCH REPORT';
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF00A896' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsSummary.getRow(2).height = 30;

    // Metadata
    wsSummary.getCell('B4').value = 'Date:';
    wsSummary.getCell('B4').font = { bold: true };
    wsSummary.getCell('C4').value = formatDateDisplay(selectedDate);

    wsSummary.getCell('B5').value = 'Report Generated At:';
    wsSummary.getCell('B5').font = { bold: true };
    wsSummary.getCell('C5').value = `${formatDateDisplay(new Date())} ${formatTimeDisplay(new Date())}`;

    wsSummary.getCell('B6').value = 'Generated By HR:';
    wsSummary.getCell('B6').font = { bold: true };
    wsSummary.getCell('C6').value = hrUser.name || 'HR Administrator';

    // Summary Table Headers
    wsSummary.getRow(8).values = ['', 'Metric', 'Count', 'Status / Remarks'];
    const hRow = wsSummary.getRow(8);
    hRow.height = 24;
    ['B8', 'C8', 'D8'].forEach(c => {
      wsSummary.getCell(c).fill = headerFill;
      wsSummary.getCell(c).font = headerFont;
      wsSummary.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const summaryData = [
      ['Total Employees', totalEmployeesCount, 'Active Enterprise Workforce'],
      ['Lunch Required (Unique Lunch IN)', lunchRequired, 'Food Preparation Target'],
      ['  • Full Dish Portions', fullDishCount, 'Full Meal / Thali Orders'],
      ['  • Half Dish Portions', halfDishCount, 'Half Meal / Light Portions'],
      ['Lunch IN', lunchInCount, 'Employees Recorded IN'],
      ['Lunch OUT', lunchOutCount, 'Employees Recorded OUT'],
      ['Currently IN', currentlyInCount, 'Dining Active'],
      ['Not Marked / Not Taking', notMarkedCount, 'Expected Non-Diners']
    ];

    summaryData.forEach((row, i) => {
      const rNum = 9 + i;
      const r = wsSummary.getRow(rNum);
      r.values = ['', row[0], row[1], row[2]];
      r.height = 20;

      const isReq = row[0].includes('Lunch Required');
      ['B', 'C', 'D'].forEach(col => {
        const cell = wsSummary.getCell(`${col}${rNum}`);
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10, bold: isReq };
        cell.alignment = col === 'C' ? { horizontal: 'center', vertical: 'middle' } : { horizontal: 'left', vertical: 'middle' };
        if (isReq) {
          cell.fill = subHeaderFill;
          cell.font = { bold: true, color: { argb: 'FF00A896' } };
        }
      });
    });

    // -------------------------------------------------------------
    // SHEET 2: Employee Lunch Details
    // -------------------------------------------------------------
    const wsDetails = workbook.addWorksheet('Employee Lunch Details', {
      views: [{ showGridLines: true }]
    });

    wsDetails.columns = [
      { header: 'Sr. No.', key: 'srNo', width: 8 },
      { header: 'Employee ID', key: 'employeeId', width: 16 },
      { header: 'Employee Name', key: 'employeeName', width: 26 },
      { header: 'Department', key: 'department', width: 22 },
      { header: 'Designation', key: 'designation', width: 22 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Dish Type', key: 'dishType', width: 16 },
      { header: 'Lunch IN', key: 'lunchIn', width: 14 },
      { header: 'Lunch OUT', key: 'lunchOut', width: 14 },
      { header: 'Duration (min)', key: 'duration', width: 16 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Record Created At', key: 'createdAt', width: 20 },
      { header: 'Record Updated At', key: 'updatedAt', width: 20 }
    ];

    const detHRow = wsDetails.getRow(1);
    detHRow.height = 26;
    detHRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Populate rows
    activeEmployees.forEach((emp, idx) => {
      const empId = (emp.employeeId || emp.employeeCode || `EMP-${idx + 1}`).toUpperCase();
      const rec = recordMap.get(empId);
      const name = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
      const dept = emp.departmentName || emp.department || 'General';
      const desig = emp.designationTitle || emp.designation || 'Staff';

      let statusStr = 'NOT MARKED';
      let durationStr = '--';
      if (rec && rec.lunchInAt) {
        if (rec.lunchOutAt) {
          statusStr = rec.finalized ? 'FINALIZED' : 'COMPLETED';
          durationStr = `${rec.durationMinutes || 0}`;
        } else {
          statusStr = 'IN';
          durationStr = 'In Progress';
        }
      }

      const row = wsDetails.addRow({
        srNo: idx + 1,
        employeeId: empId,
        employeeName: name,
        department: dept,
        designation: desig,
        date: formatDateDisplay(selectedDate),
        dishType: rec?.dishType || '--',
        lunchIn: formatTimeDisplay(rec?.lunchInAt),
        lunchOut: formatTimeDisplay(rec?.lunchOutAt),
        duration: durationStr,
        status: statusStr,
        createdAt: rec?.createdAt ? `${formatDateDisplay(rec.createdAt)} ${formatTimeDisplay(rec.createdAt)}` : '--',
        updatedAt: rec?.updatedAt ? `${formatDateDisplay(rec.updatedAt)} ${formatTimeDisplay(rec.updatedAt)}` : '--'
      });

      row.height = 20;
      row.eachCell(cell => {
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10 };
      });
    });

    // -------------------------------------------------------------
    // SHEET 3: Department Summary
    // -------------------------------------------------------------
    const wsDept = workbook.addWorksheet('Department Summary', {
      views: [{ showGridLines: true }]
    });

    wsDept.columns = [
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Total Employees', key: 'totalEmployees', width: 18 },
      { header: 'Lunch IN', key: 'lunchIn', width: 14 },
      { header: 'Full Dish', key: 'fullDish', width: 14 },
      { header: 'Half Dish', key: 'halfDish', width: 14 },
      { header: 'Lunch OUT', key: 'lunchOut', width: 14 },
      { header: 'Currently IN', key: 'currentlyIn', width: 16 },
      { header: 'Not Marked', key: 'notMarked', width: 16 },
      { header: 'Lunch Required', key: 'lunchRequired', width: 18 }
    ];

    const deptHRow = wsDept.getRow(1);
    deptHRow.height = 26;
    deptHRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Aggregate department stats
    const deptStats = new Map();
    activeEmployees.forEach(emp => {
      const deptName = emp.departmentName || emp.department || 'General';
      if (!deptStats.has(deptName)) {
        deptStats.set(deptName, {
          department: deptName,
          totalEmployees: 0,
          lunchIn: 0,
          fullDish: 0,
          halfDish: 0,
          lunchOut: 0,
          currentlyIn: 0,
          notMarked: 0,
          lunchRequired: 0
        });
      }
      const st = deptStats.get(deptName);
      st.totalEmployees++;
      const empId = (emp.employeeId || emp.employeeCode || '').toUpperCase();
      const rec = recordMap.get(empId);
      if (rec && rec.lunchInAt) {
        st.lunchIn++;
        st.lunchRequired++;
        if (rec.dishType === 'Full Dish') {
          st.fullDish++;
        } else if (rec.dishType === 'Half Dish') {
          st.halfDish++;
        }
        if (rec.lunchOutAt) {
          st.lunchOut++;
        } else {
          st.currentlyIn++;
        }
      } else {
        st.notMarked++;
      }
    });

    Array.from(deptStats.values()).forEach(st => {
      const row = wsDept.addRow({
        department: st.department,
        totalEmployees: st.totalEmployees,
        lunchIn: st.lunchIn,
        fullDish: st.fullDish,
        halfDish: st.halfDish,
        lunchOut: st.lunchOut,
        currentlyIn: st.currentlyIn,
        notMarked: st.notMarked,
        lunchRequired: st.lunchRequired
      });
      row.height = 20;
      row.eachCell((cell, colNumber) => {
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10 };
        if (colNumber > 1) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });
    });

    await recordCanteenAudit({
      req,
      action: 'EXCEL_EXPORT_DAILY',
      details: `HR User ${hrUser.name} exported Daily Canteen Lunch Excel Report for ${formatDateDisplay(selectedDate)} (Full Dish: ${fullDishCount}, Half Dish: ${halfDishCount})`,
      newData: {
        date: selectedDate,
        totalEmployees: totalEmployeesCount,
        lunchRequired,
        fullDishCount,
        halfDishCount
      }
    });

    const filename = `BJK_Canteen_Daily_Report_${selectedDate}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[Canteen exportExcel Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Excel report'
    });
  }
};

/**
 * GET /api/hrms/canteen/export-monthly
 * Exports Monthly Canteen Report (.xlsx) with 4 Sheets:
 * 1. Monthly Summary
 * 2. Daily Lunch Counts
 * 3. Employee-wise Records
 * 4. Department-wise Summary
 */
exports.exportMonthlyExcel = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = year ? Number(year) : now.getFullYear();
    const targetMonth = month ? Number(month) : (now.getMonth() + 1);

    const monthStr = String(targetMonth).padStart(2, '0');
    const monthPrefix = `${targetYear}-${monthStr}`;
    const monthName = new Date(targetYear, targetMonth - 1, 1).toLocaleString('en-US', { month: 'long' });
    const hrUser = req.user || { name: 'HR Administrator' };

    // Fetch active employees
    const activeEmployees = await Employee.find({
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle').lean();

    // Fetch all records for the month
    const records = await CanteenLunchRecord.find({
      date: { $regex: `^${monthPrefix}` }
    }).sort({ date: 1, employeeId: 1 }).lean();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BJK Healthcare Digital Brain';
    workbook.lastModifiedBy = hrUser.name || 'HR Admin';
    workbook.created = new Date();
    workbook.modified = new Date();

    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00A896' } // BJK Teal
    };
    const headerFont = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' }
    };
    const borderStyle = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    // Sheet 1: Monthly Summary
    const wsSummary = workbook.addWorksheet('Monthly Summary', { views: [{ showGridLines: true }] });
    wsSummary.columns = [{ width: 5 }, { width: 32 }, { width: 22 }, { width: 25 }];

    wsSummary.mergeCells('B2:D2');
    const titleCell = wsSummary.getCell('B2');
    titleCell.value = `BJK HEALTHCARE — CANTEEN MONTHLY REPORT (${monthName.toUpperCase()} ${targetYear})`;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF00A896' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    wsSummary.getRow(2).height = 30;

    wsSummary.getCell('B4').value = 'Month:';
    wsSummary.getCell('B4').font = { bold: true };
    wsSummary.getCell('C4').value = `${monthName} ${targetYear}`;

    wsSummary.getCell('B5').value = 'Generated By:';
    wsSummary.getCell('B5').font = { bold: true };
    wsSummary.getCell('C5').value = hrUser.name || 'HR Administrator';

    wsSummary.getCell('B6').value = 'Total Active Workforce:';
    wsSummary.getCell('B6').font = { bold: true };
    wsSummary.getCell('C6').value = activeEmployees.length;

    const totalMonthlyLunches = records.filter(r => r.lunchInAt).length;
    const totalFullDishes = records.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
    const totalHalfDishes = records.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;

    wsSummary.getCell('B7').value = 'Total Monthly Lunch Count:';
    wsSummary.getCell('B7').font = { bold: true };
    wsSummary.getCell('C7').value = totalMonthlyLunches;

    wsSummary.getCell('B8').value = '  • Total Full Dish Portions:';
    wsSummary.getCell('B8').font = { bold: true };
    wsSummary.getCell('C8').value = totalFullDishes;

    wsSummary.getCell('B9').value = '  • Total Half Dish Portions:';
    wsSummary.getCell('B9').font = { bold: true };
    wsSummary.getCell('C9').value = totalHalfDishes;

    // Sheet 2: Daily Lunch Counts
    const wsDaily = workbook.addWorksheet('Daily Lunch Counts', { views: [{ showGridLines: true }] });
    wsDaily.columns = [
      { header: 'Date', key: 'date', width: 16 },
      { header: 'Day', key: 'day', width: 14 },
      { header: 'Total Workforce', key: 'totalWorkforce', width: 18 },
      { header: 'Lunch Required / IN', key: 'lunchIn', width: 22 },
      { header: 'Full Dish', key: 'fullDish', width: 14 },
      { header: 'Half Dish', key: 'halfDish', width: 14 },
      { header: 'Lunch Completed', key: 'lunchCompleted', width: 18 },
      { header: 'Missing Out', key: 'missingOut', width: 16 },
      { header: 'Not Marked', key: 'notMarked', width: 16 }
    ];

    const dHRow = wsDaily.getRow(1);
    dHRow.height = 26;
    dHRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${targetYear}-${monthStr}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(targetYear, targetMonth - 1, day);
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecords = records.filter(r => r.date === dStr);
      const dLunchIn = dayRecords.filter(r => r.lunchInAt).length;
      const dFull = dayRecords.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
      const dHalf = dayRecords.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;
      const dLunchCompleted = dayRecords.filter(r => r.lunchInAt && r.lunchOutAt).length;
      const dMissing = dayRecords.filter(r => r.lunchInAt && !r.lunchOutAt).length;
      const dNotMarked = Math.max(0, activeEmployees.length - dLunchIn);

      const row = wsDaily.addRow({
        date: formatDateDisplay(dStr),
        day: dayName,
        totalWorkforce: activeEmployees.length,
        lunchIn: dLunchIn,
        fullDish: dFull,
        halfDish: dHalf,
        lunchCompleted: dLunchCompleted,
        missingOut: dMissing,
        notMarked: dNotMarked
      });
      row.height = 20;
      row.eachCell(cell => {
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10 };
      });
    }

    // Sheet 3: Employee-wise Records
    const wsEmpRecords = workbook.addWorksheet('Employee-wise Records', { views: [{ showGridLines: true }] });
    wsEmpRecords.columns = [
      { header: 'Sr.', key: 'sr', width: 6 },
      { header: 'Date', key: 'date', width: 14 },
      { header: 'Employee ID', key: 'employeeId', width: 16 },
      { header: 'Employee Name', key: 'employeeName', width: 24 },
      { header: 'Department', key: 'department', width: 22 },
      { header: 'Dish Type', key: 'dishType', width: 16 },
      { header: 'Lunch IN', key: 'lunchIn', width: 14 },
      { header: 'Lunch OUT', key: 'lunchOut', width: 14 },
      { header: 'Duration (min)', key: 'duration', width: 16 },
      { header: 'Status', key: 'status', width: 14 }
    ];
    const eHRow = wsEmpRecords.getRow(1);
    eHRow.height = 26;
    eHRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    records.forEach((r, idx) => {
      const row = wsEmpRecords.addRow({
        sr: idx + 1,
        date: formatDateDisplay(r.date),
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        department: r.department,
        dishType: r.dishType || '--',
        lunchIn: formatTimeDisplay(r.lunchInAt),
        lunchOut: formatTimeDisplay(r.lunchOutAt),
        duration: r.lunchOutAt ? `${r.durationMinutes || 0}` : '--',
        status: r.status
      });
      row.height = 20;
      row.eachCell(cell => {
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10 };
      });
    });

    // Sheet 4: Department-wise Summary
    const wsDeptSummary = workbook.addWorksheet('Department-wise Summary', { views: [{ showGridLines: true }] });
    wsDeptSummary.columns = [
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Total Workforce', key: 'totalWorkforce', width: 18 },
      { header: 'Monthly Total Lunches Taken', key: 'monthlyLunches', width: 28 },
      { header: 'Full Dishes', key: 'fullDishes', width: 16 },
      { header: 'Half Dishes', key: 'halfDishes', width: 16 },
      { header: 'Avg Lunches / Day', key: 'avgDaily', width: 20 }
    ];
    const depHRow = wsDeptSummary.getRow(1);
    depHRow.height = 26;
    depHRow.eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const deptMap = new Map();
    activeEmployees.forEach(e => {
      const d = e.departmentName || e.department || 'General';
      if (!deptMap.has(d)) deptMap.set(d, { department: d, totalWorkforce: 0, monthlyLunches: 0, fullDishes: 0, halfDishes: 0 });
      deptMap.get(d).totalWorkforce++;
    });
    records.forEach(r => {
      if (r.lunchInAt) {
        const d = r.department || 'General';
        if (!deptMap.has(d)) deptMap.set(d, { department: d, totalWorkforce: 0, monthlyLunches: 0, fullDishes: 0, halfDishes: 0 });
        const entry = deptMap.get(d);
        entry.monthlyLunches++;
        if (r.dishType === 'Full Dish') entry.fullDishes++;
        else if (r.dishType === 'Half Dish') entry.halfDishes++;
      }
    });

    Array.from(deptMap.values()).forEach(st => {
      const avg = daysInMonth > 0 ? (st.monthlyLunches / daysInMonth).toFixed(1) : '0.0';
      const row = wsDeptSummary.addRow({
        department: st.department,
        totalWorkforce: st.totalWorkforce,
        monthlyLunches: st.monthlyLunches,
        fullDishes: st.fullDishes,
        halfDishes: st.halfDishes,
        avgDaily: avg
      });
      row.height = 20;
      row.eachCell(cell => {
        cell.border = borderStyle;
        cell.font = { name: 'Segoe UI', size: 10 };
      });
    });

    await recordCanteenAudit({
      req,
      action: 'EXCEL_EXPORT_MONTHLY',
      details: `HR User ${hrUser.name} exported Monthly Canteen Report for ${monthName} ${targetYear}`,
      newData: {
        year: targetYear,
        month: targetMonth,
        totalMonthlyLunchRecords: records.length
      }
    });

    const filename = `BJK_Canteen_Monthly_Report_${monthName}_${targetYear}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[Canteen exportMonthlyExcel Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Monthly Excel report'
    });
  }
};

/**
 * GET /api/hrms/canteen/audit
 * Returns Audit trail for Canteen module
 */
exports.getAuditHistory = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find({ module: 'CANTEEN' })
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('[Canteen getAuditHistory Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch canteen audit history'
    });
  }
};

// ==============================================================================
// 4. DEDICATED CANTEEN DEPARTMENT PORTAL ACTIONS
// ==============================================================================

/**
 * GET /api/canteen/employees
 * Returns searchable list of employees with their today's canteen lunch status
 */
exports.getCanteenEmployees = async (req, res) => {
  try {
    const { q, department, status, date } = req.query;
    const targetDate = date ? getTodayKolkataDate(date) : getTodayKolkataDate();

    // 1. Fetch active employees (canteen-operational fields only - no salary, bank, private data)
    let query = {
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    };

    if (department && department !== 'ALL' && department !== 'All Departments') {
      query.$and = [
        {
          $or: [
            { department: department },
            { departmentName: department }
          ]
        }
      ];
    }

    const employees = await Employee.find(query)
      .select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle')
      .lean();

    // 2. Fetch canteen records for targetDate
    const records = await CanteenLunchRecord.find({ date: targetDate }).lean();
    const recordMap = new Map();
    records.forEach(r => {
      if (r.employeeId) recordMap.set(r.employeeId.toUpperCase(), r);
    });

    let list = employees.map((emp, index) => {
      const empId = (emp.employeeId || emp.employeeCode || `EMP-${index + 1}`).toUpperCase();
      const rec = recordMap.get(empId);
      const name = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
      const dept = emp.departmentName || emp.department || 'General';
      const desig = emp.designationTitle || emp.designation || 'Staff';

      let lunchStatus = 'NOT_MARKED';
      let durationDisplay = '--';
      let durationMinutes = 0;

      if (rec && rec.lunchInAt) {
        if (rec.lunchOutAt) {
          lunchStatus = rec.finalized ? 'FINALIZED' : 'COMPLETED';
          durationMinutes = rec.durationMinutes || 0;
          durationDisplay = `${durationMinutes} min`;
        } else {
          lunchStatus = 'IN';
          const elapsed = Math.max(0, Math.round((Date.now() - new Date(rec.lunchInAt).getTime()) / (1000 * 60)));
          durationMinutes = elapsed;
          durationDisplay = `${elapsed} min (In Progress)`;
        }
      }

      return {
        id: rec?._id || `temp-${empId}`,
        employeeId: empId,
        employeeName: name,
        department: dept,
        designation: desig,
        date: targetDate,
        dateDisplay: formatDateDisplay(targetDate),
        dishType: rec?.dishType || null,
        lunchInAt: rec?.lunchInAt || null,
        lunchInDisplay: formatTimeDisplay(rec?.lunchInAt),
        lunchOutAt: rec?.lunchOutAt || null,
        lunchOutDisplay: formatTimeDisplay(rec?.lunchOutAt),
        durationMinutes,
        durationDisplay,
        status: lunchStatus
      };
    });

    // Apply search query filter if provided
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(item =>
        item.employeeId.toLowerCase().includes(term) ||
        item.employeeName.toLowerCase().includes(term) ||
        item.department.toLowerCase().includes(term)
      );
    }

    // Apply status filter if provided
    if (status && status !== 'ALL') {
      list = list.filter(item => {
        if (status === 'NOT_MARKED') return item.status === 'NOT_MARKED';
        if (status === 'IN' || status === 'LUNCH_IN') return item.status === 'IN';
        if (status === 'COMPLETED' || status === 'LUNCH_OUT') return item.status === 'COMPLETED' || item.status === 'FINALIZED';
        return true;
      });
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      date: targetDate,
      dateDisplay: formatDateDisplay(targetDate),
      data: list
    });
  } catch (error) {
    console.error('[Canteen getCanteenEmployees Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee canteen data'
    });
  }
};

/**
 * GET /api/canteen/employee/:employeeId
 * Returns historical canteen records for a specific employee
 */
exports.getCanteenEmployeeHistory = async (req, res) => {
  try {
    const rawId = req.params.employeeId || '';
    const empId = rawId.trim().toUpperCase();

    if (!empId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required.'
      });
    }

    // Fetch employee details (operational info only)
    const emp = await Employee.findOne({
      $or: [{ employeeId: empId }, { employeeCode: empId }]
    }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle').lean();

    const records = await CanteenLunchRecord.find({
      employeeId: empId
    }).sort({ date: -1 }).lean();

    const formattedRecords = records.map(r => ({
      id: r._id,
      date: r.date,
      dateDisplay: formatDateDisplay(r.date),
      dishType: r.dishType || '--',
      lunchInAt: r.lunchInAt,
      lunchInDisplay: formatTimeDisplay(r.lunchInAt),
      lunchOutAt: r.lunchOutAt,
      lunchOutDisplay: formatTimeDisplay(r.lunchOutAt),
      durationMinutes: r.durationMinutes || 0,
      durationDisplay: r.lunchOutAt ? `${r.durationMinutes || 0} min` : (r.lunchInAt ? 'In Progress' : '--'),
      status: r.status,
      finalized: Boolean(r.finalized),
      correctionReason: r.correctionReason || null
    }));

    const totalRecorded = formattedRecords.filter(r => r.lunchInAt).length;
    const totalCompleted = formattedRecords.filter(r => r.lunchInAt && r.lunchOutAt).length;
    const fullDishes = formattedRecords.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
    const halfDishes = formattedRecords.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;

    return res.status(200).json({
      success: true,
      employee: {
        employeeId: emp?.employeeId || empId,
        employeeName: emp?.fullName || `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || 'Employee',
        department: emp?.departmentName || emp?.department || 'General',
        designation: emp?.designationTitle || emp?.designation || 'Staff',
        totalLunchesTaken: totalRecorded,
        totalCompletedLunches: totalCompleted,
        fullDishesCount: fullDishes,
        halfDishesCount: halfDishes
      },
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    console.error('[Canteen getCanteenEmployeeHistory Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch employee canteen history'
    });
  }
};

/**
 * GET /api/canteen/daily-report
 * Returns complete data for Daily Canteen Report UI & Print preview
 */
exports.getDailyReportData = async (req, res) => {
  try {
    const selectedDate = req.query.date ? getTodayKolkataDate(req.query.date) : getTodayKolkataDate();

    // 1. Fetch active employees
    const activeEmployees = await Employee.find({
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle').lean();

    const totalEmployeesCount = activeEmployees.length;

    // 2. Fetch canteen records
    const records = await CanteenLunchRecord.find({ date: selectedDate }).lean();
    const recordMap = new Map();
    records.forEach(r => {
      if (r.employeeId) recordMap.set(r.employeeId.toUpperCase(), r);
    });

    const lunchInCount = records.filter(r => r.lunchInAt).length;
    const fullDishCount = records.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
    const halfDishCount = records.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;
    const lunchOutCount = records.filter(r => r.lunchOutAt).length;
    const currentlyInCount = records.filter(r => r.lunchInAt && !r.lunchOutAt).length;
    const completedCount = records.filter(r => r.lunchInAt && r.lunchOutAt).length;
    const notMarkedCount = Math.max(0, totalEmployeesCount - lunchInCount);

    // 3. Department breakdown
    const deptMap = new Map();
    activeEmployees.forEach(emp => {
      const deptName = emp.departmentName || emp.department || 'General';
      if (!deptMap.has(deptName)) {
        deptMap.set(deptName, {
          department: deptName,
          totalEmployees: 0,
          lunchIn: 0,
          fullDish: 0,
          halfDish: 0,
          lunchOut: 0,
          currentlyIn: 0,
          notMarked: 0,
          lunchRequired: 0
        });
      }
      const st = deptMap.get(deptName);
      st.totalEmployees++;
      const empId = (emp.employeeId || emp.employeeCode || '').toUpperCase();
      const rec = recordMap.get(empId);
      if (rec && rec.lunchInAt) {
        st.lunchIn++;
        st.lunchRequired++;
        if (rec.dishType === 'Full Dish') st.fullDish++;
        else if (rec.dishType === 'Half Dish') st.halfDish++;
        if (rec.lunchOutAt) st.lunchOut++;
        else st.currentlyIn++;
      } else {
        st.notMarked++;
      }
    });

    // 4. Employee rows
    const employeeRows = activeEmployees.map((emp, idx) => {
      const empId = (emp.employeeId || emp.employeeCode || `EMP-${idx + 1}`).toUpperCase();
      const rec = recordMap.get(empId);
      const name = emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
      const dept = emp.departmentName || emp.department || 'General';
      const desig = emp.designationTitle || emp.designation || 'Staff';

      let status = 'NOT_MARKED';
      let durationDisplay = '--';
      if (rec && rec.lunchInAt) {
        if (rec.lunchOutAt) {
          status = rec.finalized ? 'FINALIZED' : 'COMPLETED';
          durationDisplay = `${rec.durationMinutes || 0} min`;
        } else {
          status = 'IN';
          const elapsed = Math.max(0, Math.round((Date.now() - new Date(rec.lunchInAt).getTime()) / (1000 * 60)));
          durationDisplay = `${elapsed} min (In Progress)`;
        }
      }

      return {
        srNo: idx + 1,
        employeeId: empId,
        employeeName: name,
        department: dept,
        designation: desig,
        dishType: rec?.dishType || '--',
        lunchInDisplay: formatTimeDisplay(rec?.lunchInAt),
        lunchOutDisplay: formatTimeDisplay(rec?.lunchOutAt),
        durationDisplay,
        status
      };
    });

    return res.status(200).json({
      success: true,
      reportTitle: 'BJK Healthcare Canteen Daily Report',
      date: selectedDate,
      dateDisplay: formatDateDisplay(selectedDate),
      summary: {
        totalEmployees: totalEmployeesCount,
        lunchRequired: lunchInCount,
        lunchIn: lunchInCount,
        fullDishCount,
        halfDishCount,
        lunchOut: lunchOutCount,
        currentlyIn: currentlyInCount,
        completed: completedCount,
        notMarked: notMarkedCount
      },
      departmentSummary: Array.from(deptMap.values()),
      employees: employeeRows
    });
  } catch (error) {
    console.error('[Canteen getDailyReportData Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate daily canteen report data'
    });
  }
};

/**
 * GET /api/canteen/monthly-report
 * Returns Monthly Canteen Report data & trends
 */
exports.getMonthlyReportData = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = year ? Number(year) : now.getFullYear();
    const targetMonth = month ? Number(month) : (now.getMonth() + 1);

    const monthStr = String(targetMonth).padStart(2, '0');
    const monthPrefix = `${targetYear}-${monthStr}`;
    const monthName = new Date(targetYear, targetMonth - 1, 1).toLocaleString('en-US', { month: 'long' });

    // Active employees
    const activeEmployees = await Employee.find({
      $or: [
        { status: 'ACTIVE' },
        { employmentStatus: 'ACTIVE' },
        { status: { $exists: false } }
      ]
    }).select('employeeId employeeCode firstName lastName fullName department departmentName designation designationTitle').lean();

    // Fetch month records
    const records = await CanteenLunchRecord.find({
      date: { $regex: `^${monthPrefix}` }
    }).sort({ date: 1 }).lean();

    const totalWorkforce = activeEmployees.length;
    const totalMonthlyLunches = records.filter(r => r.lunchInAt).length;
    const totalFullDishes = records.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
    const totalHalfDishes = records.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

    // Daily breakdown
    const dailyBreakdown = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${targetYear}-${monthStr}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(targetYear, targetMonth - 1, day);
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecords = records.filter(r => r.date === dStr);
      const dLunchIn = dayRecords.filter(r => r.lunchInAt).length;
      const dFull = dayRecords.filter(r => r.lunchInAt && r.dishType === 'Full Dish').length;
      const dHalf = dayRecords.filter(r => r.lunchInAt && r.dishType === 'Half Dish').length;
      const dCompleted = dayRecords.filter(r => r.lunchInAt && r.lunchOutAt).length;
      const dNotMarked = Math.max(0, totalWorkforce - dLunchIn);

      dailyBreakdown.push({
        date: dStr,
        dateDisplay: formatDateDisplay(dStr),
        day: dayName,
        totalWorkforce,
        lunchRequired: dLunchIn,
        lunchIn: dLunchIn,
        fullDish: dFull,
        halfDish: dHalf,
        completed: dCompleted,
        notMarked: dNotMarked
      });
    }

    // Department breakdown
    const deptMap = new Map();
    activeEmployees.forEach(e => {
      const d = e.departmentName || e.department || 'General';
      if (!deptMap.has(d)) deptMap.set(d, { department: d, totalWorkforce: 0, monthlyLunches: 0, fullDishes: 0, halfDishes: 0 });
      deptMap.get(d).totalWorkforce++;
    });
    records.forEach(r => {
      if (r.lunchInAt) {
        const d = r.department || 'General';
        if (!deptMap.has(d)) deptMap.set(d, { department: d, totalWorkforce: 0, monthlyLunches: 0, fullDishes: 0, halfDishes: 0 });
        const entry = deptMap.get(d);
        entry.monthlyLunches++;
        if (r.dishType === 'Full Dish') entry.fullDishes++;
        else if (r.dishType === 'Half Dish') entry.halfDishes++;
      }
    });

    const departmentBreakdown = Array.from(deptMap.values()).map(st => ({
      ...st,
      avgDaily: daysInMonth > 0 ? (st.monthlyLunches / daysInMonth).toFixed(1) : '0.0'
    }));

    return res.status(200).json({
      success: true,
      year: targetYear,
      month: targetMonth,
      monthName,
      monthDisplay: `${monthName} ${targetYear}`,
      summary: {
        totalWorkforce,
        totalMonthlyLunches,
        totalFullDishes,
        totalHalfDishes,
        daysInMonth,
        averageLunchesPerDay: daysInMonth > 0 ? (totalMonthlyLunches / daysInMonth).toFixed(1) : '0.0'
      },
      dailyBreakdown,
      departmentBreakdown
    });
  } catch (error) {
    console.error('[Canteen getMonthlyReportData Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate monthly canteen report data'
    });
  }
};

/**
 * GET /api/canteen/settings
 * Returns Canteen operational settings
 */
exports.getCanteenSettings = async (req, res) => {
  try {
    let settings = await CanteenSetting.findOne();
    if (!settings) {
      settings = await CanteenSetting.create({
        departmentName: 'BJK Healthcare Canteen Department',
        cafeteriaLocation: 'Ground Floor Central Dining Hall (Unit-1)',
        inChargeName: 'Canteen Supervisor / Catering Manager',
        contactExtension: 'Ext. 402 / 403',
        lunchStartTime: '12:30',
        lunchEndTime: '14:30',
        gracePeriodMinutes: 15,
        dailyTargetCapacity: 250,
        bufferPercent: 10,
        autoRefreshIntervalSeconds: 10,
        allowDishTypeSelection: true,
        defaultDishType: 'Full Dish',
        enableNotificationThresholds: true
      });
    }

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('[Canteen getCanteenSettings Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch canteen settings'
    });
  }
};

/**
 * PUT /api/canteen/settings & POST /api/canteen/settings
 * Updates Canteen operational settings
 */
exports.updateCanteenSettings = async (req, res) => {
  try {
    let settings = await CanteenSetting.findOne();
    if (!settings) {
      settings = new CanteenSetting();
    }

    const {
      departmentName,
      cafeteriaLocation,
      inChargeName,
      contactExtension,
      lunchStartTime,
      lunchEndTime,
      gracePeriodMinutes,
      dailyTargetCapacity,
      bufferPercent,
      autoRefreshIntervalSeconds,
      allowDishTypeSelection,
      defaultDishType,
      enableNotificationThresholds
    } = req.body;

    if (departmentName) settings.departmentName = departmentName.trim();
    if (cafeteriaLocation) settings.cafeteriaLocation = cafeteriaLocation.trim();
    if (inChargeName) settings.inChargeName = inChargeName.trim();
    if (contactExtension) settings.contactExtension = contactExtension.trim();
    if (lunchStartTime) settings.lunchStartTime = lunchStartTime.trim();
    if (lunchEndTime) settings.lunchEndTime = lunchEndTime.trim();
    if (gracePeriodMinutes !== undefined) settings.gracePeriodMinutes = Number(gracePeriodMinutes);
    if (dailyTargetCapacity !== undefined) settings.dailyTargetCapacity = Number(dailyTargetCapacity);
    if (bufferPercent !== undefined) settings.bufferPercent = Number(bufferPercent);
    if (autoRefreshIntervalSeconds !== undefined) settings.autoRefreshIntervalSeconds = Number(autoRefreshIntervalSeconds);
    if (allowDishTypeSelection !== undefined) settings.allowDishTypeSelection = Boolean(allowDishTypeSelection);
    if (defaultDishType && ['Full Dish', 'Half Dish'].includes(defaultDishType)) settings.defaultDishType = defaultDishType;
    if (enableNotificationThresholds !== undefined) settings.enableNotificationThresholds = Boolean(enableNotificationThresholds);

    settings.updatedBy = req.user?.name || 'Canteen Admin';
    await settings.save();

    await recordCanteenAudit({
      req,
      action: 'CANTEEN_SETTINGS_UPDATED',
      details: `Canteen operational settings updated by ${settings.updatedBy}`,
      newData: settings.toObject()
    });

    return res.status(200).json({
      success: true,
      message: 'Canteen settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('[Canteen updateCanteenSettings Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update canteen settings'
    });
  }
};

/**
 * DELETE /api/canteen/reset-all-data & POST /api/canteen/reset-all-data
 * Clears all existing records from CanteenLunchRecord for a fresh start
 */
exports.resetAllCanteenData = async (req, res) => {
  try {
    const deleteRes = await CanteenLunchRecord.deleteMany({});

    await recordCanteenAudit({
      req,
      action: 'ALL_CANTEEN_DATA_CLEARED',
      details: `Canteen Department user ${req.user?.name || 'Admin'} cleared all canteen lunch records (${deleteRes.deletedCount} records deleted). System reset to clean state for live employee Lunch IN/OUT.`,
      newData: { deletedCount: deleteRes.deletedCount }
    });

    return res.status(200).json({
      success: true,
      message: `All canteen records deleted successfully (${deleteRes.deletedCount} records removed). Canteen is now completely clean for live employee Lunch IN/OUT.`,
      deletedCount: deleteRes.deletedCount
    });
  } catch (error) {
    console.error('[Canteen resetAllCanteenData Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset canteen data'
    });
  }
};

