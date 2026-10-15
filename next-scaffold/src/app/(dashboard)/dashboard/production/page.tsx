"use client";

import React, { useState } from "react";
import {
  Layers,
  Activity,
  Boxes,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Cpu,
  FileSpreadsheet,
  CheckSquare,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function ProductionDashboardPage() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  const kpis: KPICardItem[] = [
    {
      title: "Active Production Orders",
      value: 4,
      subtext: "Orders in line",
      icon: Layers,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "+12%",
      trendLabel: "vs last week",
    },
    {
      title: "Running Lines",
      value: "3 / 4",
      subtext: "Operational",
      icon: Activity,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "98.4%",
      trendLabel: "OEE Efficiency",
    },
    {
      title: "Batches in Formulation",
      value: 2,
      subtext: "Compounding",
      icon: Boxes,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "On-Schedule",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Packaging & QA Stage",
      value: 3,
      subtext: "Blister & Cartoning",
      icon: CheckSquare,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "Zero Deviation",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Schedule New Batch Order", icon: Plus, primary: true },
    { label: "Allocate Shift Staff", icon: RotateCw },
    { label: "View Line Machine Logbook", icon: Cpu },
    { label: "Export Production Report", icon: FileSpreadsheet },
  ];

  const activeBatches = [
    {
      batchNumber: "BJK-TAB-2026-088",
      productName: "Paracetamol 500mg Tablets",
      batchSize: 500000,
      status: "FORMULATION",
      line: "Solid Oral Line 1",
    },
    {
      batchNumber: "BJK-CAP-2026-042",
      productName: "Amoxicillin 250mg Capsules",
      batchSize: 250000,
      status: "PACKAGING",
      line: "Capsule Line 2",
    },
    {
      batchNumber: "BJK-SYR-2026-019",
      productName: "Cetirizine 5mg/5ml Syrup",
      batchSize: 20000,
      status: "QUARANTINED",
      line: "Liquid Oral Line",
    },
  ];

  const machineLines = [
    { name: "Tablets Line #1 (High Speed)", code: "LINE-TAB-01", status: "OPERATIONAL", output: "14,200 tabs/hr", operator: "Shift A" },
    { name: "Capsules Line #2 (Automatic)", code: "LINE-CAP-02", status: "OPERATIONAL", output: "8,500 caps/hr", operator: "Shift A" },
    { name: "Liquid Orals Syrup Line", code: "LINE-LIQ-01", status: "OPERATIONAL", output: "2,100 btls/hr", operator: "Shift A" },
    { name: "Blister Packaging Unit #3", code: "LINE-PKG-03", status: "CLEANING / CHANGEOVER", output: "0 /hr", operator: "Maintenance" },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Production Command Center — Manufacturing Operations"
      departmentCode="PRD"
      departmentBadgeColor="indigo"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Batches & Lines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Production Schedule (eBR) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Batch Manufacturing Schedule (eBR)
                  </h3>
                  <p className="text-[11px] text-slate-400">Live formulation & packaging batches</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {activeBatches.length} Active Batches
              </span>
            </div>

            <div className="space-y-3">
              {activeBatches.map((batch, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">
                        {batch.batchNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          batch.status === "FORMULATION"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : batch.status === "PACKAGING"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-1">{batch.productName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target: {batch.batchSize.toLocaleString()} Units &bull; Assigned: {batch.line}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBatch(batch.batchNumber)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-all flex items-center space-x-1 flex-shrink-0"
                  >
                    <span>View eBR</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Line Status Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Manufacturing Line Operational Status
                  </h3>
                  <p className="text-[11px] text-slate-400">Ahmedabad Formulation Facility</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {machineLines.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{line.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        line.status === "OPERATIONAL"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>
                      Speed: <strong className="text-slate-700">{line.output}</strong>
                    </span>
                    <span>Staff: {line.operator}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Deviations & Telemetry */}
        <div className="space-y-6">
          {/* Manufacturing Deviations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manufacturing Deviations</h3>
                  <p className="text-[11px] text-slate-400">QA Escalation tracking</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">DEV-PRD-2026-012</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700">
                    MINOR
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 mt-1">
                  Temperature excursion in Blending Room 2
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Status: <strong className="text-[#00A896]">UNDER_INVESTIGATION</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Cleanroom & Utility Telemetry */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Cleanroom & Utility Telemetry
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Cleanroom Temperature</span>
                <span className="font-bold text-slate-800">21.4 &deg;C (Normal)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Relative Humidity (RH)</span>
                <span className="font-bold text-slate-800">42% (Target: 40-50%)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">Differential Pressure</span>
                <span className="font-bold text-emerald-600">+15 Pa (Compliant)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 font-medium">GMP Air Particulate Level</span>
                <span className="font-bold text-emerald-600">ISO Class 7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
