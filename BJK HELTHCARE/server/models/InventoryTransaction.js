const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    default: function() {
      return 'TXN-' + Date.now().toString().slice(-8);
    },
    index: true
  },
  item: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'InventoryItem', 
    required: true, 
    index: true 
  },
  batch: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Batch', 
    default: null 
  },
  batchNumber: { 
    type: String, 
    default: '' 
  },
  transactionType: { 
    type: String, 
    required: true, 
    enum: [
      'STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT', 'QUARANTINE', 'RELEASE', 'RETURN',
      'INBOUND_RECEIPT', 'DISPENSING', 'PRODUCTION_TRANSFER', 'FEFO_SHIPMENT', 'QUARANTINE_ADJUSTMENT', 'SAMPLE_DRAWN'
    ], 
    index: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  previousStock: {
    type: Number,
    default: 0
  },
  resultingStock: {
    type: Number,
    default: 0
  },
  fromWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    default: null
  },
  reference: { 
    type: String, 
    default: function() {
      return this.referenceOrder || 'TXN-REF-' + Date.now().toString().slice(-6);
    }, 
    trim: true 
  },
  referenceOrder: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false,
    default: null
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  performedByName: { 
    type: String, 
    default: '' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  notes: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

InventoryTransactionSchema.index({ item: 1, timestamp: -1 });
InventoryTransactionSchema.index({ transactionType: 1, timestamp: -1 });

module.exports = mongoose.models.InventoryTransaction || mongoose.model('InventoryTransaction', InventoryTransactionSchema);
