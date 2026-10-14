/**
 * BJK HEALTHCARE — CENTRAL REPOSITORY REGISTRY (POSTGRESQL)
 */

const baseRepo = require('./baseRepo');
const userRepo = require('./userRepo');
const employeeRepo = require('./employeeRepo');
const productRepo = require('./productRepo');
const attendanceRepo = require('./attendanceRepo');
const leaveRepo = require('./leaveRepo');
const auditRepo = require('./auditRepo');

module.exports = {
  BaseRepository: baseRepo,
  userRepo,
  employeeRepo,
  productRepo,
  attendanceRepo,
  leaveRepo,
  auditRepo
};
