const express = require('express');
const router = express.Router();
const {
  login,
  changePassword,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} = require('../controllers/EmployeeAuthController');
const { authenticateEmployee } = require('../middleware/employeeAuth');

// Public Employee Authentication Routes
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated Employee Identity Routes
router.get('/me', authenticateEmployee, getMe);
router.post('/change-password', authenticateEmployee, changePassword);
router.post('/logout', authenticateEmployee, logout);

module.exports = router;
