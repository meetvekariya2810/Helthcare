const mongoose = require('mongoose');

// ==============================================================================
// 1. ICC Committee Master Model (POSH Internal Complaints Committee)
// ==============================================================================
const ICCMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  roleInICC: {
    type: String,
    enum: ['PRESIDING_OFFICER', 'INTERNAL_MEMBER', 'EXTERNAL_MEMBER_NGO'],
    required: true
  },
  gender: { type: String, enum: ['Female', 'Male', 'Other'], required: true },
  designation: { type: String, default: '' },
  organization: { type: String, default: 'BJK Healthcare Pvt. Ltd.' },
  tenureStartDate: { type: Date, default: new Date('2026-04-01') },
  tenureEndDate: { type: Date, default: new Date('2029-03-31') }, // 3-year statutory tenure
  isActive: { type: Boolean, default: true }
}, { _id: true });

const ICCCommitteeSchema = new mongoose.Schema({
  committeeTitle: { type: String, default: 'BJK Healthcare Internal Complaints Committee (ICC)' },
  facility: { type: String, default: 'ALL Facilities / Headquarters' },
  members: [ICCMemberSchema],
  womenPercentage: { type: Number, default: 60 }, // Statutory >= 50%
  tenureYears: { type: Number, default: 3 },
  effectiveDate: { type: Date, default: new Date('2026-04-01') },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// ==============================================================================
// 2. POSH Case Model (Strict Confidentiality - BJK-HR-POL-012)
// ==============================================================================
const POSHCaseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. "POSH-2026-001"
  registrationDate: { type: Date, default: Date.now },
  filingChannel: {
    type: String,
    enum: ['WRITTEN_COMPLAINT', 'EMAIL', 'COMPLAINT_FORM', 'THIRD_PARTY_REPRESENTATIVE'],
    default: 'WRITTEN_COMPLAINT'
  },
  
  // Incident & Category
  category: {
    type: String,
    enum: [
      'PHYSICAL_CONTACT_ADVANCES',
      'DEMAND_REQUEST_SEXUAL_FAVORS',
      'SEXUALLY_COLOURED_REMARKS',
      'SHOWING_PORNOGRAPHY',
      'UNWELCOME_CONDUCT_OF_SEXUAL_NATURE',
      'QUID_PRO_QUO',
      'HOSTILE_WORK_ENVIRONMENT'
    ],
    required: true
  },
  incidentDate: { type: Date, required: true },
  incidentLocation: { type: String, default: '' },
  incidentDescription: { type: String, required: true },
  copiesSubmitted: { type: Number, default: 6 }, // 6 copies required by statutory procedure

  // Restricted Identity Fields (Handled on Strict Need-to-Know Basis)
  complainantRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  complainantCode: { type: String, default: 'CONFIDENTIAL-COMPLAINANT' },
  complainantDepartment: { type: String, default: '' },
  
  respondentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  respondentCode: { type: String, default: 'CONFIDENTIAL-RESPONDENT' },
  respondentDepartment: { type: String, default: '' },

  // Statutory 90-day Inquiry Timeline Milestones
  respondentNoticeDate: { type: Date, default: null }, // within 7 days of complaint
  respondentReplyDueDate: { type: Date, default: null }, // within 10 days of notice
  respondentReplyReceivedDate: { type: Date, default: null },
  inquiryDeadlineDate: { type: Date, default: null }, // within 90 days of registration
  inquiryCompletionDate: { type: Date, default: null },
  reportSubmissionDate: { type: Date, default: null }, // within 10 days of inquiry completion

  // Interim Relief
  interimReliefGranted: { type: Boolean, default: false },
  interimReliefDetails: {
    type: String,
    enum: ['NONE', 'TRANSFER_OF_RESPONDENT', 'WORK_FROM_HOME', 'LEAVE_GRANTED_TO_COMPLAINANT', 'OTHER'],
    default: 'NONE'
  },
  interimReliefNotes: { type: String, default: '' },

  // Inquiry Proceedings & Outcome
  inquiryStatus: {
    type: String,
    enum: [
      'RECEIVED_REGISTERED',
      'NOTICE_SERVED_TO_RESPONDENT',
      'REPLY_RECEIVED',
      'CONCILIATION_OFFERED',
      'FORMAL_INQUIRY_IN_PROGRESS',
      'INQUIRY_COMPLETED',
      'REPORT_SUBMITTED_TO_MANAGEMENT',
      'CLOSED'
    ],
    default: 'RECEIVED_REGISTERED'
  },
  findingOutcome: {
    type: String,
    enum: ['PENDING', 'PROVED', 'NOT_PROVED', 'MALICIOUS_COMPLAINT_FOUND'],
    default: 'PENDING'
  },
  recommendationSummary: { type: String, default: '' },
  disciplinaryActionTaken: { type: String, default: '' },
  compensationAwarded: { type: Number, default: 0 },
  
  confidentialityAffidavitSigned: { type: Boolean, default: true },
  zeroRetaliationMonitoringActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

POSHCaseSchema.index({ inquiryStatus: 1 });

module.exports = {
  ICCCommittee: mongoose.models.ICCCommittee || mongoose.model('ICCCommittee', ICCCommitteeSchema),
  POSHCase: mongoose.models.POSHCase || mongoose.model('POSHCase', POSHCaseSchema)
};
