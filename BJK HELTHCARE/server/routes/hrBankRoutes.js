const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/rbac');
const { ROLES, PERMISSIONS } = require('../config/rbac');
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

// Allowed HR roles helper middleware
const allowHRBankAccess = (req, res, next) => {
  const role = (req.user?.role || '').toUpperCase();
  const allowed = [
    ROLES.SUPER_ADMIN,
    ROLES.DIRECTOR,
    ROLES.HR_ADMIN,
    ROLES.HR_MANAGER,
    ROLES.HR_EXECUTIVE,
    ROLES.PAYROLL_ADMIN,
    ROLES.FINANCE_MANAGER,
    'ADMIN',
    'HR'
  ];

  if (allowed.includes(role)) {
    return next();
  }

  // Check custom permission
  if (req.user?.permissions?.includes('bank_details:view') || req.user?.permissions?.includes('*')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires authorized HR or Administrator privileges for employee bank records.'
  });
};

router.use(allowHRBankAccess);

// 1. Directory and search
router.get('/', getHRBankDetailsList);

// 2. Specific employee details
router.get('/:employeeId', getHRBankDetailsByEmployeeId);

// 3. HR edit
router.put('/:employeeId', updateHRBankDetailsByEmployeeId);

// 4. Verification actions
router.post('/:employeeId/verify', verifyHRBankDetails);
router.post('/:employeeId/reject', rejectHRBankDetails);
router.post('/:employeeId/request-correction', requestCorrectionHRBankDetails);

module.exports = router;
