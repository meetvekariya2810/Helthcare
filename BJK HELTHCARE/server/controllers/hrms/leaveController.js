// Re-export comprehensive enterprise leave controller for HRMS backward compatibility
const leaveController = require('../leaveController');

module.exports = {
  ...leaveController,
  updateLeaveStatus: async (req, res) => {
    // Backward compatibility wrapper for old updateLeaveStatus callers
    const { status } = req.body;
    if (status === 'APPROVED') {
      if (req.user.role === 'TEAM_LEAD') return leaveController.teamManagerApprove(req, res);
      if (['DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER'].includes(req.user.role)) return leaveController.departmentManagerApprove(req, res);
      return leaveController.hrApprove(req, res);
    } else if (status === 'REJECTED') {
      if (req.user.role === 'TEAM_LEAD') return leaveController.teamManagerReject(req, res);
      if (['DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER'].includes(req.user.role)) return leaveController.departmentManagerReject(req, res);
      return leaveController.hrReject(req, res);
    }
    return leaveController.updateLeaveType(req, res);
  }
};
