const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Shift = require('../models/hrms/Shift');
const Roster = require('../models/hrms/Roster');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * GET /api/employee/shift
 * Returns current shift details and weekly roster for the authenticated employee
 */
const getEmployeeShift = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    // Determine shift configuration
    const shiftName = employee.shift || employee.shiftName || 'General Shift (09:00 - 18:00)';
    let shiftDoc = await Shift.findOne({ name: shiftName });
    if (!shiftDoc) {
      shiftDoc = await Shift.findOne({ isActive: true });
    }

    const currentShift = {
      name: shiftDoc ? shiftDoc.name : shiftName,
      code: shiftDoc ? shiftDoc.code : 'SFT-GEN',
      type: shiftDoc ? shiftDoc.type : 'General',
      startTime: shiftDoc ? shiftDoc.startTime : '09:00',
      endTime: shiftDoc ? shiftDoc.endTime : '18:00',
      timing: shiftDoc ? `${shiftDoc.startTime} - ${shiftDoc.endTime}` : '09:00 AM – 06:00 PM',
      breakDurationMinutes: shiftDoc ? shiftDoc.breakDurationMinutes : 60,
      breakTiming: '01:00 PM – 02:00 PM (60 Mins)',
      gracePeriodMinutes: shiftDoc ? shiftDoc.gracePeriodMinutes : 15,
      weeklyOff: (shiftDoc?.weeklyOffDays && shiftDoc.weeklyOffDays.length > 0) ? shiftDoc.weeklyOffDays.join(', ') : 'Sunday',
      workLocation: employee.workLocation || employee.branch || 'BJK Unit 1 - Formulations Facility',
      department: employee.departmentName || employee.department || 'Operations'
    };

    // Calculate weekly roster for current week (Monday to Sunday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const weeklyRoster = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[i];
      const isOff = currentShift.weeklyOff.toLowerCase().includes(dayName.toLowerCase());

      weeklyRoster.push({
        date: dateStr,
        day: dayName,
        shift: isOff ? 'Weekly Off' : currentShift.name,
        timing: isOff ? '--:--' : currentShift.timing,
        station: isOff ? 'Off Duty' : (employee.departmentName?.includes('Quality') ? 'Analytical QC Lab' : 'Unit 1 Formulation Line 2'),
        status: isOff ? 'OFF' : 'SCHEDULED'
      });
    }

    return res.status(200).json({
      success: true,
      currentShift,
      weeklyRoster
    });
  } catch (err) {
    console.error('[Get Employee Shift Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shift information.' });
  }
};

/**
 * POST /api/employee/shift/swap
 * Request a shift swap for a specific date
 */
const requestShiftSwap = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { date, currentShift, requestedShift, reason, colleagueName } = req.body;

    if (!date || !requestedShift || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Shift date, requested shift, and reason are required.'
      });
    }

    const employee = await Employee.findOne({ employeeId });

    // Look for existing roster entry or create one
    let roster = await Roster.findOne({
      employeeId: employeeId.toUpperCase(),
      dateString: date
    });

    const shiftObj = await Shift.findOne({ name: requestedShift }) || await Shift.findOne();

    if (!roster) {
      roster = new Roster({
        dateString: date,
        date: new Date(date),
        employee: employee ? employee._id : new mongoose.Types.ObjectId(),
        employeeId: employeeId.toUpperCase(),
        employeeName: employee ? employee.fullName : req.user.name,
        departmentName: employee ? employee.departmentName : 'Operations',
        facility: employee?.workLocation || 'BJK Unit 1',
        shift: shiftObj ? shiftObj._id : new mongoose.Types.ObjectId(),
        shiftName: currentShift || 'General Shift',
        startTime: '09:00',
        endTime: '18:00',
        swapRequest: {
          requested: true,
          status: 'PENDING',
          requestDate: new Date(),
          withEmployeeName: colleagueName || 'Mutual Swap Partner',
          reason
        }
      });
    } else {
      roster.swapRequest = {
        requested: true,
        status: 'PENDING',
        requestDate: new Date(),
        withEmployeeName: colleagueName || 'Mutual Swap Partner',
        reason
      };
    }

    await roster.save();

    await logEmployeeAudit({
      employeeId,
      action: 'SHIFT_SWAP_REQUEST',
      details: { date, requestedShift, reason }
    });

    return res.status(200).json({
      success: true,
      message: `Shift swap request for ${date} (${requestedShift}) submitted successfully for supervisor approval.`,
      swap: roster.swapRequest
    });
  } catch (err) {
    console.error('[Request Shift Swap Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit shift swap request.' });
  }
};

/**
 * GET /api/employee/shift/swaps
 * List employee's shift swap requests
 */
const getShiftSwaps = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const rosters = await Roster.find({
      employeeId: employeeId.toUpperCase(),
      'swapRequest.requested': true
    }).sort({ 'swapRequest.requestDate': -1 });

    const swaps = rosters.map(r => ({
      id: r._id,
      date: r.dateString,
      originalShift: r.shiftName,
      status: r.swapRequest?.status || 'PENDING',
      requestDate: r.swapRequest?.requestDate || r.updatedAt,
      reason: r.swapRequest?.reason || 'Shift adjustment',
      withColleague: r.swapRequest?.withEmployeeName || 'Authorized Colleague',
      approvedBy: r.swapRequest?.approvedBy || '--'
    }));

    return res.status(200).json({
      success: true,
      swaps
    });
  } catch (err) {
    console.error('[Get Shift Swaps Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve shift swaps.' });
  }
};

module.exports = {
  getEmployeeShift,
  requestShiftSwap,
  getShiftSwaps
};
