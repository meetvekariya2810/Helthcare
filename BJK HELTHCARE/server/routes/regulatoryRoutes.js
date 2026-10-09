const express = require('express');
const router = express.Router();
const {
  getRegulatoryRecords,
  createRegulatoryRecord,
  updateRegulatoryRecord,
  getCountryCompliances,
  getDossiers,
  createDossier,
  getRegulatoryDeadlines
} = require('../controllers/regulatoryController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/records', getRegulatoryRecords);
router.post('/records', checkPermission('regulatory.create'), createRegulatoryRecord);
router.put('/records/:id', checkPermission('regulatory.edit'), updateRegulatoryRecord);

router.get('/countries', getCountryCompliances);
router.get('/dossiers', getDossiers);
router.post('/dossiers', checkPermission('regulatory.submit'), createDossier);
router.get('/deadlines', getRegulatoryDeadlines);

module.exports = router;
