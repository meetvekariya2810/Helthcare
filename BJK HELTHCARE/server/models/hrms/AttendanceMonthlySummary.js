const mongoose = require('mongoose');

const AttendanceMonthlySummarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  present: {
    type: Number,
    default: 0
  },
  weeklyOff: {
    type: Number,
    default: 0
  },
  publicHoliday: {
    type: Number,
    default: 0
  },
  casualLeave: {
    type: Number,
    default: 0
  },
  sickLeave: {
    type: Number,
    default: 0
  },
  compensatoryOff: {
    type: Number,
    default: 0
  },
  leaveWithoutPay: {
    type: Number,
    default: 0
  },
  absentPayDays: {
    type: Number,
    default: 0
  },
  totalDays: {
    type: Number,
    default: 0
  },
  sourceFileName: {
    type: String,
    default: ''
  },
  importBatchId: {
    type: String,
    required: true,
    trim: true
  },
  sourceEmployeeName: {
    type: String,
    default: ''
  },
  sourceDepartment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'attendance_monthly_summaries'
});

// Composite Unique Index as specified in Rule 10
AttendanceMonthlySummarySchema.index(
  {
    employeeCode: 1,
    month: 1,
    year: 1
  },
  {
    unique: true
  }
);

AttendanceMonthlySummarySchema.index({ importBatchId: 1 });
AttendanceMonthlySummarySchema.index({ employeeId: 1, month: 1, year: 1 });

module.exports = mongoose.models.AttendanceMonthlySummary || mongoose.model('AttendanceMonthlySummary', AttendanceMonthlySummarySchema);
