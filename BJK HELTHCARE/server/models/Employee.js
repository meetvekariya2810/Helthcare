const mongoose = require('mongoose');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

// 1. Previous Employment Subschema
const PreviousEmploymentSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  companyAddress: { type: String, default: '', trim: true },
  companyWebsite: { type: String, default: '', trim: true },
  industry: { type: String, default: 'Pharmaceuticals / Healthcare', trim: true },
  designation: { type: String, required: true, trim: true },
  department: { type: String, default: '', trim: true },
  employeeId: { type: String, default: '', trim: true },
  employmentType: { type: String, default: 'Full Time' },
  joiningDate: { type: Date, default: null },
  leavingDate: { type: Date, default: null },
  totalExperience: { type: String, default: '' },
  lastDrawnSalary: { type: String, default: '' },
  reportingManager: { type: String, default: '', trim: true },
  managerContact: { type: String, default: '', trim: true },
  reasonForLeaving: { type: String, default: '', trim: true },
  majorResponsibilities: { type: String, default: '' },
  keyAchievements: { type: String, default: '' },
  skillsUsed: [{ type: String }],
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'NOT_APPLICABLE', 'REJECTED'], 
    default: 'PENDING' 
  },
  experienceCertificateUrl: { type: String, default: '' },
  relievingLetterUrl: { type: String, default: '' },
  salarySlipUrl: { type: String, default: '' },
  referenceContact: { type: String, default: '' },
  referenceEmail: { type: String, default: '' },
  referencePhone: { type: String, default: '' }
}, { _id: true });

// 2. Education & Professional Qualifications Subschema
const EducationSchema = new mongoose.Schema({
  qualification: { type: String, required: true }, // e.g. B.Pharm, M.Pharm, B.Sc, B.Tech, MBA, 12th
  degree: { type: String, required: true },
  specialization: { type: String, default: '' },
  institutionName: { type: String, required: true },
  universityBoard: { type: String, default: '' },
  country: { type: String, default: 'India' },
  state: { type: String, default: 'Gujarat' },
  startYear: { type: Number, default: null },
  passingYear: { type: Number, required: true },
  percentageOrCgpa: { type: String, default: '' },
  grade: { type: String, default: '' },
  registrationNumber: { type: String, default: '' },
  certificateNumber: { type: String, default: '' },
  certificateUrl: { type: String, default: '' },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED'], 
    default: 'PENDING' 
  }
}, { _id: true });

// Achievements Subschema
const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: 'Professional Excellence' },
  organization: { type: String, default: 'BJK Healthcare' },
  date: { type: Date, default: Date.now },
  description: { type: String, default: '' },
  certificateUrl: { type: String, default: '' }
}, { _id: true });

// 3. Identity & Government Documents Subschema
const IdentityDocumentSchema = new mongoose.Schema({
  documentType: { 
    type: String, 
    required: true,
    enum: ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID', 'BIRTH_CERTIFICATE', 'OTHER_GOVT_ID', 'OTHER'] 
  },
  documentNumber: { type: String, required: true, trim: true },
  issueDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  issuingAuthority: { type: String, default: 'Govt of India' },
  fileUrl: { type: String, default: '' },
  verificationStatus: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'], 
    default: 'PENDING' 
  },
  verifiedBy: { type: String, default: '' },
  verificationDate: { type: Date, default: null },
  remarks: { type: String, default: '' }
}, { _id: true });

// 4. Family Members Subschema (Step 5)
const FamilyMemberSchema = new mongoose.Schema({
  relationship: { 
    type: String, 
    enum: ['Spouse', 'Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Other'],
    default: 'Father'
  },
  name: { type: String, required: true, trim: true },
  dob: { type: Date, default: null },
  gender: { type: String, default: 'Male' },
  occupation: { type: String, default: '' },
  mobile: { type: String, default: '' },
  email: { type: String, default: '' },
  dependent: { type: Boolean, default: false },
  nominee: { type: Boolean, default: false },
  emergencyContact: { type: Boolean, default: false }
}, { _id: true });

// 5. Emergency Contacts Subschema (Step 6)
const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  relationship: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  alternateMobile: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false }
}, { _id: true });

