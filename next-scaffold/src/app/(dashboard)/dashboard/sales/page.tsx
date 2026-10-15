"use client";

import React from "react";
import {
  TrendingUp,
  Users,
  Briefcase,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  FileSpreadsheet,
  Package,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function SalesDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Sales Pipeline Value",
      value: "₹ 4,80,00,000",
      subtext: "Active CRM Deals",
      icon: TrendingUp,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "+18.5%",
      trendLabel: "vs last month",
    },
    {
      title: "B2B Leads & CMO Contracts",
      value: "14 / 6",
      subtext: "Institutional Clients",
      icon: Briefcase,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "6 Contracts Active",
      trendColor: "text-indigo-600 font-bold",
    },
    {
      title: "New Website Inquiries",
      value: 9,
      subtext: "Domestic & Export Leads",
      icon: Mail,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "4 Need Follow-Up",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Catalog SKUs Available",
      value: 111,
      subtext: "Tablets, Caps, Syrups",
      icon: Package,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "100% Ready for Supply",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Record Customer Lead", icon: Plus, primary: true },
    { label: "Generate Commercial Quotation", icon: Briefcase },
    { label: "Browse Products (111 SKUs)", icon: Package },
    { label: "Export Sales Pipeline", icon: FileSpreadsheet },
  ];

  const deals = [
    {
      client: "Max Healthcare Institute Ltd",
      type: "Annual Rate Contract (ARC)",
      value: "₹ 1,20,00,000",
      stage: "FINAL_PROPOSAL",
      products: "Solid Orals & Syrups",
    },
    {
      client: "Pharmarx Distribution Guild",
      type: "Distributor Stockist Deal",
      value: "₹ 65,00,000",
      stage: "ORDER_PLACED",
      products: "Paracetamol & Amoxicillin",
    },
    {
      client: "Gulf Health Alliance (UAE)",
      type: "Export Commercial Order",
      value: "₹ 95,00,000",
      stage: "CONTRACT_NEGOTIATION",
      products: "Finished Formulations",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Commercial, Sales & Marketing Command Center — CRM & B2B Inquiries"
      departmentCode="SLS"
      departmentBadgeColor="indigo"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: CRM Deals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    High-Value Institutional B2B Pipeline
                  </h3>
                  <p className="text-[11px] text-slate-400">Hospitals, distributors and export procurement contracts</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">₹ 4.80 Cr Pipeline</span>
            </div>

            <div className="space-y-3">
              {deals.map((deal, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{deal.client}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {deal.stage}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{deal.type}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Scope: {deal.products}</p>
                  </div>

                  <span className="text-sm font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-shrink-0">
                    {deal.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Export Readiness */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Commercial Portfolio Readiness
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Total BJK Products</span>
                <span className="font-bold text-slate-800">111 Commercial SKUs</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Domestic Distributors</span>
                <span className="font-bold text-slate-800">32 Active Partners</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Export Consignments</span>
                <span className="font-bold text-[#00A896]">14 Delivered (FY 2026)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
