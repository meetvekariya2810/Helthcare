const express = require('express');
const router = express.Router();
const {
  getExportShipments,
  createExportShipment,
  updateExportShipmentStatus
} = require('../controllers/commercialController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/shipments', checkPermission('export.view'), getExportShipments);
router.post('/shipments', checkPermission('export.create'), createExportShipment);
router.put('/shipments/:id/status', checkPermission('export.ship'), updateExportShipmentStatus);

module.exports = router;
