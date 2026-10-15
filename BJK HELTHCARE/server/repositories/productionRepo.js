/**
 * BJK HEALTHCARE — PHARMACEUTICAL PRODUCTION REPOSITORY
 * Manages production batches, batch manufacturing records (BMR), and production lines
 */

const BaseRepository = require('./baseRepo');

class ProductionRepository extends BaseRepository {
  constructor() {
    super('batches');
  }

  async getActiveBatches() {
    const res = await this.query(
      `SELECT b.*, p.name AS product_name, p.product_code
       FROM batches b
       LEFT JOIN products p ON p.id = b.product_id
       ORDER BY b.created_at DESC;`
    );
    return res.rows;
  }

  async findByBatchNumber(batchNumber) {
    const res = await this.query(
      `SELECT b.*, p.name AS product_name, p.code AS product_code
       FROM batches b
       LEFT JOIN products p ON p.id = b.product_id
       WHERE b.batch_number = $1 OR b.code = $1;`,
      [batchNumber]
    );
    return res.rows[0] || null;
  }

  async updateBatchStatus(batchId, status, notes = null) {
    const res = await this.query(
      `UPDATE batches 
       SET status = $2, notes = COALESCE($3, notes), updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *;`,
      [batchId, status, notes]
    );
    return res.rows[0] || null;
  }
}

module.exports = new ProductionRepository();
