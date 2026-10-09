const mongoose = require('mongoose');

const CanteenSettingSchema = new mongoose.Schema({
  departmentName: {
    type: String,
    default: 'BJK Healthcare Canteen Department',
    trim: true
  },
  cafeteriaLocation: {
    type: String,
    default: 'Ground Floor Central Dining Hall (Unit-1)',
    trim: true
  },
  inChargeName: {
    type: String,
    default: 'Canteen Supervisor / Catering Manager',
    trim: true
  },
  contactExtension: {
    type: String,
    default: 'Ext. 402 / 403',
    trim: true
  },
  lunchStartTime: {
    type: String,
    default: '12:30', // HH:mm format
    trim: true
  },
  lunchEndTime: {
    type: String,
    default: '14:30', // HH:mm format
    trim: true
  },
  gracePeriodMinutes: {
    type: Number,
    default: 15
  },
  dailyTargetCapacity: {
    type: Number,
    default: 250
  },
  bufferPercent: {
    type: Number,
    default: 10
  },
  autoRefreshIntervalSeconds: {
    type: Number,
    default: 10
  },
  allowDishTypeSelection: {
    type: Boolean,
    default: true
  },
  defaultDishType: {
    type: String,
    enum: ['Full Dish', 'Half Dish'],
    default: 'Full Dish'
  },
  enableNotificationThresholds: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: String,
    default: 'Canteen Admin'
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.CanteenSetting || mongoose.model('CanteenSetting', CanteenSettingSchema);
