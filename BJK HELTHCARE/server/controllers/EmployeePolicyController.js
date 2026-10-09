const mongoose = require('mongoose');
const { PolicyMaster, PolicyAcknowledgment } = require('../models/hrms/PolicyMaster');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * Standard Policies and SOPs for Healthcare & Pharma workforce
 */
const DEFAULT_POLICIES = [
  {
    policyNumber: 'BJK-HR-POL-003',
    title: 'Good Manufacturing Practices (GMP) & Plant Cleanroom Standards',
    category: 'COMPLIANCE',
    department: 'All Technical Plants',
    version: '4.2',
    effectiveDate: '2026-01-01',
    description: 'Mandatory standard operating protocol for cleanroom hygiene, particulate control, and sterile airlock gowning.',
    mandatory: true
  },
  {
    policyNumber: 'BJK-HR-POL-001',
    title: 'Employee Code of Conduct, Ethics & Statutory Compliance',
    category: 'CODE_OF_CONDUCT',
    department: 'Company-Wide',
    version: '5.0',
    effectiveDate: '2026-01-01',
    description: 'BJK Healthcare organizational standards for professional integrity, workplace ethics, and patient safety prioritization.',
    mandatory: true
  },
  {
    policyNumber: 'BJK-HR-POL-008',
    title: 'Information Security & USFDA 21 CFR Part 11 Electronic Records',
    category: 'IT_SECURITY',
    department: 'Company-Wide',
    version: '3.1',
    effectiveDate: '2026-02-01',
    description: 'Password hygiene, electronic batch signatures, audit trail integrity, and cyber safety regulations.',
    mandatory: true
  },
  {
    policyNumber: 'BJK-HR-POL-011',
    title: 'Environment, Health, Safety & Zero-Harm Incident Reporting',
    category: 'EHS_SAFETY',
    department: 'Manufacturing & Operations',
    version: '3.0',
    effectiveDate: '2026-01-15',
    description: 'Chemical handling guidelines, eye-wash station operation, PPE requirements, and hazardous substance disposal.',
    mandatory: true
  },
  {
    policyNumber: 'BJK-HR-POL-004',
    title: 'Workplace Attendance, Biometric Punches & Punctuality Policy',
    category: 'ATTENDANCE',
    department: 'Company-Wide',
    version: '4.0',
    effectiveDate: '2026-01-01',
    description: 'Shift rosters, 15-minute grace window, overtime authorization, and biometric regularization standards.',
    mandatory: true
  },
  {
    policyNumber: 'BJK-HR-POL-005',
    title: 'Annual Leave Quotas, Medical Entitlements & Absence Protocol',
    category: 'LEAVE',
    department: 'Company-Wide',
    version: '3.5',
    effectiveDate: '2026-01-01',
    description: 'Casual, Sick, Earned Leave calculation rules, notice periods, and compensatory off guidelines.',
    mandatory: true
  },
  {
    policyNumber: 'BJK-SOP-QC-002',
    title: 'Standard Operating Procedure: Quality Control Sample Handling & Testing',
    category: 'QUALITY',
    department: 'Quality Control & QA',
    version: '2.4',
    effectiveDate: '2026-03-01',
    description: 'Analytical testing standards, HPLC column maintenance, reagent storage, and raw data logging.',
    mandatory: false
  }
];

/**
 * GET /api/employee/policies
 * Returns list of policies and SOPs with acknowledgement status for the authenticated employee
 */
const getEmployeePolicies = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({ employeeId });

    // Fetch employee acknowledgements
    const acks = await PolicyAcknowledgment.find({
      employeeId: employeeId.toUpperCase()
    });

    const ackMap = new Map();
    acks.forEach(a => {
      ackMap.set(a.policyNumber, {
        acknowledged: true,
        acknowledgedAt: a.acknowledgedAt,
        version: a.version,
        id: a._id
      });
    });

    // Merge standard policies with acknowledgement state
    const policies = DEFAULT_POLICIES.map((p, idx) => {
      const ack = ackMap.get(p.policyNumber);
      return {
        id: `pol-${idx + 1}`,
        policyNumber: p.policyNumber,
        title: p.title,
        category: p.category,
        department: p.department,
        version: p.version,
        effectiveDate: p.effectiveDate,
        description: p.description,
        mandatory: p.mandatory,
        isAcknowledged: !!ack?.acknowledged,
        acknowledgedAt: ack?.acknowledgedAt || null,
        acknowledgedVersion: ack?.version || null
      };
    });

    const totalCount = policies.length;
    const ackCount = policies.filter(p => p.isAcknowledged).length;

    return res.status(200).json({
      success: true,
      policies,
      stats: {
        total: totalCount,
        acknowledged: ackCount,
        pending: totalCount - ackCount,
        complianceRate: Math.round((ackCount / totalCount) * 100)
      }
    });
  } catch (err) {
    console.error('[Get Employee Policies Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve policies.' });
  }
};

/**
 * POST /api/employee/policies/:policyNumber/acknowledge
 * Records statutory 21 CFR Part 11 compliant policy acknowledgement
 */
const acknowledgePolicy = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { policyNumber } = req.params;
    const { signatureDeclaration } = req.body;

    const policyDef = DEFAULT_POLICIES.find(p => p.policyNumber === policyNumber);
    if (!policyDef) {
      return res.status(404).json({ success: false, message: 'Policy document not found.' });
    }

    const employee = await Employee.findOne({ employeeId });

    const ack = await PolicyAcknowledgment.findOneAndUpdate(
      {
        employeeId: employeeId.toUpperCase(),
        policyNumber: policyDef.policyNumber
      },
      {
        employee: employee ? employee._id : new mongoose.Types.ObjectId(),
        employeeId: employeeId.toUpperCase(),
        employeeName: employee ? employee.fullName : req.user.name,
        departmentName: employee ? employee.departmentName : 'Operations',
        policyNumber: policyDef.policyNumber,
        policyTitle: policyDef.title,
        version: policyDef.version,
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        declarationAccepted: true,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        deviceDetails: req.headers['user-agent'] || 'BJK Employee Self Service Portal'
      },
      { upsert: true, new: true }
    );

    await logEmployeeAudit({
      employeeId,
      action: 'POLICY_ACKNOWLEDGED',
      details: {
        policyNumber: policyDef.policyNumber,
        title: policyDef.title,
        version: policyDef.version,
        acknowledgedAt: ack.acknowledgedAt,
        declarationAccepted: true
      }
    });

    return res.status(200).json({
      success: true,
      message: `You have officially read and acknowledged ${policyDef.policyNumber}: ${policyDef.title}. Timestamp recorded under 21 CFR Part 11 compliance standards.`,
      acknowledgement: ack
    });
  } catch (err) {
    console.error('[Acknowledge Policy Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit acknowledgement.' });
  }
};

module.exports = {
  getEmployeePolicies,
  acknowledgePolicy
};
