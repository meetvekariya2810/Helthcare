/**
 * BJK HEALTHCARE — USER & AUTHENTICATION REPOSITORY
 */

const BaseRepository = require('./baseRepo');
const bcrypt = require('bcryptjs');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    if (!email) return null;
    const res = await this.query(
      `SELECT u.*, r.permissions 
       FROM users u
       LEFT JOIN roles r ON r.name = u.role
       WHERE LOWER(u.email) = LOWER($1);`,
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  async findByUsername(username) {
    if (!username) return null;
    const res = await this.query(
      `SELECT * FROM users WHERE LOWER(username) = LOWER($1);`,
      [username.trim()]
    );
    return res.rows[0] || null;
  }

  async verifyPassword(user, plainPassword) {
    if (!user || !user.password_hash || !plainPassword) return false;
    return bcrypt.compare(plainPassword, user.password_hash);
  }

  async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  }

  async createUser({ email, username, password, role = 'EMPLOYEE', profile = {} }) {
    const passwordHash = password ? await this.hashPassword(password) : null;
    const res = await this.query(
      `INSERT INTO users (email, username, password_hash, role, profile)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, role, is_active, created_at;`,
      [email.toLowerCase(), username || email.split('@')[0], passwordHash, role, JSON.stringify(profile)]
    );
    return res.rows[0];
  }

  async recordFailedLogin(email) {
    const res = await this.query(
      `UPDATE users 
       SET failed_login_attempts = failed_login_attempts + 1,
           is_locked = CASE WHEN failed_login_attempts + 1 >= 5 THEN true ELSE is_locked END,
           locked_until = CASE WHEN failed_login_attempts + 1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE locked_until END,
           updated_at = CURRENT_TIMESTAMP
       WHERE LOWER(email) = LOWER($1)
       RETURNING failed_login_attempts, is_locked;`,
      [email.toLowerCase()]
    );
    return res.rows[0] || null;
  }

  async resetFailedLogins(email) {
    await this.query(
      `UPDATE users 
       SET failed_login_attempts = 0, is_locked = false, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE LOWER(email) = LOWER($1);`,
      [email.toLowerCase()]
    );
  }

  async recordLoginActivity({ userId, email, status, ipAddress, userAgent, failureReason }) {
    await this.query(
      `INSERT INTO login_activities (user_id, email, status, ip_address, user_agent, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [userId || null, email, status, ipAddress || null, userAgent || null, failureReason || null]
    );
  }
}

module.exports = new UserRepository();
