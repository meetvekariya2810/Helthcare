const mongoose = require('mongoose');

const ProductionOrderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productName: { 
    type: String, 
    default: '' 
  },
  facility: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Facility', 
    default: null 
  },
  productionLine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductionLine', 
    default: null 
  },
  plannedQuantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
  actualQuantity: { 
    type: Number, 
    default: 0 
  },
  scheduledStart: { 
    type: Date, 
    required: true 
  },
  scheduledEnd: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'], 
    default: 'SCHEDULED' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }
}, {
  timestamps: true
});

ProductionOrderSchema.index({ product: 1 });
ProductionOrderSchema.index({ status: 1 });

module.exports = mongoose.models.ProductionOrder || mongoose.model('ProductionOrder', ProductionOrderSchema);
