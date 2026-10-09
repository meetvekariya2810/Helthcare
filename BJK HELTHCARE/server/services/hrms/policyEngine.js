const { Policy, PolicyRule } = require('../../models/hrms/PolicyMaster');

// ==============================================================================
// BJK HEALTHCARE CENTRAL POLICY RULES ENGINE (BJK-HR-POL-001 through POL-016)
// ==============================================================================

// Default Source-of-Truth Policy Rules from 55-page BJK HR Policy Handbook
const DEFAULT_POLICY_RULES = [
  // Leave Policy: BJK-HR-POL-001
  {
    ruleCode: 'EL_MAX_ACCUMULATION',
    ruleName: 'Earned Leave Maximum Accumulation Cap',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'maxAccumulation',
    value: 50,
    unit: 'days',
    description: 'Earned Leave can be carried forward up to a maximum accumulation of 50 days.',
    sourcePage: 'Page 5, 6'
  },
  {
    ruleCode: 'EL_ACCRUAL_MONTHLY',
    ruleName: 'Earned Leave Monthly Accrual Rate',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'monthlyAccrualRate',
    value: 0.58,
    unit: 'days/month',
    description: 'Accrual of 0.58 days per completed calendar month (7 days per year).',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'EL_MIN_BLOCK',
    ruleName: 'Earned Leave Minimum Block Requirement',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'minConsecutiveBlock',
    value: 3,
    unit: 'days',
    description: 'Earned leave must be applied for a minimum block of 3 consecutive calendar days.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'EL_MAX_CONTINUOUS',
    ruleName: 'Earned Leave Maximum Continuous Duration',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'maxContinuousDays',
    value: 15,
    unit: 'days',
    description: 'Maximum continuous EL allowed in a single stretch is 15 days.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'EL_NOTICE_DAYS_5_PLUS',
    ruleName: 'Advance Notice for 5+ Days Earned Leave',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'advanceNotice5PlusDays',
    value: 15,
    unit: 'days',
    description: 'Advance notice of at least 15 days is mandatory for EL requests of 5 or more days.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'EL_NOTICE_DAYS_3_TO_4',
    ruleName: 'Advance Notice for 3-4 Days Earned Leave',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'advanceNotice3To4Days',
    value: 7,
    unit: 'days',
    description: 'Advance notice of at least 7 days is mandatory for EL requests of 3-4 days.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'EL_MAX_ENCASHMENT_YEARLY',
    ruleName: 'Earned Leave Annual Encashment Cap',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'maxEncashmentYearly',
    value: 10,
    unit: 'days',
    description: 'Maximum 10 days of EL can be encashed per year in December.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'CL_MAX_CONTINUOUS',
    ruleName: 'Casual Leave Maximum Continuous Duration',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'maxContinuousDays',
    value: 2,
    unit: 'days',
    description: 'Casual leave is meant for unplanned short absences and capped at 2 continuous days.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'SL_MEDICAL_CERT_DAYS',
    ruleName: 'Sick Leave Medical Certificate Threshold',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'certRequiredThresholdDays',
    value: 3,
    unit: 'days',
    description: 'Medical practitioner certificate required for sick leave of 3 or more days.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'SL_GMP_FITNESS_CERT_DAYS',
    ruleName: 'GMP Regulated Cleanroom Fitness Certificate Requirement',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'gmpFitnessThresholdDays',
    value: 4,
    unit: 'days',
    description: 'In GMP manufacturing/QC areas, fitness certificate is mandatory after 4+ days absence.',
    sourcePage: 'Page 6'
  },
  {
    ruleCode: 'COMP_OFF_VALIDITY_DAYS',
    ruleName: 'Compensatory Off Expiration Window',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'validityDays',
    value: 90,
    unit: 'days',
    description: 'Compensatory off must be availed within 90 days of working on holiday/week-off.',
    sourcePage: 'Page 5'
  },
  {
    ruleCode: 'GMP_ABSENCE_REFRESHER_DAYS',
    ruleName: 'GMP Refresher Training Threshold on Absence',
    policyNumber: 'BJK-HR-POL-001',
    policyTitle: 'Leave Policy',
    parameter: 'absenceThresholdDays',
    value: 30,
    unit: 'days',
    description: 'GMP refresher training is mandatory after 30+ days continuous absence before cleanroom re-entry.',
    sourcePage: 'Page 7'
  },

  // Attendance & Punctuality: BJK-HR-POL-002
  {
    ruleCode: 'ATTENDANCE_GRACE',
    ruleName: 'Daily Shift Start Grace Period',
    policyNumber: 'BJK-HR-POL-002',
    policyTitle: 'Attendance & Punctuality Policy',
    parameter: 'graceMinutes',
    value: 10,
    unit: 'minutes',
    description: 'Grace period of 10 minutes allowed after scheduled shift commencement.',
    sourcePage: 'Page 11'
  },
  {
    ruleCode: 'HABITUAL_GRACE_LIMIT',
    ruleName: 'Habitual Grace Use Threshold',
    policyNumber: 'BJK-HR-POL-002',
    policyTitle: 'Attendance & Punctuality Policy',
    parameter: 'monthlyGraceThreshold',
    value: 5,
    unit: 'times/month',
    description: 'Using grace period 5 or more times per month is flagged by HR as habitual lateness.',
    sourcePage: 'Page 11'
  },
  {
    ruleCode: 'MISSED_PUNCH_LIMIT',
    ruleName: 'Monthly Missed Punch Attendance Violation Limit',
    policyNumber: 'BJK-HR-POL-002',
    policyTitle: 'Attendance & Punctuality Policy',
    parameter: 'maxMonthlyMissedPunches',
    value: 3,
    unit: 'times/month',
    description: '3 or more missed biometric punches in a single calendar month constitutes an attendance violation.',
    sourcePage: 'Page 11'
  },
  {
    ruleCode: 'OVERTIME_WEEKLY_CAP',
    ruleName: 'Maximum Overtime Hours per Week',
    policyNumber: 'BJK-HR-POL-002',
    policyTitle: 'Attendance & Punctuality Policy',
    parameter: 'maxWeeklyHours',
    value: 12,
    unit: 'hours/week',
    description: 'Overtime is capped at 12 hours per week under Factories Act compliance.',
    sourcePage: 'Page 13'
  },
  {
    ruleCode: 'OVERTIME_QUARTERLY_CAP',
    ruleName: 'Maximum Overtime Hours per Quarter',
    policyNumber: 'BJK-HR-POL-002',
    policyTitle: 'Attendance & Punctuality Policy',
    parameter: 'maxQuarterlyHours',
    value: 50,
    unit: 'hours/quarter',
    description: 'Statutory quarterly overtime ceiling is 50 hours.',
    sourcePage: 'Page 13'
  },

  // Onboarding & Training: BJK-HR-POL-009 & POL-007
  {
    ruleCode: 'GMP_TRAINING_PASS',
    ruleName: 'Regulated Area GMP Examination Minimum Passing Mark',
    policyNumber: 'BJK-HR-POL-007',
    policyTitle: 'Training & Development Policy',
    parameter: 'passPercentage',
    value: 80,
    unit: 'percent',
    description: 'Minimum 80% passing mark required in written & practical GMP qualification assessments.',
    sourcePage: 'Page 24, 25, 51, 52'
  },
  {
    ruleCode: 'PROBATION_DURATION_DAYS',
    ruleName: 'Standard Employee Probation Duration',
    policyNumber: 'BJK-HR-POL-009',
    policyTitle: 'Employee Onboarding & Induction',
    parameter: 'probationDays',
    value: 90,
    unit: 'days',
    description: 'Formal 90-day onboarding journey with Day 30, Day 60, and Day 90 review gates.',
    sourcePage: 'Page 25'
  },

  // Separation: BJK-HR-POL-010
  {
    ruleCode: 'SEPARATION_FF_SETTLEMENT_DAYS',
    ruleName: 'Full and Final Settlement Completion SLA',
    policyNumber: 'BJK-HR-POL-010',
    policyTitle: 'Employee Separation & Exit Policy',
    parameter: 'settlementDays',
    value: 45,
    unit: 'days',
    description: 'Full & Final settlement must be computed and disbursed within 45 days of exit.',
    sourcePage: 'Page 28'
  },
  {
    ruleCode: 'SEPARATION_RELIEVING_CERT_DAYS',
    ruleName: 'Experience and Relieving Certificate Delivery SLA',
    policyNumber: 'BJK-HR-POL-010',
    policyTitle: 'Employee Separation & Exit Policy',
    parameter: 'certificateDays',
    value: 30,
    unit: 'days',
    description: 'Relieving & experience certificate issued within 30 days of last working day.',
    sourcePage: 'Page 28'
  },

  // Maternity & Paternity: BJK-HR-POL-016 (conflict flag POL-011)
  {
    ruleCode: 'MATERNITY_1ST_2ND_CHILD_WEEKS',
    ruleName: 'Paid Maternity Leave for First Two Children',
    policyNumber: 'BJK-HR-POL-016',
    policyTitle: 'Maternity & Paternity Leave Policy',
    parameter: 'entitledWeeks',
    value: 26,
    unit: 'weeks (182 days)',
    description: '26 weeks (182 calendar days) fully paid maternity leave for 1st & 2nd child.',
    sourcePage: 'Page 30'
  },
  {
    ruleCode: 'MATERNITY_ELIGIBILITY_DAYS',
    ruleName: 'Statutory Employment Days for Maternity Benefit Eligibility',
    policyNumber: 'BJK-HR-POL-016',
    policyTitle: 'Maternity & Paternity Leave Policy',
    parameter: 'minWorkingDaysIn12Months',
    value: 80,
    unit: 'days',
    description: 'Minimum 80 days of active employment in the preceding 12 months.',
    sourcePage: 'Page 30'
  },
  {
    ruleCode: 'PATERNITY_LEAVE_DAYS',
    ruleName: 'Paid Paternity Leave Entitlement',
    policyNumber: 'BJK-HR-POL-016',
    policyTitle: 'Maternity & Paternity Leave Policy',
    parameter: 'calendarDays',
    value: 15,
    unit: 'calendar days',
    description: '15 consecutive calendar days fully paid, usable within 60 days of birth/adoption in max 2 tranches.',
    sourcePage: 'Page 30'
  },

  // POSH: BJK-HR-POL-012
  {
    ruleCode: 'POSH_INQUIRY_SLA_DAYS',
    ruleName: 'ICC Formal Inquiry Statutory Completion Deadline',
    policyNumber: 'BJK-HR-POL-012',
    policyTitle: 'POSH Policy',
    parameter: 'inquiryDays',
    value: 90,
    unit: 'days',
    description: 'Internal Complaints Committee must conclude inquiry within 90 days of registration.',
    sourcePage: 'Page 35'
  },

  // IT Security & Privacy: BJK-HR-POL-014 & POL-015
  {
    ruleCode: 'IT_PASSWORD_MIN_LENGTH',
    ruleName: 'Minimum Password Character Length',
    policyNumber: 'BJK-HR-POL-015',
    policyTitle: 'IT & Information Security Policy',
    parameter: 'minLength',
    value: 12,
    unit: 'characters',
    description: 'Passwords must contain min 12 characters with upper, lower, number, and special symbols.',
    sourcePage: 'Page 43'
  },
  {
    ruleCode: 'IT_PASSWORD_EXPIRY_DAYS',
    ruleName: 'Mandatory Password Rotation Cycle',
    policyNumber: 'BJK-HR-POL-015',
    policyTitle: 'IT & Information Security Policy',
    parameter: 'rotationDays',
    value: 90,
    unit: 'days',
    description: 'Passwords expire every 90 days; last 12 historical passwords cannot be reused.',
    sourcePage: 'Page 43'
  },
  {
    ruleCode: 'IT_ACCOUNT_LOCK_ATTEMPTS',
    ruleName: 'Failed Login Attempt Account Lockout Threshold',
    policyNumber: 'BJK-HR-POL-015',
    policyTitle: 'IT & Information Security Policy',
    parameter: 'maxFailedAttempts',
    value: 5,
    unit: 'attempts',
    description: 'Accounts are locked automatically after 5 failed authentication attempts.',
    sourcePage: 'Page 43'
  }
];

