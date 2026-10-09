const { hasPermission, ROLES } = require('../config/rbac');
const {
  hasModuleAccess,
  hasActionAccess,
  hasApprovalAccess,
  resolveEffectivePermissions
} = require('../config/accessControlTemplates');

/**
 * Granular Permission Enforcement Middleware
 * Respects HR-customized accessConfig overrides over role templates
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated user' });
    }

    const role = (req.user.role || '').toUpperCase();
    if (role === ROLES.SUPER_ADMIN || role === ROLES.DIRECTOR || role === 'ADMIN' || role === 'SYSTEM_ADMINISTRATOR') {
      return next();
    }

    // Check custom permissions list
    if (req.user.permissions && Array.isArray(req.user.permissions)) {
      if (req.user.permissions.includes('*') || req.user.permissions.includes(permission)) {
        return next();
      }
    }

    // Check effective permissions from HR accessConfig if set
    if (req.user.accessConfig) {
      const effective = resolveEffectivePermissions(req.user);
      const permParts = permission.split(/[\.:]/);
      const mod = permParts[0];
      const act = permParts[1] || 'view';

      // If module is disabled in custom accessConfig, reject access immediately!
      if (!effective.allowedModules.includes(mod)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Access to module [${mod}] has been restricted by HR Administration.`
        });
      }

      // If action is explicitly allowed
      const modActions = effective.allowedActions[mod] || [];
      if (modActions.includes(act) || modActions.includes('*')) {
        return next();
      }

      // If checking approval action
      if (act === 'approve' || act.includes('approval')) {
        const matchingApproval = effective.approvalPermissions.some(a => a.startsWith(mod));
        if (matchingApproval) return next();
      }
    }

    // Fallback to standard RBAC matrix
    if (hasPermission(role, permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Lacks required permission [${permission}].`
    });
  };
};

/**
 * Role checking middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated user' });
    }

    const role = (req.user.role || '').toUpperCase();
    if (role === ROLES.SUPER_ADMIN || role === ROLES.DIRECTOR || role === 'ADMIN' || role === 'SYSTEM_ADMINISTRATOR') {
      return next();
    }

    if (roles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Action requires one of roles [${roles.join(', ')}].`
    });
  };
};

/**
 * Module-level boundary enforcement
 */
const requireModule = (moduleId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (hasModuleAccess(req.user, moduleId)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `403 Access Denied: You do not have permission to access the [${moduleId}] module.`
    });
  };
};

/**
 * Approval-level responsibility enforcement
 */
const requireApproval = (approvalKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (hasApprovalAccess(req.user, approvalKey)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `403 Access Denied: Missing required approval permission [${approvalKey}].`
    });
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireModule,
  requireApproval
};
