const express = require('express');
const router = express.Router();
const {
  changePassword,
  getLoginHistory,
  logoutOtherDevices
} = require('../controllers/EmployeeSettingsController');
const { authenticateEmployee } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);

router.post('/change-password', changePassword);
router.get('/login-history', getLoginHistory);
router.post('/logout-other-devices', logoutOtherDevices);

module.exports = router;