class PolicyEngine {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }

  // Load configured rules from database or fallback to handbook defaults
  async loadRules() {
    try {
      const dbRules = await PolicyRule.find({ isActive: true });
      if (dbRules && dbRules.length > 0) {
        dbRules.forEach(r => {
          this.cache.set(r.ruleCode, r.value);
        });
      } else {
        DEFAULT_POLICY_RULES.forEach(r => {
          this.cache.set(r.ruleCode, r.value);
        });
      }
      this.initialized = true;
    } catch (err) {
      console.warn('[PolicyEngine] Rule load warning, falling back to static handbook defaults:', err.message);
      DEFAULT_POLICY_RULES.forEach(r => {
        this.cache.set(r.ruleCode, r.value);
      });
      this.initialized = true;
    }
  }

  getRuleValue(ruleCode, fallbackValue = null) {
    if (this.cache.has(ruleCode)) {
      return this.cache.get(ruleCode);
    }
    const def = DEFAULT_POLICY_RULES.find(r => r.ruleCode === ruleCode);
    return def ? def.value : fallbackValue;
  }

  // ============================================================================
  // 1. LEAVE POLICY VALIDATOR (BJK-HR-POL-001)
  // ============================================================================
  validateLeaveApplication({ leaveTypeCode, requestedDays, startDate, endDate, isGMPArea = false, availableBalance = 0, consecutiveDays = 0, noticeDays = 0, hasMedicalCertificate = false }) {
    const code = (leaveTypeCode || '').toUpperCase();
    const results = {
      passed: true,
      decision: 'APPROVED',
      violations: [],
      traceability: []
    };

    // Balance check
    if (requestedDays > availableBalance) {
      results.passed = false;
      results.decision = 'REJECTED';
      results.violations.push({
        policy: 'BJK-HR-POL-001',
        rule: 'BALANCE_INSUFFICIENT',
        sourceDocument: 'BJK Healthcare HR Policy Handbook',
        sourcePage: 'Page 5',
        reason: `Requested duration (${requestedDays} days) exceeds available ${code} balance (${availableBalance} days).`
      });
    }

    // Earned Leave (EL) Specific Rules
    if (code === 'EARNED_LEAVE' || code === 'EL') {
      const minBlock = this.getRuleValue('EL_MIN_BLOCK', 3);
      const maxContinuous = this.getRuleValue('EL_MAX_CONTINUOUS', 15);
      const noticeFor5Plus = this.getRuleValue('EL_NOTICE_DAYS_5_PLUS', 15);
      const noticeFor3To4 = this.getRuleValue('EL_NOTICE_DAYS_3_TO_4', 7);

      // Rule: Minimum block = 3 consecutive days
      if (requestedDays < minBlock) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `EL_MIN_BLOCK = ${minBlock}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `Earned Leave must be applied for a minimum block of ${minBlock} consecutive days (requested: ${requestedDays} days).`
        });
      }

      // Rule: Maximum continuous = 15 days
      if (requestedDays > maxContinuous) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `EL_MAX_CONTINUOUS = ${maxContinuous}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `Earned Leave cannot exceed ${maxContinuous} continuous days in a single stretch (requested: ${requestedDays} days).`
        });
      }

      // Rule: Advance notice
      if (requestedDays >= 5 && noticeDays < noticeFor5Plus) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `EL_NOTICE_DAYS_5_PLUS = ${noticeFor5Plus}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `Advance notice of at least ${noticeFor5Plus} days is required for Earned Leave of 5 or more days (provided: ${noticeDays} days).`
        });
      } else if (requestedDays >= 3 && requestedDays < 5 && noticeDays < noticeFor3To4) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `EL_NOTICE_DAYS_3_TO_4 = ${noticeFor3To4}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `Advance notice of at least ${noticeFor3To4} days is required for Earned Leave of 3-4 days (provided: ${noticeDays} days).`
        });
      }
    }

    // Casual Leave (CL) Specific Rules
    if (code === 'CASUAL_LEAVE' || code === 'CL') {
      const maxCL = this.getRuleValue('CL_MAX_CONTINUOUS', 2);
      if (requestedDays > maxCL) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `CL_MAX_CONTINUOUS = ${maxCL}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `Casual Leave is capped at a maximum of ${maxCL} continuous days at a time (requested: ${requestedDays} days).`
        });
      }
    }

    // Sick Leave (SL) Specific Rules
    if (code === 'SICK_LEAVE' || code === 'SL') {
      const medCertDays = this.getRuleValue('SL_MEDICAL_CERT_DAYS', 3);
      const gmpCertDays = this.getRuleValue('SL_GMP_FITNESS_CERT_DAYS', 4);

      if (requestedDays >= medCertDays && !hasMedicalCertificate) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `SL_MEDICAL_CERT_DAYS = ${medCertDays}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `Medical certificate from a registered practitioner is required for Sick Leave of ${medCertDays} or more days.`
        });
      }

      if (isGMPArea && requestedDays >= gmpCertDays && !hasMedicalCertificate) {
        results.passed = false;
        results.decision = 'REJECTED';
        results.violations.push({
          policy: 'BJK-HR-POL-001',
          rule: `SL_GMP_FITNESS_CERT_DAYS = ${gmpCertDays}`,
          sourceDocument: 'BJK Healthcare HR Policy Handbook',
          sourcePage: 'Page 6',
          reason: `For GMP manufacturing & QC areas, an occupational medical fitness certificate is mandatory after ${gmpCertDays}+ days sick leave prior to cleanroom re-entry.`
        });
      }
    }

    // Traceability summary
    results.traceability = [
      {
        policyNumber: 'BJK-HR-POL-001',
        policyTitle: 'Leave Policy',
        sourcePage: 'Pages 5-7',
        evaluatedAt: new Date(),
        status: results.passed ? 'COMPLIANT' : 'NON_COMPLIANT'
      }
    ];

    return results;
  }

  // ============================================================================
  // 2. ATTENDANCE & PUNCTUALITY VALIDATOR (BJK-HR-POL-002)
  // ============================================================================
  evaluateAttendanceLateness({ lateMinutes, monthlyLatenessCountPrior = 0, monthlyGraceCountPrior = 0 }) {
    const graceLimit = this.getRuleValue('ATTENDANCE_GRACE', 10);
    const habitualGraceLimit = this.getRuleValue('HABITUAL_GRACE_LIMIT', 5);

    if (lateMinutes <= 0) {
      return { status: 'ON_TIME', penalty: 'NONE', message: 'Employee arrived on schedule.' };
    }

    if (lateMinutes <= graceLimit) {
      const isHabitual = (monthlyGraceCountPrior + 1) >= habitualGraceLimit;
      return {
        status: 'WITHIN_GRACE',
        penalty: isHabitual ? 'HR_FLAGGED' : 'NONE',
        graceMinutesUsed: lateMinutes,
        message: isHabitual
          ? `Within 10-min grace, but habitual grace limit (${habitualGraceLimit}+ times/month) reached. Flagged to HR.`
          : 'Arrived within 10-minute grace period.',
        policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 11]'
      };
    }

    // 11-30 minutes late
    if (lateMinutes > 10 && lateMinutes <= 30) {
      const totalCount = monthlyLatenessCountPrior + 1;
      const deductionApplies = totalCount > 3;
      return {
        status: 'LATE_TIER_1',
        delay: '11-30 min late',
        frequencyMonth: totalCount,
        penalty: deductionApplies ? 'HALF_DAY_LOP' : 'VERBAL_WARNING',
        message: deductionApplies 
          ? `11-30 min late (${totalCount}th time this month, exceeding 3 free occurrences) -> Half-day leave deduction or LOP.`
          : `11-30 min late (${totalCount} of 3 free occurrences this month) -> Verbal warning noted without deduction.`,
        policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 12]'
      };
    }

    // 31-60 minutes late
    if (lateMinutes > 30 && lateMinutes <= 60) {
      return {
        status: 'LATE_TIER_2',
        delay: '31-60 min late',
        penalty: 'HALF_DAY_DEDUCTION_OR_LOP',
        message: '31-60 min late -> Half-day leave deduction or LOP.',
        policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 12]'
      };
    }

    // 60+ minutes late
    return {
      status: 'LATE_TIER_3',
      delay: '60+ min late',
      penalty: 'FULL_DAY_ABSENCE_LOP',
      message: '60+ minutes late -> Marked as Full-day absence / Full-day LOP.',
      policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 12]'
    };
  }

  // ============================================================================
  // 3. OVERTIME VALIDATOR (BJK-HR-POL-002)
  // ============================================================================
  validateOvertime({ plannedHours, weeklyAccumulatedHours = 0, quarterlyAccumulatedHours = 0 }) {
    const weeklyCap = this.getRuleValue('OVERTIME_WEEKLY_CAP', 12);
    const quarterlyCap = this.getRuleValue('OVERTIME_QUARTERLY_CAP', 50);

    const newWeekly = weeklyAccumulatedHours + plannedHours;
    const newQuarterly = quarterlyAccumulatedHours + plannedHours;

    if (newWeekly > weeklyCap) {
      return {
        allowed: false,
        reason: `Exceeds weekly overtime ceiling of ${weeklyCap} hours under Factories Act (Current: ${weeklyAccumulatedHours}h + Requested: ${plannedHours}h = ${newWeekly}h).`,
        policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 13]'
      };
    }

    if (newQuarterly > quarterlyCap) {
      return {
        allowed: false,
        reason: `Exceeds statutory quarterly overtime ceiling of ${quarterlyCap} hours (Current: ${quarterlyAccumulatedHours}h + Requested: ${plannedHours}h = ${newQuarterly}h).`,
        policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 13]'
      };
    }

    return {
      allowed: true,
      weeklyHoursResult: newWeekly,
      quarterlyHoursResult: newQuarterly,
      policyCitation: '[Source: BJK-HR-POL-002, HR Policy Handbook, Page 13]'
    };
  }

  // ============================================================================
  // 4. DISCIPLINARY PROGRESSIVE STEP ENGINE (BJK-HR-POL-004)
  // ============================================================================
  evaluateDisciplinaryStep({ misconductCategory, priorStep = 0, isBypassRequested = false, bypassReason = '' }) {
    if (misconductCategory === 'GROSS' || isBypassRequested) {
      return {
        step: 6,
        stepName: 'TERMINATION / LEGAL_ACTION',
        authority: 'Managing Director',
        bypassed: true,
        reason: bypassReason || 'Gross misconduct, criminal activity, violence, or GMP data falsification allows immediate step bypass.',
        policyCitation: '[Source: BJK-HR-POL-004, HR Policy Handbook, Page 20-21]'
      };
    }

    const nextStep = Math.min(priorStep + 1, 6);
    const stepMatrix = {
      1: { name: 'VERBAL_WARNING', authority: 'Supervisor / Manager', validityDays: 30 },
      2: { name: 'WRITTEN_WARNING', authority: 'Dept Head / HR', validityMonths: 6 },
      3: { name: 'FINAL_WRITTEN_WARNING', authority: 'Head - HR', validityMonths: 12 },
      4: { name: 'SUSPENSION', authority: 'Head - HR + MD', duration: '3-7 days' },
      5: { name: 'DEMOTION_OR_TRANSFER', authority: 'Management + HR', permanence: 'Permanent' },
      6: { name: 'TERMINATION', authority: 'Managing Director', finality: 'Final' }
    };

    return {
      step: nextStep,
      stepInfo: stepMatrix[nextStep],
      bypassed: false,
      policyCitation: '[Source: BJK-HR-POL-004, HR Policy Handbook, Page 21]'
    };
  }

  // ============================================================================
  // 5. MATERNITY & PATERNITY CALCULATOR (BJK-HR-POL-016)
  // ============================================================================
  calculateParentalEntitlement({ type, scenario, childCountPrior = 0, daysWorkedPast12Months = 80 }) {
    const minWorkingDays = this.getRuleValue('MATERNITY_ELIGIBILITY_DAYS', 80);
    
    if (type === 'MATERNITY') {
      const isEligible = daysWorkedPast12Months >= minWorkingDays;
      if (!isEligible) {
        return {
          eligible: false,
          reason: `Employee has completed ${daysWorkedPast12Months} days in preceding 12 months (statutory requirement is ${minWorkingDays} days).`,
          policyCitation: '[Source: BJK-HR-POL-016 / POL-011, HR Policy Handbook, Page 30]'
        };
      }

      const maternityMatrix = {
        NATURAL_BIRTH_FIRST_OR_SECOND_CHILD: { weeks: 26, days: 182, label: '26 weeks (182 days) fully paid' },
        NATURAL_BIRTH_THIRD_CHILD_ONWARDS: { weeks: 12, days: 84, label: '12 weeks (84 days) fully paid' },
        LEGAL_ADOPTION_UNDER_3_MONTHS: { weeks: 12, days: 84, label: '12 weeks from handover' },
        SURROGACY_COMMISSIONING_MOTHER: { weeks: 12, days: 84, label: '12 weeks from handover' },
        MISCARRIAGE_MEDICAL_TERMINATION: { weeks: 6, days: 42, label: '6 weeks (42 days) fully paid' },
        STILLBIRTH_POST_20_WEEKS: { weeks: 12, days: 84, label: '12 weeks paid + EAP counseling' },
        PREGNANCY_RELATED_ILLNESS: { weeks: 4, days: 30, label: 'Additional 1 month paid' },
        TUBECTOMY_PROCEDURE: { weeks: 2, days: 14, label: '2 weeks (14 days) fully paid' }
      };

      const selected = maternityMatrix[scenario] || (childCountPrior >= 2 ? maternityMatrix.NATURAL_BIRTH_THIRD_CHILD_ONWARDS : maternityMatrix.NATURAL_BIRTH_FIRST_OR_SECOND_CHILD);
      return {
        eligible: true,
        entitlement: selected,
        nursingBreaks: '2 nursing breaks/day until child is 15 months',
        protectionAffirmed: 'Statutory non-termination during maternity; appraisal rating & increments protected.',
        policyCitation: '[Source: BJK-HR-POL-016 / POL-011, HR Policy Handbook, Page 30-31]'
      };
    }

    // Paternity Leave
    return {
      eligible: true,
      entitlement: { days: 15, label: '15 consecutive calendar days fully paid' },
      restrictions: 'Must be availed within 60 days of birth/adoption (max 2 tranches; max 2 children). Non-encashable and cannot carry forward.',
      policyCitation: '[Source: BJK-HR-POL-016 / POL-011, HR Policy Handbook, Page 30]'
    };
  }
}

const policyEngineInstance = new PolicyEngine();

module.exports = {
  policyEngine: policyEngineInstance,
  DEFAULT_POLICY_RULES
};
