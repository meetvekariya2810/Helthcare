const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
  machineName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  machineCode: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  productionLine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductionLine', 
    default: null 
  },
  manufacturer: { 
    type: String, 
    default: '' 
  },
  model: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['RUNNING', 'IDLE', 'MAINTENANCE', 'BREAKDOWN', 'OFFLINE'], 
    default: 'RUNNING' 
  },
  maintenanceSchedule: { 
    type: String, 
    default: 'Monthly' 
  },
  lastMaintenance: { 
    type: Date, 
    default: null 
  },
  nextMaintenance: { 
    type: Date, 
    default: null 
  }
}, {
  timestamps: true
});

MachineSchema.index({ status: 1 });

module.exports = mongoose.models.Machine || mongoose.model('Machine', MachineSchema);
