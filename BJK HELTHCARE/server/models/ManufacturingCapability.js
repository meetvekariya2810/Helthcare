const mongoose = require('mongoose');

const ManufacturingCapabilitySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  dosageForm: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  facility: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Facility', 
    default: null 
  },
  facilityName: { 
    type: String, 
    default: 'Survey No. 1248 Lavad Plant' 
  },
  capacity: { 
    type: String, 
    default: '' 
  },
  certifications: [{ 
    type: String 
  }],
  status: { 
    type: String, 
    enum: ['ACTIVE', 'MAINTENANCE', 'QUALIFIED', 'INACTIVE'], 
    default: 'ACTIVE' 
  }
}, {
  timestamps: true
});

ManufacturingCapabilitySchema.index({ dosageForm: 1 });
ManufacturingCapabilitySchema.index({ status: 1 });

module.exports = mongoose.models.ManufacturingCapability || mongoose.model('ManufacturingCapability', ManufacturingCapabilitySchema);
