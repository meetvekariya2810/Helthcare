const mongoose = require('mongoose');
const {
  LeaveType,
  LeavePolicy,
  HolidayCalendar,
  LeaveBalance,
  LeaveRequest,
  LeaveActivity,
  CompOffWorkAuthorization,
  CompOffCredit,
  LeaveBlackoutPeriod,
  DepartmentStaffingThreshold,
  LeaveRefresherTraining,
  MedicalFitnessRecord,
  LeaveEncashmentRequest,
  LeaveRegularizationRequest,
  LeaveGrievance,
  PolicyClarification
} = require('../../models/hrms/Leave');
const Employee = require('../../models/hrms/Employee');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');

// ==============================================================================
// 1. OFFICIAL BJK-HR-POL-001 LEAVE TYPES
// ==============================================================================
const BJK_POLICY_001_LEAVE_TYPES = [
  {
    code: 'EARNED_LEAVE',
    name: 'Earned Leave (EL/PL)',
    description: '7 days/year for confirmed staff, 0.58 days/month. Min block 3 days, max 15 days, max accumulate 50 days, 50% carry-forward.',
    annualQuotaDays: 7,
    isPaid: true,
    carryForwardAllowed: true,
    maxCarryForwardDays: 50,
    requiresDocumentProof: false,
    minNoticeDays: 7,
    maxConsecutiveDays: 15,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_OF_DEPARTMENT', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'CASUAL_LEAVE',
    name: 'Casual Leave (CL)',
    description: '7 days/year for confirmed employees, credited 0.58 monthly. Max 2 consecutive days. Not eligible during probation. Lapses Dec 31.',
    annualQuotaDays: 7,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 1,
    maxConsecutiveDays: 2,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER'],
    isActive: true
  },
  {
    code: 'SICK_LEAVE',
    name: 'Sick Leave (SL)',
    description: '4 days/year credited on Jan 1. Confirmed and probationary staff. Medical cert for 3-4 days. Cleanroom fitness cert for 4+ days in GMP/QC.',
    annualQuotaDays: 4,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 0,
    maxConsecutiveDays: 4,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'COMPENSATORY_OFF',
    name: 'Compensatory Off (Comp-Off)',
    description: '1 day for qualifying extra day, 0.5 day for 4 hours. Requires advance authorization. Expires after 90 days. Non-encashable.',
    annualQuotaDays: 0,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 3,
    maxConsecutiveDays: 2,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'BEREAVEMENT_LEAVE',
    name: 'Bereavement Leave',
    description: '2 days for immediate family; 1 day for extended family. Supporting doc may be requested. Lapses at year end.',
    annualQuotaDays: 2,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 0,
    maxConsecutiveDays: 2,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'MARRIAGE_LEAVE',
    name: 'Marriage Leave',
    description: '5 days paid leave for employee own wedding. Min 30 days notice with invitation/cert. Once during tenure.',
    annualQuotaDays: 5,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 30,
    maxConsecutiveDays: 5,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'SPECIAL_LEAVE',
    name: 'Special Leave (Birthday / Anniversary)',
    description: '1 day paid leave for own birthday or anniversary. Min 15 days advance notice with proof.',
    annualQuotaDays: 1,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 15,
    maxConsecutiveDays: 1,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'ELECTION_DUTY_LEAVE',
    name: 'Election Duty Leave',
    description: 'Paid leave for authorized duty period with Election Commission order submitted to HR.',
    annualQuotaDays: 3,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 3,
    maxConsecutiveDays: 5,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'JURY_COURT_LEAVE',
    name: 'Jury Duty / Court Summons Leave',
    description: 'Paid leave for duration of legal attendance with official summons copy submitted to HR.',
    annualQuotaDays: 3,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 3,
    maxConsecutiveDays: 5,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  },
  {
    code: 'UNPAID_LEAVE',
    name: 'Leave Without Pay (LOP / LWP)',
    description: 'Granted in exceptional cases after exhausting leave quota with Head–HR approval. Salary deducted pro-rata.',
    annualQuotaDays: 0,
    isPaid: false,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 1,
    maxConsecutiveDays: 30,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['REPORTING_MANAGER', 'HEAD_HR'],
    isActive: true
  }
];

