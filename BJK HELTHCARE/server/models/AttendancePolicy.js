const mongoose = require('mongoose');

const AttendancePolicySchema = new mongoose.Schema({
  facilityId: {
    type: String,
    trim: true,
    default: 'BJK-FAC-001'
  },
  facilityName: {
    type: String,
    trim: true,
    default: 'BJK Healthcare Pvt. Ltd. - Lavad'
  },
  facilityAddress: {
    type: String,
    default: 'Block/Survey No. 1248, Near Rashtriya Raksha University, Lavad-Sampa Road, Lavad, Dahegam, Gujarat 382305, India'
  },
  // Authorized factory attendance center coordinates
  latitude: {
    type: Number,
    required: true,
    default: 23.175920
  },
  longitude: {
    type: Number,
    required: true,
    default: 72.874370
  },
  // Maximum allowed radius in meters for punch in / out
  radiusMeters: {
    type: Number,
    required: true,
    default: 100
  },
  gpsRequired: {
    type: Boolean,
    default: true
  },
  punchInEnabled: {
    type: Boolean,
    default: true
  },
  punchOutEnabled: {
    type: Boolean,
    default: true
  },
  // Minimum acceptable GPS accuracy in meters (readings with error > this are rejected)
  minimumGpsAccuracy: {
    type: Number,
    default: 50
  },
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: 'Standard 100-Meter Factory Geofenced Attendance Policy'
  }
}, {
  timestamps: true
});

AttendancePolicySchema.index({ facilityId: 1, active: 1 });

module.exports = mongoose.models.AttendancePolicy || mongoose.model('AttendancePolicy', AttendancePolicySchema);
