const mongoose = require('mongoose');
const {
  LeaveType,
  LeavePolicy,
  HolidayCalendar,
  LeaveBalance,
  LeaveRequest,
  LeaveActivity
} = require('../../models/hrms/Leave');
const Employee = require('../../models/hrms/Employee');
const User = require('../../models/User');
const AuditLog = require('../../models/AuditLog');

// Default initial leave types strictly compliant with BJK-HR-POL-001
const INITIAL_LEAVE_TYPES = [
  {
    code: 'CASUAL_LEAVE',
    name: 'Casual Leave (CL)',
    description: 'Short-term unplanned absences. Max continuous 2 days. Lapses on Dec 31.',
    annualQuotaDays: 7,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 0,
    maxConsecutiveDays: 2,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'SICK_LEAVE',
    name: 'Sick Leave (SL)',
    description: 'Credited upfront Jan 1. Medical certificate mandatory for 3+ days. GMP area fitness certificate required after 4+ days.',
    annualQuotaDays: 4,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 0,
    maxConsecutiveDays: 15,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'EARNED_LEAVE',
    name: 'Earned Leave (EL)',
    description: 'Accrual 0.58 days/month (7 days/year). Min block 3 days, max continuous 15 days, max accumulation 50 days. Encashment max 10 days in Dec.',
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
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'COMPENSATORY_OFF',
    name: 'Compensatory Off (Comp-Off)',
    description: 'Earned 1:1 for working on weekly off / holiday. Must be used within 90 days. Non-encashable.',
    annualQuotaDays: 0,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 1,
    maxConsecutiveDays: 3,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'MATERNITY_LEAVE',
    name: 'Maternity Leave',
    description: '26 weeks (182 days) paid for 1st & 2nd child; 12 weeks for 3rd+. Minimum 80 days eligibility in past 12 months.',
    annualQuotaDays: 182,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 15,
    maxConsecutiveDays: 182,
    allowHalfDay: false,
    applicableGender: 'FEMALE',
    countWeekends: true,
    countHolidays: true,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'PATERNITY_LEAVE',
    name: 'Paternity Leave',
    description: '15 consecutive calendar days fully paid, usable within 60 days of birth/adoption in max 2 tranches. Max 2 children.',
    annualQuotaDays: 15,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 7,
    maxConsecutiveDays: 15,
    allowHalfDay: false,
    applicableGender: 'MALE',
    countWeekends: true,
    countHolidays: true,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'BEREAVEMENT_LEAVE',
    name: 'Bereavement Leave',
    description: '2 days paid for immediate family; 1 day paid for extended family.',
    annualQuotaDays: 2,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 0,
    maxConsecutiveDays: 2,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'MARRIAGE_LEAVE',
    name: 'Marriage Leave',
    description: '5 days paid leave for employee wedding (once during company tenure).',
    annualQuotaDays: 5,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 15,
    maxConsecutiveDays: 5,
    allowHalfDay: false,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {

    code: 'UNPAID_LEAVE',
    name: 'Leave Without Pay (LWP)',
    description: 'Unpaid absence granted under exceptional circumstances with management sanction.',
    annualQuotaDays: 0,
    isPaid: false,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 1,
    maxConsecutiveDays: 60,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'SPECIAL_LEAVE',
    name: 'Special / Bereavement Leave',
    description: 'Compassionate leave for immediate family bereavement or emergency calamity.',
    annualQuotaDays: 5,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: false,
    minNoticeDays: 0,
    maxConsecutiveDays: 5,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  },
  {
    code: 'OTHER',
    name: 'Other Authorized Absence',
    description: 'Special authorized leaves including jury duty, official delegations, or seminars.',
    annualQuotaDays: 3,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    requiresDocumentProof: true,
    minNoticeDays: 2,
    maxConsecutiveDays: 5,
    allowHalfDay: true,
    applicableGender: 'ALL',
    countWeekends: false,
    countHolidays: false,
    approvalWorkflow: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'],
    isActive: true
  }
];

// Initial 2026 Holiday Calendar for BJK Healthcare
const INITIAL_HOLIDAYS_2026 = [
  { year: 2026, name: 'Republic Day', dateString: '2026-01-26', type: 'NATIONAL_HOLIDAY', description: 'National Holiday' },
  { year: 2026, name: 'Maha Shivratri', dateString: '2026-02-15', type: 'FESTIVAL', description: 'Maha Shivratri Celebration' },
  { year: 2026, name: 'Holi (Dhuleti)', dateString: '2026-03-04', type: 'FESTIVAL', description: 'Festival of Colors' },
  { year: 2026, name: 'Good Friday', dateString: '2026-04-03', type: 'MANDATORY', description: 'Good Friday Observance' },
  { year: 2026, name: 'Dr. B.R. Ambedkar Jayanti', dateString: '2026-04-14', type: 'MANDATORY', description: 'Ambedkar Jayanti' },
  { year: 2026, name: 'Independence Day', dateString: '2026-08-15', type: 'NATIONAL_HOLIDAY', description: 'Indian Independence Day' },
  { year: 2026, name: 'Janmashtami', dateString: '2026-09-04', type: 'FESTIVAL', description: 'Shree Krishna Janmashtami' },
  { year: 2026, name: 'Mahatma Gandhi Jayanti', dateString: '2026-10-02', type: 'NATIONAL_HOLIDAY', description: 'Gandhi Jayanti' },
  { year: 2026, name: 'Dussehra (Vijaya Dashami)', dateString: '2026-10-20', type: 'FESTIVAL', description: 'Vijaya Dashami' },
  { year: 2026, name: 'Diwali (Deepavali)', dateString: '2026-11-08', type: 'FESTIVAL', description: 'Deepavali Festival' },
  { year: 2026, name: 'Vikram Samvat New Year', dateString: '2026-11-09', type: 'FESTIVAL', description: 'Gujarati New Year' },
  { year: 2026, name: 'Christmas Day', dateString: '2026-12-25', type: 'MANDATORY', description: 'Christmas Day' }
];

/**
 * Initialize Leave Master: Types, Holiday Calendar, and Policies
 */
const initLeaveMaster = async () => {
  try {
    // 1. Seed or update Leave Types
    for (const lt of INITIAL_LEAVE_TYPES) {
      await LeaveType.findOneAndUpdate(
        { code: lt.code },
        { $setOnInsert: lt },
        { upsert: true, new: true }
      );
    }

    // 2. Seed Holiday Calendar
    for (const h of INITIAL_HOLIDAYS_2026) {
      await HolidayCalendar.findOneAndUpdate(
        { dateString: h.dateString, name: h.name },
        { 
          $setOnInsert: {
            ...h,
            date: new Date(h.dateString),
            isActive: true
          }
        },
        { upsert: true, new: true }
      );
    }

    // 3. Seed Default Leave Policy
    const defaultPolicy = await LeavePolicy.findOne({ policyName: 'BJK Enterprise Standard Leave Policy 2026' });
    if (!defaultPolicy) {
      await LeavePolicy.create({
        policyName: 'BJK Enterprise Standard Leave Policy 2026',
        department: 'ALL',
        leaveYear: 2026,
        carryForwardMax: 15,
        encashmentAllowed: true,
        probationLeaveAllowed: true,
        weekendExclusion: true,
        holidayExclusion: true,
        workflowStages: [
          { stage: 1, name: 'Team Lead / Manager Review', role: 'TEAM_LEAD' },
          { stage: 2, name: 'Department Head Approval', role: 'DEPARTMENT_MANAGER' },
          { stage: 3, name: 'HR Monitoring & Compliance', role: 'HR_MANAGER' }
        ],
        isActive: true
      });
    }

    console.log('[LeaveEngine] Master Leave Types, Holidays, and Enterprise Policies verified.');
  } catch (err) {
    console.error('[LeaveEngine] Master initialization error:', err.message);
  }
};

/**
 * Calculate leave duration taking into account weekends and configured holidays
 */
const calculateLeaveDuration = async ({ startDate, endDate, leaveTypeCode, isHalfDay = false }) => {
  if (isHalfDay) return 0.5;

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);

  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
    throw new Error('Invalid start or end date format');
  }

  if (sDate > eDate) {
    throw new Error('Start date cannot be after end date');
  }

  const leaveType = await LeaveType.findOne({ code: leaveTypeCode.toUpperCase() });
  const countWeekends = leaveType ? leaveType.countWeekends : false;
  const countHolidays = leaveType ? leaveType.countHolidays : false;

  // Retrieve holidays within range
  const sStr = sDate.toISOString().split('T')[0];
  const eStr = eDate.toISOString().split('T')[0];
  const holidays = await HolidayCalendar.find({
    dateString: { $gte: sStr, $lte: eStr },
    isActive: true
  });
  const holidayDateStrings = new Set(holidays.map(h => h.dateString));

  let workingDays = 0;
  let cur = new Date(sDate);

  while (cur <= eDate) {
    const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
    const curStr = cur.toISOString().split('T')[0];

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayDateStrings.has(curStr);

    let countDay = true;
    if (isWeekend && !countWeekends) {
      countDay = false;
    }
    if (isHoliday && !countHolidays) {
      countDay = false;
    }

    if (countDay) {
      workingDays += 1;
    }

    cur.setDate(cur.getDate() + 1);
  }

  return Math.max(1, workingDays);
};

