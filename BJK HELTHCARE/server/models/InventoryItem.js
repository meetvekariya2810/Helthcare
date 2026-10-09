const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    index: true 
  },
  warehouse: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Warehouse', 
    required: true, 
    index: true 
  },
  batch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch', 
    default: null, 
    index: true 
  },
  batchNumber: { 
    type: String, 
    default: '' 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 0, 
    default: 0 
  },
  reservedQuantity: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  availableQuantity: { 
    type: Number, 
    default: function() {
      return Math.max(0, this.quantity - (this.reservedQuantity || 0));
    } 
  },
  unit: { 
    type: String, 
    default: 'Packs' 
  },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'HEALTHY', 'LOW_STOCK', 'QUARANTINE', 'NEAR_EXPIRY', 'EXPIRED', 'BLOCKED', 'RESERVED', 'DAMAGED'], 
    default: 'HEALTHY', 
    index: true 
  },
  expiryDate: { 
    type: Date, 
    required: true, 
    index: true 
  },
  reorderLevel: { 
    type: Number, 
    default: 1000 
  }
}, {
  timestamps: true
});

InventoryItemSchema.index({ product: 1, warehouse: 1, batch: 1 });
InventoryItemSchema.index({ status: 1, expiryDate: 1 });

InventoryItemSchema.pre('save', function(next) {
  this.availableQuantity = Math.max(0, (this.quantity || 0) - (this.reservedQuantity || 0));
  next();
});

module.exports = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);
