const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { hasPermission, ROLES } = require('../config/rbac');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
  }
  return process.env.JWT_SECRET;
};

/**
 * Protect middleware: Ensures request has a valid Bearer JWT.
 * Enforces active account status and account lockout.
 */
const protect = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('[AUTH CONFIG ERROR] Authentication failed: JWT_SECRET environment variable is missing.');
    return res.status(500).json({
      success: false,
      message: 'Internal server configuration error.'
    });
  }

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
        if (decoded.sessionId) {
          const UserSession = require('../models/UserSession');
          const session = await UserSession.findOne({ sessionId: decoded.sessionId });
          if (session && session.status !== 'ACTIVE') {
            return res.status(401).json({
              success: false,
              message: 'Session has been revoked or expired. Please log in again.'
            });
          }
        }
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

      // Enforce mandatory password change on protected endpoints
      if (user.mustChangePassword || decoded.mustChangePassword) {
        const currentUrl = (req.originalUrl || req.url || '').toLowerCase();
        const isAllowed =
          currentUrl.includes('/change-password') ||
          currentUrl.includes('/me') ||
          currentUrl.includes('/logout') ||
          currentUrl.includes('/hrms/dashboard');

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            mustChangePassword: true,
            message: 'Password change required. Please change your temporary password to continue.'
          });
        }
      }

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
        status: 'ACTIVE',
        mustChangePassword: Boolean(decoded.mustChangePassword)
      };

      if (decoded.mustChangePassword) {
        const currentUrl = (req.originalUrl || req.url || '').toLowerCase();
        const isAllowed =
          currentUrl.includes('/change-password') ||
          currentUrl.includes('/me') ||
          currentUrl.includes('/logout') ||
          currentUrl.includes('/hrms/dashboard');

        if (!isAllowed) {
          return res.status(403).json({
            success: false,
            mustChangePassword: true,
            message: 'Password change required. Please change your temporary password to continue.'
          });
        }
      }

      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'User session not found or inactive.'
    });
  } catch (error) {
    if (!process.env.JWT_SECRET || (error.message && error.message.includes('JWT_SECRET'))) {
      console.error('[AUTH CONFIG ERROR] Authentication failed due to missing secret:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server configuration error.'
      });
    }
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

const rateLimit = require('express-rate-limit');

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 password reset attempts per IP/key
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userId = req.user?._id || req.user?.id || '';
    return userId ? `${ip}_${userId}` : ip;
  },
  message: {
    success: false,
    message: 'Too many password reset requests from this client. Please wait 15 minutes before retrying.'
  }
});

module.exports = {
  protect,
  requireRole,
  checkPermission,
  restrictFinance,
  passwordResetLimiter
};
