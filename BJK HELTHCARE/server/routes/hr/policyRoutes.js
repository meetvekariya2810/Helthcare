const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requireRole, requirePermission } = require('../../middleware/rbac');
const { ROLES, PERMISSIONS } = require('../../config/rbac');

const {
  getPolicies,
  getPolicyById,
  getPolicyRules,
  updatePolicyRule,
  acknowledgePolicy,
  getPolicyAcknowledgmentStats,
  getMyPolicyAcknowledgments,
  getExecutiveBrief,
  getDisciplinaryCases,
  createDisciplinaryCase,
  createWhistleblowerReport,
  getPOSHCases,
  createPOSHComplaint,
  getMaternityCases,
  createMaternityCase,
  getSafetyOverview,
  createSafetyIncident,
  getSeparationCases,
  createSeparationCase,
  getGMPShiftHandovers,
  createGMPShiftHandover
} = require('../../controllers/hrms/policyController');

// All policy routes require active token authentication
router.use(protect);

// 1. Executive HR Briefing (Data Truth Principle)
router.get('/brief', getExecutiveBrief);

// 2. Policy Rules Engine (Builder & Inspection)
router.get('/rules', getPolicyRules);
router.put('/rules/:id', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER), updatePolicyRule);

// 3. Policy Acknowledgment Records & Stats
router.get('/acknowledgments/stats', getPolicyAcknowledgmentStats);
router.get('/acknowledgments/my', getMyPolicyAcknowledgments);

// 4. Disciplinary & Whistleblower
router.get('/disciplinary', getDisciplinaryCases);
router.post('/disciplinary', requireRole(ROLES.SUPER_ADMIN, ROLES.DIRECTOR, ROLES.HR_ADMIN, ROLES.HR_MANAGER, ROLES.DEPARTMENT_MANAGER), createDisciplinaryCase);
router.post('/whistleblower', createWhistleblowerReport); // Anonymous or identified

// 5. POSH (Confidential ICC Access Only)
router.get('/posh', getPOSHCases);
router.post('/posh', createPOSHComplaint);

// 6. Maternity & Paternity (BJK-HR-POL-016 / POL-011)
router.get('/maternity', getMaternityCases);
router.post('/maternity', createMaternityCase);

// 7. Health, Safety & Hygiene (Zero Harm - BJK-HR-POL-011)
router.get('/safety', getSafetyOverview);
router.post('/safety/incident', createSafetyIncident);

// 8. Employee Separation & Exit (BJK-HR-POL-010)
router.get('/separation', getSeparationCases);
router.post('/separation', createSeparationCase);

// 9. GMP Shift Handover & Attendance
router.get('/handover', getGMPShiftHandovers);
router.post('/handover', createGMPShiftHandover);

// 10. Master Policy Catalog & Employee Acknowledgment Action
router.get('/', getPolicies);
router.get('/:id', getPolicyById);
router.post('/:id/acknowledge', acknowledgePolicy);

module.exports = router;
