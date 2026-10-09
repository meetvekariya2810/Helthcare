const mongoose = require('mongoose');

const SOPSchema = new mongoose.Schema({
  sopNumber: { 
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
  department: { 
    type: String, 
    required: true, 
    trim: true 
  },
  version: { 
    type: String, 
    default: '1.0' 
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'EFFECTIVE', 'UNDER_REVISION', 'SUPERSEDED', 'OBSOLETE'], 
    default: 'EFFECTIVE', 
    index: true 
  },
  effectiveDate: { 
    type: Date, 
    required: true 
  },
  reviewDate: { 
    type: Date, 
    required: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  ownerName: { 
    type: String, 
    default: '' 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  approvedByName: { 
    type: String, 
    default: '' 
  },
  documentUrl: { 
    type: String, 
    default: '' 
  },
  description: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

SOPSchema.index({ status: 1, department: 1 });

module.exports = mongoose.models.SOP || mongoose.model('SOP', SOPSchema);
