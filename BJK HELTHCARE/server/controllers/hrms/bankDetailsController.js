const bankDetailsService = require('../../services/hrms/bankDetailsService');
const AuditLog = require('../../models/AuditLog');

// ==============================================================================
// EMPLOYEE SELF-SERVICE CONTROLLERS
// Strictly isolates identity from authenticated JWT
// ==============================================================================

/**
 * Get current authenticated employee's bank details
 * GET /api/employee/bank-details
 */
const getMyBankDetails = async (req, res, next) => {
  try {
    const employeeId = req.employee?._id || req.employeeId;
    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: 'Employee authentication required.'
      });
    }

    const bankDetails = await bankDetailsService.getEmployeeBankDetails(employeeId);

    return res.status(200).json({
      success: true,
      data: bankDetails
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Save draft / update current employee's bank details
 * POST /api/employee/bank-details
 * PUT  /api/employee/bank-details
 */
const saveMyBankDetails = async (req, res, next) => {
  try {
    const employeeId = req.employee?._id || req.employeeId;
    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: 'Employee authentication required.'
      });
    }

    const isSubmit = req.body.action === 'SUBMIT' || req.query.submit === 'true';
    const saved = await bankDetailsService.saveOrUpdateEmployeeBankDetails(
      employeeId,
      req.body,
      req.user,
      isSubmit
    );

    return res.status(200).json({
      success: true,
      message: isSubmit ? 'Bank details submitted for HR review.' : 'Bank details saved as draft.',
      data: saved
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Submit current employee's bank details for HR review
 * POST /api/employee/bank-details/submit
 */
const submitMyBankDetails = async (req, res, next) => {
  try {
    const employeeId = req.employee?._id || req.employeeId;
    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: 'Employee authentication required.'
      });
    }

    const saved = await bankDetailsService.saveOrUpdateEmployeeBankDetails(
      employeeId,
      req.body,
      req.user,
      true
    );

    return res.status(200).json({
      success: true,
      message: 'Bank details submitted successfully. Verification status is now Pending HR Review.',
      data: saved
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * Live IFSC format validation and branch lookup
 * GET /api/employee/bank-details/lookup-ifsc/:ifsc
 */
const lookupIFSC = async (req, res, next) => {
  try {
    const { ifsc } = req.params;
    const result = await bankDetailsService.lookupIFSC(ifsc);
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// HR / ADMIN CONTROLLERS
// Requires HR authentication and RBAC permissions
// ==============================================================================

/**
 * Get all employees bank details directory list with search, filters and stats
 * GET /api/hr/bank-details
 */
const getHRBankDetailsList = async (req, res, next) => {
  try {
    const result = await bankDetailsService.getHRBankDetailsList(req.query);
    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      statistics: result.statistics
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get specific employee bank details
 * GET /api/hr/bank-details/:employeeId
 */
const getHRBankDetailsByEmployeeId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const bankDetails = await bankDetailsService.getEmployeeBankDetails(employeeId);

    // Audit log HR viewing bank details (Section 15, 40)
    try {
      await AuditLog.create({
        user: {
          id: req.user?._id || null,
          name: req.user?.name || 'HR Admin',
          email: req.user?.email || 'hr@bjkhealthcare.com',
          role: req.user?.role || 'HR_ADMIN'
        },
        action: 'BANK_DETAILS_VIEWED_BY_HR',
        module: 'HRMS',
        resource: 'EmployeeBankDetails',
        resourceId: bankDetails._id ? bankDetails._id.toString() : null,
        recordId: employeeId,
        status: 'SUCCESS',
        details: `HR user ${req.user?.name} accessed bank details for employee ID ${employeeId}.`
      });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      data: bankDetails
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * HR updates employee bank details
 * PUT /api/hr/bank-details/:employeeId
 */
const updateHRBankDetailsByEmployeeId = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const updated = await bankDetailsService.saveOrUpdateEmployeeBankDetails(
      employeeId,
      req.body,
      req.user,
      false
    );

    return res.status(200).json({
      success: true,
      message: 'Bank details updated successfully by HR.',
      data: updated
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * HR Verifies employee bank details
 * POST /api/hr/bank-details/:employeeId/verify
 */
const verifyHRBankDetails = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { remarks } = req.body;
    const verified = await bankDetailsService.hrVerifyBankDetails(
      employeeId,
      req.user,
      remarks || 'Verified by HR'
    );

    return res.status(200).json({
      success: true,
      message: 'Employee bank details verified successfully.',
      data: verified
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * HR Rejects employee bank details
 * POST /api/hr/bank-details/:employeeId/reject
 */
const rejectHRBankDetails = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { remarks } = req.body;
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are mandatory when rejecting bank details.'
      });
    }

    const rejected = await bankDetailsService.hrRejectBankDetails(
      employeeId,
      req.user,
      remarks
    );

    return res.status(200).json({
      success: true,
      message: 'Employee bank details rejected.',
      data: rejected
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * HR Requests Correction on employee bank details
 * POST /api/hr/bank-details/:employeeId/request-correction
 */
const requestCorrectionHRBankDetails = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { remarks } = req.body;
    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are mandatory when requesting correction.'
      });
    }

    const requested = await bankDetailsService.hrRequestCorrection(
      employeeId,
      req.user,
      remarks
    );

    return res.status(200).json({
      success: true,
      message: 'Correction request submitted. Employee has been notified.',
      data: requested
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getMyBankDetails,
  saveMyBankDetails,
  submitMyBankDetails,
  lookupIFSC,
  getHRBankDetailsList,
  getHRBankDetailsByEmployeeId,
  updateHRBankDetailsByEmployeeId,
  verifyHRBankDetails,
  rejectHRBankDetails,
  requestCorrectionHRBankDetails
};
