const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

const EmployeeSchema = new mongoose.Schema({
  employeeCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  employeeId: {
    type: String,
    trim: true,
    uppercase: true
  },
  firstName: { 
    type: String, 
    required: [true, 'First Name is required'], 
    trim: true 
  },
  lastName: { 
    type: String, 
    required: [true, 'Last Name is required'], 
    trim: true 
  },
  fullName: { 
    type: String, 
    trim: true 
  },
  photo: { type: String, default: '' },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [emailRegex, 'Please provide a valid email address']
  },
  personalEmail: { type: String, default: '' },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'], 
    trim: true,
    match: [phoneRegex, 'Please provide a valid phone number']
  },

  // Department and Designation can be String or ObjectId
  department: { 
    type: mongoose.Schema.Types.Mixed, 
    required: [true, 'Department is required']
  },
  departmentName: { 
    type: String, 
    default: function() {
      return typeof this.department === 'string' ? this.department : 'Production Operations';
    }
  },
  designation: { 
    type: mongoose.Schema.Types.Mixed, 
    required: [true, 'Designation is required']
  },
  designationTitle: { 
    type: String, 
    default: function() {
      return typeof this.designation === 'string' ? this.designation : 'Production Line Operator';
    }
  },
  reportingManager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee',
    default: null 
  },
  managerName: { type: String, default: '' },
  facility: { 
    type: String, 
    required: [true, 'Facility is required'], 
    default: 'BJK Unit 1 - Formulations Facility'
  },
  basicSalary: { 
    type: Number, 
    default: 0,
    min: [0, 'Basic salary must be greater than or equal to 0']
  },
  employmentType: { 
    type: String, 
    enum: ['FULL_TIME', 'CONTRACT', 'INTERN', 'PROBATION', 'TEMPORARY'],
    default: 'FULL_TIME'
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED', 'ON_LEAVE', 'PROBATION', 'SUSPENDED', 'TERMINATED', 'RESIGNED'],
    default: 'ACTIVE'
  },
  assignedShift: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shift',
    default: null 
  },
  shiftName: { type: String, default: 'General Shift (09:00 - 18:00)' },

  joiningDate: { 
    type: Date, 
    default: Date.now 
  },
  confirmationDate: { type: Date, default: null },
  probationEndDate: { type: Date, default: null },
  resignationDate: { type: Date, default: null },

  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'], default: 'Male' },
  bloodGroup: { type: String, default: 'O+' },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
  currentAddress: { type: String, default: '' },
  permanentAddress: { type: String, default: '' },

  emergencyContact: {
    name: { type: String, default: '' },
    relation: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
  },

  sensitiveData: {
    aadhaarNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      branch: { type: String, default: '' }
    },
    salaryDetails: {
      basicPay: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      transportAllowance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      grossSalary: { type: Number, default: 0 },
      ctc: { type: Number, default: 0 }
    },
    medicalFitness: {
      fitnessCertificateStatus: { type: String, enum: ['FIT', 'UNFIT', 'PENDING_CHECKUP'], default: 'FIT' },
      fitForCleanroom: { type: Boolean, default: true },
      allergies: { type: String, default: 'None reported' },
      lastCheckupDate: { type: Date, default: null },
      nextCheckupDue: { type: Date, default: null }
    }
  },

  qualifications: [{
    degree: { type: String },
    specialization: { type: String },
    institution: { type: String },
    yearOfPassing: { type: Number },
    percentage: { type: String }
  }],
  skills: [{ type: String }],

  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

EmployeeSchema.pre('save', function(next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  if (this.employeeCode && !this.employeeId) {
    this.employeeId = this.employeeCode;
  } else if (this.employeeId && !this.employeeCode) {
    this.employeeCode = this.employeeId;
  }
  if (typeof this.department === 'string') {
    this.departmentName = this.department;
  }
  if (typeof this.designation === 'string') {
    this.designationTitle = this.designation;
  }
  if (this.basicSalary && (!this.sensitiveData || !this.sensitiveData.salaryDetails || !this.sensitiveData.salaryDetails.basicPay)) {
    if (!this.sensitiveData) this.sensitiveData = {};
    if (!this.sensitiveData.salaryDetails) this.sensitiveData.salaryDetails = {};
    this.sensitiveData.salaryDetails.basicPay = this.basicSalary;
    this.sensitiveData.salaryDetails.grossSalary = Number(this.basicSalary) * 1.4 + 5000;
  } else if (this.sensitiveData && this.sensitiveData.salaryDetails && this.sensitiveData.salaryDetails.basicPay && !this.basicSalary) {
    this.basicSalary = this.sensitiveData.salaryDetails.basicPay;
  }
  next();
});

EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ employeeCode: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ facility: 1 });
EmployeeSchema.index({ joiningDate: -1 });

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
