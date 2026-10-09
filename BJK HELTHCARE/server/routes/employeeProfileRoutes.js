const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updatePersonal,
  updatePhoto,
  updateEmergency,
  updateFamily,
  updateEducation,
  updateExperience,
  updateNominees,
  getBusinessCard,
  getMyIdCard
} = require('../controllers/EmployeeProfileController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getMyProfile);
router.get('/id-card', getMyIdCard);
router.put('/personal', updatePersonal);
router.put('/photo', updatePhoto);
router.put('/emergency', updateEmergency);
router.put('/family', updateFamily);
router.put('/education', updateEducation);
router.put('/experience', updateExperience);
router.put('/nominees', updateNominees);
router.get('/business-card', getBusinessCard);

module.exports = router;

