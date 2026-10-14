const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { ROLES, PERMISSIONS, hasPermission } = require('../config/rbac');
const {
  getHRBankDetailsList,
  getHRBankDetailsByEmployeeId,
  updateHRBankDetailsByEmployeeId,
  verifyHRBankDetails,
  rejectHRBankDetails,
  requestCorrectionHRBankDetails
} = require('../controllers/hrms/bankDetailsController');

// All HR Bank Details endpoints require authenticated user session
router.use(protect);

// Allowed HR roles helper middleware (requires at minimum bank_details:view)
const allowHRBankAccess = (req, res, next) => {
  const role = (req.user?.role || '').toUpperCase();
  if (
    hasPermission(role, PERMISSIONS.BANK_DETAILS_VIEW) ||
    req.user?.permissions?.includes(PERMISSIONS.BANK_DETAILS_VIEW) ||
    req.user?.permissions?.includes('*')
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires authorized HR or Administrator privileges for employee bank records.'
  });
};

router.use(allowHRBankAccess);

// 1. Directory and search
router.get('/', requirePermission(PERMISSIONS.BANK_DETAILS_VIEW), getHRBankDetailsList);

// 2. Specific employee details
router.get('/:employeeId', requirePermission(PERMISSIONS.BANK_DETAILS_VIEW), getHRBankDetailsByEmployeeId);

// 3. HR edit
router.put('/:employeeId', requirePermission(PERMISSIONS.BANK_DETAILS_MANAGE), updateHRBankDetailsByEmployeeId);

// 4. Verification actions
router.post('/:employeeId/verify', requirePermission(PERMISSIONS.BANK_DETAILS_VERIFY), verifyHRBankDetails);
router.post('/:employeeId/reject', requirePermission(PERMISSIONS.BANK_DETAILS_VERIFY), rejectHRBankDetails);
router.post('/:employeeId/request-correction', requirePermission(PERMISSIONS.BANK_DETAILS_MANAGE), requestCorrectionHRBankDetails);

module.exports = router;
