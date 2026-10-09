const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getDepartmentDashboardData } = require('../controllers/departmentDashboardController');
const { getDashboardSummary } = require('../controllers/enterpriseController');

// Open/Executive Unified Dashboard Telemetry Summary
router.get('/summary', (req, res, next) => {
  // If authorization header present, resolve department-specific summary
  if (req.headers.authorization) {
    return protect(req, res, () => getDepartmentDashboardData(req, res));
  }
  return getDashboardSummary(req, res, next);
});

// Authenticated Department Data
router.get('/department-data', protect, getDepartmentDashboardData);

module.exports = router;
