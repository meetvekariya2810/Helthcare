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
  testSaveEmployee,
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

const { protect } = require('../middleware/auth');

// Flexible dev auth fallback
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  req.user = {
    name: 'Dr. Vikram Mehta',
    email: 'admin@bjkhealthcare.com',
    role: 'SUPER_ADMIN',
    department: 'Executive Management'
  };
  next();
};

// 1. Bulk & Master Import Operations
router.get('/export', optionalAuth, exportBulkEmployeesExcel);
router.get('/template', getImportTemplate);
router.post('/import/validate', optionalAuth, upload.single('file'), validateMasterImport);
router.post('/import/master', optionalAuth, upload.single('file'), importMasterEmployees);
router.get('/import/history', optionalAuth, getMasterImportHistory);
router.post('/import', optionalAuth, upload.single('file'), (req, res, next) => {
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
router.get('/unclassified', optionalAuth, getUnclassifiedEmployees);
router.post('/classify', optionalAuth, bulkClassifyEmployees);
router.post('/:id/classify', optionalAuth, classifyEmployee);

// 2. Public Safe ID Verification (No sensitive data exposed)
router.get('/verify-id/:code', verifyIdCardPublic);
router.get('/verify/employee/:code', verifyIdCardPublic);

// 2b. Employee ID Cards Management & Bulk Operations (Must be before /:id)
router.get('/id-cards', optionalAuth, getAllEmployeeIdCards);
router.post('/id-cards/bulk-generate', optionalAuth, bulkGenerateIdCards);

// 3. Test & Verification
router.get('/test', testSaveEmployee);
router.post('/test', testSaveEmployee);

// 4. Core Employee CRUD
router.get('/', optionalAuth, getEmployees);
router.post('/', optionalAuth, createEmployee);

router.get('/:id', optionalAuth, getEmployeeById);
router.put('/:id', optionalAuth, updateEmployee);
router.delete('/:id', optionalAuth, deleteEmployee);

// 5. Special Views
router.get('/:id/quick-view', optionalAuth, getEmployeeQuickView);
router.get('/:id/profile', optionalAuth, getEmployeeFullProfile);
router.get('/:id/export', optionalAuth, exportSingleEmployeeExcel);

// 6. Tab & Section Specific REST Updates
router.put('/:id/personal', optionalAuth, updatePersonal);
router.put('/:id/job', optionalAuth, updateJob);
router.put('/:id/contact', optionalAuth, updateContact);
router.put('/:id/wfh', optionalAuth, updateWfh);
router.put('/:id/family', optionalAuth, updateFamily);
router.put('/:id/emergency', optionalAuth, updateEmergency);
router.put('/:id/education', optionalAuth, updateEducation);
router.put('/:id/experience', optionalAuth, updateExperience);
router.put('/:id/team', optionalAuth, updateTeam);
router.put('/:id/social', optionalAuth, updateSocial);
router.patch('/:id/status', optionalAuth, updateEmployeeStatus);

// 7. Documents Management
router.get('/:id/documents', optionalAuth, getEmployeeDocuments);
router.post('/:id/documents', optionalAuth, uploadEmployeeDocument);

// 8. ID Card & Business Card
router.get('/:id/id-card', optionalAuth, getIdCard);
router.post('/:id/id-card', optionalAuth, generateOrUpdateIdCard);
router.get('/:id/business-card', optionalAuth, getBusinessCard);
router.post('/:id/business-card', optionalAuth, generateOrUpdateBusinessCard);

// 9. Activity & Audit History
router.get('/:id/audit', optionalAuth, getEmployeeAudit);

// 10. Credentials, RBAC Role & Password Management
router.post('/:id/reset-password', optionalAuth, resetEmployeePassword);
router.post('/:id/force-password-change', optionalAuth, forcePasswordChange);
router.put('/:id/role', optionalAuth, updateEmployeeRole);
router.get('/:id/login-history', optionalAuth, getEmployeeLoginHistory);

module.exports = router;
