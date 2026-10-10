const mongoose = require('mongoose');
const { Payroll, PayrollRule } = require('../../models/hrms/Payroll');
const Employee = require('../../models/hrms/Employee');
const Attendance = require('../../models/hrms/Attendance');
const { calculateEmployeePayroll } = require('../../services/hrms/statutoryPayrollEngine');
const { hasPermission, PERMISSIONS } = require('../../config/rbac');
const { recordAudit } = require('../../middleware/audit');
const { generatePayslipPDF } = require('../../services/hrms/pdfService');

// GET /api/hrms/payroll
const getPayrollRuns = async (req, res) => {
  try {
    const { payPeriod, department, status, page = 1, limit = 20 } = req.query;
    
    // Strict RBAC & Data Protection
    if (req.user?.role === 'QA_MANAGER' && !hasPermission(req.user.role, PERMISSIONS.PAYROLL_VIEW_ALL)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Role [QA_MANAGER] is not authorized to access company salary or payroll records.'
      });
    }

    const canViewAll = req.user ? hasPermission(req.user.role, PERMISSIONS.PAYROLL_VIEW_ALL) : false;
    const query = {};

    if (!canViewAll) {
      // Normal employee can ONLY see their own records
      if (!req.user || !req.user.employeeId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view payroll runs' });
      }
      query.employeeId = req.user.employeeId;
    } else {
      if (department && department !== 'ALL') query.departmentName = department;
      if (status && status !== 'ALL') query.status = status;
    }

    if (payPeriod) query.payPeriod = payPeriod;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Payroll.countDocuments(query);
    const records = await Payroll.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary totals for authorized finance/HR users
    let summary = null;
    if (canViewAll) {
      const allRecords = await Payroll.find(query);
      const totalGross = allRecords.reduce((sum, r) => sum + r.grossEarnings, 0);
      const totalNet = allRecords.reduce((sum, r) => sum + r.netPay, 0);
      const totalDeductions = allRecords.reduce((sum, r) => sum + r.totalDeductions, 0);
      const totalCompanyCost = allRecords.reduce((sum, r) => sum + r.totalCompanyCost, 0);
      summary = { totalGross, totalNet, totalDeductions, totalCompanyCost, count: allRecords.length };
    }

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

