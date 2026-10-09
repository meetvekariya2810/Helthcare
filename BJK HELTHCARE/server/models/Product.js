const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  srNo: { 
    type: Number, 
    required: [true, 'Serial number (srNo) is required'], 
    unique: true, 
    index: true 
  },
  productName: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true, 
    index: true 
  },
  genericName: { 
    type: String, 
    required: [true, 'Generic name is required'], 
    trim: true, 
    index: true 
  },
  strength: { 
    type: String, 
    default: '', 
    trim: true 
  },
  dosageForm: { 
    type: String, 
    required: [true, 'Dosage form is required'], 
    trim: true, 
    index: true 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'], 
    trim: true, 
    index: true 
  },
  composition: { 
    type: String, 
    default: '', 
    trim: true 
  },
  packSize: { 
    type: String, 
    default: 'Blister / Strip / Bottle / Alu-Alu', 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  sourcePage: { 
    type: Number, 
    required: true 
  },
  sourceDocument: { 
    type: String, 
    default: 'BJK Healthcare Product Brochure' 
  },
  verificationStatus: { 
    type: String, 
    enum: ['BROCHURE_SOURCE', 'VERIFIED', 'AUDITED', 'PENDING'], 
    default: 'BROCHURE_SOURCE', 
    index: true 
  },
  manufacturingCapability: { 
    type: String, 
    default: 'WHO-GMP Compliant Line' 
  },
  regulatoryStatus: { 
    type: String, 
    default: 'Approved for Formulation & Export' 
  },
  countries: [{ 
    type: String 
  }],
  documents: [{
    title: String,
    url: String,
    docType: String
  }],
  availableStrengths: [{ 
    type: String 
  }],
  classification: { 
    type: String, 
    default: 'PUBLIC' 
  },
  isActive: { 
    type: Boolean, 
    default: true, 
    index: true 
  }
}, {
  timestamps: true
});

// Single and compound indexes for fast searching and filtering
ProductSchema.index({ productName: 'text', genericName: 'text', description: 'text' });
ProductSchema.index({ category: 1, dosageForm: 1 });
ProductSchema.index({ verificationStatus: 1, isActive: 1 });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
