const express = require('express');
const router = express.Router();
const {
  getDeviations,
  createDeviation,
  updateDeviation,
  getCAPAs,
  createCAPA,
  updateCAPA,
  getSOPs,
  createSOP,
  getChangeControls
} = require('../controllers/qualityController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/deviations', getDeviations);
router.post('/deviations', checkPermission('qa.manage_capa'), createDeviation);
router.put('/deviations/:id', checkPermission('qa.manage_capa'), updateDeviation);

router.get('/capas', getCAPAs);
router.post('/capas', checkPermission('qa.manage_capa'), createCAPA);
router.put('/capas/:id', checkPermission('qa.manage_capa'), updateCAPA);

router.get('/sops', getSOPs);
router.post('/sops', checkPermission('documents.upload'), createSOP);
router.get('/change-controls', getChangeControls);

module.exports = router;
