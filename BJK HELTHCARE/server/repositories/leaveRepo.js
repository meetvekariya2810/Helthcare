/**
 * BJK HEALTHCARE — LEAVE & WORKFORCE HOLIDAY REPOSITORY
 * Leave balances, ledgers, and transactional balance deductions.
 */

const BaseRepository = require('./baseRepo');

class LeaveRepository extends BaseRepository {
  constructor() {
    super('leave_balances');
  }

  async getBalancesByEmployee(employeeCode, year = 2026) {
    const res = await this.query(
      `SELECT lb.*, lt.name as leave_type_name, lt.is_paid
       FROM leave_balances lb
       LEFT JOIN leave_types lt ON lt.code = lb.leave_type_code
       WHERE lb.employee_code = $1 AND lb.year = $2;`,
      [employeeCode, year]
    );
    return res.rows;
  }

  async getLeaveTypes() {
    const res = await this.query(`SELECT * FROM leave_types WHERE is_active = true ORDER BY name ASC;`);
    return res.rows;
  }

  async getHolidays(year = 2026) {
    const res = await this.query(
      `SELECT * FROM workforce_holidays WHERE date::text LIKE $1 ORDER BY date ASC;`,
      [`${year}%`]
    );
    return res.rows;
  }

  /**
   * Transactional leave deduction with row locking (SELECT ... FOR UPDATE)
   */
  async deductLeave({ employeeCode, leaveTypeCode, days, year = 2026, remarks = '' }) {
    return this.transaction(async (client) => {
      // 1. Lock the balance row
      const balRes = await client.query(
        `SELECT * FROM leave_balances 
         WHERE employee_code = $1 AND leave_type_code = $2 AND year = $3 
         FOR UPDATE;`,
        [employeeCode, leaveTypeCode, year]
      );

      if (balRes.rows.length === 0) {
        throw new Error(`Leave balance not found for employee ${employeeCode} (${leaveTypeCode})`);
      }

      const bal = balRes.rows[0];
      const currentClosing = parseFloat(bal.closing_balance);
      if (currentClosing < days) {
        throw new Error(`Insufficient leave balance. Available: ${currentClosing}, Requested: ${days}`);
      }

      const newClosing = currentClosing - days;
      const newTaken = parseFloat(bal.taken) + days;

      // 2. Update balance
      await client.query(
        `UPDATE leave_balances 
         SET closing_balance = $1, taken = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3;`,
        [newClosing, newTaken, bal.id]
      );

      // 3. Append to ledger
      const ledRes = await client.query(
        `INSERT INTO leave_ledgers (
           employee_code, leave_type_code, transaction_type, days,
           balance_before, balance_after, remarks
         ) VALUES ($1, $2, 'DEDUCTION', $3, $4, $5, $6)
         RETURNING *;`,
        [employeeCode, leaveTypeCode, days, currentClosing, newClosing, remarks]
      );

      return {
        balance: { ...bal, closing_balance: newClosing, taken: newTaken },
        ledgerEntry: ledRes.rows[0]
      };
    });
  }
}

module.exports = new LeaveRepository();
