"use client";

import React from "react";
import {
  Boxes,
  Truck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  PackageCheck,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function WarehouseDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Total Tracked SKUs",
      value: 111,
      subtext: "Official BJK Portfolio",
      icon: Boxes,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "100% Traceable",
      trendLabel: "by Lot",
    },
    {
      title: "Quarantine Lots",
      value: 2,
      subtext: "Under QC Sampling",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Awaiting QC Sign",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Low Stock Alerts",
      value: 3,
      subtext: "Below Reorder Point",
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600",
      trend: "PR Raised",
      trendColor: "text-rose-600 font-bold",
    },
    {
      title: "Stock Accuracy Rate",
      value: "99.8%",
      subtext: "Cycle Count Audit",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "Verified Today",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Receive Inward Goods (GRN)", icon: Plus, primary: true },
    { label: "Record Stock Transfer", icon: Truck },
    { label: "Release Quarantined Stock", icon: PackageCheck },
    { label: "Export Inventory Ledger", icon: FileSpreadsheet },
  ];

  const lots = [
    {
      itemCode: "RAW-PAR-082",
      itemName: "Paracetamol Fine Powder IP (API)",
      lotNumber: "LOT-PAR-2026-901",
      quantity: "5,000 kg",
      location: "Zone A - Bin R04",
      status: "QUARANTINED",
    },
    {
      itemCode: "PKG-FOIL-022",
      itemName: "Alu-Alu Cold Form Blister Foil",
      lotNumber: "LOT-FOIL-2026-44",
      quantity: "1,200 kg",
      location: "Zone B - Bin P11",
      status: "APPROVED_FOR_DISPATCH",
    },
    {
      itemCode: "EXCP-LAC-015",
      itemName: "Lactose Monohydrate IP (Direct Compression)",
      lotNumber: "LOT-LAC-2026-12",
      quantity: "2,500 kg",
      location: "Zone A - Bin R08",
      status: "APPROVED_FOR_DISPATCH",
    },
  ];

  const zones = [
    { name: "Raw Material API & Excipients (Zone A)", capacity: "82% Utilized", status: "NORMAL" },
    { name: "Finished Formulations Dispatch (Zone B)", capacity: "64% Utilized", status: "NORMAL" },
    { name: "Cold Storage Warehouse (2°C to 8°C)", capacity: "45% Utilized", status: "MONITORED" },
    { name: "Quarantine & Sampling Suite", capacity: "30% Utilized", status: "ACTIVE" },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Warehouse & Inventory Command Center — Materials & Supply Chain"
      departmentCode="WH"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lot Tracking & Inward Goods */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <Boxes size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Raw Material & Packaging Lots
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Traceability by pharmaceutical batch, bin location & GRN
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">111 Products Portfolio</span>
            </div>

            <div className="space-y-3">
              {lots.map((lot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{lot.lotNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lot.status === "QUARANTINED"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {lot.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{lot.itemName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Qty: <strong className="text-slate-700">{lot.quantity}</strong> &bull; Bin: {lot.location}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex-shrink-0">
                    {lot.itemCode}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Zone Capacities */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Warehouse Storage Capacities
            </h3>

            <div className="space-y-2.5 text-xs">
              {zones.map((zone, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{zone.name}</span>
                    <span className="font-mono font-bold text-[#00A896]">{zone.capacity}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Status: {zone.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
