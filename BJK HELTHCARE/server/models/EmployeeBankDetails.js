const mongoose = require('mongoose');

/**
 * BJK Healthcare - Employee Bank Details Model
 * Preferred collection: employee_bank_details
 * Standard compliant with Section 16 & 17 of BJK Enterprise HRMS Specification.
 */
const EmployeeBankDetailsSchema = new mongoose.Schema({
  // Unique Relationship to Employee
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true,
    index: true
  },
  employeeCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true
  },

  // 1. Account Information
  accountHolderName: {
    type: String,
    default: '',
    trim: true
  },
  accountNumber: {
    type: String,
    default: '',
    trim: true
  },
  accountType: {
    type: String,
    enum: ['Savings', 'Current', 'Salary', 'Other'],
    default: 'Salary'
  },
  accountStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Closed', 'Pending Verification'],
    default: 'Pending Verification'
  },

  // 2. Bank Information
  bankName: {
    type: String,
    default: '',
    trim: true
  },
  branchName: {
    type: String,
    default: '',
    trim: true
  },
  branchAddress: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  state: {
    type: String,
    default: '',
    trim: true
  },
  ifscCode: {
    type: String,
    default: '',
    uppercase: true,
    trim: true
  },
  micrCode: {
    type: String,
    default: '',
    trim: true
  },
  bankCode: {
    type: String,
    default: '',
    trim: true
  },
  branchCode: {
    type: String,
    default: '',
    trim: true
  },

  // 3. Employee / Government References
  pan: {
    type: String,
    default: '',
    uppercase: true,
    trim: true
  },
  uanNumber: {
    type: String,
    default: '',
    trim: true
  },
  pfNumber: {
    type: String,
    default: '',
    trim: true
  },
  esicNumber: {
    type: String,
    default: '',
    trim: true
  },
  insuranceNumber: {
    type: String,
    default: '',
    trim: true
  },

  // 4. Customer References
  customerId: {
    type: String,
    default: '',
    trim: true
  },
  crnNumber: {
    type: String,
    default: '',
    trim: true
  },
  bankCustomerId: {
    type: String,
    default: '',
    trim: true
  },

  // 5. Verification
  verificationStatus: {
    type: String,
    enum: [
      'Not Submitted',
      'Draft',
      'Submitted',
      'Under Review',
      'Verified',
      'Rejected',
      'Needs Correction',
      'Needs Re-Verification'
    ],
    default: 'Not Submitted',
    index: true
  },
  verificationDate: {
    type: Date,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedByName: {
    type: String,
    default: '',
    trim: true
  },

  // 6. Bank Proof & Documents
  documentType: {
    type: String,
    default: 'Cancelled Cheque',
    trim: true
  },
  documentNumber: {
    type: String,
    default: '',
    trim: true
  },
  bankProofReference: {
    type: String,
    default: '',
    trim: true
  },

  // Remarks / Audit Notes
  remarks: {
    type: String,
    default: '',
    trim: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  collection: 'employee_bank_details',
  timestamps: true
});

/**
 * Mask account number helper: returns e.g. "XXXX XXXX 1234"
 */
EmployeeBankDetailsSchema.methods.getMaskedAccountNumber = function() {
  const acc = (this.accountNumber || '').trim();
  if (!acc) return '';
  if (acc.length <= 4) return 'XXXX ' + acc;
  return 'XXXX XXXX ' + acc.slice(-4);
};

/**
 * Mask PAN helper: returns e.g. "ABCDE****F"
 */
EmployeeBankDetailsSchema.methods.getMaskedPAN = function() {
  const pan = (this.pan || '').trim();
  if (!pan) return '';
  if (pan.length <= 5) return '*****';
  return pan.slice(0, 5) + '****' + pan.slice(-1);
};

/**
 * Returns safe JSON representation with masked values for non-privileged viewers
 */
EmployeeBankDetailsSchema.methods.toMaskedJSON = function(unmaskAccount = false) {
  const obj = this.toObject();
  obj.maskedAccountNumber = this.getMaskedAccountNumber();
  obj.maskedPAN = this.getMaskedPAN();
  if (!unmaskAccount) {
    obj.displayAccountNumber = obj.maskedAccountNumber;
  } else {
    obj.displayAccountNumber = obj.accountNumber;
  }
  return obj;
};

const EmployeeBankDetails = mongoose.models.EmployeeBankDetails || mongoose.model('EmployeeBankDetails', EmployeeBankDetailsSchema);

module.exports = EmployeeBankDetails;
