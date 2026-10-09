const Credential = require('../../models/hrms/Credential');
const Employee = require('../../models/hrms/Employee');
const { recordAudit } = require('../../middleware/audit');
const { getScopeQuery } = require('../../services/hrms/dataScopeService');

// GET /api/hrms/credentials
const getCredentials = async (req, res) => {
  try {
    const { category, status, employeeId, mandatoryOnly } = req.query;
    const query = {};

    const scopeFilter = getScopeQuery(req.user, 'credential');
    Object.assign(query, scopeFilter);

    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.status = status;
    if (employeeId && (!scopeFilter.employeeId)) query.employeeId = employeeId;
    if (mandatoryOnly === 'true') query.isMandatoryForRole = true;

    // Dynamically recalculate daysUntilExpiry & status flags
    const credentials = await Credential.find(query).sort({ expiryDate: 1 });
    const now = new Date();

    const updatedList = credentials.map(c => {
      const obj = c.toObject();
      if (c.expiryDate) {
        const diffTime = new Date(c.expiryDate).getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        obj.daysUntilExpiry = diffDays;
        if (diffDays <= 0 && obj.status !== 'EXPIRED') {
          obj.status = 'EXPIRED';
        } else if (diffDays <= 30 && diffDays > 0 && obj.status === 'VALID') {
          obj.status = 'EXPIRING';
        }
      }
      return obj;
    });

    const summary = {
      valid: await Credential.countDocuments({ status: 'VALID', ...scopeFilter }),
      expiringSoon: await Credential.countDocuments({ status: 'EXPIRING', ...scopeFilter }),
      expired: await Credential.countDocuments({ status: 'EXPIRED', ...scopeFilter }),
      mandatoryBlocking: await Credential.countDocuments({ isMandatoryForRole: true, status: 'EXPIRED', ...scopeFilter })
    };

    res.json({ success: true, credentials: updatedList, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/credentials
const addCredential = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.body.employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    req.body.employee = employee._id;
    req.body.employeeName = employee.fullName;
    req.body.departmentName = employee.departmentName;

    const cred = await Credential.create(req.body);

    await recordAudit({
      req,
      action: 'CREDENTIAL_ADDED',
      module: 'CREDENTIALS',
      recordId: cred._id,
      details: `Added ${cred.credentialName} for ${cred.employeeName}`
    });

    res.status(201).json({ success: true, credential: cred });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/credentials/:id/verify
const verifyCredential = async (req, res) => {
  try {
    const cred = await Credential.findById(req.params.id);
    if (!cred) return res.status(404).json({ success: false, message: 'Credential not found' });

    cred.status = 'VALID';
    cred.verifiedBy = req.user ? req.user.name : 'Authorized Compliance Officer';
    cred.verifiedAt = new Date();
    await cred.save();

    await recordAudit({
      req,
      action: 'CREDENTIAL_VERIFIED',
      module: 'CREDENTIALS',
      recordId: cred._id,
      details: `Verified ${cred.credentialName} for ${cred.employeeName}`
    });

    res.json({ success: true, message: 'Credential verified and authorized', credential: cred });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCredentials, addCredential, verifyCredential };
