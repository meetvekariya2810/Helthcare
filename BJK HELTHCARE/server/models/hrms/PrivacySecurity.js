const mongoose = require('mongoose');

// ==============================================================================
// 1. Data Privacy Subject Rights Request (DPDP Act 2023 - BJK-HR-POL-014)
// ==============================================================================
const PrivacyRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true, uppercase: true }, // e.g. "DSR-2026-001"
  dataSubjectEmployeeId: { type: String, required: true },
  dataSubjectName: { type: String, required: true },
  requestType: {
    type: String,
    enum: [
      'RIGHT_TO_ACCESS_SUMMARY',
      'RIGHT_TO_CORRECTION_RECTIFICATION',
      'RIGHT_TO_ERASURE_FORGET',
      'RIGHT_TO_NOMINATION',
      'GRIEVANCE_REDRESSAL_DPO'
    ],
    required: true
  },
  details: { type: String, required: true },
  dataClassificationInvolved: {
    type: String,
    enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
    default: 'CONFIDENTIAL'
  },
  status: {
    type: String,
    enum: ['RECEIVED', 'VERIFYING_IDENTITY', 'PROCESSING', 'RESOLVED_FULFILLED', 'REJECTED_LEGAL_OVERRIDE'],
    default: 'RECEIVED'
  },
  dpoRemarks: { type: String, default: '' },
  assignedDPO: { type: String, default: 'Data Protection Officer (dpo@bjkhealthcare.com)' },
  statutoryDeadlineDate: { type: Date, default: null }, // DPDP timeline
  resolvedDate: { type: Date, default: null },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ==============================================================================
// 2. Data Breach Incident Model (DPDP Act 24h / 72h Timelines)
// ==============================================================================
const DataBreachSchema = new mongoose.Schema({
  breachId: { type: String, required: true, unique: true, uppercase: true }, // e.g. "BREACH-2026-001"
  reportedDateTime: { type: Date, default: Date.now },
  detectionDateTime: { type: Date, required: true },
  
  // 24-hour IT + DPO internal reporting SLA
  reportedToDPOWithin24Hours: { type: Boolean, default: true },
  dpoNotificationTime: { type: Date, default: Date.now },
  
  natureOfBreach: { type: String, required: true },
  affectedDataClassification: {
    type: String,
    enum: ['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED_GMP_RND', 'RESTRICTED_BIOMETRIC_HEALTH'],
    required: true
  },
  estimatedAffectedRecords: { type: Number, default: 0 },
  
  // DPDP Board Notification (Statutory within 72 hours)
  dpbNotificationRequired: { type: Boolean, default: false },
  dpbNotificationDueDate72h: { type: Date, default: null },
  dpbNotifiedDate: { type: Date, default: null },
  affectedIndividualsNotified: { type: Boolean, default: false },

  // Containment & Recovery Workflow: Detect -> Contain -> Investigate -> Notify -> Recover -> Review
  workflowStage: {
    type: String,
    enum: ['DETECTED', 'CONTAINED', 'INVESTIGATING', 'NOTIFIED', 'RECOVERED', 'POST_INCIDENT_REVIEW'],
    default: 'DETECTED'
  },
  rootCause: { type: String, default: '' },
  containmentActions: { type: String, default: '' },
  resolutionSummary: { type: String, default: '' },
  responseTeamLead: { type: String, default: 'DPO & IT Security Head' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ==============================================================================
// 3. IT & Information Security Incident Model (BJK-HR-POL-015)
// ==============================================================================
const SecurityIncidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true, uppercase: true }, // e.g. "SEC-2026-001"
  reportedAt: { type: Date, default: Date.now },
  reportedWithinOneHour: { type: Boolean, default: true }, // Policy: report within 1 hour to IT Security
  
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL_P1_GMP'],
    required: true
  },
  ciaImpact: [{
    type: String,
    enum: ['CONFIDENTIALITY', 'INTEGRITY', 'AVAILABILITY']
  }],
  category: {
    type: String,
    enum: [
      'MALWARE_RANSOMWARE',
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      'CREDENTIAL_COMPROMISE',
      'SHADOW_IT_USE',
      'UNAUTHORIZED_USB_DEVICE',
      'EMAIL_AUTO_FORWARD_VIOLATION',
      'DATA_EXFILTRATION',
      'SYSTEM_OUTAGE'
    ],
    required: true
  },
  affectedSystems: [{ type: String }], // e.g. ["GMP Manufacturing Execution System", "ERP"]
  priorityTier: {
    type: String,
    enum: ['P1_GMP_SYSTEMS_RTO_4_8_HRS', 'P2_EMAIL_HR_RTO_24_HRS', 'P3_SUPPORT_SYSTEMS'],
    default: 'P2_EMAIL_HR_RTO_24_HRS'
  },

  // Statutory CERT-In Notification (within 6 hours)
  certInNotificationRequired: { type: Boolean, default: false },
  certInNotifiedTime: { type: Date, default: null },

  // Incident Lifecycle: Detect -> Contain -> Eradicate -> Recover -> Review
  status: {
    type: String,
    enum: ['DETECTED', 'CONTAINED', 'ERADICATED', 'RECOVERED', 'REVIEW_CLOSED'],
    default: 'DETECTED'
  },
  containmentDetails: { type: String, default: '' },
  eradicationDetails: { type: String, default: '' },
  capaPlan: { type: String, default: '' },
  incidentLead: { type: String, default: 'CISO / IT Security Head' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = {
  PrivacyRequest: mongoose.models.PrivacyRequest || mongoose.model('PrivacyRequest', PrivacyRequestSchema),
  DataBreach: mongoose.models.DataBreach || mongoose.model('DataBreach', DataBreachSchema),
  SecurityIncident: mongoose.models.SecurityIncident || mongoose.model('SecurityIncident', SecurityIncidentSchema)
};
