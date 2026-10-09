const mongoose = require('mongoose');

const HRComplianceSchema = new mongoose.Schema({
  ruleTitle: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, unique: true },
  standard: {
    type: String,
    enum: ['GMP', 'GLP', 'GDP', 'SCHEDULE_M', 'USFDA_21CFR', 'WHO_TRS', 'ISO_9001', 'FACTORY_ACT', 'SAFETY_EHS'],
    required: true
  },
  departmentApplicability: [{ type: String }],
  description: { type: String, default: '' },
  
  requirementDetails: {
    mandatoryTrainingCode: { type: String, default: '' },
    mandatoryCredentialCode: { type: String, default: '' },
    medicalFitnessRequired: { type: Boolean, default: false },
    cleanroomSopSigned: { type: Boolean, default: false }
  },

  complianceAuditStatus: {
    type: String,
    enum: ['COMPLIANT', 'WARNING', 'NON_COMPLIANT', 'PENDING_AUDIT'],
    default: 'COMPLIANT'
  },
  lastAuditedDate: { type: Date, default: Date.now },
  auditedBy: { type: String, default: 'Internal Quality Assurance' },
  findingsCount: { type: Number, default: 0 },
  actionPlan: { type: String, default: '' },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

HRComplianceSchema.index({ standard: 1 });
HRComplianceSchema.index({ complianceAuditStatus: 1 });

module.exports = mongoose.models.HRCompliance || mongoose.model('HRCompliance', HRComplianceSchema);
