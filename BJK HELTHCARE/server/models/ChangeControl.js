const mongoose = require('mongoose');

const ChangeControlSchema = new mongoose.Schema({
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
  changeType: { 
    type: String, 
    enum: ['EQUIPMENT', 'PROCESS', 'FACILITY', 'DOCUMENTATION', 'RAW_MATERIAL', 'SOFTWARE'], 
    default: 'PROCESS' 
  },
  status: { 
    type: String, 
    enum: ['PROPOSED', 'IMPACT_ASSESSMENT', 'QA_APPROVAL', 'IMPLEMENTATION', 'CLOSED', 'REJECTED'], 
    default: 'PROPOSED', 
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['EMERGENCY', 'MAJOR', 'MINOR'], 
    default: 'MINOR', 
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  justification: { 
    type: String, 
    default: '' 
  },
  targetClosureDate: { 
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

ChangeControlSchema.index({ status: 1 });

module.exports = mongoose.models.ChangeControl || mongoose.model('ChangeControl', ChangeControlSchema);
