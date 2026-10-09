const express = require('express');
const router = express.Router();
const {
  getEmployeeTrainings,
  getEmployeeCompliance,
  startTraining,
  completeTraining,
  getCertificate
} = require('../controllers/EmployeeTrainingController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getEmployeeTrainings);
router.get('/compliance', getEmployeeCompliance);
router.post('/:id/start', startTraining);
router.post('/:id/complete', completeTraining);
router.get('/:id/certificate', getCertificate);

module.exports = router;
