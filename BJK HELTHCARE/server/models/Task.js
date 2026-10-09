const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedToName: { 
    type: String, 
    default: '' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  priority: { 
    type: String, 
    enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'], 
    default: 'MEDIUM' 
  },
  status: { 
    type: String, 
    enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'], 
    default: 'TODO',
    index: true 
  },
  dueDate: { 
    type: Date, 
    default: null,
    index: true 
  },
  module: { 
    type: String, 
    default: 'OPERATIONS',
    index: true 
  },
  reference: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);
