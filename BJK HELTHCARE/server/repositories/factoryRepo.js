/**
 * BJK HEALTHCARE — FACTORY & ENTERPRISE INFRASTRUCTURE REPOSITORY
 * Manages facilities, manufacturing plants, cleanrooms, and production machinery
 */

const BaseRepository = require('./baseRepo');

class FactoryRepository extends BaseRepository {
  constructor() {
    super('facilities');
  }

  async getAllFacilities() {
    const res = await this.query(`SELECT * FROM facilities ORDER BY name ASC;`);
    return res.rows;
  }

  async getFacilityCleanrooms(facilityId) {
    const res = await this.query(
      `SELECT * FROM cleanrooms WHERE facility_id = $1 ORDER BY room_code ASC;`,
      [facilityId]
    );
    return res.rows;
  }

  async getFacilityMachines(facilityId) {
    const res = await this.query(
      `SELECT * FROM machines WHERE facility_id = $1 ORDER BY name ASC;`,
      [facilityId]
    );
    return res.rows;
  }
}

module.exports = new FactoryRepository();
