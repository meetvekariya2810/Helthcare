const QCSample = require('../models/QCSample');
const QCTest = require('../models/QCTest');
const QCResult = require('../models/QCResult');
const Deviation = require('../models/Deviation');
const CAPA = require('../models/CAPA');
const ChangeControl = require('../models/ChangeControl');
const SOP = require('../models/SOP');
const AuditLog = require('../models/AuditLog');
const Task = require('../models/Task');

// ==============================================================================
// 1. QC LABORATORY (LIMS)
// ==============================================================================
const getQCSamples = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.sampleType) query.sampleType = req.query.sampleType;

    const samples = await QCSample.find(query)
      .populate('product', 'productName genericName dosageForm category')
      .populate('batch', 'batchNumber currentStage')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: samples.length, data: samples });
  } catch (err) {
    next(err);
  }
};

const createQCSample = async (req, res, next) => {
  try {
    const sampleNumber = `QC-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const sample = await QCSample.create({
      sampleNumber,
      ...req.body,
      status: 'REGISTERED',
      registeredDate: new Date()
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'QC_SAMPLE_REGISTERED',
      module: 'QC',
      resource: 'QCSample',
      resourceId: sample._id,
      details: `Registered sample ${sample.sampleNumber} for QC testing`
    });

    res.status(201).json({ success: true, message: 'QC sample registered.', data: sample });
  } catch (err) {
    next(err);
  }
};

const getQCTests = async (req, res, next) => {
  try {
    const tests = await QCTest.find({}).sort({ testName: 1 }).lean();
    res.json({ success: true, count: tests.length, data: tests });
  } catch (err) {
    next(err);
  }
};

// POST /api/qc/results (Enter test result, mark OOS / OOT)
const enterQCResult = async (req, res, next) => {
  try {
    const { sampleId, testName, specification, observedValue, unit, isOOS, isOOT, remarks } = req.body;

    const sample = await QCSample.findById(sampleId);
    if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });

    const resultStatus = isOOS ? 'FAIL' : 'PASS';
    const qcResult = await QCResult.create({
      sample: sample._id,
      testName,
      specification: specification || '',
      observedValue,
      unit: unit || '',
      status: resultStatus,
      isOOS: Boolean(isOOS),
      isOOT: Boolean(isOOT),
      remarks: remarks || '',
      testedBy: req.user ? req.user._id : null
    });

    // If marked OOS, auto-flag sample and trigger investigation deviation
    if (isOOS) {
      sample.status = 'OOS_INVESTIGATION';
      await sample.save();

      const devNumber = `DEV-OOS-${Date.now().toString().slice(-6)}`;
      await Deviation.create({
        deviationNumber: devNumber,
        title: `Out of Specification (OOS) - Sample ${sample.sampleNumber}`,
        severity: 'CRITICAL',
        category: 'QUALITY_CONTROL',
        source: 'QC_TESTING',
        status: 'LOGGED',
        description: `OOS observed during ${testName}. Expected: ${specification}, Observed: ${observedValue} ${unit || ''}. Remarks: ${remarks || 'None'}`,
        relatedSample: sample._id,
        relatedBatch: sample.batch || null,
        loggedBy: req.user ? req.user._id : null
      });

      await Task.create({
        taskName: `Initiate Phase 1 OOS Lab Investigation for ${sample.sampleNumber}`,
        module: 'QA',
        priority: 'CRITICAL',
        assignedRole: 'QA_MANAGER',
        relatedRecordType: 'QCSample',
        relatedRecordId: sample._id,
        dueDate: new Date(Date.now() + 86400000)
      });
    }

    await AuditLog.logAction({
      user: req.user,
      action: isOOS ? 'QC_RESULT_OOS_RECORDED' : 'QC_RESULT_ENTERED',
      module: 'QC',
      resource: 'QCResult',
      resourceId: qcResult._id,
      details: `Recorded result for test '${testName}' on sample ${sample.sampleNumber}: ${observedValue} [${resultStatus}]. OOS: ${Boolean(isOOS)}`
    });

    res.status(201).json({
      success: true,
      message: isOOS ? 'OOS recorded: Deviation automatically logged for QA investigation.' : 'QC result successfully entered.',
      data: qcResult
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/qc/samples/:id/generate-coa
const generateCOA = async (req, res, next) => {
  try {
    const sample = await QCSample.findById(req.params.id)
      .populate('product')
      .populate('batch');
    if (!sample) return res.status(404).json({ success: false, message: 'Sample not found' });

    const results = await QCResult.find({ sample: sample._id });

    sample.coaNumber = `COA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    sample.status = 'COMPLETED';
    sample.coaIssuedDate = new Date();
    await sample.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'QC_COA_GENERATED',
      module: 'QC',
      resource: 'QCSample',
      resourceId: sample._id,
      details: `Generated Certificate of Analysis ${sample.coaNumber} for sample ${sample.sampleNumber}`
    });

    res.json({
      success: true,
      message: 'Certificate of Analysis generated successfully.',
      data: {
        coaNumber: sample.coaNumber,
        sample,
        results
      }
    });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 2. QA & QUALITY ASSURANCE (QMS)
