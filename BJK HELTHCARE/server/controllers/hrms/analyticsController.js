const Employee = require('../../models/hrms/Employee');
const Attendance = require('../../models/hrms/Attendance');
const { TrainingEnrollment } = require('../../models/hrms/Training');
const Credential = require('../../models/hrms/Credential');
const { Payroll } = require('../../models/hrms/Payroll');
const { LeaveRequest } = require('../../models/hrms/Leave');

// GET /api/hrms/analytics
const getAnalytics = async (req, res) => {
  try {
    // 1. Headcount by Department
    const departmentHeadcount = await Employee.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$departmentName', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Headcount by Employment Type
    const employmentTypeBreakdown = await Employee.aggregate([
      { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);

    // 3. Attendance Status Distribution (Last 30 Days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

    const attendanceTrends = await Attendance.aggregate([
      { $match: { dateString: { $gte: thirtyDaysStr } } },
      {
        $group: {
          _id: '$dateString',
          present: { $sum: { $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'ABSENT'] }, 1, 0] } },
          overtimeHours: { $sum: '$overtimeHours' },
          nightHours: { $sum: '$nightHours' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // 4. Overtime Hours by Department
    const overtimeByDept = await Attendance.aggregate([
      { $match: { overtimeHours: { $gt: 0 } } },
      { $group: { _id: '$departmentName', totalOT: { $sum: '$overtimeHours' } } },
      { $sort: { totalOT: -1 } }
    ]);

    // 5. Training Compliance Rate by Category
    const trainingCompliance = await TrainingEnrollment.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $eq: ['$status', 'OVERDUE'] }, 1, 0] } }
        }
      }
    ]);

    // 6. Credential Expiry Profile
    const credentialProfile = await Credential.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 7. Monthly Workforce Payroll Cost (Last 6 Months)
    const monthlyPayrollCost = await Payroll.aggregate([
      {
        $group: {
          _id: '$payPeriod',
          gross: { $sum: '$grossEarnings' },
          net: { $sum: '$netPay' },
          companyCost: { $sum: '$totalCompanyCost' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      analytics: {
        departmentHeadcount: departmentHeadcount.map(d => ({ name: d._id, count: d.count })),
        employmentTypeBreakdown: employmentTypeBreakdown.map(e => ({ name: e._id, count: e.count })),
        attendanceTrends: attendanceTrends.map(a => ({
          date: a._id,
          present: a.present,
          absent: a.absent,
          overtimeHours: parseFloat(a.overtimeHours.toFixed(1)),
          nightHours: parseFloat(a.nightHours.toFixed(1))
        })),
        overtimeByDept: overtimeByDept.map(o => ({ department: o._id, hours: o.totalOT })),
        trainingCompliance: trainingCompliance.map(t => ({
          category: t._id,
          total: t.total,
          completed: t.completed,
          percentage: t.total > 0 ? Math.round((t.completed / t.total) * 100) : 100
        })),
        credentialProfile: credentialProfile.map(c => ({ status: c._id, count: c.count })),
        monthlyPayrollCost: monthlyPayrollCost.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };
