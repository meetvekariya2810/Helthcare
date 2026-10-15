/**
 * BJK HEALTHCARE — POLICY & SETTINGS REPOSITORY
 * Manages leave policies (BJK-HR-POL-001), attendance policies, holidays, and employee clarifications
 */

const BaseRepository = require('./baseRepo');

class PolicyRepository extends BaseRepository {
  constructor() {
    super('leave_policies');
  }

  async getAllLeavePolicies() {
    const res = await this.query(`SELECT * FROM leave_policies ORDER BY policy_code ASC;`);
    return res.rows;
  }

  async getUpcomingHolidays(year = new Date().getFullYear()) {
    const res = await this.query(
      `SELECT * FROM workforce_holidays 
       WHERE date >= CURRENT_DATE AND (year = $1 OR EXTRACT(YEAR FROM date) = $1)
       ORDER BY date ASC;`,
      [year]
    );
    return res.rows;
  }

  async getPolicyClarifications(policyCode = null) {
    if (policyCode) {
      const res = await this.query(
        `SELECT * FROM policy_clarifications WHERE policy_code = $1 ORDER BY created_at DESC;`,
        [policyCode]
      );
      return res.rows;
    }
    const res = await this.query(`SELECT * FROM policy_clarifications ORDER BY created_at DESC;`);
    return res.rows;
  }
}

module.exports = new PolicyRepository();
