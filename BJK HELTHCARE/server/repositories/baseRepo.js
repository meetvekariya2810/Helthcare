/**
 * BJK HEALTHCARE — BASE POSTGRESQL REPOSITORY
 * Provides parameterized SQL execution, connection pooling, transactions, and allowlisted filtering.
 */

const { getPool, query, transaction } = require('../config/postgres');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  get pool() {
    return getPool();
  }

  async query(sql, params = []) {
    return query(sql, params);
  }

  async transaction(callback) {
    return transaction(callback);
  }

  async findById(id) {
    const res = await this.query(`SELECT * FROM ${this.tableName} WHERE id = $1;`, [id]);
    return res.rows[0] || null;
  }

  async findByMongoId(mongoId) {
    const res = await this.query(`SELECT * FROM ${this.tableName} WHERE source_mongo_id = $1;`, [mongoId]);
    return res.rows[0] || null;
  }

  async count(whereClause = '', params = []) {
    const sql = `SELECT COUNT(*)::int AS count FROM ${this.tableName} ${whereClause ? 'WHERE ' + whereClause : ''};`;
    const res = await this.query(sql, params);
    return res.rows[0].count;
  }

  async paginate({ page = 1, limit = 20, where = '', params = [], orderBy = 'created_at DESC', allowlist = [] }) {
    const offset = (Math.max(1, page) - 1) * limit;

    // Validate orderBy against allowlist to prevent SQL injection
    if (allowlist.length > 0) {
      const orderColumn = orderBy.split(' ')[0].trim().toLowerCase();
      if (!allowlist.includes(orderColumn)) {
        orderBy = allowlist[0] + ' ASC';
      }
    }

    const countSql = `SELECT COUNT(*)::int AS total FROM ${this.tableName} ${where ? 'WHERE ' + where : ''};`;
    const countRes = await this.query(countSql, params);
    const total = countRes.rows[0].total;

    const dataSql = `
      SELECT * FROM ${this.tableName}
      ${where ? 'WHERE ' + where : ''}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    const dataRes = await this.query(dataSql, [...params, limit, offset]);

    return {
      data: dataRes.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async deleteById(id) {
    const res = await this.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id;`, [id]);
    return res.rowCount > 0;
  }
}

module.exports = BaseRepository;
