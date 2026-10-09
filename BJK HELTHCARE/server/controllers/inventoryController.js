const Warehouse = require('../models/Warehouse');
const InventoryItem = require('../models/InventoryItem');
const InventoryTransaction = require('../models/InventoryTransaction');
const AuditLog = require('../models/AuditLog');
const Product = require('../models/Product');

// GET /api/inventory/warehouses
const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find({})
      .populate('facility', 'facilityName facilityCode')
      .sort({ warehouseName: 1 })
      .lean();
    res.json({ success: true, count: warehouses.length, data: warehouses });
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/warehouses
const createWarehouse = async (req, res, next) => {
  try {
    const wh = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: wh });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory or /api/inventory/items
const getInventoryItems = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.itemType) query.itemType = req.query.itemType;
    if (req.query.warehouse) query.warehouse = req.query.warehouse;
    if (req.query.search) {
      query.$or = [
        { itemName: { $regex: req.query.search, $options: 'i' } },
        { itemCode: { $regex: req.query.search, $options: 'i' } },
        { batchNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await InventoryItem.countDocuments(query);
    const items = await InventoryItem.find(query)
      .populate('product', 'productName genericName dosageForm category')
      .populate('warehouse', 'warehouseName code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/items (Add new SKU master)
const createInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.create({
      ...req.body,
      currentStock: req.body.currentStock || 0,
      status: req.body.status || 'HEALTHY'
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'INVENTORY_ITEM_CREATED',
      module: 'INVENTORY',
      resource: 'InventoryItem',
      resourceId: item._id,
      details: `Created new inventory master SKU: ${item.itemName} (${item.itemCode})`
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/transactions
const getTransactions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.item) query.item = req.query.item;
    if (req.query.transactionType) query.transactionType = req.query.transactionType;

    const total = await InventoryTransaction.countDocuments(query);
    const txs = await InventoryTransaction.find(query)
      .populate('item', 'itemName itemCode batchNumber')
      .populate('fromWarehouse', 'warehouseName')
      .populate('toWarehouse', 'warehouseName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: txs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: txs
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/transactions
// Strict Rule 13: Every stock movement creates an immutable inventory transaction. No direct quantity editing!
const recordStockTransaction = async (req, res, next) => {
  try {
    const transactionType = req.body.transactionType || req.body.type;
    const itemId = req.body.itemId || req.body.item;
    const { quantity, fromWarehouse, toWarehouse, reason, referenceOrder } = req.body;

    const validTypes = ['STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT', 'QUARANTINE', 'RELEASE', 'RETURN'];
    if (!validTypes.includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transactionType. Allowed types: ${validTypes.join(', ')}`
      });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required.' });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    const previousStock = item.currentStock || 0;
    let newStock = previousStock;

    if (transactionType === 'STOCK_IN' || transactionType === 'RELEASE' || transactionType === 'RETURN') {
      newStock += qty;
      if (item.status === 'QUARANTINE' && transactionType === 'RELEASE') {
        item.status = 'HEALTHY';
      }
    } else if (transactionType === 'STOCK_OUT') {
      if (previousStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock: Requested ${qty}, available ${previousStock}.`
        });
      }
      newStock -= qty;
    } else if (transactionType === 'ADJUSTMENT') {
      newStock = qty; // In adjustment, target quantity is provided
    } else if (transactionType === 'QUARANTINE') {
      item.status = 'QUARANTINE';
    }

    item.currentStock = Math.max(0, newStock);

    // Auto-update health status based on reorder level
    if (item.status !== 'QUARANTINE' && item.status !== 'BLOCKED') {
      if (item.currentStock <= 0) {
        item.status = 'OUT_OF_STOCK';
      } else if (item.currentStock <= (item.reorderLevel || 1000)) {
        item.status = 'LOW_STOCK';
      } else {
        item.status = 'HEALTHY';
      }
    }

    await item.save();

    // Create immutable audit transaction
    const tx = await InventoryTransaction.create({
      transactionNumber: `TX-${Date.now().toString().slice(-8)}`,
      item: item._id,
      transactionType,
      quantity: qty,
      previousStock,
      resultingStock: item.currentStock,
      fromWarehouse: fromWarehouse || item.warehouse,
      toWarehouse: toWarehouse || null,
      reason: reason || 'Standard inventory operation',
      referenceOrder: referenceOrder || '',
      recordedBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'INVENTORY_TRANSACTION',
      module: 'INVENTORY',
      resource: 'InventoryItem',
      resourceId: item._id,
      before: { stock: previousStock },
      after: { stock: item.currentStock, transactionType },
      details: `${transactionType} of ${qty} ${item.unit || 'units'} for ${item.itemName} (${item.itemCode}). Reason: ${reason || 'Operational'}`
    });

    res.status(201).json({
      success: true,
      message: `Stock ${transactionType} recorded successfully.`,
      data: {
        transaction: tx,
        updatedStock: item.currentStock,
        status: item.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/alerts (Server-side alert generation)
const getInventoryAlerts = async (req, res, next) => {
  try {
    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 86400000);

    const [lowStockItems, quarantinedItems, nearExpiryItems, expiredItems] = await Promise.all([
      InventoryItem.find({
        $expr: { $lte: ['$currentStock', '$reorderLevel'] },
        currentStock: { $gt: 0 }
      }).populate('warehouse', 'warehouseName').lean(),

      InventoryItem.find({ status: 'QUARANTINE' }).lean(),

      InventoryItem.find({
        expiryDate: { $gte: now, $lte: sixtyDaysLater }
      }).lean(),

      InventoryItem.find({
        expiryDate: { $lt: now }
      }).lean()
    ]);

    res.json({
      success: true,
      data: {
        lowStock: { count: lowStockItems.length, items: lowStockItems },
        quarantine: { count: quarantinedItems.length, items: quarantinedItems },
        nearExpiry: { count: nearExpiryItems.length, items: nearExpiryItems },
        expired: { count: expiredItems.length, items: expiredItems }
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWarehouses,
  createWarehouse,
  getInventoryItems,
  createInventoryItem,
  getTransactions,
  recordStockTransaction,
  getInventoryAlerts
};
