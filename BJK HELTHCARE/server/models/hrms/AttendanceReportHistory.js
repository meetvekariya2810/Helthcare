const mongoose = require('mongoose');

const AttendanceReportHistorySchema = new mongoose.Schema({
  reportName: { type: String, required: true },
  reportType: { type: String, default: 'ATTENDANCE_CUSTOM' },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedByName: { type: String, default: 'Authorized User' },
  userRole: { type: String, default: 'HR_ADMIN' },
  recordCount: { type: Number, default: 0 },
  employeeCount: { type: Number, default: 0 },
  dateRange: { type: String, default: '' },
  filtersSummary: { type: String, default: '' },
  columnsIncluded: [{ type: String }],
  format: {
    type: String,
    enum: ['XLSX', 'CSV', 'PDF', 'PRINT'],
    default: 'XLSX'
  },
  fileSizeBytes: { type: Number, default: 0 },
  status: { type: String, default: 'COMPLETED' }
}, {
  timestamps: true
});

AttendanceReportHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.models.AttendanceReportHistory || mongoose.model('AttendanceReportHistory', AttendanceReportHistorySchema);
