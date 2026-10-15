"use client";

import React from "react";
import {
  ShoppingCart,
  Truck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  FileText,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function ProcurementDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Active Purchase Orders",
      value: 11,
      subtext: "POs in pipeline",
      icon: ShoppingCart,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "+4 Orders",
      trendLabel: "this week",
    },
    {
      title: "Approved Suppliers (ASL)",
      value: 48,
      subtext: "Audit-Qualified Vendors",
      icon: Building2,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "100% Verified",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "Pending Quotations",
      value: 4,
      subtext: "Under RFQ Evaluation",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Lowest Bid Analysed",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Material Stock Cover",
      value: "45 Days",
      subtext: "Safety Stock Days",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "High Reliability",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Create Purchase Order (PO)", icon: Plus, primary: true },
    { label: "Request Quotation (RFQ)", icon: FileText },
    { label: "Search Approved Vendor (ASL)", icon: Building2 },
    { label: "Track Inward Consignment", icon: Truck },
  ];

  const purchaseOrders = [
    {
      poNumber: "PO-2026-042",
      vendor: "Aarti Drugs Ltd (Approved API Vendor)",
      material: "Paracetamol DC Grade Active Pharmaceutical Ingredient",
      quantity: "5,000 kg",
      amount: "₹ 24,00,000",
      status: "IN_TRANSIT",
    },
    {
      poNumber: "PO-2026-043",
      vendor: "Bilcare Research Solutions",
      material: "Alu-Alu Cold Form Printed Foil (25 Micron)",
      quantity: "1,200 kg",
      amount: "₹ 8,40,000",
      status: "CONFIRMED",
    },
    {
      poNumber: "PO-2026-044",
      vendor: "DFE Pharma India Private Ltd",
      material: "Lactose Monohydrate Direct Compression Excipient",
      quantity: "2,500 kg",
      amount: "₹ 4,75,000",
      status: "CUSTOMS_CLEARED",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Purchase & Procurement Command Center — Raw Materials & Supplier ASL"
      departmentCode="PUR"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Purchase Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Raw Material Purchase Orders
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Track delivery stages, supplier commitments and customs clearance
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">{purchaseOrders.length} In-Flight Orders</span>
            </div>

            <div className="space-y-3">
              {purchaseOrders.map((po, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{po.poNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === "IN_TRANSIT"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{po.material}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supplier: <strong className="text-slate-700">{po.vendor}</strong> &bull; Qty: {po.quantity}
                    </p>
                  </div>

                  <span className="text-xs font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-shrink-0">
                    {po.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: ASL & Vendor Metrics */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Approved Supplier List (ASL)
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Active API Suppliers</span>
                <span className="font-bold text-slate-800">18 Qualified</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Primary Packaging Vendors</span>
                <span className="font-bold text-slate-800">14 Qualified</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Excipient Manufacturers</span>
                <span className="font-bold text-slate-800">16 Qualified</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="font-bold">ASL Vendor GMP Audits</span>
                <span className="font-bold">100% Valid</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
