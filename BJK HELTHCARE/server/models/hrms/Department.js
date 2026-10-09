const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  facility: { 
    type: String, 
    required: true, 
    default: 'Ahmedabad Branch'
  },
  branch: {
    type: String,
    default: 'Ahmedabad Branch'
  },
  order: {
    type: Number,
    default: 0
  },
  division: { type: String, default: 'Operations' },
  headOfDepartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    default: null 
  },
  headOfDepartmentName: { type: String, default: '' },
  managers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  }],
  parentDepartment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department',
    default: null 
  },
  subDepartments: [{
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, default: '' },
    headName: { type: String, default: '' },
    employeeCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }],
  permissions: [{
    type: String,
    trim: true
  }],
  description: { type: String, default: '' },
  budget: { type: Number, default: 0 },
  teams: [{ type: String }],
  complianceRequirements: [{
    type: String // e.g. GMP, GLP, GDP, SOP-04, Data Integrity
  }],
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

DepartmentSchema.index({ facility: 1 });
DepartmentSchema.index({ branch: 1 });
DepartmentSchema.index({ order: 1 });

module.exports = mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
