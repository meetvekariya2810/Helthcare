/**
 * BJK HEALTHCARE — FINANCE & ACCOUNTS REPOSITORY
 * Manages commercial invoices, general ledger entries, and departmental budget plans
 */

const BaseRepository = require('./baseRepo');

class FinanceRepository extends BaseRepository {
  constructor() {
    super('invoices');
  }

  async getRecentInvoices(limit = 50) {
    const res = await this.query(`SELECT * FROM invoices ORDER BY created_at DESC LIMIT $1;`, [limit]);
    return res.rows;
  }

  async getBudgetPlans(year = new Date().getFullYear()) {
    const res = await this.query(
      `SELECT bp.*, d.name AS department_name
       FROM budget_plans bp
       LEFT JOIN departments d ON d.id = bp.department_id
       WHERE bp.fiscal_year = $1 OR bp.year = $1
       ORDER BY bp.allocated_amount DESC;`,
      [year]
    );
    return res.rows;
  }
}

module.exports = new FinanceRepository();
