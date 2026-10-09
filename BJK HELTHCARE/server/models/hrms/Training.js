const mongoose = require('mongoose');

// 1. Training Program Catalogue
const TrainingProgramSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, unique: true },
  category: {
    type: String,
    enum: ['GMP', 'GLP', 'GDP', 'SOP_COMPLIANCE', 'EHS_SAFETY', 'DATA_INTEGRITY', 'QUALITY_SYSTEMS', 'REGULATORY', 'TECHNICAL_EQUIPMENT', 'LEADERSHIP'],
    required: true
  },
  description: { type: String, default: '' },
  isMandatory: { type: Boolean, default: true },
  mandatoryForDepartments: [{ type: String }], // e.g. ['Production', 'Quality Control', 'Quality Assurance']
  mandatoryForDesignations: [{ type: String }],
  validityPeriodMonths: { type: Number, default: 12 }, // Retraining cycle (e.g. annual GMP retraining)
  passingScorePercentage: { type: Number, default: 80 },
  durationHours: { type: Number, default: 4 },
  trainer: { type: String, default: 'BJK Quality & Compliance Academy' },
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// 2. Training Enrollment & Completion Records
const TrainingEnrollmentSchema = new mongoose.Schema({
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingProgram', required: true },
  programCode: { type: String, required: true },
  programTitle: { type: String, required: true },
  category: { type: String, required: true },
  
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },

  enrolledDate: { type: Date, default: Date.now },
  completionDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  
  status: {
    type: String,
    enum: ['ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'FAILED', 'EXPIRED'],
    default: 'ENROLLED'
  },
  
  scorePercentage: { type: Number, default: null },
  certificateNumber: { type: String, default: null },
  certificateUrl: { type: String, default: null },
  verifiedBy: { type: String, default: '' },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

TrainingEnrollmentSchema.index({ employee: 1, program: 1 });
TrainingEnrollmentSchema.index({ status: 1 });
TrainingEnrollmentSchema.index({ expiryDate: 1 });
TrainingEnrollmentSchema.index({ category: 1 });

const TrainingProgram = mongoose.models.TrainingProgram || mongoose.model('TrainingProgram', TrainingProgramSchema);
const TrainingEnrollment = mongoose.models.TrainingEnrollment || mongoose.model('TrainingEnrollment', TrainingEnrollmentSchema);

module.exports = { TrainingProgram, TrainingEnrollment };