// GET /api/hrms/payroll/:id (Detailed Payslip)
const getPayslipById = async (req, res) => {
  try {
    const payslip = await Payroll.findById(req.params.id);
    if (!payslip) return res.status(404).json({ success: false, message: 'Payslip not found' });

    // Verify self or authorized
    const canViewAll = req.user ? hasPermission(req.user.role, PERMISSIONS.PAYROLL_VIEW_ALL) : false;
    if (!canViewAll && req.user.employeeId !== payslip.employeeId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this payslip' });
    }

    res.json({ success: true, payslip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/payroll/process (Execute Payroll Run)
const processPayroll = async (req, res) => {
  try {
    const { month, year, employeeId } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year required' });
    }

    const payPeriod = `${year}-${String(month).padStart(2, '0')}`;
    const empQuery = { status: 'ACTIVE' };
    if (employeeId && employeeId !== 'ALL') {
      const orConditions = [
        { employeeId: employeeId },
        { employeeId: employeeId.toUpperCase() }
      ];
      if (mongoose.isValidObjectId(employeeId)) {
        orConditions.push({ _id: employeeId });
      }
      empQuery.$or = orConditions;
    }

    const activeEmployees = await Employee.find(empQuery);
    if (!activeEmployees || activeEmployees.length === 0) {
      return res.status(404).json({
        success: false,
        message: employeeId ? `No active employee found matching '${employeeId}'.` : 'No active employees found to process.'
      });
    }

    const createdRecords = [];

    for (const emp of activeEmployees) {
      const basic = (emp.sensitiveData?.salaryDetails?.basicPay) || (emp.basicSalary) || 0;
      const hra = (emp.sensitiveData?.salaryDetails?.hra) || (basic > 0 ? Math.round(basic * 0.4) : 0);
      const special = (emp.sensitiveData?.salaryDetails?.specialAllowance) || (basic > 0 ? Math.round(basic * 0.1) : 0);
      const transport = (emp.sensitiveData?.salaryDetails?.transportAllowance) || (basic > 0 ? 2000 : 0);
      const medical = (emp.sensitiveData?.salaryDetails?.medicalAllowance) || (basic > 0 ? 1500 : 0);

      // Pull real overtime and night hours from attendance for this month
      const attendances = await Attendance.find({
        employee: emp._id,
        dateString: { $regex: `^${payPeriod}` }
      });

      const overtimeHours = attendances.reduce((acc, a) => acc + (a.overtimeHours || 0), 0);
      const nightShiftCount = attendances.filter(a => (a.nightHours || 0) >= 4).length;
      const presentDays = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

      const calc = calculateEmployeePayroll({
        basicSalary: basic,
        hra,
        specialAllowance: special,
        transportAllowance: transport,
        medicalAllowance: medical,
        overtimeHours,
        nightShiftCount,
        payableDays: presentDays > 0 ? Math.min(30, presentDays + 4) : 30, // Include 4 weekly offs
        totalDaysInMonth: 30
      });

      const rawBankAcc = emp.sensitiveData?.bankDetails?.accountNumber || emp.bankDetails?.accountNumber;
      const maskedBank = rawBankAcc ? '••••' + rawBankAcc.slice(-4) : (emp.bankAccountNumber || '••••5678');
      const bankName = emp.sensitiveData?.bankDetails?.bankName || emp.bankDetails?.bankName || 'HDFC Bank Ltd.';
      const panNum = emp.sensitiveData?.panNumber || emp.panNumber || 'XXXXX1234X';
      const uanNum = emp.sensitiveData?.uanNumber || emp.uanNumber || '100984729184';

      const record = await Payroll.findOneAndUpdate(
        { employee: emp._id, payPeriod },
        {
          month: Number(month),
          year: Number(year),
          payPeriod,
          employee: emp._id,
          employeeId: emp.employeeId,
          employeeName: emp.fullName,
          departmentName: emp.departmentName || emp.department || 'Operations',
          designationTitle: emp.designationTitle || emp.designation || 'Specialist',
          bankAccountNumber: maskedBank,
          bankName: bankName,
          panNumber: panNum,
          uanNumber: uanNum,
          attendanceSummary: {
            totalDays: 30,
            payableDays: presentDays > 0 ? Math.min(30, presentDays + 4) : 30,
            presentDays: presentDays || 26,
            paidLeaveDays: 0,
            unpaidLeaveDays: 0,
            weeklyOffs: 4,
            overtimeHours,
            nightShiftCount
          },
          earnings: calc.earnings,
          grossEarnings: calc.grossEarnings,
          deductions: calc.deductions,
          totalDeductions: calc.totalDeductions,
          netPay: calc.netPay,
          employerContributions: calc.employerContributions,
          totalCompanyCost: calc.totalCompanyCost,
          status: 'APPROVED',
          calculatedAt: new Date(),
          approvedBy: req.user ? req.user.name : 'Authorized Signatory',
          approvedAt: new Date(),
          isDemo: false
        },
        { upsert: true, new: true }
      );

      createdRecords.push(record);
    }

    await recordAudit({
      req,
      action: 'PAYROLL_PROCESSED',
      module: 'PAYROLL',
      details: `Processed payroll batch for period ${payPeriod} (${createdRecords.length} payslips generated${employeeId ? ` for ${employeeId}` : ''})`
    });

    res.json({
      success: true,
      message: `Payroll processed for ${payPeriod}. ${createdRecords.length} payslip(s) generated successfully.`,
      recordsCount: createdRecords.length,
      records: createdRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/payroll/:id/approve
const approvePayroll = async (req, res) => {
  try {
    const { status = 'APPROVED' } = req.body;
    const record = await Payroll.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Payroll record not found' });

    record.status = status;
    record.approvedBy = req.user ? req.user.name : 'Authorized Signatory';
    record.approvedAt = new Date();
    await record.save();

    await recordAudit({
      req,
      action: 'PAYROLL_APPROVED',
      module: 'PAYROLL',
      recordId: record._id,
      details: `Approved payslip for ${record.employeeName} (${record.payPeriod})`
    });

    res.json({ success: true, message: `Payroll status updated to ${status}`, record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/hrms/payroll/:id
const deletePayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Payroll.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    await recordAudit({
      req,
      action: 'PAYROLL_DELETED',
      module: 'PAYROLL',
      details: `Deleted payslip record for employee ${deleted.employeeId} (${deleted.payPeriod})`
    });

    res.json({
      success: true,
      message: `Payroll entry for ${deleted.employeeName} (${deleted.payPeriod}) removed successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/hrms/payroll/batch/:payPeriod
const deletePayrollBatch = async (req, res) => {
  try {
    const { payPeriod } = req.params;
    const query = payPeriod && payPeriod !== 'ALL' ? { payPeriod } : {};
    const result = await Payroll.deleteMany(query);

    await recordAudit({
      req,
      action: 'PAYROLL_BATCH_DELETED',
      module: 'PAYROLL',
      details: `Cleared payroll batch for period: ${payPeriod}. Deleted ${result.deletedCount} records.`
    });

    res.json({
      success: true,
      message: `Removed ${result.deletedCount} payroll record(s) for period ${payPeriod}.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/payroll/rules
const getPayrollRules = async (req, res) => {
  try {
    const rules = await PayrollRule.find({ isActive: true });
    res.json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/payroll/:id/pdf (Download Official Payslip PDF)
const downloadPayslipPDF = async (req, res) => {
  try {
    const payslip = await Payroll.findById(req.params.id);
    if (!payslip) return res.status(404).json({ success: false, message: 'Payslip not found' });

    // Verify self or authorized
    const canViewAll = req.user ? hasPermission(req.user.role, PERMISSIONS.PAYROLL_VIEW_ALL) : false;
    if (!canViewAll && req.user.employeeId !== payslip.employeeId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to download this payslip' });
    }

    const employee = await Employee.findOne({ employeeId: payslip.employeeId });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BJK_Payslip_${payslip.employeeId}_${payslip.payPeriod}.pdf`);

    await recordAudit({
      req,
      action: 'PAYSLIP_PDF_DOWNLOADED',
      module: 'PAYROLL',
      recordId: payslip._id,
      details: `Generated and downloaded payslip PDF for ${payslip.employeeName} (${payslip.payPeriod})`
    });

    generatePayslipPDF(payslip, employee, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = {
  getPayrollRuns,
  getPayslipById,
  processPayroll,
  approvePayroll,
  deletePayrollRecord,
  deletePayrollBatch,
  getPayrollRules,
  downloadPayslipPDF
};
