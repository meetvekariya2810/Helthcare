const mongoose = require('mongoose');

const CalendarExceptionSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, trim: true, uppercase: true }, // e.g. BH1022
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeName: { type: String, default: '' },
  date: { type: Date, required: true },
  dateString: { type: String, required: true, trim: true }, // YYYY-MM-DD
  originalStatus: { type: String, default: 'WORKING' },
  newStatus: {
    type: String,
    enum: ['WORKING', 'WEEK_OFF', 'SPECIAL_WORKING_DAY', 'SPECIAL_HOLIDAY', 'SHIFT'],
    required: true
  },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
  shiftName: { type: String, default: '' },
  reason: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'REVOKED'],
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

CalendarExceptionSchema.index({ employeeId: 1, dateString: 1, status: 1 });

module.exports = mongoose.models.CalendarException || mongoose.model('CalendarException', CalendarExceptionSchema);
