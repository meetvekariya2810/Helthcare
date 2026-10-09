const Attendance = require('../../models/hrms/Attendance');
const Employee = require('../../models/hrms/Employee');
const Shift = require('../../models/hrms/Shift');
const { calculateShiftHours } = require('../../services/hrms/overtimeEngine');
const { recordAudit } = require('../../middleware/audit');
const { getScopeQuery } = require('../../services/hrms/dataScopeService');

// GET /api/hrms/attendance
const getAttendance = async (req, res) => {
  try {
    const { date, department, employeeId, status, page = 1, limit = 25 } = req.query;
    const query = {};

    // Apply data scope
    const scopeFilter = getScopeQuery(req.user, 'attendance');
    Object.assign(query, scopeFilter);

    if (date) {
      query.dateString = date;
    } else {
      query.dateString = new Date().toISOString().split('T')[0];
    }

    if (department && department !== 'ALL' && (!scopeFilter.departmentName)) query.departmentName = department;
    if (employeeId && (!scopeFilter.employeeId)) query.employeeId = employeeId;
    if (status && status !== 'ALL') query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary statistics for selected date (scoped)
    const baseSummaryQuery = { dateString: query.dateString, ...scopeFilter };
    const summary = {
      present: await Attendance.countDocuments({ ...baseSummaryQuery, status: { $in: ['PRESENT', 'LATE'] } }),
      absent: await Attendance.countDocuments({ ...baseSummaryQuery, status: 'ABSENT' }),
      late: await Attendance.countDocuments({ ...baseSummaryQuery, status: 'LATE' }),
      onLeave: await Attendance.countDocuments({ ...baseSummaryQuery, status: 'ON_LEAVE' }),
      overtimeCount: await Attendance.countDocuments({ ...baseSummaryQuery, overtimeHours: { $gt: 0 } }),
      missingPunch: await Attendance.countDocuments({ ...baseSummaryQuery, status: 'MISSING_PUNCH' })
    };

    res.json({
      success: true,
      records,
      summary,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/attendance/punch (Web & Mobile Self Service)
const markPunch = async (req, res) => {
  try {
    const { employeeId, type = 'IN', source = 'WEB', location, remarks } = req.body;
    
    // Resolve employee
    const targetEmployeeId = employeeId || req.user.employeeId;
    if (!targetEmployeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID required to punch' });
    }

    const employee = await Employee.findOne({ employeeId: targetEmployeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const todayDate = new Date();
    const dateString = todayDate.toISOString().split('T')[0];

    // Find shift assigned to employee
    let shift = null;
    if (employee.assignedShift) {
      shift = await Shift.findById(employee.assignedShift);
    }
    const shiftStartTime = shift ? shift.startTime : '09:00';
    const shiftEndTime = shift ? shift.endTime : '18:00';

    let record = await Attendance.findOne({ employee: employee._id, dateString });

    if (!record) {
      record = new Attendance({
        employee: employee._id,
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        departmentName: employee.departmentName,
        date: todayDate,
        dateString,
        shift: shift ? shift._id : null,
        shiftName: shift ? shift.name : 'General Shift',
        source
      });
    }

    if (type === 'IN') {
      if (record.checkIn) {
        return res.status(400).json({ success: false, message: 'Check-in already logged for today' });
      }
      record.checkIn = todayDate;
      record.status = 'PRESENT';
      if (location) {
        record.location = location;
        if (location.lat && location.lng) {
          const dLat = (location.lat - 22.9868) * 111000;
          const dLng = (location.lng - 72.4842) * 111000 * Math.cos(22.9868 * Math.PI / 180);
          const distM = Math.sqrt(dLat * dLat + dLng * dLng);
          record.geofenceStatus = distM <= 500 ? 'INSIDE' : 'OUTSIDE';
        }
      }

      // Check if late
      const metrics = calculateShiftHours({
        shiftStartTime,
        shiftEndTime,
        checkIn: todayDate,
        checkOut: null
      });
      if (metrics.lateMinutes > 0) {
        record.status = 'LATE';
        record.lateMinutes = metrics.lateMinutes;
      }
    } else if (type === 'OUT') {
      if (!record.checkIn) {
        record.status = 'MISSING_PUNCH';
        record.remarks = 'Check-out recorded without prior check-in punch';
      } else {
        const dwellMinutes = Math.round((todayDate.getTime() - new Date(record.checkIn).getTime()) / (1000 * 60));
        record.dwellTimeMinutes = Math.max(0, dwellMinutes);
      }
      record.checkOut = todayDate;
      if (location) {
        record.location = location;
        if (location.lat && location.lng) {
          const dLat = (location.lat - 22.9868) * 111000;
          const dLng = (location.lng - 72.4842) * 111000 * Math.cos(22.9868 * Math.PI / 180);
          const distM = Math.sqrt(dLat * dLat + dLng * dLng);
          record.geofenceStatus = distM <= 500 ? 'INSIDE' : 'OUTSIDE';
        }
      }

      // Run Overtime and Night Hours Engine
      const metrics = calculateShiftHours({
        shiftStartTime,
        shiftEndTime,
        checkIn: record.checkIn,
        checkOut: todayDate,
        gracePeriodMinutes: shift ? shift.gracePeriodMinutes : 15,
        breakDurationMinutes: shift ? shift.breakDurationMinutes : 60,
        overtimeMinimumMinutes: shift && shift.overtimeRule ? shift.overtimeRule.minimumExtraMinutes : 30
      });

      record.workingHours = metrics.workingHours;
      record.regularHours = metrics.regularHours;
      record.overtimeHours = metrics.overtimeHours;
      record.nightHours = metrics.nightHours;
      if (metrics.lateMinutes > 0) {
        record.status = 'LATE';
        record.lateMinutes = metrics.lateMinutes;
      }
    }

    if (remarks) record.remarks = remarks;
    await record.save();

    await recordAudit({
      req,
      action: type === 'IN' ? 'ATTENDANCE_CHECK_IN' : 'ATTENDANCE_CHECK_OUT',
      module: 'ATTENDANCE',
      recordId: record._id,
      details: `${employee.fullName} (${employee.employeeId}) logged ${type} at ${todayDate.toLocaleTimeString()}`
    });

    res.json({
      success: true,
      message: `Punch ${type} recorded successfully`,
      attendance: record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/attendance/biometric-webhook (Biometric Hardware Adapter)
const biometricWebhook = async (req, res) => {
  try {
    const { deviceId, punches } = req.body;
    if (!punches || !Array.isArray(punches)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: Array of punches required' });
    }

    let processedCount = 0;
    for (const punch of punches) {
      const employee = await Employee.findOne({ employeeId: punch.employeeBadgeId });
      if (employee) {
        const pDate = new Date(punch.punchTime);
        const dateString = pDate.toISOString().split('T')[0];

        let record = await Attendance.findOne({ employee: employee._id, dateString });
        if (!record) {
          record = new Attendance({
            employee: employee._id,
            employeeId: employee.employeeId,
            employeeName: employee.fullName,
            departmentName: employee.departmentName,
            date: pDate,
            dateString,
            source: 'BIOMETRIC',
            biometricDeviceId: deviceId || 'BIOMETRIC_STATION_01',
            geofenceStatus: 'INSIDE'
          });
        }

        if (punch.type === 'IN' && !record.checkIn) {
          record.checkIn = pDate;
          record.status = 'PRESENT';
          record.geofenceStatus = 'INSIDE';
        } else if (punch.type === 'OUT') {
          if (record.checkIn) {
            const dwellMinutes = Math.round((pDate.getTime() - new Date(record.checkIn).getTime()) / (1000 * 60));
            record.dwellTimeMinutes = Math.max(0, dwellMinutes);
          }
          record.checkOut = pDate;
          record.geofenceStatus = 'INSIDE';
          const metrics = calculateShiftHours({
            shiftStartTime: '09:00',
            shiftEndTime: '18:00',
            checkIn: record.checkIn,
            checkOut: pDate
          });
          record.workingHours = metrics.workingHours;
          record.overtimeHours = metrics.overtimeHours;
          record.nightHours = metrics.nightHours;
        }

        await record.save();
        processedCount++;
      }
    }

    res.json({
      success: true,
      message: `Biometric batch processed successfully. ${processedCount} punches synchronized.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/attendance/correction
const requestCorrection = async (req, res) => {
  try {
    const { attendanceId, requestedCheckIn, requestedCheckOut, reason } = req.body;
    const record = await Attendance.findById(attendanceId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    record.correctionStatus = 'PENDING';
    record.correctionRemarks = `Correction requested: In=${requestedCheckIn || 'N/A'}, Out=${requestedCheckOut || 'N/A'}. Reason: ${reason}`;
    await record.save();

    res.json({ success: true, message: 'Correction request submitted to manager' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAttendance,
  markPunch,
  biometricWebhook,
  requestCorrection
};
