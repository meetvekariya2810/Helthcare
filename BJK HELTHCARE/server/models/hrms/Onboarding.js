const mongoose = require('mongoose');

const OnboardingSchema = new mongoose.Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', default: null },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  candidateName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  departmentName: { type: String, required: true },
  designationTitle: { type: String, required: true },
  facility: { type: String, default: 'BJK Unit 1 - Formulations Facility' },
  targetJoiningDate: { type: Date, required: true },
  
  status: {
    type: String,
    enum: ['OFFER_ACCEPTED', 'DOCUMENTATION', 'VERIFICATION', 'INDUCTION', 'COMPLETED'],
    default: 'OFFER_ACCEPTED'
  },
  
  checklist: [{
    taskKey: { type: String, required: true },
    title: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['IDENTITY', 'DOCUMENTS', 'HR_SETUP', 'IT_PROVISIONING', 'FACILITY_ACCESS', 'GMP_TRAINING', 'SAFETY_INDUCTION'],
      default: 'DOCUMENTS' 
    },
    isMandatory: { type: Boolean, default: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: '' },
    notes: { type: String, default: '' }
  }],

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

OnboardingSchema.index({ email: 1 });
OnboardingSchema.index({ status: 1 });

module.exports = mongoose.models.Onboarding || mongoose.model('Onboarding', OnboardingSchema);
