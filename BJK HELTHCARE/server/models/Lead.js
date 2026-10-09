const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  company: { 
    type: String, 
    required: true, 
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
  status: { 
    type: String, 
    enum: ['PROSPECT', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'], 
    default: 'PROSPECT' 
  },
  leadScore: { 
    type: Number, 
    default: 50 
  },
  estimatedValue: { 
    type: Number, 
    default: 0 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  source: { 
    type: String, 
    default: 'DIRECT' 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  assignedToName: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

LeadSchema.index({ email: 1 });
LeadSchema.index({ company: 1 });
LeadSchema.index({ status: 1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
