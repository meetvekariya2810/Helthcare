const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { requirePermission, requireRole } = require('../middleware/rbac');
const { PERMISSIONS, ROLES } = require('../config/rbac');

// Controllers
const { getDashboardData, getWorkforceStatus, getActivityLogs, getDataQualityReport } = require('../controllers/hrms/dashboardController');
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, downloadExperienceCertificatePDF } = require('../controllers/hrms/employeeController');
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  reorderDepartments,
  addSubDepartment,
  updateSubDepartment,
  deleteSubDepartment,
  getDesignations,
  createDesignation,
  getHierarchyTree
} = require('../controllers/hrms/orgController');
const { getAttendance, markPunch, biometricWebhook, requestCorrection } = require('../controllers/hrms/attendanceController');
const {
  getAttendanceDashboard,
  getAttendanceCommandCenterData,
  previewAttendanceReport,
  generateExcelReport,
  generateCsvReport,
  saveReportTemplate,
  getReportTemplates,
  deleteReportTemplate,
  getReportHistory,
  submitRegularization,
  getRegularizationRequests,
  approveRegularization,
  rejectRegularization
} = require('../controllers/hrms/attendanceReportController');
const { getShifts, createShift, updateShift } = require('../controllers/hrms/shiftController');
const { getRosters, assignShift, requestShiftSwap, approveShiftSwap } = require('../controllers/hrms/rosterController');
const { getLeaveTypes, getLeaveBalances, getLeaveRequests, applyLeave, updateLeaveStatus } = require('../controllers/hrms/leaveController');
const { getPayrollRuns, getPayslipById, processPayroll, approvePayroll, deletePayrollRecord, deletePayrollBatch, getPayrollRules, downloadPayslipPDF } = require('../controllers/hrms/payrollController');
const { getJobs, createJob, getCandidates, updateCandidateStage, downloadOfferLetterPDF, initiateOnboardingFromCandidate } = require('../controllers/hrms/recruitmentController');
const { getOnboardingList, updateChecklistTask } = require('../controllers/hrms/onboardingController');
const { getPrograms, getEnrollments, enrollEmployee, completeTraining, downloadCertificatePDF } = require('../controllers/hrms/trainingController');
const { getCredentials, addCredential, verifyCredential } = require('../controllers/hrms/credentialController');
const {
  getDocuments,
  getMasterChecklistDefinition,
  getEmployeeChecklistRegistry,
  getSingleEmployeeChecklist,
  verifyDocumentSlot,
  uploadDocument,
  generateLetter,
  verifyDocumentSeal
} = require('../controllers/hrms/documentController');
const { getAssets, createAsset, assignAsset, returnAsset, getExpenses, createExpenseClaim, updateExpenseStatus } = require('../controllers/hrms/assetExpenseController');
const { getReviews, updateReview, createCycle, createReview } = require('../controllers/hrms/performanceController');
const { getAnalytics } = require('../controllers/hrms/analyticsController');
const { getRules, toggleRule, runAutomationCycle } = require('../controllers/hrms/automationController');
const { getCompliance } = require('../controllers/hrms/complianceController');
const { getNotifications, markAsRead, markAllAsRead, createAnnouncement } = require('../controllers/hrms/notificationController');
const { askCopilot } = require('../controllers/hrms/copilotController');
const { exportReport, downloadMasterDoc } = require('../controllers/hrms/reportController');
const {
  getCoreHRMSDashboard,
  getNonTechnicalStaffList,
  createNonTechnicalEmployee,
  deleteNonTechnicalEmployee,
  markAttendanceIndividual,
  bulkMarkAttendance,
  getAttendanceHistory,
  getMyAttendance
} = require('../controllers/hrms/coreHrmsController');

// All HRMS routes require authentication
router.use(protect);

// Strict HR Role Enforcement
const requireHRRole = requireRole(
  ROLES.SUPER_ADMIN,
  ROLES.DIRECTOR,
  ROLES.HR_ADMIN,
  ROLES.HR_MANAGER,
  ROLES.HR_EXECUTIVE,
  ROLES.HR,
  'ADMIN'
);