// ==============================================================================
// 2. THE 7 POLICY CLARIFICATION ITEMS (Section 13)
// ==============================================================================
const DEFAULT_POLICY_CLARIFICATIONS = [
  {
    itemKey: 'CL_DURATION_LIMIT',
    title: 'Casual Leave Consecutive Duration Cap vs 3-Day Approval Route',
    sourceSection: 'Policy Section 6.3 vs Section 10.2 Approval Table',
    issueDescription: 'Policy Section 6.3 caps CL at 2 consecutive working days, but Section 10.2 table lists an approval route for CL 3 days (Reporting Manager + HOD).',
    interimRule: 'Standard CL application restricted to 2 days maximum. A 3-day application is routed through the Policy Exception Queue and requires both Reporting Manager and Head of Department approval.',
    activeRuleValue: { maxNormalDays: 2, exceptionAllowedDays: 3, requiresHodApprovalFor3Days: true },
    responsibleReviewer: 'Head – HR & Legal Counsel',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: 'System allows up to 2 days normally; flags 3 days as Policy Exception requiring HOD approval.',
    notes: 'Documented in compliance with BJK-HR-POL-001 Section 13 specification.'
  },
  {
    itemKey: 'EL_APPROVAL_7_DAYS',
    title: 'Earned Leave Approval Threshold at Exactly 7 Days',
    sourceSection: 'Policy Section 10.2 Approval Table',
    issueDescription: 'Approval table specifies rules for 4–6 days (RM + HOD + HR) and >7 days (RM + HOD + MD), leaving exactly 7 days undefined.',
    interimRule: 'Requests of exactly 7 days are processed under the 4–6 days tier requiring Reporting Manager, Head of Department, and Head – HR approval.',
    activeRuleValue: { exact7DaysRouting: 'RM_HOD_HR', mdThresholdDays: 8 },
    responsibleReviewer: 'Head – HR & Managing Director',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: 'EL of 7 days routes through RM, HOD, and Head–HR. Managing Director approval is triggered for 8+ days.',
    notes: 'Prevents stalling of 7-day vacation applications.'
  },
  {
    itemKey: 'SL_APPROVAL_OVERLAP',
    title: 'Sick Leave Approval Ranges Overlap at 2 Days',
    sourceSection: 'Policy Section 10.2 Approval Table',
    issueDescription: 'The table lists Sick Leave (1-2 days) requiring Reporting Manager, and Sick Leave (2-4 days) requiring Reporting Manager + Head – HR with detailed medical documentation.',
    interimRule: 'Sick leave of 1–2 days without hospital admission or critical condition requires Reporting Manager only. If 2 days involves hospitalization, infectious illness, or GMP cleanroom staff, it escalates to Head – HR.',
    activeRuleValue: { standard2DaysApprover: 'REPORTING_MANAGER', critical2DaysApprover: 'RM_AND_HR' },
    responsibleReviewer: 'Head – HR & Plant Medical Officer',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: '1-2 days routine illness requires RM; 3-4 days or hospitalized 2-day illness routes to HR with doctor certificate.',
    notes: 'Ensures swift self-declaration for short sickness while protecting GMP standards.'
  },
  {
    itemKey: 'EL_CARRY_FORWARD_ROUNDING',
    title: 'Earned Leave 50% Carry-Forward Fractional Rounding',
    sourceSection: 'Policy Section 5.3 Maximum Accumulation and Carry Forward',
    issueDescription: 'When 50% of unused EL results in a fraction (e.g. 5 days remaining -> 2.5 days carried forward; 7 days -> 3.5 days), rounding treatment needs explicit definition.',
    interimRule: 'Fractional carry-forward balances are preserved to 0.5 day precision (half-day units). 0.58 monthly accruals are summed and rounded to nearest 0.5 day on annual reconciliation.',
    activeRuleValue: { roundingMethod: 'PRESERVE_HALF_DAY', maxAccumulationCap: 50 },
    responsibleReviewer: 'Head – HR & Finance Head',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: 'Preserve fractional half-days without loss to employee. Hard cap at 50 days accumulation.',
    notes: 'Accrual at 0.58 days/month yields 6.96 days/year (~7 days).'
  },
  {
    itemKey: 'COMPOFF_QUALIFYING_HOURS',
    title: 'Comp-Off Full Day Qualifying Hours & Overtime Inclusion',
    sourceSection: 'Policy Section 8.1 & 8.2 Compensatory Off Rules',
    issueDescription: 'Policy grants 1 day for 1 qualifying extra day and 0.5 day for 4 hours. Clarification needed on whether ordinary daily overtime (without weekend/holiday) accumulates toward full Comp-Off.',
    interimRule: 'A full qualifying day is defined as a minimum of 8 continuous authorized working hours on a designated weekly off or public holiday. Ordinary daily shift overtime is granted 0.5 day Comp-Off per 4 verified pre-approved extra hours.',
    activeRuleValue: { fullDayHoursMin: 8, halfDayHoursMin: 4, requirePreAuthorization: true },
    responsibleReviewer: 'Head – HR & Production Head',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: 'Full day requires 8+ hours on holiday/weekly off. 4 hours extra work yields 0.5 day. Pre-approval mandatory in all cases.',
    notes: 'Prevents unauthorized overtime claims under Section 8.5.'
  },
  {
    itemKey: 'STATUTORY_VS_INTERNAL',
    title: 'Statutory Compliance vs Internal Leave Policy Entitlements',
    sourceSection: 'Policy Section 3 Regulatory Framework & Section 2 Scope',
    issueDescription: 'Factories Act 1948 provides 1 day EL for every 20 days worked (~15 days/yr for plant workers). BJK internal policy specifies 7 days EL + 7 days CL + 4 days SL (total 18 paid leave days).',
    interimRule: 'The internal total paid leave package (18 days paid time off) is configured as the active rule set while maintaining an audit flag for factory vs commercial office categories.',
    activeRuleValue: { totalPaidDays: 18, elDays: 7, clDays: 7, slDays: 4, auditStatutoryCompliance: true },
    responsibleReviewer: 'Legal Counsel & Head – HR',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: 'Enforce 7 EL + 7 CL + 4 SL for confirmed staff. Provide statutory audit report for factory inspectorate review.',
    notes: 'Compliant with Factories Act, 1948 and Gujarat Shops & Establishments Act.'
  },
  {
    itemKey: 'LOP_AND_SEPARATION_FORMULA',
    title: 'Loss of Pay Deduction & Separation Encashment Calculation Formula',
    sourceSection: 'Policy Section 12.2 & Section 13.3',
    issueDescription: 'Specification requires exact payroll formulas for pro-rata LOP salary deduction and separation encashment.',
    interimRule: 'LOP daily salary deduction = (Monthly Gross Salary / Calendar Days in Month) * LOP Days. Separation encashment = (Average Basic Salary of last 3 years / 30) * Unutilized EL Days (up to 50 days max).',
    activeRuleValue: {
      lopFormula: 'MonthlyGross / CalendarDaysInMonth',
      encashmentFormula: 'AverageLast3YearsBasic / 30',
      maxEncashmentAtExit: 50
    },
    responsibleReviewer: 'Head – HR & Head – Finance / Payroll',
    reviewStatus: 'INTERIM_CONFIGURED',
    approvedDecision: 'Mathematical formulas locked as standard payroll calculation parameters.',
    notes: 'Processed within 45 days of exit settlement.'
  }
];

