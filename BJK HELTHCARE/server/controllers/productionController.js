const ProductionOrder = require('../models/ProductionOrder');
const ProductionLine = require('../models/ProductionLine');
const Machine = require('../models/Machine');
const Batch = require('../models/Batch');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');
const Alert = require('../models/Alert');

// Valid batch status progression
const VALID_BATCH_TRANSITIONS = {
  PLANNED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['MANUFACTURING', 'PLANNED', 'CANCELLED'],
  MANUFACTURING: ['IN_PROCESS_QC', 'HOLD'],
  IN_PROCESS_QC: ['MANUFACTURING', 'COMPLETED', 'QUARANTINED'],
  COMPLETED: ['QA_REVIEW', 'QUARANTINED'],
  QA_REVIEW: ['RELEASED', 'REJECTED', 'QUARANTINED'],
  QUARANTINED: ['QA_REVIEW', 'REJECTED'],
  HOLD: ['MANUFACTURING', 'CANCELLED'],
  RELEASED: [],
  REJECTED: [],
  CANCELLED: []
};

// ==============================================================================
// 1. PRODUCTION ORDERS
// ==============================================================================
const getProductionOrders = async (req, res, next) => {
  try {
    const orders = await ProductionOrder.find({})
      .populate('product', 'productName genericName dosageForm category')
      .populate('facility', 'facilityName facilityCode')
      .populate('assignedLine', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    next(err);
  }
};

const createProductionOrder = async (req, res, next) => {
  try {
    const { orderNumber, product, batchSize, plannedStartDate, plannedEndDate, assignedLine, notes } = req.body;

    const prodRecord = await Product.findById(product);
    if (!prodRecord) {
      return res.status(404).json({ success: false, message: 'Specified product not found.' });
    }

    const orderNo = orderNumber || `PO-${Date.now().toString().slice(-6)}`;
    const newOrder = await ProductionOrder.create({
      orderNumber: orderNo,
      product,
      productName: prodRecord.productName,
      batchSize: batchSize || 100000,
      plannedStartDate: plannedStartDate || new Date(),
      plannedEndDate: plannedEndDate || new Date(Date.now() + 7 * 86400000),
      assignedLine: assignedLine || null,
      notes: notes || '',
      status: 'PLANNED',
      createdBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'PRODUCTION_ORDER_CREATED',
      module: 'PRODUCTION',
      resource: 'ProductionOrder',
      resourceId: newOrder._id,
      details: `Created production order ${newOrder.orderNumber} for ${prodRecord.productName}`
    });

    res.status(201).json({ success: true, message: 'Production order created successfully.', data: newOrder });
  } catch (err) {
    next(err);
  }
};

const updateProductionOrder = async (req, res, next) => {
  try {
    const order = await ProductionOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 2. PRODUCTION LINES & MACHINES (Factory Digital Twin)
// ==============================================================================
const getProductionLines = async (req, res, next) => {
  try {
    const lines = await ProductionLine.find({})
      .populate('facility', 'facilityName facilityCode')
      .sort({ code: 1 })
      .lean();
    res.json({ success: true, count: lines.length, data: lines });
  } catch (err) {
    next(err);
  }
};

const createProductionLine = async (req, res, next) => {
  try {
    const line = await ProductionLine.create(req.body);
    res.status(201).json({ success: true, data: line });
  } catch (err) {
    next(err);
  }
};

const getMachines = async (req, res, next) => {
  try {
    const machines = await Machine.find({})
      .populate('line', 'name code')
      .sort({ machineCode: 1 })
      .lean();
    res.json({ success: true, count: machines.length, data: machines });
  } catch (err) {
    next(err);
  }
};

const updateMachineStatus = async (req, res, next) => {
  try {
    const { status, maintenanceNotes } = req.body;
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    machine.status = status;
    if (maintenanceNotes) machine.maintenanceNotes = maintenanceNotes;
    await machine.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'MACHINE_STATUS_UPDATED',
      module: 'FACTORY',
      resource: 'Machine',
      resourceId: machine._id,
      details: `Machine ${machine.machineCode} state changed to ${status}`
    });

    res.json({ success: true, data: machine });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 3. BATCH EXECUTION & eBR (Electronic Batch Records)
// ==============================================================================
const getBatches = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.product) query.product = req.query.product;
    if (req.query.search) {
      query.$or = [
        { batchNumber: { $regex: req.query.search, $options: 'i' } },
        { productName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Batch.countDocuments(query);
    const batches = await Batch.find(query)
      .populate('product', 'productName genericName dosageForm category strength')
      .populate('line', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: batches.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: batches
    });
  } catch (err) {
    next(err);
  }
};

const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('product')
      .populate('line')
      .lean();

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.json({ success: true, data: batch });
  } catch (err) {
    next(err);
  }
};

