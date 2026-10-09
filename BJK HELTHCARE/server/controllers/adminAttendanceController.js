const mongoose = require('mongoose');
const Attendance = require('../models/hrms/Attendance');
const AttendancePolicy = require('../models/AttendancePolicy');
const AttendanceAuditLog = require('../models/AttendanceAuditLog');
const Employee = require('../models/Employee');
const { getActiveAttendancePolicy, DEFAULT_FACTORY_POLICY } = require('../services/geofenceService');

/**
 * GET /api/admin/attendance/policy
 * Returns the active geofence policy for BJK Healthcare facilities
 */
const getPolicy = async (req, res) => {
  try {
    const policy = await getActiveAttendancePolicy();
    return res.status(200).json({
      success: true,
      policy
    });
  } catch (err) {
    console.error('[Admin Attendance Policy GET Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance policy.' });
  }
};

/**
 * POST /api/admin/attendance/policy
 * Creates or updates the attendance geofence policy
 */
const updatePolicy = async (req, res) => {
  try {
    const {
      facilityId = 'BJK-FAC-001',
      facilityName,
      facilityAddress,
      latitude,
      longitude,
      radiusMeters,
      gpsRequired,
      punchInEnabled,
      punchOutEnabled,
      minimumGpsAccuracy,
      active
    } = req.body;

    let policy = await AttendancePolicy.findOne({ facilityId });

    if (!policy) {
      policy = new AttendancePolicy({
        facilityId,
        facilityName: facilityName || DEFAULT_FACTORY_POLICY.facilityName,
        facilityAddress: facilityAddress || DEFAULT_FACTORY_POLICY.facilityAddress,
        latitude: latitude !== undefined ? parseFloat(latitude) : DEFAULT_FACTORY_POLICY.latitude,
        longitude: longitude !== undefined ? parseFloat(longitude) : DEFAULT_FACTORY_POLICY.longitude,
        radiusMeters: radiusMeters !== undefined ? parseFloat(radiusMeters) : DEFAULT_FACTORY_POLICY.radiusMeters,
        gpsRequired: gpsRequired !== undefined ? gpsRequired : true,
        punchInEnabled: punchInEnabled !== undefined ? punchInEnabled : true,
        punchOutEnabled: punchOutEnabled !== undefined ? punchOutEnabled : true,
        minimumGpsAccuracy: minimumGpsAccuracy !== undefined ? parseFloat(minimumGpsAccuracy) : 50,
        active: active !== undefined ? active : true
      });
    } else {
      if (facilityName !== undefined) policy.facilityName = facilityName;
      if (facilityAddress !== undefined) policy.facilityAddress = facilityAddress;
      if (latitude !== undefined) policy.latitude = parseFloat(latitude);
      if (longitude !== undefined) policy.longitude = parseFloat(longitude);
      if (radiusMeters !== undefined) policy.radiusMeters = parseFloat(radiusMeters);
      if (gpsRequired !== undefined) policy.gpsRequired = gpsRequired;
      if (punchInEnabled !== undefined) policy.punchInEnabled = punchInEnabled;
      if (punchOutEnabled !== undefined) policy.punchOutEnabled = punchOutEnabled;
      if (minimumGpsAccuracy !== undefined) policy.minimumGpsAccuracy = parseFloat(minimumGpsAccuracy);
      if (active !== undefined) policy.active = active;
    }

    await policy.save();

    return res.status(200).json({
      success: true,
      message: 'Attendance geofence policy updated successfully.',
      policy
    });
  } catch (err) {
    console.error('[Admin Attendance Policy UPDATE Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update attendance policy.' });
  }
};

/**
 * GET /api/admin/attendance/today
 * Returns today's attendance roster across all employees
 */
const getTodayAttendanceAll = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { department, status } = req.query;

    let query = {
      $or: [
        { dateString: todayStr },
        { attendanceDate: todayStr }
      ]
    };

    if (department && department !== 'ALL') {
      query.departmentName = department;
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const records = await Attendance.find(query).sort({ checkIn: -1, createdAt: -1 });

    const totalEmployees = await Employee.countDocuments({ status: 'ACTIVE' });
    const presentCount = records.filter(r => r.checkIn).length;
    const completedCount = records.filter(r => r.checkOut).length;

    return res.status(200).json({
      success: true,
      date: todayStr,
      metrics: {
        totalActiveEmployees: totalEmployees,
        todayPunchedIn: presentCount,
        todayCompleted: completedCount,
        todayAbsent: Math.max(0, totalEmployees - presentCount)
      },
      records
    });
  } catch (err) {
    console.error('[Admin Today Attendance Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch today attendance records.' });
  }
};

/**
 * GET /api/admin/attendance/history
 * Returns paginated & filtered enterprise attendance records
 */
const getAttendanceHistoryAll = async (req, res) => {
  try {
    const { startDate, endDate, department, employeeId, page = 1, limit = 50 } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.$or = [
        { dateString: { $gte: startDate, $lte: endDate } },
        { attendanceDate: { $gte: startDate, $lte: endDate } }
      ];
    }

    if (department && department !== 'ALL') {
      query.departmentName = department;
    }

    if (employeeId) {
      const empUpper = employeeId.toUpperCase();
      query.$and = [{
        $or: [{ employeeId: empUpper }, { employeeCode: empUpper }]
      }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ dateString: -1, attendanceDate: -1, checkIn: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      records
    });
  } catch (err) {
    console.error('[Admin Attendance History Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance history.' });
  }
};

/**
 * GET /api/admin/attendance/employee/:employeeId
 * Returns attendance for a specific employee
 */
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const empUpper = employeeId.toUpperCase();

    const employee = await Employee.findOne({
      $or: [{ employeeId: empUpper }, { employeeCode: empUpper }]
    });

    const records = await Attendance.find({
      $or: [{ employeeId: empUpper }, { employeeCode: empUpper }]
    }).sort({ dateString: -1, attendanceDate: -1 }).limit(100);

    const auditLogs = await AttendanceAuditLog.find({
      $or: [{ employeeId: empUpper }, { employeeCode: empUpper }]
    }).sort({ timestamp: -1 }).limit(50);

    return res.status(200).json({
      success: true,
      employee,
      records,
      auditLogs
    });
  } catch (err) {
    console.error('[Admin Employee Attendance Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee attendance.' });
  }
};

/**
 * GET /api/admin/attendance/audit-logs
 * Returns audit log entries for location & punch events
 */
const getAuditLogs = async (req, res) => {
  try {
    const { action, result, employeeId, page = 1, limit = 50 } = req.query;
    let query = {};

    if (action && action !== 'ALL') query.action = action;
    if (result && result !== 'ALL') query.result = result;
    if (employeeId) {
      const empUpper = employeeId.toUpperCase();
      query.$or = [{ employeeId: empUpper }, { employeeCode: empUpper }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AttendanceAuditLog.countDocuments(query);
    const logs = await AttendanceAuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      logs
    });
  } catch (err) {
    console.error('[Admin Attendance Audit Logs Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance audit logs.' });
  }
};

module.exports = {
  getPolicy,
  updatePolicy,
  getTodayAttendanceAll,
  getAttendanceHistoryAll,
  getEmployeeAttendance,
  getAuditLogs
};