// ==============================================================================
// 3. INITIALIZE POLICY CONFIGURATION & REPOSITORIES
// ==============================================================================
const initLeavePolicyEngine = async () => {
  try {
    // 1. Seed or Update Leave Types matching BJK-HR-POL-001
    for (const lt of BJK_POLICY_001_LEAVE_TYPES) {
      await LeaveType.findOneAndUpdate(
        { code: lt.code },
        { $set: lt },
        { upsert: true, new: true }
      );
    }

    // 2. Seed or Update Master Leave Policy (BJK-HR-POL-001)
    await LeavePolicy.findOneAndUpdate(
      { policyNumber: 'BJK-HR-POL-001' },
      {
        $setOnInsert: {
          policyNumber: 'BJK-HR-POL-001',
          title: 'BJK Healthcare Leave Policy',
          version: '1.0',
          effectiveDate: new Date('2026-04-01'),
          owner: 'Head – Human Resources',
          approvalAuthority: 'Managing Director',
          status: 'ACTIVE',
          rules: {
            earnedLeave: {
              annualEntitlementDays: 7,
              monthlyAccrualRate: 0.58,
              minConsecutiveDays: 3,
              maxNormalDurationDays: 15,
              minNoticeDays3To4: 7,
              minNoticeDays5Plus: 15,
              maxAccumulationDays: 50,
              carryForwardPercentage: 50,
              minBalanceToApply: 2
            },
            casualLeave: {
              annualEntitlementDays: 7,
              monthlyAccrualRate: 0.58,
              maxConsecutiveDays: 2,
              minNoticeHours: 24,
              carryForwardAllowed: false,
              encashmentAllowed: false
            },
            sickLeave: {
              annualEntitlementDays: 4,
              creditSchedule: 'ANNUAL_JAN_1',
              doctorCertThresholdDays: 3,
              fitnessCertThresholdDays: 4,
              emergencyNoticeHours: 2,
              carryForwardAllowed: false
            },
            compOff: {
              fullDayHoursMin: 8,
              halfDayHoursMin: 4,
              validityDays: 90,
              minNoticeDays: 3,
              requirePreApproval: true
            }
          }
        }
      },
      { upsert: true, new: true }
    );

    // 3. Seed or Update Policy Clarifications
    for (const pc of DEFAULT_POLICY_CLARIFICATIONS) {
      await PolicyClarification.findOneAndUpdate(
        { itemKey: pc.itemKey },
        { $setOnInsert: pc },
        { upsert: true, new: true }
      );
    }

    // 3. Seed Default Department Staffing Thresholds for Pharmaceutical Manufacturing
    const defaultThresholds = [
      { department: 'PRD', departmentName: 'Production & Formulations', minStaffCount: 10, minStaffPercentage: 75, criticalRoles: ['Shift In-Charge', 'Machine Operator', 'Blister Packing Tech'], maxSimultaneousLeaves: 3 },
      { department: 'QC', departmentName: 'Quality Control', minStaffCount: 7, minStaffPercentage: 70, criticalRoles: ['HPLC Analyst', 'Raw Material Tester', 'Microbiologist'], maxSimultaneousLeaves: 2 },
      { department: 'QA', departmentName: 'Quality Assurance', minStaffCount: 5, minStaffPercentage: 75, criticalRoles: ['Batch Release Officer', 'IPQA Executive', 'QMS Auditor'], maxSimultaneousLeaves: 2 },
      { department: 'WAREHOUSE', departmentName: 'Warehouse & Stores', minStaffCount: 2, minStaffPercentage: 66, criticalRoles: ['Dispensing Pharmacist', 'Cold Chain Store In-Charge'], maxSimultaneousLeaves: 1 },
      { department: 'ENGG', departmentName: 'Plant Engineering & Utilities', minStaffCount: 2, minStaffPercentage: 66, criticalRoles: ['HVAC Technician', 'Water System Tech'], maxSimultaneousLeaves: 1 },
      { department: 'QC_MICRO', departmentName: 'Microbiology Testing', minStaffCount: 2, minStaffPercentage: 75, criticalRoles: ['Sterility Tester', 'Environmental Monitoring Analyst'], maxSimultaneousLeaves: 1 }
    ];

    for (const dt of defaultThresholds) {
      await DepartmentStaffingThreshold.findOneAndUpdate(
        { department: dt.department },
        { $setOnInsert: dt },
        { upsert: true, new: true }
      );
    }

    // 4. Seed sample US FDA Inspection Blackout Period if none exist
    const existingBlackout = await LeaveBlackoutPeriod.findOne({ isActive: true });
    if (!existingBlackout) {
      await LeaveBlackoutPeriod.create({
        title: 'US FDA & WHO GMP Re-Certification Audit Blackout',
        facility: 'Chhatral Formulation Plant',
        department: 'ALL',
        startDate: new Date('2026-11-10'),
        endDate: new Date('2026-11-20'),
        startDateString: '2026-11-10',
        endDateString: '2026-11-20',
        notificationDate: new Date('2026-10-01'), // >30 days advance notice
        notificationDaysInAdvance: 40,
        reason: 'US FDA 21 CFR Part 211 & WHO GMP Scheduled Surveillance Audit. Maximum cleanroom and lab availability required.',
        declaredBy: 'Managing Director & Quality Head',
        emergencyExceptionsAllowed: true,
        isActive: true
      });
    }

    console.log('[LeavePolicyEngine] BJK-HR-POL-001 Policy Rules, Clarification Register, Staffing Thresholds & Blackout Periods verified.');
    return {
      success: true,
      leaveTypesCount: BJK_POLICY_001_LEAVE_TYPES.length,
      clarificationsCount: DEFAULT_POLICY_CLARIFICATIONS.length
    };
  } catch (err) {
    console.error('[LeavePolicyEngine] Initialization error:', err.message);
    return { success: false, error: err.message };
  }
};

