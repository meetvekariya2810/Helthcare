const mongoose = require('mongoose');

// ==============================================================================
// 1. COMPENSATORY OFF WORK AUTHORIZATION MODEL (Pre-Approval before work)
// Policy Ref: BJK-HR-POL-001 Section 8.2 & 8.5
// ==============================================================================
const CompOffWorkAuthorizationSchema = new mongoose.Schema({
  authorizationId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'CO-AUTH-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  facility: { type: String, default: 'Chhatral Formulation Plant' },

  workDate: { type: Date, required: true },
  workDateString: { type: String, required: true }, // YYYY-MM-DD
  workType: {
    type: String,
    enum: ['WEEKLY_OFF', 'PUBLIC_HOLIDAY', 'OVERTIME'],
    default: 'WEEKLY_OFF'
  },
  plannedHours: { type: Number, required: true, min: 1 }, // e.g. 4 for 0.5 day, 8 for 1.0 day
  creditEligible: { type: Number, required: true, enum: [0.5, 1.0] },
  businessJustification: { type: String, required: true, trim: true },
  requestedBy: {
    type: String,
    enum: ['EMPLOYEE', 'REPORTING_MANAGER', 'HOD'],
    default: 'EMPLOYEE'
  },

  // Two-tier approval required BEFORE extra work
  reportingManagerApproval: {
    approved: { type: Boolean, default: null },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approverName: { type: String, default: '' },
    actionDate: { type: Date, default: null },
    remarks: { type: String, default: '' }
  },
  hrApproval: {
    approved: { type: Boolean, default: null },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approverName: { type: String, default: '' },
    actionDate: { type: Date, default: null },
    remarks: { type: String, default: '' }
  },

  status: {
    type: String,
    enum: [
      'PENDING_RM',
      'PENDING_HR',
      'PRE_APPROVED',
      'REJECTED',
      'WORK_COMPLETED',
      'CREDITED',
      'CANCELLED'
    ],
    default: 'PENDING_RM'
  },

  // Post-work verification
  workCompletionVerified: {
    verified: { type: Boolean, default: false },
    verifiedBy: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    actualHoursWorked: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },

  creditedCreditId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompOffCredit', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

CompOffWorkAuthorizationSchema.index({ employeeCode: 1, workDate: 1 });
CompOffWorkAuthorizationSchema.index({ status: 1 });
CompOffWorkAuthorizationSchema.index({ department: 1 });

// ==============================================================================
// 2. COMPENSATORY OFF CREDIT LEDGER MODEL (90-Day Expiry Engine)
// Policy Ref: BJK-HR-POL-001 Section 8.2, 8.3 & 8.4
// ==============================================================================
const CompOffCreditSchema = new mongoose.Schema({
  creditId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'CO-CR-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  workAuthorization: { type: mongoose.Schema.Types.ObjectId, ref: 'CompOffWorkAuthorization', default: null },

  workDate: { type: Date, required: true },
  creditDays: { type: Number, required: true, enum: [0.5, 1.0] },
  earnedDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true }, // earnedDate + 90 days
  usedDays: { type: Number, default: 0 },
  remainingDays: { type: Number, required: true },

  status: {
    type: String,
    enum: ['ACTIVE', 'PARTIALLY_USED', 'CONSUMED', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE'
  },

  hrApprovedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: 'HR Administration' },
    timestamp: { type: Date, default: Date.now }
  },

  usageHistory: [{
    leaveRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' },
    leaveRequestCode: { type: String, default: '' },
    daysDeducted: { type: Number, required: true },
    deductedAt: { type: Date, default: Date.now }
  }],

  remarks: { type: String, default: '' }
}, {
  timestamps: true
});

CompOffCreditSchema.index({ employeeCode: 1, status: 1, expiryDate: 1 });
CompOffCreditSchema.index({ expiryDate: 1, status: 1 });

