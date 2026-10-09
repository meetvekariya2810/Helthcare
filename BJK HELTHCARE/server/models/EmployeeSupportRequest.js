const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  authorRole: { type: String, default: 'EMPLOYEE' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const EmployeeSupportRequestSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'TKT-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  employeeName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'General'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'HR Request',
      'IT Support',
      'Payroll Issue',
      'Attendance Correction',
      'Leave Issue',
      'Document Request',
      'Access Request',
      'Other'
    ],
    default: 'HR Request'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  attachmentUrl: {
    type: String,
    default: ''
  },
  assignedTo: {
    type: String,
    default: 'HR Support Desk'
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  comments: [CommentSchema]
}, {
  timestamps: true
});

EmployeeSupportRequestSchema.index({ employeeId: 1, createdAt: -1 });

module.exports = mongoose.models.EmployeeSupportRequest || mongoose.model('EmployeeSupportRequest', EmployeeSupportRequestSchema);
