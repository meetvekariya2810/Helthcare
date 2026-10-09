const mongoose = require('mongoose');

const HRAutomationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, unique: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: [
      'CREDENTIAL_EXPIRY',
      'TRAINING_OVERDUE',
      'OVERTIME_THRESHOLD',
      'UNDERSTAFFED_SHIFT',
      'MISSING_PUNCH',
      'PAYROLL_EXCEPTION',
      'DOCUMENT_EXPIRY',
      'PROBATION_COMPLETION'
    ],
    required: true
  },
  
  // Rule Logic
  triggerCondition: {
    event: { type: String, required: true }, // e.g. "CREDENTIAL_DAYS_LEFT_LEQ"
    thresholdValue: { type: Number, default: 30 }, // e.g. 30 days or 10 overtime hours
    unit: { type: String, default: 'DAYS' }
  },
  
  actions: [{
    actionType: { 
      type: String, 
      enum: ['SEND_NOTIFICATION', 'CREATE_WORKFORCE_ALERT', 'FLAG_PAYROLL', 'CREATE_CORRECTION_REQUEST', 'BLOCK_ROSTER'], 
      required: true 
    },
    targetRoles: [{ type: String }], // e.g. ['EMPLOYEE', 'MANAGER', 'HR_ADMIN']
    messageTemplate: { type: String, default: '' }
  }],

  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'URGENT', 'BLOCKING'],
    default: 'WARNING'
  },
  
  isEnabled: { type: Boolean, default: true },
  lastTriggeredAt: { type: Date, default: null },
  executionCount: { type: Number, default: 0 },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

HRAutomationRuleSchema.index({ category: 1 });
HRAutomationRuleSchema.index({ isEnabled: 1 });

module.exports = mongoose.models.HRAutomationRule || mongoose.model('HRAutomationRule', HRAutomationRuleSchema);
