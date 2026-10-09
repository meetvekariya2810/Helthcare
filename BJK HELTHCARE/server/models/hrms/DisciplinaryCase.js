const mongoose = require('mongoose');

// ==============================================================================
// 1. Disciplinary Case Model (BJK-HR-POL-004 Disciplinary Action Policy)
// ==============================================================================
const DisciplinaryCaseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true, uppercase: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  
  // 3 Categories of Misconduct
  misconductCategory: {
    type: String,
    enum: ['MINOR', 'MAJOR', 'GROSS'],
    required: true
  },
  incidentDate: { type: Date, required: true },
  description: { type: String, required: true },
  evidenceUrls: [{ type: String }],
  witnesses: [{ type: String }],
  
  // 6-Step Progressive Discipline Level
  currentStep: {
    type: Number,
    min: 1,
    max: 6,
    default: 1
    // 1: Verbal Warning (Counseling) - 30 days
    // 2: Written Warning (1st) - 6 months
    // 3: Final Written Warning - 12 months
    // 4: Suspension (3-7 days)
    // 5: Demotion or Transfer
    // 6: Termination
  },
  stepLabel: {
    type: String,
    enum: [
      'VERBAL_WARNING',
      'WRITTEN_WARNING',
      'FINAL_WRITTEN_WARNING',
      'SUSPENSION',
      'DEMOTION_TRANSFER',
      'TERMINATION'
    ],
    default: 'VERBAL_WARNING'
  },

  // Bypass step allowed for gross misconduct / GMP data falsification / immediate threat
  isStepBypassed: { type: Boolean, default: false },
  bypassJustification: { type: String, default: '' },

  // GMP Specific Flag
  isGMPViolation: { type: Boolean, default: false },
  gmpViolationType: {
    type: String,
    enum: ['NONE', 'NEGLIGENCE_DEVIATION', 'DATA_INTEGRITY_FALSIFICATION', 'CONTAMINATION_RISK', 'HYGIENE_BREACH'],
    default: 'NONE'
  },
  capaReferenceNumber: { type: String, default: '' },
  retrainingRequired: { type: Boolean, default: false },
  retrainingCompleted: { type: Boolean, default: false },

  // Natural Justice & Hearing Process
  explanationRequestedDate: { type: Date, default: null },
  employeeExplanation: { type: String, default: '' },
  explanationSubmittedDate: { type: Date, default: null },
  inquiryOfficer: { type: String, default: '' },
  inquiryFindings: { type: String, default: '' },

  // Outcome & Approval
  issuedByRole: { type: String, default: 'Supervisor / Manager' },
  issuedByName: { type: String, default: '' },
  validityExpiryDate: { type: Date, default: null },
  suspensionDays: { type: Number, default: 0 },
  finalActionSummary: { type: String, default: '' },
  managingDirectorApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: String, default: '' },
    approvedAt: { type: Date, default: null },
    remarks: { type: String, default: '' }
  },

  status: {
    type: String,
    enum: ['REPORTED', 'INQUIRY_IN_PROGRESS', 'ACTION_ISSUED', 'APPEALED', 'CLOSED'],
    default: 'REPORTED'
  },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

DisciplinaryCaseSchema.index({ employeeId: 1 });
DisciplinaryCaseSchema.index({ status: 1 });

// ==============================================================================
// 2. Whistleblower & Ethics Grievance Model (BJK-HR-POL-003 Code of Conduct)
// ==============================================================================
const WhistleblowerCaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, uppercase: true },
  isAnonymous: { type: Boolean, default: true },
  reporterName: { type: String, default: 'ANONYMOUS' },
  reporterContact: { type: String, default: '' },
  reporterRole: { type: String, default: '' },
  
  channel: {
    type: String,
    enum: ['ANONYMOUS_PORTAL', 'HR_DIRECT', 'REPORTING_MANAGER', 'HOTLINE'],
    default: 'ANONYMOUS_PORTAL'
  },
  concernType: {
    type: String,
    enum: [
      'BRIBERY_CORRUPTION',
      'GMP_DATA_FALSIFICATION',
      'THEFT_FRAUD',
      'HARASSMENT_DISCRIMINATION',
      'SAFETY_VIOLATION',
      'CONFLICT_OF_INTEREST',
      'UNAUTHORIZED_DISCLOSURE',
      'OTHER_ETHICS_VIOLATION'
    ],
    required: true
  },
  allegationDetails: { type: String, required: true },
  accusedPersons: [{ type: String }],
  incidentDate: { type: Date, default: null },
  evidenceUrls: [{ type: String }],
  
  assignedInvestigator: { type: String, default: 'Head of Compliance / Internal Auditor' },
  investigationStatus: {
    type: String,
    enum: ['RECEIVED', 'UNDER_INVESTIGATION', 'HEARING_COMPLETED', 'SUBSTANTIATED', 'UNSUBSTANTIATED', 'CLOSED'],
    default: 'RECEIVED'
  },
  investigationReport: { type: String, default: '' },
  antiRetaliationProtectionsActive: { type: Boolean, default: true },
  actionTaken: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

WhistleblowerCaseSchema.index({ investigationStatus: 1 });

module.exports = {
  DisciplinaryCase: mongoose.models.DisciplinaryCase || mongoose.model('DisciplinaryCase', DisciplinaryCaseSchema),
  WhistleblowerCase: mongoose.models.WhistleblowerCase || mongoose.model('WhistleblowerCase', WhistleblowerCaseSchema)
};
