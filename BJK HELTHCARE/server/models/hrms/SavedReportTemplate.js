const mongoose = require('mongoose');

const SavedReportTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  reportType: {
    type: String,
    enum: [
      'CUSTOM',
      'DAILY_ATTENDANCE',
      'MONTHLY_ATTENDANCE',
      'LATE_ARRIVAL',
      'MISSING_PUNCH',
      'OVERTIME',
      'LEAVE_REPORT',
      'HALF_DAY',
      'PRODUCTION_ATTENDANCE',
      'QC_ATTENDANCE',
      'NIGHT_SHIFT'
    ],
    default: 'CUSTOM'
  },
  filters: {
    dateMode: { type: String, default: 'THIS_MONTH' }, // TODAY, YESTERDAY, THIS_WEEK, THIS_MONTH, PREVIOUS_MONTH, CUSTOM
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    branches: [{ type: String }],
    departments: [{ type: String }],
    employees: [{ type: String }],
    shifts: [{ type: String }],
    statuses: [{ type: String }],
    punchConditions: [{ type: String }],
    minWorkingHours: { type: Number },
    minOvertimeHours: { type: Number },
    minLateMinutes: { type: Number }
  },
  selectedColumns: [{
    key: { type: String, required: true },
    label: { type: String, required: true },
    order: { type: Number, default: 0 }
  }],
  groupBy: {
    type: String,
    enum: ['NONE', 'DEPARTMENT', 'BRANCH', 'EMPLOYEE', 'DATE', 'SHIFT', 'STATUS'],
    default: 'NONE'
  },
  sheetsMode: {
    type: String,
    enum: ['SINGLE', 'SUMMARY_DETAIL', 'BY_DEPARTMENT'],
    default: 'SINGLE'
  },
  isPublic: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdByName: { type: String, default: 'HR Admin' }
}, {
  timestamps: true
});

module.exports = mongoose.models.SavedReportTemplate || mongoose.model('SavedReportTemplate', SavedReportTemplateSchema);
