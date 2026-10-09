const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatchStage,
  submitBatchToQC,
  qaBatchRelease
} = require('../controllers/productionController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', getBatches);
router.get('/:id', getBatchById);
router.post('/', checkPermission('production.create'), createBatch);
router.put('/:id/stage', checkPermission('production.edit'), updateBatchStage);
router.post('/:id/submit-qc', checkPermission('production.edit'), submitBatchToQC);
router.post('/:id/qa-release', checkPermission('qa.approve_batch'), qaBatchRelease);

module.exports = router;
