const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllRead,
  getCompanyAnnouncements
} = require('../controllers/EmployeeNotificationController');
const { authenticateEmployee } = require('../middleware/employeeAuth');

router.use(authenticateEmployee);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllRead);
router.get('/announcements', getCompanyAnnouncements);

module.exports = router;
