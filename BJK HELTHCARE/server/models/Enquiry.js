const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  company: { 
    type: String, 
    required: true, 
    trim: true, 
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    index: true 
  },
  phone: { 
    type: String, 
    default: '', 
    trim: true 
  },
  country: { 
    type: String, 
    required: true, 
    trim: true 
  },
  enquiryType: { 
    type: String, 
    enum: [
      'PRODUCT_INQUIRY',
      'CONTRACT_MANUFACTURING',
      'EXPORT_DISTRIBUTION',
      'DOSSIER_LICENSING',
      'LOAN_LICENSING',
      'CMO',
      'SALES',
      'REGULATORY',
      'PARTNERSHIP',
      'GENERAL',
      'WEBSITE'
    ], 
    default: 'GENERAL' 
  },
  category: {
    type: String,
    enum: ['SALES', 'REGULATORY', 'CMO', 'LOAN_LICENSING', 'PARTNERSHIP', 'GENERAL'],
    default: 'GENERAL'
  },
  message: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    default: 'WEBSITE_PORTAL' 
  },
  status: { 
    type: String, 
    enum: ['NEW', 'IN_REVIEW', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'CLOSED'], 
    default: 'NEW', 
    index: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  assignedToName: { 
    type: String, 
    default: '' 
  },
  priority: { 
    type: String, 
    enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'], 
    default: 'MEDIUM' 
  },
  aiCategory: { 
    type: String, 
    default: 'Commercial Inquiry' 
  }
}, {
  timestamps: true
});

EnquirySchema.index({ email: 1, company: 1 });
EnquirySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
