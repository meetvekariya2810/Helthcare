const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, unique: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ['General', 'Morning', 'Evening', 'Night', 'Rotational', 'Weekend', 'Holiday', 'On-call', 'Custom'],
    default: 'General'
  },
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "18:00"
  totalDurationHours: { type: Number, default: 9 },
  gracePeriodMinutes: { type: Number, default: 15 },
  breakDurationMinutes: { type: Number, default: 60 },
  
  // Overtime Engine Configuration
  overtimeRule: {
    eligible: { type: Boolean, default: true },
    minimumExtraMinutes: { type: Number, default: 30 },
    multiplier: { type: Number, default: 1.5 }, // 1.5x regular pay
    requiresApproval: { type: Boolean, default: true }
  },

  // Night Differential Configuration
  nightRule: {
    isNightShift: { type: Boolean, default: false },
    nightHoursStart: { type: String, default: '22:00' },
    nightHoursEnd: { type: String, default: '06:00' },
    differentialAllowanceRate: { type: Number, default: 250 } // Rs. 250 per night shift
  },

  // Roster Constraints
  minimumRestPeriodHours: { type: Number, default: 11 }, // Required gap between shifts
  weeklyOffDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
  applicableDepartments: [{ type: String }],
  applicableFacilities: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

ShiftSchema.index({ type: 1 });

module.exports = mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);
