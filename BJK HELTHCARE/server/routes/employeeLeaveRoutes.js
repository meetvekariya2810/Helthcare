const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const {
  getLeaveTypes,
  getHolidays,
  calculateWorkingDays,
  getLeaveBalances,
  getEmployeeLeaveLedger,
  getLeaveRequests,
  getLeaveById,
  applyLeave,
  withdrawLeave,
  cancelLeave,
  deleteLeave,
  uploadLeaveDocument,
  getTeamLeaves,
  approveRejectTeamLeave,
  getMyCompOffAuthorizations,
  createMyCompOffAuthorization,
  getMyCompOffCredits,
  getMyMedicalFitnessRecords,
  uploadMedicalFitnessCertificate,
  getMyEncashmentRequests,
  applyMyEncashmentRequest,
  getMyRegularizationRequests,
  applyMyRegularizationRequest,
  getMyGrievances,
  createMyGrievance
} = require('../controllers/EmployeeLeaveController');

const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

// Configure secure document upload storage
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (_) {
  // Read-only filesystem in serverless environments
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = fs.existsSync(uploadDir) ? uploadDir : (process.env.VERCEL ? '/tmp' : uploadDir);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `leave-doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, JPEG, and PNG documents are allowed.'));
    }
  }
});

// All employee leave routes strictly require authenticated session & ownership verification
router.use(authenticateEmployee);
router.use(authorizeOwnership);

// 1. Leave Master Metadata & Calculators
router.get('/types', getLeaveTypes);
router.get('/holidays', getHolidays);
router.post('/calculate-days', calculateWorkingDays);

// 2. Balances, Ledgers & Leave Applications
router.get('/balance', getLeaveBalances);
router.get('/ledger', getEmployeeLeaveLedger);
router.get('/matrix', getEmployeeLeaveLedger);
router.get('/history', getLeaveRequests);
router.get('/', getLeaveRequests);
router.get('/my', getLeaveRequests);
router.post('/', applyLeave);
router.post('/apply', applyLeave);

// 3. Document Upload
router.post('/upload-document', upload.single('file'), uploadLeaveDocument);

// 4. Leave Request Details & Lifecycle Actions
router.get('/:id', getLeaveById);
router.post('/:id/withdraw', withdrawLeave);
router.put('/:id/withdraw', withdrawLeave);
router.post('/:id/cancel', cancelLeave);
router.put('/:id/cancel', cancelLeave);
router.delete('/:id', deleteLeave);

// 5. Manager / Team Lead Workflows
router.get('/team', getTeamLeaves);
router.put('/team/:id/action', approveRejectTeamLeave);
router.post('/team/:id/action', approveRejectTeamLeave);

// 6. BJK-HR-POL-001 Employee Self-Service Operations
router.get('/comp-off/authorizations', getMyCompOffAuthorizations);
router.post('/comp-off/authorizations', createMyCompOffAuthorization);
router.get('/comp-off/credits', getMyCompOffCredits);

router.get('/gmp/medical-fitness', getMyMedicalFitnessRecords);
router.post('/gmp/medical-fitness', uploadMedicalFitnessCertificate);

router.get('/encashment', getMyEncashmentRequests);
router.post('/encashment', applyMyEncashmentRequest);

router.get('/regularization', getMyRegularizationRequests);
router.post('/regularization', applyMyRegularizationRequest);

router.get('/grievances', getMyGrievances);
router.post('/grievances', createMyGrievance);

module.exports = router;

