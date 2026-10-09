const express = require('express');
const router = express.Router();
const {
  getCurrentPayroll,
  getPayslips,
  downloadPayslip
} = require('../controllers/EmployeePayrollController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getCurrentPayroll);
router.get('/current', getCurrentPayroll);
router.get('/payslips', getPayslips);
router.get('/payslips/:id/download', downloadPayslip);

module.exports = router;
