/**
 * BJK HEALTHCARE — RECRUITMENT REPOSITORY
 * Handles job requisitions, candidate pipeline, interviews, and offer tracking
 */

const BaseRepository = require('./baseRepo');

class RecruitmentRepository extends BaseRepository {
  constructor() {
    super('candidates');
  }

  async getCandidatesByRequisition(requisitionId) {
    const res = await this.query(
      `SELECT * FROM candidates WHERE job_requisition_id = $1 ORDER BY created_at DESC;`,
      [requisitionId]
    );
    return res.rows;
  }

  async updateCandidateStage(candidateId, stage, feedback = null) {
    const res = await this.query(
      `UPDATE candidates 
       SET stage = $2, feedback = COALESCE($3, feedback), updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *;`,
      [candidateId, stage, feedback]
    );
    return res.rows[0] || null;
  }

  async getActiveRequisitions() {
    const res = await this.query(
      `SELECT * FROM job_requisitions WHERE status = 'OPEN' ORDER BY created_at DESC;`
    );
    return res.rows;
  }
}

module.exports = new RecruitmentRepository();
