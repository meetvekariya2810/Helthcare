const mongoose = require('mongoose');

// ==============================================================================
// 1. INVOICE SCHEMA
// ==============================================================================
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  invoiceType: {
    type: String,
    enum: ['DOMESTIC', 'EXPORT', 'PURCHASE', 'SERVICE'],
    default: 'DOMESTIC'
  },
  partyName: {
    type: String,
    required: true,
    trim: true
  },
  partyType: {
    type: String,
    enum: ['CUSTOMER', 'VENDOR', 'DISTRIBUTOR', 'CMO_PARTNER'],
    default: 'CUSTOMER'
  },
  gstin: {
    type: String,
    trim: true,
    default: ''
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  items: [{
    description: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    batchNumber: String,
    quantity: Number,
    unitPrice: Number,
    taxRate: Number,
    totalAmount: Number
  }],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'UNPAID',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['BANK_TRANSFER', 'LETTER_OF_CREDIT', 'CHEQUE', 'ONLINE', 'OTHER'],
    default: 'BANK_TRANSFER'
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['DRAFT', 'ISSUED', 'APPROVED', 'VOID'],
    default: 'ISSUED'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ==============================================================================
// 2. PRODUCT COST SCHEMA
// ==============================================================================
const ProductCostSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  dosageForm: {
    type: String,
    default: 'Tablet'
  },
  batchSize: {
    type: Number,
    default: 100000
  },
  unit: {
    type: String,
    default: 'Units'
  },
  apiCost: {
    type: Number,
    default: 0
  },
  excipientCost: {
    type: Number,
    default: 0
  },
  packagingCost: {
    type: Number,
    default: 0
  },
  directLaborCost: {
    type: Number,
    default: 0
  },
  manufacturingOverhead: {
    type: Number,
    default: 0
  },
  qcQaCost: {
    type: Number,
    default: 0
  },
  totalCostPerBatch: {
    type: Number,
    default: 0
  },
  costPerUnit: {
    type: Number,
    default: 0
  },
  targetSellingPrice: {
    type: Number,
    default: 0
  },
  grossMarginPercent: {
    type: Number,
    default: 0
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Calculate unit cost and gross margin pre-save
ProductCostSchema.pre('save', function(next) {
  this.totalCostPerBatch = (this.apiCost || 0) + (this.excipientCost || 0) + (this.packagingCost || 0) + (this.directLaborCost || 0) + (this.manufacturingOverhead || 0) + (this.qcQaCost || 0);
  if (this.batchSize > 0) {
    this.costPerUnit = parseFloat((this.totalCostPerBatch / this.batchSize).toFixed(4));
  }
  if (this.targetSellingPrice > 0 && this.costPerUnit > 0) {
    this.grossMarginPercent = parseFloat((((this.targetSellingPrice - this.costPerUnit) / this.targetSellingPrice) * 100).toFixed(2));
  }
  next();
});

// ==============================================================================
// 3. EXPENSE SCHEMA
// ==============================================================================
const OperationalExpenseSchema = new mongoose.Schema({
  expenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['RAW_MATERIALS', 'UTILITIES', 'MAINTENANCE', 'SALARIES', 'REGULATORY_FEES', 'LOGISTICS', 'QUALITY_TESTING', 'CAPEX', 'OTHER'],
    required: true,
    index: true
  },
  department: {
    type: String,
    default: 'Operations'
  },
  facility: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  expenseDate: {
    type: Date,
    default: Date.now
  },
  vendorName: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID'],
    default: 'PENDING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiptUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// ==============================================================================
// 4. BANK ACCOUNT SCHEMA
// ==============================================================================
const BankAccountSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  accountType: {
    type: String,
    enum: ['CURRENT', 'SAVINGS', 'ESCROW', 'PETTY_CASH', 'OVERDRAFT'],
    default: 'CURRENT'
  },
  ifscCode: { type: String, default: '' },
  branch: { type: String, default: 'Corporate HQ' },
  currency: { type: String, default: 'INR' },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  creditsMonth: { type: Number, default: 0 },
  debitsMonth: { type: Number, default: 0 },
  reconciliationStatus: {
    type: String,
    enum: ['RECONCILED', 'PENDING', 'MISMATCH'],
    default: 'RECONCILED'
  },
  lastReconciledAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ==============================================================================
// 5. BUDGET PLAN SCHEMA
// ==============================================================================
const BudgetPlanSchema = new mongoose.Schema({
  fiscalYear: { type: String, required: true, default: '2026-27' },
  department: {
    type: String,
    enum: ['Payroll', 'Production', 'Procurement', 'Quality', 'Regulatory', 'Marketing', 'Administration', 'Technology', 'Logistics', 'Other'],
    required: true
  },
  allocatedAmount: { type: Number, required: true, default: 0 },
  spentAmount: { type: Number, default: 0 },
  variance: { type: Number, default: 0 },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// ==============================================================================
// 6. TAX COMPLIANCE SCHEMA
// ==============================================================================
const TaxRecordSchema = new mongoose.Schema({
  taxType: {
    type: String,
    enum: ['GST_OUTPUT', 'GST_INPUT', 'TDS_PAYABLE', 'TDS_RECEIVABLE', 'CORPORATE_TAX', 'OTHER'],
    required: true
  },
  returnName: { type: String, required: true }, // e.g. "GSTR-1", "GSTR-3B", "TDS 26Q"
  period: { type: String, required: true }, // "2026-09"
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['FILED', 'PENDING', 'DUE_SOON', 'OVERDUE'],
    default: 'PENDING'
  },
  filingDate: { type: Date, default: null },
  acknowledgementNumber: { type: String, default: '' }
}, {
  timestamps: true
});

// ==============================================================================
// 7. LOAN & FINANCIAL LIABILITY SCHEMA
// ==============================================================================
const LoanLiabilitySchema = new mongoose.Schema({
  loanName: { type: String, required: true },
  lender: { type: String, required: true },
  loanType: {
    type: String,
    enum: ['TERM_LOAN', 'WORKING_CAPITAL', 'EQUIPMENT_FINANCE', 'ECB', 'OTHER'],
    default: 'TERM_LOAN'
  },
  principalAmount: { type: Number, required: true, default: 0 },
  outstandingAmount: { type: Number, required: true, default: 0 },
  interestRate: { type: Number, default: 0 },
  monthlyEmi: { type: Number, default: 0 },
  nextDueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED', 'OVERDUE'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
const ProductCost = mongoose.models.ProductCost || mongoose.model('ProductCost', ProductCostSchema);
const OperationalExpense = mongoose.models.OperationalExpense || mongoose.model('OperationalExpense', OperationalExpenseSchema);
const BankAccount = mongoose.models.BankAccount || mongoose.model('BankAccount', BankAccountSchema);
const BudgetPlan = mongoose.models.BudgetPlan || mongoose.model('BudgetPlan', BudgetPlanSchema);
const TaxRecord = mongoose.models.TaxRecord || mongoose.model('TaxRecord', TaxRecordSchema);
const LoanLiability = mongoose.models.LoanLiability || mongoose.model('LoanLiability', LoanLiabilitySchema);

module.exports = {
  Invoice,
  ProductCost,
  OperationalExpense,
  BankAccount,
  BudgetPlan,
  TaxRecord,
  LoanLiability
};