// Helper to check and mark expired
CompOffCreditSchema.methods.checkExpiry = function(now = new Date()) {
  if (this.status === 'ACTIVE' || this.status === 'PARTIALLY_USED') {
    if (new Date(this.expiryDate) < now) {
      this.status = 'EXPIRED';
      this.remainingDays = 0;
      return true;
    }
  }
  return false;
};

// ==============================================================================
// 3. LEAVE BLACKOUT PERIOD MODEL (GMP Regulated Shutdowns, Audits, Campaigns)
// Policy Ref: BJK-HR-POL-001 Section 14.2 (30-day advance notice mandatory)
// ==============================================================================
const LeaveBlackoutPeriodSchema = new mongoose.Schema({
  periodId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'BLK-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  },
  title: { type: String, required: true, trim: true }, // e.g. "US FDA Pre-Approval Inspection"
  facility: { type: String, default: 'ALL' },
  department: { type: String, default: 'ALL' }, // 'PRD', 'QC', 'QA', 'ALL'
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startDateString: { type: String, required: true },
  endDateString: { type: String, required: true },

  notificationDate: { type: Date, required: true },
  notificationDaysInAdvance: { type: Number, default: 30 }, // Policy requires >= 30 days
  reason: { type: String, required: true, trim: true },
  declaredBy: { type: String, default: 'Plant Operations / HR' },

  // Emergency leave and Sick leave continue to be permitted during blackout
  emergencyExceptionsAllowed: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

LeaveBlackoutPeriodSchema.index({ startDate: 1, endDate: 1, department: 1 });

// ==============================================================================
// 4. DEPARTMENT STAFFING THRESHOLD MODEL (GMP Cleanroom Continuity)
// Policy Ref: BJK-HR-POL-001 Section 14.1 & WHO GMP TRS 986
// ==============================================================================
const DepartmentStaffingThresholdSchema = new mongoose.Schema({
  department: { type: String, required: true, unique: true, uppercase: true, trim: true },
  departmentName: { type: String, required: true },
  facility: { type: String, default: 'Chhatral Formulation Plant' },
  minStaffCount: { type: Number, required: true, default: 5 },
  minStaffPercentage: { type: Number, required: true, default: 70 }, // At least 70% present
  criticalRoles: [{ type: String }], // e.g. ['QA Batch Release Officer', 'QC Microbiologist']
  maxSimultaneousLeaves: { type: Number, default: 2 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// ==============================================================================
// 5. GMP REFRESHER TRAINING AFTER EXTENDED LEAVE MODEL
// Policy Ref: BJK-HR-POL-001 Section 14.3 (Leave >= 30 days requires GMP refresher)
// ==============================================================================
const LeaveRefresherTrainingSchema = new mongoose.Schema({
  trainingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'GMP-TR-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  leaveRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', default: null },

  leaveDurationDays: { type: Number, required: true },
  returnDate: { type: Date, required: true },
  trainingTopic: { type: String, default: 'WHO GMP TRS 986 & 21 CFR 211.25 Qualification Refresher' },

  status: {
    type: String,
    enum: ['REQUIRED', 'SCHEDULED', 'COMPLETED', 'VERIFIED_BY_QA'],
    default: 'REQUIRED'
  },

  scheduledDate: { type: Date, default: null },
  completedDate: { type: Date, default: null },
  qaVerifierName: { type: String, default: '' },
  qaVerifiedAt: { type: Date, default: null },
  certificateDocUrl: { type: String, default: '' },
  remarks: { type: String, default: '' }
}, {
  timestamps: true
});

LeaveRefresherTrainingSchema.index({ employeeCode: 1, status: 1 });

// ==============================================================================
// 6. MEDICAL FITNESS TO RESUME DUTIES RECORD MODEL
// Policy Ref: BJK-HR-POL-001 Section 7.3 & 7.7 (Sick Leave >= 4 days in GMP/QC)
// ==============================================================================
const MedicalFitnessRecordSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'MED-FIT-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  leaveRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', default: null },

  sickLeaveDays: { type: Number, required: true },
  certificateType: {
    type: String,
    enum: ['SICK_LEAVE_CERT', 'HOSPITAL_DISCHARGE_SUMMARY', 'FITNESS_TO_RESUME'],
    default: 'FITNESS_TO_RESUME'
  },

  isGmpCriticalRole: { type: Boolean, default: true },
  doctorName: { type: String, default: '' },
  doctorRegistrationNo: { type: String, default: '' },
  clinicOrHospital: { type: String, default: '' },
  issueDate: { type: Date, default: Date.now },
  documentUrl: { type: String, required: true },
  documentFileName: { type: String, default: '' },

  status: {
    type: String,
    enum: ['SUBMITTED', 'VERIFIED_BY_HR', 'REJECTED'],
    default: 'SUBMITTED'
  },

  verifiedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, default: '' },
    timestamp: { type: Date, default: null },
    remarks: { type: String, default: '' }
  }
}, {
  timestamps: true
});

