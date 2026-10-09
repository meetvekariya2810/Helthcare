const Document = require('../models/Document');
const AuditLog = require('../models/AuditLog');

// GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;
    if (req.query.department) query.department = req.query.department;
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { documentNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const docs = await Document.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id
const getDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents (Create new document / initial version)
const createDocument = async (req, res, next) => {
  try {
    const { title, type, department, description, fileLocation, effectiveDate, expiryDate } = req.body;

    const docNum = `DOC-${(type || 'GEN').substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const newDoc = await Document.create({
      documentNumber: docNum,
      title,
      type: type || 'SOP',
      department: department || 'Quality Assurance',
      description: description || '',
      version: '1.0',
      status: 'DRAFT',
      fileLocation: fileLocation || '/uploads/sample_doc.pdf',
      effectiveDate: effectiveDate || new Date(),
      expiryDate: expiryDate || new Date(Date.now() + 365 * 86400000),
      createdBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'DOCUMENT_CREATED',
      module: 'DOCUMENTS',
      resource: 'Document',
      resourceId: newDoc._id,
      details: `Created new document ${newDoc.documentNumber} (${newDoc.title}) v1.0`
    });

    res.status(201).json({ success: true, data: newDoc });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents/:id/version (Version increment: Never overwrite approved documents)
const createNewVersion = async (req, res, next) => {
  try {
    const existing = await Document.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Document not found' });

    // Parse version (e.g. "1.0" -> "2.0")
    const currentVer = parseFloat(existing.version) || 1.0;
    const newVer = (currentVer + 1.0).toFixed(1);

    // Archive current approved version
    existing.status = 'ARCHIVED';
    await existing.save();

    const revisedDoc = await Document.create({
      documentNumber: existing.documentNumber,
      title: req.body.title || existing.title,
      type: existing.type,
      department: existing.department,
      description: req.body.description || existing.description,
      version: newVer,
      status: 'UNDER_REVIEW',
      fileLocation: req.body.fileLocation || existing.fileLocation,
      effectiveDate: req.body.effectiveDate || new Date(),
      expiryDate: req.body.expiryDate || new Date(Date.now() + 365 * 86400000),
      previousVersionId: existing._id,
      createdBy: req.user ? req.user._id : null
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'DOCUMENT_VERSION_CREATED',
      module: 'DOCUMENTS',
      resource: 'Document',
      resourceId: revisedDoc._id,
      details: `Created revision v${newVer} for document ${revisedDoc.documentNumber}. Prior v${existing.version} archived.`
    });

    res.status(201).json({ success: true, message: `New version ${newVer} created under review.`, data: revisedDoc });
  } catch (err) {
    next(err);
  }
};

// PUT /api/documents/:id/approve
const approveDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.status = 'APPROVED';
    doc.approvedBy = req.user ? req.user._id : null;
    await doc.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'DOCUMENT_APPROVED',
      module: 'DOCUMENTS',
      resource: 'Document',
      resourceId: doc._id,
      details: `Document ${doc.documentNumber} (${doc.title}) v${doc.version} approved by ${req.user ? req.user.name : 'Authorized Signatory'}`
    });

    res.json({ success: true, message: 'Document approved successfully.', data: doc });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  createNewVersion,
  approveDocument
};
