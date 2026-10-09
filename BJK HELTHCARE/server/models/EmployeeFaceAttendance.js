const mongoose = require('mongoose');

const EmployeeFaceAttendanceSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  faceRegistered: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: null
  },
  faceDescriptorHash: {
    type: String,
    default: ''
  },
  lastVerificationDate: {
    type: Date,
    default: null
  },
  lastVerificationStatus: {
    type: String,
    enum: ['NOT_VERIFIED', 'VERIFIED_SUCCESS', 'VERIFICATION_FAILED', 'POOR_LIGHTING'],
    default: 'NOT_VERIFIED'
  },
  deviceStatus: {
    type: String,
    default: 'AUTHORIZED_OFFICE_TERMINAL'
  },
  verificationConfidence: {
    type: Number,
    default: 0
  },
  photoSampleUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.EmployeeFaceAttendance || mongoose.model('EmployeeFaceAttendance', EmployeeFaceAttendanceSchema);
