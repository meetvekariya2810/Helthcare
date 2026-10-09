const mongoose = require('mongoose');

const CompanyCalendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  dateString: { type: String, required: true, trim: true }, // YYYY-MM-DD
  startTime: { type: String, default: '10:00' },
  endTime: { type: String, default: '17:00' },
  type: {
    type: String,
    enum: [
      'ANNUAL_FUNCTION',
      'FOUNDATION_DAY',
      'EMPLOYEE_MEETING',
      'TRAINING',
      'WORKSHOP',
      'TEAM_BUILDING',
      'CORPORATE_EVENT',
      'TOWN_HALL',
      'MEDICAL_CAMP',
      'SAFETY_TRAINING',
      'COMPLIANCE_TRAINING',
      'BIRTHDAY_CELEBRATION',
      'WORK_ANNIVERSARY',
      'FESTIVAL_CELEBRATION',
      'OFFICE_FUNCTION',
      'CULTURAL_EVENT',
      'OTHER'
    ],
    default: 'CORPORATE_EVENT'
  },
  category: {
    type: String,
    enum: ['EVENT', 'CELEBRATION', 'FUNCTION', 'TRAINING'],
    default: 'EVENT'
  },
  location: { type: String, default: 'Main Auditorium / Campus' },
  description: { type: String, default: '' },
  applicableTo: {
    type: String,
    enum: ['ALL', 'DEPARTMENT', 'EMPLOYEES'],
    default: 'ALL'
  },
  department: { type: String, default: 'ALL', trim: true },
  employeeCodes: [{ type: String, trim: true, uppercase: true }],
  organizer: { type: String, default: 'HR Department' },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
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

CompanyCalendarEventSchema.index({ dateString: 1, status: 1 });
CompanyCalendarEventSchema.index({ category: 1 });
CompanyCalendarEventSchema.index({ applicableTo: 1 });

module.exports = mongoose.models.CompanyCalendarEvent || mongoose.model('CompanyCalendarEvent', CompanyCalendarEventSchema);
