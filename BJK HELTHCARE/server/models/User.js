const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'User name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email address is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: false, 
    select: false 
  },
  passwordHash: { 
    type: String, 
    required: false, 
    select: false 
  },
  role: { 
    type: String, 
    required: true, 
    default: 'EMPLOYEE',
    uppercase: true,
    trim: true,
    enum: [
      'SUPER_ADMIN',
      'DIRECTOR',
      'OPERATIONS_MANAGER',
      'PRODUCTION_MANAGER',
      'QC_MANAGER',
      'QA_MANAGER',
      'REGULATORY_MANAGER',
      'WAREHOUSE_MANAGER',
      'SALES_MANAGER',
      'CRM_MANAGER',
      'EXPORT_MANAGER',
      'FINANCE_MANAGER',
      'DOCUMENT_CONTROLLER',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR',
      'DEPARTMENT_MANAGER',
      'DEPARTMENT_HEAD',
      'MANAGER',
      'TEAM_HEAD',
      'TEAM_LEAD',
      'SENIOR_EMPLOYEE',
      'EMPLOYEE',
      'QC',
      'QA',
      'PRODUCTION',
      'WAREHOUSE',
      'REGULATORY',
      'SALES',
      'CRM',
      'EXPORT',
      'FINANCE',
      'AUDITOR',
      'REGULATORY_VIEWER',
      'EXECUTIVE_VIEWER',
      'SYSTEM_ADMINISTRATOR',
      'ADMIN',
      'IT_ADMIN',
      'RECRUITER',
      'PAYROLL_ADMIN',
      'SUPPLY_CHAIN_MANAGER',
      'CANTEEN_ADMIN'
    ]
  },
  department: { 
    type: String, 
    default: 'General', 
    trim: true 
  },
  subDepartment: { 
    type: String, 
    default: '', 
    trim: true 
  },
  facility: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Facility', 
    default: null 
  },
  facilityName: { 
    type: String, 
    default: 'Corporate Office - Ahmedabad' 
  },
  permissions: [{ 
    type: String 
  }],
  phone: { 
    type: String, 
    default: '', 
    trim: true 
  },
  workEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  username: {
    type: String,
    trim: true,
    default: ''
  },
  designation: {
    type: String,
    trim: true,
    default: ''
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reportingManagerName: {
    type: String,
    trim: true,
    default: ''
  },
  personalEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: ''
  },
  employeeId: { 
    type: String, 
    default: null 
  },
  employeeCode: {
    type: String,
    default: '',
    trim: true
  },
  importBatchId: {
    type: String,
    default: ''
  },
  firstLogin: {
    type: Boolean,
    default: false
  },
  mustChangePassword: {
    type: Boolean,
    default: false
  },
  temporaryPassword: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedReason: {
    type: String,
    default: ''
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountExpiry: {
    type: Date,
    default: null
  },
  approvalPermissions: [{
    type: String,
    trim: true
  }],
  accessConfig: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'DISABLED', 'DELETED', 'PENDING'],
    default: 'ACTIVE'
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  dataScope: {
    type: String,
    enum: ['SELF', 'TEAM', 'DEPARTMENT', 'FACILITY', 'COMPANY', 'SYSTEM'],
    default: function() {
      if (this.role === 'SUPER_ADMIN' || this.role === 'DIRECTOR') return 'SYSTEM';
      if (['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'AUDITOR', 'FINANCE_MANAGER', 'PAYROLL_ADMIN'].includes(this.role)) return 'COMPANY';
      if (['QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER', 'REGULATORY_MANAGER'].includes(this.role)) return 'DEPARTMENT';
      return 'SELF';
    }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date, 
    default: null 
  },
  passwordChangedAt: { 
    type: Date, 
    default: null 
  },
  isDemo: { 
    type: Boolean, 
    default: false 
  },
  resetPasswordToken: {
    type: String,
    default: null,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual getter and setter for isFirstLogin
UserSchema.virtual('isFirstLogin')
  .get(function() {
    return Boolean(this.firstLogin || this.mustChangePassword);
  })
  .set(function(val) {
    this.firstLogin = Boolean(val);
    this.mustChangePassword = Boolean(val);
  });

// Indexes for fast lookups
UserSchema.index({ email: 1 });
UserSchema.index({ workEmail: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ employeeId: 1 });
UserSchema.index({ employeeCode: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ status: 1 });

// Automatically sync password and passwordHash
UserSchema.pre('save', async function(next) {
  const pwdToHash = this.password || this.passwordHash;
  if (!this.isModified('password') && !this.isModified('passwordHash')) {
    return next();
  }

  if (pwdToHash && !pwdToHash.startsWith('$2')) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pwdToHash, salt);
    this.password = hash;
    this.passwordHash = hash;
    this.passwordChangedAt = new Date();
  } else if (pwdToHash && pwdToHash.startsWith('$2')) {
    this.password = pwdToHash;
    this.passwordHash = pwdToHash;
  }
  next();
});

// Compare password helper
UserSchema.methods.comparePassword = async function(candidatePassword) {
  const hash = this.password || this.passwordHash;
  if (!hash) return false;
  return await bcrypt.compare(candidatePassword, hash);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
