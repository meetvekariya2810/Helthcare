const express = require('express');
const router = express.Router();
const {
  getPolicy,
  updatePolicy,
  getTodayAttendanceAll,
  getAttendanceHistoryAll,
  getEmployeeAttendance,
  getAuditLogs
} = require('../controllers/adminAttendanceController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All Admin attendance routes are protected
router.use(protect);
router.use(requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR'));

// Geofence Policy Endpoints
router.get('/policy', getPolicy);
router.post('/policy', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN'), updatePolicy);

// Enterprise Attendance Endpoints
router.get('/today', getTodayAttendanceAll);
router.get('/history', getAttendanceHistoryAll);
router.get('/employee/:employeeId', getEmployeeAttendance);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
