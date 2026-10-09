const express = require('express');
const router = express.Router();
const { askEmployeeCopilot } = require('../controllers/EmployeeCopilotController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.post('/ask', askEmployeeCopilot);

module.exports = router;
