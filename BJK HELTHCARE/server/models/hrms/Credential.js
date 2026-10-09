const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  
  credentialName: { type: String, required: true }, // e.g. "GMP Cleanroom Level 3 Certification", "HPLC Analytical Sign-off"
  credentialCode: { type: String, required: true, uppercase: true },
  category: {
    type: String,
    enum: [
      'QUALIFICATION',
      'GMP_CERTIFICATION',
      'GLP_CERTIFICATION',
      'GDP_CERTIFICATION',
      'SAFETY_CERTIFICATION',
      'EQUIPMENT_AUTHORIZATION',
      'ROLE_AUTHORIZATION',
      'CLEANROOM_AUTHORIZATION',
      'MEDICAL_FITNESS'
    ],
    required: true
  },
  issuingAuthority: { type: String, required: true }, // e.g. "BJK QA Board", "Pharmacy Council of India", "NABL"
  certificateNumber: { type: String, default: '' },
  issueDate: { type: Date, required: true },
  expiryDate: { type: Date, default: null }, // Some certifications don't expire, others do
  
  isMandatoryForRole: { type: Boolean, default: true },
  blocksRosterAssignmentOnExpiry: { type: Boolean, default: true },

  status: {
    type: String,
    enum: ['VALID', 'EXPIRING', 'EXPIRED', 'PENDING_VERIFICATION', 'REVOKED'],
    default: 'VALID'
  },
  
  daysUntilExpiry: { type: Number, default: null },
  documentUrl: { type: String, default: '' },
  verifiedBy: { type: String, default: '' },
  verifiedAt: { type: Date, default: null },
  notes: { type: String, default: '' },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

CredentialSchema.index({ employee: 1 });
CredentialSchema.index({ status: 1 });
CredentialSchema.index({ expiryDate: 1 });
CredentialSchema.index({ isMandatoryForRole: 1, status: 1 });

module.exports = mongoose.models.Credential || mongoose.model('Credential', CredentialSchema);
