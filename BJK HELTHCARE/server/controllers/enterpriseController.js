const {
  Company,
  Facility,
  Department,
  Product,
  ProductCategory,
  ProductionLine,
  Machine,
  ProductionOrder,
  Batch,
  Warehouse,
  InventoryItem,
  InventoryTransaction,
  QCSample,
  QCResult,
  Deviation,
  CAPA,
  ChangeControl,
  SOP,
  Audit,
  RegulatoryRecord,
  DossierSubmission,
  CountryCompliance,
  Enquiry,
  Lead,
  Customer,
  SalesOrder,
  ExportShipment,
  Document,
  KnowledgeEntity,
  KnowledgeChunk,
  Alert,
  Task,
  AuditLog
} = require('../models');

// Company Info
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne().lean();
    res.json({ success: true, data: company });
  } catch (err) { next(err); }
};

// Facilities
const getFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.find({}).sort({ facilityName: 1 }).lean();
    res.json({ success: true, count: facilities.length, data: facilities });
  } catch (err) { next(err); }
};

// Departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 }).lean();
    res.json({ success: true, count: departments.length, data: departments });
  } catch (err) { next(err); }
};

// Production Lines
const getProductionLines = async (req, res, next) => {
  try {
    const lines = await ProductionLine.find({}).sort({ code: 1 }).lean();
    res.json({ success: true, count: lines.length, data: lines });
  } catch (err) { next(err); }
};

// Batches
const getBatches = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { batchNumber: { $regex: req.query.search, $options: 'i' } },
        { productName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Batch.countDocuments(query);
    const batches = await Batch.find(query).populate('product', 'productName genericName category').sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    res.json({ success: true, count: batches.length, total, page, pages: Math.ceil(total / limit), data: batches });
  } catch (err) { next(err); }
};

// Inventory Items
const getInventory = async (req, res, next) => {
  try {
    const items = await InventoryItem.find({}).populate('product', 'productName genericName dosageForm category').populate('warehouse', 'warehouseName code').sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: items.length, data: items });
  } catch (err) { next(err); }
};

// QC Samples & Results
const getQCSamples = async (req, res, next) => {
  try {
    const samples = await QCSample.find({}).populate('product', 'productName genericName').populate('batch', 'batchNumber').sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: samples.length, data: samples });
  } catch (err) { next(err); }
};

// QA Deviations
const getDeviations = async (req, res, next) => {
  try {
    const deviations = await Deviation.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: deviations.length, data: deviations });
  } catch (err) { next(err); }
};

// Regulatory Records
const getRegulatoryRecords = async (req, res, next) => {
  try {
    const records = await RegulatoryRecord.find({}).populate('product', 'productName genericName').sort({ expiryDate: 1 }).lean();
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

// CRM Enquiries
const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) { next(err); }
};

const createEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    await AuditLog.logAction({
      user: req.user || null,
      action: 'CREATE',
      module: 'CRM',
      resource: 'Enquiry',
      resourceId: enquiry._id,
      details: `New enquiry submitted by ${enquiry.name} (${enquiry.company})`
    });
    res.status(201).json({ success: true, message: 'Enquiry received successfully', data: enquiry });
  } catch (err) { next(err); }
};

// Dashboard Unified Telemetry Overview
const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalProducts,
      activeBatches,
      operationalLines,
      qcPending,
      qaReviews,
      regulatoryDeadlines,
      openEnquiries,
      auditLogCount
    ] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Batch.countDocuments({ status: { $in: ['FORMULATION', 'PACKAGING', 'QUARANTINED'] } }),
      ProductionLine.countDocuments({ status: 'OPERATIONAL' }),
      QCSample.countDocuments({ status: 'UNDER_TESTING' }),
      Deviation.countDocuments({ status: { $ne: 'CLOSED' } }),
      RegulatoryRecord.countDocuments({ status: 'APPROVED' }),
      Enquiry.countDocuments({ status: 'NEW' }),
      AuditLog.countDocuments({})
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        activeBatches,
        operationalLines,
        qcPending,
        qaReviews,
        regulatoryDeadlines,
        openEnquiries,
        auditLogCount,
        globalMarketsCount: 50,
        gmpComplianceRate: 100,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) { next(err); }
};

module.exports = {
  getCompany,
  getFacilities,
  getDepartments,
  getProductionLines,
  getBatches,
  getInventory,
  getQCSamples,
  getDeviations,
  getRegulatoryRecords,
  getEnquiries,
  createEnquiry,
  getDashboardSummary
};
