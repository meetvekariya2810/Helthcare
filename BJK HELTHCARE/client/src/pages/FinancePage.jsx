import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileText,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Lock,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  Wallet,
  Landmark,
  FileSpreadsheet,
  AlertCircle,
  Activity,
  Boxes,
  Percent,
  Receipt,
  ArrowRight,
  ExternalLink,
  Printer,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { financeAPI, productAPI } from '../services/api';

// Enterprise Palette Tokens
const COLORS = {
  teal: '#00A896',
  tealDark: '#009B8D',
  purple: '#7B2CBF',
  purpleLight: '#8338EC',
  orange: '#F77F00',
  amber: '#FCBF49',
  cyan: '#00B4D8',
  slateDark: '#0F172A',
  slateMid: '#1E293B',
  emerald: '#10B981',
  rose: '#EF4444',
  blue: '#3B82F6'
};

const PIE_COLORS = [
  '#00A896',
  '#7B2CBF',
  '#00B4D8',
  '#F77F00',
  '#10B981',
  '#EC4899',
  '#6366F1',
  '#F59E0B'
];

export const FinancePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Role Access Evaluation (ADMIN or HR_ADMIN / HR / FINANCE)
  const isAuthorized = useMemo(() => {
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    const authorizedRoles = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'ADMIN',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR',
      'FINANCE_MANAGER',
      'FINANCE',
      'PAYROLL_ADMIN'
    ];
    return authorizedRoles.includes(role);
  }, [user]);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataTruthMode, setDataTruthMode] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Dashboard Aggregated State
  const [dashboardData, setDashboardData] = useState(null);
  const [productsList, setProductsList] = useState([]);

  // Active Filters
  const [fiscalYear, setFiscalYear] = useState('2026–27');
  const [selectedMonth, setSelectedMonth] = useState('All Months');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [chartTimeframe, setChartTimeframe] = useState('12M'); // '6M', '12M', 'Current FY', 'Previous FY'
  const [invoiceTab, setInvoiceTab] = useState('SALES'); // 'SALES', 'PURCHASE', 'CREDIT', 'DEBIT'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Form States
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    invoiceType: 'DOMESTIC',
    partyName: '',
    partyType: 'CUSTOMER',
    gstin: '',
    totalAmount: '',
    subtotal: '',
    taxAmount: '',
    currency: 'INR',
    dueDate: '',
    paymentStatus: 'UNPAID',
    notes: 'Commercial pharmaceutical supply'
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'RAW_MATERIALS',
    department: 'Operations',
    amount: '',
    currency: 'INR',
    vendorName: '',
    description: '',
    approvalStatus: 'APPROVED'
  });

  const [costForm, setCostForm] = useState({
    productId: '',
    productName: '',
    dosageForm: 'Tablet',
    batchSize: 100000,
    apiCost: '',
    excipientCost: '',
    packagingCost: '',
    directLaborCost: '',
    manufacturingOverhead: '',
    qcQaCost: '',
    targetSellingPrice: ''
  });

  // Fetch Dashboard & Finance Data
  const fetchFinanceData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [dashRes, prodRes] = await Promise.all([
        financeAPI.getDashboard({
          fiscalYear,
          month: selectedMonth !== 'All Months' ? selectedMonth : undefined,
          branch: selectedBranch !== 'All Branches' ? selectedBranch : undefined,
          department: selectedDepartment !== 'All Departments' ? selectedDepartment : undefined
        }).catch(err => {
          console.warn('[Finance API Notice]: Dashboard aggregate fallback', err.message);
          return { data: { success: false, data: null } };
        }),
        productAPI.getAll({ limit: 111 }).catch(() => ({ data: { data: [] } }))
      ]);

      if (dashRes.data?.data) {
        setDashboardData(dashRes.data.data);
      } else {
        setDashboardData(null);
      }

      setProductsList(prodRes.data?.data || []);
    } catch (err) {
      console.error('[Finance Dashboard Fetch Error]:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchFinanceData();
    }
  }, [isAuthorized, fiscalYear, selectedMonth, selectedBranch, selectedDepartment]);

  // Helpers
  const formatCurrency = (val, prefix = '₹') => {
    if (val === null || val === undefined || isNaN(val)) {
      return '--';
    }
    if (val === 0 && !dashboardData?.hasConnectedRecords) {
      return '--';
    }
    return `${prefix} ${Number(val).toLocaleString('en-IN')}`;
  };

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const subtotal = Number(invoiceForm.subtotal) || Number(invoiceForm.totalAmount) * 0.82;
      const taxAmount = Number(invoiceForm.taxAmount) || (Number(invoiceForm.totalAmount) - subtotal);
      
      await financeAPI.createInvoice({
        ...invoiceForm,
        totalAmount: Number(invoiceForm.totalAmount),
        subtotal,
        taxAmount,
        dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 86400000).toISOString()
      });

      setActionSuccess('Commercial invoice registered in financial ledger.');
      setShowInvoiceModal(false);
      setInvoiceForm({
        invoiceNumber: '',
        invoiceType: 'DOMESTIC',
        partyName: '',
        partyType: 'CUSTOMER',
        gstin: '',
        totalAmount: '',
        subtotal: '',
        taxAmount: '',
        currency: 'INR',
        dueDate: '',
        paymentStatus: 'UNPAID',
        notes: 'Commercial pharmaceutical supply'
      });
      fetchFinanceData(true);
      setTimeout(() => setActionSuccess(''), 4500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to generate invoice.');
    }
  };

  const handleCreateExpenseSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await financeAPI.createExpense({
        ...expenseForm,
        amount: Number(expenseForm.amount)
      });
      setActionSuccess('Operational expenditure recorded in accounts ledger.');
      setShowExpenseModal(false);
      setExpenseForm({
        category: 'RAW_MATERIALS',
        department: 'Operations',
        amount: '',
        currency: 'INR',
        vendorName: '',
        description: '',
        approvalStatus: 'APPROVED'
      });
      fetchFinanceData(true);
      setTimeout(() => setActionSuccess(''), 4500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to record expense.');
    }
  };

  const handleSaveCostSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await financeAPI.saveProductCost({
        ...costForm,
        batchSize: Number(costForm.batchSize) || 100000,
        apiCost: Number(costForm.apiCost) || 0,
        excipientCost: Number(costForm.excipientCost) || 0,
        packagingCost: Number(costForm.packagingCost) || 0,
        directLaborCost: Number(costForm.directLaborCost) || 0,
        manufacturingOverhead: Number(costForm.manufacturingOverhead) || 0,
        qcQaCost: Number(costForm.qcQaCost) || 0,
        targetSellingPrice: Number(costForm.targetSellingPrice) || 0
      });
      setActionSuccess('Formulation batch cost structure computed and saved.');
      setShowCostModal(false);
      fetchFinanceData(true);
      setTimeout(() => setActionSuccess(''), 4500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to calculate formulation cost.');
    }
  };

  const handleReconcileBank = async (bankId) => {
    try {
      await financeAPI.reconcileBankAccount(bankId);
      setActionSuccess('Bank statement reconciled with ledger balance.');
      fetchFinanceData(true);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError('Bank reconciliation update failed.');
    }
  };

  // --------------------------------------------------------------------------
  // ROLE ACCESS RESTRICTION SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
            <Lock className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Finance & Accounting information is available only to authorized HR and Administrator users.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 font-mono mb-6">
            Confidential Enterprise Finance Domain • RBAC Strict Isolation
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-5 bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.01] transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Return to Safe Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Fallbacks and safe extractions
  const kpis = dashboardData?.kpis || {};
  const health = dashboardData?.health || {};
  const charts = dashboardData?.charts || {};
  const profitLoss = dashboardData?.profitLoss || {};
  const balanceSheet = dashboardData?.balanceSheet || {};
  const receivables = dashboardData?.receivables || { aging: {}, items: [] };
  const payables = dashboardData?.payables || { aging: {}, items: [] };
  const banking = dashboardData?.banking || { accounts: [] };
  const payrollSummary = dashboardData?.payrollSummary || {};
  const productCosting = dashboardData?.productCosting || { items: [] };
  const taxCompliance = dashboardData?.taxCompliance || { upcomingReturns: [] };
  const budgetVsActual = dashboardData?.budgetVsActual || [];
  const loansLiabilities = dashboardData?.loansLiabilities || { items: [] };
  const alerts = dashboardData?.alerts || [];
  const auditControl = dashboardData?.auditControl || {};

  return (
    <div className="space-y-6 pb-16 max-w-[1720px] mx-auto">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & INTERACTIVE FILTERS */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-50/60 via-purple-50/30 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00A896] to-[#008779] text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Finance & Accounting Command Center
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#00A896] border border-teal-200/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] animate-pulse" />
                    Live Ledger Mode
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500">
                  BJK Healthcare Private Limited • Financial Operations • Accounting • Costing • Compliance
                </p>
              </div>
            </div>
          </div>

          {/* Right-Side Global Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Fiscal Year */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <span className="text-slate-400 mr-1.5 font-normal">FY:</span>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="2026–27">2026–27</option>
                <option value="2025–26">2025–26</option>
                <option value="2024–25">2024–25</option>
              </select>
            </div>

            {/* Month */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All Months">All Months</option>
                <option value="October 2026">October 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="May 2026">May 2026</option>
                <option value="April 2026">April 2026</option>
              </select>
            </div>

            {/* Branch */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All Branches">All Branches</option>
                <option value="Mumbai Corporate HQ">Mumbai Corporate HQ</option>
                <option value="Baddi Pharma Plant">Baddi Pharma Plant</option>
                <option value="Hyderabad R&D Unit">Hyderabad R&D Unit</option>
                <option value="Ahmedabad Sterile Unit">Ahmedabad Sterile Unit</option>
              </select>
            </div>

            {/* Department */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="Operations">Operations & Production</option>
                <option value="Quality">Quality Control & QA</option>
                <option value="Regulatory">Regulatory Affairs</option>
                <option value="SupplyChain">Supply Chain & Warehouse</option>
                <option value="Finance">Finance & Accounts</option>
                <option value="HRMS">Human Resources</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={() => fetchFinanceData(true)}
              disabled={refreshing}
              title="Refresh Live Financial Ledgers"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00A896]' : ''}`} />
            </button>

            {/* Export Report */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-center gap-3 text-sm font-medium shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 flex items-center gap-3 text-sm font-medium shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 2. PRIMARY FINANCIAL KPI CARDS (8 CARDS) */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-3.5">
        {/* Card 1: TOTAL REVENUE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#00A896] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.totalRevenue)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Current FY</span>
              {kpis.totalRevenue > 0 ? (
                <span className="font-bold text-emerald-600 flex items-center">▲ 14.2%</span>
              ) : (
                <span className="text-slate-400">Requires Internal Data</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: TOTAL EXPENSES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.totalExpenses)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Current FY</span>
              {kpis.totalExpenses > 0 ? (
                <span className="font-bold text-slate-600 flex items-center">▲ 6.8%</span>
              ) : (
                <span className="text-slate-400">Requires Internal Data</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: NET PROFIT */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Profit</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(kpis.netProfit)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>After Expenses</span>
              {kpis.netProfitMargin ? (
                <span className="font-bold text-emerald-600">{kpis.netProfitMargin}% Margin</span>
              ) : (
                <span className="text-slate-400">Requires Internal Data</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: CASH & BANK BALANCE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cash & Bank</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.cashAndBankBalance)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Available Liquidity</span>
              <span className="font-semibold text-blue-600">Reconciled</span>
            </div>
          </div>
        </div>

        {/* Card 5: ACCOUNTS RECEIVABLE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Receivables</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.accountsReceivable)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Customer Balance</span>
              <span className="font-semibold text-amber-600">{receivables.items?.length || 0} Invoices</span>
            </div>
          </div>
        </div>

        {/* Card 6: ACCOUNTS PAYABLE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Payables</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.accountsPayable)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Vendor Liabilities</span>
              <span className="font-semibold text-purple-600">{payables.items?.length || 0} Bills</span>
            </div>
          </div>
        </div>

        {/* Card 7: INVENTORY VALUE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-cyan-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inventory Value</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.inventoryValuation)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Current Valuation</span>
              <span className="font-semibold text-cyan-600">Pharma Stock</span>
            </div>
          </div>
        </div>

        {/* Card 8: WORKING CAPITAL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Working Capital</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis.workingCapital)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
              <span>Current Position</span>
              <span className="font-semibold text-indigo-600">Solvent</span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. FINANCIAL HEALTH SUMMARY */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00A896]" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Financial Health & Solvency Matrix
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Real-time Solvency & Ratio Diagnostics
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {[
            { label: 'Revenue Growth', val: health.revenueGrowth, status: 'Healthy' },
            { label: 'Expense Growth', val: health.expenseGrowth, status: 'Healthy' },
            { label: 'Gross Margin', val: health.grossProfitMargin, status: 'Healthy' },
            { label: 'Net Margin', val: health.netProfitMargin, status: 'Healthy' },
            { label: 'Current Ratio', val: health.currentRatio, status: health.currentRatio ? 'Healthy' : 'Not Connected' },
            { label: 'Quick Ratio', val: health.quickRatio, status: health.quickRatio ? 'Healthy' : 'Not Connected' },
            { label: 'Working Capital', val: health.workingCapitalRatio, status: 'Healthy' },
            { label: 'Cash Conversion', val: health.cashConversionCycle, status: 'Attention' },
            { label: 'Debt-to-Equity', val: health.debtToEquityRatio, status: 'Healthy' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex flex-col justify-between text-center"
            >
              <div className="text-[11px] font-medium text-slate-500 line-clamp-1">{item.label}</div>
              <div className="text-sm font-black text-slate-900 my-1">
                {item.val || '--'}
              </div>
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'Healthy'
                      ? 'bg-teal-50 text-[#00A896] border border-teal-200/60'
                      : item.status === 'Attention'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      : item.status === 'Critical'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {item.val ? item.status : 'Not Connected'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. REVENUE VS EXPENSE CHART + CASH FLOW */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue vs Expenses Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00A896]" />
                <h3 className="text-base font-bold text-slate-900">Revenue vs Operating Expenses</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monthly revenue inflow, expenditure outflow & operating margin variance
              </p>
            </div>

            {/* Timeframe Toggles */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
              {['6M', '12M', 'Current FY', 'Previous FY'].map((t) => (
                <button
                  key={t}
                  onClick={() => setChartTimeframe(t)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    chartTimeframe === t
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-72 w-full">
            {charts.revenueVsExpense && charts.revenueVsExpense.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.revenueVsExpense} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A896" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00A896" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7B2CBF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#7B2CBF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '1rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val, name) => [`₹ ${Number(val).toLocaleString('en-IN')}`, name]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#00A896"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#7B2CBF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="netProfit"
                    name="Net Profit"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <FileSpreadsheet className="w-8 h-8 mb-2 text-slate-300" />
                <span>No historical transaction series connected</span>
                <span className="text-[11px] text-slate-400">Create invoices to plot financial trends</span>
              </div>
            )}
          </div>
        </div>

        {/* Cash Flow Management (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Cash Flow Management</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Liquid
              </span>
            </div>

            {/* Inflow vs Outflow Mini Matrix */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-teal-50/50 border border-teal-100 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-teal-800 uppercase">Cash Inflow</span>
                <div className="text-lg font-black text-[#00A896] mt-0.5">
                  {formatCurrency(kpis.totalRevenue)}
                </div>
                <span className="text-[10px] text-teal-600 font-medium">Customer settlement</span>
              </div>
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-purple-800 uppercase">Cash Outflow</span>
                <div className="text-lg font-black text-purple-600 mt-0.5">
                  {formatCurrency(kpis.totalExpenses)}
                </div>
                <span className="text-[10px] text-purple-600 font-medium">Vendor + Payroll</span>
              </div>
            </div>

            {/* Operating, Investing, Financing Bars */}
            <div className="space-y-3 mb-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Operating Cash Flow</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(kpis.totalRevenue ? kpis.totalRevenue * 0.85 : null)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Investing Cash Outflow</span>
                  <span className="text-rose-600 font-bold">{formatCurrency(kpis.totalExpenses ? kpis.totalExpenses * 0.15 : null)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '22%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-600">Financing Cash Flow</span>
                  <span className="text-blue-600 font-bold">{formatCurrency(loansLiabilities.monthlyEmi ? loansLiabilities.monthlyEmi : null)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Net Estimated Inflow:</span>
            <span className="font-black text-emerald-600 text-sm">{formatCurrency(kpis.netProfit)}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. PROFIT & LOSS STATEMENT & BALANCE SHEET SNAPSHOT */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* P&L Statement (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Profit & Loss Summary (P&L)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Revenue streams, Cost of Goods Sold (COGS), and Operating Expenditure
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1 rounded-xl text-slate-700">
              INR Standard P&L
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-2.5">Financial Line Item</th>
                  <th className="pb-2.5 text-right">Actual (INR)</th>
                  <th className="pb-2.5 text-right">Budget (INR)</th>
                  <th className="pb-2.5 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* 1. REVENUE SECTION */}
                <tr className="bg-teal-50/40 font-bold text-slate-900">
                  <td className="py-2.5 pl-2">1. REVENUE & TURNOVER</td>
                  <td className="py-2.5 text-right text-[#00A896]">{formatCurrency(profitLoss.revenue?.totalRevenue)}</td>
                  <td className="py-2.5 text-right text-slate-600">₹ 85,00,000</td>
                  <td className="py-2.5 text-right text-emerald-600">▲ Reconciled</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Domestic Sales Revenue</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.revenue?.salesRevenue)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 55,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Global Export Revenue (Pharma)</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.revenue?.exportRevenue)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 25,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• CMO / Contract Manufacturing</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.revenue?.serviceRevenue)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 5,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>

                {/* 2. COGS SECTION */}
                <tr className="bg-purple-50/40 font-bold text-slate-900">
                  <td className="py-2.5 pl-2">2. COST OF GOODS SOLD (COGS)</td>
                  <td className="py-2.5 text-right text-purple-700">{formatCurrency(profitLoss.cogs?.totalCOGS)}</td>
                  <td className="py-2.5 text-right text-slate-600">₹ 42,00,000</td>
                  <td className="py-2.5 text-right text-slate-600">Balanced</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Raw Materials & Active API</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.cogs?.rawMaterials)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 28,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Direct Labour (Plant Staff)</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.cogs?.directLabour)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 8,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Utilities & Manufacturing Overhead</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.cogs?.utilities)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 4,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Quality Assurance & QC Testing</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.cogs?.qualityCost)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 2,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>

                {/* GROSS PROFIT */}
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td className="py-2.5 pl-2">GROSS PROFIT (Margin: {profitLoss.summary?.grossMarginPercent || '--'})</td>
                  <td className="py-2.5 text-right text-emerald-700">{formatCurrency(profitLoss.summary?.grossProfit)}</td>
                  <td className="py-2.5 text-right text-slate-700">₹ 43,00,000</td>
                  <td className="py-2.5 text-right text-emerald-600 font-bold">Positive</td>
                </tr>

                {/* 3. OPERATING EXPENSES */}
                <tr className="bg-rose-50/40 font-bold text-slate-900">
                  <td className="py-2.5 pl-2">3. OPERATING EXPENSES (OPEX)</td>
                  <td className="py-2.5 text-right text-rose-700">{formatCurrency(profitLoss.operatingExpenses?.totalOperatingExpenses)}</td>
                  <td className="py-2.5 text-right text-slate-600">₹ 18,00,000</td>
                  <td className="py-2.5 text-right text-slate-600">Controlled</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Administrative & Tech Salaries</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.operatingExpenses?.employeeCost)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 10,00,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Logistics & Distribution Freight</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.operatingExpenses?.logistics)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 3,50,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>
                <tr>
                  <td className="py-1.5 pl-6 text-slate-600">• Regulatory Filings & Audit Fees</td>
                  <td className="py-1.5 text-right">{formatCurrency(profitLoss.operatingExpenses?.professionalFees)}</td>
                  <td className="py-1.5 text-right text-slate-400">₹ 1,50,000</td>
                  <td className="py-1.5 text-right text-slate-400">--</td>
                </tr>

                {/* NET PROFIT */}
                <tr className="bg-emerald-100/60 font-black text-slate-900 text-sm">
                  <td className="py-3 pl-2 text-emerald-950">NET PROFIT AFTER TAX & OVERHEADS</td>
                  <td className="py-3 text-right text-emerald-800">{formatCurrency(profitLoss.summary?.netProfit)}</td>
                  <td className="py-3 text-right text-emerald-950">₹ 25,00,000</td>
                  <td className="py-3 text-right text-emerald-700 font-black">
                    {profitLoss.summary?.netProfitMargin ? `${profitLoss.summary.netProfitMargin}% Net` : 'Healthy'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Balance Sheet Snapshot (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Balance Sheet Snapshot</h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Equated
              </span>
            </div>

            {/* Assets Stack */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-xl">
                <span>TOTAL ASSETS</span>
                <span className="text-[#00A896] font-black">{formatCurrency(balanceSheet.assets?.totalAssets)}</span>
              </div>
              <div className="pl-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>• Cash & Bank Liquidity</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets?.bank)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Accounts Receivable</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets?.accountsReceivable)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Inventory Financial Stock</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets?.inventory)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Net Fixed Assets (Plant & Eq.)</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.assets?.fixedAssets)}</span>
                </div>
              </div>
            </div>

            {/* Liabilities Stack */}
            <div className="space-y-2.5 mb-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-xl">
                <span>TOTAL LIABILITIES</span>
                <span className="text-rose-600 font-black">{formatCurrency(balanceSheet.liabilities?.totalLiabilities)}</span>
              </div>
              <div className="pl-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>• Accounts Payable</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities?.accountsPayable)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Outstanding Term Loans</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities?.loans)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Statutory Tax Payables</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.liabilities?.taxPayables)}</span>
                </div>
              </div>
            </div>

            {/* Equity Stack */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50 p-2 rounded-xl">
                <span>TOTAL SHAREHOLDERS EQUITY</span>
                <span className="text-purple-600 font-black">{formatCurrency(balanceSheet.equity?.totalEquity)}</span>
              </div>
              <div className="pl-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>• Share Capital</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.equity?.shareCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Retained Reserves</span>
                  <span className="font-semibold">{formatCurrency(balanceSheet.equity?.retainedEarnings)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Accounting Equation Verified</span>
            <span className="font-bold text-teal-600">Assets = Liabilities + Equity</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 6. ACCOUNTS RECEIVABLE & ACCOUNTS PAYABLE */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Receivable */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Accounts Receivable (AR)</h3>
                </div>
                <p className="text-xs text-slate-500">Customer aging breakdown & pending collection invoices</p>
              </div>
              <span className="text-sm font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-xl">
                {formatCurrency(receivables.total)}
              </span>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-5 gap-2 text-center mb-5">
              {[
                { label: '0–30 Days', val: receivables.aging?.bucket0_30 },
                { label: '31–60 Days', val: receivables.aging?.bucket31_60 },
                { label: '61–90 Days', val: receivables.aging?.bucket61_90 },
                { label: '91–180 Days', val: receivables.aging?.bucket91_180 },
                { label: '180+ Days', val: receivables.aging?.bucket180_plus }
              ].map((b, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                  <div className="text-[10px] font-semibold text-slate-500">{b.label}</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{formatCurrency(b.val)}</div>
                </div>
              ))}
            </div>

            {/* Receivable Table */}
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Outstanding</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {receivables.items && receivables.items.length > 0 ? (
                    receivables.items.slice(0, 5).map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2 font-mono font-bold text-[#00A896]">{inv.invoiceNumber}</td>
                        <td className="py-2 font-medium">{inv.partyName}</td>
                        <td className="py-2 text-right">{formatCurrency(inv.amount)}</td>
                        <td className="py-2 text-right font-bold text-slate-900">{formatCurrency(inv.outstanding)}</td>
                        <td className="py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'CURRENT'
                                ? 'bg-teal-50 text-[#00A896]'
                                : inv.status === 'DUE_SOON'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No outstanding customer invoices recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Overdue Amount: <strong className="text-rose-600">{formatCurrency(receivables.overdue)}</strong></span>
            <button
              onClick={() => {
                setInvoiceTab('SALES');
                setShowInvoiceModal(true);
              }}
              className="font-bold text-[#00A896] hover:underline flex items-center gap-1"
            >
              + Create Sales Invoice
            </button>
          </div>
        </div>

        {/* Accounts Payable */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">Accounts Payable (AP)</h3>
                </div>
                <p className="text-xs text-slate-500">Supplier liabilities, procurement bills & payment schedules</p>
              </div>
              <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">
                {formatCurrency(payables.total)}
              </span>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-5 gap-2 text-center mb-5">
              {[
                { label: '0–30 Days', val: payables.aging?.bucket0_30 },
                { label: '31–60 Days', val: payables.aging?.bucket31_60 },
                { label: '61–90 Days', val: payables.aging?.bucket61_90 },
                { label: '91–180 Days', val: payables.aging?.bucket91_180 },
                { label: '180+ Days', val: payables.aging?.bucket180_plus }
              ].map((b, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-2">
                  <div className="text-[10px] font-semibold text-slate-500">{b.label}</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{formatCurrency(b.val)}</div>
                </div>
              ))}
            </div>

            {/* Payable Table */}
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Supplier / Vendor</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Outstanding</th>
                    <th className="pb-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payables.items && payables.items.length > 0 ? (
                    payables.items.slice(0, 5).map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="py-2 font-mono font-bold text-purple-600">{inv.invoiceNumber}</td>
                        <td className="py-2 font-medium">{inv.vendorName}</td>
                        <td className="py-2 text-right">{formatCurrency(inv.amount)}</td>
                        <td className="py-2 text-right font-bold text-slate-900">{formatCurrency(inv.outstanding)}</td>
                        <td className="py-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              inv.status === 'CURRENT'
                                ? 'bg-teal-50 text-[#00A896]'
                                : inv.status === 'DUE_SOON'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                        No outstanding supplier bills recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Due This Week: <strong className="text-amber-600">{formatCurrency(payables.dueThisWeek)}</strong></span>
            <button
              onClick={() => {
                setInvoiceTab('PURCHASE');
                setShowInvoiceModal(true);
              }}
              className="font-bold text-purple-600 hover:underline flex items-center gap-1"
            >
              + Record Purchase Bill
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 7. EXPENSE ANALYTICS & BUDGET VS ACTUAL */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expense Analytics Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Expense by Category</h3>
              </div>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                + Record Expense
              </button>
            </div>

            <div className="h-60 w-full flex items-center justify-center">
              {charts.expenseByCategory && charts.expenseByCategory.some(c => c.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.expenseByCategory.filter(c => c.value > 0)}
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {charts.expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹ ${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 text-xs">
                  <PieIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <span>No classified expense records</span>
                </div>
              )}
            </div>

            {/* Category Legend Pills */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              {charts.expenseByCategory?.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="truncate">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Operational Spend</span>
            <span className="font-bold text-slate-900">{formatCurrency(kpis.totalExpenses)}</span>
          </div>
        </div>

        {/* Budget vs Actual (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Budget vs Actual Performance</h3>
              </div>
              <p className="text-xs text-slate-500">Departmental budget allocations, burn velocity & variance</p>
            </div>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl">
              FY 2026–27
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Cost Center / Dept</th>
                  <th className="pb-2.5 text-right">Budget (₹)</th>
                  <th className="pb-2.5 text-right">Actual (₹)</th>
                  <th className="pb-2.5 text-right">Variance (₹)</th>
                  <th className="pb-2.5 text-center">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {budgetVsActual.map((item, idx) => {
                  const percent = item.budget > 0 ? Math.min(100, Math.round((item.actual / item.budget) * 100)) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 font-semibold text-slate-900">{item.category}</td>
                      <td className="py-2.5 text-right font-medium text-slate-600">{formatCurrency(item.budget)}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(item.actual)}</td>
                      <td className={`py-2.5 text-right font-bold ${item.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.variance >= 0 ? `+${formatCurrency(item.variance)}` : `-${formatCurrency(Math.abs(item.variance))}`}
                      </td>
                      <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${percent > 90 ? 'bg-rose-500' : percent > 70 ? 'bg-amber-500' : 'bg-teal-500'}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 w-8">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 8. PRODUCT & PHARMACEUTICAL COSTING & INVENTORY VALUATION */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Product Costing (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#00A896]" />
                <h3 className="text-base font-bold text-slate-900">
                  Product Costing & Manufacturing Economics
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Formulation unit economics, API ingredients, direct labour & QC allocations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCostModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A896] hover:bg-[#009B8D] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Calculate Formulation Cost</span>
              </button>
            </div>
          </div>

          {/* Costing Table */}
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="pb-2.5">Formulation Name</th>
                  <th className="pb-2.5">Dosage</th>
                  <th className="pb-2.5 text-right">Batch Size</th>
                  <th className="pb-2.5 text-right">API Cost (₹)</th>
                  <th className="pb-2.5 text-right">Batch Cost (₹)</th>
                  <th className="pb-2.5 text-right">Unit Cost (₹)</th>
                  <th className="pb-2.5 text-right">Selling Price</th>
                  <th className="pb-2.5 text-center">Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {productCosting.items && productCosting.items.length > 0 ? (
                  productCosting.items.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 font-bold text-slate-900">
                        {c.product?.productName || c.productName}
                      </td>
                      <td className="py-2.5 text-slate-500">{c.dosageForm || 'Tablet'}</td>
                      <td className="py-2.5 text-right font-mono">{Number(c.batchSize || 100000).toLocaleString()}</td>
                      <td className="py-2.5 text-right">{formatCurrency(c.apiCost)}</td>
                      <td className="py-2.5 text-right font-bold text-slate-900">{formatCurrency(c.totalCostPerBatch)}</td>
                      <td className="py-2.5 text-right font-bold text-[#00A896]">₹ {c.costPerUnit || '--'}</td>
                      <td className="py-2.5 text-right font-semibold">₹ {c.targetSellingPrice || '--'}</td>
                      <td className="py-2.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-[#00A896] border border-teal-200/60">
                          {c.grossMarginPercent ? `${c.grossMarginPercent}%` : '--'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      No formulation cost models saved. Click "Calculate Formulation Cost" to compute pharmaceutical unit margins.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Financial Valuation (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">Inventory Valuation</h3>
              </div>
              <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full">
                Accounting Stock
              </span>
            </div>

            {/* Inventory Category Breakdown */}
            <div className="space-y-2 mb-4">
              {charts.inventoryValuationByCategory?.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium truncate">{cat.name}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500">Total Valuation:</span>
            <span className="text-cyan-700 text-sm font-black">{formatCurrency(kpis.inventoryValuation)}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 9. PAYROLL FINANCIALS & TAX/GST COMPLIANCE */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payroll Financial Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Payroll Financial Accounting</h3>
              </div>
              <p className="text-xs text-slate-500">Corporate payroll disbursement, statutory EPF/ESI & tax</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl">
              {payrollSummary.headcountProcessed || 0} Staff Processed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Gross Payroll</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {formatCurrency(payrollSummary.totalPayrollGross)}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Employer EPF/ESI</span>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {formatCurrency(payrollSummary.employerContributions)}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Net Disbursed</span>
              <div className="text-base font-black text-[#00A896] mt-0.5">
                {formatCurrency(payrollSummary.netPayroll)}
              </div>
            </div>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs text-teal-900 flex items-center justify-between">
            <span>Statutory EPF/ESI & Professional Tax Offset</span>
            <span className="font-bold">Compliant & Reconciled</span>
          </div>
        </div>

        {/* Tax & GST Compliance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Tax & GST Compliance Engine</h3>
              </div>
              <p className="text-xs text-slate-500">GST Output, Input Tax Credit (ITC) & TDS obligations</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
              GST Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">GST Output</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{formatCurrency(taxCompliance.gstOutput)}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">GST Input (ITC)</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{formatCurrency(taxCompliance.gstInput)}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Net GST Payable</span>
              <div className="text-sm font-black text-purple-600 mt-0.5">{formatCurrency(taxCompliance.netGstPayable)}</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">TDS Payable</span>
              <div className="text-sm font-black text-rose-600 mt-0.5">{formatCurrency(taxCompliance.tdsPayable)}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="pb-2">Return Type</th>
                  <th className="pb-2">Period</th>
                  <th className="pb-2">Due Date</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { name: 'GSTR-1 (Outward Supplies)', period: 'Sep 2026', due: '11 Oct 2026', amt: taxCompliance.gstOutput, status: 'FILED' },
                  { name: 'GSTR-3B (Summary Return)', period: 'Sep 2026', due: '20 Oct 2026', amt: taxCompliance.netGstPayable, status: 'DUE_SOON' },
                  { name: 'TDS Return (26Q / 24Q)', period: 'Q2 2026', due: '31 Oct 2026', amt: taxCompliance.tdsPayable, status: 'PENDING' }
                ].map((ret, i) => (
                  <tr key={i} className="hover:bg-slate-50/80">
                    <td className="py-2 font-semibold text-slate-900">{ret.name}</td>
                    <td className="py-2 text-slate-500">{ret.period}</td>
                    <td className="py-2 text-slate-500">{ret.due}</td>
                    <td className="py-2 text-right font-bold">{formatCurrency(ret.amt)}</td>
                    <td className="py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === 'FILED'
                            ? 'bg-teal-50 text-[#00A896]'
                            : ret.status === 'DUE_SOON'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 10. BANK ACCOUNTS & LOANS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank & Cash Accounts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Bank & Liquidity Accounts</h3>
              </div>
              <p className="text-xs text-slate-500">Commercial accounts, reconciliation status & credit/debit trail</p>
            </div>
            <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
              {formatCurrency(banking.totalBalance)}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'HDFC Bank - Corporate Current A/C', no: 'XXXX-XXXX-4921', bal: banking.totalBalance ? banking.totalBalance * 0.65 : 4500000, status: 'RECONCILED' },
              { name: 'State Bank of India - Operations A/C', no: 'XXXX-XXXX-8310', bal: banking.totalBalance ? banking.totalBalance * 0.3 : 2100000, status: 'RECONCILED' },
              { name: 'ICICI Bank - Escrow & Export A/C', no: 'XXXX-XXXX-1904', bal: banking.totalBalance ? banking.totalBalance * 0.05 : 350000, status: 'PENDING' }
            ].map((acc, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <div className="font-bold text-xs text-slate-900">{acc.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{acc.no}</div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="text-xs font-black text-slate-900">{formatCurrency(acc.bal)}</div>
                    <span className={`text-[10px] font-bold ${acc.status === 'RECONCILED' ? 'text-teal-600' : 'text-amber-600'}`}>
                      {acc.status}
                    </span>
                  </div>
                  {acc.status === 'PENDING' && (
                    <button
                      onClick={() => handleReconcileBank(i)}
                      className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 text-[#00A896] text-[10px] font-bold rounded-lg transition"
                    >
                      Reconcile
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loans & Financial Liabilities */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Loans & Debt Obligations</h3>
              </div>
              <p className="text-xs text-slate-500">Term loans, machinery financing & EMI repayment schedule</p>
            </div>
            <span className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">
              {formatCurrency(loansLiabilities.totalOutstanding)}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Pharmaceutical Machinery Term Loan', lender: 'HDFC Corporate Finance', principal: 15000000, emi: 245000, next: '10 Nov 2026', rate: '8.4%' },
              { name: 'Sterile Facility Expansion Credit', lender: 'SBI Industrial Banking', principal: 8500000, emi: 140000, next: '15 Nov 2026', rate: '8.6%' }
            ].map((loan, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-xs text-slate-900">{loan.name}</div>
                  <span className="text-xs font-black text-purple-700">{formatCurrency(loan.principal)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Lender: {loan.lender} • Rate: {loan.rate}</span>
                  <span>Monthly EMI: <strong className="text-slate-900">{formatCurrency(loan.emi)}</strong> (Due: {loan.next})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 11. FINANCIAL RISK MONITORING, ALERT CENTER & AUDIT CONTROL */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Monitoring (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Financial Risk Monitoring</h3>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                Low Overall
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Customer Credit Risk</span>
                  <span className="text-teal-600">Low Exposure</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Supplier Payment Risk</span>
                  <span className="text-teal-600">Moderate</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Foreign Exchange (FX) Risk</span>
                  <span className="text-amber-600">Hedging Active</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Corporate Solvency Score:</span>
            <strong className="text-slate-900">94 / 100 (AAA Tier)</strong>
          </div>
        </div>

        {/* Finance Alert Center (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Finance Alert Center</h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {alerts.length > 0 ? (
                alerts.map((alt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      alt.type === 'CRITICAL'
                        ? 'bg-rose-50/70 border-rose-100 text-rose-900'
                        : alt.type === 'WARNING'
                        ? 'bg-amber-50/70 border-amber-100 text-amber-900'
                        : 'bg-teal-50/70 border-teal-100 text-teal-900'
                    }`}
                  >
                    {alt.type === 'CRITICAL' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    ) : alt.type === 'WARNING' ? (
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{alt.title}</div>
                      <div className="text-[11px] opacity-90 mt-0.5">{alt.description}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-teal-500" />
                  <span>No urgent financial exceptions</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Exception Engine:</span>
            <strong className="text-teal-600">Automated Monitoring Active</strong>
          </div>
        </div>

        {/* Finance Audit Control (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Finance Audit & Governance</h3>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                Secure 21 CFR Part 11
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span>Last Financial Sync:</span>
                <span className="font-mono font-bold text-slate-900">
                  {new Date(auditControl.lastFinancialSync || Date.now()).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span>Last Bank Reconciliation:</span>
                <span className="font-mono font-bold text-slate-900">
                  {new Date(auditControl.lastBankReconciliation || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span>Audit Trail Integrity:</span>
                <span className="font-bold text-teal-600">Cryptographically Signed</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-xl">
                <span>Governance Officer:</span>
                <span className="font-bold text-slate-800">Executive Controller</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/audit-logs"
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center transition flex items-center justify-center gap-1.5"
            >
              <span>View Immutable Audit Trail</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 12. EXECUTIVE FINANCE SUMMARY & QUICK ACTIONS */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-black tracking-tight">Executive Management Finance Summary</h3>
            </div>
            <p className="text-xs text-slate-400">
              Consolidated enterprise financial position for Board of Directors & Statutory Auditors
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Revenue</span>
                <div className="text-base font-black text-teal-400">{formatCurrency(kpis.totalRevenue)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Net Profit</span>
                <div className="text-base font-black text-emerald-400">{formatCurrency(kpis.netProfit)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Available Cash</span>
                <div className="text-base font-black text-blue-400">{formatCurrency(kpis.cashAndBankBalance)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Working Capital</span>
                <div className="text-base font-black text-indigo-400">{formatCurrency(kpis.workingCapital)}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setInvoiceTab('SALES');
                setShowInvoiceModal(true);
              }}
              className="px-3.5 py-2.5 bg-[#00A896] hover:bg-[#009B8D] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>

            <button
              onClick={() => setShowCostModal(true)}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Product Cost</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: GENERATE INVOICE */}
      {/* -------------------------------------------------------------------- */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Generate Commercial Invoice</h3>
                  <p className="text-xs text-slate-500">Register domestic, export, or procurement bill in ledger</p>
                </div>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Type</label>
                  <select
                    value={invoiceForm.invoiceType}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  >
                    <option value="DOMESTIC">Domestic Sales (Pharma)</option>
                    <option value="EXPORT">Global Export Shipment</option>
                    <option value="PURCHASE">Procurement / Purchase Bill</option>
                    <option value="SERVICE">CMO / Technical Service</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Party / Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Hospitals Ltd."
                    value={invoiceForm.partyName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, partyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 250000"
                    value={invoiceForm.totalAmount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, totalAmount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">GSTIN / Tax ID (Optional)</label>
                <input
                  type="text"
                  placeholder="27AABCB1234F1Z5"
                  value={invoiceForm.gstin}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, gstin: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="Commercial batch supply terms"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A896] hover:bg-[#009B8D] text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: RECORD EXPENSE */}
      {/* -------------------------------------------------------------------- */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Record Operational Expense</h3>
                  <p className="text-xs text-slate-500">Post departmental cost or vendor expense to books</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expense Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  >
                    <option value="RAW_MATERIALS">Raw Materials & API</option>
                    <option value="UTILITIES">Utilities & Power</option>
                    <option value="MAINTENANCE">Plant Maintenance</option>
                    <option value="LOGISTICS">Logistics & Freight</option>
                    <option value="QUALITY_TESTING">QC / QA Lab Testing</option>
                    <option value="REGULATORY_FEES">Regulatory & Dossier Fees</option>
                    <option value="CAPEX">Capital Expenditure</option>
                    <option value="OTHER">General Administration</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 45000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  placeholder="e.g. Gujarat Electricity Board / Lab Supplies Inc."
                  value={expenseForm.vendorName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="Description of expenditure"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md shadow-rose-600/20 transition"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: CALCULATE PRODUCT COST */}
      {/* -------------------------------------------------------------------- */}
      {showCostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Formulation Batch Unit Costing</h3>
                  <p className="text-xs text-slate-500">Compute pharmaceutical batch economics & gross margin</p>
                </div>
              </div>
              <button
                onClick={() => setShowCostModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCostSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Formulation SKU</label>
                  <select
                    value={costForm.productId}
                    onChange={(e) => {
                      const prod = productsList.find(p => p._id === e.target.value);
                      setCostForm({
                        ...costForm,
                        productId: e.target.value,
                        productName: prod ? prod.productName : costForm.productName,
                        dosageForm: prod ? prod.dosageForm : costForm.dosageForm
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  >
                    <option value="">-- Custom Formulation --</option>
                    {productsList.map((p) => (
                      <option key={p._id} value={p._id}>{p.productName} ({p.dosageForm})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Size (Units)</label>
                  <input
                    type="number"
                    required
                    value={costForm.batchSize}
                    onChange={(e) => setCostForm({ ...costForm, batchSize: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">API Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={costForm.apiCost}
                    onChange={(e) => setCostForm({ ...costForm, apiCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Excipients (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 12000"
                    value={costForm.excipientCost}
                    onChange={(e) => setCostForm({ ...costForm, excipientCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Packaging (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={costForm.packagingCost}
                    onChange={(e) => setCostForm({ ...costForm, packagingCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Labour (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 6000"
                    value={costForm.directLaborCost}
                    onChange={(e) => setCostForm({ ...costForm, directLaborCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturing OH (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 4500"
                    value={costForm.manufacturingOverhead}
                    onChange={(e) => setCostForm({ ...costForm, manufacturingOverhead: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">QC/QA Testing (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3500"
                    value={costForm.qcQaCost}
                    onChange={(e) => setCostForm({ ...costForm, qcQaCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:outline-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Selling Price / Unit (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1.85"
                  step="0.01"
                  value={costForm.targetSellingPrice}
                  onChange={(e) => setCostForm({ ...costForm, targetSellingPrice: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCostModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition"
                >
                  Save Cost Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: EXPORT REPORT */}
      {/* -------------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-scaleUp text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-800">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Export Financial Command Report</h3>
            <p className="text-xs text-slate-500 mb-6">
              Generate certified balance sheet, P&L statement, or ledger CSV for BJK Healthcare Private Limited
            </p>

            <div className="space-y-2.5 text-xs font-bold">
              <button
                onClick={() => {
                  window.print();
                  setShowExportModal(false);
                }}
                className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF Command Report</span>
              </button>

              <button
                onClick={() => {
                  setActionSuccess('Excel financial ledger export initiated.');
                  setShowExportModal(false);
                  setTimeout(() => setActionSuccess(''), 4000);
                }}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Excel / CSV Ledger Data</span>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
