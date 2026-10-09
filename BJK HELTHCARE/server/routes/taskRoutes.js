const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask
} = require('../controllers/taskNotificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);

module.exports = router;
