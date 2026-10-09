const mongoose = require('mongoose');

const AttendanceRegularizationSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  branchName: { type: String, default: 'Ahmedabad Branch' },
  attendance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance'
  },
  date: { type: Date, required: true },
  dateString: { type: String, required: true },
  requestType: {
    type: String,
    enum: ['MISSING_IN', 'MISSING_OUT', 'WRONG_TIME', 'WRONG_STATUS', 'WRONG_SHIFT', 'FULL_REGULARIZATION'],
    required: true
  },
  proposedCheckIn: { type: Date },
  proposedCheckOut: { type: Date },
  proposedStatus: { type: String, default: 'PRESENT' },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedByName: { type: String, default: '' },
  reviewRemarks: { type: String, default: '' },
  reviewedAt: { type: Date }
}, {
  timestamps: true
});

AttendanceRegularizationSchema.index({ employee: 1, dateString: 1 });
AttendanceRegularizationSchema.index({ status: 1 });
AttendanceRegularizationSchema.index({ departmentName: 1 });

module.exports = mongoose.models.AttendanceRegularization || mongoose.model('AttendanceRegularization', AttendanceRegularizationSchema);
