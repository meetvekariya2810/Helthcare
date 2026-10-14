/**
 * BJK HEALTHCARE — AUDIT LOG REPOSITORY
 * 21 CFR Part 11 / GxP append-only immutable audit trail.
 */

const BaseRepository = require('./baseRepo');

class AuditRepository extends BaseRepository {
  constructor() {
    super('audit_logs');
  }

  async log({
    actorId = null,
    actorName = 'System',
    actorRole = 'SYSTEM',
    actorEmail = 'system@bjk.com',
    action,
    entityType,
    entityId = null,
    ipAddress = null,
    userAgent = null,
    route = null,
    method = null,
    previousState = {},
    newState = {},
    diff = {},
    status = 'SUCCESS'
  }) {
    const res = await this.query(
      `INSERT INTO audit_logs (
        actor_id, actor_name, actor_role, actor_email, action,
        entity_type, entity_id, ip_address, user_agent, route,
        method, previous_state, new_state, diff, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, created_at;`,
      [
        actorId, actorName, actorRole, actorEmail, action,
        entityType, entityId ? String(entityId) : null, ipAddress, userAgent, route,
        method, JSON.stringify(previousState), JSON.stringify(newState), JSON.stringify(diff), status
      ]
    );
    return res.rows[0];
  }

  async listLogs({ page = 1, limit = 50, action, entityType, actorRole, startDate, endDate }) {
    const conditions = [];
    const params = [];

    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }

    if (entityType) {
      params.push(entityType);
      conditions.push(`entity_type = $${params.length}`);
    }

    if (actorRole) {
      params.push(actorRole);
      conditions.push(`actor_role = $${params.length}`);
    }

    if (startDate) {
      params.push(startDate);
      conditions.push(`created_at >= $${params.length}`);
    }

    if (endDate) {
      params.push(endDate);
      conditions.push(`created_at <= $${params.length}`);
    }

    const where = conditions.length ? conditions.join(' AND ') : '';
    return this.paginate({
      page,
      limit,
      where,
      params,
      orderBy: 'created_at DESC',
      allowlist: ['created_at', 'action', 'entity_type']
    });
  }
}

module.exports = new AuditRepository();
