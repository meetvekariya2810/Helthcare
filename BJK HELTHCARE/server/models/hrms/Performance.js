const mongoose = require('mongoose');

// 1. Performance Cycle (e.g. FY 2025-26 Annual Appraisal)
const PerformanceCycleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['PLANNED', 'GOAL_SETTING', 'SELF_REVIEW', 'MANAGER_REVIEW', 'HR_CALIBRATION', 'COMPLETED'],
    default: 'GOAL_SETTING'
  },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// 2. Employee Performance Review & Goals
const PerformanceReviewSchema = new mongoose.Schema({
  cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'PerformanceCycle', required: true },
  cycleTitle: { type: String, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewerName: { type: String, default: '' },
  
  goals: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    weightagePercentage: { type: Number, default: 20 },
    selfRating: { type: Number, min: 1, max: 5, default: null },
    selfComments: { type: String, default: '' },
    managerRating: { type: Number, min: 1, max: 5, default: null },
    managerComments: { type: String, default: '' }
  }],
  
  overallSelfRating: { type: Number, default: null },
  overallManagerRating: { type: Number, default: null },
  finalCalibratedScore: { type: Number, default: null },
  
  status: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED_BY_EMPLOYEE', 'REVIEWED_BY_MANAGER', 'FINALIZED'],
    default: 'DRAFT'
  },
  
  developmentPlan: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

PerformanceReviewSchema.index({ employee: 1, cycle: 1 });
PerformanceReviewSchema.index({ status: 1 });

const PerformanceCycle = mongoose.models.PerformanceCycle || mongoose.model('PerformanceCycle', PerformanceCycleSchema);
const PerformanceReview = mongoose.models.PerformanceReview || mongoose.model('PerformanceReview', PerformanceReviewSchema);

module.exports = { PerformanceCycle, PerformanceReview };
