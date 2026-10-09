const mongoose = require('mongoose');

const RosterWeekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true }, // 1, 2, 3, 4
  pattern: {
    monday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'ON' },
    tuesday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'ON' },
    wednesday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'ON' },
    thursday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'ON' },
    friday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'ON' },
    saturday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'OFF' },
    sunday: { type: String, enum: ['ON', 'OFF', 'WORKING', 'WEEK_OFF'], default: 'OFF' }
  }
}, { _id: false });

const WorkforceRosterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  cycleLengthDays: { type: Number, default: 14 }, // e.g. 14 days (2 weeks) or 7 days
  weeks: [RosterWeekSchema],
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
  shiftName: { type: String, default: 'General Shift' },
  applicableTo: {
    type: String,
    enum: ['ALL', 'DEPARTMENT', 'EMPLOYEES', 'TEAM'],
    default: 'DEPARTMENT'
  },
  department: { type: String, default: 'ALL', trim: true },
  employeeCodes: [{ type: String, trim: true, uppercase: true }],
  effectiveFrom: { type: Date, required: true, default: () => new Date('2026-01-01') },
  effectiveTo: { type: Date, default: null },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'HR Administrator' },
    role: { type: String, default: 'HR_MANAGER' }
  },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

WorkforceRosterSchema.index({ code: 1, status: 1 });
WorkforceRosterSchema.index({ department: 1 });
WorkforceRosterSchema.index({ employeeCodes: 1 });

module.exports = mongoose.models.WorkforceRoster || mongoose.model('WorkforceRoster', WorkforceRosterSchema);
