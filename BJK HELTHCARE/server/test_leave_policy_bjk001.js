/**
 * BJK Healthcare Digital Brain - Automated Test Suite
 * Policy BJK-HR-POL-001 (Version 1.0, Effective 01 April 2026)
 *
 * Verifies:
 * 1. Policy initialization & clarification register
 * 2. Leave rule validation (EL min 3d, EL max 15d, CL max 2d, SL certificate requirement)
 * 3. Approval hierarchy assignment (CL 1-2d, EL 1-3d, EL 4-6d, EL >7d, SL, Comp-Off)
 * 4. Comp-Off credit calculations (1 day = 8h, 0.5 day = 4h) & 90-day expiry logic
 * 5. Comp-Off FIFO credit deduction
 * 6. Year-end reconciliation (CL/SL lapse, 50% EL carry-forward capped at 50 days)
 * 7. LOP salary deduction formula
 */

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');

const {
  LeavePolicy,
  PolicyClarification,
  CompOffCredit,
  CompOffWorkAuthorization,
  DepartmentStaffingThreshold,
  LeaveBlackoutPeriod
} = require('./models/hrms/LeavePolicyModels');

const {
  initLeavePolicyEngine,
  determineApprovalHierarchy,
  validateLeaveApplicationRules,
  deductCompOffCredits,
  reconcileYearEndBalances,
  calculateLOPDeduction,
  BJK_POLICY_001_LEAVE_TYPES,
  DEFAULT_POLICY_CLARIFICATIONS
} = require('./services/hrms/leavePolicyService');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✘ FAIL:\x1b[0m ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('   BJK-HR-POL-001 POLICY ENGINE AUTOMATED TEST SUITE');
  console.log('===============================================================\n');

  await connectDB();
  console.log('Connected to MongoDB Atlas\n');

  try {
    // -----------------------------------------------------------------
    // TEST 1: Policy Engine Initialization & Default Values
    // -----------------------------------------------------------------
    console.log('--- Test Suite 1: Policy Initialization & Definitions ---');
    const initResult = await initLeavePolicyEngine();
    assert(initResult.success === true, 'Policy engine initialized successfully');
    assert(initResult.clarificationsCount >= 7, 'All 7 mandatory policy clarifications seeded');

    const activePolicy = await LeavePolicy.findOne({ policyNumber: 'BJK-HR-POL-001', status: 'ACTIVE' });
    assert(activePolicy !== null, 'BJK-HR-POL-001 active policy document exists in database');
    assert(activePolicy.rules.earnedLeave.annualEntitlementDays === 7, 'EL annual entitlement is 7 days');
    assert(activePolicy.rules.earnedLeave.monthlyAccrualRate === 0.58, 'EL monthly accrual rate is 0.58 days');
    assert(activePolicy.rules.earnedLeave.maxAccumulationDays === 50, 'EL max accumulation is 50 days');
    assert(activePolicy.rules.earnedLeave.carryForwardPercentage === 50, 'EL carry-forward is 50%');
    assert(activePolicy.rules.casualLeave.annualEntitlementDays === 7, 'CL annual entitlement is 7 days');
    assert(activePolicy.rules.casualLeave.maxConsecutiveDays === 2, 'CL max consecutive days is 2');
    assert(activePolicy.rules.sickLeave.annualEntitlementDays === 4, 'SL annual entitlement is 4 days');
    assert(activePolicy.rules.compOff.validityDays === 90, 'Comp-Off validity is 90 days');

    // -----------------------------------------------------------------
    // TEST 2: Earned Leave Rules Engine Validation
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 2: Earned Leave Rules Engine ---');

    // Rule: Min block 3 consecutive working days
    const elUnder3 = await validateLeaveApplicationRules({
      leaveTypeCode: 'EARNED_LEAVE',
      totalDays: 2,
      isEmergency: false,
      isProbationary: false,
      availableBalance: 5,
      submissionDate: new Date('2026-05-01'),
      startDate: new Date('2026-05-20')
    });
    assert(elUnder3.valid === false && elUnder3.violations.some(v => v.includes('minimum of 3')),
      'Rejects EL application under 3 consecutive working days');

    // Rule: Min available balance 2 days
    const elLowBalance = await validateLeaveApplicationRules({
      leaveTypeCode: 'EARNED_LEAVE',
      totalDays: 3,
      isEmergency: false,
      isProbationary: false,
      availableBalance: 1.5,
      submissionDate: new Date('2026-05-01'),
      startDate: new Date('2026-05-20')
    });
    assert(elLowBalance.valid === false && elLowBalance.violations.some(v => v.includes('minimum balance of 2')),
      'Rejects EL application when available balance is below 2 days');

    // Rule: Advance notice of 15 days for 5+ days
    const elShortNotice = await validateLeaveApplicationRules({
      leaveTypeCode: 'EARNED_LEAVE',
      totalDays: 5,
      isEmergency: false,
      isProbationary: false,
      availableBalance: 10,
      submissionDate: new Date('2026-05-01'),
      startDate: new Date('2026-05-05') // only 4 days notice
    });
    assert(elShortNotice.valid === false && elShortNotice.violations.some(v => v.includes('advance notice')),
      'Enforces 15 days advance notice for EL >= 5 days');

    // Rule: Normal max 15 working days requires MD approval warning
    const elOver15 = await validateLeaveApplicationRules({
      leaveTypeCode: 'EARNED_LEAVE',
      totalDays: 16,
      isEmergency: false,
      isProbationary: false,
      availableBalance: 20,
      submissionDate: new Date('2026-05-01'),
      startDate: new Date('2026-05-25')
    });
    assert(elOver15.valid === true && elOver15.requiresMDApproval === true,
      'Flags EL > 15 working days for mandatory Managing Director approval');

    // -----------------------------------------------------------------
    // TEST 3: Casual Leave Rules Engine Validation
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 3: Casual Leave Rules Engine ---');

    // Rule: Max 2 consecutive days
    const clOver2 = await validateLeaveApplicationRules({
      leaveTypeCode: 'CASUAL_LEAVE',
      totalDays: 3,
      isEmergency: false,
      isProbationary: false,
      availableBalance: 5,
      submissionDate: new Date('2026-05-01'),
      startDate: new Date('2026-05-03')
    });
    assert(clOver2.valid === false && clOver2.violations.some(v => v.includes('maximum of 2 consecutive days')),
      'Rejects normal CL exceeding 2 consecutive working days');

    // Rule: Probationary employee not entitled to CL
    const clProbation = await validateLeaveApplicationRules({
      leaveTypeCode: 'CASUAL_LEAVE',
      totalDays: 1,
      isEmergency: false,
      isProbationary: true,
      availableBalance: 5,
      submissionDate: new Date('2026-05-01'),
      startDate: new Date('2026-05-03')
    });
    assert(clProbation.valid === false && clProbation.violations.some(v => v.includes('probation')),
      'Rejects CL application for probationary employees');

    // -----------------------------------------------------------------
    // TEST 4: Sick Leave & GMP Fitness Requirements
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 4: Sick Leave & GMP Cleanroom Fitness ---');

    // Rule: Medical certificate required for 3-4 days
    const slNoDoc = await validateLeaveApplicationRules({
      leaveTypeCode: 'SICK_LEAVE',
      totalDays: 3,
      hasMedicalCertificate: false,
      isGMPRole: false,
      availableBalance: 4
    });
    assert(slNoDoc.valid === false && slNoDoc.violations.some(v => v.includes('Medical certificate')),
      'Requires registered medical practitioner certificate for Sick Leave of 3-4 days');

    // Rule: GMP role returning from 4+ days SL requires fitness certificate
    const slGMPRole = await validateLeaveApplicationRules({
      leaveTypeCode: 'SICK_LEAVE',
      totalDays: 4,
      hasMedicalCertificate: true,
      isGMPRole: true,
      availableBalance: 4
    });
    assert(slGMPRole.requiresFitnessCertificate === true,
      'Mandates Fitness to Resume Duties certificate for GMP manufacturing/QC personnel returning from 4+ days SL');

    // -----------------------------------------------------------------
    // TEST 5: Approval Hierarchy Rules
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 5: Approval Hierarchy Engine ---');

    const hCL1 = determineApprovalHierarchy('CASUAL_LEAVE', 1);
    assert(hCL1.primaryApprover === 'REPORTING_MANAGER' && !hCL1.secondaryApprover,
      'CL (1-2 days) routed solely to Reporting Manager');

    const hCL3 = determineApprovalHierarchy('CASUAL_LEAVE', 3);
    assert(hCL3.primaryApprover === 'REPORTING_MANAGER' && hCL3.secondaryApprover === 'HOD',
      'CL (3 days exception) routed to Reporting Manager + HOD');

    const hEL2 = determineApprovalHierarchy('EARNED_LEAVE', 2);
    assert(hEL2.primaryApprover === 'REPORTING_MANAGER' && hEL2.secondaryApprover === 'HOD',
      'EL (1-3 days) routed to Reporting Manager + HOD');

    const hEL5 = determineApprovalHierarchy('EARNED_LEAVE', 5);
    assert(hEL5.primaryApprover === 'REPORTING_MANAGER' && hEL5.secondaryApprover === 'HOD' && hEL5.finalApprover === 'HR',
      'EL (4-6 days) routed to Reporting Manager + HOD + HR');

    const hEL10 = determineApprovalHierarchy('EARNED_LEAVE', 10);
    assert(hEL10.finalApprover === 'MANAGING_DIRECTOR',
      'EL (>7 days) routed to Managing Director for executive approval');

    const hCompOff = determineApprovalHierarchy('COMPENSATORY_OFF', 1);
    assert(hCompOff.primaryApprover === 'REPORTING_MANAGER' && hCompOff.secondaryApprover === 'HR',
      'Comp-Off routed to Reporting Manager + Head HR');

    // -----------------------------------------------------------------
    // TEST 6: Comp-Off Credits & 90-Day Expiry Engine
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 6: Comp-Off 90-Day Expiry & FIFO Ledger ---');

    const testEmpId = new mongoose.Types.ObjectId();
    const testEmpCode = 'BJK-TEST-EMP-999';

    // Clean up test records
    await CompOffCredit.deleteMany({ employeeCode: testEmpCode });

    const earnedPast = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
    const expiryPast = new Date(earnedPast.getTime() + 90 * 24 * 60 * 60 * 1000);

    const earnedRecent = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const expiryRecent = new Date(earnedRecent.getTime() + 90 * 24 * 60 * 60 * 1000);

    const oldCredit = await CompOffCredit.create({
      employee: testEmpId,
      employeeCode: testEmpCode,
      employeeName: 'Test Specialist',
      department: 'QA',
      workDate: earnedPast,
      earnedDate: earnedPast,
      expiryDate: expiryPast,
      creditDays: 1.0,
      remainingDays: 1.0,
      status: 'ACTIVE'
    });

    const newCredit = await CompOffCredit.create({
      employee: testEmpId,
      employeeCode: testEmpCode,
      employeeName: 'Test Specialist',
      department: 'QA',
      workDate: earnedRecent,
      earnedDate: earnedRecent,
      expiryDate: expiryRecent,
      creditDays: 1.0,
      remainingDays: 1.0,
      status: 'ACTIVE'
    });

    // Check expiry
    const isExpired = oldCredit.checkExpiry();
    assert(isExpired === true && oldCredit.status === 'EXPIRED',
      'Automatically identifies and marks credits older than 90 days as EXPIRED');

    await oldCredit.save();

    // FIFO deduction: Should consume 0.5 day from the recent active credit, not expired
    const deduction = await deductCompOffCredits(testEmpCode, 0.5, { _id: new mongoose.Types.ObjectId(), requestId: 'LV-TEST-001' });
    assert(deduction.success === true && deduction.deductedDays === 0.5,
      'Successfully consumes 0.5 Comp-Off days using FIFO ordering');

    // -----------------------------------------------------------------
    // TEST 7: Year-End Balance Reconciliation & Encashment Engine
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 7: Year-End Reconciliation & Encashment ---');

    const { LeaveBalance } = require('./models/hrms/Leave');

    // Seed test balance document for year-end reconciliation
    await LeaveBalance.findOneAndUpdate(
      { employee: testEmpId, leaveYear: 2026 },
      {
        $set: {
          employee: testEmpId,
          employeeId: testEmpCode,
          employeeName: 'Test Specialist',
          department: 'QA',
          leaveYear: 2026,
          balances: [
            { leaveType: 'EARNED_LEAVE', available: 30, allocated: 7, used: 0, pending: 0 },
            { leaveType: 'CASUAL_LEAVE', available: 4, allocated: 7, used: 3, pending: 0 },
            { leaveType: 'SICK_LEAVE', available: 2, allocated: 4, used: 2, pending: 0 }
          ]
        }
      },
      { upsert: true, new: true }
    );

    const recResult = await reconcileYearEndBalances({ year: 2026, execute: false });
    assert(recResult.processedEmployees >= 1, 'Year-end reconciliation preview executes cleanly');

    const empRec = recResult.employeesReconciled.find(e => e.employeeId === testEmpCode);
    assert(empRec !== undefined, 'Target employee found in reconciliation summary');
    assert(empRec.elCarriedForward === 15, `EL carried forward exactly 50%: 30 -> ${empRec.elCarriedForward} days`);
    assert(empRec.clLapsed === 4, `CL balance lapsed completely to 0 at year-end (${empRec.clLapsed} days lapsed)`);
    assert(empRec.slLapsed === 2, `SL balance lapsed completely to 0 at year-end (${empRec.slLapsed} days lapsed)`);

    // Clean up
    await LeaveBalance.deleteOne({ employee: testEmpId, leaveYear: 2026 });
    await CompOffCredit.deleteMany({ employeeCode: testEmpCode });

    // -----------------------------------------------------------------
    // TEST 8: Loss of Pay (LOP) Salary Deduction Formula
    // -----------------------------------------------------------------
    console.log('\n--- Test Suite 8: LOP Salary Deduction Calculation ---');
    // Policy formula: (Monthly Gross / Calendar Days) * LOP Days
    const lop30Days = calculateLOPDeduction(60000, 3, 4, 2026); // April 2026 has 30 days
    // 60,000 / 30 * 3 = 6,000
    assert(lop30Days.deductionAmount === 6000, `April (30d) LOP: 60,000 / 30 * 3 = ${lop30Days.deductionAmount}`);

    const lop31Days = calculateLOPDeduction(62000, 2, 5, 2026); // May 2026 has 31 days
    // 62,000 / 31 * 2 = 4,000
    assert(lop31Days.deductionAmount === 4000, `May (31d) LOP: 62,000 / 31 * 2 = ${lop31Days.deductionAmount}`);

    // Clean up
    await CompOffCredit.deleteMany({ employeeId: testEmpId });

    console.log('\n===============================================================');
    console.log(`   TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('===============================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal error during test execution:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
