"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Layers,
  ShieldCheck,
  Building,
  Boxes,
  TrendingUp,
  Cpu,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  Globe,
  Bot
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function PharmaOperationsHubPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Plant Operational Index",
      value: "99.4%",
      subtext: "Lavad Formulation Unit",
      icon: Activity,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "All Systems Normal",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "Overall OEE Efficiency",
      value: "98.2%",
      subtext: "Across 4 Filling Lines",
      icon: Cpu,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "+1.8%",
      trendLabel: "vs target",
    },
    {
      title: "Active Batches in Line",
      value: "6 Batches",
      subtext: "Injectables & Liquids",
      icon: Layers,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Zero Deviations",
      trendColor: "text-amber-600 font-bold",
    },
    {
      title: "Cleanroom Air Quality",
      value: "Grade A/B",
      subtext: "Differential +15 Pa",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "WHO-GMP Validated",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Dispatch New Formulation Batch", icon: Layers, primary: true },
    { label: "Check Plant Cleanroom AHUs", icon: Cpu },
    { label: "Review Regulatory Filings", icon: Globe },
    { label: "Export Shift Telemetry", icon: FileSpreadsheet },
  ];

  const plantDivisions = [
    { name: "Manufacturing & Compounding", path: "/production", desc: "Solid orals, sterile liquids, eBR batch manufacturing records", status: "Active • 3 Lines Running", icon: Layers, count: "4 Orders" },
    { name: "QC Analytical Laboratories", path: "/qc", desc: "HPLC, GC, UV-Vis spectrophotometry, raw material CoA testing", status: "Active • 14 Tests Running", icon: Activity, count: "14 Samples" },
    { name: "Quality Assurance & Compliance", path: "/qa", desc: "Deviation investigation, CAPA, change control & 21 CFR 11 audit trails", status: "Operational • 0 Major Deviations", icon: ShieldCheck, count: "2 Minor CAPA" },
    { name: "Warehouse & Cold Storage", path: "/inventory", desc: "FEFO/FIFO dispensing, 2°C - 8°C cold chain, active API buffer stock", status: "Normal • 98% Stock Level", icon: Boxes, count: "284 SKUs" },
    { name: "Lavad Utilities & Engineering", path: "/factory", desc: "Water for Injection (WFI), HVAC AHUs, clean steam & standby power", status: "Optimal • 64 psi Clean Steam", icon: Zap, count: "100% Online" },
    { name: "International Export & COPP", path: "/export", desc: "Certificate of Pharmaceutical Product, customs seals & sea shipments", status: "Clear • 3 Shipments en route", icon: Globe, count: "18 Countries" },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Pharma Operations Central Command — Master Plant Hub"
      departmentCode="OPS"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="space-y-6">
        {/* Plant Division Matrix */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Pharma Operations Unified Command Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Real-time operational bridge connecting formulation, quality, utilities, and global supply chains
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#00A896] border border-teal-200">
              Plant Running in State of Control
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantDivisions.map((div, idx) => {
              const DivIcon = div.icon;
              return (
                <Link
                  key={idx}
                  href={div.path}
                  className="group p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 group-hover:text-teal-600 group-hover:border-teal-200 flex items-center justify-center transition-colors">
                        <DivIcon size={20} />
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-slate-200 font-mono">
                        {div.count}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {div.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {div.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-emerald-600">
                      {div.status}
                    </span>
                    <span className="text-teal-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>Access</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
