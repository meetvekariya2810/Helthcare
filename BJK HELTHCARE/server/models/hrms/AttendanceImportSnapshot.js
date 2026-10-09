const mongoose = require('mongoose');

const AttendanceImportSnapshotSchema = new mongoose.Schema({
  importBatchId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  employeeCode: {
    type: String,
    trim: true
  },
  attendanceDate: {
    type: String,
    trim: true
  },
  previousStatus: {
    type: String,
    default: null
  },
  previousSummary: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  snapshotType: {
    type: String,
    enum: ['EXISTING_RECORD', 'NEW_RECORD'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'attendance_import_snapshots'
});

AttendanceImportSnapshotSchema.index({ importBatchId: 1, employeeCode: 1, attendanceDate: 1 });

module.exports = mongoose.models.AttendanceImportSnapshot || mongoose.model('AttendanceImportSnapshot', AttendanceImportSnapshotSchema);
