const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const { protect } = require('../middleware/auth');
const attendanceImportCtrl = require('../controllers/hrms/attendanceImportController');
const hrmsRoutes = require('./hrmsRoutes');

// All attendance routes require valid JWT authentication
router.use(protect);

// 1. Validation / Dry Run
router.post('/import/validate', upload.single('file'), attendanceImportCtrl.validateImport);

// 2. Import Execution
router.post('/import', upload.single('file'), attendanceImportCtrl.executeImport);

// 3. Batches History & Details
router.get('/imports', attendanceImportCtrl.getImportBatches);
router.get('/imports/:importBatchId', attendanceImportCtrl.getImportBatchById);

// 4. Safe Rollback
router.post('/imports/:importBatchId/rollback', attendanceImportCtrl.rollbackImport);

// 5. Employee-specific attendance (Strictly isolated as per Rule 23 & 26)
router.get('/employee/:employeeCode', attendanceImportCtrl.getEmployeeAttendanceByCode);

// 6. Monthly overview
router.get('/month/:year/:month', attendanceImportCtrl.getMonthAttendance);

// 7. Department overview
router.get('/department/:departmentId', attendanceImportCtrl.getDepartmentAttendance);

// 8. Employee Master Non-Destructive Validation & Safe Profile Enrichment (Rules 1, 4, 7, 28, 29)
router.get('/master-validation', attendanceImportCtrl.validateMaster);
router.post('/master-validation', upload.single('file'), attendanceImportCtrl.validateMaster);
router.post('/master-enrich', upload.single('file'), attendanceImportCtrl.enrichMasterProfiles);

// Fallback for existing legacy attendance sub-routes (e.g. /dashboard, /punch, /reports)
router.use((req, res, next) => {
  req.url = '/attendance' + (req.url === '/' ? '' : req.url);
  hrmsRoutes(req, res, next);
});

module.exports = router;
