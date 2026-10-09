const fs = require('fs');
const path = require('path');
const Employee = require('../../models/hrms/Employee');
const Attendance = require('../../models/hrms/Attendance');
const { Payroll } = require('../../models/hrms/Payroll');
const Credential = require('../../models/hrms/Credential');
const { generateReportPDF } = require('../../services/hrms/pdfService');

// GET /api/hrms/reports/export
const exportReport = async (req, res) => {
  try {
    const { type = 'EMPLOYEE_MASTER', format = 'csv' } = req.query;

    if (type === 'EMPLOYEE_MASTER') {
      const employees = await Employee.find({}).sort({ employeeId: 1 });
      if (format === 'json') return res.json({ success: true, data: employees });
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=BJK_Employee_Master_${Date.now()}.pdf`);
        return generateReportPDF('EMPLOYEE_MASTER', employees, res);
      }

      const headers = ['Employee ID', 'Full Name', 'Email', 'Department', 'Designation', 'Facility', 'Employment Type', 'Status', 'Joining Date'];
      const rows = employees.map(e => [
        e.employeeId,
        `"${e.fullName}"`,
        e.email,
        `"${e.departmentName}"`,
        `"${e.designationTitle}"`,
        `"${e.facility}"`,
        e.employmentType,
        e.status,
        e.joiningDate ? new Date(e.joiningDate).toISOString().split('T')[0] : ''
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=BJK_Employee_Master_${Date.now()}.csv`);
      return res.send(csv);
    }

    if (type === 'ATTENDANCE') {
      const attendances = await Attendance.find({}).sort({ dateString: -1 }).limit(500);
      if (format === 'json') return res.json({ success: true, data: attendances });
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=BJK_Attendance_Report_${Date.now()}.pdf`);
        return generateReportPDF('ATTENDANCE', attendances, res);
      }

      const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Status', 'In Time', 'Out Time', 'Working Hours', 'OT Hours', 'Night Hours'];
      const rows = attendances.map(a => [
        a.dateString,
        a.employeeId,
        `"${a.employeeName}"`,
        `"${a.departmentName}"`,
        a.status,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : 'N/A',
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : 'N/A',
        a.workingHours || 0,
        a.overtimeHours || 0,
        a.nightHours || 0
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=BJK_Attendance_Report_${Date.now()}.csv`);
      return res.send(csv);
    }

    if (type === 'PAYROLL') {
      const payrolls = await Payroll.find({}).sort({ payPeriod: -1 });
      if (format === 'json') return res.json({ success: true, data: payrolls });
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=BJK_Payroll_Report_${Date.now()}.pdf`);
        return generateReportPDF('PAYROLL', payrolls, res);
      }

      const headers = ['Pay Period', 'Employee ID', 'Name', 'Department', 'Gross Earnings', 'PF', 'ESI', 'PT', 'TDS', 'Total Deductions', 'Net Pay', 'Status'];
      const rows = payrolls.map(p => [
        p.payPeriod,
        p.employeeId,
        `"${p.employeeName}"`,
        `"${p.departmentName}"`,
        p.grossEarnings,
        p.deductions?.providentFund || 0,
        p.deductions?.employeeStateInsurance || 0,
        p.deductions?.professionalTax || 0,
        p.deductions?.taxDeductedAtSource || 0,
        p.totalDeductions,
        p.netPay,
        p.status
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=BJK_Payroll_Report_${Date.now()}.csv`);
      return res.send(csv);
    }

    // 4. STATUTORY FORM 25 MUSTER ROLL (Factories Act, 1948)
    if (type === 'FORM_25_MUSTER') {
      const attendances = await Attendance.find({}).sort({ dateString: -1 }).limit(1000);
      if (format === 'json') return res.json({ success: true, reportType: 'FORM_25_MUSTER_ROLL', data: attendances });

      const headers = ['Date', 'Employee Token / ID', 'Workman Full Name', 'Department / Section', 'Shift Assigned', 'Punch In', 'Punch Out', 'Hours Worked', 'Dwell Time (Mins)', 'Overtime Hours', 'Muster Status'];
      const rows = attendances.map(a => [
        a.dateString,
        a.employeeId,
        `"${a.employeeName}"`,
        `"${a.departmentName}"`,
        `"${a.shiftName || 'General Shift'}"`,
        a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '--',
        a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '--',
        a.workingHours || 0,
        a.dwellTimeMinutes || 0,
        a.overtimeHours || 0,
        a.status
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=BJK_Form25_Muster_Register_${Date.now()}.csv`);
      return res.send(csv);
    }

    // 5. STATUTORY FORM B REGISTER OF WAGES (Code on Wages & Gujarat Rules)
    if (type === 'FORM_B_WAGES') {
      const payrolls = await Payroll.find({}).sort({ payPeriod: -1 });
      if (format === 'json') return res.json({ success: true, reportType: 'FORM_B_REGISTER_OF_WAGES', data: payrolls });

      const headers = ['Wage Period', 'Employee ID', 'Workman Name', 'Designation', 'Days Payable', 'Basic Wages', 'HRA', 'Allowances', 'Gross Wages (A)', 'EPF (12%)', 'ESIC (0.75%)', 'Prof Tax', 'TDS', 'Total Deductions (B)', 'Net Disbursed Wages (A-B)', 'Payment Status'];
      const rows = payrolls.map(p => [
        p.payPeriod,
        p.employeeId,
        `"${p.employeeName}"`,
        `"${p.designationTitle || 'Operator'}"`,
        p.attendanceSummary?.payableDays || 30,
        p.earnings?.basic || 0,
        p.earnings?.hra || 0,
        (p.grossEarnings || 0) - (p.earnings?.basic || 0) - (p.earnings?.hra || 0),
        p.grossEarnings || 0,
        p.deductions?.providentFund || 0,
        p.deductions?.employeeStateInsurance || 0,
        p.deductions?.professionalTax || 0,
        p.deductions?.taxDeductedAtSource || 0,
        p.totalDeductions || 0,
        p.netPay || 0,
        `"${p.status}"`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=BJK_FormB_Wage_Register_${Date.now()}.csv`);
      return res.send(csv);
    }

    return res.status(400).json({ success: false, message: 'Unsupported report type' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/reports/master-doc
const downloadMasterDoc = async (req, res) => {
  try {
    const docPath = path.join(__dirname, '../../BJK_HEALTHCARE_ENTERPRISE_HRMS_SPECIFICATION.docx');
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({ success: false, message: 'Specification document file not found' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=BJK_HEALTHCARE_ENTERPRISE_HRMS_SPECIFICATION.docx');

    const fileStream = fs.createReadStream(docPath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { exportReport, downloadMasterDoc };
