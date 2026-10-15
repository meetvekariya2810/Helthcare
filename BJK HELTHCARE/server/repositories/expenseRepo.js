/**
 * BJK HEALTHCARE — EXPENSE & REIMBURSEMENT REPOSITORY
 * Handles employee claims, travel receipts, advances, and finance approvals
 */

const BaseRepository = require('./baseRepo');

class ExpenseRepository extends BaseRepository {
  constructor() {
    super('expenses');
  }

  async getEmployeeClaims(employeeId) {
    const res = await this.query(
      `SELECT * FROM expenses 
       WHERE employee_id = $1 OR source_employee_id = $1
       ORDER BY created_at DESC;`,
      [employeeId]
    );
    return res.rows;
  }

  async submitClaim({ employeeId, category, amount, description, receiptS3Key }) {
    const res = await this.query(
      `INSERT INTO expenses 
       (employee_id, category, amount, description, receipt_url, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, 'SUBMITTED', CURRENT_TIMESTAMP)
       RETURNING *;`,
      [employeeId, category, amount, description, receiptS3Key]
    );
    return res.rows[0];
  }

  async approveClaim(claimId, approverId, status = 'APPROVED') {
    const res = await this.query(
      `UPDATE expenses 
       SET status = $2, approved_by = $3, approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *;`,
      [claimId, status, approverId]
    );
    return res.rows[0] || null;
  }
}

module.exports = new ExpenseRepository();
