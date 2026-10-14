/**
 * BJK HEALTHCARE — PRODUCT CATALOGUE REPOSITORY
 * 111-Product pharmaceutical catalogue, categories, and inventory.
 */

const BaseRepository = require('./baseRepo');

class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }

  async findByProductCode(code) {
    const res = await this.query(
      `SELECT p.*, pc.name as category_display_name
       FROM products p
       LEFT JOIN product_categories pc ON pc.id = p.category_id
       WHERE p.product_code = $1;`,
      [code]
    );
    return res.rows[0] || null;
  }

  async listProducts({ page = 1, limit = 50, category, search, activeOnly = true }) {
    const conditions = [];
    const params = [];

    if (activeOnly) {
      conditions.push(`is_active = true`);
    }

    if (category) {
      params.push(category);
      conditions.push(`(category_name ILIKE $${params.length} OR category_id::text = $${params.length})`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR generic_name ILIKE $${params.length} OR product_code ILIKE $${params.length})`);
    }

    const where = conditions.length ? conditions.join(' AND ') : '';
    return this.paginate({
      page,
      limit,
      where,
      params,
      orderBy: 'product_code ASC',
      allowlist: ['product_code', 'name', 'generic_name', 'created_at']
    });
  }

  async getCatalogueSummary() {
    const totalRes = await this.query(`SELECT COUNT(*)::int AS total FROM products;`);
    const activeRes = await this.query(`SELECT COUNT(*)::int AS active FROM products WHERE is_active = true;`);
    const catRes = await this.query(`
      SELECT COALESCE(category_name, 'Uncategorized') as category, COUNT(*)::int as count 
      FROM products 
      GROUP BY category_name 
      ORDER BY count DESC;
    `);

    return {
      totalProducts: totalRes.rows[0].total,
      activeProducts: activeRes.rows[0].active,
      byCategory: catRes.rows
    };
  }
}

module.exports = new ProductRepository();
