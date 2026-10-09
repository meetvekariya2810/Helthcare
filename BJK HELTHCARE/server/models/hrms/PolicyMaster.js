const mongoose = require('mongoose');

// ==============================================================================
// 1. Policy Rule Model (Central Configurable HR Policy Rules Engine)
// ==============================================================================
const PolicyRuleSchema = new mongoose.Schema({
  ruleCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  ruleName: { type: String, required: true, trim: true },
  policyNumber: { type: String, required: true, trim: true },
  policyTitle: { type: String, required: true, trim: true },
  parameter: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String, default: '' }, // 'days', 'hours', 'percent', 'times/month', etc.
  condition: { type: String, default: 'STANDARD' },
  department: { type: String, default: 'ALL' },
  employeeType: { type: String, default: 'ALL' },
  description: { type: String, default: '' },
  sourceDocument: { type: String, default: 'BJK Healthcare HR Policy Handbook' },
  sourcePage: { type: String, default: '' },
  effectiveDate: { type: Date, default: new Date('2026-04-01') },
  reviewCycleYears: { type: Number, default: 2 },
  isConfigurable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

PolicyRuleSchema.index({ policyNumber: 1 });

// ==============================================================================
// 2. Policy Version Subschema
// ==============================================================================
const PolicyVersionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  effectiveDate: { type: Date, required: true },
  reviewDate: { type: Date, required: true },
  changeSummary: { type: String, required: true },
  approvedBy: { type: String, default: 'Managing Director & HR Head' },
  publishedAt: { type: Date, default: Date.now },
  documentUrl: { type: String, default: '' }
}, { _id: true });

// ==============================================================================
// 3. Master Policy Model (13 Core BJK Healthcare HR Policies)
// ==============================================================================
const PolicySchema = new mongoose.Schema({
  policyId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  policyNumber: { type: String, required: true, trim: true }, // e.g. "BJK-HR-POL-001"
  title: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['EMPLOYMENT', 'LEAVE_ATTENDANCE', 'ETHICS_CONDUCT', 'SAFETY_HEALTH', 'COMPLIANCE_PRIVACY', 'SECURITY', 'DEVELOPMENT'],
    default: 'EMPLOYMENT'
  },
  currentVersion: { type: String, default: '1.0' },
  effectiveDate: { type: Date, default: new Date('2026-04-01') },
  reviewDate: { type: Date, default: new Date('2028-04-01') },
  status: { 
    type: String, 
    enum: ['DRAFT', 'HR_REVIEW', 'MANAGEMENT_APPROVAL', 'PUBLISHED', 'ARCHIVED'], 
    default: 'PUBLISHED' 
  },
  sourceDocument: { type: String, default: 'BJK Healthcare HR Policy Handbook — 55 Pages' },
  sourcePages: { type: String, default: '' }, // e.g. "Pages 4-7"
  
  // Specific Source Conflict Tracking (for Maternity/Paternity POL-016 vs POL-011)
  hasSourceConflict: { type: Boolean, default: false },
  conflictDetails: {
    sourcePolicyNumberAlternative: { type: String, default: '' },
    notes: { type: String, default: '' },
    hrVerificationStatus: { 
      type: String, 
      enum: ['PENDING_HR_VERIFICATION', 'VERIFIED_ACCEPTED', 'RESOLVED_BY_AMENDMENT'], 
      default: 'PENDING_HR_VERIFICATION' 
    },
    flaggedWarning: { type: String, default: '' }
  },

  summary: { type: String, required: true },
  detailedSections: [{
    sectionTitle: { type: String, required: true },
    content: { type: String, required: true },
    bulletPoints: [{ type: String }]
  }],

  // Configured Rules
  rules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PolicyRule' }],

  approvalWorkflow: [{ type: String }],
  acknowledgmentRequired: { type: Boolean, default: true },
  acknowledgmentDeadlineDays: { type: Number, default: 30 },
  
  versions: [PolicyVersionSchema],
  
  createdBy: { type: String, default: 'HR Department' },
  approvedBy: { type: String, default: 'Managing Director' },
  publishedAt: { type: Date, default: new Date('2026-04-01') },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

PolicySchema.index({ policyNumber: 1 });
PolicySchema.index({ status: 1 });

// ==============================================================================
// 4. Policy Acknowledgment Record (Immutable Employee Sign-offs)
// ==============================================================================
const PolicyAcknowledgmentSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true, uppercase: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, default: '' },
  policy: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  policyNumber: { type: String, required: true },
  policyTitle: { type: String, required: true },
  version: { type: String, default: '1.0' },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACKNOWLEDGED', 'OVERDUE'], 
    default: 'PENDING' 
  },
  acknowledgedAt: { type: Date, default: null },
  declarationAccepted: { type: Boolean, default: false },
  declarationText: { 
    type: String, 
    default: 'I confirm that I have read, understood, and agree to strictly comply with this policy as a condition of employment with BJK Healthcare Pvt. Ltd.' 
  },
  ipAddress: { type: String, default: '127.0.0.1' },
  deviceDetails: { type: String, default: 'Web Browser' },
  auditLogRef: { type: mongoose.Schema.Types.ObjectId, ref: 'AuditLog', default: null },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

PolicyAcknowledgmentSchema.index({ employee: 1, policy: 1, version: 1 }, { unique: true });
PolicyAcknowledgmentSchema.index({ employeeId: 1 });
PolicyAcknowledgmentSchema.index({ status: 1 });
PolicyAcknowledgmentSchema.index({ policyNumber: 1 });

module.exports = {
  Policy: mongoose.models.Policy || mongoose.model('Policy', PolicySchema),
  PolicyRule: mongoose.models.PolicyRule || mongoose.model('PolicyRule', PolicyRuleSchema),
  PolicyAcknowledgment: mongoose.models.PolicyAcknowledgment || mongoose.model('PolicyAcknowledgment', PolicyAcknowledgmentSchema)
};
