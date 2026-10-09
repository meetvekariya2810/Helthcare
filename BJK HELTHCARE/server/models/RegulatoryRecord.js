const mongoose = require('mongoose');

const RegulatoryRecordSchema = new mongoose.Schema({
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
  country: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true 
  },
  authority: { 
    type: String, 
    required: true, 
    trim: true 
  }, // e.g. USFDA, WHO, CDSCO, NAFDAC Nigeria, PPB Kenya, NDA Uganda
  registrationNumber: { 
    type: String, 
    required: true, 
    trim: true 
  },
  registrationDate: { 
    type: Date, 
    required: true 
  },
  expiryDate: { 
    type: Date, 
    required: true, 
    index: true 
  },
  status: { 
    type: String, 
    enum: ['APPROVED', 'SUBMITTED', 'UNDER_EVALUATION', 'RENEWAL_DUE', 'EXPIRED', 'REJECTED'], 
    default: 'APPROVED', 
    index: true 
  },
  responsiblePerson: { 
    type: String, 
    default: '' 
  },
  documents: [{
    title: String,
    dossierType: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

RegulatoryRecordSchema.index({ country: 1, product: 1 });
RegulatoryRecordSchema.index({ expiryDate: 1, status: 1 });

module.exports = mongoose.models.RegulatoryRecord || mongoose.model('RegulatoryRecord', RegulatoryRecordSchema);
