const { processCopilotQuery } = require('../services/hrms/copilotService');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * POST /api/employee/copilot/ask
 * Employee Self-Service AI Assistant with strict RBAC enforcement
 */
const askEmployeeCopilot = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query text is required.'
      });
    }

    const userContext = {
      _id: req.user?._id,
      name: req.user?.name || req.employee?.fullName,
      email: req.user?.email || req.employee?.email,
      role: 'EMPLOYEE', // Strictly force EMPLOYEE role scoping
      employeeId: req.employeeId,
      department: req.employee?.departmentName || req.user?.department
    };

    const response = await processCopilotQuery(query, userContext);

    await logEmployeeAudit({
      employeeId: req.employeeId,
      action: 'ASK_AI_ASSISTANT',
      details: { query, category: response.category }
    });

    return res.status(200).json({
      success: true,
      query,
      response
    });
  } catch (err) {
    console.error('[Employee Copilot Ask Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process your request with BJK Employee AI Assistant.'
    });
  }
};

module.exports = {
  askEmployeeCopilot
};
