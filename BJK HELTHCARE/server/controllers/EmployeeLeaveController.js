const mongoose = require('mongoose');
const {
  LeaveType,
  LeavePolicy,
  HolidayCalendar,
  LeaveBalance,
  LeaveRequest,
  LeaveActivity
} = require('../models/hrms/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const HRNotification = require('../models/hrms/HRNotification');
const AuditLog = require('../models/AuditLog');
const {
  calculateLeaveDuration,
  getOrInitLeaveBalance,
  logLeaveActivity,
  initLeaveMaster
} = require('../services/hrms/leaveService');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * GET /api/employee/leave/types
 * Returns active leave types configured in HR leave master
 */
const getLeaveTypes = async (req, res) => {
  try {
    let types = await LeaveType.find({ isActive: true }).sort({ name: 1 });
    if (!types || types.length === 0) {
      await initLeaveMaster();
      types = await LeaveType.find({ isActive: true }).sort({ name: 1 });
    }
    return res.status(200).json({
      success: true,
      count: types.length,
      types
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.getLeaveTypes Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave categories.' });
  }
};

/**
 * GET /api/employee/leave/holidays
 * Returns company holiday calendar for the current leave year
 */
const getHolidays = async (req, res) => {
  try {
    const { year = 2026 } = req.query;
    const holidays = await HolidayCalendar.find({ year: Number(year), isActive: true }).sort({ date: 1 });
    return res.status(200).json({
      success: true,
      count: holidays.length,
      holidays
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.getHolidays Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve holiday calendar.' });
  }
};

/**
 * POST /api/employee/leave/calculate-days
 * Dynamically computes working days considering weekend and holiday rules
 */
const calculateWorkingDays = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, isHalfDay } = req.body;
    if (!startDate || !endDate || !leaveType) {
      return res.status(400).json({
        success: false,
        message: 'startDate, endDate, and leaveType are required for calculation.'
      });
    }

    const duration = await calculateLeaveDuration({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      leaveTypeCode: String(leaveType).toUpperCase(),
      isHalfDay: !!isHalfDay
    });

    return res.status(200).json({
      success: true,
      workingDays: duration
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to calculate working days.'
    });
  }
};

const { getEmployeeLedger } = require('../services/hrms/leaveLedgerService');

/**
 * GET /api/employee/leave/balance
 * Returns leave balances strictly for the current logged-in employee from single source of truth
 */
const getLeaveBalances = async (req, res) => {
  try {
    // Authoritative employee identity strictly from authenticated session
    const employeeId = req.employeeId || req.user.employeeId;
    if (!employeeId) {
      return res.status(401).json({ success: false, message: 'Authenticated employee identity missing.' });
    }

    const { employee, balanceDoc } = await getOrInitLeaveBalance(employeeId, 2026);
    const ledger = await getEmployeeLedger(employeeId, 2026);

    const balances = balanceDoc.balances || [];
    const totalAvailable = balances.reduce((sum, b) => sum + (Number(b.available) || 0), 0);
    const totalUsed = balances.reduce((sum, b) => sum + (Number(b.used) || 0), 0);
    const totalPending = balances.reduce((sum, b) => sum + (Number(b.pending) || 0), 0);

    return res.status(200).json({
      success: true,
      leaveYear: balanceDoc.leaveYear || 2026,
      employeeId: employee?.employeeId || employeeId,
      employeeName: employee?.fullName || ledger?.employeeName || req.user?.name,
      department: employee?.departmentName || employee?.department || ledger?.department,
      summary: {
        totalAvailable: ledger ? (ledger.closingBalance?.total ?? totalAvailable) : totalAvailable,
        totalUsed: ledger ? (ledger.totalLeaveTaken?.total ?? totalUsed) : totalUsed,
        totalPending
      },
      ledger: ledger || null,
      balances,
      history: balanceDoc.history || []
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.getLeaveBalances Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave balances.' });
  }
};

/**
 * GET /api/employee/leave/ledger or GET /api/employee/me/leave
 * Strictly returns only the logged-in employee's 2026 leave matrix from source data
 */
const getEmployeeLeaveLedger = async (req, res) => {
  try {
    const employeeId = (req.employeeId || req.user.employeeId || '').toUpperCase();
    const ledger = await getEmployeeLedger(employeeId, 2026);

    return res.status(200).json({
      success: true,
      employeeId,
      ledger: ledger || null
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.getEmployeeLeaveLedger Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee leave ledger.' });
  }
};

/**
 * GET /api/employee/leave or GET /api/employee/leave/my
 * List current employee's leaves strictly isolated by session identity
 */
const getLeaveRequests = async (req, res) => {
  try {
    const employeeId = (req.employeeId || req.user.employeeId).toUpperCase();
    const leaves = await LeaveRequest.find({
      employeeId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.getLeaveRequests Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave requests.' });
  }
};

/**
 * GET /api/employee/leave/:id
 * Retrieve a specific leave request with its full approval history timeline
 */
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = (req.employeeId || req.user.employeeId).toUpperCase();
    const userRole = req.employeeRole || req.user.role;

    const leave = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { requestId: id }
      ]
    });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Strict Ownership Enforcement: employee can only view own leave unless Manager or HR
    const isOwner = leave.employeeId.toUpperCase() === employeeId;
    const isManagerOrHR = ['TEAM_LEAD', 'MANAGER', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'SUPER_ADMIN', 'DIRECTOR'].includes(userRole);

    if (!isOwner && !isManagerOrHR) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own leave applications.' });
    }

    const activities = await LeaveActivity.find({ requestId: leave.requestId }).sort({ timestamp: -1 });

    return res.status(200).json({
      success: true,
      leave,
      leaveRequest: leave,
      activities,
      approvalHistory: leave.approvalHistory || []
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.getLeaveById Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve leave request details.' });
  }
};

/**
 * POST /api/employee/leave or POST /api/employee/leave/apply
 * Apply for leave following Screenshot 1 master functional specification
 */
const applyLeave = async (req, res) => {
  try {
    // 1. Authoritative employee identity strictly from authenticated session
    // NEVER trust employeeId from req.body
    const employeeId = (req.employeeId || req.user.employeeId).toUpperCase();
    if (!employeeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized employee session.' });
    }

    const employee = await Employee.findOne({
      $or: [
        { employeeId },
        { employeeCode: employeeId }
      ]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found in system database.' });
    }

    const {
      leaveType,
      startDate,
      endDate,
      isHalfDay = false,
      durationType = 'FULL_DAY',
      reason,
      handoverDetails,
      contactDuringLeave,
      contactDuringAbsence,
      emergencyContact,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      supportingDocument
    } = req.body;

    // Field Validations
    if (!leaveType) {
      return res.status(400).json({ success: false, message: 'Please select a leave type.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
    }

    const sDate = new Date(startDate);
    const eDate = isHalfDay ? new Date(startDate) : new Date(endDate);

    if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Please select a valid leave period.' });
    }
    if (sDate > eDate) {
      return res.status(400).json({ success: false, message: 'Start date cannot be after end date.' });
    }

    // Reason & Handover Validation (Must be meaningful, min 10 chars)
    const combinedReason = [reason, handoverDetails].filter(Boolean).join(' | ');
    if (!combinedReason || combinedReason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Reason & handover details are mandatory and must contain meaningful details (minimum 10 characters).'
      });
    }

    // Phone format validation (if provided)
    const phoneToValidate = contactDuringAbsence || contactDuringLeave;
    if (phoneToValidate && !/^[0-9+() -]{8,15}$/.test(phoneToValidate.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact phone number format.'
      });
    }

    const emerPhone = emergencyContact?.phone || emergencyContactPhone;
    if (emerPhone && !/^[0-9+() -]{8,15}$/.test(emerPhone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid emergency contact phone number format.'
      });
    }

    // 2. Fetch and Validate Leave Type from HR Leave Configuration
    const ltConfig = await LeaveType.findOne({ code: String(leaveType).toUpperCase(), isActive: true });
    if (!ltConfig) {
      return res.status(400).json({
        success: false,
        message: `Configured leave category [${leaveType}] was not found or is currently inactive. Please contact HR.`
      });
    }

    // 3. Check for Duplicate or Overlapping Leave Requests
    const activeOverlap = await LeaveRequest.findOne({
      employeeId,
      currentStatus: {
        $in: [
          'SUBMITTED',
          'MANAGER_REVIEW',
          'TEAM_MANAGER_PENDING',
          'TEAM_MANAGER_APPROVED',
          'DEPARTMENT_HEAD_REVIEW',
          'DEPARTMENT_MANAGER_PENDING',
          'DEPARTMENT_MANAGER_APPROVED',
          'HR_REVIEW',
          'APPROVED'
        ]
      },
      startDate: { $lte: eDate },
      endDate: { $gte: sDate }
    });

    if (activeOverlap) {
      return res.status(400).json({
        success: false,
        message: `You already have an active leave request (${activeOverlap.requestId}) for this period (${activeOverlap.startDateString} to ${activeOverlap.endDateString}). Overlapping requests are not permitted.`
      });
    }

    // 4. Calculate Duration taking holidays and weekends into account
    const calculatedDuration = await calculateLeaveDuration({
      startDate: sDate,
      endDate: eDate,
      leaveTypeCode: ltConfig.code,
      isHalfDay: !!isHalfDay
    });

    if (calculatedDuration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'The selected period contains 0 working days according to company calendar and leave policy.'
      });
    }

    // 5. Consecutive Days Limit Check
    if (ltConfig.maxConsecutiveDays && calculatedDuration > ltConfig.maxConsecutiveDays) {
      return res.status(400).json({
        success: false,
        message: `Policy limit exceeded: Maximum continuous days allowed for ${ltConfig.name} is ${ltConfig.maxConsecutiveDays} day(s). Requested: ${calculatedDuration} day(s).`
      });
    }

    // 6. Supporting Document Requirement Check
    const isDocMandatory = ltConfig.requiresDocumentProof || (ltConfig.code === 'SICK_LEAVE' && calculatedDuration > 2);
    if (isDocMandatory && (!supportingDocument || (!supportingDocument.fileUrl && !supportingDocument.documentName))) {
      return res.status(400).json({
        success: false,
        message: `Supporting medical certificate or statutory document is required for ${ltConfig.name} exceeding policy threshold.`
      });
    }

    // 7. Check Available Leave Balance Quota
    const { balanceDoc } = await getOrInitLeaveBalance(employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === ltConfig.code);

    if (ltConfig.isPaid && ltConfig.code !== 'UNPAID_LEAVE') {
      const netAvailable = balanceItem ? (balanceItem.available - (balanceItem.pending || 0)) : 0;
      if (netAvailable < calculatedDuration) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. Available: ${Math.max(0, netAvailable)} day(s), Requested: ${calculatedDuration} day(s).`
        });
      }
    }

    // 8. Determine Approval Chain Actors
    let teamManagerUser = null;
    let deptManagerUser = null;

    if (employee.reportingManager) {
      const mgrEmp = await Employee.findById(employee.reportingManager);
      if (mgrEmp && mgrEmp.user) {
        teamManagerUser = await User.findById(mgrEmp.user);
      }
    }
    if (!teamManagerUser) {
      teamManagerUser = await User.findOne({
        department: employee.departmentName || employee.department,
        role: { $in: ['TEAM_LEAD', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER'] },
        isActive: true
      });
    }

    deptManagerUser = await User.findOne({
      department: employee.departmentName || employee.department,
      role: { $in: ['DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DIRECTOR'] },
      isActive: true
    });

    // 9. Generate Unique Application ID (e.g. LV-2026-004812)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const requestId = `LV-${new Date().getFullYear()}-${randomSuffix}`;

    const sDateString = sDate.toISOString().split('T')[0];
    const eDateString = eDate.toISOString().split('T')[0];

    const emergencyContactObj = {
      name: emergencyContact?.name || emergencyContactName || '',
      phone: emergencyContact?.phone || emergencyContactPhone || '',
      relation: emergencyContact?.relation || emergencyContactRelation || ''
    };

    const docObj = supportingDocument ? {
      documentName: supportingDocument.documentName || supportingDocument.name || 'Supporting_Document.pdf',
      fileUrl: supportingDocument.fileUrl || supportingDocument.url || '',
      fileType: supportingDocument.fileType || 'application/pdf',
      fileSize: supportingDocument.fileSize || 0,
      uploadedAt: new Date()
    } : {
      documentName: '',
      fileUrl: '',
      fileType: '',
      fileSize: 0,
      uploadedAt: null
    };

    // 10. Create Master Leave Request Record
    const leaveRequest = new LeaveRequest({
      requestId,
      employee: employee._id,
      user: req.user?._id || employee.user || null,
      employeeId,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      departmentName: employee.departmentName || employee.department || 'Operations',
      team: employee.subDepartment || 'General Operations',
      teamManager: teamManagerUser ? teamManagerUser._id : null,
      teamManagerName: teamManagerUser ? teamManagerUser.name : (employee.reportingManagerName || employee.managerName || 'Team Manager'),
      departmentManager: deptManagerUser ? deptManagerUser._id : null,
      departmentManagerName: deptManagerUser ? deptManagerUser.name : 'Department Head',
      leaveType: ltConfig.code,
      leaveTypeName: ltConfig.name,
      leaveCode: ltConfig.code,
      startDate: sDate,
      endDate: eDate,
      startDateString: sDateString,
      endDateString: eDateString,
      duration: calculatedDuration,
      totalDays: calculatedDuration,
      durationType: isHalfDay ? (durationType || 'FIRST_HALF') : 'FULL_DAY',
      isHalfDay: !!isHalfDay,
      reason: reason || combinedReason,
      handoverDetails: handoverDetails || '',
      contactDuringLeave: contactDuringAbsence || contactDuringLeave || '',
      contactDuringAbsence: contactDuringAbsence || contactDuringLeave || '',
      emergencyContact: emergencyContactObj,
      supportingDocument: docObj,
      documentStatus: isDocMandatory ? 'PENDING' : 'NOT_REQUIRED',
      currentStatus: 'TEAM_MANAGER_PENDING',
      status: 'TEAM_MANAGER_PENDING',
      currentApprovalStage: 'Team Manager Review',
      submittedAt: new Date(),
      approvalHistory: [
        {
          step: 'SUBMISSION',
          actor: {
            id: req.user?._id || employee._id,
            name: employee.fullName,
            email: employee.email,
            role: 'EMPLOYEE'
          },
          action: 'SUBMITTED',
          comment: combinedReason,
          previousStatus: 'DRAFT',
          newStatus: 'TEAM_MANAGER_PENDING',
          timestamp: new Date()
        }
      ],
      approvals: [
        {
          step: 'TEAM_MANAGER',
          approverName: teamManagerUser ? teamManagerUser.name : 'Team Manager',
          action: 'PENDING',
          comment: ''
        }
      ]
    });

    await leaveRequest.save();

    // 11. Reserve Pending Leave Balance
    if (balanceItem) {
      balanceItem.pending = (balanceItem.pending || 0) + calculatedDuration;
      balanceDoc.markModified('balances');
      await balanceDoc.save().catch(e => console.warn('[Balance Save Warning]:', e.message));
    }

    // 12. Record Activity & Immutable Audit Log
    await logLeaveActivity({
      req,
      leaveRequest,
      employee,
      actor: {
        id: req.user?._id || employee._id,
        name: employee.fullName,
        email: employee.email,
        role: 'EMPLOYEE'
      },
      action: 'SUBMIT',
      previousStatus: 'DRAFT',
      newStatus: 'TEAM_MANAGER_PENDING',
      comment: combinedReason,
      details: `${employee.fullName} submitted ${calculatedDuration}-day leave application [${requestId}] (${ltConfig.name}) from ${sDateString} to ${eDateString}`
    });

    await logEmployeeAudit({
      employeeId,
      action: 'APPLY_LEAVE',
      details: { requestId, leaveType: ltConfig.code, duration: calculatedDuration }
    });

    // 13. Create In-App Notifications
    try {
      if (teamManagerUser) {
        await HRNotification.create({
          recipientUser: teamManagerUser._id,
          recipientRole: 'TEAM_LEAD',
          category: 'LEAVE',
          title: `New Leave Request: ${employee.fullName}`,
          message: `${employee.fullName} submitted a leave request [${requestId}] for ${calculatedDuration} day(s) (${ltConfig.name}). Please review.`,
          severity: 'INFO',
          linkUrl: '/leave-management',
          relatedRecordId: requestId
        });
      }

      await HRNotification.create({
        recipientUser: req.user?._id || null,
        recipientEmployeeId: employeeId,
        category: 'LEAVE',
        title: `Leave Application Submitted: ${requestId}`,
        message: `Your ${ltConfig.name} request [${requestId}] for ${calculatedDuration} day(s) was submitted and routed to Team Manager.`,
        severity: 'INFO',
        linkUrl: '/employee/leave',
        relatedRecordId: requestId
      });
    } catch (notifErr) {
      console.warn('[Notification create warning]:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      applicationId: requestId,
      requestId,
      currentStatus: 'Pending Team Manager Approval',
      leave: leaveRequest,
      leaveRequest
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.applyLeave Error]:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to submit leave application.' });
  }
};

/**
 * POST /api/employee/leave/:id/withdraw
 * Employee withdraws their own pending leave application
 */
const withdrawLeave = async (req, res) => {
  try {
    const employeeId = (req.employeeId || req.user.employeeId).toUpperCase();
    const { id } = req.params;
    const { reason = 'Withdrawn by employee' } = req.body;

    const leave = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { requestId: id }
      ],
      employeeId
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or not owned by you.'
      });
    }

    if (['APPROVED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'].includes(leave.currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw request that is already ${leave.currentStatus}.`
      });
    }

    const prevStatus = leave.currentStatus;
    const nextStatus = 'WITHDRAWN';

    leave.currentStatus = nextStatus;
    leave.status = nextStatus;
    leave.currentApprovalStage = 'Withdrawn by Employee';

    leave.approvalHistory.push({
      step: 'WITHDRAWAL',
      actor: {
        id: req.user?._id || null,
        name: req.user?.name || leave.employeeName,
        email: req.user?.email || '',
        role: 'EMPLOYEE'
      },
      action: 'WITHDRAWN',
      comment: reason,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leave.save();

    // Release reserved pending balance
    const { balanceDoc } = await getOrInitLeaveBalance(leave.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leave.leaveType);
    if (balanceItem && balanceItem.pending > 0) {
      balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leave.duration);
      balanceDoc.markModified('balances');
      await balanceDoc.save().catch(() => {});
    }

    await logLeaveActivity({
      req,
      leaveRequest: leave,
      actor: req.user,
      action: 'WITHDRAW',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: reason,
      details: `${req.user?.name || leave.employeeName} withdrew leave request [${leave.requestId}]`
    });

    return res.status(200).json({
      success: true,
      message: 'Leave application withdrawn successfully.',
      leave
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.withdrawLeave Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to withdraw leave request.' });
  }
};

/**
 * PUT/POST /api/employee/leave/:id/cancel
 * Cancel own leave application
 */
const cancelLeave = async (req, res) => {
  try {
    const employeeId = (req.employeeId || req.user.employeeId).toUpperCase();
    const { id } = req.params;
    const { reason = 'Cancelled by employee' } = req.body;

    const leave = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { requestId: id }
      ],
      employeeId
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or not owned by you.'
      });
    }

    if (['REJECTED', 'CANCELLED', 'WITHDRAWN'].includes(leave.currentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave application that is already ${leave.currentStatus}.`
      });
    }

    const prevStatus = leave.currentStatus;
    const nextStatus = 'CANCELLED';

    leave.currentStatus = nextStatus;
    leave.status = nextStatus;
    leave.currentApprovalStage = 'Cancelled';

    leave.approvalHistory.push({
      step: 'CANCELLATION',
      actor: {
        id: req.user?._id || null,
        name: req.user?.name || leave.employeeName,
        email: req.user?.email || '',
        role: 'EMPLOYEE'
      },
      action: 'CANCELLED',
      comment: reason,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    await leave.save();

    // Restore balance: If it was approved, reverse used balance. If pending, reverse pending balance.
    const { balanceDoc } = await getOrInitLeaveBalance(leave.employeeId, 2026);
    const balanceItem = balanceDoc.balances.find(b => b.leaveType === leave.leaveType);
    if (balanceItem) {
      if (prevStatus === 'APPROVED') {
        balanceItem.used = Math.max(0, (balanceItem.used || 0) - leave.duration);
      } else {
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leave.duration);
      }
      balanceDoc.recalculate();
      balanceDoc.markModified('balances');
      await balanceDoc.save().catch(() => {});
    }

    await logLeaveActivity({
      req,
      leaveRequest: leave,
      actor: req.user,
      action: 'CANCEL',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: reason,
      details: `${req.user?.name || leave.employeeName} cancelled leave [${leave.requestId}]`
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
      leave
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.cancelLeave Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel leave request.' });
  }
};

/**
 * DELETE /api/employee/leave/:id
 * Permanently delete / cancel leave request and restore balance
 */
const deleteLeave = async (req, res) => {
  try {
    const employeeId = (req.employeeId || req.user.employeeId).toUpperCase();
    const { id } = req.params;

    const leave = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { requestId: id }
      ],
      employeeId
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found or not owned by you.'
      });
    }

    const prevStatus = leave.currentStatus;

    // Restore balance if it was approved or pending
    const { balanceDoc } = await getOrInitLeaveBalance(leave.employeeId, 2026);
    const balanceItem = balanceDoc?.balances?.find(b => b.leaveType === leave.leaveType);
    if (balanceItem) {
      if (prevStatus === 'APPROVED') {
        balanceItem.used = Math.max(0, (balanceItem.used || 0) - leave.duration);
      } else {
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leave.duration);
      }
      balanceDoc.recalculate();
      balanceDoc.markModified('balances');
      await balanceDoc.save().catch(() => {});
    }

    await LeaveRequest.deleteOne({ _id: leave._id });

    await logLeaveActivity({
      req,
      leaveRequest: leave,
      actor: req.user,
      action: 'DELETE',
      previousStatus: prevStatus,
      newStatus: 'DELETED',
      comment: 'Permanently deleted by employee',
      details: `${req.user?.name || leave.employeeName} deleted leave request [${leave.requestId}]`
    });

    return res.status(200).json({
      success: true,
      message: `Leave request [${leave.requestId}] deleted successfully and balance restored.`
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.deleteLeave Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete leave request.' });
  }
};

/**
 * POST /api/employee/leave/upload-document
 * Uploads supporting certificate/medical proof (PDF/JPG/PNG <= 10MB)
 */
const uploadLeaveDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No document file uploaded.' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: {
        documentName: req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date()
      }
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.uploadLeaveDocument Error]:', err);
    return res.status(500).json({ success: false, message: 'Document upload failed.' });
  }
};

/**
 * GET /api/employee/leave/team (For Team Lead / Manager)
 */
const getTeamLeaves = async (req, res) => {
  try {
    const role = req.employeeRole || req.user?.role;
    const isManager = ['TEAM_LEAD', 'MANAGER', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DIRECTOR', 'SUPER_ADMIN'].includes(role);

    if (!isManager) {
      return res.status(403).json({ success: false, message: 'Only Team Leads and Managers can view team leaves.' });
    }

    const employee = req.employee;
    let allowedIds = [];

    if (employee?.teamStructure) {
      const directReports = (employee.teamStructure.directReports || []).map(id => id.toUpperCase());
      const teamMembers = (employee.teamStructure.teamMembers || []).map(id => id.toUpperCase());
      allowedIds = [...new Set([...directReports, ...teamMembers])];
    }

    const query = {};
    if (allowedIds.length > 0) {
      query.employeeId = { $in: allowedIds };
    } else if (employee?.departmentName || employee?.department) {
      query.department = employee.departmentName || employee.department;
    }

    const teamLeaves = await LeaveRequest.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves: teamLeaves });
  } catch (err) {
    console.error('[EmployeeLeaveController.getTeamLeaves Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to load team leaves.' });
  }
};

/**
 * PUT/POST /api/employee/leave/team/:id/action
 * Team Lead / Manager review: APPROVE, REJECT, RETURN FOR CORRECTION
 */
const approveRejectTeamLeave = async (req, res) => {
  try {
    const role = req.employeeRole || req.user?.role;
    const isManager = ['TEAM_LEAD', 'MANAGER', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DIRECTOR', 'SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER'].includes(role);

    if (!isManager) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Manager role required.' });
    }

    const { id } = req.params;
    const { action, comments, reason } = req.body; // 'APPROVE', 'REJECT', or 'RETURN'
    const note = comments || reason || '';

    const leave = await LeaveRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { requestId: id }
      ]
    });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const prevStatus = leave.currentStatus;
    let nextStatus = '';
    let actionVerb = '';

    if (action === 'APPROVE') {
      nextStatus = 'DEPARTMENT_MANAGER_PENDING';
      actionVerb = 'APPROVED';
      leave.teamManagerActionAt = new Date();
      leave.currentApprovalStage = 'Department Head Review';
    } else if (action === 'REJECT') {
      if (!note.trim()) {
        return res.status(400).json({ success: false, message: 'A documented rejection reason is mandatory.' });
      }
      nextStatus = 'TEAM_MANAGER_REJECTED';
      actionVerb = 'REJECTED';
      leave.rejectionReason = note;
      leave.teamManagerActionAt = new Date();
      leave.currentApprovalStage = 'Application Rejected';

      // Release reserved pending balance
      const { balanceDoc } = await getOrInitLeaveBalance(leave.employeeId, 2026);
      const balanceItem = balanceDoc.balances.find(b => b.leaveType === leave.leaveType);
      if (balanceItem && balanceItem.pending > 0) {
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leave.duration);
        balanceDoc.markModified('balances');
        await balanceDoc.save().catch(() => {});
      }
    } else if (action === 'RETURN') {
      if (!note.trim()) {
        return res.status(400).json({ success: false, message: 'A correction message is mandatory when returning an application.' });
      }
      nextStatus = 'RETURNED_FOR_CORRECTION';
      actionVerb = 'RETURNED';
      leave.currentApprovalStage = 'Returned for Correction';

      // Release pending balance while in correction
      const { balanceDoc } = await getOrInitLeaveBalance(leave.employeeId, 2026);
      const balanceItem = balanceDoc.balances.find(b => b.leaveType === leave.leaveType);
      if (balanceItem && balanceItem.pending > 0) {
        balanceItem.pending = Math.max(0, (balanceItem.pending || 0) - leave.duration);
        balanceDoc.markModified('balances');
        await balanceDoc.save().catch(() => {});
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action. Expected APPROVE, REJECT, or RETURN.' });
    }

    leave.currentStatus = nextStatus;
    leave.status = nextStatus;

    leave.approvalHistory.push({
      step: 'TEAM_MANAGER',
      actor: {
        id: req.user?._id || null,
        name: req.user?.name || 'Team Manager',
        email: req.user?.email || '',
        role: role || 'MANAGER'
      },
      action: actionVerb,
      comment: note,
      previousStatus: prevStatus,
      newStatus: nextStatus,
      timestamp: new Date()
    });

    leave.approvals.push({
      step: 'TEAM_MANAGER',
      approverName: req.user?.name || 'Team Manager',
      action: actionVerb,
      comment: note,
      actionDate: new Date()
    });

    await leave.save();

    await logLeaveActivity({
      req,
      leaveRequest: leave,
      actor: req.user,
      action: actionVerb === 'APPROVED' ? 'APPROVE' : actionVerb === 'REJECTED' ? 'REJECT' : 'RETURN',
      previousStatus: prevStatus,
      newStatus: nextStatus,
      comment: note,
      details: `Team Manager ${req.user?.name} ${actionVerb.toLowerCase()} leave [${leave.requestId}] for ${leave.employeeName}.`
    });

    // Notify employee of manager decision
    try {
      await HRNotification.create({
        recipientEmployeeId: leave.employeeId,
        category: 'LEAVE',
        title: `Leave Application Update: ${leave.requestId}`,
        message: `Your leave request [${leave.requestId}] was ${actionVerb.toLowerCase()} by Team Manager (${req.user?.name}). ${note ? `Note: "${note}"` : ''}`,
        severity: action === 'REJECT' ? 'WARNING' : 'INFO',
        linkUrl: '/employee/leave',
        relatedRecordId: leave.requestId
      });
    } catch {}

    return res.status(200).json({
      success: true,
      message: `Leave application ${actionVerb.toLowerCase()} successfully.`,
      leave
    });
  } catch (err) {
    console.error('[EmployeeLeaveController.approveRejectTeamLeave Error]:', err);
    return res.status(500).json({ success: false, message: 'Error processing team leave decision.' });
  }
};

module.exports = {
  getLeaveTypes,
  getHolidays,
  calculateWorkingDays,
  getLeaveBalances,
  getEmployeeLeaveLedger,
  getLeaveRequests,
  getLeaveById,
  applyLeave,
  withdrawLeave,
  cancelLeave,
  deleteLeave,
  uploadLeaveDocument,
  getTeamLeaves,
  approveRejectTeamLeave
};
