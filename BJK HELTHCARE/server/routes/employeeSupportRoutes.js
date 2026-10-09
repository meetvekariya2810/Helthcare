const express = require('express');
const router = express.Router();
const {
  getMyRequests,
  createRequest,
  closeRequest,
  addComment
} = require('../controllers/EmployeeSupportController');
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);
router.use(authorizeOwnership);

router.get('/', getMyRequests);
router.post('/', createRequest);
router.patch('/:id/close', closeRequest);
router.post('/:id/comment', addComment);

module.exports = router;
