/**
 * BJK HEALTHCARE — ANALYTICS REPOSITORY
 * Codifies SQL equivalents of the 18 runtime Mongoose aggregation pipelines:
 * - Department headcount & distribution
 * - Workforce status & employment type breakdown
 * - Attendance KPIs, punch aggregates, and monthly muster rolls
 * - Leave utilization and balance statistics
 * - Expiry alerts and compliance health metrics
 */

const BaseRepository = require('./baseRepo');

class AnalyticsRepository extends BaseRepository {
  constructor() {
    super('employees');
  }

  // 1. Department Headcount & Gender Breakdown
  async getDepartmentHeadcount() {
    const res = await this.query(`
      SELECT 
        COALESCE(department_name, 'Unassigned') AS department,
        COUNT(*)::int AS count,
        COUNT(CASE WHEN LOWER(gender) = 'male' THEN 1 END)::int AS male_count,
        COUNT(CASE WHEN LOWER(gender) = 'female' THEN 1 END)::int AS female_count
      FROM employees
      WHERE employment_status = 'ACTIVE' OR employment_status IS NULL
      GROUP BY department_name
      ORDER BY count DESC;
    `);
    return res.rows;
  }

  // 2. Employment Type Breakdown (FULL_TIME, CONTRACT, PROBATION, INTERN)
  async getEmploymentTypeBreakdown() {
    const res = await this.query(`
      SELECT 
        COALESCE(employment_type, 'FULL_TIME') AS type,
        COUNT(*)::int AS count
      FROM employees
      GROUP BY employment_type
      ORDER BY count DESC;
    `);
    return res.rows;
  }

  // 3. Employment Status Breakdown (ACTIVE, PROBATION, NOTICE_PERIOD, SUSPENDED, TERMINATED)
  async getEmploymentStatusBreakdown() {
    const res = await this.query(`
      SELECT 
        COALESCE(employment_status, 'ACTIVE') AS status,
        COUNT(*)::int AS count
      FROM employees
      GROUP BY employment_status
      ORDER BY count DESC;
    `);
    return res.rows;
  }

  // 4. Daily Attendance KPIs (Present, Absent, Late, On-Leave)
  async getDailyAttendanceKPIs(dateStr) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const res = await this.query(`
      SELECT 
        COUNT(*)::int AS total_punches,
        COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::int AS present_count,
        COUNT(CASE WHEN status = 'LATE' THEN 1 END)::int AS late_count,
        COUNT(CASE WHEN status = 'HALF_DAY' THEN 1 END)::int AS half_day_count,
        COUNT(CASE WHEN status = 'ABSENT' THEN 1 END)::int AS absent_count
      FROM attendances
      WHERE date = $1 OR punch_date = $1 OR date::text LIKE $1 || '%';
    `, [targetDate]);
    return res.rows[0];
  }

  // 5. Monthly Muster Roll Summary
  async getMonthlyMusterRoll(month, year) {
    const res = await this.query(`
      SELECT 
        e.employee_id AS emp_code,
        e.first_name || ' ' || e.last_name AS employee_name,
        e.department_name AS department,
        COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END)::int AS total_present,
        COUNT(CASE WHEN a.status = 'LATE' THEN 1 END)::int AS total_late,
        COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END)::int AS total_absent,
        COUNT(CASE WHEN a.status = 'HALF_DAY' THEN 1 END)::int AS total_half_day
      FROM employees e
      LEFT JOIN attendances a ON (a.employee_id = e.id OR a.source_employee_id = e.source_mongo_id)
        AND a.month = $1 AND a.year = $2
      GROUP BY e.id, e.employee_id, e.first_name, e.last_name, e.department_name
      ORDER BY e.employee_id ASC;
    `, [month, year]);
    return res.rows;
  }

  // 6. Leave Statistics by Type & Department
  async getLeaveStatistics(year = new Date().getFullYear()) {
    const res = await this.query(`
      SELECT 
        lt.code AS leave_type,
        lt.name AS leave_name,
        COALESCE(SUM(lb.opening_balance + lb.accrued), 0)::numeric AS total_credited,
        COALESCE(SUM(lb.taken), 0)::numeric AS total_used,
        COALESCE(SUM(lb.closing_balance), 0)::numeric AS total_available
      FROM leave_types lt
      LEFT JOIN leave_balances lb ON lb.leave_type_id = lt.id AND lb.year = $1
      GROUP BY lt.id, lt.code, lt.name
      ORDER BY lt.code ASC;
    `, [year]);
    return res.rows;
  }

  // 7. Department Leave Utilization
  async getDepartmentLeaveUtilization() {
    const res = await this.query(`
      SELECT 
        COALESCE(e.department_name, 'General') AS department,
        COUNT(lr.id)::int AS leave_applications_count,
        COALESCE(SUM(lr.days_count), 0)::numeric AS total_days_taken
      FROM employees e
      JOIN leave_requests lr ON (lr.employee_id = e.id OR lr.source_employee_id = e.source_mongo_id)
      WHERE lr.status = 'APPROVED'
      GROUP BY e.department_name
      ORDER BY total_days_taken DESC;
    `);
    return res.rows;
  }

  // 8. Pending Document Checklist Count
  async getPendingDocumentsCount() {
    const res = await this.query(`
      SELECT 
        COALESCE(e.department_name, 'General') AS department,
        COUNT(*)::int AS pending_docs_count
      FROM employees e
      WHERE e.documents IS NULL OR e.documents = '[]'::jsonb
      GROUP BY e.department_name;
    `);
    return res.rows;
  }
}

module.exports = new AnalyticsRepository();
