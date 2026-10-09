const Enquiry = require('../models/Enquiry');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const ExportShipment = require('../models/ExportShipment');
const AuditLog = require('../models/AuditLog');

// AI-assisted enquiry category classifier
const categorizeEnquiry = (text = '', type = '') => {
  const lower = (text + ' ' + type).toLowerCase();
  if (lower.includes('loan licens') || lower.includes('p2p') || lower.includes('principal to principal')) {
    return 'LOAN_LICENSING';
  }
  if (lower.includes('contract manufact') || lower.includes('cmo') || lower.includes('third party') || lower.includes('formulation line')) {
    return 'CMO';
  }
  if (lower.includes('dossier') || lower.includes('ectd') || lower.includes('copp') || lower.includes('regulatory') || lower.includes('who-gmp license')) {
    return 'REGULATORY';
  }
  if (lower.includes('distribut') || lower.includes('partner') || lower.includes('agency') || lower.includes('joint venture')) {
    return 'PARTNERSHIP';
  }
  if (lower.includes('quote') || lower.includes('price') || lower.includes('order') || lower.includes('buy') || lower.includes('commercial') || lower.includes('export')) {
    return 'SALES';
  }
  return 'GENERAL';
};

// ==============================================================================
// 1. CRM ENQUIRIES
// ==============================================================================
const getEnquiries = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.category) query.category = req.query.category;

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    next(err);
  }
};

// POST /api/crm/enquiries (Public endpoint + Authenticated CRM creation)
const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, company, country, subject, message, enquiryType } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const autoCategory = categorizeEnquiry(subject + ' ' + message, enquiryType);
    const enquiryId = `ENQ-${Date.now().toString().slice(-6)}`;

    const enquiry = await Enquiry.create({
      enquiryId,
      name,
      email,
      phone: phone || '',
      company: company || 'Individual Inquiry',
      country: country || 'India',
      subject: subject || 'General Inquiry',
      message: message || '',
      enquiryType: enquiryType || 'WEBSITE',
      category: autoCategory,
      status: 'NEW',
      priority: autoCategory === 'CMO' || autoCategory === 'SALES' ? 'HIGH' : 'MEDIUM'
    });

    await AuditLog.logAction({
      user: req.user || null,
      action: 'ENQUIRY_RECEIVED',
      module: 'CRM',
      resource: 'Enquiry',
      resourceId: enquiry._id,
      details: `New enquiry ${enquiry.enquiryId} from ${name} (${company || 'Individual'}). Auto-categorized as ${autoCategory}`
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully to BJK Healthcare.',
      data: enquiry
    });
  } catch (err) {
    next(err);
  }
};

const updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 2. CRM LEADS
// ==============================================================================
const getLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    next(err);
  }
};

const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      status: req.body.status || 'NEW',
      createdBy: req.user ? req.user._id : null
    });
    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 3. CUSTOMERS
// ==============================================================================
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).sort({ companyName: 1 }).lean();
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 4. EXPORT OPERATIONS
// ==============================================================================
const getExportShipments = async (req, res, next) => {
  try {
    const shipments = await ExportShipment.find({})
      .populate('customer', 'companyName country')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (err) {
    next(err);
  }
};

const createExportShipment = async (req, res, next) => {
  try {
    const shipmentNumber = `EXP-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const shipment = await ExportShipment.create({
      shipmentNumber,
      ...req.body,
      status: 'ORDER_CONFIRMED'
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'EXPORT_SHIPMENT_CREATED',
      module: 'EXPORT',
      resource: 'ExportShipment',
      resourceId: shipment._id,
      details: `Created export shipment ${shipment.shipmentNumber} to ${shipment.destinationCountry}`
    });

    res.status(201).json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

const updateExportShipmentStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, portOfLoading, portOfDischarge } = req.body;
    const shipment = await ExportShipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

    const beforeStatus = shipment.status;
    if (status) shipment.status = status;
    if (trackingNumber) shipment.trackingNumber = trackingNumber;
    if (portOfLoading) shipment.portOfLoading = portOfLoading;
    if (portOfDischarge) shipment.portOfDischarge = portOfDischarge;

    await shipment.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'EXPORT_STATUS_UPDATED',
      module: 'EXPORT',
      resource: 'ExportShipment',
      resourceId: shipment._id,
      before: { status: beforeStatus },
      after: { status: shipment.status },
      details: `Shipment ${shipment.shipmentNumber} status transitioned from ${beforeStatus} to ${shipment.status}`
    });

    res.json({ success: true, data: shipment });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  getLeads,
  createLead,
  updateLead,
  getCustomers,
  createCustomer,
  getExportShipments,
  createExportShipment,
  updateExportShipmentStatus
};
