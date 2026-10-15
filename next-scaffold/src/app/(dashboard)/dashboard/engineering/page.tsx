"use client";

import React from "react";
import {
  Wrench,
  Cpu,
  Zap,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Gauge,
  Sliders,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function EngineeringDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Equipment Operational",
      value: "16 / 18",
      subtext: "Machines running",
      icon: Cpu,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "98.9%",
      trendLabel: "Uptime Score",
    },
    {
      title: "Preventive Maintenance Due",
      value: 2,
      subtext: "Scheduled PM tasks",
      icon: Wrench,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "This Week",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Under Maintenance",
      value: 2,
      subtext: "Minor Calibration",
      icon: Sliders,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "Planned",
      trendColor: "text-indigo-600 font-bold",
    },
    {
      title: "HVAC Cleanroom Status",
      value: "Optimal (ISO 7)",
      subtext: "Pressure & HEPA Normal",
      icon: Zap,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "100% Compliant",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Issue Maintenance Work Order", icon: Plus, primary: true },
    { label: "Schedule Preventive Calibration", icon: Wrench },
    { label: "Review Spare Parts Requisition", icon: Sliders },
    { label: "Check Water System Telemetry", icon: Gauge },
  ];

  const equipmentList = [
    {
      name: "Cadmach 27-Station Rotary Tablet Press",
      code: "EQ-TAB-01",
      pmDue: "28-Oct-2026",
      status: "OPERATIONAL",
      line: "Solid Oral Line 1",
    },
    {
      name: "AccuPack High-Speed Blister Sealer",
      code: "EQ-PKG-02",
      pmDue: "24-Oct-2026",
      status: "OPERATIONAL",
      line: "Packaging Unit 2",
    },
    {
      name: "Glatt Fluid Bed Dryer & Granulator (FBD)",
      code: "EQ-GRN-01",
      pmDue: "18-Oct-2026",
      status: "PM_SCHEDULED",
      line: "Granulation Suite",
    },
    {
      name: "RO + EDI Purified Water Loop Generator",
      code: "UTIL-PW-01",
      pmDue: "15-Nov-2026",
      status: "OPERATIONAL",
      line: "Central Utilities",
    },
  ];

  const utilities = [
    { system: "HVAC AHU Suite 1 (Differential +15 Pa)", status: "COMPLIANT", reading: "21.4°C / 42% RH" },
    { system: "Purified Water (PW Loop 1)", status: "COMPLIANT", reading: "0.8 µS/cm (Limit < 1.3)" },
    { system: "Plant Compressed Air (Oil-Free 0.2µ)", status: "COMPLIANT", reading: "7.2 Bar / Dewpoint -40°C" },
    { system: "Pure Steam Generator (Cleanroom)", status: "COMPLIANT", reading: "3.2 Bar Sterile Steam" },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Plant Engineering & Maintenance Command Center"
      departmentCode="ENG"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Equipment Registry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <Cpu size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Pharmaceutical Machinery & Equipment Registry
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Calibration validity, line allocation and preventive maintenance
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">18 Critical Units</span>
            </div>

            <div className="space-y-3">
              {equipmentList.map((eq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{eq.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          eq.status === "OPERATIONAL"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {eq.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{eq.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Next PM: <strong className="text-slate-700">{eq.pmDue}</strong> &bull; {eq.line}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex-shrink-0">
                    {eq.line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Utilities Telemetry */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Cleanroom Utilities Telemetry
            </h3>

            <div className="space-y-2.5 text-xs">
              {utilities.map((util, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{util.system}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {util.status}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600">{util.reading}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
