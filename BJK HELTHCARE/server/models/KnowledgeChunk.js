const mongoose = require('mongoose');

const KnowledgeChunkSchema = new mongoose.Schema({
  entity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'KnowledgeEntity', 
    default: null,
    index: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  source: { 
    type: String, 
    required: true, 
    default: 'Official BJK Healthcare Product Brochure' 
  },
  sourcePage: { 
    type: Number, 
    default: null 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  embedding: { 
    type: [Number], 
    default: [] 
  }
}, {
  timestamps: true
});

KnowledgeChunkSchema.index({ content: 'text', source: 'text' });

module.exports = mongoose.models.KnowledgeChunk || mongoose.model('KnowledgeChunk', KnowledgeChunkSchema);
