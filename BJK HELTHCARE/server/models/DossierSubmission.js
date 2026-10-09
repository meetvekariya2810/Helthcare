const mongoose = require('mongoose');

const DossierSubmissionSchema = new mongoose.Schema({
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
  submissionType: { 
    type: String, 
    enum: ['eCTD_MODULE_1_5', 'ACTD', 'NATIONAL_FORMAT', 'VARIATION_NOTIFICATION', 'ANNUAL_RENEWAL'], 
    default: 'eCTD_MODULE_1_5' 
  },
  dossierNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  submittedDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PREPARATION', 'SUBMITTED', 'QUERY_RECEIVED', 'QUERY_RESPONDED', 'APPROVED', 'REJECTED'], 
    default: 'SUBMITTED', 
    index: true 
  },
  authority: { 
    type: String, 
    required: true 
  },
  nextAction: { 
    type: String, 
    default: '' 
  },
  deadline: { 
    type: Date, 
    default: null, 
    index: true 
  }
}, {
  timestamps: true
});

DossierSubmissionSchema.index({ status: 1, deadline: 1 });

module.exports = mongoose.models.DossierSubmission || mongoose.model('DossierSubmission', DossierSubmissionSchema);
