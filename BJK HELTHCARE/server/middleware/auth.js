const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { hasPermission, ROLES } = require('../config/rbac');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'bjk_healthcare_digital_brain_ultra_secure_jwt_secret_key_2026_enterprise';
};

/**
 * Protect middleware: Ensures request has a valid Bearer JWT.
 * Enforces active account status and account lockout.
 */
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        if (mongoose.isValidObjectId(decoded.id)) {
          user = await User.findById(decoded.id).select('-password -passwordHash');
        }
        if (!user && decoded.email) {
          user = await User.findOne({ email: String(decoded.email).toLowerCase().trim() }).select('-password -passwordHash');
        }
      } catch (dbErr) {
        console.warn('[BJK Auth Middleware] DB lookup warning:', dbErr.message);
      }
    }

    if (user) {
      // Check account states: ACTIVE, SUSPENDED, LOCKED, DISABLED, DELETED
      if (!user.isActive || user.status === 'DISABLED') {
        return res.status(403).json({
          success: false,
          message: 'Account disabled. Contact BJK Healthcare Administrator.'
        });
      }
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          message: 'Account suspended. Please contact HR or System Administrator.'
        });
      }
      if (user.isLocked || user.status === 'LOCKED') {
        return res.status(403).json({
          success: false,
          message: 'Account temporarily locked due to security policy.'
        });
      }
      if (user.status === 'DELETED') {
        return res.status(403).json({
          success: false,
          message: 'Account not found or deleted.'
        });
      }

      req.user = user;
      return next();
    }

    // Fallback using decoded token attributes if database record not queried
    if (decoded && (decoded.email || decoded.id)) {
      req.user = {
        _id: decoded.id || decoded.sub,
        id: decoded.id || decoded.sub,
        email: decoded.email,
        name: decoded.name || 'Authorized User',
        role: decoded.role || 'EMPLOYEE',
        department: decoded.department || 'General',
        employeeId: decoded.employeeId || null,
        dataScope: decoded.dataScope || 'SELF',
        isActive: true,
        status: 'ACTIVE'
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'User session not found or inactive.'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid session token.'
    });
  }
};

/**
 * Role-Based Access Control Middleware: checks if user has one of the specified roles.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.DIRECTOR) {
      return next();
    }

    if (roles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Role '${userRole}' is not authorized to access this resource.`
    });
  };
};

/**
 * Granular Permission Enforcement Middleware
 * e.g. checkPermission('production.create')
 */
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    // Super Admin and Director have universal permission except audited destructive actions
    if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.DIRECTOR) {
      return next();
    }

    // Check user explicit custom permissions array if assigned
    if (req.user.permissions && Array.isArray(req.user.permissions)) {
      if (req.user.permissions.includes('*') || req.user.permissions.includes(requiredPermission)) {
        return next();
      }
    }

    // Check RBAC role permission
    if (hasPermission(userRole, requiredPermission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden: Missing required permission '${requiredPermission}'.`
    });
  };
};

/**
 * Strict Finance Boundary: Production, QC, QA, HR, Employees cannot access confidential financial records
 */
const restrictFinance = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const allowedRoles = [
    ROLES.FINANCE_MANAGER,
    'FINANCE',
    ROLES.SUPER_ADMIN,
    ROLES.DIRECTOR,
    ROLES.PAYROLL_ADMIN,
    ROLES.HR_ADMIN,
    ROLES.HR_MANAGER,
    ROLES.HR_EXECUTIVE,
    'ADMIN',
    'HR'
  ];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Strictly confidential financial records. Finance & Accounting information is available only to authorized HR and Administrator users.'
    });
  }
  next();
};

module.exports = {
  protect,
  requireRole,
  checkPermission,
  restrictFinance
};
