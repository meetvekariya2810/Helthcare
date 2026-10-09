const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const { ROLES, PERMISSIONS, ROLE_PERMISSIONS } = require('../config/rbac');
const bcrypt = require('bcryptjs');

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.department) query.department = req.query.department;
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -passwordHash')
      .populate('facility', 'facilityName facilityCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -passwordHash')
      .populate('facility', 'facilityName facilityCode')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// POST /api/users
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, employeeId, facility, permissions, phone } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const initialPassword = password || 'TempPass@2026!';
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: initialPassword,
      role: role || 'EMPLOYEE',
      department: department || 'General',
      employeeId: employeeId || null,
      facility: facility || null,
      permissions: permissions || [],
      phone: phone || '',
      status: 'ACTIVE',
      isActive: true,
      firstLogin: true,
      mustChangePassword: true
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'USER_CREATED',
      module: 'USERS',
      resource: 'User',
      resourceId: user._id,
      details: `Created user account for ${user.name} (${user.email}) with role ${user.role}`
    });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.passwordHash;

    res.status(201).json({
      success: true,
      message: 'User account created successfully.',
      data: userObj
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, role, department, employeeId, facility, permissions, phone, status, isActive } = req.body;

    // Security Rule: A user cannot change their own role through this endpoint
    if (req.user && req.user._id.toString() === req.params.id && role && role !== req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Users cannot escalate or change their own role.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const beforeState = { role: user.role, status: user.status, isActive: user.isActive, department: user.department };

    if (name) user.name = name;
    if (role) user.role = role;
    if (department) user.department = department;
    if (employeeId !== undefined) user.employeeId = employeeId;
    if (facility !== undefined) user.facility = facility;
    if (permissions !== undefined) user.permissions = permissions;
    if (phone !== undefined) user.phone = phone;
    if (status !== undefined) {
      user.status = status;
      user.isActive = status === 'ACTIVE';
    }
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    await user.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'USER_UPDATED',
      module: 'USERS',
      resource: 'User',
      resourceId: user._id,
      before: beforeState,
      after: { role: user.role, status: user.status, isActive: user.isActive, department: user.department },
      details: `Updated user account details for ${user.email}`
    });

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id (Controlled soft-archive/disable, not direct hard deletion)
const disableUser = async (req, res, next) => {
  try {
    if (req.user && req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot disable your own active account.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = 'DISABLED';
    user.isActive = false;
    await user.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'USER_DISABLED',
      module: 'USERS',
      resource: 'User',
      resourceId: user._id,
      details: `Disabled user account ${user.email}`
    });

    res.json({ success: true, message: 'User account disabled successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/roles
const getRoles = async (req, res) => {
  const rolesList = Object.keys(ROLES).map(key => ({
    name: ROLES[key],
    permissions: ROLE_PERMISSIONS[ROLES[key]] || []
  }));
  res.json({ success: true, count: rolesList.length, data: rolesList });
};

// GET /api/permissions
const getPermissions = async (req, res) => {
  const permsList = Object.keys(PERMISSIONS).map(key => ({
    code: PERMISSIONS[key],
    description: key.replace(/_/g, ' ').toLowerCase()
  }));
  res.json({ success: true, count: permsList.length, data: permsList });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  disableUser,
  getRoles,
  getPermissions
};
