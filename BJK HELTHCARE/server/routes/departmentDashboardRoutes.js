const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDepartmentDashboardData } = require('../controllers/departmentDashboardController');
const { getDashboardSummary } = require('../controllers/enterpriseController');

// All department dashboard routes require valid authenticated session
router.use(protect);

// Department-specific telemetry and operational queue data
router.get('/department-data', getDepartmentDashboardData);
router.get('/summary', getDepartmentDashboardData);
router.get('/enterprise-summary', getDashboardSummary);

module.exports = router;
