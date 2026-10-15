/**
 * BJK HEALTHCARE — SHIFT & ROSTER REPOSITORY
 * Manages shifts, work schedules, rosters, and cleanroom qualification gating
 */

const BaseRepository = require('./baseRepo');

class ShiftRepository extends BaseRepository {
  constructor() {
    super('shifts');
  }

  async getAllActiveShifts() {
    const res = await this.query(
      `SELECT * FROM shifts WHERE is_active = true ORDER BY start_time ASC;`
    );
    return res.rows;
  }

  async findByShiftCode(code) {
    if (!code) return null;
    const res = await this.query(`SELECT * FROM shifts WHERE code = $1;`, [code]);
    return res.rows[0] || null;
  }

  async getEmployeeWorkSchedule(employeeId) {
    const res = await this.query(
      `SELECT ws.*, s.name AS shift_name, s.start_time, s.end_time
       FROM work_schedules ws
       LEFT JOIN shifts s ON s.id = ws.shift_id
       WHERE ws.employee_id = $1 OR ws.source_employee_id = $1
       ORDER BY ws.effective_from DESC LIMIT 1;`,
      [employeeId]
    );
    return res.rows[0] || null;
  }

  async checkCleanroomQualification(employeeId, shiftId) {
    // Blocks assignment to cleanroom shift if employee lacks active training certification
    const res = await this.query(
      `SELECT te.status, te.expires_at, tp.category
       FROM training_enrollments te
       JOIN training_programs tp ON tp.id = te.program_id
       WHERE (te.employee_id = $1 OR te.source_employee_id = $1)
         AND tp.category ILIKE '%cleanroom%'
         AND te.status = 'COMPLETED'
         AND (te.expires_at IS NULL OR te.expires_at > CURRENT_TIMESTAMP);`,
      [employeeId]
    );
    return res.rows.length > 0;
  }
}

module.exports = new ShiftRepository();
