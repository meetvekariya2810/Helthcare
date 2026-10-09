const mongoose = require('mongoose');

// ==============================================================================
// 1. Diversity & Inclusion Metric Dashboard Snapshot Model (BJK-HR-POL-013)
// ==============================================================================
const DiversityMetricSchema = new mongoose.Schema({
  year: { type: Number, required: true, default: 2026 },
  quarter: { type: String, required: true, default: 'Q1' },
  
  // Statutory & Company Targets
  womenWorkforcePercentage: { type: Number, required: true }, // Current ~18%, Target: 30% by 2030
  womenLeadershipPercentage: { type: Number, required: true }, // Target: 25% by 2030
  personsWithDisabilitiesPercentage: { type: Number, required: true }, // Target: 4% by 2030 (RPDA)
  genderPayGapPercentage: { type: Number, required: true }, // Target: 0% by 2028
  
  totalHeadcount: { type: Number, default: 0 },
  femaleCount: { type: Number, default: 0 },
  maleCount: { type: Number, default: 0 },
  otherGenderCount: { type: Number, default: 0 },
  pwdCount: { type: Number, default: 0 },
  
  // Audits & Initiatives
  payEquityAuditConducted: { type: Boolean, default: true },
  payEquityAuditDate: { type: Date, default: new Date('2026-03-31') },
  blindResumeScreeningActive: { type: Boolean, default: true },
  diverseInterviewPanelsActive: { type: Boolean, default: true },
  
  activeERGs: [{
    groupName: { type: String }, // 'Women in Pharma Network', 'Ability Network', 'Pride Alliance'
    memberCount: { type: Number, default: 0 },
    leadName: { type: String }
  }],

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ==============================================================================
// 2. Workplace Accommodation Request Model (RPDA / Equal Opportunity)
// ==============================================================================
const AccommodationRequestSchema = new mongoose.Schema({
  requestCode: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  accommodationType: {
    type: String,
    enum: [
      'PHYSICAL_ACCESSIBILITY_RAMP_ELEVATOR',
      'ERGONOMIC_WORKSTATION',
      'ASSISTIVE_TECHNOLOGY_SCREEN_READER',
      'FLEXIBLE_HOURS_SCHEDULE',
      'REST_BREAK_ADJUSTMENT',
      'OTHER_REASONABLE_ACCOMMODATION'
    ],
    required: true
  },
  medicalJustification: { type: String, default: '' },
  requestDetails: { type: String, required: true },
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_ASSESSMENT', 'APPROVED_IMPLEMENTED', 'DECLINED_UNREASONABLE_BURDEN'],
    default: 'SUBMITTED'
  },
  reviewedBy: { type: String, default: 'D&I Committee & Facilities Officer' },
  implementationDate: { type: Date, default: null },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = {
  DiversityMetric: mongoose.models.DiversityMetric || mongoose.model('DiversityMetric', DiversityMetricSchema),
  AccommodationRequest: mongoose.models.AccommodationRequest || mongoose.model('AccommodationRequest', AccommodationRequestSchema)
};