/**
 * Get or automatically initialize an employee's Leave Balance record
 */
const getOrInitLeaveBalance = async (employeeId, year = 2026) => {
  let employee = null;
  if (employeeId) {
    if (mongoose.isValidObjectId(employeeId)) {
      employee = await Employee.findById(employeeId);
    }
    if (!employee) {
      employee = await Employee.findOne({ employeeId: String(employeeId).trim().toUpperCase() });
    }
  }

  // Graceful fallback to first active employee in database if unassigned or admin
  if (!employee) {
    employee = await Employee.findOne({ status: 'ACTIVE' }) || await Employee.findOne();
  }

  if (!employee) {
    // If database has 0 employees, return a safe in-memory structure
    return {
      employee: { employeeId: 'BJK-EMP-001', fullName: 'Default User', departmentName: 'Operations' },
      balanceDoc: {
        leaveYear: year,
        balances: INITIAL_LEAVE_TYPES.map(lt => ({
          leaveType: lt.code,
          leaveTypeName: lt.name,
          openingBalance: lt.annualQuotaDays,
          allocated: lt.annualQuotaDays,
          carriedForward: 0,
          adjusted: 0,
          used: 0,
          pending: 0,
          available: lt.annualQuotaDays,
          lastUpdated: new Date()
        })),
        history: []
      }
    };
  }

  let balanceDoc = await LeaveBalance.findOne({
    employee: employee._id,
    leaveYear: year
  });

  if (!balanceDoc) {
    const leaveTypes = await LeaveType.find({ isActive: true });
    const sourceTypes = leaveTypes.length >= 10 ? leaveTypes : INITIAL_LEAVE_TYPES;
    const balances = sourceTypes.map(lt => {
      const quota = lt.annualQuotaDays || 0;
      return {
        leaveType: lt.code,
        leaveTypeName: lt.name,
        openingBalance: quota,
        allocated: quota,
        carriedForward: 0,
        adjusted: 0,
        used: 0,
        pending: 0,
        available: quota,
        lastUpdated: new Date()
      };
    });

    balanceDoc = await LeaveBalance.create({
      employee: employee._id,
      user: employee.user || null,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      leaveYear: year,
      year,
      balances,
      history: []
    });
  } else {
    // Ensure all 11 official leave types are present in existing balances
    let modified = false;
    const normalizeCode = (c) => (c === 'COMP_OFF' || c === 'COMPENSATORY_OFF' ? 'COMP_OFF' : c);
    const existingCodes = new Set((balanceDoc.balances || []).map(b => normalizeCode(b.leaveType)));
    
    // Clean up duplicate comp off if already saved
    if (balanceDoc.balances.some(b => b.leaveType === 'COMP_OFF') && balanceDoc.balances.some(b => b.leaveType === 'COMPENSATORY_OFF')) {
      balanceDoc.balances = balanceDoc.balances.filter(b => b.leaveType !== 'COMPENSATORY_OFF');
      modified = true;
    }

    for (const lt of INITIAL_LEAVE_TYPES) {
      const normLt = normalizeCode(lt.code);
      if (!existingCodes.has(normLt)) {
        balanceDoc.balances.push({
          leaveType: lt.code,
          leaveTypeName: lt.name,
          openingBalance: lt.annualQuotaDays || 0,
          allocated: lt.annualQuotaDays || 0,
          carriedForward: 0,
          adjusted: 0,
          used: 0,
          pending: 0,
          available: lt.annualQuotaDays || 0,
          lastUpdated: new Date()
        });
        existingCodes.add(normLt);
        modified = true;
      }
    }
    if (modified) {
      await balanceDoc.save().catch(() => {});
    }
  }

  return { employee, balanceDoc };
};

