/**
 * BJK HEALTHCARE — ONBOARDING REPOSITORY
 * Handles 11-step wizard drafts, submissions, approval workflows, and atomic conversion to Employee
 */

const BaseRepository = require('./baseRepo');

class OnboardingRepository extends BaseRepository {
  constructor() {
    super('onboarding_applications');
  }

  async findByApplicationId(applicationId) {
    if (!applicationId) return null;
    const res = await this.query(
      `SELECT * FROM onboarding_applications WHERE application_id = $1 OR id::text = $1;`,
      [applicationId]
    );
    return res.rows[0] || null;
  }

  async createDraft({ applicationId, email, fullName, department, designation, stepData = {}, status = 'DRAFT' }) {
    const res = await this.query(
      `INSERT INTO onboarding_applications 
       (application_id, email, full_name, department, designation, step_data, status, current_step)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
       RETURNING *;`,
      [applicationId, email, fullName, department, designation, JSON.stringify(stepData), status]
    );
    return res.rows[0];
  }

  async updateStep(applicationId, stepNumber, stepData) {
    const res = await this.query(
      `UPDATE onboarding_applications
       SET current_step = GREATEST(current_step, $2),
           step_data = step_data || $3::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE application_id = $1 OR id::text = $1
       RETURNING *;`,
      [applicationId, stepNumber, JSON.stringify(stepData)]
    );
    return res.rows[0] || null;
  }

  async transitionStatus(applicationId, newStatus, approvedBy = null) {
    const res = await this.query(
      `UPDATE onboarding_applications
       SET status = $2,
           approved_by = COALESCE($3, approved_by),
           approved_at = CASE WHEN $2 = 'APPROVED' THEN CURRENT_TIMESTAMP ELSE approved_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE application_id = $1 OR id::text = $1
       RETURNING *;`,
      [applicationId, newStatus, approvedBy]
    );
    return res.rows[0] || null;
  }

  async listApplications({ status, department, page = 1, limit = 20 }) {
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (department) {
      params.push(department);
      conditions.push(`department = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '';
    return this.paginate({
      page,
      limit,
      where: whereClause,
      params,
      orderBy: 'created_at DESC',
      allowlist: ['created_at', 'status', 'full_name', 'department']
    });
  }

  async convertToEmployee(applicationId) {
    return this.transaction(async (client) => {
      const appRes = await client.query(
        `SELECT * FROM onboarding_applications WHERE application_id = $1 OR id::text = $1 FOR UPDATE;`,
        [applicationId]
      );
      if (appRes.rows.length === 0) {
        throw new Error(`Onboarding application [${applicationId}] not found.`);
      }
      const app = appRes.rows[0];

      const empRes = await client.query(
        `INSERT INTO employees (
           employee_id, first_name, last_name, full_name, email,
           department_name, designation_title, employment_status, date_of_joining
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', CURRENT_DATE)
         RETURNING *;`,
        [
          app.application_id || `EMP-${Date.now()}`,
          app.full_name ? app.full_name.split(' ')[0] : 'Employee',
          app.full_name ? (app.full_name.split(' ').slice(1).join(' ') || 'Staff') : 'Staff',
          app.full_name || 'Staff Employee',
          app.email,
          app.department || 'General',
          app.designation || 'Staff'
        ]
      );
      const newEmployee = empRes.rows[0];

      await client.query(
        `UPDATE onboarding_applications
         SET status = 'CONVERTED', employee_id = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1;`,
        [app.id, newEmployee.id]
      );

      return {
        application: app,
        employee: newEmployee
      };
    });
  }
}

module.exports = new OnboardingRepository();
