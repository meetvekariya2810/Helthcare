const RegulatoryRecord = require('../models/RegulatoryRecord');
const DossierSubmission = require('../models/DossierSubmission');
const CountryCompliance = require('../models/CountryCompliance');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// GET /api/regulatory/records
const getRegulatoryRecords = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.country) query.country = req.query.country;
    if (req.query.status) query.status = req.query.status;

    const records = await RegulatoryRecord.find(query)
      .populate('product', 'productName genericName dosageForm category strength')
      .sort({ expiryDate: 1 })
      .lean();

    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    next(err);
  }
};

// POST /api/regulatory/records
const createRegulatoryRecord = async (req, res, next) => {
  try {
    const regNum = req.body.registrationNumber || `REG-${req.body.countryCode || 'INT'}-${Date.now().toString().slice(-6)}`;
    const record = await RegulatoryRecord.create({
      ...req.body,
      registrationNumber: regNum,
      createdBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'REGULATORY_RECORD_CREATED',
      module: 'REGULATORY',
      resource: 'RegulatoryRecord',
      resourceId: record._id,
      details: `Created regulatory registration ${record.registrationNumber} for ${record.country}`
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// PUT /api/regulatory/records/:id
const updateRegulatoryRecord = async (req, res, next) => {
  try {
    const record = await RegulatoryRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });

    await AuditLog.logAction({
      user: req.user,
      action: 'REGULATORY_RECORD_UPDATED',
      module: 'REGULATORY',
      resource: 'RegulatoryRecord',
      resourceId: record._id,
      details: `Updated regulatory record ${record.registrationNumber} (${record.country}) status: ${record.status}`
    });

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

// GET /api/regulatory/countries
const getCountryCompliances = async (req, res, next) => {
  try {
    const countries = await CountryCompliance.find({}).sort({ countryName: 1 }).lean();
    res.json({ success: true, count: countries.length, data: countries });
  } catch (err) {
    next(err);
  }
};

// GET /api/regulatory/dossiers
const getDossiers = async (req, res, next) => {
  try {
    const dossiers = await DossierSubmission.find({})
      .populate('product', 'productName genericName')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: dossiers.length, data: dossiers });
  } catch (err) {
    next(err);
  }
};

// POST /api/regulatory/dossiers
const createDossier = async (req, res, next) => {
  try {
    const dossier = await DossierSubmission.create({
      ...req.body,
      submissionNumber: `DOS-${req.body.format || 'CTD'}-${Date.now().toString().slice(-6)}`,
      status: req.body.status || 'DRAFT'
    });
    res.status(201).json({ success: true, data: dossier });
  } catch (err) {
    next(err);
  }
};

// GET /api/regulatory/deadlines (Alert brackets: 90 days, 60 days, 30 days, 7 days, overdue)
const getRegulatoryDeadlines = async (req, res, next) => {
  try {
    const now = new Date();
    const days7 = new Date(now.getTime() + 7 * 86400000);
    const days30 = new Date(now.getTime() + 30 * 86400000);
    const days60 = new Date(now.getTime() + 60 * 86400000);
    const days90 = new Date(now.getTime() + 90 * 86400000);

    const [overdue, within7, within30, within60, within90] = await Promise.all([
      RegulatoryRecord.find({ expiryDate: { $lt: now } }).populate('product', 'productName').lean(),
      RegulatoryRecord.find({ expiryDate: { $gte: now, $lte: days7 } }).populate('product', 'productName').lean(),
      RegulatoryRecord.find({ expiryDate: { $gt: days7, $lte: days30 } }).populate('product', 'productName').lean(),
      RegulatoryRecord.find({ expiryDate: { $gt: days30, $lte: days60 } }).populate('product', 'productName').lean(),
      RegulatoryRecord.find({ expiryDate: { $gt: days60, $lte: days90 } }).populate('product', 'productName').lean(),
    ]);

    res.json({
      success: true,
      data: {
        overdue: { count: overdue.length, records: overdue },
        within7Days: { count: within7.length, records: within7 },
        within30Days: { count: within30.length, records: within30 },
        within60Days: { count: within60.length, records: within60 },
        within90Days: { count: within90.length, records: within90 },
        totalUpcoming: within7.length + within30.length + within60.length + within90.length
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRegulatoryRecords,
  createRegulatoryRecord,
  updateRegulatoryRecord,
  getCountryCompliances,
  getDossiers,
  createDossier,
  getRegulatoryDeadlines
};
