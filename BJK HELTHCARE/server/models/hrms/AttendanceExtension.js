const mongoose = require('mongoose');

// ==============================================================================
// 1. GMP Shift Handover Log (BJK-HR-POL-002 Attendance & Punctuality)
// ==============================================================================
const ShiftHandoverLogSchema = new mongoose.Schema({
  logNumber: { type: String, required: true, unique: true, uppercase: true }, // e.g. "HO-2026-001"
  shiftDate: { type: Date, required: true },
  outgoingShift: { type: String, required: true }, // "Shift A (Day)"
  incomingShift: { type: String, required: true }, // "Shift B (Evening)"
  facility: { type: String, default: 'BJK Unit 1 - Formulations Facility' },
  manufacturingLineOrArea: { type: String, required: true }, // "Tablet Compression Line 2"
  
  // Mandatory face-to-face 30-min overlap check
  overlapMinutesAchieved: { type: Number, required: true, default: 30 },
  isHandoverFaceToFace: { type: Boolean, default: true },
  
  // GMP Batch & Quality Review
  ongoingBatches: [{
    batchNumber: { type: String },
    productName: { type: String },
    currentStage: { type: String },
    yieldStatus: { type: String }
  }],
  deviationsReported: [{
    deviationNumber: { type: String },
    natureOfDeviation: { type: String }
  }],
  oosResultsPending: [{
    sampleId: { type: String },
    parameter: { type: String }
  }],
  environmentalParametersNormal: { type: Boolean, default: true },
  equipmentStatusSummary: { type: String, default: 'All compression tools verified cleaned & calibrated.' },

  // Signatures
  outgoingPersonnel: {
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    signedAt: { type: Date, default: Date.now }
  },
  incomingPersonnel: {
    employeeId: { type: String, required: true },
    name: { type: String, required: true },
    signedAt: { type: Date, default: Date.now }
  },
  supervisorVerification: {
    verified: { type: Boolean, default: true },
    supervisorName: { type: String, default: 'Production Supervisor' },
    verifiedAt: { type: Date, default: Date.now }
  },
  handoverCompletedWithoutDeviation: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ==============================================================================
// 2. Overtime Request Model (Cap: 12h/week, 50h/quarter)
// ==============================================================================
const OvertimeRequestSchema = new mongoose.Schema({
  requestCode: { type: String, required: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  date: { type: Date, required: true },
  shiftName: { type: String, default: 'General Shift' },
  plannedOvertimeHours: { type: Number, required: true },
  reasonForOvertime: { type: String, required: true },
  
  weeklyAccumulatedHours: { type: Number, default: 0 }, // Capped at 12 hours/week
  quarterlyAccumulatedHours: { type: Number, default: 0 }, // Capped at 50 hours/quarter
  
  compensationPreference: {
    type: String,
    enum: ['OVERTIME_PAY_1.5X', 'COMPENSATORY_OFF_90_DAYS'],
    default: 'OVERTIME_PAY_1.5X'
  },
  managerPreApprovalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  approvedBy: { type: String, default: '' },
  approvalDate: { type: Date, default: null },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ==============================================================================
// 3. Missed Punch & WFH / Field Duty Models
// ==============================================================================
const MissedPunchSchema = new mongoose.Schema({
  requestCode: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  date: { type: Date, required: true },
  punchType: { type: String, enum: ['IN_PUNCH', 'OUT_PUNCH', 'BOTH'], required: true },
  actualTimeClaimed: { type: String, required: true }, // e.g. "09:05 AM"
  reason: { type: String, required: true },
  submittedWithin24Hours: { type: Boolean, default: true },
  monthlyMissedPunchCountPrior: { type: Number, default: 0 }, // >= 3 is an attendance violation
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approvedBy: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

const RemoteWorkRequestSchema = new mongoose.Schema({
  requestCode: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  requestType: { type: String, enum: ['WORK_FROM_HOME', 'FIELD_DUTY'], required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  purpose: { type: String, required: true },
  dailyTaskReportSubmitted: { type: Boolean, default: false },
  dailyTaskSummary: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approvedBy: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// ==============================================================================
// 4. Probation Review Model (Day 30, 60, 90 + GMP 7 Modules Qualification)
// ==============================================================================
const ProbationReviewSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  
  // Day 30 Review (TNA, SOP training, OJT)
  day30Review: {
    dueDate: { type: Date },
    completedDate: { type: Date, default: null },
    trainingNeedsAssessment: { type: String, default: '' },
    sopReadAndUnderstoodSigned: { type: Boolean, default: false },
    ojtProgressRating: { type: String, enum: ['SATISFACTORY', 'NEEDS_SUPPORT', 'UNSATISFACTORY', 'PENDING'], default: 'PENDING' },
    reviewerComments: { type: String, default: '' }
  },

  // Day 60 Review (Mid-probation course correction, bi-weekly buddy checks)
  day60Review: {
    dueDate: { type: Date },
    completedDate: { type: Date, default: null },
    buddyCheckinsCompleted: { type: Boolean, default: false },
    midTermCompetencyScore: { type: Number, default: 0 },
    courseCorrectionRequired: { type: Boolean, default: false },
    reviewerComments: { type: String, default: '' }
  },

  // Day 90 Final Assessment
  day90Review: {
    dueDate: { type: Date },
    completedDate: { type: Date, default: null },
    finalCompetencyScore: { type: Number, default: 0 },
    recommendation: {
      type: String,
      enum: ['CONFIRM_PERMANENT', 'EXTEND_PROBATION_PIP_1_TO_3_MONTHS', 'TERMINATE_UNSATISFACTORY', 'PENDING'],
      default: 'PENDING'
    },
    extensionMonths: { type: Number, default: 0 },
    hrHeadApproval: { type: Boolean, default: false }
  },

  // Regulated Area GMP Qualification (7 modules: pass 80%)
  gmpRegulatedAreaQualification: {
    isRequired: { type: Boolean, default: true },
    modulesCompleted: [{
      moduleName: { 
        type: String, 
        enum: [
          'GMP Fundamentals',
          'Hygiene',
          'Gowning',
          'Documentation (GDP/ALCOA+)',
          'Contamination Control',
          'Area Classification',
          'Deviation & CAPA'
        ]
      },
      passed: { type: Boolean, default: false },
      scorePercent: { type: Number, default: 0 }
    }],
    overallScorePercent: { type: Number, default: 0 },
    isGMPQualified: { type: Boolean, default: false }, // Cannot work independently in cleanrooms until true!
    qualifiedDate: { type: Date, default: null },
    signOffByQA: { type: String, default: '' }
  },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = {
  ShiftHandoverLog: mongoose.models.ShiftHandoverLog || mongoose.model('ShiftHandoverLog', ShiftHandoverLogSchema),
  OvertimeRequest: mongoose.models.OvertimeRequest || mongoose.model('OvertimeRequest', OvertimeRequestSchema),
  MissedPunch: mongoose.models.MissedPunch || mongoose.model('MissedPunch', MissedPunchSchema),
  RemoteWorkRequest: mongoose.models.RemoteWorkRequest || mongoose.model('RemoteWorkRequest', RemoteWorkRequestSchema),
  ProbationReview: mongoose.models.ProbationReview || mongoose.model('ProbationReview', ProbationReviewSchema)
};
