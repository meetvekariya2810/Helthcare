/**
 * BJK HEALTHCARE — LOGIN HISTORY & SESSION REPOSITORY
 * Tracks active JWT user sessions, login attempts, IP geography, and security lockouts
 */

const BaseRepository = require('./baseRepo');

class LoginHistoryRepository extends BaseRepository {
  constructor() {
    super('login_activities');
  }

  async recordLogin({ userId, email, ipAddress, userAgent, status = 'SUCCESS', failureReason = null }) {
    const res = await this.query(
      `INSERT INTO login_activities 
       (user_id, email, ip_address, user_agent, status, failure_reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [userId, email, ipAddress, userAgent, status, failureReason]
    );
    return res.rows[0];
  }

  async createSession({ userId, sessionId, tokenHash, ipAddress, userAgent, expiresAt }) {
    const res = await this.query(
      `INSERT INTO user_sessions 
       (user_id, session_id, token_hash, ip_address, user_agent, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [userId, sessionId, tokenHash, ipAddress, userAgent, expiresAt]
    );
    return res.rows[0];
  }

  async invalidateSession(sessionId) {
    const res = await this.query(
      `UPDATE user_sessions SET is_revoked = true, revoked_at = CURRENT_TIMESTAMP WHERE session_id = $1 RETURNING id;`,
      [sessionId]
    );
    return res.rows.length > 0;
  }

  async isSessionActive(sessionId) {
    const res = await this.query(
      `SELECT id FROM user_sessions 
       WHERE session_id = $1 AND is_revoked = false AND expires_at > CURRENT_TIMESTAMP;`,
      [sessionId]
    );
    return res.rows.length > 0;
  }
}

module.exports = new LoginHistoryRepository();