const createBatch = async (req, res, next) => {
  try {
    const { batchNumber, product, batchSize, manufacturingDate, expiryDate, line, ebrStages } = req.body;

    const prod = await Product.findById(product);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const bNum = batchNumber || `BJK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const existing = await Batch.findOne({ batchNumber: bNum });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Batch number already exists.' });
    }

    const mfgDate = manufacturingDate ? new Date(manufacturingDate) : new Date();
    const expDate = expiryDate ? new Date(expiryDate) : new Date(mfgDate.getTime() + 2 * 365 * 86400000);

    const defaultStages = [
      { stageName: 'Dispensing of APIs & Excipients', status: 'PENDING', progressPercent: 0 },
      { stageName: 'Granulation / Mixing', status: 'PENDING', progressPercent: 0 },
      { stageName: 'Compression / Filling', status: 'PENDING', progressPercent: 0 },
      { stageName: 'Coating / Inspection', status: 'PENDING', progressPercent: 0 },
      { stageName: 'Primary & Secondary Packaging', status: 'PENDING', progressPercent: 0 }
    ];

    const batch = await Batch.create({
      batchNumber: bNum,
      product: prod._id,
      productName: prod.productName,
      dosageForm: prod.dosageForm,
      batchSize: batchSize || 100000,
      status: 'PLANNED',
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      line: line || null,
      stages: ebrStages || defaultStages,
      currentStage: 'Dispensing of APIs & Excipients',
      progressPercent: 0,
      createdBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'BATCH_CREATED',
      module: 'PRODUCTION',
      resource: 'Batch',
      resourceId: batch._id,
      details: `Created batch ${batch.batchNumber} for product ${prod.productName}`
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully.',
      data: batch
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/batches/:id/stage (Update stage and validate transition)
const updateBatchStage = async (req, res, next) => {
  try {
    const { status, currentStage, progressPercent, operatorNotes } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const beforeState = { status: batch.status, currentStage: batch.currentStage, progressPercent: batch.progressPercent };

    // State transition validation rule
    if (status && status !== batch.status) {
      const allowedNext = VALID_BATCH_TRANSITIONS[batch.status] || [];
      if (!allowedNext.includes(status) && !['SUPER_ADMIN', 'DIRECTOR'].includes(req.user?.role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid state transition: Cannot move batch from '${batch.status}' to '${status}'. Allowed transitions: ${allowedNext.join(', ') || 'None'}`
        });
      }
      batch.status = status;
    }

    if (currentStage) batch.currentStage = currentStage;
    if (progressPercent !== undefined) batch.progressPercent = Math.min(100, Math.max(0, progressPercent));

    if (batch.progressPercent === 100 && batch.status === 'MANUFACTURING') {
      batch.status = 'IN_PROCESS_QC';
    }

    await batch.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'BATCH_STAGE_UPDATED',
      module: 'PRODUCTION',
      resource: 'Batch',
      resourceId: batch._id,
      before: beforeState,
      after: { status: batch.status, currentStage: batch.currentStage, progressPercent: batch.progressPercent },
      details: `Updated batch ${batch.batchNumber} stage to '${batch.currentStage}' (${batch.progressPercent}%) [Status: ${batch.status}]. Notes: ${operatorNotes || 'Routine update'}`
    });

    res.json({
      success: true,
      message: 'Batch progress updated successfully.',
      data: batch
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/batches/:id/submit-qc
const submitBatchToQC = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    batch.status = 'IN_PROCESS_QC';
    await batch.save();

    // Create QC Task
    await Task.create({
      taskName: `Perform Finished Goods Assay for Batch ${batch.batchNumber}`,
      module: 'QC',
      priority: 'HIGH',
      assignedRole: 'QC_MANAGER',
      relatedRecordType: 'Batch',
      relatedRecordId: batch._id,
      dueDate: new Date(Date.now() + 2 * 86400000),
      status: 'PENDING'
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'BATCH_SUBMITTED_TO_QC',
      module: 'PRODUCTION',
      resource: 'Batch',
      resourceId: batch._id,
      details: `Batch ${batch.batchNumber} submitted for QC laboratory analysis`
    });

    res.json({
      success: true,
      message: `Batch ${batch.batchNumber} successfully submitted to Quality Control laboratory.`,
      data: batch
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/batches/:id/qa-release (Strict QA authorization check)
const qaBatchRelease = async (req, res, next) => {
  try {
    const { decision, remarks } = req.body; // 'RELEASED' or 'REJECTED'

    if (!['RELEASED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'RELEASED' or 'REJECTED'." });
    }

    // Role verification: Production manager cannot perform final QA release!
    const allowedRoles = ['QA_MANAGER', 'SUPER_ADMIN', 'DIRECTOR'];
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Only Quality Assurance (QA) Managers can authorize final batch release.'
      });
    }

    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const beforeStatus = batch.status;
    batch.status = decision;
    batch.qaApproval = {
      approvedBy: req.user._id,
      approverName: req.user.name,
      approvalDate: new Date(),
      decision,
      remarks: remarks || 'WHO-GMP Release Review Completed'
    };
    await batch.save();

    await AuditLog.logAction({
      user: req.user,
      action: decision === 'RELEASED' ? 'BATCH_QA_RELEASED' : 'BATCH_QA_REJECTED',
      module: 'QA',
      resource: 'Batch',
      resourceId: batch._id,
      before: { status: beforeStatus },
      after: { status: decision, approvedBy: req.user.name },
      details: `QA Manager ${req.user.name} marked batch ${batch.batchNumber} as '${decision}'. Remarks: ${remarks || 'None'}`
    });

    res.json({
      success: true,
      message: `Batch ${batch.batchNumber} has been officially ${decision} by Quality Assurance.`,
      data: batch
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProductionOrders,
  createProductionOrder,
  updateProductionOrder,
  getProductionLines,
  createProductionLine,
  getMachines,
  updateMachineStatus,
  getBatches,
  getBatchById,
  createBatch,
  updateBatchStage,
  submitBatchToQC,
  qaBatchRelease
};
