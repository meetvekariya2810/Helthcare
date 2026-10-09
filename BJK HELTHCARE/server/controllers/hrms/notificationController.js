const HRNotification = require('../../models/hrms/HRNotification');

// GET /api/hrms/notifications
const getNotifications = async (req, res) => {
  try {
    const { category, isRead } = req.query;
    const query = { isArchived: false };

    // Role-aware audience filtering
    if (req.user) {
      if (req.user.role === 'EMPLOYEE') {
        query.$or = [
          { recipientEmployeeId: req.user.employeeId },
          { recipientRole: 'EMPLOYEE' },
          { recipientRole: null },
          { category: 'HR_ANNOUNCEMENT' }
        ];
      } else if (req.user.role === 'QA_MANAGER' || req.user.role === 'QC_MANAGER') {
        query.$or = [
          { recipientRole: { $in: ['QA_MANAGER', 'DEPARTMENT_MANAGER', null] } },
          { category: { $in: ['COMPLIANCE', 'CREDENTIAL', 'TRAINING', 'HR_ANNOUNCEMENT', 'SHIFT'] } }
        ];
      }
    }

    if (category && category !== 'ALL') query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await HRNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await HRNotification.countDocuments({ ...query, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notif = await HRNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json({ success: true, notification: notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/notifications/mark-all-read
const markAllAsRead = async (req, res) => {
  try {
    await HRNotification.updateMany({ isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/notifications/announcement
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      description,
      message,
      photo,
      sendTo = 'All',
      severity = 'INFO',
      targetRole = 'ALL',
      targetDepartment
    } = req.body;

    const content = (description || message || '').trim();
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and Description are required fields.'
      });
    }

    const sender = req.user?.name || (req.user?.role?.includes('HR') ? 'Corporate HR Department' : 'Executive Administration');
    const senderRole = req.user?.role || 'HR_ADMIN';

    const notif = await HRNotification.create({
      category: 'HR_ANNOUNCEMENT',
      title: title.trim(),
      message: content,
      photo: photo || '',
      sendTo: sendTo || 'All',
      severity: severity || 'INFO',
      recipientRole: (sendTo === 'All' || targetRole === 'ALL') ? null : (sendTo || targetRole),
      departmentName: targetDepartment || (sendTo !== 'All' ? sendTo : 'All Departments'),
      senderName: sender,
      senderRole: senderRole
    });

    return res.status(201).json({
      success: true,
      message: 'Notification announcement broadcasted successfully to all employees.',
      notification: notif,
      announcement: notif
    });
  } catch (error) {
    console.error('[Create Announcement Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createAnnouncement };