// 0. Core HRMS (Non-Technical Staff & Daily Manual Attendance)
router.get('/core/dashboard', requireHRRole, getCoreHRMSDashboard);
router.get('/core/employees', requireHRRole, getNonTechnicalStaffList);
router.post('/core/employees', requirePermission(PERMISSIONS.EMPLOYEE_CREATE), createNonTechnicalEmployee);
router.delete('/core/employees/:id', requirePermission(PERMISSIONS.EMPLOYEE_DELETE), deleteNonTechnicalEmployee);
router.post('/core/attendance/mark', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), markAttendanceIndividual);
router.post('/core/attendance/bulk', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), bulkMarkAttendance);
router.get('/core/attendance/history', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getAttendanceHistory);
router.get('/core/my-attendance', getMyAttendance);

// Direct aliases for Core HRMS attendance management
router.get('/attendance/today', requireHRRole, getCoreHRMSDashboard);
router.post('/attendance/mark', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), markAttendanceIndividual);
router.post('/attendance/bulk', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), bulkMarkAttendance);
router.get('/attendance/history', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getAttendanceHistory);

// 1. Dashboard & Command Center Telemetry (Strictly HR Isolated)
router.get('/dashboard', requireHRRole, getDashboardData);
router.get('/dashboard/workforce', requireHRRole, getWorkforceStatus);
router.get('/dashboard/activity', requireHRRole, getActivityLogs);
router.get('/dashboard/data-quality', requireHRRole, getDataQualityReport);

// 2. Employees
router.get('/employees', requirePermission(PERMISSIONS.EMPLOYEE_VIEW), getEmployees);
router.get('/employees/:id', requirePermission(PERMISSIONS.EMPLOYEE_VIEW), getEmployeeById);
router.get('/employees/:id/experience-pdf', downloadExperienceCertificatePDF);
router.post('/employees', requirePermission(PERMISSIONS.EMPLOYEE_CREATE), createEmployee);
router.put('/employees/:id', requirePermission(PERMISSIONS.EMPLOYEE_UPDATE), updateEmployee);
router.delete('/employees/:id', requirePermission(PERMISSIONS.EMPLOYEE_DELETE), deleteEmployee);

// 3. Organization & Hierarchy
router.get('/organization/departments', getDepartments);
router.post('/organization/departments', requirePermission(PERMISSIONS.SETTINGS_MANAGE), createDepartment);
router.put('/organization/departments/reorder', requirePermission(PERMISSIONS.SETTINGS_MANAGE), reorderDepartments);
router.put('/organization/departments/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), updateDepartment);
router.delete('/organization/departments/:id', requirePermission(PERMISSIONS.SETTINGS_MANAGE), deleteDepartment);

// Sub-departments
router.post('/organization/departments/:id/sub-departments', requirePermission(PERMISSIONS.SETTINGS_MANAGE), addSubDepartment);
router.put('/organization/departments/:id/sub-departments/:subId', requirePermission(PERMISSIONS.SETTINGS_MANAGE), updateSubDepartment);
router.delete('/organization/departments/:id/sub-departments/:subId', requirePermission(PERMISSIONS.SETTINGS_MANAGE), deleteSubDepartment);

router.get('/organization/designations', getDesignations);
router.post('/organization/designations', requirePermission(PERMISSIONS.SETTINGS_MANAGE), createDesignation);
router.get('/organization/hierarchy', getHierarchyTree);

// 4. Attendance & Reporting
router.get('/attendance', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getAttendance);
router.get('/attendance/dashboard', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getAttendanceDashboard);
router.get('/attendance/command-center', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getAttendanceCommandCenterData);
router.post('/attendance/reports/preview', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), previewAttendanceReport);
router.post('/attendance/reports/excel', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), generateExcelReport);
router.post('/attendance/reports/csv', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), generateCsvReport);
router.get('/attendance/reports/templates', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getReportTemplates);
router.post('/attendance/reports/templates', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), saveReportTemplate);
router.delete('/attendance/reports/templates/:id', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), deleteReportTemplate);
router.get('/attendance/reports/history', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getReportHistory);

// Regularization & Punches
router.get('/attendance/regularization', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), getRegularizationRequests);
router.post('/attendance/regularization', submitRegularization);
router.put('/attendance/regularization/:id/approve', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), approveRegularization);
router.put('/attendance/regularization/:id/reject', requirePermission(PERMISSIONS.ATTENDANCE_VIEW), rejectRegularization);
router.post('/attendance/punch', markPunch); // Web & Mobile check-in/out
router.post('/attendance/biometric', biometricWebhook); // Biometric adapter
router.post('/attendance/correction', requestCorrection);