// ==============================================================================
// 4. RULE ENGINE & VALIDATION SERVICE
// ==============================================================================

/**
 * Determine multi-tier approval hierarchy for a leave application based on BJK-HR-POL-001 Section 10.2
 */
const determineApprovalHierarchy = (arg1, arg2) => {
  let leaveType, duration, isHospitalized = false, isGmpStaff = false;
  if (typeof arg1 === 'object' && arg1 !== null) {
    leaveType = arg1.leaveType;
    duration = arg1.duration;
    isHospitalized = arg1.isHospitalized || false;
    isGmpStaff = arg1.isGmpStaff || false;
  } else {
    leaveType = arg1;
    duration = arg2;
  }

  const normType = String(leaveType || '').toUpperCase();
  const dur = Number(duration) || 1;

  let res;
  if (normType === 'CASUAL_LEAVE') {
    if (dur <= 2) {
      res = {
        stages: ['REPORTING_MANAGER'],
        stageNames: ['Reporting Manager Review'],
        secondaryRequired: false,
        requiresMd: false,
        requiresHr: false,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: null,
        finalApprover: 'REPORTING_MANAGER'
      };
    } else {
      res = {
        stages: ['REPORTING_MANAGER', 'HEAD_OF_DEPARTMENT'],
        stageNames: ['Reporting Manager Review', 'Head of Department Approval'],
        secondaryRequired: true,
        requiresMd: false,
        requiresHr: false,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: 'HOD',
        finalApprover: 'HOD'
      };
    }
  } else if (normType === 'EARNED_LEAVE') {
    if (dur <= 3) {
      res = {
        stages: ['REPORTING_MANAGER', 'HEAD_OF_DEPARTMENT'],
        stageNames: ['Reporting Manager Review', 'Head of Department Approval'],
        secondaryRequired: true,
        requiresMd: false,
        requiresHr: false,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: 'HOD',
        finalApprover: 'HOD'
      };
    } else if (dur <= 6) {
      res = {
        stages: ['REPORTING_MANAGER', 'HEAD_OF_DEPARTMENT', 'HEAD_HR'],
        stageNames: ['Reporting Manager Review', 'Head of Department Endorsement', 'Head – HR Final Sanction'],
        secondaryRequired: true,
        requiresMd: false,
        requiresHr: true,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: 'HOD',
        finalApprover: 'HR'
      };
    } else {
      res = {
        stages: ['REPORTING_MANAGER', 'HEAD_OF_DEPARTMENT', 'MANAGING_DIRECTOR'],
        stageNames: ['Reporting Manager Review', 'Head of Department Endorsement', 'Managing Director Sanction'],
        secondaryRequired: true,
        requiresMd: true,
        requiresHr: true,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: 'HOD',
        finalApprover: 'MANAGING_DIRECTOR'
      };
    }
  } else if (normType === 'SICK_LEAVE') {
    if (dur <= 2 && !isHospitalized) {
      res = {
        stages: ['REPORTING_MANAGER'],
        stageNames: ['Reporting Manager Review'],
        secondaryRequired: false,
        requiresMd: false,
        requiresHr: false,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: null,
        finalApprover: 'REPORTING_MANAGER'
      };
    } else {
      res = {
        stages: ['REPORTING_MANAGER', 'HEAD_HR'],
        stageNames: ['Reporting Manager Review', 'Head – HR Verification & Approval'],
        secondaryRequired: true,
        requiresMd: false,
        requiresHr: true,
        primaryApprover: 'REPORTING_MANAGER',
        secondaryApprover: 'HR',
        finalApprover: 'HR'
      };
    }
  } else if (normType === 'COMPENSATORY_OFF') {
    res = {
      stages: ['REPORTING_MANAGER', 'HEAD_HR'],
      stageNames: ['Reporting Manager Verification', 'Head – HR Credit Clearance'],
      secondaryRequired: true,
      requiresMd: false,
      requiresHr: true,
      primaryApprover: 'REPORTING_MANAGER',
      secondaryApprover: 'HR',
      finalApprover: 'HR'
    };
  } else {
    res = {
      stages: ['REPORTING_MANAGER', 'HEAD_HR'],
      stageNames: ['Reporting Manager Review', 'Head – HR Verification & Sanction'],
      secondaryRequired: true,
      requiresMd: false,
      requiresHr: true,
      primaryApprover: 'REPORTING_MANAGER',
      secondaryApprover: 'HR',
      finalApprover: 'HR'
    };
  }

  return res;
};

