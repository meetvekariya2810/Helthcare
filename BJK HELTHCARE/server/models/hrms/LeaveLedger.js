const mongoose = require('mongoose');

// Monthly leave entry schema
const MonthlyLeaveSchema = new mongoose.Schema({
  monthName: { type: String, required: true }, // e.g. "Jan-26"
  monthIndex: { type: Number, required: true }, // 1 to 10
  monthKey: { type: String, required: true }, // "2026-01"
  cl: { type: Number, default: 0 },
  sl: { type: Number, default: 0 },
  lwp: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const LeaveLedgerSchema = new mongoose.Schema({
  srNo: { type: Number, default: 0 },
  employeeCode: { type: String, required: true, uppercase: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  doj: { type: String, default: '' },
  year: { type: Number, default: 2026 },

  // Opening Balance
  openingBalance: {
    cl: { type: Number, default: 0 },
    sl: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // Monthly Breakdown (Jan-26 through Oct-26)
  monthlyBreakdown: [MonthlyLeaveSchema],

  // Total Leave Taken
  totalLeaveTaken: {
    cl: { type: Number, default: 0 },
    sl: { type: Number, default: 0 },
    lwp: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // Closing Balance
  closingBalance: {
    cl: { type: Number, default: 0 },
    sl: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  // Additional calculation notes / remarks from sheet if present
  extraNotes: { type: String, default: '' },
  extraValues: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Source Traceability
  sourceType: { type: String, default: 'Leave 2026(Sheet1).csv' },
  sourceYear: { type: Number, default: 2026 },
  sourceRow: { type: Number, default: 0 },
  rawValues: { type: mongoose.Schema.Types.Mixed, default: {} },

  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'System Seed' }
}, {
  timestamps: true
});

LeaveLedgerSchema.index({ employeeCode: 1, year: 1 }, { unique: true });
LeaveLedgerSchema.index({ department: 1 });
LeaveLedgerSchema.index({ employeeName: 1 });

const LeaveLedger = mongoose.models.LeaveLedger || mongoose.model('LeaveLedger', LeaveLedgerSchema);

module.exports = LeaveLedger;
