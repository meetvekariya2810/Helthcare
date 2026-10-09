const mongoose = require('mongoose');

const FacilitySchema = new mongoose.Schema({
  facilityName: { 
    type: String, 
    required: [true, 'Facility name is required'], 
    trim: true 
  },
  facilityCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    required: true
  },
  facilityType: { 
    type: String, 
    enum: ['MANUFACTURING', 'R&D', 'CORPORATE', 'WAREHOUSE', 'QC_LAB'],
    default: 'MANUFACTURING' 
  },
  address: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  country: { 
    type: String, 
    default: 'India' 
  },
  pincode: { 
    type: String, 
    default: '' 
  },
  departments: [{ 
    type: String 
  }],
  manufacturingCapabilities: [{ 
    type: String 
  }],
  certifications: [{ 
    type: String 
  }],
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], 
    default: 'ACTIVE' 
  }
}, {
  timestamps: true
});

FacilitySchema.index({ facilityName: 1 });
FacilitySchema.index({ status: 1 });

module.exports = mongoose.models.Facility || mongoose.model('Facility', FacilitySchema);