/**
 * Record a Leave Activity entry & write to AuditLog
 */
const logLeaveActivity = async ({
  req,
  leaveRequest,
  employee,
  actor,
  action,
  previousStatus,
  newStatus,
  comment = '',
  details = ''
}) => {
  try {
    const ipAddress = req?.ip || req?.headers['x-forwarded-for'] || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || 'BJK-LeaveEngine/2.0';

    await LeaveActivity.create({
      requestId: leaveRequest.requestId,
      leaveRequest: leaveRequest._id,
      employee: {
        id: employee?._id || leaveRequest.employee,
        employeeId: employee?.employeeId || leaveRequest.employeeId,
        name: employee?.fullName || leaveRequest.employeeName,
        department: employee?.departmentName || leaveRequest.department
      },
      actor: {
        id: actor?._id || actor?.id || null,
        name: actor?.name || 'System Operator',
        email: actor?.email || 'operator@bjkhealthcare.com',
        role: actor?.role || 'SYSTEM'
      },
      action,
      previousStatus: previousStatus || leaveRequest.currentStatus,
      newStatus: newStatus || leaveRequest.currentStatus,
      comment,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });

    await AuditLog.logAction({
      user: actor,
      action: `LEAVE_${action}`,
      module: 'HRMS_LEAVE',
      resource: 'LeaveRequest',
      resourceId: leaveRequest.requestId || leaveRequest._id,
      oldData: { status: previousStatus },
      newData: { status: newStatus, comment },
      ipAddress,
      userAgent,
      status: 'SUCCESS',
      details: details || `Leave [${leaveRequest.requestId}] transitioned from ${previousStatus} to ${newStatus} by ${actor?.name || 'System'}: ${comment}`
    });
  } catch (err) {
    console.error('[LeaveEngine] Failed to write leave activity/audit log:', err.message);
  }
};

module.exports = {
  INITIAL_LEAVE_TYPES,
  INITIAL_HOLIDAYS_2026,
  initLeaveMaster,
  calculateLeaveDuration,
  getOrInitLeaveBalance,
  logLeaveActivity
};
