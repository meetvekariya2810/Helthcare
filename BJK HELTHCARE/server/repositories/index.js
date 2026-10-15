/**
 * BJK HEALTHCARE — CENTRAL REPOSITORY REGISTRY (POSTGRESQL)
 * Exposes all 24 domain repositories for pure SQL data access
 */

const BaseRepository = require('./baseRepo');
const userRepo = require('./userRepo');
const employeeRepo = require('./employeeRepo');
const productRepo = require('./productRepo');
const attendanceRepo = require('./attendanceRepo');
const leaveRepo = require('./leaveRepo');
const auditRepo = require('./auditRepo');
const onboardingRepo = require('./onboardingRepo');
const shiftRepo = require('./shiftRepo');
const payrollRepo = require('./payrollRepo');
const trainingRepo = require('./trainingRepo');
const documentRepo = require('./documentRepo');
const assetRepo = require('./assetRepo');
const expenseRepo = require('./expenseRepo');
const performanceRepo = require('./performanceRepo');
const recruitmentRepo = require('./recruitmentRepo');
const notificationRepo = require('./notificationRepo');
const automationRepo = require('./automationRepo');
const analyticsRepo = require('./analyticsRepo');
const copilotRepo = require('./copilotRepo');
const canteenRepo = require('./canteenRepo');
const loginHistoryRepo = require('./loginHistoryRepo');
const factoryRepo = require('./factoryRepo');
const productionRepo = require('./productionRepo');
const qualityRepo = require('./qualityRepo');
const inventoryRepo = require('./inventoryRepo');
const regulatoryRepo = require('./regulatoryRepo');
const crmRepo = require('./crmRepo');
const financeRepo = require('./financeRepo');
const policyRepo = require('./policyRepo');

module.exports = {
  BaseRepository,
  userRepo,
  employeeRepo,
  productRepo,
  attendanceRepo,
  leaveRepo,
  auditRepo,
  onboardingRepo,
  shiftRepo,
  payrollRepo,
  trainingRepo,
  documentRepo,
  assetRepo,
  expenseRepo,
  performanceRepo,
  recruitmentRepo,
  notificationRepo,
  automationRepo,
  analyticsRepo,
  copilotRepo,
  canteenRepo,
  loginHistoryRepo,
  factoryRepo,
  productionRepo,
  qualityRepo,
  inventoryRepo,
  regulatoryRepo,
  crmRepo,
  financeRepo,
  policyRepo
};
