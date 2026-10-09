const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/rbac');

// GET /api/audit
router.get('/', protect, requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const { module, action, page = 1, limit = 30 } = req.query;
    const query = {};
    if (module && module !== 'ALL') query.module = module;
    if (action) query.action = action;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/audit/employees
router.get('/employees', protect, requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const { page = 1, limit = 50, employeeId } = req.query;
    const query = {
      $or: [
        { module: { $in: ['HRMS', 'EMPLOYEE', 'AUTH'] } },
        { resource: 'Employee' },
        { resource: 'EmployeeMaster' },
        { 'targetUser.employeeId': employeeId }
      ]
    };
    if (employeeId) {
      query.$or = [
        { 'targetUser.employeeId': employeeId },
        { resourceId: employeeId },
        { recordId: employeeId }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
