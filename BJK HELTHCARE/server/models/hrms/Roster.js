const mongoose = require('mongoose');

const RosterSchema = new mongoose.Schema({
  dateString: { type: String, required: true }, // "YYYY-MM-DD"
  date: { type: Date, required: true },
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  facility: { type: String, required: true },
  shift: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shift', 
    required: true 
  },
  shiftName: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  
  // Production / Pharma Station allocation
  productionLine: { type: String, default: 'General Operations' },
  roleRequirement: { type: String, default: 'Standard' }, // e.g. 'Certified GMP Operator', 'Cleanroom QC'

  // Intelligent Validation System
  validationStatus: {
    type: String,
    enum: ['VALID', 'WARNING', 'BLOCKED'],
    default: 'VALID'
  },
  blockingIssues: [{ type: String }],
  warnings: [{ type: String }],
  isPublished: { type: Boolean, default: true },

  // Shift Swap Tracking
  swapRequest: {
    requested: { type: Boolean, default: false },
    withEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
    withEmployeeName: { type: String, default: '' },
    withShift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
    status: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
    requestDate: { type: Date, default: null },
    approvedBy: { type: String, default: '' },
    reason: { type: String, default: '' }
  },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

RosterSchema.index({ employee: 1, dateString: 1 });
RosterSchema.index({ dateString: 1, shift: 1 });
RosterSchema.index({ departmentName: 1, dateString: 1 });
RosterSchema.index({ validationStatus: 1 });

module.exports = mongoose.models.Roster || mongoose.model('Roster', RosterSchema);
