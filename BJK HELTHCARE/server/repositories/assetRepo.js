/**
 * BJK HEALTHCARE — ASSET REPOSITORY
 * Tracks hardware, laptops, lab devices, allocations, and maintenance history
 */

const BaseRepository = require('./baseRepo');

class AssetRepository extends BaseRepository {
  constructor() {
    super('assets');
  }

  async getEmployeeAssets(employeeId) {
    const res = await this.query(
      `SELECT a.*, aa.allocated_at, aa.return_date, aa.condition_on_allocation
       FROM asset_allocations aa
       JOIN assets a ON a.id = aa.asset_id
       WHERE aa.employee_id = $1 OR aa.source_employee_id = $1
       ORDER BY aa.allocated_at DESC;`,
      [employeeId]
    );
    return res.rows;
  }

  async getAllAssets({ status, category, page = 1, limit = 20 }) {
    const params = [];
    const conditions = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const where = conditions.length > 0 ? conditions.join(' AND ') : '';
    return this.paginate({ page, limit, where, params, orderBy: 'created_at DESC', allowlist: ['created_at', 'status', 'name', 'category'] });
  }
}

module.exports = new AssetRepository();
