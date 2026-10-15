/**
 * BJK HEALTHCARE — CANTEEN REPOSITORY
 * Handles canteen meal logging, settings, daily lunch tallies, and monthly employee meal billing
 */

const BaseRepository = require('./baseRepo');

class CanteenRepository extends BaseRepository {
  constructor() {
    super('canteen_settings');
  }

  async getCanteenSettings() {
    const res = await this.query(`SELECT * FROM canteen_settings LIMIT 1;`);
    return res.rows[0] || null;
  }

  async recordMeal(employeeId, mealType = 'LUNCH', dateStr = null) {
    const mealDate = dateStr || new Date().toISOString().split('T')[0];
    const res = await this.query(
      `INSERT INTO canteen_lunch_records 
       (employee_id, meal_type, date, timestamp)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [employeeId, mealType, mealDate]
    );
    return res.rows[0];
  }

  async getDailyMealSummary(dateStr) {
    const mealDate = dateStr || new Date().toISOString().split('T')[0];
    const res = await this.query(
      `SELECT 
         meal_type,
         COUNT(*)::int AS total_meals,
         COUNT(DISTINCT employee_id)::int AS unique_employees
       FROM canteen_lunch_records
       WHERE date = $1
       GROUP BY meal_type;`,
      [mealDate]
    );
    return res.rows;
  }
}

module.exports = new CanteenRepository();
