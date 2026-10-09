const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  warehouseName: { 
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
  location: { 
    type: String, 
    default: '' 
  },
  warehouseType: { 
    type: String, 
    enum: ['RAW_MATERIAL', 'PACKAGING', 'FINISHED_GOODS', 'COLD_CHAIN_2_8', 'QUARANTINE', 'REJECTED'], 
    default: 'FINISHED_GOODS' 
  },
  capacity: { 
    type: String, 
    default: '10,000 pallets' 
  },
  temperatureRange: { 
    type: String, 
    default: '15°C - 25°C Controlled Room Temp' 
  },
  status: { 
    type: String, 
    enum: ['OPERATIONAL', 'FULL', 'MAINTENANCE', 'INACTIVE'], 
    default: 'OPERATIONAL' 
  }
}, {
  timestamps: true
});

WarehouseSchema.index({ warehouseType: 1 });

module.exports = mongoose.models.Warehouse || mongoose.model('Warehouse', WarehouseSchema);
