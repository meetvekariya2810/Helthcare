const express = require('express');
const router = express.Router();
const {
  getEmployeePolicies,
  acknowledgePolicy
} = require('../controllers/EmployeePolicyController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getEmployeePolicies);
router.post('/:policyNumber/acknowledge', acknowledgePolicy);

module.exports = router;
