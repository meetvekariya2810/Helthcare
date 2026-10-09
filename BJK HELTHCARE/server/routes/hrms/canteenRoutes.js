const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Employee = require('../../models/Employee');

const {
  lunchIn,
  lunchOut,
  getMyTodayStatus,
  getMyHistory,
  getMySummary,
  getHRTodayDashboard,
  getDepartmentSummary,
  getHRHistory,
  finalizeDay,
  reopenDay,
  correctRecord,
  exportExcel,
  exportMonthlyExcel,
  getAuditHistory,
  getCanteenEmployees,
  getCanteenEmployeeHistory,
  getDailyReportData,
  getMonthlyReportData,
  getCanteenSettings,
  updateCanteenSettings,
  resetAllCanteenData
} = require('../../controllers/hrms/canteenController');

const JWT_SECRET = process.env.JWT_SECRET || 'bjk_healthcare_digital_brain_ultra_secure_jwt_secret_key_2026_enterprise';

/**
 * Unified Canteen Authentication Middleware
 * Supports both Employee Portal JWT and Admin/HR JWT sessions
 */
const canteenAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required for Canteen operations.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded.sub;
    const employeeId = (decoded.employeeId || decoded.empId || '').toUpperCase();

    let user = null;
    let employee = null;

    if (mongoose.connection.readyState === 1) {
      if (employeeId) {
        employee = await Employee.findOne({
          $or: [{ employeeId: employeeId }, { employeeCode: employeeId }]
        });
      }
      if (userId && mongoose.isValidObjectId(userId)) {
        user = await User.findById(userId).select('-password -passwordHash');
      } else if (decoded.email) {
        user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password -passwordHash');
      }
    }

    req.user = user || {
      _id: userId,
      id: userId,
      name: decoded.name || 'User',
      email: decoded.email,
      role: decoded.role || 'EMPLOYEE',
      department: decoded.department || 'General',
      employeeId: employeeId || null
    };

    req.employee = employee || {
      employeeId: employeeId || req.user.employeeId,
      fullName: decoded.name || req.user.name,
      departmentName: decoded.department || req.user.department,
      designationTitle: decoded.designation || 'Staff',
      user: userId
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
};

/**
 * HR / Canteen Management Authorization Middleware
 */
const requireCanteenOrHR = (req, res, next) => {
  const role = String(req.user?.role || req.employee?.systemRole || '').toUpperCase();
  const allowedRoles = [
    'CANTEEN_ADMIN',
    'SUPER_ADMIN',
    'DIRECTOR',
    'HR_ADMIN',
    'HR_MANAGER',
    'HR',
    'HR_EXECUTIVE',
    'OPERATIONS_MANAGER',
    'CANTEEN_MANAGER',
    'CANTEEN_SUPERVISOR',
    'CANTEEN_DEPARTMENT'
  ];

  if (allowedRoles.includes(role)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access restricted: Canteen Department or HR/Administrator authorization required.'
  });
};

// Apply unified authentication to all canteen endpoints
router.use(canteenAuth);

// ==========================================
// 1. Employee Self-Service Endpoints
// ==========================================
router.post('/lunch-in', lunchIn);
router.post('/lunch-out', lunchOut);
router.get('/my-today', getMyTodayStatus);
router.get('/my-history', getMyHistory);
router.get('/my-summary', getMySummary);

// Alternate alias routes for consistency
router.get('/today-status', getMyTodayStatus);
router.get('/me', getMyTodayStatus);

// ==========================================
// 2. Dedicated Canteen & HR Operations Endpoints
// ==========================================
router.get('/dashboard', requireCanteenOrHR, getHRTodayDashboard);
router.get('/today', requireCanteenOrHR, getHRTodayDashboard);
router.get('/employees', requireCanteenOrHR, getCanteenEmployees);
router.get('/employee/:employeeId', requireCanteenOrHR, getCanteenEmployeeHistory);
router.get('/history', requireCanteenOrHR, getHRHistory);
router.get('/summary', requireCanteenOrHR, getHRTodayDashboard);
router.get('/department-summary', requireCanteenOrHR, getDepartmentSummary);
router.get('/daily-report', requireCanteenOrHR, getDailyReportData);
router.get('/monthly-report', requireCanteenOrHR, getMonthlyReportData);
router.post('/finalize', requireCanteenOrHR, finalizeDay);
router.post('/reopen', requireCanteenOrHR, reopenDay);
router.post('/correction', requireCanteenOrHR, correctRecord);
router.get('/export', requireCanteenOrHR, exportExcel);
router.get('/export-monthly', requireCanteenOrHR, exportMonthlyExcel);
router.get('/audit', requireCanteenOrHR, getAuditHistory);

// Settings Endpoints
router.get('/settings', requireCanteenOrHR, getCanteenSettings);
router.put('/settings', requireCanteenOrHR, updateCanteenSettings);
router.post('/settings', requireCanteenOrHR, updateCanteenSettings);

// Reset / Clear All Canteen Data Endpoint
router.delete('/reset-all-data', requireCanteenOrHR, resetAllCanteenData);
router.post('/reset-all-data', requireCanteenOrHR, resetAllCanteenData);

module.exports = router;
