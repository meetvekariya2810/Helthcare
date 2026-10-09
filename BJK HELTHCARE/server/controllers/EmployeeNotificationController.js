const mongoose = require('mongoose');
const HRNotification = require('../models/hrms/HRNotification');
const { HolidayCalendar } = require('../models/hrms/Leave');

/**
 * GET /api/employee/notifications
 */
const getMyNotifications = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const userId = req.user?._id;
    const role = req.employeeRole;

    let notifications = await HRNotification.find({
      $or: [
        { recipientEmployeeId: employeeId.toUpperCase() },
        { recipientUser: userId },
        { recipientRole: role },
        { recipientRole: 'EMPLOYEE' },
        { recipientRole: null, recipientEmployeeId: null, recipientUser: null }
      ]
    }).sort({ createdAt: -1 }).limit(30);

    if (!notifications || notifications.length === 0) {
      // Seed default notifications for this employee
      const sampleNotifications = [
        {
          recipientEmployeeId: employeeId.toUpperCase(),
          category: 'PAYROLL',
          title: 'September 2026 Payslip Released',
          message: 'Your salary for September 2026 has been credited and payslip is available for download.',
          severity: 'INFO',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          recipientEmployeeId: employeeId.toUpperCase(),
          category: 'ATTENDANCE',
          title: 'Shift Timings Reminder',
          message: 'General shift scheduled: 09:00 AM - 06:00 PM. Please remember to mark check-in on time.',
          severity: 'INFO',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          recipientEmployeeId: employeeId.toUpperCase(),
          category: 'HR_ANNOUNCEMENT',
          title: 'Upcoming National Holiday — Diwali Vacation',
          message: 'Corporate and Plant administrative offices will observe official holiday on October 29 - November 02, 2026.',
          severity: 'INFO',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ];

      notifications = await HRNotification.insertMany(sampleNotifications);
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error('[Get Notifications Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
};

/**
 * PATCH /api/employee/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await HRNotification.findByIdAndUpdate(id, { isRead: true, readAt: new Date() });

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating notification.' });
  }
};

/**
 * PATCH /api/employee/notifications/read-all
 */
const markAllRead = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    await HRNotification.updateMany(
      {
        $or: [
          { recipientEmployeeId: employeeId.toUpperCase() },
          { recipientRole: 'EMPLOYEE' }
        ]
      },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error marking all notifications.' });
  }
};

/**
 * GET /api/employee/announcements
 */
const getCompanyAnnouncements = async (req, res) => {
  try {
    let dbAnnouncements = [];
    try {
      const docs = await HRNotification.find({
        category: 'HR_ANNOUNCEMENT',
        isArchived: false
      }).sort({ createdAt: -1 }).limit(20);

      dbAnnouncements = docs.map(d => ({
        _id: d._id,
        id: String(d._id),
        title: d.title,
        category: d.departmentName || 'Corporate Broadcast',
        date: d.createdAt ? d.createdAt.toISOString().split('T')[0] : '2026-10-08',
        createdAt: d.createdAt,
        author: d.senderName || 'HR Corporate Communication',
        senderRole: d.senderRole || 'HR_ADMIN',
        importance: d.severity === 'URGENT' || d.severity === 'WARNING' ? 'HIGH' : 'NORMAL',
        severity: d.severity || 'INFO',
        content: d.message,
        description: d.message,
        photo: d.photo || '',
        sendTo: d.sendTo || 'All',
        acknowledged: false
      }));
    } catch (dbErr) {
      console.warn('[DB Announcements query warning]:', dbErr.message);
    }

    const defaultAnnouncements = [
      {
        id: 'ANN-01',
        title: 'BJK Healthcare USFDA Audit Readiness & Cleanroom Protocols',
        category: 'Quality & Regulatory',
        date: '2026-10-01',
        author: 'Executive QA Directorate',
        importance: 'HIGH',
        content: 'All plant personnel must ensure adherence to Current Good Manufacturing Practices (cGMP) SOP-QA-109. Daily gowning log checks are now mandatory at airlock entry points.',
        description: 'All plant personnel must ensure adherence to Current Good Manufacturing Practices (cGMP) SOP-QA-109. Daily gowning log checks are now mandatory at airlock entry points.',
        photo: '',
        sendTo: 'All',
        acknowledged: false
      },
      {
        id: 'ANN-02',
        title: 'Annual Employee Health Checkup & Vaccination Drive 2026',
        category: 'Occupational Health',
        date: '2026-09-25',
        author: 'Corporate HR & Medical Center',
        importance: 'NORMAL',
        content: 'Comprehensive health screening and Tetanus / Hepatitis B booster shots will be administered at Plant Medical Bay starting Monday. Slot booking is enabled via Employee Portal.',
        description: 'Comprehensive health screening and Tetanus / Hepatitis B booster shots will be administered at Plant Medical Bay starting Monday. Slot booking is enabled via Employee Portal.',
        photo: '',
        sendTo: 'All',
        acknowledged: true
      },
      {
        id: 'ANN-03',
        title: 'Q3 Town Hall & Performance Milestone Celebration',
        category: 'Corporate Notice',
        date: '2026-09-20',
        author: 'Managing Director Office',
        importance: 'NORMAL',
        content: 'Join the Executive Leadership Team this Friday at 4:30 PM for our quarterly achievements celebration and recognition awards for Formulations & QC teams.',
        description: 'Join the Executive Leadership Team this Friday at 4:30 PM for our quarterly achievements celebration and recognition awards for Formulations & QC teams.',
        photo: '',
        sendTo: 'All',
        acknowledged: true
      }
    ];

    const announcements = [...dbAnnouncements, ...defaultAnnouncements];

    // Upcoming Holidays
    const holidays = [
      { name: 'Diwali (Deepavali)', date: '2026-11-01', type: 'FESTIVAL', day: 'Sunday' },
      { name: 'Vikram Samvant New Year', date: '2026-11-02', type: 'MANDATORY', day: 'Monday' },
      { name: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'MANDATORY', day: 'Tuesday' },
      { name: 'Christmas Day', date: '2026-12-25', type: 'NATIONAL_HOLIDAY', day: 'Friday' }
    ];

    return res.status(200).json({
      success: true,
      announcements,
      holidays
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve announcements.' });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllRead,
  getCompanyAnnouncements
};
