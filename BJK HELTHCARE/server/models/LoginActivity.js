const mongoose = require('mongoose');

const LoginActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date,
    default: null
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
  sessionId: {
    type: String,
    default: ''
  },
  locationApproximation: {
    type: String,
    default: 'Ahmedabad, Gujarat, India'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'BLOCKED', 'LOGOUT', 'EXPIRED'],
    default: 'SUCCESS'
  },
  failureReason: {
    type: String,
    default: ''
  },
  isDemo: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

LoginActivitySchema.index({ userId: 1, loginTime: -1 });
LoginActivitySchema.index({ employeeId: 1, loginTime: -1 });
LoginActivitySchema.index({ email: 1, loginTime: -1 });
LoginActivitySchema.index({ status: 1 });
LoginActivitySchema.index({ loginTime: -1 });

module.exports = mongoose.models.LoginActivity || mongoose.model('LoginActivity', LoginActivitySchema);
