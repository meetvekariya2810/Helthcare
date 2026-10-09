const mongoose = require('mongoose');

// 1. Job Requisition / Opening
const JobRequisitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  jobCode: { type: String, required: true, uppercase: true, unique: true },
  department: { type: String, required: true },
  facility: { type: String, required: true, default: 'BJK Unit 1 - Formulations Facility' },
  positionsCount: { type: Number, default: 1 },
  experienceRequiredYears: { type: String, default: '2-5 years' },
  employmentType: { 
    type: String, 
    enum: ['FULL_TIME', 'CONTRACT', 'INTERN'], 
    default: 'FULL_TIME' 
  },
  minQualification: { 
    type: String, 
    enum: ['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Sc Chemistry', 'M.Sc Chemistry', 'M.Sc Microbiology', 'Diploma in Pharmacy', 'B.Tech/B.E.', 'MBA', 'Any Graduate'],
    default: 'B.Pharm'
  },
  requiredSkills: [{ type: String }], // GMP, GLP, HPLC, Cleanroom Protocols
  salaryRangeMin: { type: Number, default: 0 },
  salaryRangeMax: { type: Number, default: 0 },
  jobDescription: { type: String, default: '' },
  
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'CLOSED', 'ON_HOLD'],
    default: 'PUBLISHED'
  },
  hiringManager: { type: String, default: '' },
  targetHireDate: { type: Date, default: null },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

JobRequisitionSchema.index({ status: 1 });
JobRequisitionSchema.index({ department: 1 });

// 2. Candidate Application & Pipeline Tracking
const CandidateSchema = new mongoose.Schema({
  jobRequisition: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequisition', required: true },
  jobCode: { type: String, required: true },
  jobTitle: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  qualification: { type: String, default: 'B.Pharm' },
  skills: [{ type: String }],
  totalExperienceYears: { type: Number, default: 0 },
  currentCompany: { type: String, default: '' },
  currentCtc: { type: Number, default: 0 },
  expectedCtc: { type: Number, default: 0 },
  noticePeriodDays: { type: Number, default: 30 },
  resumeUrl: { type: String, default: '' },
  
  // Pipeline Stage
  stage: {
    type: String,
    enum: [
      'APPLIED',
      'SCREENING',
      'SHORTLISTED',
      'TECHNICAL_INTERVIEW',
      'HR_INTERVIEW',
      'ASSESSMENT',
      'SELECTED',
      'OFFER_EXTENDED',
      'OFFER_ACCEPTED',
      'HIRED',
      'REJECTED'
    ],
    default: 'APPLIED'
  },
  interviewNotes: [{
    roundName: { type: String },
    interviewer: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    recommendation: { type: String },
    feedback: { type: String },
    conductedDate: { type: Date }
  }],
  offerDetails: {
    offeredSalary: { type: Number, default: 0 },
    joiningDate: { type: Date, default: null },
    letterSent: { type: Boolean, default: false }
  },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

CandidateSchema.index({ jobRequisition: 1 });
CandidateSchema.index({ email: 1 });
CandidateSchema.index({ stage: 1 });

const JobRequisition = mongoose.models.JobRequisition || mongoose.model('JobRequisition', JobRequisitionSchema);
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

module.exports = { JobRequisition, Candidate };
