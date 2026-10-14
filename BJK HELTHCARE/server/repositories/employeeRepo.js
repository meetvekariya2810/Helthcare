/**
 * BJK HEALTHCARE — EMPLOYEE REPOSITORY
 * Workforce management, bank accounts, and role-based PII masking.
 */

const BaseRepository = require('./baseRepo');

class EmployeeRepository extends BaseRepository {
  constructor() {
    super('employees');
  }

  maskPii(employee, userRole) {
    if (!employee) return null;
    const isHrOrSuper = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'PAYROLL_ADMIN'].includes(userRole);
    if (isHrOrSuper) return employee;

    const copy = { ...employee };
    if (copy.aadhaar_number) {
      copy.aadhaar_number = 'XXXX-XXXX-' + copy.aadhaar_number.slice(-4);
    }
    if (copy.pan_number) {
      copy.pan_number = copy.pan_number.slice(0, 5) + '****' + copy.pan_number.slice(-1);
    }
    if (copy.ctc && !['FINANCE', 'PAYROLL_ADMIN'].includes(userRole)) {
      delete copy.ctc;
      delete copy.basic_salary;
      delete copy.gross_salary;
      delete copy.net_salary;
      delete copy.salary_breakdown;
    }
    return copy;
  }

  async findByEmployeeId(empId, userRole = 'EMPLOYEE') {
    const res = await this.query(
      `SELECT e.*, d.name as department_name, des.title as designation_title
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN designations des ON des.id = e.designation_id
       WHERE e.employee_id = $1;`,
      [empId]
    );
    return this.maskPii(res.rows[0] || null, userRole);
  }

  async listEmployees({ page = 1, limit = 20, department, search, status = 'ACTIVE' }, userRole = 'EMPLOYEE') {
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`employment_status = $${params.length}`);
    }

    if (department) {
      params.push(department);
      conditions.push(`department_name = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(full_name ILIKE $${params.length} OR employee_id ILIKE $${params.length} OR email ILIKE $${params.length})`);
    }

    const where = conditions.length ? conditions.join(' AND ') : '';
    const result = await this.paginate({
      page,
      limit,
      where,
      params,
      orderBy: 'full_name ASC',
      allowlist: ['full_name', 'employee_id', 'date_of_joining', 'created_at']
    });

    result.data = result.data.map(emp => this.maskPii(emp, userRole));
    return result;
  }

  async getBankDetails(employeeCode) {
    const res = await this.query(
      `SELECT * FROM employee_bank_details WHERE employee_code = $1 ORDER BY is_primary DESC, created_at DESC;`,
      [employeeCode]
    );
    return res.rows;
  }
}

module.exports = new EmployeeRepository();
