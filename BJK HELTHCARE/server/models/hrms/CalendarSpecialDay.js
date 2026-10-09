const mongoose = require('mongoose');

const CalendarSpecialDaySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  dateString: { type: String, required: true, trim: true }, // YYYY-MM-DD
  type: {
    type: String,
    enum: ['SPECIAL_WORKING_DAY', 'SPECIAL_HOLIDAY'],
    required: true,
    default: 'SPECIAL_WORKING_DAY'
  },
  reason: { type: String, required: true, trim: true },
  applicableTo: {
    type: String,
    enum: ['ALL', 'DEPARTMENT', 'EMPLOYEES'],
    default: 'DEPARTMENT'
  },
  department: { type: String, default: 'ALL', trim: true },
  employeeCodes: [{ type: String, trim: true, uppercase: true }],
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
  shiftName: { type: String, default: 'General Shift (09:00 - 18:00)' },
  workingHours: { type: Number, default: 8 },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED'],
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

CalendarSpecialDaySchema.index({ dateString: 1, type: 1, status: 1 });
CalendarSpecialDaySchema.index({ department: 1 });

module.exports = mongoose.models.CalendarSpecialDay || mongoose.model('CalendarSpecialDay', CalendarSpecialDaySchema);
