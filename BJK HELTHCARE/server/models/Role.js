const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Role name is required'], 
    unique: true, 
    trim: true,
    uppercase: true 
  },
  description: { 
    type: String, 
    default: '', 
    trim: true 
  },
  permissions: [{ 
    type: String,
    trim: true 
  }],
  moduleAccess: [{ 
    type: String,
    trim: true 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

RoleSchema.index({ name: 1 });
RoleSchema.index({ isActive: 1 });

module.exports = mongoose.models.Role || mongoose.model('Role', RoleSchema);
