const AuditLog = require('../models/AuditLog');

const recordAudit = async ({
  req,
  action,
  module = 'HRMS',
  recordId = null,
  before = null,
  after = null,
  details = ''
}) => {
  try {
    const user = req && req.user ? {
      id: req.user._id || req.user.id,
      name: req.user.name || 'System Operator',
      email: req.user.email || 'system@bjkhealthcare.com',
      role: req.user.role || 'SYSTEM'
    } : {
      name: 'System Automation',
      email: 'automation@bjkhealthcare.com',
      role: 'SYSTEM'
    };

    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';

    await AuditLog.create({
      user,
      action,
      module,
      recordId: recordId ? String(recordId) : null,
      ip,
      userAgent,
      before,
      after,
      details
    });
  } catch (err) {
    console.error('[Audit Service Error]:', err.message);
  }
};

module.exports = { recordAudit };
