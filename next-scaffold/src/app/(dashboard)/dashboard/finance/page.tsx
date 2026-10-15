"use client";

import React from "react";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Receipt,
  Scale,
  Building2,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function FinanceDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Accounts Receivable",
      value: "₹ 1,84,50,000",
      subtext: "Pending Invoices",
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "42 Invoices Paid",
      trendLabel: "this month",
    },
    {
      title: "Accounts Payable",
      value: "₹ 92,30,000",
      subtext: "Supplier Vouchers",
      icon: CreditCard,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "8 Invoices Due",
      trendColor: "text-indigo-600 font-bold",
    },
    {
      title: "Budget Utilization",
      value: "74.2%",
      subtext: "Operational Expenditure",
      icon: Scale,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "Within Limits",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "Bank Reconciliation",
      value: "100% Balanced",
      subtext: "HDFC & SBI Accounts",
      icon: Building2,
      iconBg: "bg-blue-50 text-blue-600",
      trend: "Reconciled Today",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Generate Commercial Invoice", icon: Plus, primary: true },
    { label: "Approve Payment Voucher", icon: CheckCircle2 },
    { label: "Reconcile Bank Account", icon: Building2 },
    { label: "Export Balance Sheet", icon: FileSpreadsheet },
  ];

  const invoices = [
    {
      invoiceNo: "INV-2026-0881",
      customer: "Apollo Hospitals Enterprise Ltd",
      amount: "₹ 24,50,000",
      dueDate: "30-Oct-2026",
      status: "PAID",
    },
    {
      invoiceNo: "INV-2026-0882",
      customer: "MedPlus Pharmacy Distribution",
      amount: "₹ 18,20,000",
      dueDate: "05-Nov-2026",
      status: "PENDING",
    },
    {
      invoiceNo: "INV-2026-0883",
      customer: "African Pharma Global Ltd (Export)",
      amount: "₹ 42,00,000",
      dueDate: "15-Nov-2026",
      status: "LETTER_OF_CREDIT",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Finance & Accounts Command Center — Invoices, Ledgers & Receivables"
      departmentCode="FIN"
      departmentBadgeColor="emerald"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Invoices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Receipt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Commercial Invoicing & Receivables
                  </h3>
                  <p className="text-[11px] text-slate-400">Institutional and distributor billing records</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">{invoices.length} Recent Invoices</span>
            </div>

            <div className="space-y-3">
              {invoices.map((inv, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{inv.invoiceNo}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{inv.customer}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Due Date: {inv.dueDate}</p>
                  </div>

                  <span className="text-sm font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-shrink-0">
                    {inv.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Statutory Filings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Statutory Tax & Regulatory Filings
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">GST GSTR-3B Return</p>
                  <p className="text-[10px] text-slate-400">Filed (Ref: GST-2026-SEP)</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  FILED
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">TDS 26Q Corporate</p>
                  <p className="text-[10px] text-slate-400">Q2 Deposited</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  PAID
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">EPF & ESI Challan</p>
                  <p className="text-[10px] text-slate-400">91 Staff Covered</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  RECONCILED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
