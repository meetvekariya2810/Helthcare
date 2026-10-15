/**
 * BJK HEALTHCARE — REPOSITORY SUITE UNIT TEST (POSTGRESQL)
 * Verifies that all 24 domain repositories instantiate, connect, and execute cleanly
 */

const repos = require('../repositories');

async function testAllRepositories() {
  console.log('====================================================');
  console.log('BJK HEALTHCARE — ALL DOMAIN REPOSITORIES TEST (SQL)');
  console.log('====================================================');

  const tests = [
    { name: 'userRepo', fn: async () => repos.userRepo.count() },
    { name: 'employeeRepo', fn: async () => repos.employeeRepo.count() },
    { name: 'productRepo', fn: async () => repos.productRepo.count() },
    { name: 'attendanceRepo', fn: async () => repos.attendanceRepo.count() },
    { name: 'leaveRepo', fn: async () => repos.leaveRepo.count() },
    { name: 'auditRepo', fn: async () => repos.auditRepo.count() },
    { name: 'onboardingRepo', fn: async () => repos.onboardingRepo.count() },
    { name: 'shiftRepo', fn: async () => repos.shiftRepo.getAllActiveShifts() },
    { name: 'payrollRepo', fn: async () => repos.payrollRepo.count() },
    { name: 'trainingRepo', fn: async () => repos.trainingRepo.getActivePrograms() },
    { name: 'documentRepo', fn: async () => repos.documentRepo.count() },
    { name: 'assetRepo', fn: async () => repos.assetRepo.count() },
    { name: 'expenseRepo', fn: async () => repos.expenseRepo.count() },
    { name: 'performanceRepo', fn: async () => repos.performanceRepo.count() },
    { name: 'recruitmentRepo', fn: async () => repos.recruitmentRepo.getActiveRequisitions() },
    { name: 'notificationRepo', fn: async () => repos.notificationRepo.count() },
    { name: 'automationRepo', fn: async () => repos.automationRepo.count() },
    { name: 'analyticsRepo (headcount)', fn: async () => repos.analyticsRepo.getDepartmentHeadcount() },
    { name: 'analyticsRepo (leaveStats)', fn: async () => repos.analyticsRepo.getLeaveStatistics() },
    { name: 'copilotRepo', fn: async () => repos.copilotRepo.searchKnowledge('quality') },
    { name: 'canteenRepo', fn: async () => repos.canteenRepo.getCanteenSettings() },
    { name: 'loginHistoryRepo', fn: async () => repos.loginHistoryRepo.count() },
    { name: 'factoryRepo', fn: async () => repos.factoryRepo.getAllFacilities() },
    { name: 'productionRepo', fn: async () => repos.productionRepo.getActiveBatches() },
    { name: 'qualityRepo', fn: async () => repos.qualityRepo.getRecentQCSamples() },
    { name: 'inventoryRepo', fn: async () => repos.inventoryRepo.count() },
    { name: 'regulatoryRepo', fn: async () => repos.regulatoryRepo.getRegulatoryRecords() },
    { name: 'crmRepo', fn: async () => repos.crmRepo.getRecentEnquiries(5) },
    { name: 'financeRepo', fn: async () => repos.financeRepo.getRecentInvoices(5) },
    { name: 'policyRepo', fn: async () => repos.policyRepo.getAllLeavePolicies() }
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await t.fn();
      console.log(`  [PASS] ${t.name} -> executed successfully`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${t.name}:`, err.message);
    }
  }

  console.log('====================================================');
  console.log(`REPOSITORY TEST SUMMARY: ${passed}/${tests.length} PASSING`);
  console.log('====================================================');

  if (passed !== tests.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  testAllRepositories().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { testAllRepositories };
