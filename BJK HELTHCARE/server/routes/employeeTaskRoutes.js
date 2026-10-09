const express = require('express');
const router = express.Router();
const {
  getMyTasks,
  updateTaskStatus,
  addTaskComment
} = require('../controllers/EmployeeTaskController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getMyTasks);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/comment', addTaskComment);

module.exports = router;
