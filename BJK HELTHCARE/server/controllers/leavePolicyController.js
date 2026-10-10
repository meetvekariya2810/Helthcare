const mongoose = require('mongoose');
const {
  CompOffWorkAuthorization,
  CompOffCredit,
  LeaveBlackoutPeriod,
  DepartmentStaffingThreshold,
  LeaveRefresherTraining,
  MedicalFitnessRecord,
  LeaveEncashmentRequest,
  LeaveRegularizationRequest,
  LeaveGrievance,
  PolicyClarification,
  LeaveType,
  LeaveRequest,
  LeaveBalance,
  LeaveActivity
} = require('../models/hrms/Leave');
const Employee = require('../models/hrms/Employee');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const {
  initLeavePolicyEngine,
  determineApprovalHierarchy,
  validateLeaveApplicationRules,
  deductCompOffCredits,
  reconcileYearEndBalances,
  calculateLOPDeduction,
  BJK_POLICY_001_LEAVE_TYPES,
  DEFAULT_POLICY_CLARIFICATIONS
} = require('../services/hrms/leavePolicyService');

// ==============================================================================
// 1. POLICY CONFIGURATION & CLARIFICATION REGISTER CONTROLLERS
// ==============================================================================

// GET /api/leave/policy-config
const getPolicyConfig = async (req, res) => {
  try {
    await initLeavePolicyEngine();
    const leaveTypes = await LeaveType.find({ isActive: true }).sort({ name: 1 });
    const clarifications = await PolicyClarification.find().sort({ createdAt: 1 });

    const documentControl = {
      policyTitle: 'Leave Policy',
      policyNumber: 'BJK-HR-POL-001',
      version: '1.0',
      effectiveDate: '01 April 2026',
      nextReviewDate: '01 April 2027',
      policyOwner: 'Head – Human Resources',
      draftedBy: 'HR Department',
      reviewedBy: 'Legal Counsel / Compliance Officer',
      approvedBy: 'Managing Director',
      classification: 'Internal – All Employees',
      preparedBy: 'Krutika Parmar (HR Manager)',
      approvalSignatures: {
        hrManager: 'Krutika Parmar',
        managingDirector: 'Haresh Kimbhani'
      }
    };

    res.json({
      success: true,
      documentControl,
      leaveTypes,
      clarifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/policy-clarifications
const getPolicyClarifications = async (req, res) => {
  try {
    const clarifications = await PolicyClarification.find().sort({ createdAt: 1 });
    res.json({ success: true, count: clarifications.length, clarifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/policy-clarifications/:itemKey
const updatePolicyClarification = async (req, res) => {
  try {
    const { itemKey } = req.params;
    const { interimRule, activeRuleValue, reviewStatus, approvedDecision, notes } = req.body;

    const clarification = await PolicyClarification.findOneAndUpdate(
      { itemKey: itemKey.toUpperCase() },
      {
        $set: {
          ...(interimRule && { interimRule }),
          ...(activeRuleValue && { activeRuleValue }),
          ...(reviewStatus && { reviewStatus }),
          ...(approvedDecision && { approvedDecision }),
          ...(notes && { notes }),
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!clarification) {
      return res.status(404).json({ success: false, message: 'Clarification item not found.' });
    }

    await AuditLog.logAction({
      user: req.user,
      action: 'UPDATE_POLICY_CLARIFICATION',
      module: 'HRMS_LEAVE',
      resource: 'PolicyClarification',
      resourceId: itemKey,
      newData: clarification.toObject(),
      details: `Updated Policy Clarification [${itemKey}]: Status -> ${clarification.reviewStatus}`
    });

    res.json({ success: true, message: 'Clarification rule updated successfully.', clarification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 2. COMP-OFF MANAGEMENT CONTROLLERS
// ==============================================================================

// GET /api/leave/comp-off/authorizations
const getCompOffAuthorizations = async (req, res) => {
  try {
    const { employeeCode, status, department } = req.query;
    const query = {};

    if (employeeCode) query.employeeCode = employeeCode.toUpperCase();
    if (status && status !== 'ALL') query.status = status;
    if (department && department !== 'ALL') query.department = department;

    const authorizations = await CompOffWorkAuthorization.find(query).sort({ workDate: -1 });
    res.json({ success: true, count: authorizations.length, authorizations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/comp-off/authorizations (Submit advance request)
const createCompOffAuthorization = async (req, res) => {
  try {
    const {
      employeeCode,
      workDate,
      workType = 'WEEKLY_OFF',
      plannedHours,
      businessJustification,
      requestedBy = 'EMPLOYEE'
    } = req.body;

    const targetCode = (employeeCode || req.user?.employeeId || '').toUpperCase();
    const employee = await Employee.findOne({
      $or: [{ employeeId: targetCode }, { employeeCode: targetCode }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee record [${targetCode}] not found.` });
    }

    const wDate = new Date(workDate);
    if (isNaN(wDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid proposed work date.' });
    }

    const hours = Number(plannedHours) || 8;
    // Policy Section 8.2: 1 day for qualifying full day, 0.5 day for 4 hours
    const creditEligible = hours >= 8 ? 1.0 : 0.5;

    const authorization = await CompOffWorkAuthorization.create({
      employee: employee._id,
      employeeCode: employee.employeeId || targetCode,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      facility: employee.facilityName || 'Chhatral Formulation Plant',
      workDate: wDate,
      workDateString: wDate.toISOString().split('T')[0],
      workType,
      plannedHours: hours,
      creditEligible,
      businessJustification,
      requestedBy,
      status: 'PENDING_RM'
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'CREATE_COMPOFF_PREAUTH',
      module: 'HRMS_LEAVE',
      resource: 'CompOffWorkAuthorization',
      resourceId: authorization.authorizationId,
      newData: authorization.toObject(),
      details: `Submitted Comp-Off advance work authorization for ${employee.fullName} on ${authorization.workDateString}`
    });

    res.status(201).json({
      success: true,
      message: 'Comp-Off advance authorization submitted for Reporting Manager review.',
      authorization
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/comp-off/authorizations/:id/approve-rm
const approveCompOffByRM = async (req, res) => {
  try {
    const { remarks = '', approved = true } = req.body;
    const auth = await CompOffWorkAuthorization.findById(req.params.id);

    if (!auth) {
      return res.status(404).json({ success: false, message: 'Work authorization not found.' });
    }

    auth.reportingManagerApproval = {
      approved: !!approved,
      approverId: req.user?._id,
      approverName: req.user?.name || 'Reporting Manager',
      actionDate: new Date(),
      remarks
    };

    auth.status = approved ? 'PENDING_HR' : 'REJECTED';
    await auth.save();

    res.json({
      success: true,
      message: approved ? 'Reporting Manager approved. Routed to Head – HR.' : 'Comp-Off request rejected by manager.',
      authorization: auth
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/comp-off/authorizations/:id/approve-hr
const approveCompOffByHR = async (req, res) => {
  try {
    const { remarks = '', approved = true } = req.body;
    const auth = await CompOffWorkAuthorization.findById(req.params.id);

    if (!auth) {
      return res.status(404).json({ success: false, message: 'Work authorization not found.' });
    }

    auth.hrApproval = {
      approved: !!approved,
      approverId: req.user?._id,
      approverName: req.user?.name || 'Head – HR',
      actionDate: new Date(),
      remarks
    };

    auth.status = approved ? 'PRE_APPROVED' : 'REJECTED';
    await auth.save();

    res.json({
      success: true,
      message: approved ? 'Pre-approval granted by Head – HR. Employee authorized for extra work.' : 'Comp-Off request rejected by HR.',
      authorization: auth
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/comp-off/authorizations/:id/verify-work (Verify work done & grant credit with 90-day expiry)
const verifyCompOffWorkAndGrantCredit = async (req, res) => {
  try {
    const { actualHoursWorked, remarks = '' } = req.body;
    const auth = await CompOffWorkAuthorization.findById(req.params.id);

    if (!auth) {
      return res.status(404).json({ success: false, message: 'Work authorization not found.' });
    }

    const actualHours = Number(actualHoursWorked) || auth.plannedHours;
    const creditDays = actualHours >= 8 ? 1.0 : 0.5;

    const earnedDate = new Date(auth.workDate);
    const expiryDate = new Date(earnedDate);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days expiration strictly as per Policy 8.3 & 8.4

    // Create Comp-Off Credit Record
    const credit = await CompOffCredit.create({
      employee: auth.employee,
      employeeCode: auth.employeeCode,
      employeeName: auth.employeeName,
      department: auth.department,
      workAuthorization: auth._id,
      workDate: auth.workDate,
      creditDays,
      earnedDate,
      expiryDate,
      usedDays: 0,
      remainingDays: creditDays,
      status: 'ACTIVE',
      hrApprovedBy: {
        id: req.user?._id,
        name: req.user?.name || 'HR Admin',
        timestamp: new Date()
      },
      remarks: remarks || `Verified ${actualHours} hrs extra work on ${auth.workDateString}. Credit valid for 90 days.`
    });

    auth.workCompletionVerified = {
      verified: true,
      verifiedBy: req.user?.name || 'HR Admin',
      verifiedAt: new Date(),
      actualHoursWorked: actualHours,
      remarks
    };
    auth.creditedCreditId = credit._id;
    auth.status = 'CREDITED';
    await auth.save();

    // Also update employee's LeaveBalance for COMP_OFF
    const balanceDoc = await LeaveBalance.findOne({
      employeeId: auth.employeeCode,
      leaveYear: 2026
    });

    if (balanceDoc) {
      const coItem = balanceDoc.balances.find(b => b.leaveType === 'COMP_OFF' || b.leaveType === 'COMPENSATORY_OFF');
      if (coItem) {
        coItem.allocated += creditDays;
        coItem.available += creditDays;
        coItem.lastUpdated = new Date();
      } else {
        balanceDoc.balances.push({
          leaveType: 'COMPENSATORY_OFF',
          leaveTypeName: 'Compensatory Off (Comp-Off)',
          openingBalance: 0,
          allocated: creditDays,
          carriedForward: 0,
          adjusted: 0,
          used: 0,
          pending: 0,
          available: creditDays,
          lastUpdated: new Date()
        });
      }

      balanceDoc.history.push({
        leaveType: 'COMPENSATORY_OFF',
        previousAvailable: coItem ? (coItem.available - creditDays) : 0,
        adjustedBy: creditDays,
        newAvailable: coItem ? coItem.available : creditDays,
        reason: `Earned ${creditDays} day Comp-Off credit for work on ${auth.workDateString} (Expires ${expiryDate.toISOString().split('T')[0]})`,
        actor: {
          id: req.user?._id,
          name: req.user?.name || 'HR Admin',
          role: req.user?.role || 'HR_ADMIN'
        },
        timestamp: new Date()
      });

      await balanceDoc.save();
    }

    res.json({
      success: true,
      message: `Verified and credited ${creditDays} Comp-Off day(s). Credit active and expires on ${expiryDate.toISOString().split('T')[0]} (90 days).`,
      credit,
      authorization: auth
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/comp-off/credits
const getCompOffCredits = async (req, res) => {
  try {
    const { employeeCode, status, department } = req.query;
    const query = {};
    if (employeeCode) query.employeeCode = employeeCode.toUpperCase();
    if (status && status !== 'ALL') query.status = status;
    if (department && department !== 'ALL') query.department = department;

    const credits = await CompOffCredit.find(query).sort({ expiryDate: 1 });
    const now = new Date();

    // Auto update expired status on read
    for (const c of credits) {
      if (c.checkExpiry(now)) {
        await c.save();
      }
    }

    res.json({ success: true, count: credits.length, credits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 3. PHARMACEUTICAL & GMP WORKFORCE CONTROLS CONTROLLERS
// ==============================================================================

// GET /api/leave/gmp/blackout-periods
const getBlackoutPeriods = async (req, res) => {
  try {
    const blackouts = await LeaveBlackoutPeriod.find().sort({ startDate: 1 });
    res.json({ success: true, count: blackouts.length, blackouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/gmp/blackout-periods
const createBlackoutPeriod = async (req, res) => {
  try {
    const {
      title,
      facility = 'ALL',
      department = 'ALL',
      startDate,
      endDate,
      reason,
      notificationDaysInAdvance = 30
    } = req.body;

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    const notifDate = new Date();

    const blackout = await LeaveBlackoutPeriod.create({
      title,
      facility,
      department,
      startDate: sDate,
      endDate: eDate,
      startDateString: sDate.toISOString().split('T')[0],
      endDateString: eDate.toISOString().split('T')[0],
      notificationDate: notifDate,
      notificationDaysInAdvance: Number(notificationDaysInAdvance) || 30,
      reason,
      declaredBy: req.user?.name || 'Plant Operations / HR',
      emergencyExceptionsAllowed: true,
      isActive: true
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'CREATE_BLACKOUT_PERIOD',
      module: 'HRMS_LEAVE',
      resource: 'LeaveBlackoutPeriod',
      resourceId: blackout.periodId,
      newData: blackout.toObject(),
      details: `Declared Leave Blackout Period [${title}] from ${blackout.startDateString} to ${blackout.endDateString}`
    });

    res.status(201).json({ success: true, message: 'Leave Blackout Period declared.', blackout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/leave/gmp/blackout-periods/:id
const deleteBlackoutPeriod = async (req, res) => {
  try {
    await LeaveBlackoutPeriod.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blackout period removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/gmp/staffing-thresholds
const getStaffingThresholds = async (req, res) => {
  try {
    const thresholds = await DepartmentStaffingThreshold.find().sort({ department: 1 });
    res.json({ success: true, count: thresholds.length, thresholds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/gmp/staffing-thresholds/:department
const updateStaffingThreshold = async (req, res) => {
  try {
    const { department } = req.params;
    const { minStaffCount, minStaffPercentage, criticalRoles, maxSimultaneousLeaves } = req.body;

    const threshold = await DepartmentStaffingThreshold.findOneAndUpdate(
      { department: department.toUpperCase() },
      {
        $set: {
          ...(minStaffCount !== undefined && { minStaffCount }),
          ...(minStaffPercentage !== undefined && { minStaffPercentage }),
          ...(criticalRoles && { criticalRoles }),
          ...(maxSimultaneousLeaves !== undefined && { maxSimultaneousLeaves })
        }
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Department staffing threshold updated.', threshold });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/gmp/refresher-trainings
const getRefresherTrainings = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (department && department !== 'ALL') query.department = department;

    const trainings = await LeaveRefresherTraining.find(query).sort({ returnDate: -1 });
    res.json({ success: true, count: trainings.length, trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/gmp/refresher-trainings/:id/verify
const verifyRefresherTraining = async (req, res) => {
  try {
    const { certificateDocUrl, remarks = '' } = req.body;
    const training = await LeaveRefresherTraining.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Refresher training record not found.' });
    }

    training.status = 'VERIFIED_BY_QA';
    training.completedDate = new Date();
    training.qaVerifierName = req.user?.name || 'QA Head';
    training.qaVerifiedAt = new Date();
    if (certificateDocUrl) training.certificateDocUrl = certificateDocUrl;
    training.remarks = remarks;
    await training.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'VERIFY_GMP_REFRESHER_TRAINING',
      module: 'HRMS_LEAVE',
      resource: 'LeaveRefresherTraining',
      resourceId: training.trainingId,
      newData: training.toObject(),
      details: `QA verified GMP re-qualification for ${training.employeeName} following 30+ days leave.`
    });

    res.json({ success: true, message: 'GMP Refresher Training verified. Employee re-qualified for cleanroom duties.', training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/gmp/medical-fitness
const getMedicalFitnessRecords = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (department && department !== 'ALL') query.department = department;

    const records = await MedicalFitnessRecord.find(query).sort({ issueDate: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/gmp/medical-fitness/:id/verify
const verifyMedicalFitnessRecord = async (req, res) => {
  try {
    const { remarks = '', approved = true } = req.body;
    const record = await MedicalFitnessRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical fitness record not found.' });
    }

    record.status = approved ? 'VERIFIED_BY_HR' : 'REJECTED';
    record.verifiedBy = {
      id: req.user?._id,
      name: req.user?.name || 'Head – HR',
      timestamp: new Date(),
      remarks
    };
    await record.save();

    await AuditLog.logAction({
      user: req.user,
      action: 'VERIFY_MEDICAL_FITNESS',
      module: 'HRMS_LEAVE',
      resource: 'MedicalFitnessRecord',
      resourceId: record.recordId,
      newData: record.toObject(),
      details: `HR verified fitness-to-resume certificate for ${record.employeeName} (${record.status})`
    });

    res.json({
      success: true,
      message: approved ? 'Medical Fitness verified. Employee authorized to resume manufacturing/QC duties.' : 'Medical certificate rejected.',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 4. LEAVE ENCASHMENT & REGULARIZATION CONTROLLERS
// ==============================================================================

// GET /api/leave/encashment
const getEncashmentRequests = async (req, res) => {
  try {
    const { employeeCode, status } = req.query;
    const query = {};
    if (employeeCode) query.employeeCode = employeeCode.toUpperCase();
    if (status && status !== 'ALL') query.status = status;

    const requests = await LeaveEncashmentRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/encashment (Submit encashment request)
const createEncashmentRequest = async (req, res) => {
  try {
    const {
      employeeCode,
      requestedDays,
      encashmentType = 'ANNUAL_DECEMBER',
      basicSalary = 25000
    } = req.body;

    const targetCode = (employeeCode || req.user?.employeeId || '').toUpperCase();
    const employee = await Employee.findOne({
      $or: [{ employeeId: targetCode }, { employeeCode: targetCode }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const { balanceDoc } = await require('../services/hrms/leaveService').getOrInitLeaveBalance(targetCode, 2026);
    const elItem = balanceDoc.balances.find(b => b.leaveType === 'EARNED_LEAVE');
    const availableEL = elItem ? elItem.available : 0;

    const reqDays = Number(requestedDays);

    // Policy Section 12.1 Rules:
    // 1. Max 10 days per year
    // 2. Minimum 20 days retained balance after encashment
    if (encashmentType === 'ANNUAL_DECEMBER') {
      if (reqDays > 10) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10 days of Earned Leave may be encashed per year in December (Policy Section 12.1).'
        });
      }
      if (availableEL - reqDays < 20) {
        return res.status(400).json({
          success: false,
          message: `Minimum 20 days EL balance must be retained after encashment. Available: ${availableEL}, Requested: ${reqDays}, Remaining would be: ${availableEL - reqDays} (Policy Section 12.1).`
        });
      }
    }

    const basic = Number(basicSalary) || Number(employee.salaryStructure?.basicSalary) || 25000;
    const calculatedAmount = Math.round(((basic / 30) * reqDays) * 100) / 100;

    const encashment = await LeaveEncashmentRequest.create({
      employee: employee._id,
      employeeCode: targetCode,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      encashmentType,
      currentELBalance: availableEL,
      requestedDays: reqDays,
      retainedBalance: availableEL - reqDays,
      basicSalary: basic,
      calculatedEncashmentAmount: calculatedAmount,
      status: 'SUBMITTED'
    });

    res.status(201).json({
      success: true,
      message: 'Leave encashment request submitted for HR and Management approval.',
      encashment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/encashment/:id/approve
const approveEncashmentRequest = async (req, res) => {
  try {
    const { remarks = '', approved = true } = req.body;
    const encashment = await LeaveEncashmentRequest.findById(req.params.id);

    if (!encashment) {
      return res.status(404).json({ success: false, message: 'Encashment request not found.' });
    }

    encashment.hrApprovedBy = {
      name: req.user?.name || 'Head – HR',
      actionDate: new Date(),
      remarks
    };

    encashment.status = approved ? 'HR_APPROVED' : 'REJECTED';
    await encashment.save();

    res.json({
      success: true,
      message: approved ? 'Encashment approved by HR. Ready for payroll disbursement.' : 'Encashment rejected.',
      encashment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/leave/regularization
const getRegularizationRequests = async (req, res) => {
  try {
    const { employeeCode, status } = req.query;
    const query = {};
    if (employeeCode) query.employeeCode = employeeCode.toUpperCase();
    if (status && status !== 'ALL') query.status = status;

    const regularizations = await LeaveRegularizationRequest.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: regularizations.length, regularizations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/regularization (Apply for absence regularization - Policy Section 13.4)
const createRegularizationRequest = async (req, res) => {
  try {
    const {
      employeeCode,
      absenceStartDate,
      absenceEndDate,
      absenceDaysCount,
      reasonType,
      explanation,
      supportingDocumentUrl = '',
      requestedConversionType = 'SICK_LEAVE'
    } = req.body;

    const targetCode = (employeeCode || req.user?.employeeId || '').toUpperCase();
    const employee = await Employee.findOne({
      $or: [{ employeeId: targetCode }, { employeeCode: targetCode }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const reg = await LeaveRegularizationRequest.create({
      employee: employee._id,
      employeeCode: targetCode,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      absenceStartDate: new Date(absenceStartDate),
      absenceEndDate: new Date(absenceEndDate),
      absenceDaysCount: Number(absenceDaysCount) || 1,
      reasonType,
      explanation,
      supportingDocumentUrl,
      requestedConversionType,
      status: 'SUBMITTED'
    });

    res.status(201).json({
      success: true,
      message: 'Unauthorized absence regularization request submitted for Head – HR review.',
      regularization: reg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/regularization/:id/approve
const approveRegularizationRequest = async (req, res) => {
  try {
    const { remarks = '', approved = true, finalLeaveTypeGranted = 'SICK_LEAVE' } = req.body;
    const reg = await LeaveRegularizationRequest.findById(req.params.id);

    if (!reg) {
      return res.status(404).json({ success: false, message: 'Regularization request not found.' });
    }

    reg.status = approved ? 'APPROVED' : 'REJECTED';
    reg.hrApprovedBy = {
      name: req.user?.name || 'Head – HR',
      actionDate: new Date(),
      remarks,
      finalLeaveTypeGranted: approved ? finalLeaveTypeGranted : 'LOSS_OF_PAY'
    };
    await reg.save();

    res.json({
      success: true,
      message: approved ? `Absence regularized as ${finalLeaveTypeGranted} with salary deduction excused.` : 'Regularization rejected. Treated as Loss of Pay (LOP).',
      regularization: reg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 5. YEAR-END RECONCILIATION & LOP CALCULATOR
// ==============================================================================

// GET /api/leave/year-end/preview
const previewYearEndReconciliation = async (req, res) => {
  try {
    const { year = 2026 } = req.query;
    const preview = await reconcileYearEndBalances({ year: Number(year), execute: false });
    res.json({ success: true, preview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/year-end/execute (Authorized HR batch execution)
const executeYearEndReconciliationAction = async (req, res) => {
  try {
    const { year = 2026 } = req.body;
    const result = await reconcileYearEndBalances({
      year: Number(year),
      execute: true,
      actor: req.user
    });

    await AuditLog.logAction({
      user: req.user,
      action: 'EXECUTE_YEAR_END_RECONCILIATION',
      module: 'HRMS_LEAVE',
      resource: 'LeaveBalance',
      resourceId: `YEAR_${year}`,
      newData: result,
      details: `Executed official year-end leave balance reconciliation for year ${year}`
    });

    res.json({
      success: true,
      message: `Year-End ${year} reconciliation executed. CL and SL balances lapsed on Dec 31; 50% EL carried forward (capped at 50 days).`,
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/lop/calculate (Pro-rata LOP calculator - Policy Section 13.3)
const calculateLOP = async (req, res) => {
  try {
    const { monthlyGrossSalary, calendarDaysInMonth, lopDays } = req.body;
    const calc = calculateLOPDeduction({ monthlyGrossSalary, calendarDaysInMonth, lopDays });
    res.json({ success: true, calculation: calc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================================================================
// 6. LEAVE GRIEVANCE MECHANISM (Policy Ref: Section 16)
// ==============================================================================

// GET /api/leave/grievances
const getLeaveGrievances = async (req, res) => {
  try {
    const { employeeCode, stage } = req.query;
    const query = {};
    if (employeeCode) query.employeeCode = employeeCode.toUpperCase();
    if (stage && stage !== 'ALL') query.stage = stage;

    const grievances = await LeaveGrievance.find(query).sort({ submissionDate: -1 });
    res.json({ success: true, count: grievances.length, grievances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/leave/grievances (Submit grievance within 10 days of incident)
const createLeaveGrievance = async (req, res) => {
  try {
    const {
      employeeCode,
      incidentDate,
      relatedLeaveRequestId,
      subject,
      description
    } = req.body;

    const targetCode = (employeeCode || req.user?.employeeId || '').toUpperCase();
    const employee = await Employee.findOne({
      $or: [{ employeeId: targetCode }, { employeeCode: targetCode }]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const grievance = await LeaveGrievance.create({
      employee: employee._id,
      employeeCode: targetCode,
      employeeName: employee.fullName,
      department: employee.departmentName || employee.department || 'Operations',
      incidentDate: new Date(incidentDate),
      submissionDate: new Date(),
      relatedLeaveRequestId: relatedLeaveRequestId || '',
      subject,
      description,
      stage: 'STEP_1_HR_SUBMISSION'
    });

    res.status(201).json({
      success: true,
      message: 'Grievance registered. Head – HR will acknowledge within 3 working days (Policy Section 16).',
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/leave/grievances/:id/advance (Step 1 -> Step 2 Investigation -> Step 3 MD Escalation -> Resolved)
const advanceGrievanceStage = async (req, res) => {
  try {
    const { nextStage, remarks = '', resolution = '' } = req.body;
    const grievance = await LeaveGrievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({ success: false, message: 'Grievance not found.' });
    }

    if (nextStage === 'STEP_2_HR_INVESTIGATION') {
      grievance.stage = 'STEP_2_HR_INVESTIGATION';
      grievance.acknowledgedBy = req.user?.name || 'Head – HR';
      grievance.acknowledgedAt = new Date();
      grievance.investigationRemarks = remarks;
      grievance.investigatedBy = req.user?.name || 'Head – HR';
      grievance.investigatedAt = new Date();
    } else if (nextStage === 'STEP_3_MD_ESCALATION') {
      grievance.stage = 'STEP_3_MD_ESCALATION';
      grievance.escalatedToMdAt = new Date();
      grievance.investigationRemarks = remarks;
    } else if (nextStage === 'RESOLVED') {
      grievance.stage = 'RESOLVED';
      grievance.finalResolution = resolution || remarks;
      grievance.resolvedAt = new Date();
      if (req.user?.role === 'DIRECTOR' || req.user?.role === 'SUPER_ADMIN') {
        grievance.mdResolution = resolution || remarks;
        grievance.mdResolvedAt = new Date();
      }
    }

    await grievance.save();

    res.json({
      success: true,
      message: `Grievance transitioned to stage: ${grievance.stage}`,
      grievance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPolicyConfig,
  getPolicyClarifications,
  updatePolicyClarification,
  getCompOffAuthorizations,
  createCompOffAuthorization,
  approveCompOffByRM,
  approveCompOffByHR,
  verifyCompOffWorkAndGrantCredit,
  getCompOffCredits,
  getBlackoutPeriods,
  createBlackoutPeriod,
  deleteBlackoutPeriod,
  getStaffingThresholds,
  updateStaffingThreshold,
  getRefresherTrainings,
  verifyRefresherTraining,
  getMedicalFitnessRecords,
  verifyMedicalFitnessRecord,
  getEncashmentRequests,
  createEncashmentRequest,
  approveEncashmentRequest,
  getRegularizationRequests,
  createRegularizationRequest,
  approveRegularizationRequest,
  previewYearEndReconciliation,
  executeYearEndReconciliationAction,
  calculateLOP,
  getLeaveGrievances,
  createLeaveGrievance,
  advanceGrievanceStage
};
