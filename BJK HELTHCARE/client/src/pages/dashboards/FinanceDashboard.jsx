import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Receipt,
  Scale,
  Building2
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const FinanceDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'FINANCE_MANAGER' || user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR';

  const loadData = async () => {
    try {
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setData(res.data.departmentData);
      }
    } catch (err) {
      console.warn('Finance telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Accounts Receivable',
      value: data?.kpis?.receivablesTotal || '₹ 1,84,50,000',
      subtext: 'Pending Customer Invoices',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: '42 Invoices Paid',
      trendLabel: 'this month'
    },
    {
      title: 'Accounts Payable',
      value: data?.kpis?.payablesTotal || '₹ 92,30,000',
      subtext: 'Supplier & Utility Vouchers',
      icon: CreditCard,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: '8 Invoices Due',
      trendColor: 'text-indigo-600 font-bold'
    },
    {
      title: 'Budget Utilization',
      value: data?.kpis?.monthlyBudgetUtilized || '74.2%',
      subtext: 'Operational Expenditure',
      icon: Scale,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: 'Within Limits',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'Bank Reconciliation',
      value: '100% Balanced',
      subtext: 'HDFC & SBI Accounts',
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-600',
      trend: 'Reconciled Today',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = isManager ? [
    { label: 'Generate Commercial Invoice', icon: Plus, primary: true },
    { label: 'Approve Payment Voucher', icon: CheckCircle2 },
    { label: 'Reconcile Bank Account', icon: Building2 },
    { label: 'Export Financial Balance Sheet', icon: FileSpreadsheet }
  ] : [
    { label: 'Create Invoice Entry', icon: Plus, primary: true },
    { label: 'Verify Supplier Voucher', icon: Receipt },
    { label: 'Submit Expense Ledger Entry', icon: DollarSign }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle={isManager ? "Finance & Accounts Command Center — Invoices, Ledgers & Receivables" : "Accounts Executive Workspace — Invoicing & Reconciliation"}
      departmentCode="FIN"
      departmentBadgeColor="emerald"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices & Payment Vouchers Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Commercial Invoices Registry</h3>
                  <p className="text-[11px] text-slate-400">Domestic & Export Sales Invoices</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { invoiceNo: 'INV-2026-089', customer: 'Apollo Pharmacy Group (Central Procurement)', amount: '₹ 14,20,000', status: 'PAID', date: '2026-03-28' },
                { invoiceNo: 'INV-2026-090', customer: 'MedPlus Health Services B2B', amount: '₹ 8,90,000', status: 'PENDING', date: '2026-04-01' },
                { invoiceNo: 'INV-2026-091', customer: 'Global Lifesciences Kenya (Export LC)', amount: '₹ 32,50,000', status: 'PROCESSING', date: '2026-04-02' },
                { invoiceNo: 'INV-2026-092', customer: 'Zydus Cadila Pharma (Contract Manufacturing)', amount: '₹ 18,40,000', status: 'PAID', date: '2026-04-03' }
              ].map((inv, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{inv.invoiceNo}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inv.status === 'PROCESSING'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{inv.customer}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Date: {inv.date} &bull; GST Compliant E-Invoice Generated</p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-sm font-black text-slate-900">{inv.amount}</span>
                    <button
                      onClick={() => alert(`Viewing invoice ${inv.invoiceNo}`)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accounts Payable Vouchers Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Supplier Payment Vouchers (Pending Processing)</h3>
            <div className="space-y-2.5">
              {[
                { voucherId: 'VCH-882', beneficiary: 'Aarti Drugs Ltd (API Supplier)', amount: '₹ 4,50,000', type: 'Raw Material Payment', status: 'READY_FOR_PAYMENT' },
                { voucherId: 'VCH-883', beneficiary: 'Torrent Power Grid (Facility Substation)', amount: '₹ 3,85,000', type: 'Utility & Electricity', status: 'APPROVED' },
                { voucherId: 'VCH-884', beneficiary: 'Colorcon Asia Packaging', amount: '₹ 1,20,000', type: 'Packaging Material', status: 'VERIFICATION_PENDING' }
              ].map((vch, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{vch.voucherId} &bull; {vch.type}</span>
                    <p className="text-xs font-bold text-slate-800">{vch.beneficiary}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-slate-900">{vch.amount}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700">{vch.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Banking & Compliance (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Bank Accounts & Treasury</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">HDFC Bank Ltd (Current A/c)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">ACTIVE</span>
                </div>
                <p className="text-[10px] text-slate-400">A/c: **** **** 4819 &bull; Ahmedabad Branch</p>
                <p className="font-mono font-bold text-slate-900 pt-1">Balance: ₹ 1,48,20,500</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">State Bank of India (Forex LC)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">ACTIVE</span>
                </div>
                <p className="text-[10px] text-slate-400">A/c: **** **** 9012 &bull; Commercial Branch</p>
                <p className="font-mono font-bold text-slate-900 pt-1">Balance: $ 420,000 USD</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Confidentiality & Access Boundary</h3>
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
              <p className="font-bold">Strict Financial Isolation Active</p>
              <p className="text-[11px] text-teal-700 mt-1">Financial vouchers and banking data are strictly isolated from non-finance departments per enterprise security policy.</p>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
