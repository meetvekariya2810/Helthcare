const express = require('express');
const router = express.Router();
const {
  getProductionOrders,
  createProductionOrder,
  updateProductionOrder,
  getProductionLines,
  createProductionLine,
  getMachines,
  updateMachineStatus
} = require('../controllers/productionController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

// Orders
router.get('/orders', checkPermission('production.view'), getProductionOrders);
router.post('/orders', checkPermission('production.create'), createProductionOrder);
router.put('/orders/:id', checkPermission('production.edit'), updateProductionOrder);

// Lines
router.get('/lines', getProductionLines);
router.post('/lines', checkPermission('production.create'), createProductionLine);

// Machines (Factory Digital Twin)
router.get('/machines', getMachines);
router.put('/machines/:id/status', checkPermission('production.edit'), updateMachineStatus);

module.exports = router;
