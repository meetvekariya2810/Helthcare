const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  claimNumber: { type: String, required: true, uppercase: true, unique: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  departmentName: { type: String, required: true },
  
  category: {
    type: String,
    enum: ['TRAVEL_LOCAL', 'TRAVEL_DOMESTIC', 'TRAVEL_INTERNATIONAL', 'FOOD_CLIENT_MEETING', 'LAB_SUPPLIES', 'TRAINING_CERTIFICATION', 'MEDICAL_REIMBURSEMENT', 'OFFICE_SUPPLIES', 'OTHER'],
    required: true
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  expenseDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  receiptUrl: { type: String, default: '' },
  
  status: {
    type: String,
    enum: ['SUBMITTED', 'APPROVED_BY_MANAGER', 'APPROVED_BY_FINANCE', 'REJECTED', 'DISBURSED'],
    default: 'SUBMITTED'
  },
  approvedBy: { type: String, default: '' },
  approvedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: '' },
  disbursedDate: { type: Date, default: null },

  isDemo: { type: Boolean, default: false }
}, {
  timestamps: true
});

ExpenseSchema.index({ employee: 1 });
ExpenseSchema.index({ status: 1 });

module.exports = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
