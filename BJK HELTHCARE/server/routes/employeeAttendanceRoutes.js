const express = require('express');
const router = express.Router();
const {
  getTodayAttendance,
  checkLocation,
  punchIn,
  punchOut,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  getAttendanceHistory,
  getAttendanceSummary,
  getFaceStatus,
  registerFace
} = require('../controllers/EmployeeAttendanceController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

// All employee attendance endpoints require valid employee authentication & ownership authorization
router.use(authenticateEmployee);
router.use(authorizeOwnership);

// Location & Today Attendance Status
router.get('/today', getTodayAttendance);
router.post('/location-check', checkLocation);

// Geofenced Punch Actions (100-Meter Authority)
router.post('/punch-in', punchIn);
router.post('/check-in', checkIn);
router.post('/punch-out', punchOut);
router.post('/check-out', checkOut);

// Shift Breaks
router.post('/start-break', startBreak);
router.post('/end-break', endBreak);

// Attendance Summaries & History
router.get('/summary', getAttendanceSummary);
router.get('/history', getAttendanceHistory);
router.get('/me', getAttendanceSummary);
router.get('/', getAttendanceHistory);

// Biometric Face Attendance
router.get('/face-status', getFaceStatus);
router.post('/face-register', registerFace);

module.exports = router;
