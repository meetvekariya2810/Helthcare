/**
 * BJK HEALTHCARE — QUALITY ASSURANCE (QA) & QUALITY CONTROL (QC) REPOSITORY
 * Tracks QC testing samples, CAPAs, deviations, and analytical test results
 */

const BaseRepository = require('./baseRepo');

class QualityRepository extends BaseRepository {
  constructor() {
    super('qc_samples');
  }

  async getRecentQCSamples() {
    const res = await this.query(
      `SELECT qs.*
       FROM qc_samples qs
       ORDER BY qs.created_at DESC LIMIT 50;`
    );
    return res.rows;
  }

  async getActiveDeviations() {
    const res = await this.query(
      `SELECT * FROM deviations WHERE status != 'CLOSED' ORDER BY created_at DESC;`
    );
    return res.rows;
  }

  async getActiveCAPAs() {
    const res = await this.query(
      `SELECT * FROM capas WHERE status != 'COMPLETED' ORDER BY created_at DESC;`
    );
    return res.rows;
  }
}

module.exports = new QualityRepository();
