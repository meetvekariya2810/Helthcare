/**
 * BJK HEALTHCARE — NOTIFICATION REPOSITORY
 * Handles HR broadcasts, role-targeted announcements, and personal alerts
 */

const BaseRepository = require('./baseRepo');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('hr_notifications');
  }

  async getEmployeeNotifications(employeeId, role = null) {
    const res = await this.query(
      `SELECT * FROM hr_notifications 
       WHERE (target_employee_id = $1 OR target_role = $2 OR target_role = 'ALL' OR target_role IS NULL)
       ORDER BY created_at DESC LIMIT 50;`,
      [employeeId, role]
    );
    return res.rows;
  }

  async createBroadcast({ title, message, targetRole = 'ALL', priority = 'NORMAL', createdBy }) {
    const res = await this.query(
      `INSERT INTO hr_notifications 
       (title, message, target_role, priority, created_by, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [title, message, targetRole, priority, createdBy]
    );
    return res.rows[0];
  }

  async markAsRead(notificationId) {
    const res = await this.query(
      `UPDATE hr_notifications SET is_read = true WHERE id = $1 RETURNING id;`,
      [notificationId]
    );
    return res.rows.length > 0;
  }
}

module.exports = new NotificationRepository();
