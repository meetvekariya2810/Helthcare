const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getMyDocuments,
  uploadDocument,
  deleteDocument,
  resetAllMyDocuments
} = require('../controllers/EmployeeDocumentController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

// Configure Multer for PDF storage
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeEmpId = (req.employeeId || 'EMP').replace(/[^a-zA-Z0-9_-]/g, '_');
    const slot = req.body?.slotNo || req.body?.docSlot || 'DOC';
    cb(null, `BJK-DOC-${safeEmpId}-SLOT${slot}-${Date.now()}.pdf`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Validation Error: Only PDF files (.pdf) are permitted for upload.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getMyDocuments);
router.post('/upload', upload.single('file'), uploadDocument);
router.post('/reset-all', resetAllMyDocuments);
router.delete('/:id', deleteDocument);

module.exports = router;
