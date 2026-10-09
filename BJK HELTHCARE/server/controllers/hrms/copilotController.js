const { processCopilotQuery } = require('../../services/hrms/copilotService');

// POST /api/hrms/copilot/ask
const askCopilot = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Query string is required' });
    }

    const response = await processCopilotQuery(query, req.user);

    res.json({
      success: true,
      query,
      response
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { askCopilot };
