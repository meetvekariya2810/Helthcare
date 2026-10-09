const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema({
  auditNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  auditType: { 
    type: String, 
    enum: ['INTERNAL_GMP', 'REGULATORY_USFDA', 'REGULATORY_WHOGMP', 'VENDOR_SUPPLIER', 'DATA_INTEGRITY_21CFR11'], 
    default: 'INTERNAL_GMP' 
  },
  department: { 
    type: String, 
    required: true 
  },
  leadAuditor: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['SCHEDULED', 'IN_PROGRESS', 'REPORT_PENDING', 'CAPA_PENDING', 'CLOSED'], 
    default: 'SCHEDULED', 
    index: true 
  },
  scheduledDate: { 
    type: Date, 
    required: true 
  },
  completedDate: { 
    type: Date, 
    default: null 
  },
  findingsCount: { 
    type: Number, 
    default: 0 
  },
  findings: [{
    classification: { type: String, enum: ['CRITICAL', 'MAJOR', 'MINOR', 'OBSERVATION'] },
    observation: String,
    capaRequired: Boolean,
    status: { type: String, default: 'OPEN' }
  }],
  reportUrl: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: true
});

AuditSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