// 6. Pending Due Subschema (Step 13)
const PendingDueSchema = new mongoose.Schema({
  dueType: { 
    type: String, 
    enum: ['Salary Advance', 'Loan', 'Asset Recovery', 'Notice Period Recovery', 'Travel Advance', 'Other'],
    default: 'Salary Advance'
  },
  amount: { type: Number, required: true, default: 0 },
  dueDate: { type: Date, default: Date.now },
  paidAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Waived'], 
    default: 'Pending' 
  },
  remarks: { type: String, default: '' }
}, { _id: true });

// 7. HR Notes Subschema (Step 14)
const HRNoteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  noteType: { 
    type: String, 
    enum: ['General', 'Performance', 'Disciplinary', 'HR', 'Payroll', 'Attendance', 'Confidential', 'Other'],
    default: 'General'
  },
  description: { type: String, required: true },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
  attachmentUrl: { type: String, default: '' },
  createdBy: { type: String, default: 'HR Admin' },
  createdAt: { type: Date, default: Date.now },
  isConfidential: { type: Boolean, default: false }
}, { _id: true });

// 8. Identity Card Subschema (Step 18)
const IdentityCardSchema = new mongoose.Schema({
  cardTemplate: { type: String, default: 'MODERN_HEALTHCARE' },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'REGENERATED', 'SUSPENDED'], default: 'ACTIVE' },
  qrVerificationCode: { type: String, default: '' },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: 'System' },
  frontUrl: { type: String, default: '' },
  backUrl: { type: String, default: '' },
  branch: { type: String, default: 'Ahmedabad' }
}, { _id: false });

// 9. Digital Business Card Subschema (Step 12)
const BusinessCardSchema = new mongoose.Schema({
  cardTemplate: { type: String, default: 'EXECUTIVE_BJK' },
  qrCode: { type: String, default: '' },
  previewUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  displayOnCard: { type: Boolean, default: true },
  generatedAt: { type: Date, default: Date.now }
}, { _id: false });

// 10. Healthcare & Pharmaceutical Compliance Training Subschema
const ComplianceTrainingSchema = new mongoose.Schema({
  trainingType: { 
    type: String, 
    required: true,
    enum: [
      'GMP_TRAINING',
      'GDP_TRAINING',
      'GXP_TRAINING',
      'SOP_TRAINING',
      'SAFETY_TRAINING',
      'FIRE_SAFETY_TRAINING',
      'WORKPLACE_SAFETY_TRAINING',
      'DATA_INTEGRITY_TRAINING',
      'QUALITY_TRAINING',
      'REGULATORY_TRAINING',
      'PHARMACOVIGILANCE_TRAINING',
      'INFORMATION_SECURITY_TRAINING',
      'HYGIENE_TRAINING',
      'PPE_TRAINING',
      'DEPARTMENT_SPECIFIC_TRAINING'
    ]
  },
  title: { type: String, required: true },
  trainingDate: { type: Date, default: Date.now },
  trainer: { type: String, default: 'Corporate QA / Safety Officer' },
  certificateUrl: { type: String, default: '' },
  validityMonths: { type: Number, default: 12 },
  expiryDate: { type: Date, default: null },
  status: { type: String, enum: ['COMPLETED', 'PENDING', 'EXPIRED', 'EXEMPTED'], default: 'COMPLETED' },
  isMandatory: { type: Boolean, default: true },
  complianceStatus: { type: String, enum: ['COMPLIANT', 'OVERDUE', 'DUE_SOON'], default: 'COMPLIANT' }
}, { _id: true });