// 5. Shifts
router.get('/shifts', requirePermission(PERMISSIONS.SHIFT_VIEW), getShifts);
router.post('/shifts', requirePermission(PERMISSIONS.SHIFT_MANAGE), createShift);
router.put('/shifts/:id', requirePermission(PERMISSIONS.SHIFT_MANAGE), updateShift);

// 6. Rostering & Shift Swap
router.get('/rostering', requirePermission(PERMISSIONS.ROSTER_VIEW), getRosters);
router.post('/rostering/assign', requirePermission(PERMISSIONS.ROSTER_MANAGE), assignShift);
router.post('/rostering/swap-request', requestShiftSwap);
router.put('/rostering/swap-approve', requirePermission(PERMISSIONS.SHIFT_SWAP_APPROVE), approveShiftSwap);

// 7. Leave Management
router.get('/leaves', requirePermission(PERMISSIONS.LEAVE_VIEW), getLeaveRequests);
router.get('/leaves/types', getLeaveTypes);
router.get('/leaves/balances/:employeeId', getLeaveBalances);
router.get('/leaves/requests', requirePermission(PERMISSIONS.LEAVE_VIEW), getLeaveRequests);
router.post('/leaves/apply', applyLeave);
router.put('/leaves/:id/status', requirePermission(PERMISSIONS.LEAVE_APPROVE), updateLeaveStatus);

// 8. Payroll (Strict RBAC)
router.get('/payroll', getPayrollRuns);
router.get('/payroll/rules', getPayrollRules);
router.get('/payroll/:id', getPayslipById);
router.get('/payroll/:id/pdf', downloadPayslipPDF);
router.post('/payroll/process', requirePermission(PERMISSIONS.PAYROLL_PROCESS), processPayroll);
router.put('/payroll/:id/approve', requirePermission(PERMISSIONS.PAYROLL_PROCESS), approvePayroll);
router.delete('/payroll/:id', requirePermission(PERMISSIONS.PAYROLL_PROCESS), deletePayrollRecord);
router.delete('/payroll/batch/:payPeriod', requirePermission(PERMISSIONS.PAYROLL_PROCESS), deletePayrollBatch);

// 9. Recruitment & ATS
router.get('/recruitment/jobs', requirePermission(PERMISSIONS.RECRUITMENT_VIEW), getJobs);
router.post('/recruitment/jobs', requirePermission(PERMISSIONS.RECRUITMENT_MANAGE), createJob);
router.get('/recruitment/candidates', requirePermission(PERMISSIONS.RECRUITMENT_VIEW), getCandidates);
router.get('/recruitment/candidates/:id/offer-pdf', requirePermission(PERMISSIONS.RECRUITMENT_VIEW), downloadOfferLetterPDF);
router.put('/recruitment/candidates/:id/stage', requirePermission(PERMISSIONS.RECRUITMENT_MANAGE), updateCandidateStage);
router.post('/recruitment/candidates/:id/initiate-onboarding', requirePermission(PERMISSIONS.ONBOARDING_MANAGE), initiateOnboardingFromCandidate);

// 10. Onboarding
router.get('/onboarding', requirePermission(PERMISSIONS.ONBOARDING_VIEW), getOnboardingList);
router.put('/onboarding/:id/task', requirePermission(PERMISSIONS.ONBOARDING_MANAGE), updateChecklistTask);

// 11. Training & LMS
router.get('/training/programs', getPrograms);
router.get('/training/enrollments', requirePermission(PERMISSIONS.TRAINING_VIEW), getEnrollments);
router.get('/training/enrollments/:id/certificate-pdf', downloadCertificatePDF);
router.post('/training/enroll', requirePermission(PERMISSIONS.TRAINING_MANAGE), enrollEmployee);
router.put('/training/complete/:id', completeTraining);

// 12. Credentials
router.get('/credentials', requirePermission(PERMISSIONS.CREDENTIAL_VIEW), getCredentials);
router.post('/credentials', requirePermission(PERMISSIONS.CREDENTIAL_MANAGE), addCredential);
router.put('/credentials/:id/verify', requirePermission(PERMISSIONS.CREDENTIAL_VERIFY), verifyCredential);

