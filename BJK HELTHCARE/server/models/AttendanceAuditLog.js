const mongoose = require('mongoose');

const AttendanceAuditLogSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  employeeCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  employeeName: {
    type: String,
    trim: true,
    default: ''
  },
  action: {
    type: String,
    required: true,
    enum: [
      'PUNCH_IN_ATTEMPT',
      'PUNCH_IN_SUCCESS',
      'PUNCH_IN_REJECTED',
      'PUNCH_OUT_ATTEMPT',
      'PUNCH_OUT_SUCCESS',
      'PUNCH_OUT_REJECTED',
      'LOCATION_PERMISSION_DENIED',
      'GPS_ACCURACY_FAILED',
      'OUT_OF_GEOFENCE',
      'LOCATION_CHECK'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  result: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'REJECTED', 'DENIED'],
    default: 'SUCCESS'
  },
  verificationStatus: {
    type: String,
    enum: ['VERIFIED', 'FAILED', 'OUT_OF_BOUNDS', 'ACCURACY_POOR', 'UNVERIFIED'],
    default: 'UNVERIFIED'
  },
  distanceMeters: {
    type: Number,
    default: null
  },
  gpsAccuracy: {
    type: Number,
    default: null
  },
  deviceInfo: {
    userAgent: { type: String, default: '' },
    platform: { type: String, default: '' },
    ipAddress: { type: String, default: '' }
  },
  facility: {
    type: String,
    default: 'BJK Healthcare Pvt. Ltd. - Lavad'
  },
  failureReason: {
    type: String,
    default: ''
  },
  // Internal coordinates recorded solely for administrative security auditing
  rawCoordinates: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  }
}, {
  timestamps: true
});

AttendanceAuditLogSchema.index({ employeeId: 1, timestamp: -1 });
AttendanceAuditLogSchema.index({ action: 1, timestamp: -1 });
AttendanceAuditLogSchema.index({ result: 1 });

module.exports = mongoose.models.AttendanceAuditLog || mongoose.model('AttendanceAuditLog', AttendanceAuditLogSchema);
