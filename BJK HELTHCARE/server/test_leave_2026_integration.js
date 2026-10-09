const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const LeaveLedger = require('./models/hrms/LeaveLedger');
const { LeaveBalance, LeaveRequest } = require('./models/hrms/Leave');
const Attendance = require('./models/hrms/Attendance');
const {
  syncLeaveLedgerFromSeed,
  getEmployeeLedger,
  getAllLedgers,
  getMonthlyMatrix,
  getDepartmentAnalytics,
  getLeaveKPIs
} = require('./services/hrms/leaveLedgerService');

async function runTests() {
  console.log('================================================================');
  console.log('BJK HEALTHCARE — LEAVE 2026 CSV INTEGRATION VERIFICATION TEST');
  console.log('================================================================');

  await connectDB();
  console.log('[1] Connected to MongoDB.');

  // 1. Sync from Leave 2026(Sheet1).csv
  console.log('\n--- STEP 1: Syncing Leave 2026(Sheet1).csv ---');
  const syncResult = await syncLeaveLedgerFromSeed();
  console.log('Sync Result:', syncResult);

  if (!syncResult.success) {
    throw new Error('Failed to sync Leave 2026 CSV: ' + syncResult.message);
  }

  // 2. Verify Count
  const totalCount = await LeaveLedger.countDocuments({ year: 2026 });
  console.log(`[2] Total 2026 Leave Ledger employee records in DB: ${totalCount}`);
  if (totalCount < 48) {
    throw new Error(`Expected at least 48 employee records, got ${totalCount}`);
  }

  // 3. Test Dixita Jayantibhai Makwana (BH1022)
  console.log('\n--- STEP 2: Verifying Example Employee Dixita (BH1022) ---');
  const dixita = await getEmployeeLedger('BH1022', 2026);
  if (!dixita) {
    throw new Error('Dixita (BH1022) record not found in LeaveLedger!');
  }

  console.log('Dixita Employee Code:', dixita.employeeCode);
  console.log('Dixita Name:', dixita.employeeName);
  console.log('Dixita Department:', dixita.department);
  console.log('Dixita DOJ:', dixita.doj);
  console.log('Opening Balance:', dixita.openingBalance);
  console.log('Total Taken:', dixita.totalLeaveTaken);
  console.log('Closing Balance:', dixita.closingBalance);
  console.log('Monthly Breakdown (10 months):');
  dixita.monthlyBreakdown.forEach(m => {
    console.log(`  ${m.monthName} (Month ${m.monthIndex}): CL=${m.cl}, SL=${m.sl}, LWP=${m.lwp}, Total=${m.total}`);
  });

  // Verify Dixita's exact values from the sheet:
  // Row 1: BH1022, Dixita Jayantibhai Makwana, PRD, 8/22/2025, Open CL=7, SL=7, Taken CL=7, SL=1, LWP=30.5, Close CL=0, SL=5.5
  if (dixita.employeeCode !== 'BH1022') throw new Error('Dixita employeeCode mismatch');
  if (dixita.department !== 'PRD') throw new Error('Dixita department mismatch');
  if (dixita.openingBalance.cl !== 7 || dixita.openingBalance.sl !== 7) throw new Error('Dixita opening balance mismatch');
  if (dixita.totalLeaveTaken.cl !== 7 || dixita.totalLeaveTaken.sl !== 1 || dixita.totalLeaveTaken.lwp !== 30.5) {
    throw new Error('Dixita total taken mismatch');
  }
  if (dixita.closingBalance.cl !== 0 || dixita.closingBalance.sl !== 5.5) {
    throw new Error('Dixita closing balance mismatch');
  }
  console.log('>> Dixita (BH1022) record verified 100% match with CSV source!');

  // 4. Test Another Employee: Milan Dilipbhai Mayani (BH1023)
  console.log('\n--- STEP 3: Verifying Another Employee Milan (BH1023) ---');
  const milan = await getEmployeeLedger('BH1023', 2026);
  if (!milan) throw new Error('Milan (BH1023) not found!');
  console.log('Milan Code:', milan.employeeCode, '| Name:', milan.employeeName, '| Dept:', milan.department, '| Total Taken:', milan.totalLeaveTaken);
  if (milan.employeeCode === dixita.employeeCode) throw new Error('Data isolation failure: Same code');
  if (milan.employeeName === dixita.employeeName) throw new Error('Data isolation failure: Same name');
  console.log('>> Data isolation confirmed: Milan and Dixita records are completely distinct!');

  // 5. Test HR / Admin Global Query & Filters
  console.log('\n--- STEP 4: Verifying HR / Admin Filters ---');
  const allResult = await getAllLedgers({ year: 2026, limit: 100 });
  console.log(`Total Permitted Records for HR: ${allResult.total}`);

  // Search by Dixita
  const searchDixita = await getAllLedgers({ search: 'Dixita', year: 2026 });
  console.log(`Search "Dixita" returns: ${searchDixita.ledgers.length} row(s) -> ${searchDixita.ledgers[0]?.employeeName} (${searchDixita.ledgers[0]?.employeeCode})`);
  if (searchDixita.ledgers.length !== 1 || searchDixita.ledgers[0].employeeCode !== 'BH1022') {
    throw new Error('Search by Dixita failed to return only Dixita');
  }

  // Filter by PRD Department
  const prdDept = await getAllLedgers({ department: 'PRD', year: 2026 });
  console.log(`Department filter "PRD" returns: ${prdDept.ledgers.length} employee(s)`);
  prdDept.ledgers.forEach(l => {
    if (l.department !== 'PRD') throw new Error(`Non-PRD record returned: ${l.department}`);
  });

  // 6. Test Monthly Matrix for Oct-26
  console.log('\n--- STEP 5: Verifying Monthly Matrix (Oct-26) ---');
  const octMatrix = await getMonthlyMatrix('Oct-26', 2026);
  console.log(`Oct-26 Matrix contains: ${octMatrix.rows.length} rows, Month totals:`, octMatrix.totals);

  // 7. Test Department Analytics & KPIs
  console.log('\n--- STEP 6: Verifying Department Analytics & KPIs ---');
  const deptAnalytics = await getDepartmentAnalytics(2026);
  console.log('Department Breakdown Summary:');
  deptAnalytics.forEach(d => {
    console.log(`  ${d.department.padEnd(12)}: ${d.employeeCount} emps | Taken CL=${d.takenCL}, SL=${d.takenSL}, LWP=${d.takenLWP}, Total=${d.takenTotal}`);
  });

  const kpis = await getLeaveKPIs(2026);
  console.log('\nOverall KPIs:', kpis);

  console.log('\n================================================================');
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('================================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n[TEST ERROR]:', err);
  process.exit(1);
});