// ==============================================================================
const getDeviations = async (req, res, next) => {
  try {
    const deviations = await Deviation.find({})
      .populate('relatedBatch', 'batchNumber productName')
      .populate('relatedSample', 'sampleNumber')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: deviations.length, data: deviations });
  } catch (err) {
    next(err);
  }
};

const createDeviation = async (req, res, next) => {
  try {
    const devNum = `DEV-${Date.now().toString().slice(-6)}`;
    const dev = await Deviation.create({
      deviationNumber: devNum,
      ...req.body,
      status: 'LOGGED',
      loggedBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'DEVIATION_CREATED',
      module: 'QA',
      resource: 'Deviation',
      resourceId: dev._id,
      details: `Logged deviation ${dev.deviationNumber}: ${dev.title}`
    });

    res.status(201).json({ success: true, data: dev });
  } catch (err) {
    next(err);
  }
};

const updateDeviation = async (req, res, next) => {
  try {
    const dev = await Deviation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dev) return res.status(404).json({ success: false, message: 'Deviation not found' });

    await AuditLog.logAction({
      user: req.user,
      action: 'DEVIATION_UPDATED',
      module: 'QA',
      resource: 'Deviation',
      resourceId: dev._id,
      details: `Updated deviation ${dev.deviationNumber} to status '${dev.status}'`
    });

    res.json({ success: true, data: dev });
  } catch (err) {
    next(err);
  }
};

// GET /api/qa/capas
const getCAPAs = async (req, res, next) => {
  try {
    const capas = await CAPA.find({})
      .populate('deviation')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: capas.length, data: capas });
  } catch (err) {
    next(err);
  }
};

// POST /api/qa/capas
const createCAPA = async (req, res, next) => {
  try {
    const capaNumber = `CAPA-${Date.now().toString().slice(-6)}`;
    const capa = await CAPA.create({
      capaNumber,
      ...req.body,
      status: 'OPEN',
      createdBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'CAPA_CREATED',
      module: 'QA',
      resource: 'CAPA',
      resourceId: capa._id,
      details: `Opened CAPA ${capa.capaNumber}: ${capa.title}`
    });

    res.status(201).json({ success: true, data: capa });
  } catch (err) {
    next(err);
  }
};

// PUT /api/qa/capas/:id (Lifecycle: OPEN -> INVESTIGATION -> ROOT_CAUSE -> CORRECTIVE_ACTION -> PREVENTIVE_ACTION -> QA_REVIEW -> CLOSED)
const updateCAPA = async (req, res, next) => {
  try {
    const capa = await CAPA.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!capa) return res.status(404).json({ success: false, message: 'CAPA not found' });

    await AuditLog.logAction({
      user: req.user,
      action: 'CAPA_UPDATED',
      module: 'QA',
      resource: 'CAPA',
      resourceId: capa._id,
      details: `Updated CAPA ${capa.capaNumber} status to '${capa.status}'`
    });

    res.json({ success: true, data: capa });
  } catch (err) {
    next(err);
  }
};

// SOPs
const getSOPs = async (req, res, next) => {
  try {
    const sops = await SOP.find({}).sort({ sopNumber: 1 }).lean();
    res.json({ success: true, count: sops.length, data: sops });
  } catch (err) {
    next(err);
  }
};

const createSOP = async (req, res, next) => {
  try {
    const sop = await SOP.create({
      ...req.body,
      status: 'DRAFT',
      createdBy: req.user ? req.user._id : null
    });
    res.status(201).json({ success: true, data: sop });
  } catch (err) {
    next(err);
  }
};

// Change Controls
const getChangeControls = async (req, res, next) => {
  try {
    const ccs = await ChangeControl.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: ccs.length, data: ccs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getQCSamples,
  createQCSample,
  getQCTests,
  enterQCResult,
  generateCOA,
  getDeviations,
  createDeviation,
  updateDeviation,
  getCAPAs,
  createCAPA,
  updateCAPA,
  getSOPs,
  createSOP,
  getChangeControls
};
