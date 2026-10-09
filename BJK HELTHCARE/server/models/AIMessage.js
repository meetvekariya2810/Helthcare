const mongoose = require('mongoose');

const AIMessageSchema = new mongoose.Schema({
  conversation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AIConversation', 
    required: true,
    index: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  sources: [{
    title: String,
    page: Number,
    document: String,
    verified: Boolean
  }]
}, {
  timestamps: true
});

AIMessageSchema.index({ conversation: 1, createdAt: 1 });

module.exports = mongoose.models.AIMessage || mongoose.model('AIMessage', AIMessageSchema);
