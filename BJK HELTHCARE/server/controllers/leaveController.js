const mongoose = require('mongoose');
const {
  LeaveType,
  LeavePolicy,
  HolidayCalendar,
  LeaveBalance,
  LeaveRequest,
  LeaveActivity
} = require('../models/hrms/Leave');
const Employee = require('../models/hrms/Employee');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const {
  calculateLeaveDuration,
  getOrInitLeaveBalance,
  logLeaveActivity
} = require('../services/hrms/leaveService');
const { getScopeQuery, resolveDataScope } = require('../services/hrms/dataScopeService');

// ==============================================================================
// 1. LEAVE TYPES & MASTER POLICY CONTROLLERS
// ==============================================================================

// GET /api/leave/types
const getLeaveTypes = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const types = await LeaveType.find(filter).sort({ name: 1 });
    res.json({ success: true, count: types.length, types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/types (HR Admin)
const createLeaveType = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      annualQuotaDays,
      isPaid,
      carryForwardAllowed,
      maxCarryForwardDays,
      requiresDocumentProof,
      minNoticeDays,
      maxConsecutiveDays,
      allowHalfDay,
      applicableGender,
      countWeekends,
      countHolidays
    } = req.body;

    const existing = await LeaveType.findOne({ code: String(code).toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Leave type code [${code}] already exists.` });
    }

    const leaveType = await LeaveType.create({
      name,
      code: String(code).toUpperCase().trim(),
      description,
      annualQuotaDays: Number(annualQuotaDays) || 0,
      isPaid: isPaid !== false,
      carryForwardAllowed: !!carryForwardAllowed,
      maxCarryForwardDays: Number(maxCarryForwardDays) || 0,
      requiresDocumentProof: !!requiresDocumentProof,
      minNoticeDays: Number(minNoticeDays) || 0,
      maxConsecutiveDays: Number(maxConsecutiveDays) || 30,
      allowHalfDay: allowHalfDay !== false,
      applicableGender: applicableGender || 'ALL',
      countWeekends: !!countWeekends,
      countHolidays: !!countHolidays,
      isActive: true
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'CREATE_LEAVE_TYPE',
      module: 'HRMS_LEAVE',
      resource: 'LeaveType',
      resourceId: leaveType.code,
      newData: leaveType.toObject(),
      details: `Created leave type [${leaveType.name} - ${leaveType.code}]`
    });

    res.status(201).json({ success: true, message: 'Leave type created successfully', leaveType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/types/:id (HR Admin)
const updateLeaveType = async (req, res) => {
  try {
    const leaveType = await LeaveType.findById(req.params.id);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Leave type not found' });
    }

    const before = leaveType.toObject();
    Object.assign(leaveType, req.body);
    await leaveType.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'UPDATE_LEAVE_TYPE',
      module: 'HRMS_LEAVE',
      resource: 'LeaveType',
      resourceId: leaveType.code,
      oldData: before,
      newData: leaveType.toObject(),
      details: `Updated leave type configuration for [${leaveType.name}]`
    });

    res.json({ success: true, message: 'Leave type updated successfully', leaveType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/policies
const getLeavePolicies = async (req, res) => {
  try {
    const policies = await LeavePolicy.find({ isActive: true });
    res.json({ success: true, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/policies
const createOrUpdateLeavePolicy = async (req, res) => {
  try {
    const { policyName, department, leaveYear, carryForwardMax, rules } = req.body;
    const policy = await LeavePolicy.findOneAndUpdate(
      { policyName, department: department || 'ALL', leaveYear: leaveYear || 2026 },
      { $set: req.body },
      { upsert: true, new: true }
    );

    await AuditLog.logAction({
      user: req.user,
      action: 'SAVE_LEAVE_POLICY',
      module: 'HRMS_LEAVE',
      resource: 'LeavePolicy',
      resourceId: policy._id,
      newData: policy.toObject(),
      details: `Saved leave policy [${policyName}] for department [${department || 'ALL'}]`
    });

    res.json({ success: true, message: 'Leave policy saved successfully', policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/holidays
const getHolidays = async (req, res) => {
  try {
    const { year = 2026 } = req.query;
    const holidays = await HolidayCalendar.find({ year: Number(year), isActive: true }).sort({ date: 1 });
    res.json({ success: true, count: holidays.length, holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/holidays
const createHoliday = async (req, res) => {
  try {
    const { name, dateString, type, description, facility, year = 2026 } = req.body;
    const holiday = await HolidayCalendar.create({
      name,
      date: new Date(dateString),
      dateString,
      type: type || 'MANDATORY',
      description,
      facility: facility || 'ALL',
      year: Number(year) || 2026,
      isActive: true
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'CREATE_HOLIDAY',
      module: 'HRMS_LEAVE',
      resource: 'HolidayCalendar',
      resourceId: holiday._id,
      newData: holiday.toObject(),
      details: `Created holiday [${name}] on ${dateString}`
    });

    res.status(201).json({ success: true, holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 2. LEAVE BALANCES & HR ADJUSTMENT CONTROLLERS
// ==============================================================================

// GET /api/leave/balances or GET /api/leave/balances/:employeeId
const getLeaveBalances = async (req, res) => {
  try {
    const targetEmployeeId = req.params.employeeId || req.query.employeeId || req.user.employeeId;
    const userRole = req.user.role;
    const isSelf = targetEmployeeId === req.user.employeeId;
    const isHR = ['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'SUPER_ADMIN', 'DIRECTOR'].includes(userRole);

    if (!isSelf && !isHR) {
      // Check if user is manager of this employee
      const employee = await Employee.findOne({ employeeId: targetEmployeeId });
      const isManager = Boolean(
        employee && (
          (employee.reportingManager && employee.reportingManager.toString() === (req.user._id || req.user.id || '').toString()) ||
          (employee.managerName && employee.managerName === req.user.name) ||
          (req.user.role === 'QA_MANAGER' && (employee.departmentName || '').toLowerCase().includes('quality'))
        )
      );
      if (!isManager) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view other employee balances.' });
      }
    }

    const { employee, balanceDoc } = await getOrInitLeaveBalance(targetEmployeeId, 2026);
    res.json({
      success: true,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      department: employee.departmentName,
      leaveYear: balanceDoc.leaveYear,
      balances: balanceDoc.balances,
      history: balanceDoc.history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/all-balances (HR Command Center)
const getAllLeaveBalances = async (req, res) => {
  try {
    const { department, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (department && department !== 'ALL') query.department = department;
    if (search) {
      query.$or = [
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await LeaveBalance.countDocuments(query);
    const balances = await LeaveBalance.find(query)
      .sort({ employeeName: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: balances.length, total, balances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hr/leave/balances/:employeeId/adjust (Strict HR Audited Adjustment)
const adjustLeaveBalance = async (req, res) => {
  try {
    const { leaveType, adjustmentAmount, reason } = req.body;
    const targetEmployeeId = req.params.employeeId;

    if (!leaveType || adjustmentAmount === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, adjustment amount, and documented reason are mandatory.'
      });
    }

    const { employee, balanceDoc } = await getOrInitLeaveBalance(targetEmployeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveType.toUpperCase());

    if (!balanceItem) {
      return res.status(404).json({
        success: false,
        message: `Leave balance item [${leaveType}] not found for employee.`
      });
    }

    const prevAvailable = balanceItem.available;
    const adjNum = Number(adjustmentAmount);
    balanceItem.adjusted = (balanceItem.adjusted || 0) + adjNum;
    balanceItem.available = Math.max(0, (balanceItem.openingBalance || 0) + (balanceItem.allocated || 0) + (balanceItem.carriedForward || 0) + balanceItem.adjusted - (balanceItem.used || 0));
    balanceItem.lastUpdated = new Date();

    const newAvailable = balanceItem.available;

    // Record adjustment history subdocument
    balanceDoc.history.push({
      leaveType: leaveType.toUpperCase(),
      previousAvailable: prevAvailable,
      adjustedBy: adjNum,
      newAvailable,
      reason,
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      timestamp: new Date()
    });

    await balanceDoc.save();

    // Immutable Audit Log
    await AuditLog.logAction({
      user: req.user,
      action: 'LEAVE_BALANCE_ADJUST',
      module: 'HRMS_LEAVE',
      resource: 'LeaveBalance',
      resourceId: employee.employeeId,
      oldData: { leaveType, available: prevAvailable },
      newData: { leaveType, adjustment: adjNum, available: newAvailable, reason },
      details: `HR Manual Adjustment: ${adjNum >= 0 ? '+' : ''}${adjNum} days ${leaveType} for ${employee.fullName} (${employee.employeeId}). Reason: ${reason}`
    });

    res.json({
      success: true,
      message: `Balance adjusted successfully. New ${leaveType} available: ${newAvailable} days.`,
      balances: balanceDoc.balances,
      history: balanceDoc.history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 3. EMPLOYEE LEAVE APPLICATION & VALIDATION
// ==============================================================================

// POST /api/leave/requests (Apply Leave)
const applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      durationType = 'FULL_DAY',
      reason,
      contactDuringLeave,
      emergencyContact,
      supportingDocument
    } = req.body;

    const targetEmployeeId = req.body.employeeId || req.user.employeeId;
    if (!targetEmployeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID required.' });
    }

    const employee = await Employee.findOne({ employeeId: targetEmployeeId });
    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee with ID [${targetEmployeeId}] not found.` });
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format.' });
    }
    if (sDate > eDate) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date.' });
    }

    const sDateString = sDate.toISOString().split('T')[0];
    const eDateString = eDate.toISOString().split('T')[0];

    // Check for overlapping active requests
    const activeOverlap = await LeaveRequest.findOne({
      employee: employee._id,
      currentStatus: {
        $in: [
          'DRAFT',
          'SUBMITTED',
          'TEAM_MANAGER_PENDING',
          'TEAM_MANAGER_APPROVED',
          'DEPARTMENT_MANAGER_PENDING',
          'DEPARTMENT_MANAGER_APPROVED',
          'HR_REVIEW',
          'APPROVED'
        ]
      },
      $or: [
        { startDate: { $lte: eDate }, endDate: { $gte: sDate } }
      ]
    });

    if (activeOverlap) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing ${activeOverlap.currentStatus === 'APPROVED' ? 'approved' : 'pending'} leave request (${activeOverlap.requestId}) during these dates (${activeOverlap.startDateString} to ${activeOverlap.endDateString}).`
      });
    }

    // Leave Type Validation
    const ltConfig = await LeaveType.findOne({ code: leaveType.toUpperCase() });
    if (!ltConfig || !ltConfig.isActive) {
      return res.status(400).json({ success: false, message: `Leave type [${leaveType}] is invalid or disabled.` });
    }

    // Calculate duration automatically taking holidays and weekends into account
    const calculatedDuration = await calculateLeaveDuration({
      startDate: sDate,
      endDate: eDate,
      leaveTypeCode: ltConfig.code,
      isHalfDay: !!isHalfDay
    });

    // Check consecutive days limit
    if (ltConfig.maxConsecutiveDays && calculatedDuration > ltConfig.maxConsecutiveDays) {
      return res.status(400).json({
        success: false,
        message: `Maximum consecutive days allowed for ${ltConfig.name} is ${ltConfig.maxConsecutiveDays} day(s). Requested: ${calculatedDuration} day(s).`
      });
    }

    // Check Supporting Document Requirement
    const docRequired = ltConfig.requiresDocumentProof || (ltConfig.code === 'SICK_LEAVE' && calculatedDuration > 2);
    if (docRequired && (!supportingDocument || !supportingDocument.fileUrl)) {
      return res.status(400).json({
        success: false,
        message: `A supporting medical or official document is mandatory for ${ltConfig.name} exceeding policy threshold.`
      });
    }

    // Check and Reserve Leave Balance
    const { balanceDoc } = await getOrInitLeaveBalance(employee.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === ltConfig.code);

    if (ltConfig.isPaid && ltConfig.code !== 'UNPAID_LEAVE') {
      const availableBalance = balanceItem ? (balanceItem.available - (balanceItem.pending || 0)) : 0;
      if (availableBalance < calculatedDuration) {
        return res.status(400).json({
          success: false,
          message: `Insufficient available leave balance for ${ltConfig.name}. Available: ${Math.max(0, availableBalance)} days, Requested: ${calculatedDuration} day(s).`
        });
      }
    }

    // Find assigned Team Manager and Department Manager
    let teamManagerUser = null;
    let deptManagerUser = null;

    if (employee.reportingManager) {
      const mgrEmp = await Employee.findById(employee.reportingManager);
      if (mgrEmp && mgrEmp.user) {
        teamManagerUser = await User.findById(mgrEmp.user);
      }
    }
    if (!teamManagerUser) {
      // Find team lead or department manager in department
      teamManagerUser = await User.findOne({
        department: employee.departmentName,
        role: { $in: ['TEAM_LEAD', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER'] },
        isActive: true
      });
    }

    deptManagerUser = await User.findOne({
      department: employee.departmentName,
      role: { $in: ['DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DIRECTOR'] },
      isActive: true
    });

    // Create Leave Request
    const requestId = 'LV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    const leaveRequest = await LeaveRequest.create({
      requestId,
      employee: employee._id,
      user: req.user._id || req.user.id || null,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      departmentName: employee.departmentName || employee.department || 'Operations',
      team: employee.subDepartment || 'General Operations',
      teamManager: teamManagerUser ? teamManagerUser._id : null,
      teamManagerName: teamManagerUser ? teamManagerUser.name : (employee.managerName || 'Reporting Manager'),
      departmentManager: deptManagerUser ? deptManagerUser._id : null,
      departmentManagerName: deptManagerUser ? deptManagerUser.name : 'Department Head',
      leaveType: ltConfig.code,
      leaveTypeName: ltConfig.name,
      startDate: sDate,
      endDate: eDate,
      startDateString: sDateString,
      endDateString: eDateString,
      duration: calculatedDuration,
      totalDays: calculatedDuration,
      durationType: isHalfDay ? (durationType || 'FIRST_HALF') : 'FULL_DAY',
      isHalfDay: !!isHalfDay,
      reason,
      contactDuringLeave: contactDuringLeave || '',
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
      supportingDocument: supportingDocument || { documentName: '', fileUrl: '', fileType: '', fileSize: 0, uploadedAt: null },
      documentStatus: docRequired ? 'PENDING' : 'NOT_REQUIRED',
      currentStatus: 'TEAM_MANAGER_PENDING',
      status: 'TEAM_MANAGER_PENDING',
      submittedAt: new Date(),
      approvalHistory: [
        {
          step: 'SUBMISSION',
          actor: {
            id: req.user._id || req.user.id,
            name: req.user.name || employee.fullName,
            email: req.user.email,
            role: req.user.role || 'EMPLOYEE'
          },
          action: 'SUBMITTED',
          comment: reason,
          previousStatus: 'DRAFT',
          newStatus: 'TEAM_MANAGER_PENDING',
          timestamp: new Date()
        }
      ],
      approvals: [
        {
          step: 'MANAGER',
          approverName: teamManagerUser ? teamManagerUser.name : (employee.managerName || 'Reporting Manager'),
          action: 'PENDING',
          comment: ''
        }
      ]
    });

    // Update pending balance in LeaveBalance
    if (balanceItem) {
      balanceItem.pending = (balanceItem.pending || 0) + calculatedDuration;
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    // Activity Log & Audit Trail
    await logLeaveActivity({
      req,
      leaveRequest,
      employee,
      actor: req.user,
      action: 'SUBMIT',
      previousStatus: 'DRAFT',
      newStatus: 'TEAM_MANAGER_PENDING',
      comment: reason,
      details: `${employee.fullName} submitted ${calculatedDuration}-day leave application [${requestId}] (${ltConfig.name}) for ${sDateString} to ${eDateString}`
    });

    res.status(201).json({
      success: true,
      message: `Leave application [${requestId}] successfully routed to Team Manager (${leaveRequest.teamManagerName}).`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 4. WORKFLOW QUERYING (ROLE-BASED SCOPED ACCESS)
// ==============================================================================

// GET /api/leave/requests
const getLeaveRequests = async (req, res) => {
  try {
    const {
      status,
      leaveType,
      department,
      employeeId,
      search,
      viewMode, // 'employee', 'manager', 'department-manager', 'hr'
      page = 1,
      limit = 25
    } = req.query;

    const user = req.user;
    const userRole = user.role;
    const query = {};

    // Strict Data Scope Enforcer at Database Query Level
    if (viewMode === 'employee' || userRole === 'EMPLOYEE') {
      query.employeeId = user.employeeId || 'NON_EXISTENT';
    } else if (viewMode === 'manager' || userRole === 'TEAM_LEAD') {
      query.$or = [
        { teamManager: user._id },
        { teamManagerName: user.name },
        { employeeId: user.employeeId }
      ];
    } else if (viewMode === 'department-manager' || ['QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'WAREHOUSE_MANAGER'].includes(userRole)) {
      if (userRole === 'QA_MANAGER' || userRole === 'QC_MANAGER') {
        query.department = { $regex: /quality|qa|qc/i };
      } else if (userRole === 'PRODUCTION_MANAGER') {
        query.department = { $regex: /production|manufacturing|packaging/i };
      } else if (user.department && user.department !== 'General') {
        query.department = { $regex: new RegExp(user.department, 'i') };
      }
    } else if (['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'SUPER_ADMIN', 'DIRECTOR', 'AUDITOR'].includes(userRole)) {
      // HR/Super Admin has company-wide visibility
      if (department && department !== 'ALL') query.department = department;
    } else {
      query.employeeId = user.employeeId || 'NON_EXISTENT';
    }

    // Additional query filters
    if (status && status !== 'ALL') {
      query.$or = [{ currentStatus: status }, { status }];
    }
    if (leaveType && leaveType !== 'ALL') {
      query.leaveType = leaveType.toUpperCase();
    }
    if (employeeId && !query.employeeId) {
      query.employeeId = employeeId;
    }
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { employeeName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const total = await LeaveRequest.countDocuments(query);
    const requests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: requests.length,
      requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/requests/:id
const getLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Audit logs & activities for this request
    const activities = await LeaveActivity.find({ requestId: leaveRequest.requestId }).sort({ timestamp: -1 });

    res.json({
      success: true,
      leaveRequest,
      activities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 5. PHASE 3 — TEAM MANAGER APPROVAL & REJECTION
// ==============================================================================

// POST /api/leave/requests/:id/team-approve
const teamManagerApprove = async (req, res) => {
  try {
    const { comment = '' } = req.body;
    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.currentStatus !== 'TEAM_MANAGER_PENDING' && leaveRequest.currentStatus !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Invalid action: Current stage is [${leaveRequest.currentStatus}]. Only TEAM_MANAGER_PENDING requests can be reviewed by Team Manager.`
      });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'DEPARTMENT_MANAGER_PENDING';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.teamManagerActionAt = new Date();

    leaveRequest.approvalHistory.push({
      step: 'TEAM_MANAGER',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'APPROVED',
      comment: comment || 'Approved by Team Manager and forwarded to Department Head.',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    // Update approvals array for legacy UI
    leaveRequest.approvals.push({
      step: 'TEAM_MANAGER',
      approverName: req.user.name,
      action: 'APPROVED',
      comment: comment || '',
      actionDate: new Date()
    });

    await leaveRequest.save();

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'APPROVE',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment,
      details: `Team Manager ${req.user.name} approved leave [${leaveRequest.requestId}] for ${leaveRequest.employeeName}. Forwarded to Department Head.`
    });

    res.json({
      success: true,
      message: `Leave request [${leaveRequest.requestId}] approved by Team Manager. Forwarded to Department Manager.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/requests/:id/team-reject
const teamManagerReject = async (req, res) => {
  try {
    const { comment, reason } = req.body;
    const rejectionReason = reason || comment;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A documented rejection reason is mandatory when rejecting a leave request.'
      });
    }

    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.currentStatus !== 'TEAM_MANAGER_PENDING' && leaveRequest.currentStatus !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: `Invalid action: Current stage is [${leaveRequest.currentStatus}].`
      });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'TEAM_MANAGER_REJECTED';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.rejectionReason = rejectionReason;
    leaveRequest.teamManagerActionAt = new Date();

    leaveRequest.approvalHistory.push({
      step: 'TEAM_MANAGER',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'REJECTED',
      comment: rejectionReason,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leaveRequest.save();

    // Release reserved pending balance
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
    if (balanceItem && balanceItem.pending > 0) {
      balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'REJECT',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: rejectionReason,
      details: `Team Manager ${req.user.name} rejected leave [${leaveRequest.requestId}] for ${leaveRequest.employeeName}. Reason: ${rejectionReason}`
    });

    res.json({
      success: true,
      message: `Leave request [${leaveRequest.requestId}] rejected by Team Manager. Employee notified.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 6. PHASE 4 — DEPARTMENT MANAGER APPROVAL & REJECTION
// ==============================================================================

// POST /api/leave/requests/:id/department-approve
const departmentManagerApprove = async (req, res) => {
  try {
    const { comment = '' } = req.body;
    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.currentStatus !== 'DEPARTMENT_MANAGER_PENDING' && leaveRequest.currentStatus !== 'TEAM_MANAGER_APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Invalid action: Current stage is [${leaveRequest.currentStatus}]. Only requests approved by Team Manager can be reviewed by Department Head.`
      });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'HR_REVIEW';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.departmentManagerActionAt = new Date();

    leaveRequest.approvalHistory.push({
      step: 'DEPARTMENT_MANAGER',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'APPROVED',
      comment: comment || 'Department Head approved. Forwarded to HR Compliance Command.',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    leaveRequest.approvals.push({
      step: 'DEPARTMENT_MANAGER',
      approverName: req.user.name,
      action: 'APPROVED',
      comment: comment || '',
      actionDate: new Date()
    });

    await leaveRequest.save();

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'APPROVE',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment,
      details: `Department Head ${req.user.name} approved leave [${leaveRequest.requestId}] for ${leaveRequest.employeeName}. Routed to HR Command.`
    });

    res.json({
      success: true,
      message: `Leave request [${leaveRequest.requestId}] approved by Department Manager. Routed to HR Review.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/requests/:id/department-reject
const departmentManagerReject = async (req, res) => {
  try {
    const { comment, reason } = req.body;
    const rejectionReason = reason || comment;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A documented rejection reason is mandatory when rejecting a leave request.'
      });
    }

    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.currentStatus !== 'DEPARTMENT_MANAGER_PENDING' && leaveRequest.currentStatus !== 'TEAM_MANAGER_APPROVED') {
      return res.status(400).json({
        success: false,
        message: `Invalid action: Current stage is [${leaveRequest.currentStatus}].`
      });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'DEPARTMENT_MANAGER_REJECTED';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.rejectionReason = rejectionReason;
    leaveRequest.departmentManagerActionAt = new Date();

    leaveRequest.approvalHistory.push({
      step: 'DEPARTMENT_MANAGER',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'REJECTED',
      comment: rejectionReason,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leaveRequest.save();

    // Release reserved pending balance
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
    if (balanceItem && balanceItem.pending > 0) {
      balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'REJECT',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: rejectionReason,
      details: `Department Head ${req.user.name} rejected leave [${leaveRequest.requestId}] for ${leaveRequest.employeeName}. Reason: ${rejectionReason}`
    });

    res.json({
      success: true,
      message: `Leave request [${leaveRequest.requestId}] rejected by Department Manager. Employee notified.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/requests/:id/hr-approve (Universal Direct HR Sanction & Department Bypass)
const hrApprove = async (req, res) => {
  try {
    const { comment = '' } = req.body;
    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const allowedPending = [
      'SUBMITTED',
      'TEAM_MANAGER_PENDING',
      'TEAM_MANAGER_APPROVED',
      'DEPARTMENT_MANAGER_PENDING',
      'DEPARTMENT_MANAGER_APPROVED',
      'HR_REVIEW',
      'PENDING',
      'DRAFT'
    ];

    if (!allowedPending.includes(leaveRequest.currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action: Current stage is [${leaveRequest.currentStatus}]. Only pending requests can be approved.`
      });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'APPROVED';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.hrActionAt = new Date();
    leaveRequest.isOverridden = prevStatus !== 'HR_REVIEW' && prevStatus !== 'DEPARTMENT_MANAGER_APPROVED';

    const approvalComment = comment || (leaveRequest.isOverridden
      ? 'Direct HR Executive Approval & Department Bypass.'
      : 'Final HR compliance review completed and leave sanctioned.');

    leaveRequest.approvalHistory.push({
      step: 'HR',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'APPROVED',
      comment: approvalComment,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    leaveRequest.approvals.push({
      step: 'HR',
      approverName: req.user.name,
      action: 'APPROVED',
      comment: approvalComment,
      actionDate: new Date()
    });

    await leaveRequest.save();

    // Deduct leave balance & release pending
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
    if (balanceItem) {
      balanceItem.used = (balanceItem.used || 0) + leaveRequest.duration;
      balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      balanceDoc.recalculate();
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    // BJK-HR-POL-001 Policy integrations:
    // 1. If Comp-Off, deduct FIFO from active credits
    if (leaveRequest.leaveType === 'COMPENSATORY_OFF') {
      try {
        const { deductCompOffCredits } = require('../services/hrms/leavePolicyService');
        await deductCompOffCredits(leaveRequest.employeeId, leaveRequest.duration, leaveRequest);
      } catch (coErr) {
        console.warn('[leaveController] Comp-off credit deduction warning:', coErr.message);
      }
    }

    // 2. If extended leave >= 30 days in GMP department, ensure refresher training is scheduled
    const deptUpper = (leaveRequest.department || '').toUpperCase();
    const isGmpDept = ['PRD', 'PRODUCTION', 'QC', 'QUALITY_CONTROL', 'QA', 'QUALITY_ASSURANCE', 'WAREHOUSE', 'ENGG'].some(d => deptUpper.includes(d));
    if (leaveRequest.duration >= 30 && isGmpDept) {
      try {
        const { LeaveRefresherTraining } = require('../models/hrms/LeavePolicyModels');
        await LeaveRefresherTraining.findOneAndUpdate(
          { leaveRequestId: leaveRequest._id },
          {
            $setOnInsert: {
              employee: leaveRequest.employee,
              employeeCode: leaveRequest.employeeId,
              employeeName: leaveRequest.employeeName,
              department: leaveRequest.department,
              leaveRequestId: leaveRequest._id,
              leaveDurationDays: leaveRequest.duration,
              returnDate: leaveRequest.endDate,
              status: 'REQUIRED'
            }
          },
          { upsert: true, new: true }
        );
      } catch (trErr) {
        console.warn('[leaveController] Refresher training trigger warning:', trErr.message);
      }
    }

    // 3. If Sick Leave >= 4 days in GMP department, record medical fitness requirement
    if (leaveRequest.leaveType === 'SICK_LEAVE' && leaveRequest.duration >= 4 && isGmpDept) {
      try {
        const { MedicalFitnessRecord } = require('../models/hrms/LeavePolicyModels');
        await MedicalFitnessRecord.findOneAndUpdate(
          { leaveRequestId: leaveRequest._id },
          {
            $setOnInsert: {
              employee: leaveRequest.employee,
              employeeCode: leaveRequest.employeeId,
              employeeName: leaveRequest.employeeName,
              department: leaveRequest.department,
              leaveRequestId: leaveRequest._id,
              sickLeaveDays: leaveRequest.duration,
              certificateType: 'FITNESS_TO_RESUME',
              isGmpCriticalRole: true,
              documentUrl: leaveRequest.supportingDocument?.fileUrl || '',
              status: leaveRequest.supportingDocument?.fileUrl ? 'SUBMITTED' : 'SUBMITTED'
            }
          },
          { upsert: true, new: true }
        );
      } catch (fitErr) {
        console.warn('[leaveController] Medical fitness record trigger warning:', fitErr.message);
      }
    }

    await logLeaveActivity({
      req,

      leaveRequest,
      actor: req.user,
      action: 'APPROVE',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: approvalComment,
      details: `HR Administrator ${req.user.name} granted approval for leave [${leaveRequest.requestId}] (${leaveRequest.employeeName} - ${leaveRequest.department}). Balance deducted.`
    });

    res.json({
      success: true,
      message: `Leave request [${leaveRequest.requestId}] for ${leaveRequest.employeeName} (${leaveRequest.department}) successfully approved by HR.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/requests/:id/hr-reject (Universal Direct HR Rejection)
const hrReject = async (req, res) => {
  try {
    const { comment, reason } = req.body;
    const rejectionReason = reason || comment;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A documented rejection reason is mandatory when HR rejects a leave request.'
      });
    }

    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'REJECTED';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.rejectionReason = rejectionReason;
    leaveRequest.hrActionAt = new Date();

    leaveRequest.approvalHistory.push({
      step: 'HR',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'REJECTED',
      comment: rejectionReason,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leaveRequest.save();

    // Release reserved pending balance
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
    if (balanceItem && balanceItem.pending > 0) {
      balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'REJECT',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: rejectionReason,
      details: `HR Administrator ${req.user.name} rejected leave [${leaveRequest.requestId}] for ${leaveRequest.employeeName}. Reason: ${rejectionReason}`
    });

    res.json({
      success: true,
      message: `Leave request [${leaveRequest.requestId}] rejected by HR.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/bulk-approve (HR Master Multi-Department Bulk Approval)
const bulkApproveLeaves = async (req, res) => {
  try {
    const { requestIds = [], comment = '' } = req.body;
    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide an array of leave request IDs.' });
    }

    const results = [];
    for (const id of requestIds) {
      const leaveRequest = await LeaveRequest.findOne({
        $or: [
          { _id: mongoose.isValidObjectId(id) ? id : null },
          { requestId: id }
        ]
      });

      if (!leaveRequest || leaveRequest.currentStatus === 'APPROVED' || leaveRequest.currentStatus === 'REJECTED') {
        continue;
      }

      const prevStatus = leaveRequest.currentStatus;
      const nextStatus = 'APPROVED';

      leaveRequest.currentStatus = nextStatus;
      leaveRequest.status = nextStatus;
      leaveRequest.hrActionAt = new Date();
      leaveRequest.isOverridden = prevStatus !== 'HR_REVIEW' && prevStatus !== 'DEPARTMENT_MANAGER_APPROVED';

      const approvalComment = comment || 'Bulk Approved by HR Executive Command.';

      leaveRequest.approvalHistory.push({
        step: 'HR',
        actor: {
          id: req.user._id || req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        },
        action: 'APPROVED',
        comment: approvalComment,
        previousStatus: prevStatus,
        newStatus: nextStatus,
        timestamp: new Date()
      });

      await leaveRequest.save();

      try {
        const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
        const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
        if (balanceItem) {
          balanceItem.used = (balanceItem.used || 0) + leaveRequest.duration;
          balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
          balanceDoc.recalculate();
          balanceDoc.markModified('balances');
          await balanceDoc.save();
        }
      } catch (_) {}

      results.push(leaveRequest.requestId);
    }

    res.json({
      success: true,
      message: `Successfully approved ${results.length} leave requests across departments.`,
      approvedCount: results.length,
      approvedRequests: results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/requests/:id/hr-override (Strict HR Administrative Override)
const hrOverride = async (req, res) => {
  try {
    const { targetStatus, reason } = req.body;

    if (!targetStatus || !['APPROVED', 'REJECTED'].includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Target status must be either APPROVED or REJECTED for an administrative override.'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A detailed override justification is mandatory for HR administrative overrides.'
      });
    }

    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = targetStatus;

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;
    leaveRequest.isOverridden = true;
    leaveRequest.hrOverrideReason = reason;
    leaveRequest.overriddenBy = {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email
    };
    leaveRequest.hrActionAt = new Date();

    leaveRequest.approvalHistory.push({
      step: 'HR_OVERRIDE',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'OVERRIDDEN',
      comment: `HR Administrative Override to ${nextStatus}: ${reason}`,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leaveRequest.save();

    // Adjust balances accordingly
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);

    if (balanceItem) {
      if (nextStatus === 'APPROVED' && prevStatus !== 'APPROVED') {
        balanceItem.used = (balanceItem.used || 0) + leaveRequest.duration;
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      } else if (nextStatus === 'REJECTED') {
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      }
      balanceDoc.recalculate();
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    // High-priority Immutable Audit Log
    await AuditLog.logAction({
      user: req.user,
      action: 'HR_LEAVE_OVERRIDE',
      module: 'HRMS_LEAVE',
      resource: 'LeaveRequest',
      resourceId: leaveRequest.requestId,
      oldData: { status: prevStatus },
      newData: { status: nextStatus, reason, overriddenBy: req.user.name },
      details: `[CRITICAL AUDIT] HR Administrative Override on Leave [${leaveRequest.requestId}] (${leaveRequest.employeeName}) from ${prevStatus} to ${nextStatus}. Justification: "${reason}"`
    });

    res.json({
      success: true,
      message: `HR Administrative Override executed successfully. Status transitioned from ${prevStatus} to ${nextStatus}.`,
      leaveRequest
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 8. CANCELLATION & WITHDRAWAL
// ==============================================================================

// PATCH /api/leave/requests/:id/withdraw (Employee Self-Service)
const withdrawLeave = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Employee can only withdraw their own pending request
    if (leaveRequest.employeeId !== req.user.employeeId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to withdraw this leave request.' });
    }

    if (['APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'].includes(leaveRequest.currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw request with status [${leaveRequest.currentStatus}].`
      });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'WITHDRAWN';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;

    leaveRequest.approvalHistory.push({
      step: 'WITHDRAWAL',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'WITHDRAWN',
      comment: reason || 'Withdrawn by employee',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leaveRequest.save();

    // Release pending balance
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
    if (balanceItem && balanceItem.pending > 0) {
      balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'WITHDRAW',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: reason,
      details: `${req.user.name} withdrew leave request [${leaveRequest.requestId}]`
    });

    res.json({ success: true, message: 'Leave request withdrawn successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/leave/requests/:id/cancel
const cancelLeave = async (req, res) => {
  try {
    const { reason = '' } = req.body;
    const leaveRequest = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null },
        { requestId: req.params.id }
      ]
    });

    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const prevStatus = leaveRequest.currentStatus;
    const nextStatus = 'CANCELLED';

    leaveRequest.currentStatus = nextStatus;
    leaveRequest.status = nextStatus;

    leaveRequest.approvalHistory.push({
      step: 'CANCELLATION',
      actor: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      action: 'CANCELLED',
      comment: reason || 'Cancelled by authorized user',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leaveRequest.save();

    // Reverse used balance if it was approved, or reverse pending if pending
    const { balanceDoc } = await getOrInitLeaveBalance(leaveRequest.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leaveRequest.leaveType);
    if (balanceItem) {
      if (prevStatus === 'APPROVED') {
        balanceItem.used = Math.max(0, (balanceItem.used || 0) - leaveRequest.duration);
      } else {
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leaveRequest.duration);
      }
      balanceDoc.recalculate();
      balanceDoc.markModified('balances');
      await balanceDoc.save();
    }

    await logLeaveActivity({
      req,
      leaveRequest,
      actor: req.user,
      action: 'CANCEL',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: reason,
      details: `${req.user.name} cancelled leave [${leaveRequest.requestId}] for ${leaveRequest.employeeName}`
    });

    res.json({ success: true, message: 'Leave request cancelled successfully', leaveRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 9. LEAVE CALENDAR & TEAM CAPACITY
// ==============================================================================

// GET /api/leave/calendar
const getLeaveCalendar = async (req, res) => {
  try {
    const { month, year = 2026, department } = req.query;
    const user = req.user;
    const userRole = user.role;

    const query = {
      currentStatus: { $in: ['APPROVED', 'TEAM_MANAGER_PENDING', 'DEPARTMENT_MANAGER_PENDING', 'HR_REVIEW'] }
    };

    // Scoped visibility
    if (userRole === 'EMPLOYEE') {
      query.employeeId = user.employeeId;
    } else if (userRole === 'TEAM_LEAD') {
      query.$or = [{ teamManager: user._id }, { employeeId: user.employeeId }];
    } else if (['QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER'].includes(userRole)) {
      if (userRole === 'QA_MANAGER' || userRole === 'QC_MANAGER') {
        query.department = { $regex: /quality|qa|qc/i };
      } else if (userRole === 'PRODUCTION_MANAGER') {
        query.department = { $regex: /production|manufacturing/i };
      } else if (user.department) {
        query.department = user.department;
      }
    } else if (['HR_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'DIRECTOR'].includes(userRole)) {
      if (department && department !== 'ALL') query.department = department;
    }

    const leaves = await LeaveRequest.find(query).sort({ startDate: 1 });

    // Calculate capacity warnings for managers: count overlapping team members per date
    const dateLeaveCountMap = {};
    leaves.forEach(l => {
      let cur = new Date(l.startDate);
      const end = new Date(l.endDate);
      while (cur <= end) {
        const dStr = cur.toISOString().split('T')[0];
        if (!dateLeaveCountMap[dStr]) dateLeaveCountMap[dStr] = [];
        dateLeaveCountMap[dStr].push({
          employeeName: l.employeeName,
          employeeId: l.employeeId,
          department: l.department,
          leaveType: l.leaveType,
          status: l.currentStatus
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    const capacityAlerts = [];
    Object.keys(dateLeaveCountMap).forEach(dStr => {
      if (dateLeaveCountMap[dStr].length >= 3) {
        capacityAlerts.push({
          date: dStr,
          absentCount: dateLeaveCountMap[dStr].length,
          employees: dateLeaveCountMap[dStr],
          warning: `High absence alert: ${dateLeaveCountMap[dStr].length} team members absent on ${dStr}`
        });
      }
    });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
      dateMap: dateLeaveCountMap,
      capacityAlerts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 10. ACTIVITY LOG & AUDIT REPORTING
// ==============================================================================

// GET /api/hr/leave/activity
const getLeaveActivity = async (req, res) => {
  try {
    const { employeeId, department, action, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (employeeId) query['employee.employeeId'] = employeeId;
    if (department && department !== 'ALL') query['employee.department'] = department;
    if (action && action !== 'ALL') query.action = action;
    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { 'employee.name': { $regex: search, $options: 'i' } },
        { 'actor.name': { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await LeaveActivity.countDocuments(query);
    const activities = await LeaveActivity.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hr/leave/reports (Comprehensive KPI and Statistics from MongoDB)
const getLeaveReports = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();

    const [
      totalRequests,
      pendingTeamManager,
      pendingDeptManager,
      pendingHRReview,
      approvedCount,
      rejectedCount,
      todayApproved,
      todayRejected,
      currentlyOnLeave,
      allLeaveTypes
    ] = await Promise.all([
      LeaveRequest.countDocuments(),
      LeaveRequest.countDocuments({ currentStatus: 'TEAM_MANAGER_PENDING' }),
      LeaveRequest.countDocuments({ currentStatus: 'DEPARTMENT_MANAGER_PENDING' }),
      LeaveRequest.countDocuments({ currentStatus: 'HR_REVIEW' }),
      LeaveRequest.countDocuments({ currentStatus: 'APPROVED' }),
      LeaveRequest.countDocuments({ currentStatus: { $in: ['REJECTED', 'TEAM_MANAGER_REJECTED', 'DEPARTMENT_MANAGER_REJECTED'] } }),
      LeaveRequest.countDocuments({ currentStatus: 'APPROVED', hrActionAt: { $gte: new Date(todayStr) } }),
      LeaveRequest.countDocuments({ currentStatus: { $in: ['REJECTED', 'TEAM_MANAGER_REJECTED', 'DEPARTMENT_MANAGER_REJECTED'] }, updatedAt: { $gte: new Date(todayStr) } }),
      LeaveRequest.find({
        currentStatus: 'APPROVED',
        startDate: { $lte: today },
        endDate: { $gte: today }
      }),
      LeaveType.find({ isActive: true })
    ]);

    // Breakdown by Department
    const departmentStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ['$currentStatus', 'APPROVED'] }, 1, 0] } },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$currentStatus', ['TEAM_MANAGER_PENDING', 'DEPARTMENT_MANAGER_PENDING', 'HR_REVIEW']] },
                1,
                0
              ]
            }
          },
          rejected: {
            $sum: {
              $cond: [
                { $in: ['$currentStatus', ['REJECTED', 'TEAM_MANAGER_REJECTED', 'DEPARTMENT_MANAGER_REJECTED']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Breakdown by Leave Type
    const typeStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$leaveType',
          total: { $sum: 1 },
          totalDays: { $sum: '$duration' }
        }
      }
    ]);

    // Low balance employee count
    const lowBalanceCount = await LeaveBalance.countDocuments({
      'balances.available': { $lte: 2 }
    });

    res.json({
      success: true,
      kpis: {
        totalRequests,
        pendingTotal: pendingTeamManager + pendingDeptManager + pendingHRReview,
        pendingTeamManager,
        pendingDeptManager,
        pendingHRReview,
        approvedCount,
        rejectedCount,
        todayApproved,
        todayRejected,
        currentlyOnLeaveCount: currentlyOnLeave.length,
        currentlyOnLeave,
        lowBalanceCount
      },
      departmentStats,
      typeStats,
      leaveTypes: allLeaveTypes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 9. 2026 MASTER LEAVE LEDGER CONTROLLERS (Prompt Strict Preservation)
// ==============================================================================
const LeaveLedger = require('../models/hrms/LeaveLedger');
const Attendance = require('../models/hrms/Attendance');
const {
  getEmployeeLedger,
  getAllLedgers,
  getMonthlyMatrix,
  getDepartmentAnalytics,
  getLeaveKPIs,
  parseLeave2026CSV,
  syncLeaveLedgerFromSeed,
  MONTH_NAMES
} = require('../services/hrms/leaveLedgerService');

// GET /api/hr/leave or GET /api/admin/leave
// Returns 2026 Master Leave Ledger + KPIs + Filters
const getLeaveLedgerDashboard = async (req, res) => {
  try {
    const { search, department, month, leaveType, year = 2026, page = 1, limit = 100 } = req.query;

    const [kpis, ledgerData, deptAnalytics] = await Promise.all([
      getLeaveKPIs(year),
      getAllLedgers({ search, department, month, leaveType, year, page, limit }),
      getDepartmentAnalytics(year)
    ]);

    res.json({
      success: true,
      year: Number(year),
      kpis,
      ledgers: ledgerData.ledgers,
      total: ledgerData.total,
      page: ledgerData.page,
      totalPages: ledgerData.totalPages,
      departmentAnalytics: deptAnalytics,
      months: MONTH_NAMES
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hr/leave/employee/:employeeCode or GET /api/admin/leave/employee/:employeeCode
// Returns Dixita or any employee's 2026 detailed leave information
const getEmployeeLeaveDetail = async (req, res) => {
  try {
    const employeeCode = (req.params.employeeCode || req.params.id || '').toUpperCase().trim();
    if (!employeeCode) {
      return res.status(400).json({ success: false, message: 'Employee code is required' });
    }

    const ledger = await getEmployeeLedger(employeeCode, 2026);
    const balanceDoc = await LeaveBalance.findOne({ employeeId: employeeCode, leaveYear: 2026 });
    const requests = await LeaveRequest.find({ employeeId: employeeCode }).sort({ createdAt: -1 });
    const attendanceRecords = await Attendance.find({
      $or: [{ employeeId: employeeCode }, { employeeCode: employeeCode }]
    }).sort({ attendanceDate: -1, dateString: -1, date: -1 }).limit(30);

    if (!ledger && !balanceDoc) {
      return res.status(404).json({ success: false, message: `No leave records found for employee [${employeeCode}]` });
    }

    res.json({
      success: true,
      employeeCode,
      employeeName: ledger?.employeeName || balanceDoc?.employeeName || 'Employee',
      department: ledger?.department || balanceDoc?.department || 'Operations',
      doj: ledger?.doj || '',
      year: 2026,
      ledger: ledger || null,
      balances: balanceDoc?.balances || [],
      requests,
      attendance: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hr/leave/monthly or GET /api/admin/leave/monthly
const getMonthlyLeaveMatrixData = async (req, res) => {
  try {
    const { month = 'Jan-26', year = 2026, department, search } = req.query;
    const matrix = await getMonthlyMatrix(month, year, { department, search });
    res.json({ success: true, ...matrix });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hr/attendance/employee/:employeeCode
const getEmployeeAttendanceForHR = async (req, res) => {
  try {
    const employeeCode = (req.params.employeeCode || '').toUpperCase().trim();
    const records = await Attendance.find({
      $or: [{ employeeId: employeeCode }, { employeeCode: employeeCode }]
    }).sort({ attendanceDate: -1, dateString: -1, date: -1 });

    res.json({ success: true, employeeCode, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/leave/import or POST /api/hr/leave/import
const importLeaveCSVData = async (req, res) => {
  try {
    let csvContent = '';
    if (req.file) {
      csvContent = req.file.buffer.toString('utf8');
    } else if (req.body.csvData) {
      csvContent = req.body.csvData;
    } else {
      return res.status(400).json({ success: false, message: 'No CSV file or data provided for import.' });
    }

    const records = parseLeave2026CSV(csvContent);
    let imported = 0;
    let updated = 0;

    for (const rec of records) {
      const existing = await LeaveLedger.findOne({ employeeCode: rec.employeeCode, year: 2026 });
      if (!existing) {
        await LeaveLedger.create(rec);
        imported++;
      } else {
        Object.assign(existing, rec);
        existing.lastUpdated = new Date();
        existing.updatedBy = req.user?.email || 'HR Admin';
        await existing.save();
        updated++;
      }
    }

    await AuditLog.logAction({
      user: req.user,
      action: 'IMPORT_LEAVE_DATA',
      module: 'HRMS_LEAVE',
      resource: 'LeaveLedger',
      details: `Imported 2026 leave sheet: ${imported} created, ${updated} updated (${records.length} total rows).`
    });

    res.json({
      success: true,
      message: `Successfully imported leave data: ${imported} created, ${updated} updated.`,
      count: records.length,
      imported,
      updated
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/leave/export or GET /api/hr/leave/export
const exportLeaveCSVData = async (req, res) => {
  try {
    const { department, search, year = 2026 } = req.query;
    const ledgerData = await getAllLedgers({ department, search, year, limit: 1000 });

    let csv = 'Sr. No.,Emp. Code,Emp. Name,Dept.,DOJ,OPENING_CL,OPENING_SL,';
    MONTH_NAMES.forEach(m => {
      csv += `${m}_CL,${m}_SL,${m}_LWP,`;
    });
    csv += 'TOTAL_CL,TOTAL_SL,TOTAL_LWP,TOTAL_TAKEN,CLOSING_CL,CLOSING_SL\n';

    ledgerData.ledgers.forEach(l => {
      csv += `"${l.srNo}","${l.employeeCode}","${l.employeeName}","${l.department}","${l.doj}",${l.openingBalance?.cl || 0},${l.openingBalance?.sl || 0},`;
      (l.monthlyBreakdown || []).forEach(m => {
        csv += `${m.cl},${m.sl},${m.lwp},`;
      });
      csv += `${l.totalLeaveTaken?.cl || 0},${l.totalLeaveTaken?.sl || 0},${l.totalLeaveTaken?.lwp || 0},${l.totalLeaveTaken?.total || 0},${l.closingBalance?.cl || 0},${l.closingBalance?.sl || 0}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="BJK_Leave_Report_${year}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Master Setup
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  getLeavePolicies,
  createOrUpdateLeavePolicy,
  getHolidays,
  createHoliday,

  // Balances
  getLeaveBalances,
  getAllLeaveBalances,
  adjustLeaveBalance,

  // Requests
  applyLeave,
  getLeaveRequests,
  getLeaveRequestById,

  // Workflows
  teamManagerApprove,
  teamManagerReject,
  departmentManagerApprove,
  departmentManagerReject,
  hrApprove,
  hrReject,
  hrOverride,
  bulkApproveLeaves,

  // Cancellations
  withdrawLeave,
  cancelLeave,

  // Calendar, Activity & Reports
  getLeaveCalendar,
  getLeaveActivity,
  getLeaveReports,

  // 2026 Master Leave Ledger (Preserved & Integrated)
  getLeaveLedgerDashboard,
  getEmployeeLeaveDetail,
  getMonthlyLeaveMatrixData,
  getEmployeeAttendanceForHR,
  importLeaveCSVData,
  exportLeaveCSVData
};
