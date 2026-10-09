const mongoose = require('mongoose');

const ProductionLineSchema = new mongoose.Schema({
  name: { 
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
  facility: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Facility', 
    default: null 
  },
  dosageForm: { 
    type: String, 
    required: true, 
    trim: true 
  },
  machines: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Machine' 
  }],
  capacity: { 
    type: String, 
    default: '500,000 units/day' 
  },
  cleanroomGrade: { 
    type: String, 
    default: 'Grade B' 
  },
  status: { 
    type: String, 
    enum: ['OPERATIONAL', 'MAINTENANCE', 'CLEANING', 'IDLE', 'OFFLINE'], 
    default: 'OPERATIONAL' 
  }
}, {
  timestamps: true
});

ProductionLineSchema.index({ status: 1 });

module.exports = mongoose.models.ProductionLine || mongoose.model('ProductionLine', ProductionLineSchema);
