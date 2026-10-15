"use client";

import React from "react";
import {
  FlaskConical,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Thermometer,
  Sparkles,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function MicrobiologyDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Active Micro Samples",
      value: 8,
      subtext: "Testing in progress",
      icon: FlaskConical,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "Zero Growth OOS",
      trendLabel: "Incubating",
    },
    {
      title: "Environmental Points (EM)",
      value: 24,
      subtext: "Air, Settle & Swab",
      icon: Activity,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "All Within Action Limit",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "Active Incubators",
      value: "4 / 4 Normal",
      subtext: "20-25°C & 30-35°C",
      icon: Thermometer,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Calibrated",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "Endotoxin (LAL) Compliance",
      value: "100%",
      subtext: "Water & Sterile Line",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "Pyrogen-Free",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Log Bioburden / Sterility Sample", icon: Plus, primary: true },
    { label: "Record Cleanroom Settle Plate Count", icon: Activity },
    { label: "Log Incubator Temperature", icon: Thermometer },
    { label: "View Microbiology Lab SOPs", icon: FileCheck },
  ];

  const emPoints = [
    {
      location: "Cleanroom Grade A (Filling Suite LAF)",
      testType: "Settle Plate (4-Hour Exposure)",
      result: "< 1 CFU / plate",
      limit: "Action Limit: 1 CFU",
      status: "COMPLIANT",
    },
    {
      location: "Cleanroom Grade B (Aseptic Preparation)",
      testType: "Volumetric Air Sampling (1,000L)",
      result: "4 CFU / m³",
      limit: "Action Limit: 10 CFU/m³",
      status: "COMPLIANT",
    },
    {
      location: "Cleanroom Grade C (Compounding Suite)",
      testType: "Surface Contact Swab Testing",
      result: "12 CFU / plate",
      limit: "Action Limit: 25 CFU/plate",
      status: "COMPLIANT",
    },
    {
      location: "Purified Water Storage Tank (PW-01)",
      testType: "Total Viable Aerobic Count (TVAC)",
      result: "8 CFU / ml",
      limit: "Alert Limit: 50 CFU/ml",
      status: "COMPLIANT",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Quality Control Microbiology Workspace — Environmental Monitoring & Sterility"
      departmentCode="MIC"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Environmental Monitoring */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cleanroom Environmental Monitoring (EM) Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Daily settle plates, air sampling & personnel finger dabs
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">24 Test Points</span>
            </div>

            <div className="space-y-3">
              {emPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{point.location}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {point.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{point.testType}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reading: <strong className="text-slate-800">{point.result}</strong> &bull; {point.limit}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex-shrink-0">
                    {point.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Incubator Telemetry */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Laboratory Incubators Telemetry
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Bacterial Incubator #1 (SCDA)</span>
                  <span className="text-emerald-600">32.4°C</span>
                </div>
                <p className="text-[10px] text-slate-400">Target: 30°C to 35°C &bull; 14 Batches</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Fungal Incubator #2 (SDA)</span>
                  <span className="text-emerald-600">22.8°C</span>
                </div>
                <p className="text-[10px] text-slate-400">Target: 20°C to 25°C &bull; 12 Batches</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Biological Indicator Incubator</span>
                  <span className="text-emerald-600">56.1°C</span>
                </div>
                <p className="text-[10px] text-slate-400">Autoclave Sterility Indicator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
