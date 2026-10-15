/**
 * BJK HEALTHCARE — PERFORMANCE & APPRAISAL REPOSITORY
 * Handles performance cycles, reviews, 360 appraisals, and goal tracking
 */

const BaseRepository = require('./baseRepo');

class PerformanceRepository extends BaseRepository {
  constructor() {
    super('performance_reviews');
  }

  async getEmployeeReviews(employeeId) {
    const res = await this.query(
      `SELECT pr.*, pc.name AS cycle_name
       FROM performance_reviews pr
       LEFT JOIN performance_cycles pc ON pc.id = pr.cycle_id
       WHERE pr.employee_id = $1 OR pr.source_employee_id = $1
       ORDER BY pr.created_at DESC;`,
      [employeeId]
    );
    return res.rows;
  }

  async submitReview({ employeeId, reviewerId, cycleId, rating, comments, goalsAchieved }) {
    const res = await this.query(
      `INSERT INTO performance_reviews 
       (employee_id, reviewer_id, cycle_id, rating, comments, goals_achieved, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED')
       RETURNING *;`,
      [employeeId, reviewerId, cycleId, rating, comments, goalsAchieved]
    );
    return res.rows[0];
  }
}

module.exports = new PerformanceRepository();
