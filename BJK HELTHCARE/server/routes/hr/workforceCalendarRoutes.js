const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/rbac');
const calendarCtrl = require('../../controllers/hrms/workforceCalendarController');

// All HR workforce calendar routes require authenticated session
router.use(protect);

// 1. Overview & Monthly Matrix
router.get('/master', calendarCtrl.getMasterOverview);
router.get('/overview', calendarCtrl.getMasterOverview);
router.get('/stats', calendarCtrl.getMasterOverview);
router.get('/month', calendarCtrl.getMonthCalendar);
router.get('/employee/:employeeCode', calendarCtrl.getEmployeeCalendarByCode);

// 2. Work Schedule Management
router.get('/schedules', calendarCtrl.getSchedules);
router.post('/schedules', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.createSchedule);
router.put('/schedules/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.updateSchedule);
router.delete('/schedules/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.deleteSchedule);

// 3. Rosters Management
router.get('/rosters', calendarCtrl.getRosters);
router.post('/rosters', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.createRoster);
router.post('/rosters/assign', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.assignRoster);

// 4. Holidays Management
router.get('/holidays', calendarCtrl.getHolidays);
router.post('/holidays', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.createHoliday);
router.put('/holidays/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.updateHoliday);
router.delete('/holidays/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.deleteHoliday);

// 5. Special Working Days & Special Holidays
router.get('/special-days', calendarCtrl.getSpecialDays);
router.post('/special-days', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.createSpecialDay);
router.delete('/special-days/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.deleteSpecialDay);

// 6. Company Events, Celebrations & Functions
router.get('/events', calendarCtrl.getEvents);
router.post('/events', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.createEvent);
router.delete('/events/:id', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.deleteEvent);

// 7. Calendar Exceptions (Single-employee Date Override)
router.post('/exceptions', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.createException);

// 8. Leave Approvals Integration
router.get('/leaves/pending', calendarCtrl.getPendingLeaves);
router.post('/leaves/:id/approve', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.approveLeave);
router.post('/leaves/:id/reject', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.rejectLeave);

// 9. Calendar Setup Wizard (11-Step Publish)
router.post('/wizard/publish', requireRole('SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER'), calendarCtrl.publishWizardCalendar);

// 10. Reports & Exports
router.get('/reports', calendarCtrl.getCalendarReports);

module.exports = router;
