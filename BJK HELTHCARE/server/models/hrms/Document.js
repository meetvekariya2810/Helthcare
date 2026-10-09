const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeId: { type: String, default: '' },
  employeeName: { type: String, default: '' },
  
  category: {
    type: String,
    enum: [
      'IDENTITY_PROOF',
      'ADDRESS_PROOF',
      'EDUCATION_CERTIFICATE',
      'EXPERIENCE_LETTER',
      'OFFER_APPOINTMENT',
      'GMP_CERTIFICATION',
      'MEDICAL_FITNESS',
      'NDA_CONFIDENTIALITY',
      'COMPANY_POLICY',
      'PAYSLIP_ARCHIVE',
      'TRAINING_CERTIFICATE',
      'INCREMENT_LETTER',
      'DISCIPLINARY',
      'RELIEVING_LETTER'
    ],
    required: true
  },
  
  digitalSignature: {
    signedBy: { type: String, default: '' },
    signatureDate: { type: Date, default: null },
    sha256Hash: { type: String, default: '' },
    is21CFRPart11Compliant: { type: Boolean, default: true }
  },
  
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'application/pdf' },
  fileSizeKB: { type: Number, default: 0 },
  
  status: {
    type: String,
    enum: ['UPLOADED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED'],
    default: 'PENDING_VERIFICATION'
  },
  
  expiryDate: { type: Date, default: null },
  verifiedBy: { type: String, default: '' },
  verifiedAt: { type: Date, default: null },
  version: { type: Number, default: 1 },
  rejectionReason: { type: String, default: '' },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

DocumentSchema.index({ employee: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ status: 1 });

module.exports = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
