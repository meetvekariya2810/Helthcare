const mongoose = require('mongoose');

const ExportShipmentSchema = new mongoose.Schema({
  shipmentNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  salesOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SalesOrder', 
    default: null 
  },
  destinationCountry: { 
    type: String, 
    required: true 
  },
  portOfLoading: { 
    type: String, 
    default: 'Mundra Port / Nhava Sheva (JNPT), India' 
  },
  portOfEntry: { 
    type: String, 
    required: true 
  },
  blNumber: { 
    type: String, 
    default: '' 
  }, // Bill of Lading / Airway Bill
  status: { 
    type: String, 
    enum: ['BOOKED', 'CUSTOMS_CLEARED', 'IN_TRANSIT', 'ARRIVED_PORT', 'DELIVERED'], 
    default: 'BOOKED', 
    index: true 
  },
  dispatchDate: { 
    type: Date, 
    default: null 
  },
  eta: { 
    type: Date, 
    default: null 
  },
  temperatureMonitored: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

ExportShipmentSchema.index({ destinationCountry: 1 });

module.exports = mongoose.models.ExportShipment || mongoose.model('ExportShipment', ExportShipmentSchema);
