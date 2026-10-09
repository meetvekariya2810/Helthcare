const mongoose = require('mongoose');

const OnboardingApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'ONB-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employeeId: { type: String, trim: true, uppercase: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },

  currentStep: { type: Number, default: 1, min: 1, max: 12 },
  completionPercentage: { type: Number, default: 0 },
  status: {
    type: String,
    enum: [
      'DRAFT',
      'SUBMITTED',
      'HR_REVIEW',
      'DOCUMENT_VERIFICATION',
      'BANK_VERIFICATION',
      'IDENTITY_VERIFICATION',
      'DEPARTMENT_APPROVAL',
      'HR_APPROVAL',
      'ACTIVE',
      'REJECTED'
    ],
    default: 'DRAFT'
  },

  // Complete payload snapshot stored progressively across steps
  formData: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Stage Verification Flags
  verifications: {
    documentsVerified: { type: Boolean, default: false },
    documentsVerifiedBy: { type: String, default: '' },
    documentsVerifiedAt: { type: Date, default: null },

    bankVerified: { type: Boolean, default: false },
    bankVerifiedBy: { type: String, default: '' },
    bankVerifiedAt: { type: Date, default: null },

    identityVerified: { type: Boolean, default: false },
    identityVerifiedBy: { type: String, default: '' },
    identityVerifiedAt: { type: Date, default: null },

    departmentApproved: { type: Boolean, default: false },
    departmentApprovedBy: { type: String, default: '' },
    departmentApprovedAt: { type: Date, default: null },

    hrApproved: { type: Boolean, default: false },
    hrApprovedBy: { type: String, default: '' },
    hrApprovedAt: { type: Date, default: null }
  },

  // Audit and Notes
  submittedAt: { type: Date, default: null },
  approvedAt: { type: Date, default: null },
  rejectedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
  hrNotes: { type: String, default: '' },

  assignedHR: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedHRName: { type: String, default: 'HR Master Admin' },
  createdBy: { type: String, default: 'HR Administrator' },
  lastAutoSavedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

OnboardingApplicationSchema.index({ employeeId: 1 });
OnboardingApplicationSchema.index({ status: 1 });
OnboardingApplicationSchema.index({ updatedAt: -1 });

module.exports = mongoose.models.OnboardingApplication || mongoose.model('OnboardingApplication', OnboardingApplicationSchema);
