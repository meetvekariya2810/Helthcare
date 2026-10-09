const mongoose = require('mongoose');

const HRNotificationSchema = new mongoose.Schema({
  recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  recipientRole: { type: String, default: null }, // e.g. 'HR_ADMIN', 'DEPARTMENT_MANAGER', null for specific user
  recipientEmployeeId: { type: String, default: null },
  
  category: {
    type: String,
    enum: [
      'ATTENDANCE',
      'LEAVE',
      'SHIFT',
      'PAYROLL',
      'RECRUITMENT',
      'TRAINING',
      'CREDENTIAL',
      'COMPLIANCE',
      'DOCUMENT',
      'PERFORMANCE',
      'HR_ANNOUNCEMENT',
      'WORKFORCE_ALERT'
    ],
    required: true
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'URGENT', 'BLOCKING'],
    default: 'INFO'
  },
  
  linkUrl: { type: String, default: '' },
  relatedRecordId: { type: String, default: '' },
  
  photo: { type: String, default: '' },
  sendTo: { type: String, default: 'All' },
  senderName: { type: String, default: 'HR Department' },
  senderRole: { type: String, default: 'HR_ADMIN' },
  departmentName: { type: String, default: 'All Departments' },

  isRead: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  isArchived: { type: Boolean, default: false },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

HRNotificationSchema.index({ recipientUser: 1, isRead: 1 });
HRNotificationSchema.index({ recipientRole: 1, isRead: 1 });
HRNotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.models.HRNotification || mongoose.model('HRNotification', HRNotificationSchema);
