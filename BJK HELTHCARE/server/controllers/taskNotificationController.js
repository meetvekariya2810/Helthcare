const Task = require('../models/Task');
const Alert = require('../models/Alert');
const AuditLog = require('../models/AuditLog');

// ==============================================================================
// 1. TASKS
// ==============================================================================
const getTasks = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.module) query.module = req.query.module;

    // Filter by assigned user or role if not admin
    if (req.user && !['SUPER_ADMIN', 'DIRECTOR'].includes(req.user.role)) {
      query.$or = [
        { assignedUser: req.user._id },
        { assignedRole: req.user.role },
        { assignedRole: 'ALL' }
      ];
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, priority: -1 }).lean();
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      status: 'PENDING',
      createdBy: req.user ? req.user._id : null
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// ==============================================================================
// 2. CENTRALIZED NOTIFICATIONS / ALERTS
// ==============================================================================
const getNotifications = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.isRead !== undefined) query.isRead = req.query.isRead === 'true';

    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Alert.countDocuments({ isRead: false });

    res.json({
      success: true,
      count: alerts.length,
      unreadCount,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Alert.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
