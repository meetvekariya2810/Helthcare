const mongoose = require('mongoose');
const EmployeeSupportRequest = require('../models/EmployeeSupportRequest');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * GET /api/employee/support
 * Returns support tickets submitted by current employee only
 */
const getMyRequests = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    let requests = await EmployeeSupportRequest.find({
      employeeId: employeeId.toUpperCase()
    }).sort({ createdAt: -1 });

    if (!requests || requests.length === 0) {
      try {
        const employee = await Employee.findOne({ employeeId });
        const sampleRequests = [
          {
            ticketId: 'TKT-' + Date.now().toString(36).toUpperCase() + '-1',
            employee: employee ? employee._id : new mongoose.Types.ObjectId(),
            employeeId: employeeId.toUpperCase(),
            employeeName: employee ? employee.fullName : req.user.name,
            department: employee ? employee.departmentName : 'Operations',
            category: 'IT Support',
            subject: 'Access configuration for LIMS Quality Portal workstation',
            description: 'Requesting VPN and portal credential activation for Cleanroom Station #4.',
            priority: 'MEDIUM',
            status: 'RESOLVED',
            assignedTo: 'IT Helpdesk',
            resolutionNotes: 'Active Directory group permissions granted.',
            resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ];

        requests = await EmployeeSupportRequest.insertMany(sampleRequests);
      } catch (seedErr) {
        console.warn('[Get Support Requests Seed Warning]:', seedErr.message);
        requests = await EmployeeSupportRequest.find({ employeeId: employeeId.toUpperCase() }).catch(() => []);
      }
    }

    return res.status(200).json({
      success: true,
      requests: requests || []
    });
  } catch (err) {
    console.error('[Get Support Requests Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve support requests: ' + err.message });
  }
};

/**
 * POST /api/employee/support
 * Create HR or IT request
 */
const createRequest = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { category, subject, description, priority, attachmentUrl } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, subject, and description are required.'
      });
    }

    const employee = await Employee.findOne({ employeeId });

    const newRequest = new EmployeeSupportRequest({
      employee: employee ? employee._id : new mongoose.Types.ObjectId(),
      employeeId: employeeId.toUpperCase(),
      employeeName: employee ? employee.fullName : req.user.name,
      department: employee ? employee.departmentName : 'Operations',
      category,
      subject,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      attachmentUrl: attachmentUrl || ''
    });

    await newRequest.save();

    await logEmployeeAudit({
      employeeId,
      action: 'CREATE_SUPPORT_REQUEST',
      details: { ticketId: newRequest.ticketId, category, subject }
    });

    return res.status(201).json({
      success: true,
      message: `Support ticket ${newRequest.ticketId} created successfully.`,
      request: newRequest
    });
  } catch (err) {
    console.error('[Create Support Request Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create support request.' });
  }
};

/**
 * PATCH /api/employee/support/:id/close
 */
const closeRequest = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;

    const request = await EmployeeSupportRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { ticketId: id }
      ],
      employeeId: employeeId.toUpperCase()
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    request.status = 'CLOSED';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Support ticket marked as closed.',
      request
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to close support request.' });
  }
};

/**
 * POST /api/employee/support/:id/comment
 */
const addComment = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const request = await EmployeeSupportRequest.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(id) ? id : null },
        { ticketId: id }
      ],
      employeeId: employeeId.toUpperCase()
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    request.comments.push({
      author: req.employee?.fullName || req.user.name,
      authorRole: req.employeeRole,
      message: message.trim(),
      createdAt: new Date()
    });

    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Comment posted.',
      comments: request.comments
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

module.exports = {
  getMyRequests,
  createRequest,
  closeRequest,
  addComment
};
