const mongoose = require('mongoose');

const DeviationSchema = new mongoose.Schema({
  refNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  ownerName: { 
    type: String, 
    default: '' 
  },
  department: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['LOGGED', 'INVESTIGATION', 'QA_REVIEW', 'CAPA_REQUIRED', 'CLOSED'], 
    default: 'LOGGED', 
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['CRITICAL', 'MAJOR', 'MINOR'], 
    default: 'MINOR', 
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  rootCause: { 
    type: String, 
    default: '' 
  },
  occurredDate: { 
    type: Date, 
    required: true 
  },
  targetClosureDate: { 
    type: Date, 
    default: null 
  },
  closedDate: { 
    type: Date, 
    default: null 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  approvedAt: { 
    type: Date, 
    default: null 
  },
  attachments: [{ 
    title: String, 
    url: String 
  }],
  auditHistory: [{
    action: String,
    performedBy: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, {
  timestamps: true
});

DeviationSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.models.Deviation || mongoose.model('Deviation', DeviationSchema);
