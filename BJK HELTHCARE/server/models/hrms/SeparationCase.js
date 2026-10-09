const mongoose = require('mongoose');

// ==============================================================================
// 1. Departmental Clearance Subschema
// ==============================================================================
const DepartmentClearanceItemSchema = new mongoose.Schema({
  departmentType: {
    type: String,
    enum: ['REPORTING_DEPARTMENT', 'IT_SYSTEMS', 'FINANCE_ACCOUNTS', 'HUMAN_RESOURCES', 'SECURITY_ADMIN'],
    required: true
  },
  departmentLabel: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED_HOLD', 'WAIVED'],
    default: 'PENDING'
  },
  clearedBy: { type: String, default: '' },
  clearedDate: { type: Date, default: null },
  duesOrRecoveryAmount: { type: Number, default: 0 },
  remarks: { type: String, default: '' },
  assetsReturned: [{
    assetName: { type: String },
    assetTag: { type: String },
    receivedCondition: { type: String, default: 'GOOD' }
  }]
}, { _id: true });

// ==============================================================================
// 2. Full & Final Settlement Subschema (Within 45 Days)
// ==============================================================================
const FullFinalSettlementSchema = new mongoose.Schema({
  calculatedDate: { type: Date, default: null },
  dueDate45Days: { type: Date, default: null },
  settlementStatus: {
    type: String,
    enum: ['PENDING_CLEARANCE', 'CALCULATED', 'AUDIT_APPROVED', 'DISBURSED', 'CLOSED'],
    default: 'PENDING_CLEARANCE'
  },
  
  // Earnings
  proratedBasicSalary: { type: Number, default: 0 },
  earnedLeaveEncashmentDays: { type: Number, default: 0 }, // up to 50 days (or 45 for retirement)
  earnedLeaveEncashmentAmount: { type: Number, default: 0 },
  gratuityAmount: { type: Number, default: 0 }, // 5+ years service statutory
  statutoryBonus: { type: Number, default: 0 },
  pendingReimbursements: { type: Number, default: 0 },
  totalGrossPayable: { type: Number, default: 0 },

  // Deductions & Recoveries
  noticePeriodShortfallDays: { type: Number, default: 0 },
  noticePeriodShortfallDeduction: { type: Number, default: 0 },
  loanOrAdvanceRecovery: { type: Number, default: 0 },
  assetDamageDeductions: { type: Number, default: 0 },
  taxDeductionsTDS: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },

  // Net Pay
  netPayableAmount: { type: Number, default: 0 },
  disbursementDate: { type: Date, default: null },
  paymentReferenceNumber: { type: String, default: '' },
  approvedByFinance: { type: String, default: '' }
}, { _id: false });

// ==============================================================================
// 3. Separation Case Model (BJK-HR-POL-010 Employee Separation & Exit)
// ==============================================================================
const SeparationCaseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. "SEP-2026-001"
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true, uppercase: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  designationTitle: { type: String, default: '' },
  joiningDate: { type: Date, default: null },

  // 7 Separation Types
  separationType: {
    type: String,
    enum: [
      'VOLUNTARY_RESIGNATION',
      'RETIREMENT',
      'TERMINATION_FOR_CAUSE',
      'RETRENCHMENT',
      'CONTRACT_EXPIRY',
      'DEATH_IN_SERVICE',
      'VOLUNTARY_ABANDONMENT'
    ],
    required: true
  },
  
  // Resignation Timeline & SLAs
  resignationSubmissionDate: { type: Date, default: null },
  acknowledgmentDueDate2Days: { type: Date, default: null },
  acknowledgedDate: { type: Date, default: null },
  acknowledgedBy: { type: String, default: '' },

  // Retention Discussion (for critical/high performers within 3 days)
  retentionDiscussionRequired: { type: Boolean, default: false },
  retentionDiscussionConductedDate: { type: Date, default: null },
  retentionDiscussionOutcome: { 
    type: String, 
    enum: ['NOT_APPLICABLE', 'RETAINED_WITHDRAWN', 'RESIGNATION_PROCEEDING'],
    default: 'NOT_APPLICABLE'
  },
  
  // Formal Acceptance (Within 5 days)
  formalAcceptanceDueDate5Days: { type: Date, default: null },
  formalAcceptanceDate: { type: Date, default: null },
  formalAcceptanceLetterIssued: { type: Boolean, default: false },

  // Notice Period
  contractualNoticePeriodDays: { type: Number, default: 30 },
  actualNoticeServedDays: { type: Number, default: 30 },
  noticeBuyoutApproved: { type: Boolean, default: false },
  noticeBuyoutApprovalRef: { type: String, default: '' },
  lastWorkingDayRequested: { type: Date, default: null },
  lastWorkingDayApproved: { type: Date, required: true },

  // Retirement Specific (Age 58, 6 months notice)
  isRetirement: { type: Boolean, default: false },
  superannuationAge: { type: Number, default: 58 },
  extensionGrantedToAge60: { type: Boolean, default: false },

  // 5-Department Clearances
  clearances: [DepartmentClearanceItemSchema],
  allClearancesApproved: { type: Boolean, default: false },

  // Full & Final Settlement
  settlement: FullFinalSettlementSchema,

  // Exit Interview & Feedback
  exitInterviewCompleted: { type: Boolean, default: false },
  exitInterviewDate: { type: Date, default: null },
  primaryReasonForLeaving: { type: String, default: '' },
  feedbackOnManagement: { type: String, default: '' },
  feedbackOnCulture: { type: String, default: '' },

  // Relieving & Experience Letters (Within 30 days)
  relievingCertificateDueDate30Days: { type: Date, default: null },
  relievingCertificateIssuedDate: { type: Date, default: null },
  relievingCertificateUrl: { type: String, default: '' },
  experienceLetterIssuedDate: { type: Date, default: null },
  experienceLetterUrl: { type: String, default: '' },

  // Post-Exit Obligations & Rehire Status
  postExitConfidentialityAffirmed: { type: Boolean, default: true },
  rehireEligibility: {
    type: String,
    enum: ['ELIGIBLE_GOOD_STANDING', 'CONDITIONAL_REVIEW', 'NOT_ELIGIBLE_MISCONDUCT'],
    default: 'ELIGIBLE_GOOD_STANDING'
  },

  status: {
    type: String,
    enum: [
      'SUBMITTED',
      'ACKNOWLEDGED',
      'ACCEPTED',
      'NOTICE_PERIOD',
      'CLEARANCE_IN_PROGRESS',
      'CLEARANCE_COMPLETED',
      'SETTLEMENT_PROCESSED',
      'RELIEVED_CLOSED',
      'WITHDRAWN'
    ],
    default: 'SUBMITTED'
  },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

SeparationCaseSchema.index({ employeeId: 1 });
SeparationCaseSchema.index({ status: 1 });

module.exports = {
  SeparationCase: mongoose.models.SeparationCase || mongoose.model('SeparationCase', SeparationCaseSchema)
};
