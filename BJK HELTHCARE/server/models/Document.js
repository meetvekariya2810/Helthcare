const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  documentType: { 
    type: String, 
    default: 'GENERAL',
    trim: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileUrl: { 
    type: String, 
    required: true 
  },
  fileType: { 
    type: String, 
    default: 'application/pdf' 
  },
  fileSizeKB: { 
    type: Number, 
    default: 0 
  },
  relatedEntity: { 
    type: String, 
    default: 'Product' 
  }, // Product, Batch, Employee, Facility, Regulatory
  relatedEntityId: { 
    type: String, 
    default: null 
  },
  version: { 
    type: String, 
    default: '1.0' 
  },
  verificationStatus: { 
    type: String, 
    enum: ['UPLOADED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED'], 
    default: 'VERIFIED' 
  },
  status: { 
    type: String, 
    enum: ['UPLOADED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'EXPIRED'], 
    default: 'VERIFIED' 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    default: null 
  },
  employeeId: { 
    type: String, 
    default: '' 
  },
  employeeName: { 
    type: String, 
    default: '' 
  },
  expiryDate: { 
    type: Date, 
    default: null 
  },
  isDemo: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

DocumentSchema.index({ relatedEntity: 1, relatedEntityId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ status: 1 });

module.exports = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
