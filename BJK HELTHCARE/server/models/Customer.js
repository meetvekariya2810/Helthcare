const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  customerName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  phone: { 
    type: String, 
    default: '' 
  },
  country: { 
    type: String, 
    required: true 
  },
  tier: { 
    type: String, 
    enum: ['STRATEGIC', 'TIER_1', 'TIER_2', 'DISTRIBUTOR'], 
    default: 'DISTRIBUTOR' 
  },
  creditLimit: { 
    type: Number, 
    default: 100000 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'CREDIT_HOLD', 'INACTIVE'], 
    default: 'ACTIVE' 
  }
}, {
  timestamps: true
});

CustomerSchema.index({ country: 1 });

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
