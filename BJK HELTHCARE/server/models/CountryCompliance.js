const mongoose = require('mongoose');

const CountryComplianceSchema = new mongoose.Schema({
  country: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    index: true 
  },
  authority: { 
    type: String, 
    required: true, 
    trim: true 
  },
  region: { 
    type: String, 
    default: 'Global' 
  },
  requirements: [{ 
    type: String 
  }],
  productRegistrationsCount: { 
    type: Number, 
    default: 0 
  },
  status: { 
    type: String, 
    enum: ['COMPLIANT', 'RENEWAL_REQUIRED', 'PENDING_AUDIT', 'NON_COMPLIANT'], 
    default: 'COMPLIANT' 
  },
  renewalDate: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true
});

// Model export
module.exports = mongoose.models.CountryCompliance || mongoose.model('CountryCompliance', CountryComplianceSchema);
