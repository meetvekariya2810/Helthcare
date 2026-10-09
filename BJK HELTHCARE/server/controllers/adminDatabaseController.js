const mongoose = require('mongoose');
const { getDBStatus, isDBConnected, getDBName } = require('../config/db');
const { seedDatabase } = require('../seed/seed');
const AuditLog = require('../models/AuditLog');
const Product = require('../models/Product');
const Batch = require('../models/Batch');
const InventoryItem = require('../models/InventoryItem');
const Customer = require('../models/Customer');
const Enquiry = require('../models/Enquiry');
const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Basic API Health Endpoint
// @route   GET /api/health
// @access  Public
const getHealth = async (req, res) => {
  const dbConnected = isDBConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    service: 'BJK Healthcare API',
    database: {
      connected: dbConnected,
      name: getDBName()
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};

// @desc    Database Health Endpoint
// @route   GET /api/health/database
// @access  Public
const getDatabaseHealth = async (req, res) => {
  const connected = isDBConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    database: {
      connected,
      name: getDBName(),
      readyState: mongoose.connection.readyState,
      host: connected ? mongoose.connection.host : 'disconnected'
    },
    timestamp: new Date().toISOString()
  });
};

// @desc    Get Safe Administrative Database Statistics
// @route   GET /api/admin/database/stats
// @access  Protected (SUPER_ADMIN, DIRECTOR, AUDITOR)
const getDatabaseStats = async (req, res, next) => {
  try {
    const connected = isDBConnected();
    const dbName = getDBName();

    const [
      productCount,
      categoryCount,
      userCount,
      batchCount,
      inventoryCount,
      customerCount,
      enquiryCount,
      documentCount,
      auditLogCount
    ] = await Promise.all([
      Product.countDocuments({}),
      mongoose.model('ProductCategory').countDocuments({}),
      User.countDocuments({}),
      Batch.countDocuments({}),
      InventoryItem.countDocuments({}),
      Customer.countDocuments({}),
      Enquiry.countDocuments({}),
      Document.countDocuments({}),
      AuditLog.countDocuments({})
    ]);

    const collectionNames = Object.keys(mongoose.connection.collections);

    res.json({
      success: true,
      data: {
        database: {
          name: dbName,
          status: connected ? 'CONNECTED' : 'DISCONNECTED',
          connectionState: getDBStatus(),
          collectionsCount: collectionNames.length,
        },
        counts: {
          products: productCount,
          categories: categoryCount,
          users: userCount,
          batches: batchCount,
          inventoryRecords: inventoryCount,
          customers: customerCount,
          enquiries: enquiryCount,
          documents: documentCount,
          auditLogs: auditLogCount
        },
        systemInfo: {
          nodeEnv: process.env.NODE_ENV || 'development',
          uptimeSeconds: Math.floor(process.uptime())
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Collections Summary for Admin Console
// @route   GET /api/admin/database/collections
// @access  Protected (SUPER_ADMIN, DIRECTOR)
const getCollectionsSummary = async (req, res, next) => {
  try {
    const modelKeys = Object.keys(mongoose.models);
    const collections = await Promise.all(
      modelKeys.map(async (key) => {
        const model = mongoose.models[key];
        const count = await model.countDocuments({});
        return {
          modelName: key,
          collectionName: model.collection.name,
          documentCount: count
        };
      })
    );

    res.json({
      success: true,
      count: collections.length,
      data: collections
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Query Collection Records Safely
// @route   GET /api/admin/database/query
// @access  Protected (SUPER_ADMIN, DIRECTOR)
const queryCollection = async (req, res, next) => {
  try {
    const { collection, search, page = 1, limit = 20 } = req.query;
    if (!collection) {
      return res.status(400).json({ success: false, message: 'Collection parameter is required' });
    }

    const modelName = Object.keys(mongoose.models).find(
      key => key.toLowerCase() === collection.toLowerCase() ||
             mongoose.models[key].collection.name.toLowerCase() === collection.toLowerCase()
    );

    if (!modelName) {
      return res.status(404).json({ success: false, message: `Collection [${collection}] not found in schema models` });
    }

    const Model = mongoose.models[modelName];
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let filter = {};
    if (search) {
      // Basic text search if schema supports it, or id lookup
      if (mongoose.isValidObjectId(search)) {
        filter = { _id: search };
      } else {
        const schemaPaths = Object.keys(Model.schema.paths).filter(p => Model.schema.paths[p].instance === 'String');
        if (schemaPaths.length > 0) {
          filter.$or = schemaPaths.slice(0, 4).map(p => ({ [p]: { $regex: search, $options: 'i' } }));
        }
      }
    }

    const total = await Model.countDocuments(filter);
    const docs = await Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean();

    res.json({
      success: true,
      modelName,
      collectionName: Model.collection.name,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: docs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Approved Seed Operation
// @route   POST /api/admin/database/seed
// @access  Protected (SUPER_ADMIN)
const triggerSeed = async (req, res, next) => {
  try {
    const result = await seedDatabase();
    
    await AuditLog.logAction({
      user: req.user,
      action: 'ADMIN_SEED',
      module: 'DATABASE',
      resource: 'Database',
      resourceId: 'MASTER_SEED',
      status: 'SUCCESS',
      details: 'Admin triggered master database seed operation'
    });

    res.json({
      success: true,
      message: 'Master database seed operation completed successfully',
      result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Data Import Workflow (Validate, Preview & Insert)
// @route   POST /api/admin/database/import
// @access  Protected (SUPER_ADMIN)
const importData = async (req, res, next) => {
  try {
    const { targetCollection, items, mode = 'PREVIEW' } = req.body;

    if (!targetCollection || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid import payload. Must include targetCollection and items array.'
      });
    }

    const modelName = Object.keys(mongoose.models).find(
      key => key.toLowerCase() === targetCollection.toLowerCase() ||
             mongoose.models[key].collection.name.toLowerCase() === targetCollection.toLowerCase()
    );

    if (!modelName) {
      return res.status(404).json({ success: false, message: `Target collection [${targetCollection}] not found` });
    }

    const Model = mongoose.models[modelName];

    if (mode === 'PREVIEW') {
      return res.json({
        success: true,
        mode: 'PREVIEW',
        totalItems: items.length,
        previewSample: items.slice(0, 5),
        message: `Validated ${items.length} items for import into ${modelName}. Confirm to commit.`
      });
    }

    // Insert / Upsert items safely
    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      if (item.srNo && modelName === 'Product') {
        const resObj = await Model.findOneAndUpdate({ srNo: item.srNo }, item, { upsert: true, new: true });
        if (resObj) updatedCount++;
      } else if (item._id && mongoose.isValidObjectId(item._id)) {
        await Model.findByIdAndUpdate(item._id, item, { upsert: true, new: true });
        updatedCount++;
      } else {
        await Model.create(item);
        insertedCount++;
      }
    }

    await AuditLog.logAction({
      user: req.user,
      action: 'DATA_IMPORT',
      module: 'DATABASE',
      resource: modelName,
      status: 'SUCCESS',
      details: `Imported ${items.length} records into ${modelName} (${insertedCount} new, ${updatedCount} updated)`
    });

    res.json({
      success: true,
      message: `Successfully imported ${items.length} records into ${modelName}`,
      insertedCount,
      updatedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Permitted Collection Data
// @route   GET /api/admin/database/export/:collection
// @access  Protected (SUPER_ADMIN, DIRECTOR, AUDITOR)
const exportData = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const format = (req.query.format || 'json').toLowerCase();

    const modelName = Object.keys(mongoose.models).find(
      key => key.toLowerCase() === collection.toLowerCase() ||
             mongoose.models[key].collection.name.toLowerCase() === collection.toLowerCase()
    );

    if (!modelName) {
      return res.status(404).json({ success: false, message: `Collection [${collection}] not found` });
    }

    const Model = mongoose.models[modelName];
    const data = await Model.find({}).lean();

    await AuditLog.logAction({
      user: req.user,
      action: 'EXPORT',
      module: 'DATABASE',
      resource: modelName,
      status: 'SUCCESS',
      details: `Exported ${data.length} records from ${modelName} in ${format.toUpperCase()} format`
    });

    if (format === 'csv') {
      if (data.length === 0) {
        return res.send('No data available');
      }
      const headers = Object.keys(data[0]).filter(k => k !== '__v');
      const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
      ];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=bjk_${collection}_export.csv`);
      return res.send(csvRows.join('\n'));
    }

    res.json({
      success: true,
      collection: modelName,
      count: data.length,
      exportedAt: new Date().toISOString(),
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  getDatabaseHealth,
  getDatabaseStats,
  getCollectionsSummary,
  queryCollection,
  triggerSeed,
  importData,
  exportData
};
