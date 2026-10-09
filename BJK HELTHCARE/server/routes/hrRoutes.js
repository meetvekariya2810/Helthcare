const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requirePermission, requireRole } = require('../middleware/rbac');
const { PERMISSIONS, ROLES } = require('../config/rbac');

const {
  // Employee Directory & Lifecycle
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  resetEmployeePassword,
  forceLogoutEmployee,
  toggleLockEmployee,
  getEmployeeActivity,
  getEmployeeLoginHistory,

  // Documents
  getEmployeeDocuments,
  uploadEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,

  // Departments
  getDepartments,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  getDepartmentEmployees,
  getDepartmentManagers,

  // Roles & Permissions
  getRoles,
  getPermissions,
  updateUserRole,
  updateUserPermissions,

  // Security, Sessions & Audit
  getSessions,
  terminateSession,
  getLoginActivity,
  getManagerActivity,
  getHRAuditLogs,
  getHRStats
} = require('../controllers/hrController');

// All /api/hr routes require active authentication
router.use(protect);

// Strict HR Access Control: Non-HR roles must be rejected
const requireHRRole = requireRole(
  ROLES.SUPER_ADMIN,
  ROLES.DIRECTOR,
  ROLES.HR_ADMIN,
  ROLES.HR_MANAGER,
  ROLES.HR_EXECUTIVE,
  ROLES.HR,
  'ADMIN'
);

// ==========================================
// 1. HR COMMAND CENTER & STATS (Strictly Isolated)
// ==========================================
const { getDashboardData, getWorkforceStatus, getActivityLogs, getDataQualityReport } = require('../controllers/hrms/dashboardController');
router.get('/stats', requireHRRole, getHRStats);
router.get('/dashboard', requireHRRole, getDashboardData);
router.get('/dashboard/summary', requireHRRole, getDashboardData);
router.get('/dashboard/attendance', requireHRRole, getDashboardData);
router.get('/dashboard/workforce', requireHRRole, getWorkforceStatus);
router.get('/dashboard/activity', requireHRRole, getActivityLogs);
router.get('/dashboard/alerts', requireHRRole, getDashboardData);
router.get('/dashboard/analytics', requireHRRole, getDashboardData);
router.get('/dashboard/data-quality', requireHRRole, getDataQualityReport);

// ==========================================
// 1.1 ONBOARDING GUIDED WORKFLOW & POLICY CENTER
// ==========================================
router.use('/onboarding', require('./hr/onboardingRoutes'));
router.use('/policies', require('./hr/policyRoutes'));
router.use('/credentials', require('./hr/loginCredentialsRoutes'));

// ==========================================
// 2. EMPLOYEE DIRECTORY & MANAGEMENT
// ==========================================
router.get('/employees', requirePermission(PERMISSIONS.EMPLOYEE_VIEW), getEmployees);
router.get('/employees/:id', requirePermission(PERMISSIONS.EMPLOYEE_VIEW), getEmployeeById);
router.post('/employees', requirePermission(PERMISSIONS.EMPLOYEE_CREATE), createEmployee);
router.patch('/employees/:id', requirePermission(PERMISSIONS.EMPLOYEE_UPDATE), updateEmployee);
router.patch('/employees/:id/status', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), updateEmployeeStatus);

// Account Actions
router.post('/employees/:id/reset-password', requireRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER), resetEmployeePassword);
router.post('/employees/:id/force-logout', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), forceLogoutEmployee);
router.post('/employees/:id/lock', requireRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN), toggleLockEmployee);

// Activity & Login History
router.get('/employees/:id/activity', getEmployeeActivity);
router.get('/employees/:id/login-history', getEmployeeLoginHistory);

// ==========================================
// 3. EMPLOYEE DOCUMENTS
// ==========================================
router.get('/employees/:id/documents', getEmployeeDocuments);
router.post('/employees/:id/documents', requirePermission(PERMISSIONS.EMPLOYEE_DOCUMENT_UPLOAD), uploadEmployeeDocument);
router.patch('/employees/:id/documents/:documentId', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), updateEmployeeDocument);
router.delete('/employees/:id/documents/:documentId', requireRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN), deleteEmployeeDocument);

// ==========================================
// 4. DEPARTMENT MASTER APIs
// ==========================================
router.get('/departments', getDepartments);
router.post('/departments', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN), createDepartment);
router.patch('/departments/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), updateDepartment);
router.patch('/departments/:id/status', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN), updateDepartmentStatus);
router.get('/departments/:id/employees', getDepartmentEmployees);
router.get('/departments/:id/managers', getDepartmentManagers);

// ==========================================
// 5. ROLE & PERMISSION APIs
// ==========================================
router.get('/roles', getRoles);
router.get('/permissions', getPermissions);
router.patch('/users/:id/role', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN), updateUserRole);
router.patch('/users/:id/permissions', requireRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN), updateUserPermissions);

// ==========================================
// 6. SESSIONS, LOGIN ACTIVITY & AUDIT LOGS
// ==========================================
router.get('/sessions', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.IT_ADMIN), getSessions);
router.delete('/sessions/:sessionId', requireRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.IT_ADMIN), terminateSession);
router.get('/login-activity', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.IT_ADMIN, ROLES.AUDITOR), getLoginActivity);
router.get('/manager-activity', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.AUDITOR), getManagerActivity);
router.get('/audit-logs', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.AUDITOR), getHRAuditLogs);

module.exports = router;
