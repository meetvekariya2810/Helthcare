/**
 * BJK HEALTHCARE — COMMERCIAL & CRM REPOSITORY
 * Handles commercial inquiries, B2B pharmaceutical client accounts, and distributor contracts
 */

const BaseRepository = require('./baseRepo');

class CRMRepository extends BaseRepository {
  constructor() {
    super('enquiries');
  }

  async getRecentEnquiries(limit = 20) {
    const res = await this.query(
      `SELECT * FROM enquiries ORDER BY created_at DESC LIMIT $1;`,
      [limit]
    );
    return res.rows;
  }

  async updateEnquiryStatus(enquiryId, status) {
    const res = await this.query(
      `UPDATE enquiries SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`,
      [enquiryId, status]
    );
    return res.rows[0] || null;
  }
}

module.exports = new CRMRepository();
