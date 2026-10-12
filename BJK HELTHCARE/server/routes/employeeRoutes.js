const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

const {
  getEmployees,
  getEmployeeById,
  getEmployeeQuickView,
  getEmployeeFullProfile,
  createEmployee,
  updateEmployee,
  updatePersonal,
  updateJob,
  updateContact,
  updateWfh,
  updateFamily,
  updateEmergency,
  updateEducation,
  updateExperience,
  updateTeam,
  updateSocial,
  updateEmployeeStatus,
  deleteEmployee,
  generateOrUpdateIdCard,
  getIdCard,
  generateOrUpdateBusinessCard,
  getBusinessCard,
  verifyIdCardPublic,
  exportSingleEmployeeExcel,
  exportBulkEmployeesExcel,
  getImportTemplate,
  importEmployeesExcel,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  getEmployeeAudit,
  validateMasterImport,
  importMasterEmployees,
  getMasterImportHistory,
  resetEmployeePassword,
  forcePasswordChange,
  updateEmployeeRole,
  getEmployeeLoginHistory,
  getAllEmployeeIdCards,
  bulkGenerateIdCards,
  getUnclassifiedEmployees,
  classifyEmployee,
  bulkClassifyEmployees
} = require('../controllers/employeeController');

const { protect, requireRole, passwordResetLimiter } = require('../middleware/auth');
const { ROLES } = require('../config/rbac');

const HR_MGMT_ROLES = [ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER];
const HR_STAFF_ROLES = [ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE, 'ADMIN', 'HR'];
const EMPLOYEE_READ_ROLES = [
  ...HR_STAFF_ROLES,
  ROLES.DEPARTMENT_MANAGER,
  ROLES.QA_MANAGER,
  ROLES.QC_MANAGER,
  ROLES.PRODUCTION_MANAGER,
  ROLES.OPERATIONS_MANAGER,
  ROLES.WAREHOUSE_MANAGER,
  ROLES.SALES_MANAGER,
  ROLES.CRM_MANAGER,
  ROLES.EXPORT_MANAGER,
  ROLES.REGULATORY_MANAGER,
  ROLES.FINANCE_MANAGER,
  ROLES.PAYROLL_ADMIN
];

// 1. Bulk & Master Import Operations
router.get('/export', protect, requireRole(...HR_MGMT_ROLES), exportBulkEmployeesExcel);
router.get('/template', protect, requireRole(...HR_STAFF_ROLES), getImportTemplate);
router.post('/import/validate', protect, requireRole(...HR_MGMT_ROLES), upload.single('file'), validateMasterImport);
router.post('/import/master', protect, requireRole(...HR_MGMT_ROLES), upload.single('file'), importMasterEmployees);
router.get('/import/history', protect, requireRole(...HR_MGMT_ROLES), getMasterImportHistory);
router.post('/import', protect, requireRole(...HR_MGMT_ROLES), upload.single('file'), (req, res, next) => {
  const isMaster = req.is('json') || 
                   req.query.master === 'true' || 
                   req.body?.mode === 'master' ||
                   (req.file && (req.file.originalname.toLowerCase().endsWith('.csv') || (req.file.mimetype && req.file.mimetype.includes('csv'))));
  if (isMaster) {
    return importMasterEmployees(req, res, next);
  }
  return importEmployeesExcel(req, res, next);
});

// 1b. Employee Classification Endpoints (Requirement 28 & 29)
router.get('/unclassified', protect, requireRole(...HR_MGMT_ROLES), getUnclassifiedEmployees);
router.post('/classify', protect, requireRole(...HR_MGMT_ROLES), bulkClassifyEmployees);
router.post('/:id/classify', protect, requireRole(...HR_MGMT_ROLES), classifyEmployee);

// 2. Public Safe ID Verification (No sensitive data exposed)
router.get('/verify-id/:code', verifyIdCardPublic);
router.get('/verify/employee/:code', verifyIdCardPublic);

