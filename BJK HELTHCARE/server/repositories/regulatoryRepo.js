/**
 * BJK HEALTHCARE — REGULATORY COMPLIANCE REPOSITORY
 * Tracks drug manufacturing licenses, dossier filings, regulatory audits, and WHO-GMP submissions
 */

const BaseRepository = require('./baseRepo');

class RegulatoryRepository extends BaseRepository {
  constructor() {
    super('regulatory_records');
  }

  async getRegulatoryRecords() {
    const res = await this.query(`SELECT * FROM regulatory_records ORDER BY created_at DESC;`);
    return res.rows;
  }

  async getScheduledAudits() {
    const res = await this.query(
      `SELECT * FROM audits WHERE status != 'COMPLETED' ORDER BY scheduled_date ASC;`
    );
    return res.rows;
  }
}

module.exports = new RegulatoryRepository();