// 11. Employee Lifecycle History Subschema (Step 22)
const LifecycleEventSchema = new mongoose.Schema({
  event: { 
    type: String, 
    required: true,
    enum: [
      'CANDIDATE_SELECTED',
      'PRE_ONBOARDING',
      'ONBOARDING',
      'PROBATION_STARTED',
      'ACTIVE',
      'CONFIRMED',
      'PROMOTION',
      'TRANSFER',
      'NOTICE_PERIOD',
      'RESIGNED',
      'TERMINATED',
      'RETIRED',
      'FORMER_EMPLOYEE',
      'ARCHIVED',
      'OFFER_RELEASED',
      'OFFER_ACCEPTED',
      'ONBOARDING_DRAFT',
      'ONBOARDING_SUBMITTED',
      'HR_VERIFIED',
      'JOINED',
      'INTERNAL_TRANSFER',
      'ROLE_CHANGE',
      'SALARY_REVISION',
      'LEAVE_TAKEN',
      'EXIT_INTERVIEW',
      'RELIEVED'
    ]
  },
  previousValue: { type: String, default: '' },
  newValue: { type: String, default: '' },
  effectiveDate: { type: Date, default: Date.now },
  reason: { type: String, default: '' },
  changedBy: { type: String, default: 'HR Administrator' },
  approvalRef: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Core Employee Master Schema
const EmployeeSchema = new mongoose.Schema({
  // Identification
  employeeCode: { type: String, trim: true, uppercase: true },
  employeeId: { type: String, trim: true, uppercase: true, unique: true },
  employeeSerialNumber: { type: Number, default: null },
  srNo: { type: Number, default: null },
  importBatchId: { type: String, default: '' },
  sourceMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Status & Classification
  employeeCategory: {
    type: String,
    enum: ['TECHNICAL', 'NON_TECHNICAL'],
    default: 'TECHNICAL'
  },
  isNonTechnical: { type: Boolean, default: false },
  staffCategory: { 
    type: String, 
    enum: ['TECHNICAL', 'NON_TECHNICAL'], 
    default: 'TECHNICAL' 
  },
  status: { 
    type: String, 
    enum: [
      'DRAFT', 'PENDING_VERIFICATION', 'ACTIVE', 'ON_PROBATION', 'PROBATION', 
      'CONFIRMED', 'ON_HOLD', 'NOTICE_PERIOD', 'ON_LEAVE', 'SUSPENDED', 
      'RESIGNED', 'TERMINATED', 'RETIRED', 'FORMER_EMPLOYEE', 'INACTIVE', 'ARCHIVED'
    ],
    default: 'ACTIVE'
  },
  employmentStatus: { 
    type: String, 
    default: 'Active'
  },
  onboardingStatus: {
    type: String,
    enum: ['DRAFT', 'SUBMITTED', 'HR_REVIEW', 'DOCUMENT_VERIFICATION', 'BANK_VERIFICATION', 'IDENTITY_VERIFICATION', 'DEPARTMENT_APPROVAL', 'HR_APPROVAL', 'COMPLETED'],
    default: 'COMPLETED'
  },
  onboardingStep: { type: Number, default: 16 },
  profileCompletion: { type: Number, default: 100 },

  // ==========================================
  // STEP 01: PERSONAL INFORMATION
  // ==========================================
  photo: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  firstName: { type: String, required: [true, 'First Name is required'], trim: true },
  middleName: { type: String, trim: true, default: '' },
  lastName: { type: String, default: '', trim: true },
  fullName: { type: String, trim: true },
  age: { type: String, default: '', trim: true },
  uanNumber: { type: String, default: '', trim: true },
  yearsOfService: { type: String, default: '', trim: true },
  fatherName: { type: String, default: '', trim: true },
  motherName: { type: String, default: '', trim: true },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, default: 'Male' },
  bloodGroup: { type: String, default: 'O+' },
  maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'], default: 'Single' },
  nationality: { type: String, default: 'Indian' },
  religion: { type: String, default: 'Hinduism' },
  personalEmail: { type: String, default: '', trim: true, lowercase: true },
  personalMobile: { type: String, default: '', trim: true },
  aadhaarNumber: { type: String, default: '', trim: true },
  governmentId: { type: String, default: '', trim: true },
  panNumber: { type: String, default: '', trim: true, uppercase: true },

  // ==========================================
  // STEP 02: JOB INFORMATION
  // ==========================================
  joiningDate: { type: Date, default: Date.now },
  dateOfJoining: { type: Date, default: Date.now },
  dateOfLeaving: { type: Date, default: null },
  employmentType: { 
    type: String, 
    default: 'FULL_TIME'
  },
  employeeCategory: { 
    type: String, 
    enum: ['TECHNICAL', 'NON_TECHNICAL'], 
    default: 'TECHNICAL' 
  },
  staffCategory: { 
    type: String, 
    enum: ['TECHNICAL', 'NON_TECHNICAL'], 
    default: 'TECHNICAL' 
  },
  isNonTechnical: { 
    type: Boolean, 
    default: false 
  },
  designation: { type: mongoose.Schema.Types.Mixed, required: [true, 'Designation is required'] },
  designationTitle: { 
    type: String, 
    default: function() {
      return typeof this.designation === 'string' ? this.designation : 'Officer';
    }
  },
  department: { type: mongoose.Schema.Types.Mixed, required: [true, 'Department is required'] },
  departmentName: { 
    type: String, 
    default: function() {
      return typeof this.department === 'string' ? this.department : 'Production';
    }
  },
  subDepartment: { type: String, default: '' },
  grade: { type: String, default: 'L1' },
  skillLevel: { type: String, default: 'Skilled' },
  branch: { type: String, default: 'Ahmedabad' },
  facility: { type: String, default: 'BJK Unit 1 - Formulations Facility' },
  workLocation: { type: String, default: 'Ahmedabad Plant' },
  jobLocation: { type: String, default: 'Ahmedabad' },
  reportingManager: { type: mongoose.Schema.Types.Mixed, default: null },
  reportingManagerName: { type: String, default: '' },
  managerName: { type: String, default: '' },
  hrManager: { type: String, default: 'Kritika Parmar' },
  team: { type: String, default: 'Operations' },
  shift: { type: String, default: 'General Shift (09:00 - 18:00)' },
  alternativeShift: { type: String, default: 'None' },
  companyTransport: { type: Boolean, default: false },
  companyAccommodation: { type: Boolean, default: false },
  probationPeriod: { type: String, default: '6 Months' },
  probationPeriodMonths: { type: Number, default: 6 },
  probationStartDate: { type: Date, default: null },
  probationEndDate: { type: Date, default: null },
  permanentEmployeeDate: { type: Date, default: null },
  confirmationDate: { type: Date, default: null },
  retirementAge: { type: Number, default: 58 },
  previousMemberId: { type: String, default: '' },
  noticePeriodDays: { type: Number, default: 30 },
  workingHours: { type: String, default: '09:00 - 18:00' },
  weeklyWorkingDays: { type: Number, default: 6 },
  resignationDate: { type: Date, default: null },
  lastWorkingDate: { type: Date, default: null },
  employmentRemarks: { type: String, default: '' },

  assignedShift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', default: null },
  shiftName: { type: String, default: 'General Shift (09:00 - 18:00)' },

  // ==========================================
  // STEP 03: CONTACT DETAILS
  // ==========================================
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [emailRegex, 'Please provide a valid email address']
  },
  workEmail: { type: String, lowercase: true, trim: true, default: '' },
  phone: { 
    type: String, 
    default: '', 
    trim: true
  },
  officialMobile: { type: String, default: '', trim: true },
  alternateMobile: { type: String, default: '', trim: true },
  workPhone: { type: String, default: '' },
  emergencyPhone: { type: String, default: '' },

  // Current Address
  currentAddressDetails: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: 'Ahmedabad' },
    state: { type: String, default: 'Gujarat' },
    country: { type: String, default: 'India' },
    pinCode: { type: String, default: '382330' }
  },
  currentAddress: { type: String, default: '' },

  // Permanent Address
  permanentAddressDetails: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: 'Ahmedabad' },
    state: { type: String, default: 'Gujarat' },
    country: { type: String, default: 'India' },
    pinCode: { type: String, default: '382330' },
    sameAsCurrent: { type: Boolean, default: true }
  },
  permanentAddress: { type: String, default: '' },
  city: { type: String, default: 'Ahmedabad' },
  state: { type: String, default: 'Gujarat' },
  country: { type: String, default: 'India' },
  postalCode: { type: String, default: '382330' },

  // ==========================================
  // STEP 04: WFH ADDRESS
  // ==========================================
  wfhDetails: {
    wfhEligible: { type: Boolean, default: false },
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pinCode: { type: String, default: '' },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    wfhApprovalStatus: { 
      type: String, 
      enum: ['Not Applicable', 'Eligible', 'Pending Approval', 'Approved', 'Rejected'],
      default: 'Not Applicable'
    },
    approvedBy: { type: String, default: '' },
    approvalDate: { type: Date, default: null },
    wfhRemarks: { type: String, default: '' }
  },

  // ==========================================
  // STEP 05: FAMILY DETAILS
  // ==========================================
  familyMembers: [FamilyMemberSchema],
  familyDetails: {
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    spouseName: { type: String, default: '' },
    childrenCount: { type: Number, default: 0 },
    dependentsCount: { type: Number, default: 0 },
    familyMembersSummary: { type: String, default: '' },
    nomineeName: { type: String, default: '' },
    nomineeRelationship: { type: String, default: '' },
    nomineeDateOfBirth: { type: Date, default: null },
    nomineeContact: { type: String, default: '' },
    nomineeAddress: { type: String, default: '' }
  },

  // ==========================================
  // STEP 06: EMERGENCY CONTACTS
  // ==========================================
  emergencyContacts: [EmergencyContactSchema],
  emergencyContact: {
    name: { type: String, default: '' },
    relation: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  emergencyContactName: { type: String, default: '' },
  emergencyContactRelation: { type: String, default: '' },
  emergencyContactPhone: { type: String, default: '' },
  emergencyContactEmail: { type: String, default: '' },

  // ==========================================
  // STEP 07: EDUCATION & ACHIEVEMENTS
  // ==========================================
  educationDetails: [EducationSchema],
  achievements: [AchievementSchema],
  qualifications: [{
    degree: { type: String },
    specialization: { type: String },
    institution: { type: String },
    yearOfPassing: { type: Number },
    percentage: { type: String }
  }],
  skills: [{ type: String }],

  // ==========================================
  // STEP 08: PREVIOUS EXPERIENCE
  // ==========================================
  previousEmployment: [PreviousEmploymentSchema],
  calculatedExperience: {
    previousExperienceYears: { type: Number, default: 0 },
    currentBjkExperienceYears: { type: Number, default: 0 },
    totalProfessionalExperienceYears: { type: Number, default: 0 }
  },

  // ==========================================
  // STEP 09: QUICK LINKS (Card shortcut preferences)
  // ==========================================
  quickLinks: {
    attendance: { type: Boolean, default: true },
    leave: { type: Boolean, default: true },
    payroll: { type: Boolean, default: true },
    assets: { type: Boolean, default: true },
    documents: { type: Boolean, default: true },
    wfh: { type: Boolean, default: true },
    holidays: { type: Boolean, default: true }
  },

  // ==========================================
  // STEP 10: SOCIAL LINKS
  // ==========================================
  socialLinks: {
    linkedin: { type: String, default: '' },
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    personalWebsite: { type: String, default: '' },
    other: { type: String, default: '' },
    displayOnBusinessCard: { type: Boolean, default: true }
  },

  // ==========================================
  // STEP 11: TEAM & HIERARCHY
  // ==========================================
  teamStructure: {
    departmentHead: { type: String, default: '' },
    reportingManager: { type: mongoose.Schema.Types.Mixed, default: null },
    hrManager: { type: String, default: 'Kritika Parmar' },
    teamLeader: { type: String, default: '' },
    teamName: { type: String, default: 'Operations' },
    teamMembers: [{ type: String }],
    directReports: [{ type: String }],
    hierarchyLevel: { type: String, default: 'Associate' }
  },
  departmentHead: { type: String, default: '' },
  businessUnit: { type: String, default: 'Formulations & Generics' },
  location: { type: String, default: 'Ahmedabad Plant' },
  level: { type: String, default: 'Associate' },

  // ==========================================
  // STEP 12: DIGITAL BUSINESS CARD
  // ==========================================
  businessCard: {
    type: BusinessCardSchema,
    default: () => ({})
  },

  // ==========================================
  // STEP 13: PENDING DUE
  // ==========================================
  pendingDues: [PendingDueSchema],

  // ==========================================
  // STEP 14: HR NOTES
  // ==========================================
  hrNotes: [HRNoteSchema],

  // ==========================================
  // STEP 15: DOCUMENTS
  // ==========================================
  documents: [{
    documentId: { type: String, default: () => 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase() },
    documentType: { type: String, required: true },
    documentName: { type: String, required: true },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: String, default: 'HR Master' },
    uploadedAt: { type: Date, default: Date.now },
    verifiedBy: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    verificationStatus: { 
      type: String, 
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'], 
      default: 'PENDING' 
    },
    visibility: { 
      type: String, 
      enum: ['HR_ONLY', 'HR_AND_DIRECTOR', 'MANAGER', 'EMPLOYEE', 'AUTHORIZED_USERS'], 
      default: 'HR_ONLY' 
    },
    expiryDate: { type: Date, default: null },
    version: { type: Number, default: 1 },
    remarks: { type: String, default: '' }
  }],
  identityDocuments: [IdentityDocumentSchema],

  // ==========================================
  // STEP 18: IDENTITY CARD MASTER
  // ==========================================
  identityCard: {
    type: IdentityCardSchema,
    default: () => ({})
  },

  // Bank & Financial
  bankName: { type: String, default: '', trim: true },
  bankAccountNumber: { type: String, default: '', trim: true },
  ifscCode: { type: String, default: '', trim: true },
  bankDetails: {
    accountHolderName: { type: String, default: '' },
    bankName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode: { type: String, default: '' },
    accountType: { type: String, enum: ['SAVINGS', 'CURRENT', 'SALARY'], default: 'SALARY' },
    upiId: { type: String, default: '' },
    cancelledChequeUrl: { type: String, default: '' },
    passbookUrl: { type: String, default: '' },
    verificationStatus: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    verificationDate: { type: Date, default: null },
    verifiedBy: { type: String, default: '' }
  },

  // Salary & Sensitive Data
  basicSalary: { type: Number, default: 0, min: 0 },
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
    }
  },

  // Compliance & Occupational Health
  complianceTraining: [ComplianceTrainingSchema],
  occupationalHealth: {
    medicalFitnessStatus: { type: String, enum: ['FIT', 'UNFIT', 'CONDITIONALLY_FIT', 'PENDING_CHECKUP'], default: 'FIT' },
    fitnessCertificateUrl: { type: String, default: '' },
    medicalExaminationDate: { type: Date, default: null },
    fitnessExpiryDate: { type: Date, default: null },
    occupationalRestrictions: { type: String, default: 'None reported' },
    fitForCleanroom: { type: Boolean, default: true },
    workplaceAccommodation: { type: String, default: 'None required' },
    allergies: { type: String, default: 'None reported' },
    emergencyMedicalContact: { type: String, default: '' },
    vaccinationRecords: [{
      vaccineName: { type: String },
      doseNumber: { type: Number, default: 1 },
      administeredDate: { type: Date, default: null },
      certificateUrl: { type: String, default: '' }
    }]
  },

  // Lifecycle History
  lifecycleEvents: [LifecycleEventSchema],

  // Linked User Account & RBAC
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  systemRole: { type: String, default: 'EMPLOYEE' },
  systemAccessLevel: { type: String, default: 'SELF' },

  // Activity / Audit History (Step 24)
  auditHistory: [{
    user: { type: String, default: 'System' },
    role: { type: String, default: 'HR_ADMIN' },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    changedFields: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }]
  }],

  createdBy: { type: String, default: 'System' },
  updatedBy: { type: String, default: 'System' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Pre-save Middleware: Calculations, ID generation, Full Name, Sync
EmployeeSchema.pre('save', function(next) {
  // 1. Full name
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.middleName ? this.middleName + ' ' : ''}${this.lastName || ''}`.replace(/\s+/g, ' ').trim();
  }

  // 2. Employee ID sync
  if (this.employeeCode && !this.employeeId) {
    this.employeeId = this.employeeCode;
  } else if (this.employeeId && !this.employeeCode) {
    this.employeeCode = this.employeeId;
  }

  // 3. Department and Designation string sync
  if (typeof this.department === 'string') {
    this.departmentName = this.department;
  }
  if (typeof this.designation === 'string') {
    this.designationTitle = this.designation;
  }

  // 4. Branch / Facility sync
  if (this.branch && !this.facility) {
    this.facility = `BJK ${this.branch} Facility`;
  } else if (this.facility && !this.branch) {
    this.branch = this.facility.split(' - ')[0] || 'Ahmedabad';
  }

  // 5. Contact sync
  if (this.officialMobile && !this.phone) {
    this.phone = this.officialMobile;
  } else if (this.phone && !this.officialMobile) {
    this.officialMobile = this.phone;
  }

  if (this.workEmail && !this.email) {
    this.email = this.workEmail;
  }

  // 6. Address sync
  if (this.currentAddressDetails?.line1 && !this.currentAddress) {
    this.currentAddress = `${this.currentAddressDetails.line1}, ${this.currentAddressDetails.city || ''}, ${this.currentAddressDetails.state || ''} ${this.currentAddressDetails.pinCode || ''}`.trim();
  }
  if (this.permanentAddressDetails?.line1 && !this.permanentAddress) {
    this.permanentAddress = `${this.permanentAddressDetails.line1}, ${this.permanentAddressDetails.city || ''}, ${this.permanentAddressDetails.state || ''} ${this.permanentAddressDetails.pinCode || ''}`.trim();
  }

  // 7. Identity Card QR code verification code
  if (this.employeeId && (!this.identityCard || !this.identityCard.qrVerificationCode)) {
    if (!this.identityCard) this.identityCard = {};
    this.identityCard.qrVerificationCode = `BJK-VERIFY-${this.employeeId}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    this.identityCard.branch = this.branch || 'Ahmedabad';
  }

  // 8. Calculate Experience
  let prevYears = 0;
  if (Array.isArray(this.previousEmployment)) {
    this.previousEmployment.forEach(exp => {
      if (exp.joiningDate && exp.leavingDate) {
        const diffMs = new Date(exp.leavingDate) - new Date(exp.joiningDate);
        const y = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        if (y > 0) prevYears += y;
      }
    });
  }

  const joinDate = this.dateOfJoining || this.joiningDate || new Date();
  const currentBjkMs = Date.now() - new Date(joinDate).getTime();
  const currentBjkYears = Math.max(0, currentBjkMs / (1000 * 60 * 60 * 24 * 365.25));

  this.calculatedExperience = {
    previousExperienceYears: Number(prevYears.toFixed(1)),
    currentBjkExperienceYears: Number(currentBjkYears.toFixed(1)),
    totalProfessionalExperienceYears: Number((prevYears + currentBjkYears).toFixed(1))
  };

  // 9. Profile completion percentage calculation
  let score = 0;
  let total = 16;
  if (this.firstName && this.lastName) score += 1; // 1 Personal
  if (this.employeeId && this.designationTitle && this.departmentName) score += 1; // 2 Job
  if (this.email && this.phone) score += 1; // 3 Contact
  if (this.wfhDetails?.wfhEligible !== undefined) score += 1; // 4 WFH
  if (this.familyMembers?.length > 0 || this.familyDetails?.fatherName) score += 1; // 5 Family
  if (this.emergencyContacts?.length > 0 || this.emergencyContactPhone) score += 1; // 6 Emergency
  if (this.educationDetails?.length > 0 || this.qualifications?.length > 0) score += 1; // 7 Education
  if (this.previousEmployment?.length > 0) score += 1; // 8 Experience
  if (this.quickLinks) score += 1; // 9 Quick links
  if (this.socialLinks?.linkedin || this.socialLinks?.other) score += 1; // 10 Social
  if (this.teamStructure?.reportingManager || this.reportingManager) score += 1; // 11 Team
  if (this.businessCard) score += 1; // 12 Business card
  if (this.pendingDues?.length >= 0) score += 1; // 13 Pending due
  if (this.hrNotes?.length >= 0) score += 1; // 14 Notes
  if (this.documents?.length > 0 || this.identityDocuments?.length > 0) score += 1; // 15 Documents
  if (this.identityCard?.qrVerificationCode) score += 1; // 16 ID card

  this.profileCompletion = Math.min(100, Math.round((score / total) * 100));

  // 10. Sync basic salary
  if (this.basicSalary && (!this.sensitiveData || !this.sensitiveData.salaryDetails || !this.sensitiveData.salaryDetails.basicPay)) {
    if (!this.sensitiveData) this.sensitiveData = {};
    if (!this.sensitiveData.salaryDetails) this.sensitiveData.salaryDetails = {};
    this.sensitiveData.salaryDetails.basicPay = this.basicSalary;
    this.sensitiveData.salaryDetails.grossSalary = Number(this.basicSalary) * 1.4 + 5000;
  } else if (this.sensitiveData?.salaryDetails?.basicPay && !this.basicSalary) {
    this.basicSalary = this.sensitiveData.salaryDetails.basicPay;
  }

  // 11. Sync Bank details & Serial Numbers
  if (this.bankName && (!this.bankDetails || !this.bankDetails.bankName)) {
    if (!this.bankDetails) this.bankDetails = {};
    this.bankDetails.bankName = this.bankName;
  } else if (this.bankDetails?.bankName && !this.bankName) {
    this.bankName = this.bankDetails.bankName;
  }
  if (this.bankAccountNumber && (!this.bankDetails || !this.bankDetails.accountNumber)) {
    if (!this.bankDetails) this.bankDetails = {};
    this.bankDetails.accountNumber = this.bankAccountNumber;
  } else if (this.bankDetails?.accountNumber && !this.bankAccountNumber) {
    this.bankAccountNumber = this.bankDetails.accountNumber;
  }
  if (this.ifscCode && (!this.bankDetails || !this.bankDetails.ifscCode)) {
    if (!this.bankDetails) this.bankDetails = {};
    this.bankDetails.ifscCode = this.ifscCode;
  } else if (this.bankDetails?.ifscCode && !this.ifscCode) {
    this.ifscCode = this.bankDetails.ifscCode;
  }
  if (this.srNo && !this.employeeSerialNumber) {
    this.employeeSerialNumber = this.srNo;
  } else if (this.employeeSerialNumber && !this.srNo) {
    this.srNo = this.employeeSerialNumber;
  }
  if (this.dateOfLeaving && (!this.resignationDate && !this.lastWorkingDate)) {
    this.lastWorkingDate = this.dateOfLeaving;
  }

  // 12. Sync Employee Category (TECHNICAL vs NON_TECHNICAL)
  if (this.employeeCategory === 'NON_TECHNICAL' || this.staffCategory === 'NON_TECHNICAL' || this.isNonTechnical === true) {
    this.employeeCategory = 'NON_TECHNICAL';
    this.staffCategory = 'NON_TECHNICAL';
    this.isNonTechnical = true;
  } else {
    this.employeeCategory = 'TECHNICAL';
    this.staffCategory = 'TECHNICAL';
    this.isNonTechnical = false;
  }

  next();
});

