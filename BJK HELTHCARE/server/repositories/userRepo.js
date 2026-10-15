/**
 * BJK HEALTHCARE — USER & AUTHENTICATION REPOSITORY
 * Core identity, password verification, lockout policies, and credential administration
 */

const BaseRepository = require('./baseRepo');
const bcrypt = require('bcryptjs');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findById(id) {
    if (!id) return null;
    const res = await this.query(
      `SELECT u.*, r.permissions,
              e.id AS emp_uuid, e.employee_id AS emp_code, e.full_name AS emp_name,
              e.department_name AS emp_department, e.designation_title AS emp_designation
       FROM users u
       LEFT JOIN roles r ON r.name = u.role
       LEFT JOIN employees e ON e.user_id = u.id OR LOWER(e.email) = LOWER(u.email)
       WHERE u.id = $1::uuid OR u.source_mongo_id = $2
       LIMIT 1;`,
      [id.length === 36 ? id : '00000000-0000-0000-0000-000000000000', id]
    );
    return res.rows[0] || null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const res = await this.query(
      `SELECT u.*, r.permissions,
              e.id AS emp_uuid, e.employee_id AS emp_code, e.full_name AS emp_name,
              e.department_name AS emp_department, e.designation_title AS emp_designation
       FROM users u
       LEFT JOIN roles r ON r.name = u.role
       LEFT JOIN employees e ON e.user_id = u.id OR LOWER(e.email) = LOWER(u.email)
       WHERE LOWER(u.email) = LOWER($1)
       LIMIT 1;`,
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  async findByUsername(username) {
    if (!username) return null;
    const res = await this.query(
      `SELECT u.*, r.permissions,
              e.id AS emp_uuid, e.employee_id AS emp_code, e.full_name AS emp_name,
              e.department_name AS emp_department, e.designation_title AS emp_designation
       FROM users u
       LEFT JOIN roles r ON r.name = u.role
       LEFT JOIN employees e ON e.user_id = u.id OR LOWER(e.email) = LOWER(u.email)
       WHERE LOWER(u.username) = LOWER($1)
       LIMIT 1;`,
      [username.trim()]
    );
    return res.rows[0] || null;
  }

  async findByEmployeeId(empId) {
    if (!empId) return null;
    const clean = empId.trim().toUpperCase();
    const res = await this.query(
      `SELECT u.*, r.permissions,
              e.id AS emp_uuid, e.employee_id AS emp_code, e.full_name AS emp_name,
              e.department_name AS emp_department, e.designation_title AS emp_designation
       FROM employees e
       LEFT JOIN users u ON u.id = e.user_id OR LOWER(u.email) = LOWER(e.email)
       LEFT JOIN roles r ON r.name = u.role
       WHERE UPPER(e.employee_id) = $1
       LIMIT 1;`,
      [clean]
    );
    return res.rows[0] || null;
  }

  async findUserForAuth(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim();
    const lower = clean.toLowerCase();
    const upper = clean.toUpperCase();

    // 1. Direct query on users table joined with employee details
    const res = await this.query(
      `SELECT u.*, r.permissions,
              e.id AS emp_uuid, e.employee_id AS emp_code, e.full_name AS emp_name,
              e.department_name AS emp_department, e.designation_title AS emp_designation,
              e.phone AS emp_phone, e.password_hash AS emp_password_hash
       FROM users u
       LEFT JOIN roles r ON r.name = u.role
       LEFT JOIN employees e ON e.user_id = u.id OR LOWER(e.email) = LOWER(u.email)
       WHERE LOWER(u.email) = $1 
          OR LOWER(COALESCE(u.username, '')) = $1
          OR UPPER(COALESCE(e.employee_id, '')) = $2
          OR LOWER(COALESCE(e.personal_email, '')) = $1
          OR COALESCE(e.phone, '') = $3
       LIMIT 1;`,
      [lower, upper, clean]
    );

    if (res.rows.length > 0) return res.rows[0];

    // 2. Direct query on employees table for employee-portal accounts without user record
    const empRes = await this.query(
      `SELECT e.*, e.id AS emp_uuid, e.employee_id AS emp_code, e.full_name AS emp_name,
              e.department_name AS emp_department, e.designation_title AS emp_designation,
              e.password_hash AS emp_password_hash
       FROM employees e
       WHERE UPPER(e.employee_id) = $1 
          OR LOWER(e.email) = $2
          OR LOWER(COALESCE(e.personal_email, '')) = $2
          OR COALESCE(e.phone, '') = $3
       LIMIT 1;`,
      [upper, lower, clean]
    );

    if (empRes.rows.length > 0) {
      const emp = empRes.rows[0];
      return {
        id: emp.id,
        email: emp.email,
        username: emp.employee_id,
        password_hash: emp.password_hash || emp.emp_password_hash,
        role: 'EMPLOYEE',
        is_active: emp.is_active,
        is_locked: false,
        failed_login_attempts: 0,
        department_name: emp.department_name,
        designation_title: emp.designation_title,
        employee_id: emp.employee_id,
        emp_code: emp.employee_id,
        full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        isEmployeeDirect: true
      };
    }

    return null;
  }

  async verifyPassword(user, plainPassword) {
    if (!user || !plainPassword) return false;
    const hash = user.password_hash || user.password || user.emp_password_hash;
    if (!hash) return false;
    try {
      return await bcrypt.compare(plainPassword, hash);
    } catch (_) {
      return false;
    }
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

  async recordFailedLogin(userId, email) {
    const res = await this.query(
      `UPDATE users 
       SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
           is_locked = CASE WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 THEN true ELSE is_locked END,
           lockout_until = CASE WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes' ELSE lockout_until END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1::uuid OR LOWER(email) = LOWER($2)
       RETURNING failed_login_attempts, is_locked, lockout_until;`,
      [userId && userId.length === 36 ? userId : '00000000-0000-0000-0000-000000000000', email ? email.toLowerCase() : '']
    );
    return res.rows[0] || null;
  }

  async resetFailedLogins(userId, email) {
    await this.query(
      `UPDATE users 
       SET failed_login_attempts = 0, is_locked = false, lockout_until = NULL, last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1::uuid OR LOWER(email) = LOWER($2);`,
      [userId && userId.length === 36 ? userId : '00000000-0000-0000-0000-000000000000', email ? email.toLowerCase() : '']
    );
  }

  async updatePassword(userId, newPasswordHash, employeeCode = null) {
    await this.query(
      `UPDATE users
       SET password_hash = $1,
           failed_login_attempts = 0,
           is_locked = false,
           lockout_until = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2::uuid;`,
      [newPasswordHash, userId]
    );

    if (employeeCode) {
      await this.query(
        `UPDATE employees
         SET password_hash = $1,
             is_first_login = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE UPPER(employee_id) = UPPER($2);`,
        [newPasswordHash, employeeCode]
      );
    }
  }

  async toggleLock(userId, isLocked, reason = null) {
    const res = await this.query(
      `UPDATE users
       SET is_locked = $1,
           lockout_until = CASE WHEN $1 THEN CURRENT_TIMESTAMP + INTERVAL '24 hours' ELSE NULL END,
           failed_login_attempts = CASE WHEN NOT $1 THEN 0 ELSE failed_login_attempts END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2::uuid
       RETURNING id, email, is_locked;`,
      [Boolean(isLocked), userId]
    );
    return res.rows[0] || null;
  }

  async toggleActive(userId, isActive) {
    const res = await this.query(
      `UPDATE users
       SET is_active = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2::uuid
       RETURNING id, email, is_active;`,
      [Boolean(isActive), userId]
    );
    return res.rows[0] || null;
  }

  async updateRole(userId, newRole) {
    const res = await this.query(
      `UPDATE users
       SET role = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2::uuid
       RETURNING id, email, role;`,
      [newRole, userId]
    );
    return res.rows[0] || null;
  }

  async listCredentials({
    search,
    department,
    role,
    status,
    loginStatus,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    limit = 25
  }) {
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      conditions.push(`(u.email ILIKE $${params.length} OR u.username ILIKE $${params.length} OR e.full_name ILIKE $${params.length} OR e.employee_id ILIKE $${params.length})`);
    }

    if (department && department !== 'ALL') {
      params.push(department.trim());
      conditions.push(`e.department_name ILIKE $${params.length}`);
    }

    if (role && role !== 'ALL') {
      params.push(role.trim().toUpperCase());
      conditions.push(`u.role ILIKE $${params.length}`);
    }

    if (status && status !== 'ALL') {
      if (status.toUpperCase() === 'ACTIVE') {
        conditions.push(`u.is_active = true`);
      } else if (status.toUpperCase() === 'INACTIVE' || status.toUpperCase() === 'DISABLED') {
        conditions.push(`u.is_active = false`);
      }
    }

    if (loginStatus && loginStatus !== 'ALL') {
      if (loginStatus.toUpperCase() === 'LOCKED') {
        conditions.push(`u.is_locked = true`);
      } else if (loginStatus.toUpperCase() === 'ACTIVE') {
        conditions.push(`u.is_active = true AND u.is_locked = false`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const offset = (Math.max(1, page) - 1) * limit;

    const countRes = await this.query(
      `SELECT COUNT(*)::int AS total
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id OR LOWER(e.email) = LOWER(u.email)
       ${where};`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const dataRes = await this.query(
      `SELECT u.id, u.email, u.username, u.role, u.is_active, u.is_locked,
              u.failed_login_attempts, u.lockout_until, u.last_login_at, u.created_at,
              e.id AS employee_uuid, e.employee_id, e.full_name, e.department_name, e.designation_title
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id OR LOWER(e.email) = LOWER(u.email)
       ${where}
       ORDER BY u.${sortBy === 'name' ? 'username' : 'created_at'} ${safeOrder}
       LIMIT ${limit} OFFSET ${offset};`,
      params
    );

    return {
      data: dataRes.rows,
      pagination: {
        page: Math.max(1, page),
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
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
