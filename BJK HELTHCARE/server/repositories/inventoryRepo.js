/**
 * BJK HEALTHCARE — INVENTORY & WAREHOUSE REPOSITORY
 * Tracks raw materials, active pharmaceutical ingredients (API), packaging, and stock movements
 */

const BaseRepository = require('./baseRepo');

class InventoryRepository extends BaseRepository {
  constructor() {
    super('inventory_items');
  }

  async getAllInventory({ category, page = 1, limit = 20 }) {
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const where = conditions.length > 0 ? conditions.join(' AND ') : '';
    return this.paginate({ page, limit, where, params, orderBy: 'name ASC', allowlist: ['name', 'category', 'current_stock', 'created_at'] });
  }

  async getRecentTransactions(limit = 50) {
    const res = await this.query(
      `SELECT it.*, ii.name AS item_name, ii.code AS item_code
       FROM inventory_transactions it
       LEFT JOIN inventory_items ii ON ii.id = it.item_id
       ORDER BY it.created_at DESC LIMIT $1;`,
      [limit]
    );
    return res.rows;
  }
}

module.exports = new InventoryRepository();
