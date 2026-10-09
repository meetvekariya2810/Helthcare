const express = require('express');
const router = express.Router();
const {
  getFinanceDashboardData,
  getInvoices,
  createInvoice,
  getReceivables,
  getPayables,
  getProductCosts,
  saveProductCost,
  getExpenses,
  createExpense,
  getBankAccounts,
  reconcileBankAccount
} = require('../controllers/financeController');
const { protect, restrictFinance } = require('../middleware/auth');

// Strict Finance RBAC boundary: Production, QC, QA, Employees cannot access confidential finance data
router.use(protect);
router.use(restrictFinance);

// Dashboard Aggregations
router.get('/dashboard', getFinanceDashboardData);
router.get('/summary', getFinanceDashboardData);

// Invoices
router.get('/invoices', getInvoices);
router.post('/invoices', createInvoice);

// Receivables & Payables
router.get('/receivables', getReceivables);
router.get('/payables', getPayables);

// Product Costing
router.get('/product-costs', getProductCosts);
router.post('/product-costs', saveProductCost);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);

// Banking
router.get('/bank-accounts', getBankAccounts);
router.put('/bank-accounts/:id/reconcile', reconcileBankAccount);

module.exports = router;
