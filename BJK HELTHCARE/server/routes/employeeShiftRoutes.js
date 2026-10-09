const express = require('express');
const router = express.Router();
const {
  getEmployeeShift,
  requestShiftSwap,
  getShiftSwaps
} = require('../controllers/EmployeeShiftController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getEmployeeShift);
router.post('/swap', requestShiftSwap);
router.get('/swaps', getShiftSwaps);

module.exports = router;
