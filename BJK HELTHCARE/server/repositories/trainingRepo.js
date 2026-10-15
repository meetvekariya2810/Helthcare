/**
 * BJK HEALTHCARE — TRAINING & CREDENTIAL REPOSITORY
 * Manages training programs, enrollments, credentials, certifications, and compliance tracking
 */

const BaseRepository = require('./baseRepo');

class TrainingRepository extends BaseRepository {
  constructor() {
    super('training_programs');
  }

  async getActivePrograms() {
    const res = await this.query(`SELECT * FROM training_programs ORDER BY title ASC;`);
    return res.rows;
  }

  async getEmployeeEnrollments(employeeId) {
    const res = await this.query(
      `SELECT te.*, tp.title AS program_title, tp.category, tp.validity_days
       FROM training_enrollments te
       JOIN training_programs tp ON tp.id = te.program_id
       WHERE te.employee_id = $1 OR te.source_employee_id = $1
       ORDER BY te.enrolled_at DESC;`,
      [employeeId]
    );
    return res.rows;
  }

  async getExpiringCredentials(withinDays = 30) {
    const res = await this.query(
      `SELECT c.*, e.first_name, e.last_name, e.employee_id AS emp_code, e.department
       FROM credentials c
       JOIN employees e ON e.id = c.employee_id OR e.source_mongo_id = c.source_employee_id
       WHERE c.expiry_date IS NOT NULL 
         AND c.expiry_date <= CURRENT_TIMESTAMP + ($1 || ' days')::interval
         AND c.expiry_date > CURRENT_TIMESTAMP
       ORDER BY c.expiry_date ASC;`,
      [withinDays]
    );
    return res.rows;
  }
}

module.exports = new TrainingRepository();
