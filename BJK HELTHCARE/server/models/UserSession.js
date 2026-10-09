const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  tokenHash: {
    type: String,
    default: ''
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  device: {
    type: String,
    default: 'Desktop'
  },
  browser: {
    type: String,
    default: 'Chrome'
  },
  operatingSystem: {
    type: String,
    default: 'Windows'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'TERMINATED', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  terminatedAt: {
    type: Date,
    default: null
  },
  terminatedBy: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

UserSessionSchema.index({ sessionId: 1 }, { unique: true });
UserSessionSchema.index({ userId: 1, status: 1 });
UserSessionSchema.index({ employeeId: 1 });
UserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.models.UserSession || mongoose.model('UserSession', UserSessionSchema);
