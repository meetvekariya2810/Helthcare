const express = require('express');
const router = express.Router();
const {
  getWarehouses,
  createWarehouse,
  getInventoryItems,
  createInventoryItem,
  getTransactions,
  recordStockTransaction,
  getInventoryAlerts
} = require('../controllers/inventoryController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', getInventoryItems);
router.get('/items', getInventoryItems);
router.post('/items', checkPermission('inventory.create'), createInventoryItem);
router.get('/warehouses', getWarehouses);
router.post('/warehouses', checkPermission('inventory.create'), createWarehouse);
router.get('/transactions', getTransactions);
router.post('/transactions', checkPermission('inventory.transfer'), recordStockTransaction);
router.get('/alerts', getInventoryAlerts);

module.exports = router;
