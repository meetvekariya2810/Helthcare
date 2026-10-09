const mongoose = require('mongoose');

const QCSampleSchema = new mongoose.Schema({
  sampleNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true
  },
  batch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch', 
    required: false, 
    index: true 
  },
  batchNumber: { 
    type: String, 
    default: '' 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    index: true 
  },
  sampleType: { 
    type: String, 
    enum: ['RAW_MATERIAL', 'IN_PROCESS', 'FINISHED_PRODUCT', 'STABILITY', 'ENVIRONMENTAL', 'PURIFIED_WATER'], 
    default: 'FINISHED_PRODUCT' 
  },
  receivedAt: { 
    type: Date, 
    default: Date.now 
  },
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  submittedByName: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['REGISTERED', 'RECEIVED', 'UNDER_TESTING', 'TESTED', 'APPROVED', 'REJECTED', 'OOS', 'OOT'], 
    default: 'REGISTERED', 
    index: true 
  }
}, {
  timestamps: true
});

QCSampleSchema.index({ status: 1 });

module.exports = mongoose.models.QCSample || mongoose.model('QCSample', QCSampleSchema);
