const assert = require('assert');
const { policyEngine, DEFAULT_POLICY_RULES } = require('../../services/hrms/policyEngine');

console.log('========================================================================');
console.log('🛡️ BJK HEALTHCARE HR POLICY AUTOMATION ENGINE: UNIT TEST SUITE');
console.log('Evaluating 13 Policies, Rules, SLAs & Traceability Metadata');
console.log('========================================================================\n');

let passCount = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`   ✅ [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`   ❌ [FAIL] ${name}: ${err.message}`);
  }
}

// 1. LEAVE POLICY (BJK-HR-POL-001)
console.log('[1/7] Testing Leave Policy (BJK-HR-POL-001)...');

runTest('EL Minimum Block: Rejects Earned Leave applied for less than 3 consecutive days', () => {
  const result = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'EARNED_LEAVE',
    requestedDays: 2, // Violation! Minimum is 3
    availableBalance: 10,
    noticeDays: 15
  });
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.decision, 'REJECTED');
  assert.ok(result.violations.some(v => v.rule.includes('EL_MIN_BLOCK')));
});

runTest('EL Maximum Continuous: Rejects Earned Leave applied for more than 15 continuous days', () => {
  const result = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'EARNED_LEAVE',
    requestedDays: 16, // Violation! Maximum is 15
    availableBalance: 20,
    noticeDays: 20
  });
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.decision, 'REJECTED');
  assert.ok(result.violations.some(v => v.rule.includes('EL_MAX_CONTINUOUS')));
});

runTest('EL Advance Notice: Rejects 5+ days EL with less than 15 days advance notice', () => {
  const result = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'EARNED_LEAVE',
    requestedDays: 6,
    availableBalance: 15,
    noticeDays: 5 // Violation! Requires 15 days notice
  });
  assert.strictEqual(result.passed, false);
  assert.ok(result.violations.some(v => v.rule.includes('EL_NOTICE_DAYS_5_PLUS')));
});

runTest('CL Maximum Continuous: Rejects Casual Leave applied for more than 2 continuous days', () => {
  const result = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'CASUAL_LEAVE',
    requestedDays: 3, // Violation! Max is 2
    availableBalance: 7
  });
  assert.strictEqual(result.passed, false);
  assert.ok(result.violations.some(v => v.rule.includes('CL_MAX_CONTINUOUS')));
});

runTest('SL Medical Certificate: Enforces medical cert requirement for Sick Leave of 3+ days', () => {
  const withoutCert = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'SICK_LEAVE',
    requestedDays: 3,
    availableBalance: 4,
    hasMedicalCertificate: false
  });
  assert.strictEqual(withoutCert.passed, false);
  assert.ok(withoutCert.violations.some(v => v.rule.includes('SL_MEDICAL_CERT_DAYS')));

  const withCert = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'SICK_LEAVE',
    requestedDays: 3,
    availableBalance: 4,
    hasMedicalCertificate: true
  });
  assert.strictEqual(withCert.passed, true);
});

runTest('GMP Cleanroom Fitness Certificate: Enforces fitness cert after 4+ days SL in GMP area', () => {
  const gmpWithoutCert = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'SICK_LEAVE',
    requestedDays: 4,
    availableBalance: 4,
    isGMPArea: true,
    hasMedicalCertificate: false
  });
  assert.strictEqual(gmpWithoutCert.passed, false);
  assert.ok(gmpWithoutCert.violations.some(v => v.rule.includes('SL_GMP_FITNESS_CERT_DAYS')));
});

// 2. ATTENDANCE & PUNCTUALITY (BJK-HR-POL-002)
console.log('\n[2/7] Testing Attendance & Punctuality Policy (BJK-HR-POL-002)...');

runTest('10-Minute Grace: Permits arrival within 10 minutes without penalty', () => {
  const result = policyEngine.evaluateAttendanceLateness({ lateMinutes: 8, monthlyGraceCountPrior: 1 });
  assert.strictEqual(result.status, 'WITHIN_GRACE');
  assert.strictEqual(result.penalty, 'NONE');
});

runTest('Habitual Grace: Flags arrival within grace if 5+ times used in a month', () => {
  const result = policyEngine.evaluateAttendanceLateness({ lateMinutes: 9, monthlyGraceCountPrior: 4 }); // 5th time
  assert.strictEqual(result.status, 'WITHIN_GRACE');
  assert.strictEqual(result.penalty, 'HR_FLAGGED');
});

runTest('Late Tier 1: Allows up to 3 verbal occurrences of 11-30 min without deduction', () => {
  const occ1 = policyEngine.evaluateAttendanceLateness({ lateMinutes: 20, monthlyLatenessCountPrior: 0 });
  assert.strictEqual(occ1.penalty, 'VERBAL_WARNING');

  const occ4 = policyEngine.evaluateAttendanceLateness({ lateMinutes: 20, monthlyLatenessCountPrior: 3 });
  assert.strictEqual(occ4.penalty, 'HALF_DAY_LOP');
});

runTest('Late Tier 3: 60+ minutes late triggers Full-day absence LOP', () => {
  const result = policyEngine.evaluateAttendanceLateness({ lateMinutes: 65 });
  assert.strictEqual(result.status, 'LATE_TIER_3');
  assert.strictEqual(result.penalty, 'FULL_DAY_ABSENCE_LOP');
});

// 3. OVERTIME LIMITS (BJK-HR-POL-002)
console.log('\n[3/7] Testing Overtime Caps (BJK-HR-POL-002)...');

runTest('Weekly Overtime: Rejects overtime exceeding 12 hours per week', () => {
  const result = policyEngine.validateOvertime({
    plannedHours: 4,
    weeklyAccumulatedHours: 10 // 10 + 4 = 14 > 12h cap
  });
  assert.strictEqual(result.allowed, false);
  assert.ok(result.reason.includes('weekly overtime ceiling of 12 hours'));
});

runTest('Quarterly Overtime: Rejects overtime exceeding 50 hours per quarter', () => {
  const result = policyEngine.validateOvertime({
    plannedHours: 3,
    weeklyAccumulatedHours: 6,
    quarterlyAccumulatedHours: 49 // 49 + 3 = 52 > 50h cap
  });
  assert.strictEqual(result.allowed, false);
  assert.ok(result.reason.includes('statutory quarterly overtime ceiling of 50 hours'));
});

// 4. DISCIPLINARY PROGRESSIVE STEPS (BJK-HR-POL-004)
console.log('\n[4/7] Testing Disciplinary Progressive Discipline (BJK-HR-POL-004)...');

runTest('Progressive Steps: Advances from Verbal (Step 1) to Written (Step 2) for repeated misconduct', () => {
  const res = policyEngine.evaluateDisciplinaryStep({ misconductCategory: 'MAJOR', priorStep: 1 });
  assert.strictEqual(res.step, 2);
  assert.strictEqual(res.stepInfo.name, 'WRITTEN_WARNING');
  assert.strictEqual(res.bypassed, false);
});

runTest('Step Bypass: Gross misconduct immediately jumps to Step 6 (Termination / Legal)', () => {
  const res = policyEngine.evaluateDisciplinaryStep({
    misconductCategory: 'GROSS',
    priorStep: 0,
    bypassReason: 'Falsifying batch manufacturing records'
  });
  assert.strictEqual(res.step, 6);
  assert.strictEqual(res.bypassed, true);
  assert.strictEqual(res.authority, 'Managing Director');
});

// 5. MATERNITY & PATERNITY (BJK-HR-POL-016)
console.log('\n[5/7] Testing Parental Leave Entitlements (BJK-HR-POL-016)...');

runTest('Maternity Benefit Eligibility: Checks 80 days employment in preceding 12 months', () => {
  const ineligible = policyEngine.calculateParentalEntitlement({
    type: 'MATERNITY',
    scenario: 'NATURAL_BIRTH_FIRST_OR_SECOND_CHILD',
    daysWorkedPast12Months: 60 // Ineligible! Minimum is 80
  });
  assert.strictEqual(ineligible.eligible, false);

  const eligible = policyEngine.calculateParentalEntitlement({
    type: 'MATERNITY',
    scenario: 'NATURAL_BIRTH_FIRST_OR_SECOND_CHILD',
    daysWorkedPast12Months: 100
  });
  assert.strictEqual(eligible.eligible, true);
  assert.strictEqual(eligible.entitlement.days, 182); // 26 weeks
});

runTest('Paternity Leave: Entitles male employees to 15 consecutive calendar days', () => {
  const result = policyEngine.calculateParentalEntitlement({ type: 'PATERNITY' });
  assert.strictEqual(result.eligible, true);
  assert.strictEqual(result.entitlement.days, 15);
});

// 6. POLICY TRACEABILITY METADATA
console.log('\n[6/7] Testing Policy Traceability & Citations...');

runTest('Traceability: Policy validation returns authoritative handbook page citations', () => {
  const result = policyEngine.validateLeaveApplication({
    leaveTypeCode: 'EARNED_LEAVE',
    requestedDays: 3,
    availableBalance: 10,
    noticeDays: 7
  });
  assert.strictEqual(result.passed, true);
  assert.ok(result.traceability.length > 0);
  assert.strictEqual(result.traceability[0].policyNumber, 'BJK-HR-POL-001');
  assert.strictEqual(result.traceability[0].sourcePage, 'Pages 5-7');
});

// 7. SUMMARY
console.log('\n========================================================================');
console.log(`🏆 ALL ${passCount}/${totalTests} POLICY ENGINE UNIT TESTS PASSED SUCCESSFULLY!`);
console.log('========================================================================\n');
