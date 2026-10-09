const mongoose = require('mongoose');

const DayPatternSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['WORKING', 'WEEK_OFF', 'WEEK_ON', 'SHIFT', 'HOLIDAY', 'SPECIAL_WORKING_DAY'],
    default: 'WORKING'
  },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
  shiftName: { type: String, default: 'General Shift (09:00 - 18:00)' },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '18:00' },
  workingHours: { type: Number, default: 9 }
}, { _id: false });

const WorkScheduleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  scheduleType: {
    type: String,
    enum: ['COMPANY', 'DEPARTMENT', 'EMPLOYEE', 'ROSTER'],
    required: true,
    default: 'COMPANY'
  },
  
  // Specific targeting
  department: { type: String, default: 'ALL', trim: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  employeeCode: { type: String, default: '', trim: true, uppercase: true },
  employeeName: { type: String, default: '' },
  facility: { type: String, default: 'ALL' },
  
  // Weekly pattern: Mon to Sun (BJK Standard: Tuesday Week Off, 6 Days Working)
  weeklyPattern: {
    monday: { type: DayPatternSchema, default: () => ({ status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }) },
    tuesday: { type: DayPatternSchema, default: () => ({ status: 'WEEK_OFF', startTime: '00:00', endTime: '00:00', workingHours: 0 }) },
    wednesday: { type: DayPatternSchema, default: () => ({ status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }) },
    thursday: { type: DayPatternSchema, default: () => ({ status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }) },
    friday: { type: DayPatternSchema, default: () => ({ status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }) },
    saturday: { type: DayPatternSchema, default: () => ({ status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }) },
    sunday: { type: DayPatternSchema, default: () => ({ status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }) }
  },

  // Alternate week off configuration (e.g., 2nd & 4th Saturday Off, 1st & 3rd Working)
  alternateSaturdayRule: {
    enabled: { type: Boolean, default: false },
    offSaturdays: [{ type: Number, enum: [1, 2, 3, 4, 5] }] // e.g. [2, 4] for 2nd and 4th
  },

  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
  shiftName: { type: String, default: 'General Shift' },

  // Effective Date Range (Preserves historical attendance)
  effectiveFrom: { type: Date, required: true, default: () => new Date('2026-01-01') },
  effectiveTo: { type: Date, default: null },

  version: { type: String, default: 'BJK-2026-V1' },
  isPublished: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'],
    default: 'ACTIVE'
  },
  
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'HR Administrator' },
    role: { type: String, default: 'HR_MANAGER' }
  },
  notes: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

WorkScheduleSchema.index({ scheduleType: 1, status: 1 });
WorkScheduleSchema.index({ employeeCode: 1, status: 1 });
WorkScheduleSchema.index({ department: 1, status: 1 });
WorkScheduleSchema.index({ effectiveFrom: 1, effectiveTo: 1 });

module.exports = mongoose.models.WorkSchedule || mongoose.model('WorkSchedule', WorkScheduleSchema);
