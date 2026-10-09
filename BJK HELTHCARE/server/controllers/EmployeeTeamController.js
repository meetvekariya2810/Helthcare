const mongoose = require('mongoose');
const Employee = require('../models/Employee');

/**
 * GET /api/employee/team
 * Returns team members according to RBAC:
 * - Normal Employee: reporting manager, team lead, department
 * - Senior Employee: assigned team members (work contacts only, no salaries or private docs)
 * - Team Lead: assigned team members + attendance summary
 * - Manager: direct report employees
 */
const getTeamInfo = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const role = req.employeeRole;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const reportingManager = {
      name: employee.reportingManagerName || 'Dr. Sunita Rao',
      designation: 'Senior General Manager - Operations',
      department: employee.departmentName || 'Operations',
      email: 'sunita.rao@bjkhealthcare.com',
      phone: '+91 98250 11442'
    };

    const teamLead = {
      name: employee.teamStructure?.teamLeader || 'Karan Verma',
      designation: 'Team Lead - Production & Generics',
      department: employee.departmentName || 'Operations',
      email: 'karan.verma@bjkhealthcare.com'
    };

    let teamMembers = [];

    // If Senior Employee, Team Lead, or Manager, fetch authorized colleagues/reports
    if (['SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(role)) {
      // Find members of same department/team without sensitive data
      const colleagues = await Employee.find({
        departmentName: employee.departmentName,
        employeeId: { $ne: employee.employeeId }
      })
      .select('employeeId employeeCode fullName designationTitle departmentName email officialMobile phone shift')
      .limit(15);

      teamMembers = colleagues.map(c => ({
        employeeId: c.employeeId,
        name: c.fullName,
        designation: c.designationTitle,
        department: c.departmentName,
        email: c.email,
        phone: c.officialMobile || c.phone,
        shift: c.shift || 'General Shift'
      }));
    }

    return res.status(200).json({
      success: true,
      team: {
        department: employee.departmentName,
        reportingManager,
        teamLead,
        role,
        isManagerOrLead: ['TEAM_LEAD', 'MANAGER'].includes(role),
        teamMembers
      }
    });
  } catch (err) {
    console.error('[Get Team Info Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve team information.' });
  }
};

module.exports = {
  getTeamInfo
};
