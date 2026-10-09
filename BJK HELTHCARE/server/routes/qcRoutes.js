const express = require('express');
const router = express.Router();
const {
  getQCSamples,
  createQCSample,
  getQCTests,
  enterQCResult,
  generateCOA
} = require('../controllers/qualityController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/samples', getQCSamples);
router.post('/samples', checkPermission('qc.create_sample'), createQCSample);
router.get('/tests', getQCTests);
router.post('/results', checkPermission('qc.enter_result'), enterQCResult);
router.post('/samples/:id/generate-coa', checkPermission('qc.generate_coa'), generateCOA);

module.exports = router;