// Helper to mask sensitive numbers (Bank, PAN, Aadhaar, confidential notes) for unauthorized users
EmployeeSchema.methods.getSanitizedForRole = function(userRole) {
  const obj = this.toObject();
  const isHR = ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'PAYROLL_ADMIN', 'FINANCE_MANAGER'].includes(userRole);

  if (!isHR) {
    // Mask bank account
    if (obj.bankDetails?.accountNumber) {
      const len = obj.bankDetails.accountNumber.length;
      obj.bankDetails.accountNumber = len > 4 ? 'X'.repeat(len - 4) + obj.bankDetails.accountNumber.slice(-4) : 'XXXX1234';
    }
    // Mask sensitiveData
    if (obj.sensitiveData?.bankDetails?.accountNumber) {
      const len = obj.sensitiveData.bankDetails.accountNumber.length;
      obj.sensitiveData.bankDetails.accountNumber = len > 4 ? 'X'.repeat(len - 4) + obj.sensitiveData.bankDetails.accountNumber.slice(-4) : 'XXXX1234';
    }
    if (obj.sensitiveData?.aadhaarNumber || obj.aadhaarNumber) {
      const aNum = obj.aadhaarNumber || obj.sensitiveData?.aadhaarNumber || '';
      const masked = aNum.length > 4 ? 'XXXX XXXX ' + aNum.slice(-4) : 'XXXX XXXX 1234';
      if (obj.sensitiveData) obj.sensitiveData.aadhaarNumber = masked;
      obj.aadhaarNumber = masked;
    }
    if (obj.sensitiveData?.panNumber || obj.panNumber) {
      const pNum = obj.panNumber || obj.sensitiveData?.panNumber || '';
      const masked = pNum.length > 4 ? 'XXXXX' + pNum.slice(-4) : 'XXXXX1234F';
      if (obj.sensitiveData) obj.sensitiveData.panNumber = masked;
      obj.panNumber = masked;
    }
    // Mask identity document numbers
    if (Array.isArray(obj.identityDocuments)) {
      obj.identityDocuments.forEach(doc => {
        if (doc.documentNumber) {
          const num = doc.documentNumber;
          doc.documentNumber = num.length > 4 ? 'X'.repeat(num.length - 4) + num.slice(-4) : 'XXXX1234';
        }
      });
    }
    // Filter confidential HR notes
    if (Array.isArray(obj.hrNotes)) {
      obj.hrNotes = obj.hrNotes.filter(n => !n.isConfidential && n.noteType !== 'Confidential');
    }
  }

  return obj;
};

// Database Indexes for Fast Enterprise Search & RBAC
EmployeeSchema.index({ employeeCode: 1 });
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ employeeCategory: 1 });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ employmentStatus: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ departmentName: 1 });
EmployeeSchema.index({ designationTitle: 1 });
EmployeeSchema.index({ branch: 1 });
EmployeeSchema.index({ facility: 1 });
EmployeeSchema.index({ reportingManager: 1 });
EmployeeSchema.index({ joiningDate: -1 });

module.exports = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);
