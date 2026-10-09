const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  assetTag: { type: String, required: true, uppercase: true, unique: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['IT_HARDWARE', 'LAB_EQUIPMENT', 'PRODUCTION_DEVICE', 'MOBILE_DEVICE', 'SAFETY_GEAR', 'VEHICLE', 'FURNITURE'],
    required: true
  },
  modelNumber: { type: String, default: '' },
  serialNumber: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  assignedEmployeeName: { type: String, default: '' },
  assignedDate: { type: Date, default: null },
  returnDate: { type: Date, default: null },
  condition: { type: String, enum: ['EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED', 'UNDER_MAINTENANCE'], default: 'EXCELLENT' },
  status: { type: String, enum: ['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'DISPOSED'], default: 'AVAILABLE' },
  purchaseCost: { type: Number, default: 0 },
  warrantyExpiry: { type: Date, default: null },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

AssetSchema.index({ assignedTo: 1 });
AssetSchema.index({ status: 1 });

module.exports = mongoose.models.Asset || mongoose.model('Asset', AssetSchema);
