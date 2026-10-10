const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'bjk_healthcare_digital_brain_ultra_secure_jwt_secret_key_2026_enterprise';

/**
 * Normalizes roles into standard uppercase tokens
 */
const normalizeRole = (role) => {
  if (!role) return 'EMPLOYEE';
  const clean = String(role).toUpperCase().replace(/\s+/g, '_');
  if (clean === 'SENIOR_EMPLOYEE' || clean === 'SENIOREMPLOYEE') return 'SENIOR_EMPLOYEE';
  if (clean === 'TEAM_LEAD' || clean === 'TEAMLEAD') return 'TEAM_LEAD';
  if (clean === 'MANAGER' || clean === 'DEPARTMENT_MANAGER') return 'MANAGER';
  return clean;
};

/**
 * Authenticates current employee via JWT token.
 * Extracts employeeId, role, userId from token and verifies database presence.
 */
const authenticateEmployee = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided. Please log in to Employee Portal.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify token type (if specified) or presence of identity
    const employeeId = decoded.employeeId || decoded.empId;
    const userId = decoded.userId || decoded.id;

    if (!employeeId && !userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token: Missing employee identity credentials.'
      });
    }

    let user = null;
    let employee = null;

    if (mongoose.connection.readyState === 1) {
      // Find employee document
      if (employeeId) {
        employee = await Employee.findOne({
          $or: [
            { employeeId: employeeId.toUpperCase() },
            { employeeCode: employeeId.toUpperCase() }
          ]
        });
      }

      // Find user document
      if (userId && mongoose.isValidObjectId(userId)) {
        user = await User.findById(userId).select('-password -passwordHash');
      } else if (employee && employee.user) {
        user = await User.findById(employee.user).select('-password -passwordHash');
      } else if (decoded.email) {
        user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password -passwordHash');
      }
    }

    // If database lookup didn't find them, but decoded token has valid payload
    if (!employee && decoded.employeeId) {
      employee = {
        employeeId: decoded.employeeId,
        firstName: decoded.name ? decoded.name.split(' ')[0] : 'Employee',
        lastName: decoded.name ? decoded.name.split(' ').slice(1).join(' ') : '',
        fullName: decoded.name || 'BJK Employee',
        email: decoded.email || `${decoded.employeeId.toLowerCase()}@bjkhealthcare.com`,
        department: decoded.department || 'Operations',
        designation: decoded.designation || 'Staff',
        systemRole: decoded.role || 'EMPLOYEE'
      };
    }

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Employee record not found. Please contact BJK HR Department.'
      });
    }

    const determinedRole = normalizeRole(
      (user && user.role) || (employee && employee.systemRole) || decoded.role || 'EMPLOYEE'
    );

    // Attach to request
    req.user = user || {
      _id: userId || employee._id,
      email: employee.email,
      name: employee.fullName,
      role: determinedRole,
      employeeId: employee.employeeId
    };

    req.employee = employee;
    req.employeeId = (employee.employeeId || decoded.employeeId).toUpperCase();
    req.employeeRole = determinedRole;

    // Enforce mandatory password change on protected endpoints
    const mustChangePassword = Boolean(
      (user && user.mustChangePassword) ||
      (employee && employee.mustChangePassword) ||
      decoded.mustChangePassword
    );

    if (mustChangePassword) {
      const currentUrl = (req.originalUrl || req.url || '').toLowerCase();
      const isAllowed =
        currentUrl.includes('/change-password') ||
        currentUrl.includes('/me') ||
        currentUrl.includes('/logout');

      if (!isAllowed) {
        return res.status(403).json({
          success: false,
          mustChangePassword: true,
          message: 'Password change required before accessing employee portal services.'
        });
      }
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or forged authentication token. Access denied.'
    });
  }
};

/**
 * Strict Ownership Authorization Middleware:
 * An employee may ONLY access their own data.
 * Checks route params, query string, and body. If another employee's ID is requested,
 * validates whether the authenticated user has manager/team-lead rights over that specific employee.
 */
const authorizeOwnership = (req, res, next) => {
  const currentEmpId = req.employeeId;
  const requestedEmpId = (
    req.params.employeeId ||
    req.params.id ||
    req.query.employeeId ||
    req.body.employeeId ||
    ''
  ).trim().toUpperCase();

  // If no other employee is requested, default to own employeeId
  if (!requestedEmpId || requestedEmpId === currentEmpId) {
    return next();
  }

  // If requesting someone else's ID:
  const role = req.employeeRole;
  if (role === 'MANAGER' || role === 'TEAM_LEAD') {
    // If team lead or manager, verify if target is in team/direct reports
    const employee = req.employee;
    const directReports = (employee.teamStructure?.directReports || []).map(id => id.toUpperCase());
    const teamMembers = (employee.teamStructure?.teamMembers || []).map(id => id.toUpperCase());

    if (directReports.includes(requestedEmpId) || teamMembers.includes(requestedEmpId)) {
      return next();
    }
  }

  // Deny access
  return res.status(403).json({
    success: false,
    message: 'Access Forbidden: You are not authorized to view or modify confidential information belonging to another employee.'
  });
};

/**
 * Role-Based Access Control Middleware for Employee sub-roles
 */
const authorizeEmployeeRoles = (...roles) => {
  const normalizedAllowed = roles.map(r => normalizeRole(r));
  return (req, res, next) => {
    if (!req.employeeRole) {
      return res.status(403).json({
        success: false,
        message: 'No employee role assigned.'
      });
    }

    if (normalizedAllowed.includes(req.employeeRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access Forbidden: Your role (${req.employeeRole}) does not have permission to perform this action.`
    });
  };
};

/**
 * Helper to write audit log entries for employee actions
 */
const logEmployeeAudit = async ({ employeeId, action, details, ipAddress, userAgent, result = 'SUCCESS' }) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await AuditLog.create({
        user: {
          name: String(employeeId),
          email: `${String(employeeId).toLowerCase()}@bjkhealthcare.com`,
          role: 'EMPLOYEE'
        },
        action: `EMPLOYEE_${action}`,
        module: 'EMPLOYEE_SELF_SERVICE',
        ipAddress: ipAddress || '127.0.0.1',
        details: typeof details === 'object' ? JSON.stringify(details) : String(details),
        status: result
      }).catch(err => console.warn('[Employee Audit Log Warning]:', err.message));
    }
  } catch (err) {
    console.warn('[Employee Audit Log Warning]:', err.message);
  }
};

module.exports = {
  authenticateEmployee,
  authorizeOwnership,
  authorizeEmployeeRoles,
  logEmployeeAudit,
  normalizeRole
};
