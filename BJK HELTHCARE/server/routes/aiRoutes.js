const express = require('express');
const router = express.Router();
const { processAICopilotQuery } = require('../controllers/aiCopilotController');
const { protect } = require('../middleware/auth');

// Support both query and chat endpoints (authenticated copilot)
router.post('/query', protect, processAICopilotQuery);

router.post('/chat', protect, processAICopilotQuery);

module.exports = router;
