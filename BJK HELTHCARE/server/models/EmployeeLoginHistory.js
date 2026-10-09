const mongoose = require('mongoose');

const EmployeeLoginHistorySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  loginTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  logoutTime: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: ''
  },
  device: {
    type: String,
    default: 'Desktop'
  },
  browser: {
    type: String,
    default: 'Chrome'
  },
  location: {
    type: String,
    default: 'Ahmedabad, India'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'LOGGED_OUT'],
    default: 'SUCCESS'
  },
  loginMethod: {
    type: String,
    enum: ['PASSWORD', 'OTP', 'REMEMBERED_TOKEN'],
    default: 'PASSWORD'
  },
  failureReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

EmployeeLoginHistorySchema.index({ employeeId: 1, loginTime: -1 });

module.exports = mongoose.models.EmployeeLoginHistory || mongoose.model('EmployeeLoginHistory', EmployeeLoginHistorySchema);
