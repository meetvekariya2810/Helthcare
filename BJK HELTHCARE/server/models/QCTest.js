const mongoose = require('mongoose');

const QCTestSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  testCode: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  specification: { 
    type: String, 
    required: true, 
    trim: true 
  },
  unit: { 
    type: String, 
    default: '%' 
  },
  method: { 
    type: String, 
    default: 'HPLC / IP / USP' 
  },
  active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Schema export
module.exports = mongoose.models.QCTest || mongoose.model('QCTest', QCTestSchema);
