const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  employeeId: { type: mongoose.Schema.Types.Mixed, required: true },
  employeeCode: { type: String, uppercase: true, trim: true, default: '' },
  attendanceDate: { type: String, default: '' }, // "YYYY-MM-DD"
  attendanceStatus: { type: String, default: '' }, // exact source value: "P", "WO", "AB", etc.
  sourceEmployeeName: { type: String, default: '' },
  sourceDepartment: { type: String, default: '' },
  month: { type: Number, default: null },
  year: { type: Number, default: null },
  importBatchId: { type: String, default: null, trim: true },
  sourceFileName: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  employeeName: { type: String, default: '' },
  branchName: { type: String, default: 'Ahmedabad Branch' },
  departmentName: { type: String, default: 'General' },
  subDepartmentName: { type: String, default: '' },
  designationTitle: { type: String, default: '' },
  date: { type: Date, default: null },
  dateString: { type: String, default: '' }, // "YYYY-MM-DD"
  shift: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shift' 
  },
  shiftName: { type: String, default: 'General Shift' },
  scheduledIn: { type: String, default: '09:00' },
  scheduledOut: { type: String, default: '18:00' },

  // Timestamps
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
  actualIn: { type: String, default: '' }, // "HH:mm" formatted
  actualOut: { type: String, default: '' },

  // Comprehensive Enterprise Attendance Statuses
  status: {
    type: String,
    default: 'PRESENT'
  },
  halfDayType: {
    type: String,
    enum: ['FIRST_HALF', 'SECOND_HALF', 'CUSTOM', 'NONE'],
    default: 'NONE'
  },
  leaveType: {
    type: String,
    enum: ['CASUAL', 'SICK', 'EARNED', 'PRIVILEGE', 'EMERGENCY', 'UNPAID', 'COMPENSATORY', 'MATERNITY', 'NONE'],
    default: 'NONE'
  },
  workLocation: {
    type: String,
    enum: ['OFFICE', 'PLANT', 'CLEANROOM', 'WAREHOUSE', 'FIELD', 'REMOTE', 'GENERAL'],
    default: 'GENERAL'
  },

  lateMinutes: { type: Number, default: 0 },
  earlyExitMinutes: { type: Number, default: 0 },
  workingHours: { type: Number, default: 0 }, // in hours
  regularHours: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  nightHours: { type: Number, default: 0 },
  dwellTimeMinutes: { type: Number, default: 0 }, // Facility physical dwell duration
  overtimeApproved: { type: Boolean, default: false },
  overtimeApprovedBy: { type: String, default: '' },

  // Source & Audit
  source: {
    type: String,
    enum: ['BIOMETRIC', 'WEB', 'MOBILE', 'IMPORT', 'API', 'MANUAL'],
    default: 'WEB'
  },
  biometricDeviceId: { type: String, default: null },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    address: { type: String, default: '' }
  },
  geofenceStatus: {
    type: String,
    enum: ['INSIDE', 'OUTSIDE', 'UNVERIFIED'],
    default: 'UNVERIFIED'
  },

  // Punches history log for multiple scans per day
  punches: [{
    time: { type: Date, default: Date.now },
    type: { type: String, enum: ['IN', 'OUT'] },
    source: { type: String, default: 'WEB' },
    deviceId: { type: String, default: null },
    location: { type: String, default: '' }
  }],

  // Missing Punch & Regularization
  correctionStatus: {
    type: String,
    enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
    default: 'NONE'
  },
  correctionRemarks: { type: String, default: '' },
  regularizationReason: { type: String, default: '' },
  regularizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  regularizedAt: { type: Date },

  remarks: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Composite & Filter Query Indexes
AttendanceSchema.index({ employeeCode: 1, attendanceDate: 1 }, { unique: true, sparse: true });
AttendanceSchema.index({ importBatchId: 1 });
AttendanceSchema.index({ employee: 1, dateString: 1 }, { sparse: true });
AttendanceSchema.index({ employeeId: 1, dateString: 1 });
AttendanceSchema.index({ dateString: 1, departmentName: 1 });
AttendanceSchema.index({ dateString: 1, branchName: 1 });
AttendanceSchema.index({ dateString: 1, status: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ shift: 1, dateString: 1 });
AttendanceSchema.index({ isDemo: 1 });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
