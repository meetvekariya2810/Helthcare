const mongoose = require('mongoose');

// 1. Configurable Leave Type Model
const LeaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, unique: true, trim: true },
  description: { type: String, default: '', trim: true },
  annualQuotaDays: { type: Number, required: true, default: 12 },
  isPaid: { type: Boolean, default: true },
  carryForwardAllowed: { type: Boolean, default: true },
  maxCarryForwardDays: { type: Number, default: 15 },
  requiresDocumentProof: { type: Boolean, default: false },
  minNoticeDays: { type: Number, default: 1 },
  maxConsecutiveDays: { type: Number, default: 10 },
  allowHalfDay: { type: Boolean, default: true },
  applicableGender: { type: String, enum: ['ALL', 'MALE', 'FEMALE'], default: 'ALL' },
  countWeekends: { type: Boolean, default: false },
  countHolidays: { type: Boolean, default: false },
  approvalWorkflow: [{ type: String, default: ['TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR'] }],
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

LeaveTypeSchema.index({ isActive: 1 });

// 2. Department-Specific or Company-Wide Leave Policy Model
const LeavePolicySchema = new mongoose.Schema({
  policyName: { type: String, required: true, trim: true },
  department: { type: String, default: 'ALL', trim: true },
  leaveYear: { type: Number, required: true, default: 2026 },
  carryForwardMax: { type: Number, default: 15 },
  encashmentAllowed: { type: Boolean, default: false },
  probationLeaveAllowed: { type: Boolean, default: true },
  weekendExclusion: { type: Boolean, default: true },
  holidayExclusion: { type: Boolean, default: true },
  workflowStages: [{
    stage: { type: Number },
    name: { type: String },
    role: { type: String }
  }],
  rules: { type: mongoose.Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

LeavePolicySchema.index({ department: 1, leaveYear: 1 });

// 3. Holiday Calendar Model
const HolidayCalendarSchema = new mongoose.Schema({
  year: { type: Number, required: true, default: 2026 },
  name: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  dateString: { type: String, required: true, trim: true }, // YYYY-MM-DD
  type: { 
    type: String, 
    enum: ['NATIONAL_HOLIDAY', 'FESTIVAL', 'MANDATORY', 'OPTIONAL'], 
    default: 'MANDATORY' 
  },
  description: { type: String, default: '' },
  facility: { type: String, default: 'ALL' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

HolidayCalendarSchema.index({ year: 1, date: 1 });
HolidayCalendarSchema.index({ dateString: 1 });

// 4. Employee Leave Balance Model
const LeaveBalanceItemSchema = new mongoose.Schema({
  leaveType: { type: String, required: true, uppercase: true }, // e.g. CASUAL_LEAVE
  leaveTypeName: { type: String, default: '' },
  openingBalance: { type: Number, default: 0 },
  allocated: { type: Number, default: 0 },
  carriedForward: { type: Number, default: 0 },
  adjusted: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  available: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const BalanceHistoryItemSchema = new mongoose.Schema({
  leaveType: { type: String, required: true },
  previousAvailable: { type: Number, default: 0 },
  adjustedBy: { type: Number, default: 0 },
  newAvailable: { type: Number, default: 0 },
  reason: { type: String, required: true },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'HR Administrator' },
    email: { type: String, default: '' },
    role: { type: String, default: 'HR_ADMIN' }
  },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const LeaveBalanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  employeeId: { type: String, required: true, trim: true, uppercase: true },
  employeeName: { type: String, default: '' },
  department: { type: String, default: '' },
  leaveYear: { type: Number, required: true, default: 2026 },
  year: { type: Number, default: function() { return this.leaveYear || 2026; } },
  balances: [LeaveBalanceItemSchema],
  history: [BalanceHistoryItemSchema],
  lastUpdated: { type: Date, default: Date.now },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

LeaveBalanceSchema.index({ employee: 1, leaveYear: 1 }, { unique: true });
LeaveBalanceSchema.index({ employeeId: 1, leaveYear: 1 });
LeaveBalanceSchema.index({ department: 1 });

// Helper to recalculate available balances
LeaveBalanceSchema.methods.recalculate = function() {
  if (Array.isArray(this.balances)) {
    this.balances.forEach(b => {
      const opening = Number(b.openingBalance) || 0;
      const allocated = Number(b.allocated) || 0;
      const carried = Number(b.carriedForward) || 0;
      const adjusted = Number(b.adjusted) || 0;
      const used = Number(b.used) || 0;
      b.available = Math.max(0, opening + allocated + carried + adjusted - used);
      b.lastUpdated = new Date();
    });
  }
  this.lastUpdated = new Date();
};

// 5. Leave Request Workflow Model
const ApprovalHistorySchema = new mongoose.Schema({
  step: { 
    type: String, 
    enum: ['SUBMISSION', 'TEAM_MANAGER', 'DEPARTMENT_MANAGER', 'HR', 'HR_OVERRIDE', 'CANCELLATION', 'WITHDRAWAL', 'CORRECTION'],
    required: true 
  },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    email: { type: String, default: '' },
    role: { type: String, default: 'EMPLOYEE' }
  },
  action: { 
    type: String, 
    enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'OVERRIDDEN', 'CANCELLED', 'WITHDRAWN', 'RETURNED'],
    required: true 
  },
  comment: { type: String, default: '' },
  previousStatus: { type: String, default: '' },
  newStatus: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

const LeaveRequestSchema = new mongoose.Schema({
  requestId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    default: () => 'LV-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  employeeId: { type: String, required: true, trim: true, uppercase: true },
  employeeName: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  departmentName: { type: String, default: function() { return this.department || ''; } },
  team: { type: String, default: 'General Operations', trim: true },

  // Assigned approval chain actors
  teamManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  teamManagerName: { type: String, default: '' },
  departmentManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  departmentManagerName: { type: String, default: '' },

  leaveType: { type: String, required: true, uppercase: true, trim: true }, // e.g. CASUAL_LEAVE
  leaveTypeName: { type: String, default: '' },
  leaveCode: { type: String, default: '' },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startDateString: { type: String, required: true }, // YYYY-MM-DD
  endDateString: { type: String, required: true },   // YYYY-MM-DD
  duration: { type: Number, required: true, min: 0.5 },
  totalDays: { type: Number, default: function() { return this.duration || 1; } },
  durationType: { 
    type: String, 
    enum: ['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF'], 
    default: 'FULL_DAY' 
  },
  isHalfDay: { type: Boolean, default: false },

  reason: { type: String, required: true, trim: true },
  handoverDetails: { type: String, default: '', trim: true },
  contactDuringLeave: { type: String, default: '', trim: true },
  contactDuringAbsence: { type: String, default: '', trim: true },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },

  supportingDocument: {
    documentName: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: null }
  },
  documentStatus: { 
    type: String, 
    enum: ['NOT_REQUIRED', 'PENDING', 'VERIFIED', 'REJECTED'], 
    default: 'NOT_REQUIRED' 
  },

  currentStatus: {
    type: String,
    enum: [
      'DRAFT',
      'SUBMITTED',
      'MANAGER_REVIEW',
      'TEAM_MANAGER_PENDING',
      'TEAM_MANAGER_APPROVED',
      'TEAM_MANAGER_REJECTED',
      'DEPARTMENT_HEAD_REVIEW',
      'DEPARTMENT_MANAGER_PENDING',
      'DEPARTMENT_MANAGER_APPROVED',
      'DEPARTMENT_MANAGER_REJECTED',
      'HR_REVIEW',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
      'WITHDRAWN',
      'RETURNED_FOR_CORRECTION'
    ],
    default: 'TEAM_MANAGER_PENDING'
  },
  status: { type: String, default: function() { return this.currentStatus || 'TEAM_MANAGER_PENDING'; } },
  currentApprovalStage: { type: String, default: 'Team Manager Review' },

  // Timestamps for each approval stage
  submittedAt: { type: Date, default: Date.now },
  teamManagerActionAt: { type: Date, default: null },
  departmentManagerActionAt: { type: Date, default: null },
  hrActionAt: { type: Date, default: null },

  // Complete immutable approval timeline
  approvalHistory: [ApprovalHistorySchema],

  // Backward compatibility wrapper for older UI components
  approvals: [{
    step: { type: String },
    approverName: { type: String },
    action: { type: String },
    comment: { type: String, default: '' },
    actionDate: { type: Date, default: Date.now }
  }],

  rejectionReason: { type: String, default: '' },
  hrOverrideReason: { type: String, default: '' },
  isOverridden: { type: Boolean, default: false },
  overriddenBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: '' },
    email: { type: String, default: '' }
  },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Database Indexes for optimized querying and data isolation
LeaveRequestSchema.index({ employee: 1 });
LeaveRequestSchema.index({ employeeId: 1 });
LeaveRequestSchema.index({ department: 1 });
LeaveRequestSchema.index({ team: 1 });
LeaveRequestSchema.index({ teamManager: 1 });
LeaveRequestSchema.index({ departmentManager: 1 });
LeaveRequestSchema.index({ currentStatus: 1 });
LeaveRequestSchema.index({ status: 1 });
LeaveRequestSchema.index({ leaveType: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });
LeaveRequestSchema.index({ createdAt: -1 });
LeaveRequestSchema.index({ employeeId: 1, startDate: 1, endDate: 1 });

// Ensure status and currentStatus stay synchronized
LeaveRequestSchema.pre('save', function(next) {
  if (this.currentStatus && !this.status) {
    this.status = this.currentStatus;
  } else if (this.status && !this.currentStatus) {
    this.currentStatus = this.status;
  } else if (this.isModified('currentStatus')) {
    this.status = this.currentStatus;
  } else if (this.isModified('status')) {
    this.currentStatus = this.status;
  }
  if (!this.departmentName && this.department) {
    this.departmentName = this.department;
  }
  if (!this.totalDays && this.duration) {
    this.totalDays = this.duration;
  }
  if (!this.contactDuringAbsence && this.contactDuringLeave) {
    this.contactDuringAbsence = this.contactDuringLeave;
  } else if (!this.contactDuringLeave && this.contactDuringAbsence) {
    this.contactDuringLeave = this.contactDuringAbsence;
  }
  if (!this.leaveCode && this.leaveType) {
    this.leaveCode = this.leaveType;
  }
  // Sync current approval stage text for easy UI display
  if (['SUBMITTED', 'TEAM_MANAGER_PENDING', 'MANAGER_REVIEW'].includes(this.currentStatus)) {
    this.currentApprovalStage = 'Team Manager Review';
  } else if (['DEPARTMENT_MANAGER_PENDING', 'DEPARTMENT_HEAD_REVIEW', 'TEAM_MANAGER_APPROVED'].includes(this.currentStatus)) {
    this.currentApprovalStage = 'Department Head Review';
  } else if (['HR_REVIEW'].includes(this.currentStatus)) {
    this.currentApprovalStage = 'HR Final Sanction';
  } else if (this.currentStatus === 'APPROVED') {
    this.currentApprovalStage = 'Sanctioned & Approved';
  } else if (this.currentStatus === 'RETURNED_FOR_CORRECTION') {
    this.currentApprovalStage = 'Returned for Correction';
  } else if (this.currentStatus === 'CANCELLED') {
    this.currentApprovalStage = 'Cancelled';
  } else if (this.currentStatus === 'WITHDRAWN') {
    this.currentApprovalStage = 'Withdrawn by Employee';
  } else if (['REJECTED', 'TEAM_MANAGER_REJECTED', 'DEPARTMENT_MANAGER_REJECTED'].includes(this.currentStatus)) {
    this.currentApprovalStage = 'Application Rejected';
  }
  next();
});

// 6. Leave Activity / Audit Log Model
const LeaveActivitySchema = new mongoose.Schema({
  requestId: { type: String, required: true, trim: true },
  leaveRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', default: null },
  employee: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    employeeId: { type: String, default: '' },
    name: { type: String, default: '' },
    department: { type: String, default: '' }
  },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'System' },
    email: { type: String, default: '' },
    role: { type: String, default: 'EMPLOYEE' }
  },
  action: {
    type: String,
    enum: [
      'CREATE',
      'SUBMIT',
      'VIEW',
      'APPROVE',
      'REJECT',
      'CANCEL',
      'WITHDRAW',
      'OVERRIDE',
      'BALANCE_ADJUST',
      'DOCUMENT_UPLOAD',
      'DOCUMENT_VERIFY'
    ],
    required: true
  },
  previousStatus: { type: String, default: '' },
  newStatus: { type: String, default: '' },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, default: '127.0.0.1' },
  userAgent: { type: String, default: 'BJK-LeaveEngine/2.0' }
}, {
  timestamps: true
});

LeaveActivitySchema.index({ requestId: 1 });
LeaveActivitySchema.index({ 'employee.employeeId': 1 });
LeaveActivitySchema.index({ 'employee.department': 1 });
LeaveActivitySchema.index({ action: 1 });
LeaveActivitySchema.index({ timestamp: -1 });

// Export Models
const LeaveType = mongoose.models.LeaveType || mongoose.model('LeaveType', LeaveTypeSchema);
const LeavePolicy = mongoose.models.LeavePolicy || mongoose.model('LeavePolicy', LeavePolicySchema);
const HolidayCalendar = mongoose.models.HolidayCalendar || mongoose.model('HolidayCalendar', HolidayCalendarSchema);
const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model('LeaveBalance', LeaveBalanceSchema);
const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
const LeaveActivity = mongoose.models.LeaveActivity || mongoose.model('LeaveActivity', LeaveActivitySchema);

module.exports = {
  LeaveType,
  LeavePolicy,
  HolidayCalendar,
  LeaveBalance,
  LeaveRequest,
  LeaveActivity
};