MedicalFitnessRecordSchema.index({ employeeCode: 1, status: 1 });

// ==============================================================================
// 7. LEAVE ENCASHMENT REQUEST MODEL
// Policy Ref: BJK-HR-POL-001 Section 12 (Max 10 days in Dec, min 20 retained)
// ==============================================================================
const LeaveEncashmentRequestSchema = new mongoose.Schema({
  encashmentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'ENCASH-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },

  encashmentType: {
    type: String,
    enum: ['ANNUAL_DECEMBER', 'SEPARATION_SETTLEMENT'],
    default: 'ANNUAL_DECEMBER'
  },

  currentELBalance: { type: Number, required: true },
  requestedDays: { type: Number, required: true, min: 1, max: 10 },
  retainedBalance: { type: Number, required: true }, // Must be >= 20 days
  basicSalary: { type: Number, default: 0 },
  calculatedEncashmentAmount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['SUBMITTED', 'HR_APPROVED', 'MD_APPROVED', 'REJECTED', 'PAYROLL_PROCESSED'],
    default: 'SUBMITTED'
  },

  hrApprovedBy: {
    name: { type: String, default: '' },
    actionDate: { type: Date, default: null },
    remarks: { type: String, default: '' }
  },
  mdApprovedBy: {
    name: { type: String, default: '' },
    actionDate: { type: Date, default: null },
    remarks: { type: String, default: '' }
  },

  payrollReference: { type: String, default: '' },
  processedInMonth: { type: String, default: 'December' }
}, {
  timestamps: true
});

LeaveEncashmentRequestSchema.index({ employeeCode: 1, encashmentType: 1 });

