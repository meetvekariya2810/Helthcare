const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');
const { PERMISSIONS } = require('../config/rbac');
const { getPool, isDBConnected: isPgConnected } = require('../config/postgres');

function formatPostgresAuditRow(row) {
  const extra = row.legacy_extra || {};
  return {
    _id: row.source_mongo_id || row.id,
    id: row.id,
    user: extra.user || {
      name: row.actor_name || 'System',
      role: row.actor_role || 'SYSTEM',
      email: row.actor_email || 'system@bjkhealthcare.com'
    },
    action: row.action,
    module: extra.module || row.entity_type || 'SYSTEM',
    recordId: row.entity_id || extra.recordId || null,
    ip: extra.ip || row.ip_address || '127.0.0.1',
    details: extra.details || `${row.action} on ${row.entity_type || 'resource'}`,
    createdAt: row.created_at,
    before: row.previous_state || extra.before || null,
    after: row.new_state || extra.after || null,
    status: row.status || 'SUCCESS'
  };
}

// GET /api/audit
router.get('/', protect, requirePermission(PERMISSIONS.AUDIT_VIEW), async (req, res) => {
  try {
    const { module, action, page = 1, limit = 30 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    if (await isPgConnected()) {
      const pool = getPool();
      const conditions = [];
      const params = [];

      if (module && module !== 'ALL') {
        params.push(module);
        conditions.push(`(entity_type = $${params.length} OR legacy_extra->>'module' = $${params.length})`);
      }
      if (action) {
        params.push(action);
        conditions.push(`action = $${params.length}`);
      }

      const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM audit_logs ${whereClause};`, params);
      const total = countRes.rows[0].count;

      const logsRes = await pool.query(
        `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
        [...params, limitNum, skip]
      );

      return res.json({
        success: true,
        logs: logsRes.rows.map(formatPostgresAuditRow),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1
        }
      });
    }

    const query = {};
    if (module && module !== 'ALL') query.module = module;
    if (action) query.action = action;

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
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    if (await isPgConnected()) {
      const pool = getPool();
      const conditions = [];
      const params = [];

      if (employeeId) {
        params.push(employeeId);
        conditions.push(`(entity_id = $${params.length} OR legacy_extra->>'recordId' = $${params.length} OR legacy_extra->'targetUser'->>'employeeId' = $${params.length})`);
      } else {
        conditions.push(`(entity_type IN ('HRMS', 'EMPLOYEE', 'AUTH') OR legacy_extra->>'module' IN ('HRMS', 'EMPLOYEE', 'AUTH') OR legacy_extra->>'resource' IN ('Employee', 'EmployeeMaster'))`);
      }

      const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
      const countRes = await pool.query(`SELECT COUNT(*)::int AS count FROM audit_logs ${whereClause};`, params);
      const total = countRes.rows[0].count;

      const logsRes = await pool.query(
        `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`,
        [...params, limitNum, skip]
      );

      return res.json({
        success: true,
        logs: logsRes.rows.map(formatPostgresAuditRow),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1
        }
      });
    }

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
