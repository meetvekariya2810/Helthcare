const express = require('express');
const router = express.Router();
const { processAICopilotQuery } = require('../controllers/aiCopilotController');
const { protect } = require('../middleware/auth');

// Support both query and chat endpoints (public preview & authenticated copilot)
router.post('/query', (req, res, next) => {
  // If authorization header exists, verify it, else allow demo public questions
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, processAICopilotQuery);

router.post('/chat', protect, processAICopilotQuery);

module.exports = router;