// 2b. Employee ID Cards Management & Bulk Operations (Must be before /:id)
router.get('/id-cards', protect, requireRole(...HR_STAFF_ROLES), getAllEmployeeIdCards);
router.post('/id-cards/bulk-generate', protect, requireRole(...HR_MGMT_ROLES), bulkGenerateIdCards);

// 3. Core Employee CRUD
router.get('/', protect, requireRole(...EMPLOYEE_READ_ROLES), getEmployees);
router.post('/', protect, requireRole(...HR_MGMT_ROLES), createEmployee);

router.get('/:id', protect, requireRole(...EMPLOYEE_READ_ROLES), getEmployeeById);
router.put('/:id', protect, requireRole(...HR_MGMT_ROLES), updateEmployee);
router.delete('/:id', protect, requireRole(...HR_MGMT_ROLES), deleteEmployee);

// 4. Special Views
router.get('/:id/quick-view', protect, requireRole(...EMPLOYEE_READ_ROLES), getEmployeeQuickView);
router.get('/:id/profile', protect, requireRole(...EMPLOYEE_READ_ROLES), getEmployeeFullProfile);
router.get('/:id/export', protect, requireRole(...HR_STAFF_ROLES), exportSingleEmployeeExcel);

// 5. Tab & Section Specific REST Updates
router.put('/:id/personal', protect, requireRole(...HR_STAFF_ROLES), updatePersonal);
router.put('/:id/job', protect, requireRole(...HR_STAFF_ROLES), updateJob);
router.put('/:id/contact', protect, requireRole(...HR_STAFF_ROLES), updateContact);
router.put('/:id/wfh', protect, requireRole(...HR_STAFF_ROLES), updateWfh);
router.put('/:id/family', protect, requireRole(...HR_STAFF_ROLES), updateFamily);
router.put('/:id/emergency', protect, requireRole(...HR_STAFF_ROLES), updateEmergency);
router.put('/:id/education', protect, requireRole(...HR_STAFF_ROLES), updateEducation);
router.put('/:id/experience', protect, requireRole(...HR_STAFF_ROLES), updateExperience);
router.put('/:id/team', protect, requireRole(...HR_STAFF_ROLES), updateTeam);
router.put('/:id/social', protect, requireRole(...HR_STAFF_ROLES), updateSocial);
router.patch('/:id/status', protect, requireRole(...HR_MGMT_ROLES), updateEmployeeStatus);

// 6. Documents Management
router.get('/:id/documents', protect, requireRole(...HR_STAFF_ROLES), getEmployeeDocuments);
router.post('/:id/documents', protect, requireRole(...HR_STAFF_ROLES), uploadEmployeeDocument);

// 7. ID Card & Business Card
router.get('/:id/id-card', protect, requireRole(...HR_STAFF_ROLES), getIdCard);
router.post('/:id/id-card', protect, requireRole(...HR_STAFF_ROLES), generateOrUpdateIdCard);
router.get('/:id/business-card', protect, requireRole(...HR_STAFF_ROLES), getBusinessCard);
router.post('/:id/business-card', protect, requireRole(...HR_STAFF_ROLES), generateOrUpdateBusinessCard);

// 8. Activity & Audit History
router.get('/:id/audit', protect, requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.AUDITOR), getEmployeeAudit);

// 9. Credentials, RBAC Role & Password Management
router.post('/:id/reset-password', passwordResetLimiter, protect, requireRole(ROLES.SUPER_ADMIN, ROLES.HR_ADMIN, ROLES.HR_MANAGER), resetEmployeePassword);
router.post('/:id/force-password-change', protect, requireRole(...HR_MGMT_ROLES), forcePasswordChange);
router.put('/:id/role', protect, requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN), updateEmployeeRole);
router.get('/:id/login-history', protect, requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.AUDITOR), getEmployeeLoginHistory);

module.exports = router;
