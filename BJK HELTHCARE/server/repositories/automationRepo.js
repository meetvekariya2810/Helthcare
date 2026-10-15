/**
 * BJK HEALTHCARE — AUTOMATION REPOSITORY
 * Handles HR automation rules, scheduled triggers, and event actions
 */

const BaseRepository = require('./baseRepo');

class AutomationRepository extends BaseRepository {
  constructor() {
    super('hr_automation_rules');
  }

  async getActiveRules() {
    const res = await this.query(
      `SELECT * FROM hr_automation_rules WHERE is_active = true ORDER BY name ASC;`
    );
    return res.rows;
  }

  async logRuleExecution(ruleId, executionStatus, details = {}) {
    const res = await this.query(
      `UPDATE hr_automation_rules 
       SET last_executed_at = CURRENT_TIMESTAMP, 
           execution_count = execution_count + 1,
           last_execution_status = $2
       WHERE id = $1
       RETURNING *;`,
      [ruleId, executionStatus]
    );
    return res.rows[0] || null;
  }
}

module.exports = new AutomationRepository();
