const mongoose = require('mongoose');

const AttendanceImportBatchSchema = new mongoose.Schema({
  importBatchId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'PREVIEW',
      'PROCESSING',
      'IMPORTED',
      'FAILED',
      'PARTIAL',
      'ROLLED_BACK',
      'ROLLBACK_FAILED'
    ],
    default: 'PREVIEW'
  },
  totalRows: {
    type: Number,
    default: 0
  },
  matchedRows: {
    type: Number,
    default: 0
  },
  importedRows: {
    type: Number,
    default: 0
  },
  unmatchedRows: {
    type: Number,
    default: 0
  },
  duplicateRows: {
    type: Number,
    default: 0
  },
  failedRows: {
    type: Number,
    default: 0
  },
  warningCount: {
    type: Number,
    default: 0
  },
  importedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  importedByName: {
    type: String,
    default: 'Superadmin'
  },
  importedAt: {
    type: Date,
    default: null
  },
  rolledBackAt: {
    type: Date,
    default: null
  },
  rolledBackBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rolledBackByName: {
    type: String,
    default: ''
  },
  rollbackReason: {
    type: String,
    default: ''
  },
  validationReport: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'attendance_import_batches'
});

// Index as specified in Rule 10
AttendanceImportBatchSchema.index(
  {
    importBatchId: 1
  },
  {
    unique: true
  }
);

AttendanceImportBatchSchema.index({ createdAt: -1 });

module.exports = mongoose.models.AttendanceImportBatch || mongoose.model('AttendanceImportBatch', AttendanceImportBatchSchema);