// ==============================================================================
// 8. LEAVE REGULARIZATION REQUEST MODEL (Unauthorized Absence / Emergency LOP)
// Policy Ref: BJK-HR-POL-001 Section 13.4
// ==============================================================================
const LeaveRegularizationRequestSchema = new mongoose.Schema({
  regularizationId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'REG-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },

  absenceStartDate: { type: Date, required: true },
  absenceEndDate: { type: Date, required: true },
  absenceDaysCount: { type: Number, required: true },

  reasonType: {
    type: String,
    enum: ['HOSPITALIZATION', 'ACCIDENT', 'NATURAL_CALAMITY', 'OFFICIAL_DUTY', 'OTHER_EMERGENCY'],
    required: true
  },
  explanation: { type: String, required: true, trim: true },
  supportingDocumentUrl: { type: String, default: '' },
  requestedConversionType: {
    type: String,
    enum: ['SICK_LEAVE', 'SPECIAL_LEAVE', 'EARNED_LEAVE', 'LOSS_OF_PAY_EXCUSED'],
    default: 'SICK_LEAVE'
  },

  status: {
    type: String,
    enum: ['SUBMITTED', 'HR_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'SUBMITTED'
  },

  hrApprovedBy: {
    name: { type: String, default: '' },
    actionDate: { type: Date, default: null },
    remarks: { type: String, default: '' },
    finalLeaveTypeGranted: { type: String, default: '' }
  }
}, {
  timestamps: true
});

LeaveRegularizationRequestSchema.index({ employeeCode: 1, status: 1 });

// ==============================================================================
// 9. LEAVE GRIEVANCE MODEL (Fair Resolution with SLA tracking)
// Policy Ref: BJK-HR-POL-001 Section 16 (10-day submit, 3-day ack, 7-day HR, 5-day MD, 21-day close)
// ==============================================================================
const LeaveGrievanceSchema = new mongoose.Schema({
  grievanceId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    default: () => 'GRV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },

  incidentDate: { type: Date, required: true },
  submissionDate: { type: Date, default: Date.now },
  relatedLeaveRequestId: { type: String, default: '' },

  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },

  stage: {
    type: String,
    enum: ['STEP_1_HR_SUBMISSION', 'STEP_2_HR_INVESTIGATION', 'STEP_3_MD_ESCALATION', 'RESOLVED', 'CLOSED'],
    default: 'STEP_1_HR_SUBMISSION'
  },

  acknowledgedBy: { type: String, default: '' },
  acknowledgedAt: { type: Date, default: null }, // SLA: within 3 working days

  investigationRemarks: { type: String, default: '' },
  investigatedBy: { type: String, default: '' },
  investigatedAt: { type: Date, default: null }, // SLA: within 7 working days

  escalatedToMdAt: { type: Date, default: null }, // SLA: within 5 working days
  mdResolution: { type: String, default: '' },
  mdResolvedAt: { type: Date, default: null },

  finalResolution: { type: String, default: '' },
  resolvedAt: { type: Date, default: null }, // Overall SLA: 21 working days
  slaBreached: { type: Boolean, default: false }
}, {
  timestamps: true
});

LeaveGrievanceSchema.index({ employeeCode: 1, stage: 1 });

