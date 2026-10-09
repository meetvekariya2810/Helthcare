const mongoose = require('mongoose');

const QCResultSchema = new mongoose.Schema({
  sample: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'QCSample', 
    required: true, 
    index: true 
  },
  test: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'QCTest', 
    default: null 
  },
  testName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  result: { 
    type: String, 
    required: true 
  },
  specification: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['PASS', 'FAIL', 'OOS', 'OOT', 'PENDING'], 
    default: 'PENDING', 
    index: true 
  },
  testedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  testedByName: { 
    type: String, 
    default: '' 
  },
  testedAt: { 
    type: Date, 
    default: Date.now 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  approvedByName: { 
    type: String, 
    default: null 
  },
  approvedAt: { 
    type: Date, 
    default: null 
  },
  instrumentUsed: { 
    type: String, 
    default: 'HPLC System Shimadzu Prominence-i' 
  },
  remarks: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

QCResultSchema.index({ sample: 1, status: 1 });

module.exports = mongoose.models.QCResult || mongoose.model('QCResult', QCResultSchema);
