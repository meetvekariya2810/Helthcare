const mongoose = require('mongoose');

const CAPASchema = new mongoose.Schema({
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
  relatedDeviation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Deviation', 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['INITIATED', 'ACTION_PLANNING', 'IMPLEMENTATION', 'EFFECTIVENESS_CHECK', 'CLOSED'], 
    default: 'INITIATED', 
    index: true 
  },
  priority: { 
    type: String, 
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], 
    default: 'MEDIUM', 
    index: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  correctiveAction: { 
    type: String, 
    default: '' 
  },
  preventiveAction: { 
    type: String, 
    default: '' 
  },
  targetClosureDate: { 
    type: Date, 
    required: true 
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

CAPASchema.index({ status: 1 });

module.exports = mongoose.models.CAPA || mongoose.model('CAPA', CAPASchema);
