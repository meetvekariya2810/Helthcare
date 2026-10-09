const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requireRole, requirePermission } = require('../../middleware/rbac');
const { ROLES, PERMISSIONS } = require('../../config/rbac');

const {
  createOrSaveDraft,
  getOnboardingList,
  getOnboardingById,
  updateOnboardingStep,
  submitOnboarding,
  verifyOnboardingStep,
  approveOnboarding,
  rejectOnboarding
} = require('../../controllers/hr/onboardingController');

// All routes require authentication
router.use(protect);

// 1. Onboarding Draft & Pipeline
router.post('/', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE, ROLES.RECRUITER), createOrSaveDraft);
router.get('/', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE, ROLES.RECRUITER), getOnboardingList);
router.get('/:id', getOnboardingById);
router.put('/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.HR_EXECUTIVE, ROLES.RECRUITER), updateOnboardingStep);

// 2. Verification Workflow
router.post('/:id/submit', submitOnboarding);
router.post('/:id/verify-step', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), verifyOnboardingStep);
router.post('/:id/approve', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), approveOnboarding);
router.post('/:id/reject', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), rejectOnboarding);

module.exports = router;
