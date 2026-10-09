const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const leaveController = require('../controllers/leaveController');

// All leave routes require authenticated session
router.use(protect);

// 1. Leave Types & Policies
router.get('/types', leaveController.getLeaveTypes);
router.post('/types', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.createLeaveType);
router.put('/types/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.updateLeaveType);

router.get('/policies', leaveController.getLeavePolicies);
router.post('/policies', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.createOrUpdateLeavePolicy);

router.get('/holidays', leaveController.getHolidays);
router.post('/holidays', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.createHoliday);

// 2. Balances
router.get('/balances', leaveController.getLeaveBalances);
router.get('/balances/all', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE'), leaveController.getAllLeaveBalances);
router.get('/balances/:employeeId', leaveController.getLeaveBalances);
router.post('/balances/:employeeId/adjust', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.adjustLeaveBalance);

// 3. Leave Applications & Requests
router.post('/requests', leaveController.applyLeave);
router.get('/requests', leaveController.getLeaveRequests);
router.get('/requests/:id', leaveController.getLeaveRequestById);

// 4. Cancellations & Withdrawals
router.patch('/requests/:id/withdraw', leaveController.withdrawLeave);
router.patch('/requests/:id/cancel', leaveController.cancelLeave);

// 5. Phase 3 — Team Manager Approval / Rejection
router.post(
  '/requests/:id/team-approve',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'TEAM_LEAD', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.teamManagerApprove
);
router.post(
  '/requests/:id/team-reject',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'TEAM_LEAD', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.teamManagerReject
);

// 6. Phase 4 — Department Manager Approval / Rejection
router.post(
  '/requests/:id/department-approve',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'WAREHOUSE_MANAGER', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.departmentManagerApprove
);
router.post(
  '/requests/:id/department-reject',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'WAREHOUSE_MANAGER', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.departmentManagerReject
);

// 7. Phase 5 — HR Final Sanction & Administrative Override
router.post(
  '/requests/:id/hr-approve',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.hrApprove
);
router.post(
  '/requests/:id/hr-reject',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.hrReject
);
router.post(
  '/requests/:id/hr-override',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.hrOverride
);
router.post(
  '/bulk-approve',
  requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'),
  leaveController.bulkApproveLeaves
);

// HR Specification Direct Aliases (Prompt Section 40)
router.get('/configuration', leaveController.getLeaveTypes);
router.post('/configuration', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.createLeaveType);
router.put('/configuration/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.updateLeaveType);
router.get('/applications', leaveController.getLeaveRequests);
router.post('/:id/sanction', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.hrApprove);
router.post('/:id/reject', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.hrReject);

// Manager Direct Aliases
router.get('/manager/pending', (req, res, next) => {
  req.query.status = 'TEAM_MANAGER_PENDING';
  req.query.viewMode = 'manager';
  leaveController.getLeaveRequests(req, res, next);
});
router.post('/manager/:id/approve', requireRole('SUPER_ADMIN', 'DIRECTOR', 'TEAM_LEAD', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'HR_ADMIN', 'HR_MANAGER'), leaveController.teamManagerApprove);
router.post('/manager/:id/reject', requireRole('SUPER_ADMIN', 'DIRECTOR', 'TEAM_LEAD', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'HR_ADMIN', 'HR_MANAGER'), leaveController.teamManagerReject);

// Department Head Direct Aliases
router.get('/department-head/pending', (req, res, next) => {
  req.query.status = 'DEPARTMENT_MANAGER_PENDING';
  req.query.viewMode = 'department-manager';
  leaveController.getLeaveRequests(req, res, next);
});
router.post('/department-head/:id/approve', requireRole('SUPER_ADMIN', 'DIRECTOR', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'WAREHOUSE_MANAGER', 'HR_ADMIN', 'HR_MANAGER'), leaveController.departmentManagerApprove);
router.post('/department-head/:id/reject', requireRole('SUPER_ADMIN', 'DIRECTOR', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'WAREHOUSE_MANAGER', 'HR_ADMIN', 'HR_MANAGER'), leaveController.departmentManagerReject);

// 8. Calendar, Activity & Reports
router.get('/calendar', leaveController.getLeaveCalendar);
router.get('/activity', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'AUDITOR'), leaveController.getLeaveActivity);
router.get('/reports', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'AUDITOR', 'FINANCE_MANAGER'), leaveController.getLeaveReports);

// 9. 2026 Master Leave Ledger & Employee-wise Management (Prompt Section 1-35)
const multer = require('multer');
const uploadMem = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/ledger', leaveController.getLeaveLedgerDashboard);
router.get('/monthly', leaveController.getMonthlyLeaveMatrixData);
router.get('/employee/:employeeCode', leaveController.getEmployeeLeaveDetail);
router.get('/attendance/employee/:employeeCode', leaveController.getEmployeeAttendanceForHR);
router.post('/import', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), uploadMem.single('file'), leaveController.importLeaveCSVData);
router.get('/export', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'AUDITOR'), leaveController.exportLeaveCSVData);

// Direct approve/reject aliases
router.put('/:id/approve', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.hrApprove);
router.put('/:id/reject', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), leaveController.hrReject);

// Root leave GET handler returns master ledger dashboard
router.get('/', leaveController.getLeaveLedgerDashboard);

module.exports = router;