/**
 * Validate a leave application strictly against BJK-HR-POL-001 rules
 */
const validateLeaveApplicationRules = async ({
  employee,
  leaveType,
  leaveTypeCode,
  duration,
  totalDays,
  startDate,
  endDate,
  isHalfDay = false,
  reason = '',
  hasDocument = false,
  hasMedicalCertificate = false,
  documentType = '',
  isEmergency = false,
  isProbationary: paramIsProbationary,
  isGMPRole: paramIsGMPRole,
  availableBalance = null,
  submissionDate = null
}) => {
  const normType = String(leaveType || leaveTypeCode || '').toUpperCase();
  const dur = isHalfDay ? 0.5 : Number(duration || totalDays || 1);
  const now = submissionDate ? new Date(submissionDate) : new Date();
  const sDate = startDate ? new Date(startDate) : null;
  const eDate = endDate ? new Date(endDate) : (sDate ? new Date(sDate) : null);
  const docAttached = Boolean(hasDocument || hasMedicalCertificate);

  const errors = [];
  const warnings = [];
  let requiresFitnessCert = false;
  let requiresRefresherTraining = false;
  let requiresMdApproval = false;

  // Calculate advance notice in calendar days
  let advanceNoticeDays = 999;
  if (sDate && !isNaN(sDate.getTime())) {
    advanceNoticeDays = Math.ceil((sDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const isConfirmed = typeof paramIsProbationary === 'boolean'
    ? !paramIsProbationary
    : (employee?.employmentStatus === 'CONFIRMED' || employee?.status === 'CONFIRMED' || !employee?.isProbationary);

  const isProbationary = typeof paramIsProbationary === 'boolean'
    ? paramIsProbationary
    : (employee?.isProbationary || employee?.employmentStatus === 'PROBATION');

  const dept = (employee?.department || employee?.departmentName || '').toUpperCase();
  const isGmpDept = typeof paramIsGMPRole === 'boolean'
    ? paramIsGMPRole
    : ['PRD', 'PRODUCTION', 'QC', 'QUALITY_CONTROL', 'QA', 'QUALITY_ASSURANCE', 'WAREHOUSE', 'ENGG', 'ENGINEERING'].some(d => dept.includes(d));

  // Minimum balance check for EL
  if (availableBalance !== null && normType === 'EARNED_LEAVE') {
    if (availableBalance < 2) {
      errors.push('BJK-HR-POL-001 Section 5.2: An employee must have a minimum balance of 2 days of accrued EL balance to apply for Earned Leave.');
    }
  }

  // 1. EARNED LEAVE (EL) RULES
  if (normType === 'EARNED_LEAVE') {
    if (isProbationary) {
      errors.push('BJK-HR-POL-001 Section 5.1: Probationary employees accrue Earned Leave but may only avail it after formal confirmation of employment or 1 year of service.');
    }

    if (dur < 3 && !isEmergency) {
      errors.push(`BJK-HR-POL-001 Section 5.4: Earned Leave must be applied for a minimum of 3 consecutive working days. Requested: ${dur} day(s).`);
    }

    if (dur > 15) {
      requiresMdApproval = true;
      warnings.push('BJK-HR-POL-001 Section 5.4: Normal maximum continuous Earned Leave is 15 working days. Leaves exceeding 15 days require explicit Managing Director approval.');
    }

    if (!isEmergency) {
      if (dur >= 5 && advanceNoticeDays < 15) {
        errors.push(`BJK-HR-POL-001 Section 5.5: Earned Leave of 5 or more days requires at least 15 days advance notice (Requested: ${advanceNoticeDays} days in advance).`);
      } else if (dur >= 3 && dur < 5 && advanceNoticeDays < 7) {
        errors.push(`BJK-HR-POL-001 Section 5.5: Earned Leave of 3-4 days requires at least 7 days advance notice (Requested: ${advanceNoticeDays} days in advance).`);
      }
    } else {
      warnings.push('Emergency Earned Leave exception requested. Supporting documentation and Head – HR approval mandatory (Policy Section 5.7).');
    }
  }

  // 2. CASUAL LEAVE (CL) RULES
  if (normType === 'CASUAL_LEAVE') {
    if (isProbationary) {
      errors.push('BJK-HR-POL-001 Section 6.1: Probationary employees are not entitled to Casual Leave during their probation period.');
    }

    if (dur > 2) {
      errors.push('BJK-HR-POL-001 Section 6.3: Casual Leave can be availed for a maximum of 2 consecutive days at a time. For absences longer than 2 days, apply for Earned Leave or Sick Leave.');
    }

    if (!isEmergency && advanceNoticeDays < 1) {
      warnings.push('BJK-HR-POL-001 Section 6.4: Casual Leave should ideally be applied 24 hours in advance.');
    }
  }

  // 3. SICK LEAVE (SL) RULES
  if (normType === 'SICK_LEAVE') {
    if (dur >= 3 && !docAttached) {
      errors.push('BJK-HR-POL-001 Section 7.3: Sick Leave for 3 or more days requires an attached Medical certificate from a registered medical practitioner (MBBS or above).');
    }

    if (dur >= 4 && isGmpDept) {
      requiresFitnessCert = true;
      warnings.push('WHO GMP & Schedule M MANDATE (Section 7.7): Employees in GMP manufacturing or QC areas returning from Sick Leave of 4 or more days MUST submit a Fitness to Resume Duties Certificate before resuming work.');
    }
  }

  // 4. COMPENSATORY OFF (COMP-OFF) RULES
  if (normType === 'COMPENSATORY_OFF') {
    if (advanceNoticeDays < 3 && !isEmergency) {
      warnings.push('BJK-HR-POL-001 Section 8.3: Minimum advance notice of 3 working days is recommended when availing Comp-Off.');
    }
  }

  // 5. MARRIAGE LEAVE RULES
  if (normType === 'MARRIAGE_LEAVE') {
    if (dur > 5) {
      errors.push('BJK-HR-POL-001 Section 9.2: Marriage Leave is strictly 5 paid days.');
    }
    if (advanceNoticeDays < 30 && !isEmergency) {
      warnings.push('BJK-HR-POL-001 Section 9.2: Marriage Leave must be applied at least 30 days in advance with marriage invitation/certificate.');
    }
  }

  // 6. SPECIAL LEAVE (BIRTHDAY / ANNIVERSARY)
  if (normType === 'SPECIAL_LEAVE') {
    if (dur > 1) {
      errors.push('BJK-HR-POL-001 Section 9.3: Special Leave is limited to 1 paid day for employee own birthday or marriage anniversary.');
    }
    if (advanceNoticeDays < 15 && !isEmergency) {
      warnings.push('BJK-HR-POL-001 Section 9.3: Special Leave must be applied at least 15 days in advance (Policy Section 9.3).');
    }
  }

  // 7. BEREAVEMENT LEAVE
  if (normType === 'BEREAVEMENT_LEAVE') {
    if (dur > 2) {
      warnings.push('Bereavement Leave is 2 days for immediate family and 1 day for extended family (Policy Section 9.1).');
    }
  }

  // 8. EXTENDED LEAVE GMP REFRESHER TRAINING TRIGGER (Section 14.3)
  if (dur >= 30 && isGmpDept) {
    requiresRefresherTraining = true;
    warnings.push('GMP RE-QUALIFICATION REQUIREMENT: Leaves of 30 days or more require GMP refresher training before resuming duties in manufacturing/quality areas (Policy Section 14.3 & 21 CFR 211.25).');
  }

  // 9. CHECK BLACKOUT PERIOD CONFLICTS (Section 14.2)
  if (sDate && eDate && !isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
    const blackoutConflicts = await LeaveBlackoutPeriod.find({
      isActive: true,
      $or: [
        { department: 'ALL' },
        { department: dept }
      ],
      startDate: { $lte: eDate },
      endDate: { $gte: sDate }
    });

    if (blackoutConflicts.length > 0) {
      const isExempt = ['SICK_LEAVE'].includes(normType) || isEmergency;
      blackoutConflicts.forEach(blk => {
        if (isExempt) {
          warnings.push(`Blackout Notice: Period falls within [${blk.title}], but emergency / sick leave exception is permitted.`);
        } else {
          errors.push(`Leave restricted: Dates fall within official Blackout Period [${blk.title}] (${blk.startDateString} to ${blk.endDateString}). Reason: ${blk.reason} (Policy Section 14.2).`);
        }
      });
    }

    // 10. CHECK DEPARTMENT MINIMUM STAFFING THRESHOLD (Section 14.1)
    if (dept) {
      const thresholdDoc = await DepartmentStaffingThreshold.findOne({
        $or: [{ department: dept }, { department: 'ALL' }],
        isActive: true
      });

      if (thresholdDoc) {
        const overlappingCount = await LeaveRequest.countDocuments({
          department: dept,
          currentStatus: { $in: ['APPROVED', 'TEAM_MANAGER_APPROVED', 'DEPARTMENT_MANAGER_APPROVED', 'HR_REVIEW'] },
          startDate: { $lte: eDate },
          endDate: { $gte: sDate }
        });

        if (overlappingCount >= thresholdDoc.maxSimultaneousLeaves) {
          warnings.push(`Staffing Warning: ${overlappingCount} other employee(s) in department [${dept}] are scheduled on leave during these dates (Department threshold cap: ${thresholdDoc.maxSimultaneousLeaves}). Escalation required.`);
        }
      }
    }
  }

  const approvalWorkflow = determineApprovalHierarchy({
    leaveType: normType,
    duration: dur,
    isHospitalized: documentType === 'HOSPITAL_DISCHARGE_SUMMARY',
    isGmpStaff: isGmpDept
  });

  return {
    valid: errors.length === 0,
    isValid: errors.length === 0,
    errors,
    violations: errors,
    warnings,
    approvalWorkflow,
    requiresFitnessCertificate: requiresFitnessCert,
    requiresFitnessCert,
    requiresRefresherTraining,
    requiresMDApproval: requiresMdApproval,
    requiresMdApproval
  };
};

// ==============================================================================
// 5. COMP-OFF CREDIT & DEDUCTION MANAGEMENT
// ==============================================================================

/**
 * Deduct Comp-Off days FIFO from active unexpired credits
 */
const deductCompOffCredits = async (employeeCode, daysToDeduct, leaveRequest) => {
  const code = String(employeeCode).toUpperCase();
  const now = new Date();

  // Find all active unexpired credits sorted by expiryDate ascending (FIFO)
  const credits = await CompOffCredit.find({
    employeeCode: code,
    status: { $in: ['ACTIVE', 'PARTIALLY_USED'] },
    expiryDate: { $gte: now },
    remainingDays: { $gt: 0 }
  }).sort({ expiryDate: 1 });

  let needed = Number(daysToDeduct);
  let totalDeducted = 0;

  for (const cred of credits) {
    if (needed <= 0) break;

    const available = cred.remainingDays;
    const deductThis = Math.min(needed, available);

    cred.usedDays += deductThis;
    cred.remainingDays -= deductThis;
    if (cred.remainingDays <= 0) {
      cred.status = 'CONSUMED';
    } else {
      cred.status = 'PARTIALLY_USED';
    }

    cred.usageHistory.push({
      leaveRequestId: leaveRequest?._id || null,
      leaveRequestCode: leaveRequest?.requestId || '',
      daysDeducted: deductThis,
      deductedAt: now
    });

    await cred.save();
    needed -= deductThis;
    totalDeducted += deductThis;
  }

  if (needed > 0) {
    throw new Error(`Insufficient active Comp-Off credits. Shortfall: ${needed} day(s). Available unexpired: ${totalDeducted} day(s).`);
  }

  return { success: true, deductedDays: totalDeducted };
};

// ==============================================================================
// 6. YEAR-END RECONCILIATION & AUTO-LAPSE ENGINE
// Policy Ref: BJK-HR-POL-001 Section 5.3, 6.5, 7.6, 8.4, 11.2, 11.3
// ==============================================================================

/**
 * Preview or execute year-end leave balance reconciliation
 */
const reconcileYearEndBalances = async ({ year = 2026, execute = false, actor = null }) => {
  const balances = await LeaveBalance.find({ leaveYear: year });
  const reconciliationSummary = {
    year,
    isExecuted: execute,
    processedEmployees: balances.length,
    clLapsedTotal: 0,
    slLapsedTotal: 0,
    elCarriedForwardTotal: 0,
    elForfeitedTotal: 0,
    compOffExpiredTotal: 0,
    employeesReconciled: []
  };

  const now = new Date();

  // Also check Comp-Off credits expiring
  const expiredCredits = await CompOffCredit.find({
    status: { $in: ['ACTIVE', 'PARTIALLY_USED'] },
    expiryDate: { $lt: now }
  });

  reconciliationSummary.compOffExpiredTotal = expiredCredits.reduce((s, c) => s + c.remainingDays, 0);

  if (execute) {
    for (const ec of expiredCredits) {
      ec.status = 'EXPIRED';
      ec.remainingDays = 0;
      await ec.save();
    }
  }

  for (const bDoc of balances) {
    const empSummary = {
      employeeId: bDoc.employeeId,
      employeeName: bDoc.employeeName,
      department: bDoc.department,
      clBefore: 0,
      clLapsed: 0,
      slBefore: 0,
      slLapsed: 0,
      elBefore: 0,
      elCarriedForward: 0,
      elForfeited: 0,
      elNewClosing: 0
    };

    let modified = false;

    // 1. Casual Leave: lapses completely on Dec 31
    const clItem = bDoc.balances.find(b => b.leaveType === 'CASUAL_LEAVE');
    if (clItem && clItem.available > 0) {
      empSummary.clBefore = clItem.available;
      empSummary.clLapsed = clItem.available;
      reconciliationSummary.clLapsedTotal += clItem.available;

      if (execute) {
        clItem.adjusted -= clItem.available;
        clItem.available = 0;
        modified = true;
      }
    }

    // 2. Sick Leave: lapses completely on Dec 31
    const slItem = bDoc.balances.find(b => b.leaveType === 'SICK_LEAVE');
    if (slItem && slItem.available > 0) {
      empSummary.slBefore = slItem.available;
      empSummary.slLapsed = slItem.available;
      reconciliationSummary.slLapsedTotal += slItem.available;

      if (execute) {
        slItem.adjusted -= slItem.available;
        slItem.available = 0;
        modified = true;
      }
    }

    // 3. Earned Leave: 50% carried forward, max accumulate 50 days
    const elItem = bDoc.balances.find(b => b.leaveType === 'EARNED_LEAVE');
    if (elItem) {
      const avail = elItem.available;
      empSummary.elBefore = avail;

      // 50% rule rounded to nearest 0.5
      const fiftyPercent = Math.round((avail * 0.5) * 2) / 2;
      const carried = Math.min(50, fiftyPercent);
      const forfeited = avail - carried;

      empSummary.elCarriedForward = carried;
      empSummary.elForfeited = Math.max(0, forfeited);
      empSummary.elNewClosing = carried;

      reconciliationSummary.elCarriedForwardTotal += carried;
      reconciliationSummary.elForfeitedTotal += Math.max(0, forfeited);

      if (execute) {
        elItem.carriedForward = carried;
        elItem.available = carried;
        modified = true;
      }
    }

    if (execute && modified) {
      bDoc.history.push({
        leaveType: 'YEAR_END_RECONCILIATION',
        previousAvailable: empSummary.elBefore,
        adjustedBy: 0,
        newAvailable: empSummary.elNewClosing,
        reason: `Automated Year-End ${year} reconciliation: CL/SL lapsed, 50% EL carry-forward capped at 50 days.`,
        actor: {
          name: actor?.name || 'HR Year-End Engine',
          email: actor?.email || 'hr@bjkhealthcare.com',
          role: 'HR_ADMIN'
        },
        timestamp: new Date()
      });

      await bDoc.save();
    }

    reconciliationSummary.employeesReconciled.push(empSummary);
  }

  return reconciliationSummary;
};

// ==============================================================================
// 7. STATUTORY PAYROLL LOSS OF PAY (LOP) CALCULATOR
const calculateLOPDeduction = (arg1, arg2, arg3, arg4) => {
  let gross, daysInMonth, days;
  if (typeof arg1 === 'object' && arg1 !== null) {
    gross = Number(arg1.monthlyGrossSalary) || 0;
    daysInMonth = Number(arg1.calendarDaysInMonth) || 30;
    days = Number(arg1.lopDays) || 0;
  } else {
    gross = Number(arg1) || 0;
    days = Number(arg2) || 0;
    if (arg3 && arg4) {
      daysInMonth = new Date(arg4, arg3, 0).getDate();
    } else {
      daysInMonth = Number(arg3) || 30;
    }
  }

  if (gross <= 0 || days <= 0) {
    return { perDayRate: 0, totalDeduction: 0, deductionAmount: 0, lopDays: days };
  }

  const perDayRate = Math.round((gross / daysInMonth) * 100) / 100;
  const totalDeduction = Math.round((perDayRate * days) * 100) / 100;

  return {
    monthlyGrossSalary: gross,
    calendarDaysInMonth: daysInMonth,
    lopDays: days,
    perDayRate,
    totalDeduction,
    deductionAmount: totalDeduction,
    formula: `(${gross} / ${daysInMonth}) × ${days} = ₹${totalDeduction}`
  };
};

module.exports = {
  BJK_POLICY_001_LEAVE_TYPES,
  DEFAULT_POLICY_CLARIFICATIONS,
  initLeavePolicyEngine,
  determineApprovalHierarchy,
  validateLeaveApplicationRules,
  deductCompOffCredits,
  reconcileYearEndBalances,
  calculateLOPDeduction
};
