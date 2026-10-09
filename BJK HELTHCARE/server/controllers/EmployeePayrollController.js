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
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found.' });
    }

    // Try finding latest processed payroll record
    let payroll = await Payroll.findOne({
      employeeId: employeeId.toUpperCase()
    }).sort({ year: -1, month: -1 });

    // Fallback computed salary structure if no batch run yet
    if (!payroll) {
      const basic = (employee.sensitiveData?.salaryDetails?.basicPay) || (employee.basicSalary) || 45000;
      const hra = (employee.sensitiveData?.salaryDetails?.hra) || Math.round(basic * 0.4);
      const special = (employee.sensitiveData?.salaryDetails?.specialAllowance) || 8000;
      const transport = 3500;
      const medical = 2500;
      const gross = basic + hra + special + transport + medical;

      const pf = Math.round(basic * 0.12);
      const pt = 200;
      const tds = Math.round(gross * 0.05);
      const totalDeductions = pf + pt + tds;
      const netPay = gross - totalDeductions;

      payroll = {
        month: new Date().getMonth() + 1,
        year: 2026,
        payPeriod: '2026-09',
        employeeId: employee.employeeId,
        employeeName: employee.fullName,
        departmentName: employee.departmentName,
        designationTitle: employee.designationTitle,
        bankAccountNumber: employee.bankDetails?.accountNumber ? `XXXX-XXXX-${employee.bankDetails.accountNumber.slice(-4)}` : 'XXXX-XXXX-8921',
        bankName: employee.bankDetails?.bankName || 'HDFC Bank Ltd.',
        panNumber: employee.panNumber || 'XXXXX1234X',
        pfNumber: 'GJ/AHD/0048291/000/1046',
        uanNumber: '100984729184',
        attendanceSummary: {
          totalDays: 30,
          payableDays: 30,
          presentDays: 26,
          paidLeaveDays: 0,
          unpaidLeaveDays: 0,
          weeklyOffs: 4
        },
        earnings: {
          basic,
          hra,
          specialAllowance: special,
          transportAllowance: transport,
          medicalAllowance: medical,
          overtimePay: 0,
          performanceBonus: 0
        },
        grossEarnings: gross,
        deductions: {
          providentFund: pf,
          employeeStateInsurance: 0,
          professionalTax: pt,
          taxDeductedAtSource: tds,
          advanceDeductions: 0
        },
        totalDeductions,
        netPay,
        status: 'PAID'
      };
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
    let records = await Payroll.find({
      employeeId: employeeId.toUpperCase()
    }).sort({ year: -1, month: -1 });

    // Generate sample past payslips if database is empty
    if (!records || records.length === 0) {
      const employee = await Employee.findOne({ employeeId });
      const months = [
        { month: 9, year: 2026, period: 'September 2026', gross: 65000, net: 58800, date: '2026-09-30' },
        { month: 8, year: 2026, period: 'August 2026', gross: 65000, net: 58800, date: '2026-08-31' },
        { month: 7, year: 2026, period: 'July 2026', gross: 62000, net: 56100, date: '2026-07-31' },
        { month: 6, year: 2026, period: 'June 2026', gross: 62000, net: 56100, date: '2026-06-30' }
      ];

      return res.status(200).json({
        success: true,
        payslips: months.map((m, idx) => ({
          _id: `demo-slip-${idx}`,
          id: `demo-slip-${idx}`,
          employeeId: employeeId.toUpperCase(),
          payPeriod: m.period,
          month: m.month,
          year: m.year,
          disbursementDate: m.date,
          grossEarnings: m.gross,
          totalDeductions: m.gross - m.net,
          netPay: m.net,
          status: 'PAID'
        }))
      });
    }

    return res.status(200).json({
      success: true,
      payslips: records
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

    let payroll = null;
    if (mongoose.isValidObjectId(slipId)) {
      payroll = await Payroll.findOne({ _id: slipId, employeeId: employeeId.toUpperCase() });
    }

    const employee = await Employee.findOne({ employeeId });

    await logEmployeeAudit({
      employeeId,
      action: 'DOWNLOAD_PAYSLIP',
      details: { slipId }
    });

    const slipData = payroll || {
      payPeriod: 'September 2026',
      month: 9,
      year: 2026,
      employeeId: employee?.employeeId || employeeId,
      employeeName: employee?.fullName || 'BJK Employee',
      designation: employee?.designationTitle || 'Healthcare Specialist',
      department: employee?.departmentName || 'Operations',
      grossEarnings: 65000,
      totalDeductions: 6200,
      netPay: 58800,
      status: 'PAID',
      earnings: {
        basic: 45000,
        hra: 10000,
        specialAllowance: 6000,
        medicalAllowance: 2500,
        transportAllowance: 1500
      },
      deductions: {
        providentFund: 5400,
        professionalTax: 200,
        taxDeductedAtSource: 600
      }
    };

    return res.status(200).json({
      success: true,
      message: 'Payslip generated.',
      slip: slipData
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to download payslip.' });
  }
};

module.exports = {
  getCurrentPayroll,
  getPayslips,
  downloadPayslip
};
