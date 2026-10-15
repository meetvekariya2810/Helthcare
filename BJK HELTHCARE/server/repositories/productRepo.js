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

  async findBySrNoOrId(param) {
    if (!param) return null;
    // Check UUID or source_mongo_id
    let res = await this.query(
      `SELECT * FROM products WHERE id::text = $1 OR source_mongo_id = $1 OR product_code = $1;`,
      [param]
    );
    if (res.rows[0]) return res.rows[0];

    const num = parseInt(param, 10);
    if (!isNaN(num)) {
      res = await this.query(
        `SELECT * FROM products WHERE (legacy_extra->>'srNo')::int = $1;`,
        [num]
      );
      if (res.rows[0]) return res.rows[0];
    }
    return null;
  }

  async listProducts({ page = 1, limit = 50, category, search, activeOnly = true, sortBy, order }) {
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
    const orderBy = sortBy ? `${sortBy} ${order === 'desc' ? 'DESC' : 'ASC'}` : 'product_code ASC';

    return this.paginate({
      page,
      limit,
      where,
      params,
      orderBy,
      allowlist: ['product_code', 'name', 'generic_name', 'created_at', 'category_name']
    });
  }

  async getProductCategories() {
    const res = await this.query(`
      SELECT 
        pc.*,
        COUNT(p.id)::int AS product_count
      FROM product_categories pc
      LEFT JOIN products p ON (p.category_id = pc.id OR p.category_name = pc.name) AND p.is_active = true
      WHERE pc.is_active = true
      GROUP BY pc.id
      ORDER BY pc.name ASC;
    `);
    return res.rows;
  }

  async createProduct(data) {
    const { productCode, name, genericName, dosageForm, categoryId, categoryName, strength, description } = data;
    const res = await this.query(
      `INSERT INTO products 
       (product_code, name, generic_name, dosage_form, category_id, category_name, strength, description, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *;`,
      [productCode, name, genericName, dosageForm, categoryId || null, categoryName || null, strength || null, description || null]
    );
    return res.rows[0];
  }

  async updateProduct(id, data) {
    const fields = [];
    const params = [id];

    const updatable = {
      name: data.name || data.productName,
      generic_name: data.genericName,
      dosage_form: data.dosageForm,
      category_name: data.category,
      strength: data.strength,
      description: data.description,
      is_active: data.isActive
    };

    for (const [col, val] of Object.entries(updatable)) {
      if (val !== undefined) {
        params.push(val);
        fields.push(`${col} = $${params.length}`);
      }
    }

    if (fields.length === 0) return this.findBySrNoOrId(id);

    const res = await this.query(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id::text = $1 OR source_mongo_id = $1 RETURNING *;`,
      params
    );
    return res.rows[0] || null;
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