// ==============================================================================
// 10. POLICY CLARIFICATION & EXCEPTION REGISTER MODEL
// Specification Section 13 (Track the 7 policy clarifications transparently)
// ==============================================================================
const PolicyClarificationSchema = new mongoose.Schema({
  itemKey: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true },
  sourceSection: { type: String, required: true }, // e.g. "Section 6.3 vs Section 10.2"
  issueDescription: { type: String, required: true },
  interimRule: { type: String, required: true },
  activeRuleValue: { type: mongoose.Schema.Types.Mixed, required: true },
  responsibleReviewer: { type: String, default: 'Head – HR & Legal Counsel' },
  reviewStatus: {
    type: String,
    enum: ['INTERIM_CONFIGURED', 'PENDING_LEGAL_CONFIRMATION', 'FORMALLY_AMENDED'],
    default: 'INTERIM_CONFIGURED'
  },
  approvedDecision: { type: String, default: 'Applied interim safe configuration as documented' },
  effectiveDate: { type: Date, default: new Date('2026-04-01') },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// ==============================================================================
// 11. VERSION-CONTROLLED LEAVE POLICY MASTER MODEL
// Specification Section 2 & 11
// ==============================================================================
const LeavePolicySchema = new mongoose.Schema({
  policyNumber: { type: String, required: true, unique: true, default: 'BJK-HR-POL-001' },
  title: { type: String, default: 'BJK Healthcare Leave Policy' },
  version: { type: String, default: '1.0' },
  effectiveDate: { type: Date, default: new Date('2026-04-01') },
  owner: { type: String, default: 'Head – Human Resources' },
  approvalAuthority: { type: String, default: 'Managing Director' },
  status: { type: String, enum: ['ACTIVE', 'DRAFT', 'SUPERSEDED'], default: 'ACTIVE' },
  rules: {
    earnedLeave: {
      annualEntitlementDays: { type: Number, default: 7 },
      monthlyAccrualRate: { type: Number, default: 0.58 },
      minConsecutiveDays: { type: Number, default: 3 },
      maxNormalDurationDays: { type: Number, default: 15 },
      minNoticeDays3To4: { type: Number, default: 7 },
      minNoticeDays5Plus: { type: Number, default: 15 },
      maxAccumulationDays: { type: Number, default: 50 },
      carryForwardPercentage: { type: Number, default: 50 },
      minBalanceToApply: { type: Number, default: 2 }
    },
    casualLeave: {
      annualEntitlementDays: { type: Number, default: 7 },
      monthlyAccrualRate: { type: Number, default: 0.58 },
      maxConsecutiveDays: { type: Number, default: 2 },
      minNoticeHours: { type: Number, default: 24 },
      carryForwardAllowed: { type: Boolean, default: false },
      encashmentAllowed: { type: Boolean, default: false }
    },
    sickLeave: {
      annualEntitlementDays: { type: Number, default: 4 },
      creditSchedule: { type: String, default: 'ANNUAL_JAN_1' },
      doctorCertThresholdDays: { type: Number, default: 3 },
      fitnessCertThresholdDays: { type: Number, default: 4 },
      emergencyNoticeHours: { type: Number, default: 2 },
      carryForwardAllowed: { type: Boolean, default: false }
    },
    compOff: {
      fullDayHoursMin: { type: Number, default: 8 },
      halfDayHoursMin: { type: Number, default: 4 },
      validityDays: { type: Number, default: 90 },
      minNoticeDays: { type: Number, default: 3 },
      requirePreApproval: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Export all models
const LeavePolicy = mongoose.models.LeavePolicy || mongoose.model('LeavePolicy', LeavePolicySchema);
const CompOffWorkAuthorization = mongoose.models.CompOffWorkAuthorization || mongoose.model('CompOffWorkAuthorization', CompOffWorkAuthorizationSchema);
const CompOffCredit = mongoose.models.CompOffCredit || mongoose.model('CompOffCredit', CompOffCreditSchema);
const LeaveBlackoutPeriod = mongoose.models.LeaveBlackoutPeriod || mongoose.model('LeaveBlackoutPeriod', LeaveBlackoutPeriodSchema);
const DepartmentStaffingThreshold = mongoose.models.DepartmentStaffingThreshold || mongoose.model('DepartmentStaffingThreshold', DepartmentStaffingThresholdSchema);
const LeaveRefresherTraining = mongoose.models.LeaveRefresherTraining || mongoose.model('LeaveRefresherTraining', LeaveRefresherTrainingSchema);
const MedicalFitnessRecord = mongoose.models.MedicalFitnessRecord || mongoose.model('MedicalFitnessRecord', MedicalFitnessRecordSchema);
const LeaveEncashmentRequest = mongoose.models.LeaveEncashmentRequest || mongoose.model('LeaveEncashmentRequest', LeaveEncashmentRequestSchema);
const LeaveRegularizationRequest = mongoose.models.LeaveRegularizationRequest || mongoose.model('LeaveRegularizationRequest', LeaveRegularizationRequestSchema);
const LeaveGrievance = mongoose.models.LeaveGrievance || mongoose.model('LeaveGrievance', LeaveGrievanceSchema);
const PolicyClarification = mongoose.models.PolicyClarification || mongoose.model('PolicyClarification', PolicyClarificationSchema);

module.exports = {
  LeavePolicy,
  CompOffWorkAuthorization,
  CompOffCredit,
  LeaveBlackoutPeriod,
  DepartmentStaffingThreshold,
  LeaveRefresherTraining,
  MedicalFitnessRecord,
  LeaveEncashmentRequest,
  LeaveRegularizationRequest,
  LeaveGrievance,
  PolicyClarification
};
