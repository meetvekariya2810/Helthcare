const mongoose = require('mongoose');
const EmployeeTask = require('../models/EmployeeTask');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * GET /api/employee/tasks
 * Returns tasks assigned to the current employee
 */
const getMyTasks = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    let tasks = await EmployeeTask.find({
      employeeId: employeeId.toUpperCase()
    }).sort({ priority: -1, createdAt: -1 });

    if (!tasks || tasks.length === 0) {
      // Seed initial tasks for demo employee
      try {
        const employee = await Employee.findOne({ employeeId });
        const sampleTasks = [
          {
            taskId: 'TSK-' + Date.now().toString(36).toUpperCase() + '-1',
            employeeId: employeeId.toUpperCase(),
            employee: employee ? employee._id : new mongoose.Types.ObjectId(),
            title: 'Complete Annual Good Manufacturing Practice (GMP) Self-Assessment',
            description: 'Review updated FDA & WHO GMP standards compliance questionnaire for cleanroom area.',
            assignedBy: 'Quality Assurance Head',
            assignedByName: 'Priya Sharma',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
          },
          {
            taskId: 'TSK-' + Date.now().toString(36).toUpperCase() + '-2',
            employeeId: employeeId.toUpperCase(),
            employee: employee ? employee._id : new mongoose.Types.ObjectId(),
            title: 'Submit Monthly Batch Production Line Logs',
            description: 'Collate yield reconciliation sheets and submit to department lead.',
            assignedBy: 'Operations Lead',
            assignedByName: 'Dr. Sunita Rao',
            priority: 'MEDIUM',
            status: 'TODO',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          {
            taskId: 'TSK-' + Date.now().toString(36).toUpperCase() + '-3',
            employeeId: employeeId.toUpperCase(),
            employee: employee ? employee._id : new mongoose.Types.ObjectId(),
            title: 'Acknowledge Updated Workplace Safety Protocol (SOP-HSE-04)',
            description: 'Review fire exit drills and chemical emergency response procedures.',
            assignedBy: 'Corporate Safety Officer',
            assignedByName: 'Rajesh Patel',
            priority: 'LOW',
            status: 'COMPLETED',
            completedAt: new Date(),
            dueDate: new Date()
          }
        ];

        tasks = await EmployeeTask.insertMany(sampleTasks);
      } catch (seedErr) {
        console.warn('[Get My Tasks Seed Warning]:', seedErr.message);
        tasks = await EmployeeTask.find({ employeeId: employeeId.toUpperCase() }).catch(() => []);
      }
    }

    return res.status(200).json({
      success: true,
      tasks: tasks || []
    });
  } catch (err) {
    console.error('[Get My Tasks Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks: ' + err.message });
  }
};

/**
 * PATCH /api/employee/tasks/:id/status
 */
const updateTaskStatus = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;
    const { status } = req.body;

    if (!['TODO', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const task = await EmployeeTask.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { taskId: id }
      ],
      employeeId: employeeId.toUpperCase()
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found or not assigned to you.' });
    }

    task.status = status;
    if (status === 'COMPLETED') {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    await logEmployeeAudit({
      employeeId,
      action: 'UPDATE_TASK_STATUS',
      details: { taskId: task.taskId, newStatus: status }
    });

    return res.status(200).json({
      success: true,
      message: `Task status updated to ${status}.`,
      task
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
};

/**
 * POST /api/employee/tasks/:id/comment
 */
const addTaskComment = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message is required.' });
    }

    const task = await EmployeeTask.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { taskId: id }
      ],
      employeeId: employeeId.toUpperCase()
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.comments.push({
      author: req.employee?.fullName || req.user.name,
      message: message.trim(),
      createdAt: new Date()
    });

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Comment added.',
      comments: task.comments
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

module.exports = {
  getMyTasks,
  updateTaskStatus,
  addTaskComment
};
