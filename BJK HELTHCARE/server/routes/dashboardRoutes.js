const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDepartmentDashboardData } = require('../controllers/departmentDashboardController');
const { getDashboardSummary } = require('../controllers/enterpriseController');

// Unified Dashboard Telemetry Summary (strictly requires authentication)
router.get('/summary', protect, (req, res) => getDepartmentDashboardData(req, res));

// Authenticated Department Data
router.get('/department-data', protect, getDepartmentDashboardData);

module.exports = router;
