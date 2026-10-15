/**
 * BJK HEALTHCARE — PAYROLL REPOSITORY
 * Handles statutory payroll runs, payslip generation, deductions, and bank details
 */

const BaseRepository = require('./baseRepo');

class PayrollRepository extends BaseRepository {
  constructor() {
    super('payrolls');
  }

  async getPayrollByMonth(month, year) {
    const res = await this.query(
      `SELECT p.*, e.first_name, e.last_name, e.department, e.designation, e.employee_id AS emp_code
       FROM payrolls p
       JOIN employees e ON e.id = p.employee_id OR e.source_mongo_id = p.source_employee_id
       WHERE p.month = $1 AND p.year = $2
       ORDER BY e.employee_id ASC;`,
      [month, year]
    );
    return res.rows;
  }

  async getEmployeePayslip(employeeId, month, year) {
    const res = await this.query(
      `SELECT p.*, e.first_name, e.last_name, e.department, e.designation, e.employee_id AS emp_code,
              bd.bank_name, bd.account_number_masked, bd.ifsc_code
       FROM payrolls p
       JOIN employees e ON e.id = p.employee_id OR e.source_mongo_id = p.source_employee_id
       LEFT JOIN employee_bank_details bd ON bd.employee_id = e.id
       WHERE (p.employee_id = $1 OR p.source_employee_id = $1)
         AND p.month = $2 AND p.year = $3;`,
      [employeeId, month, year]
    );
    return res.rows[0] || null;
  }

  async createPayrollRun(payrollData) {
    const { employeeId, month, year, basicSalary, hra, allowances, epf, esi, pt, tds, netSalary, status = 'DRAFT' } = payrollData;
    const res = await this.query(
      `INSERT INTO payrolls 
       (employee_id, month, year, basic_salary, hra, allowances, epf_deduction, esi_deduction, pt_deduction, tds_deduction, net_salary, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *;`,
      [employeeId, month, year, basicSalary, hra, allowances, epf, esi, pt, tds, netSalary, status]
    );
    return res.rows[0];
  }

  async deleteDraftPayroll(payrollId) {
    const res = await this.query(
      `DELETE FROM payrolls WHERE id = $1 AND status = 'DRAFT' RETURNING id;`,
      [payrollId]
    );
    return res.rows.length > 0;
  }
}

module.exports = new PayrollRepository();
