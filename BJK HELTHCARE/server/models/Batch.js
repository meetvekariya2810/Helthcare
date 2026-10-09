const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
  batchNumber: { 
    type: String, 
    required: [true, 'Batch number is required'], 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    index: true 
  },
  productName: { 
    type: String, 
    default: '' 
  },
  productionOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductionOrder', 
    default: null 
  },
  facility: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Facility', 
    default: null 
  },
  manufacturingDate: { 
    type: Date, 
    default: Date.now 
  },
  expiryDate: { 
    type: Date, 
    default: () => new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), 
    index: true 
  },
  quantity: { 
    type: Number, 
    default: function() {
      return this.batchSize || 100000;
    },
    min: 0 
  },
  batchSize: {
    type: Number,
    default: 100000
  },
  unit: { 
    type: String, 
    default: 'Units' 
  },
  status: { 
    type: String, 
    enum: ['PLANNED', 'FORMULATION', 'PACKAGING', 'QUARANTINED', 'RELEASED', 'REJECTED', 'EXPIRED'], 
    default: 'QUARANTINED', 
    index: true 
  },
  qcStatus: { 
    type: String, 
    enum: ['PENDING', 'TESTING', 'APPROVED', 'REJECTED', 'OOS', 'OOT'], 
    default: 'PENDING' 
  },
  qaStatus: { 
    type: String, 
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'DEVIATION_HOLD'], 
    default: 'PENDING' 
  },
  releaseStatus: { 
    type: String, 
    enum: ['QUARANTINE', 'COMMERCIALLY_RELEASED', 'RECALLED', 'REJECTED'], 
    default: 'QUARANTINE' 
  },
  yieldPercentage: { 
    type: Number, 
    default: 99.4 
  },
  cleanroomGrade: { 
    type: String, 
    default: 'Grade B' 
  }
}, {
  timestamps: true
});

BatchSchema.index({ product: 1, expiryDate: 1 });
BatchSchema.index({ status: 1, qcStatus: 1, releaseStatus: 1 });

module.exports = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
