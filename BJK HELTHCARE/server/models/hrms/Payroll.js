const mongoose = require('mongoose');

// 1. Configurable Statutory & Company Payroll Rules
const PayrollRuleSchema = new mongoose.Schema({
  ruleName: { type: String, required: true }, // e.g. "Employee Provident Fund (EPF)", "ESI Scheme", "Professional Tax"
  code: { type: String, required: true, uppercase: true, unique: true },
  country: { type: String, default: 'India' },
  state: { type: String, default: 'All' },
  category: { 
    type: String, 
    enum: ['PF', 'ESI', 'PROFESSIONAL_TAX', 'TDS', 'ALLOWANCE', 'DEDUCTION'],
    required: true 
  },
  effectiveDate: { type: Date, default: Date.now },
  calculationMethod: { 
    type: String, 
    enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'SLAB_BASED', 'FORMULA'],
    default: 'PERCENTAGE' 
  },
  employeeRate: { type: Number, default: 0 },   // e.g. 12 for 12%
  employerRate: { type: Number, default: 0 },   // e.g. 12 for 12%
  wageCeiling: { type: Number, default: 15000 },// Threshold (e.g. 15,000 for EPF)
  minimumGross: { type: Number, default: 0 },
  maximumGross: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  description: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

// 2. Monthly Payroll Run Records
const PayrollSchema = new mongoose.Schema({
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  payPeriod: { type: String, required: true }, // "2026-09"
  
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  designationTitle: { type: String, required: true },
  bankAccountNumber: { type: String, default: '' }, // Masked

  // Attendance & Time Engine Inputs
  attendanceSummary: {
    totalDays: { type: Number, default: 30 },
    payableDays: { type: Number, default: 30 },
    presentDays: { type: Number, default: 26 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    weeklyOffs: { type: Number, default: 4 },
    overtimeHours: { type: Number, default: 0 },
    nightShiftCount: { type: Number, default: 0 }
  },

  // Earnings Breakdown
  earnings: {
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    nightDifferentialAllowance: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 }
  },
  grossEarnings: { type: Number, default: 0 },

  // Deductions Breakdown
  deductions: {
    providentFund: { type: Number, default: 0 },
    employeeStateInsurance: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    taxDeductedAtSource: { type: Number, default: 0 }, // TDS
    advanceDeductions: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 }
  },
  totalDeductions: { type: Number, default: 0 },

  // Net Disbursable
  netPay: { type: Number, default: 0 },

  // Employer Statutory Contributions (for Cost to Company / CT analysis)
  employerContributions: {
    providentFund: { type: Number, default: 0 },
    employeeStateInsurance: { type: Number, default: 0 },
    gratuityAccrual: { type: Number, default: 0 }
  },
  totalCompanyCost: { type: Number, default: 0 },

  // Workflow & Version History
  status: {
    type: String,
    enum: ['DRAFT', 'CALCULATED', 'REVIEWED', 'APPROVED', 'PROCESSED', 'PAID'],
    default: 'DRAFT'
  },
  calculatedAt: { type: Date, default: null },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  processedBy: { type: String, default: '' },
  processedAt: { type: Date, default: null },
  paymentReferenceNumber: { type: String, default: '' },
  
  remarks: { type: String, default: '' },
  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

PayrollSchema.index({ employee: 1, payPeriod: 1 }, { unique: true });
PayrollSchema.index({ payPeriod: 1 });
PayrollSchema.index({ status: 1 });
PayrollSchema.index({ employeeId: 1 });

const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', PayrollSchema);
const PayrollRule = mongoose.models.PayrollRule || mongoose.model('PayrollRule', PayrollRuleSchema);

module.exports = { Payroll, PayrollRule };
