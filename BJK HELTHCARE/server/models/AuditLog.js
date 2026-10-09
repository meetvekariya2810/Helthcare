const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    email: { type: String, default: 'system@bjkhealthcare.com' },
    role: { type: String, default: 'SYSTEM' }
  },
  action: { 
    type: String, 
    required: [true, 'Audit action is required'],
    trim: true
  }, // e.g. CREATE, READ, UPDATE, DELETE, APPROVE, EXPORT, LOGIN
  module: { 
    type: String, 
    required: true, 
    default: 'GENERAL',
    trim: true
  }, // e.g. PRODUCT, BATCH, INVENTORY, QC, QA, REGULATORY, CRM, HRMS, SECURITY
  resource: { 
    type: String, 
    default: '' 
  }, // e.g. Product, Batch, InventoryItem
  resourceId: { 
    type: String, 
    default: null 
  },
  recordId: { 
    type: String, 
    default: null 
  },
  oldData: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  newData: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  before: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  after: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
  ipAddress: { 
    type: String, 
    default: '127.0.0.1' 
  },
  ip: { 
    type: String, 
    default: '127.0.0.1' 
  },
  userAgent: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['SUCCESS', 'FAILURE', 'WARNING', 'PENDING'], 
    default: 'SUCCESS' 
  },
  targetUser: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  targetUserId: {
    type: String,
    default: null
  },
  reason: {
    type: String,
    default: ''
  },
  details: { 
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

// Compound & Single Indexes for high performance audit queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ 'user.email': 1 });
AuditLogSchema.index({ 'targetUser.employeeId': 1 });
AuditLogSchema.index({ targetUserId: 1 });
AuditLogSchema.index({ module: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ resourceId: 1 });
AuditLogSchema.index({ module: 1, action: 1, timestamp: -1 });

// Helper to record an immutable audit log entry
AuditLogSchema.statics.logAction = async function({
  user,
  action,
  module,
  resource,
  resourceId,
  oldData,
  newData,
  targetUser,
  targetUserId,
  reason = '',
  ipAddress,
  userAgent,
  status = 'SUCCESS',
  details = ''
}) {
  try {
    const entry = new this({
      user: {
        id: user?._id || user?.id || null,
        name: user?.name || 'Authorized Operator',
        email: user?.email || 'operator@bjkhealthcare.com',
        role: user?.role || 'SUPER_ADMIN'
      },
      action: String(action).toUpperCase(),
      module: String(module).toUpperCase(),
      resource: resource || module,
      resourceId: resourceId ? String(resourceId) : null,
      recordId: resourceId ? String(resourceId) : null,
      targetUser: targetUser ? {
        id: mongoose.Types.ObjectId.isValid(targetUser.id || targetUser._id) ? (targetUser.id || targetUser._id) : null,
        name: targetUser.name || '',
        employeeId: targetUser.employeeId || '',
        email: targetUser.email || ''
      } : (mongoose.Types.ObjectId.isValid(targetUserId) ? { id: targetUserId } : null),
      targetUserId: targetUserId ? String(targetUserId) : (targetUser?.id ? String(targetUser.id) : (targetUser?._id ? String(targetUser._id) : null)),
      reason: reason || details || '',
      oldData: oldData || null,
      before: oldData || null,
      newData: newData || null,
      after: newData || null,
      ipAddress: ipAddress || '127.0.0.1',
      ip: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'BJK-API/2.0',
      status,
      details: details || reason || '',
      timestamp: new Date()
    });
    return await entry.save();
  } catch (err) {
    console.error('[AuditLog] Failed to persist audit log:', err.message);
    return null;
  }
};

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
