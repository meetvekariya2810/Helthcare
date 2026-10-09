const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentById,
  createDocument,
  createNewVersion,
  approveDocument
} = require('../controllers/documentController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.post('/', checkPermission('documents.upload'), createDocument);
router.post('/:id/version', checkPermission('documents.upload'), createNewVersion);
router.put('/:id/approve', checkPermission('documents.approve'), approveDocument);

module.exports = router;
