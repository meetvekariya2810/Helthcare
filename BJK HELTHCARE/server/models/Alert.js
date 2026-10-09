const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['SYSTEM', 'GMP_COMPLIANCE', 'COLD_CHAIN_TEMP', 'BATCH_HOLD', 'QC_OOS', 'REGULATORY_DEADLINE', 'STOCK_LOW'],
    default: 'SYSTEM'
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'], 
    default: 'INFO',
    index: true 
  },
  module: { 
    type: String, 
    required: true, 
    default: 'SYSTEM',
    index: true 
  },
  reference: { 
    type: String, 
    default: '' 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'], 
    default: 'ACTIVE',
    index: true 
  },
  dueDate: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true
});

AlertSchema.index({ status: 1, severity: 1 });
AlertSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
