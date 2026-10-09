const mongoose = require('mongoose');

const TaskCommentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const EmployeeTaskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'TSK-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  },
  employeeId: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  assignedBy: {
    type: String,
    default: 'Reporting Manager'
  },
  assignedByName: {
    type: String,
    default: 'Dr. Sunita Rao'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'],
    default: 'TODO',
    index: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  comments: [TaskCommentSchema]
}, {
  timestamps: true
});

EmployeeTaskSchema.index({ employeeId: 1, status: 1 });

module.exports = mongoose.models.EmployeeTask || mongoose.model('EmployeeTask', EmployeeTaskSchema);
