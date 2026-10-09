const mongoose = require('mongoose');

const CanteenLunchRecordSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    trim: true,
    uppercase: true,
    index: true
  },
  employeeCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  employeeName: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true
  },
  department: {
    type: String,
    default: 'General',
    trim: true
  },
  designation: {
    type: String,
    default: 'Staff',
    trim: true
  },
  date: {
    type: String, // Stored as 'YYYY-MM-DD'
    required: [true, 'Date is required'],
    index: true
  },
  lunchInAt: {
    type: Date,
    default: null
  },
  lunchOutAt: {
    type: Date,
    default: null
  },
  durationMinutes: {
    type: Number,
    default: 0
  },
  dishType: {
    type: String,
    enum: ['Full Dish', 'Half Dish', null],
    default: null,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['NOT_MARKED', 'IN', 'COMPLETED', 'FINALIZED'],
    default: 'NOT_MARKED',
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  employeeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  finalized: {
    type: Boolean,
    default: false,
    index: true
  },
  finalizedAt: {
    type: Date,
    default: null
  },
  finalizedBy: {
    type: String,
    default: null
  },
  finalizedByName: {
    type: String,
    default: null
  },
  correctionReason: {
    type: String,
    default: null
  },
  correctedBy: {
    type: String,
    default: null
  },
  correctedAt: {
    type: Date,
    default: null
  },
  auditReference: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Unique compound index to prevent duplicate daily records per employee
CanteenLunchRecordSchema.index({ employeeId: 1, date: 1 }, { unique: true });
CanteenLunchRecordSchema.index({ date: 1, status: 1 });
CanteenLunchRecordSchema.index({ date: 1, department: 1 });

module.exports = mongoose.models.CanteenLunchRecord || mongoose.model('CanteenLunchRecord', CanteenLunchRecordSchema);
