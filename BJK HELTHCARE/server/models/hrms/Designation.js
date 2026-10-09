const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department',
    required: true 
  },
  departmentName: { type: String, required: true },
  level: { 
    type: String, 
    required: true,
    enum: ['Junior', 'Associate', 'Executive', 'Senior Executive', 'Assistant Manager', 'Manager', 'Senior Manager', 'Deputy General Manager', 'General Manager', 'Vice President', 'Director']
  },
  requiredQualifications: [{ type: String }], // e.g. B.Pharm, M.Pharm, B.Sc Chemistry, M.Sc Microbiology
  requiredCertifications: [{ type: String }], // e.g. GMP Level 2, GLP Certified, Data Integrity SOP
  standardMinSalary: { type: Number, default: 0 },
  standardMaxSalary: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

DesignationSchema.index({ title: 1 });
DesignationSchema.index({ department: 1 });

module.exports = mongoose.models.Designation || mongoose.model('Designation', DesignationSchema);
