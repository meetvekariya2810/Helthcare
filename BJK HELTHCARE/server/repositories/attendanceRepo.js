/**
 * BJK HEALTHCARE — ATTENDANCE & BIOMETRIC REPOSITORY
 */

const BaseRepository = require('./baseRepo');

class AttendanceRepository extends BaseRepository {
  constructor() {
    super('attendances');
  }

  async findByEmployeeAndDate(employeeCode, date) {
    const res = await this.query(
      `SELECT * FROM attendances WHERE employee_code = $1 AND date = $2;`,
      [employeeCode, date]
    );
    return res.rows[0] || null;
  }

  async listAttendances({ page = 1, limit = 50, employeeCode, department, date, status }) {
    const conditions = [];
    const params = [];

    if (employeeCode) {
      params.push(employeeCode);
      conditions.push(`employee_code = $${params.length}`);
    }

    if (department) {
      params.push(department);
      conditions.push(`department_name = $${params.length}`);
    }

    if (date) {
      params.push(date);
      conditions.push(`date = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? conditions.join(' AND ') : '';
    return this.paginate({
      page,
      limit,
      where,
      params,
      orderBy: 'date DESC, employee_code ASC',
      allowlist: ['date', 'employee_code', 'created_at']
    });
  }

  async getAttendanceKPIs(date) {
    const totalRes = await this.query(`SELECT COUNT(*)::int AS total FROM employees WHERE employment_status = 'ACTIVE';`);
    const presentRes = await this.query(`SELECT COUNT(*)::int AS present FROM attendances WHERE date = $1 AND status = 'PRESENT';`, [date]);
    const absentRes = await this.query(`SELECT COUNT(*)::int AS absent FROM attendances WHERE date = $1 AND status = 'ABSENT';`, [date]);
    const onLeaveRes = await this.query(`SELECT COUNT(*)::int AS on_leave FROM attendances WHERE date = $1 AND status = 'ON_LEAVE';`, [date]);

    return {
      totalEmployees: totalRes.rows[0].total,
      present: presentRes.rows[0].present,
      absent: absentRes.rows[0].absent,
      onLeave: onLeaveRes.rows[0].on_leave,
      attendanceRate: totalRes.rows[0].total > 0 ? ((presentRes.rows[0].present / totalRes.rows[0].total) * 100).toFixed(1) : '0.0'
    };
  }

  async getMonthlySummary(employeeCode, month, year) {
    const res = await this.query(
      `SELECT * FROM attendance_monthly_summaries WHERE employee_code = $1 AND month = $2 AND year = $3;`,
      [employeeCode, month, year]
    );
    return res.rows[0] || null;
  }
}

module.exports = new AttendanceRepository();
