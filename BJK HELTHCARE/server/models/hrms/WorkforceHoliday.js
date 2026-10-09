const mongoose = require('mongoose');

const WorkforceHolidaySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  dateString: { type: String, required: true, trim: true }, // YYYY-MM-DD
  year: { type: Number, required: true, default: 2026 },
  type: {
    type: String,
    enum: [
      'COMPANY_HOLIDAY',
      'PUBLIC_HOLIDAY',
      'FESTIVAL_HOLIDAY',
      'NATIONAL_HOLIDAY',
      'REGIONAL_HOLIDAY',
      'SPECIAL_HOLIDAY',
      'OPTIONAL_HOLIDAY',
      'DEPARTMENT_HOLIDAY'
    ],
    default: 'COMPANY_HOLIDAY'
  },
  applicableTo: {
    type: String,
    enum: ['ALL', 'DEPARTMENT', 'EMPLOYEES'],
    default: 'ALL'
  },
  department: { type: String, default: 'ALL', trim: true },
  employeeCodes: [{ type: String, trim: true, uppercase: true }],
  facility: { type: String, default: 'ALL' },
  description: { type: String, default: '' },
  isOptional: { type: Boolean, default: false },
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

WorkforceHolidaySchema.index({ dateString: 1, status: 1 });
WorkforceHolidaySchema.index({ year: 1, applicableTo: 1 });
WorkforceHolidaySchema.index({ department: 1 });

module.exports = mongoose.models.WorkforceHoliday || mongoose.model('WorkforceHoliday', WorkforceHolidaySchema);
