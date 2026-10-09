const mongoose = require('mongoose');

const AIConversationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    default: 'Executive Operations Briefing', 
    trim: true 
  },
  context: { 
    type: String, 
    default: 'BJK Healthcare Operational Brain' 
  }
}, {
  timestamps: true
});

AIConversationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.models.AIConversation || mongoose.model('AIConversation', AIConversationSchema);
