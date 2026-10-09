const mongoose = require('mongoose');

const KnowledgeEntitySchema = new mongoose.Schema({
  entityType: { 
    type: String, 
    required: true, 
    enum: ['COMPANY', 'FACILITY', 'DEPARTMENT', 'PRODUCT', 'BATCH', 'QC', 'QA', 'REGULATORY', 'CUSTOMER'], 
    index: true 
  },
  entityId: { 
    type: String, 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  }
}, {
  timestamps: true
});

KnowledgeEntitySchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.models.KnowledgeEntity || mongoose.model('KnowledgeEntity', KnowledgeEntitySchema);
