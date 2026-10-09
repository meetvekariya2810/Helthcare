const express = require('express');
const router = express.Router();
const { authenticateEmployee, authorizeOwnership } = require('../middleware/employeeAuth');
const employeeCalendarCtrl = require('../controllers/hrms/employeeCalendarController');

// All employee calendar routes strictly require authenticated employee session & ownership
router.use(authenticateEmployee);
router.use(authorizeOwnership);

// 1. Monthly Calendar View
router.get('/', employeeCalendarCtrl.getMyCalendar);
router.get('/my', employeeCalendarCtrl.getMyCalendar);
router.get('/month', employeeCalendarCtrl.getMyCalendar);

// 2. Schedule & Work Pattern (Read-only)
router.get('/schedule', employeeCalendarCtrl.getMySchedule);

// 3. Dashboard Today's Status & Upcoming Overview
router.get('/today', employeeCalendarCtrl.getMyTodaySummary);
router.get('/summary', employeeCalendarCtrl.getMyTodaySummary);

// 4. Holidays Applicable to Employee
router.get('/holidays', employeeCalendarCtrl.getMyHolidays);

// 5. Events Applicable to Employee
router.get('/events', employeeCalendarCtrl.getMyEvents);

// 6. Validate Leave Date Against Calendar
router.post('/validate-leave', employeeCalendarCtrl.validateLeaveDate);

module.exports = router;
