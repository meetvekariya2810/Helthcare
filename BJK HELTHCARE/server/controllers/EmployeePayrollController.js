const mongoose = require('mongoose');
const { Payroll } = require('../models/hrms/Payroll');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * GET /api/employee/payroll
 * GET /api/employee/payroll/current
 * Returns current month salary breakdown strictly for the authenticated employee
 */
const getCurrentPayroll = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({
      $or: [
        { employeeId: employeeId },
        { employeeId: employeeId?.toUpperCase() },
        { employeeId: employeeId?.toLowerCase() }
      ]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    // Try finding latest processed payroll record strictly for this employee
    const payroll = await Payroll.findOne({
      $or: [
        { employee: employee._id },
        { employeeId: employee.employeeId },
        { employeeId: employeeId },
        { employeeId: employeeId?.toUpperCase() }
      ]
    }).sort({ year: -1, month: -1 });

    // If no payroll run has been executed by HR yet, return null cleanly
    if (!payroll) {
      return res.status(200).json({
        success: true,
        payroll: null,
        message: 'No payroll records have been generated yet for this account.'
      });
    }

    await logEmployeeAudit({
      employeeId,
      action: 'VIEW_PAYROLL',
      details: 'Viewed own salary and current compensation details'
    });

    return res.status(200).json({
      success: true,
      payroll
    });
  } catch (err) {
    console.error('[Get Current Payroll Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payroll details.' });
  }
};

/**
 * GET /api/employee/payslips
 * List available payslips for the authenticated employee
 */
const getPayslips = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({
      $or: [
        { employeeId: employeeId },
        { employeeId: employeeId?.toUpperCase() },
        { employeeId: employeeId?.toLowerCase() }
      ]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const records = await Payroll.find({
      $or: [
        { employee: employee._id },
        { employeeId: employee.employeeId },
        { employeeId: employeeId },
        { employeeId: employeeId?.toUpperCase() }
      ]
    }).sort({ year: -1, month: -1 });

    // Return strictly real records; never fabricate fake sample slips
    return res.status(200).json({
      success: true,
      payslips: records || []
    });
  } catch (err) {
    console.error('[Get Payslips Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payslips.' });
  }
};

/**
 * GET /api/employee/payslips/:id/download
 */
const downloadPayslip = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const slipId = req.params.id;

    const employee = await Employee.findOne({
      $or: [
        { employeeId: employeeId },
        { employeeId: employeeId?.toUpperCase() },
        { employeeId: employeeId?.toLowerCase() }
      ]
    });

    let payroll = null;
    if (mongoose.isValidObjectId(slipId)) {
      payroll = await Payroll.findOne({
        _id: slipId,
        $or: [
          { employee: employee?._id },
          { employeeId: employeeId },
          { employeeId: employeeId?.toUpperCase() }
        ]
      });
    } else if (slipId === 'current') {
      payroll = await Payroll.findOne({
        $or: [
          { employee: employee?._id },
          { employeeId: employeeId },
          { employeeId: employeeId?.toUpperCase() }
        ]
      }).sort({ year: -1, month: -1 });
    }

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payslip record not found for this period.'
      });
    }

    await logEmployeeAudit({
      employeeId,
      action: 'DOWNLOAD_PAYSLIP',
      details: { slipId: payroll._id }
    });

    return res.status(200).json({
      success: true,
      message: 'Payslip retrieved successfully.',
      slip: payroll
    });
  } catch (err) {
    console.error('[Download Payslip Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to download payslip.' });
  }
};

module.exports = {
  getCurrentPayroll,
  getPayslips,
  downloadPayslip
};