// 13. Documents & 12-Document Standard Checklist Safe
router.get('/documents', requirePermission(PERMISSIONS.DOCUMENT_VIEW), getDocuments);
router.get('/documents/master-checklist', requirePermission(PERMISSIONS.DOCUMENT_VIEW), getMasterChecklistDefinition);
router.get('/documents/employee-checklists', requirePermission(PERMISSIONS.DOCUMENT_VIEW), getEmployeeChecklistRegistry);
router.get('/documents/employee/:employeeId', requirePermission(PERMISSIONS.DOCUMENT_VIEW), getSingleEmployeeChecklist);
router.put('/documents/verify', requirePermission(PERMISSIONS.DOCUMENT_UPLOAD || PERMISSIONS.CREDENTIAL_VERIFY), verifyDocumentSlot);
router.post('/documents', requirePermission(PERMISSIONS.DOCUMENT_UPLOAD), uploadDocument);
router.post('/documents/generate-letter', requirePermission(PERMISSIONS.DOCUMENT_UPLOAD), generateLetter);
router.get('/documents/:id/verify-seal', verifyDocumentSeal);

// 14. Assets & Expenses
router.get('/assets', requirePermission(PERMISSIONS.ASSET_VIEW), getAssets);
router.post('/assets', requirePermission(PERMISSIONS.ASSET_MANAGE), createAsset);
router.post('/assets/assign', requirePermission(PERMISSIONS.ASSET_MANAGE), assignAsset);
router.post('/assets/return', requirePermission(PERMISSIONS.ASSET_MANAGE), returnAsset);
router.get('/expenses', requirePermission(PERMISSIONS.EXPENSE_VIEW), getExpenses);
router.post('/expenses', createExpenseClaim);
router.put('/expenses/:id/status', requirePermission(PERMISSIONS.EXPENSE_APPROVE), updateExpenseStatus);

// 15. Performance
router.get('/performance', requirePermission(PERMISSIONS.PERFORMANCE_VIEW), getReviews);
router.post('/performance/cycles', requirePermission(PERMISSIONS.PERFORMANCE_MANAGE || PERMISSIONS.SETTINGS_MANAGE), createCycle);
router.post('/performance/reviews', requirePermission(PERMISSIONS.PERFORMANCE_MANAGE || PERMISSIONS.SETTINGS_MANAGE), createReview);
router.put('/performance/:id', updateReview);

// 16. Intelligence, Analytics & Automation
router.get('/analytics', requirePermission(PERMISSIONS.ANALYTICS_VIEW), getAnalytics);
router.get('/automation/rules', requirePermission(PERMISSIONS.AUTOMATION_VIEW), getRules);
router.put('/automation/rules/:id/toggle', requirePermission(PERMISSIONS.AUTOMATION_MANAGE), toggleRule);
router.post('/automation/run-eval', requirePermission(PERMISSIONS.AUTOMATION_MANAGE), runAutomationCycle);
router.get('/compliance', requirePermission(PERMISSIONS.COMPLIANCE_VIEW), getCompliance);

// 17. Notifications & Announcements Broadcast
const canBroadcastAnnouncement = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthenticated user' });
  }
  const role = (req.user.role || '').toUpperCase();
  const allowedRoles = [
    'SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'SYSTEM_ADMINISTRATOR',
    'HR_ADMIN', 'HR_MANAGER', 'HR', 'HR_EXECUTIVE', 'DEPARTMENT_MANAGER', 'MANAGER'
  ];
  if (allowedRoles.includes(role)) {
    return next();
  }
  if (req.user.permissions && Array.isArray(req.user.permissions)) {
    if (req.user.permissions.some(p => ['*', 'settings.manage', 'settings:manage', 'employee:update', 'employee:create', 'hr.announcements', 'hrms:manage'].includes(p))) {
      return next();
    }
  }
  return res.status(403).json({
    success: false,
    message: 'Forbidden: You do not have authorization to broadcast announcements.'
  });
};

router.get('/notifications', getNotifications);
router.post('/notifications/announcement', canBroadcastAnnouncement, createAnnouncement);
router.put('/notifications/:id/read', markAsRead);
router.put('/notifications/mark-all-read', markAllAsRead);

// 18. AI Copilot
router.post('/copilot/ask', requirePermission(PERMISSIONS.COPILOT_ACCESS), askCopilot);

// 19. Reports & Master Documentation
router.get('/reports/export', requirePermission(PERMISSIONS.ANALYTICS_VIEW), exportReport);
router.get('/reports/master-doc', downloadMasterDoc);

module.exports = router;
