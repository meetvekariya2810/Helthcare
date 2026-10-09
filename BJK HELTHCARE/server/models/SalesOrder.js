const mongoose = require('mongoose');

const SalesOrderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    required: true 
  },
  customerName: { 
    type: String, 
    default: '' 
  },
  destinationCountry: { 
    type: String, 
    required: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    dosageForm: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totalAmount: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  deliveryDate: { 
    type: Date, 
    default: null 
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 'CANCELLED'], 
    default: 'CONFIRMED', 
    index: true 
  }
}, {
  timestamps: true
});

SalesOrderSchema.index({ status: 1 });

module.exports = mongoose.models.SalesOrder || mongoose.model('SalesOrder', SalesOrderSchema);
