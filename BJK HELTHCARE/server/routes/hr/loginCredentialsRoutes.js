const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../../middleware/auth');
const {
  getLoginCredentials,
  getLoginStats,
  getLoginCredentialsById,
  createLoginCredentials,
  updateLoginCredentials,
  updateAccessPermissions,
  resetPassword,
  toggleAccountStatus,
  bulkUpdateAccess,
  getRoleTemplates,
  getEmployeeAccessAudit,
  downloadCredentialWorkbook,
  syncGeneratedCredentials
} = require('../../controllers/loginCredentialsController');

// Allow bearer token in query parameter for browser downloads, then enforce strict auth
const allowQueryToken = (req, res, next) => {
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
};

// Excel Download & Internal / Admin Credential Sync (strictly requires authentication and SUPER_ADMIN or HR_ADMIN role)
router.get('/download-excel', allowQueryToken, protect, requireRole('SUPER_ADMIN', 'HR_ADMIN'), downloadCredentialWorkbook);
router.post('/sync-generated', protect, requireRole('SUPER_ADMIN', 'HR_ADMIN'), syncGeneratedCredentials);

// All credential management routes require authentication and HR/Admin privileges
router.use(protect);
router.use(requireRole(
  'SUPER_ADMIN',
  'DIRECTOR',
  'HR_ADMIN',
  'HR_MANAGER',
  'IT_ADMIN',
  'SYSTEM_ADMINISTRATOR'
));

// Stats & Templates
router.get('/stats', getLoginStats);
router.get('/templates', getRoleTemplates);

// Bulk Operations
router.post('/bulk', bulkUpdateAccess);

// Collection operations
router.get('/', getLoginCredentials);
router.post('/', createLoginCredentials);

// Single User Credential & Access operations
router.get('/:id', getLoginCredentialsById);
router.put('/:id', updateLoginCredentials);
router.put('/:id/permissions', updateAccessPermissions);
router.put('/:id/access', updateAccessPermissions);
router.post('/:id/reset-password', resetPassword);
router.post('/:id/status', toggleAccountStatus);
router.patch('/:id/status', toggleAccountStatus);
router.get('/:id/audit', getEmployeeAccessAudit);

module.exports = router;
