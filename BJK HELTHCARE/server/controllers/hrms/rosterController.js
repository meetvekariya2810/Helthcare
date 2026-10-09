const Roster = require('../../models/hrms/Roster');
const Employee = require('../../models/hrms/Employee');
const Shift = require('../../models/hrms/Shift');
const { validateRosterAssignment } = require('../../services/hrms/rosterValidator');
const { recordAudit } = require('../../middleware/audit');
const { getScopeQuery } = require('../../services/hrms/dataScopeService');

// GET /api/hrms/rostering
const getRosters = async (req, res) => {
  try {
    const { startDate, endDate, department, facility } = req.query;
    const query = {};

    const scopeFilter = getScopeQuery(req.user, 'roster');
    Object.assign(query, scopeFilter);

    if (startDate && endDate) {
      query.dateString = { $gte: startDate, $lte: endDate };
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      query.dateString = todayStr;
    }

    if (department && department !== 'ALL' && (!scopeFilter.departmentName)) query.departmentName = department;
    if (facility && facility !== 'ALL') query.facility = facility;

    const rosters = await Roster.find(query).sort({ dateString: 1, startTime: 1 });

    // Validation statistics
    const summary = {
      totalAssigned: rosters.length,
      valid: rosters.filter(r => r.validationStatus === 'VALID').length,
      warnings: rosters.filter(r => r.validationStatus === 'WARNING').length,
      blocked: rosters.filter(r => r.validationStatus === 'BLOCKED').length
    };

    res.json({ success: true, rosters, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/rostering/assign
const assignShift = async (req, res) => {
  try {
    const { employeeId, shiftId, dateString, productionLine, roleRequirement } = req.body;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });

    // Run Intelligent Validation Engine
    const validation = await validateRosterAssignment({
      employeeId: employee.employeeId,
      dateString,
      shiftStartTime: shift.startTime,
      shiftEndTime: shift.endTime,
      requiredRole: roleRequirement || 'Standard'
    });

    const targetDate = new Date(dateString);

    const roster = await Roster.findOneAndUpdate(
      { employee: employee._id, dateString },
      {
        employee: employee._id,
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        departmentName: employee.departmentName,
        facility: employee.facility,
        shift: shift._id,
        shiftName: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        date: targetDate,
        dateString,
        productionLine: productionLine || 'General Operations',
        roleRequirement: roleRequirement || 'Standard',
        validationStatus: validation.validationStatus,
        blockingIssues: validation.blockingIssues,
        warnings: validation.warnings,
        isPublished: !validation.isBlocked
      },
      { upsert: true, new: true }
    );

    await recordAudit({
      req,
      action: 'SHIFT_ASSIGNED',
      module: 'ROSTER',
      recordId: roster._id,
      details: `Assigned ${employee.fullName} to ${shift.name} on ${dateString} (Status: ${validation.validationStatus})`
    });

    res.status(201).json({
      success: true,
      roster,
      validation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/rostering/swap-request (Employee Self Service)
const requestShiftSwap = async (req, res) => {
  try {
    const { rosterId, targetEmployeeId, reason } = req.body;
    const roster = await Roster.findById(rosterId);
    if (!roster) return res.status(404).json({ success: false, message: 'Roster entry not found' });

    const targetEmp = await Employee.findOne({ employeeId: targetEmployeeId });
    if (!targetEmp) return res.status(404).json({ success: false, message: 'Target swap employee not found' });

    // Validate target employee eligibility for the shift
    const validation = await validateRosterAssignment({
      employeeId: targetEmp.employeeId,
      dateString: roster.dateString,
      shiftStartTime: roster.startTime,
      shiftEndTime: roster.endTime
    });

    if (validation.isBlocked) {
      return res.status(400).json({
        success: false,
        message: `Shift swap blocked: ${validation.blockingIssues.join('; ')}`
      });
    }

    roster.swapRequest = {
      requested: true,
      withEmployee: targetEmp._id,
      withEmployeeName: targetEmp.fullName,
      status: 'PENDING',
      requestDate: new Date(),
      reason: reason || 'Personal exigency'
    };
    await roster.save();

    res.json({
      success: true,
      message: `Swap request submitted to ${targetEmp.fullName} and Department Manager`,
      roster
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/rostering/swap-approve (Manager Approval)
const approveShiftSwap = async (req, res) => {
  try {
    const { rosterId, approved, managerComments } = req.body;
    const roster = await Roster.findById(rosterId);
    if (!roster || !roster.swapRequest || !roster.swapRequest.requested) {
      return res.status(404).json({ success: false, message: 'Active swap request not found' });
    }

    if (approved) {
      const originalEmployeeId = roster.employeeId;
      const targetEmp = await Employee.findById(roster.swapRequest.withEmployee);

      // Reassign roster to new employee
      roster.employee = targetEmp._id;
      roster.employeeId = targetEmp.employeeId;
      roster.employeeName = targetEmp.fullName;
      roster.swapRequest.status = 'APPROVED';
      roster.swapRequest.approvedBy = req.user ? req.user.name : 'Manager';
      await roster.save();

      await recordAudit({
        req,
        action: 'SHIFT_SWAP_APPROVED',
        module: 'ROSTER',
        recordId: roster._id,
        details: `Approved shift swap from ${originalEmployeeId} to ${targetEmp.fullName}`
      });

      res.json({ success: true, message: 'Shift swap approved and roster updated', roster });
    } else {
      roster.swapRequest.status = 'REJECTED';
      await roster.save();
      res.json({ success: true, message: 'Shift swap rejected', roster });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRosters,
  assignShift,
  requestShiftSwap,
  approveShiftSwap
};
