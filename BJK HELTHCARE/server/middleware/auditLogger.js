const AuditLog = require('../models/AuditLog');

const auditAction = (moduleName, actionName) => {
  return async (req, res, next) => {
    // Intercept res.json to capture response status and record log
    const originalJson = res.json;

    res.json = function(data) {
      res.json = originalJson;

      // Asynchronously log audit entry without delaying HTTP response
      setImmediate(async () => {
        try {
          if (data && data.success !== false) {
            await AuditLog.logAction({
              user: req.user || null,
              action: actionName || req.method,
              module: moduleName || 'SYSTEM',
              resource: req.baseUrl ? req.baseUrl.replace('/api/', '') : 'API',
              resourceId: req.params.id || data?.data?._id || data?.id || null,
              oldData: req.body ? req.body._oldData : null,
              newData: req.method !== 'GET' ? req.body : null,
              ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
              userAgent: req.headers['user-agent'] || '',
              status: 'SUCCESS',
              details: `${actionName || req.method} executed on ${req.originalUrl}`
            });
          }
        } catch (err) {
          console.warn('[AuditLogger] Async logging note:', err.message);
        }
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = { auditAction };
