const express = require('express');
const router = express.Router();
const { getTeamInfo } = require('../controllers/EmployeeTeamController');
const { authenticateEmployee } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);

router.get('/', getTeamInfo);

module.exports = router;
