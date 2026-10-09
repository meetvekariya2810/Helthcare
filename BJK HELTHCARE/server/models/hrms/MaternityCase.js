const mongoose = require('mongoose');

// ==============================================================================
// Maternity & Paternity Case Model (BJK-HR-POL-016 / conflict ref: POL-011)
// ==============================================================================
const MaternityCaseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true, uppercase: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true, uppercase: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  gender: { type: String, enum: ['Female', 'Male'], required: true },
  
  leaveType: {
    type: String,
    enum: ['MATERNITY', 'PATERNITY'],
    required: true
  },
  
  // Specific Scenario
  scenario: {
    type: String,
    enum: [
      'NATURAL_BIRTH_FIRST_OR_SECOND_CHILD', // 26 weeks (182 days)
      'NATURAL_BIRTH_THIRD_CHILD_ONWARDS',   // 12 weeks (84 days)
      'LEGAL_ADOPTION_UNDER_3_MONTHS',       // 12 weeks
      'SURROGACY_COMMISSIONING_MOTHER',      // 12 weeks
      'MISCARRIAGE_MEDICAL_TERMINATION',     // 6 weeks (42 days)
      'STILLBIRTH_POST_20_WEEKS',            // 12 weeks + EAP
      'PREGNANCY_RELATED_ILLNESS',           // Additional 1 month
      'TUBECTOMY_PROCEDURE',                 // 2 weeks (14 days)
      'PATERNITY_LEAVE'                      // 15 calendar days (within 60 days)
    ],
    required: true
  },

  childrenCountPrior: { type: Number, default: 0 },
  expectedDeliveryDate: { type: Date, default: null },
  actualDeliveryOrEventDate: { type: Date, default: null },

  // Statutory Eligibility Check (Minimum 80 days employment in preceding 12 months)
  daysWorkedInPreceding12Months: { type: Number, default: 80 },
  isStatutorilyEligible: { type: Boolean, default: true },

  // Entitlement Calculated by Policy Engine
  entitledDays: { type: Number, required: true }, // e.g. 182, 84, 42, 15
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  trancheNumber: { type: Number, default: 1 }, // Paternity can split into max 2 tranches

  // GMP Cleanroom / Manufacturing Provisions
  isGMPPersonnel: { type: Boolean, default: false },
  riskAssessmentConducted: { type: Boolean, default: false },
  hazardReassignmentGranted: { type: Boolean, default: false },
  hazardReassignmentDetails: { type: String, default: '' },
  modifiedPPERequired: { type: Boolean, default: false },
  flexibleHoursArrangement: { type: String, default: '' },
  medicalClearanceSubmittedForGMPReturn: { type: Boolean, default: false },
  medicalClearanceCertUrl: { type: String, default: '' },

  // Nursing & Childcare Provisions
  nursingBreaksActive: { type: Boolean, default: false },
  nursingBreaksDetails: { type: String, default: '2 nursing breaks/day until child reaches 15 months' },
  childFifteenMonthsDate: { type: Date, default: null },
  crecheFacilityAccess: { type: Boolean, default: false },

  // Legal Protections
  protectionAffirmed: { 
    type: Boolean, 
    default: true,
    description: 'Protection from termination, right to equivalent role, appraisal increment non-withholding'
  },
  compensationType: {
    type: String,
    enum: ['FULL_COMPANY_SALARY', 'ESIC_CASH_PLUS_COMPANY_TOPUP'],
    default: 'FULL_COMPANY_SALARY'
  },

  status: {
    type: String,
    enum: ['APPLIED', 'APPROVED', 'ON_LEAVE', 'RETURNED_TO_WORK', 'COMPLETED', 'REJECTED'],
    default: 'APPLIED'
  },
  approvedBy: { type: String, default: 'HR Head' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

MaternityCaseSchema.index({ employeeId: 1 });
MaternityCaseSchema.index({ status: 1 });

module.exports = {
  MaternityCase: mongoose.models.MaternityCase || mongoose.model('MaternityCase', MaternityCaseSchema)
};
