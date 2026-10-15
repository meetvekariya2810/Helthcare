"use client";

import React from "react";
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  CheckSquare,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function QADashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Batch Release Review",
      value: 3,
      subtext: "Pending QA Sign-Off",
      icon: CheckSquare,
      iconBg: "bg-rose-50 text-rose-600",
      trend: "3 Ready",
      trendLabel: "for Dispatch",
    },
    {
      title: "Open Deviations & CAPA",
      value: "2 / 1",
      subtext: "Active investigations",
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Zero Overdue",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "Change Control Records",
      value: 2,
      subtext: "Under Evaluation",
      icon: RotateCcw,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "GMP Reviewed",
      trendColor: "text-indigo-600 font-bold",
    },
    {
      title: "GMP Compliance Rate",
      value: "100%",
      subtext: "WHO-GMP & Schedule M",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "Audit-Ready",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Final Batch Release Sign-Off", icon: CheckSquare, primary: true },
    { label: "Initiate CAPA Investigation", icon: AlertTriangle },
    { label: "Approve SOP Version", icon: FileText },
    { label: "Review Change Control", icon: RotateCcw },
  ];

  const pendingReleases = [
    {
      batchNumber: "BJK-TAB-2026-081",
      productName: "Paracetamol 500mg Tablets",
      lotSize: "500,000 Units",
      qcStatus: "PASSED (COA Signed)",
      mfgStatus: "COMPLETE (eBR Verified)",
      market: "Domestic Formulations",
    },
    {
      batchNumber: "BJK-CAP-2026-039",
      productName: "Amoxicillin 250mg Capsules",
      lotSize: "250,000 Units",
      qcStatus: "PASSED (COA Signed)",
      mfgStatus: "COMPLETE (eBR Verified)",
      market: "Export Consignment",
    },
    {
      batchNumber: "BJK-SYR-2026-015",
      productName: "Cetirizine 5mg/5ml Oral Solution",
      lotSize: "25,000 Bottles",
      qcStatus: "PASSED (COA Signed)",
      mfgStatus: "COMPLETE (eBR Verified)",
      market: "Institutional Supply",
    },
  ];

  const deviations = [
    {
      code: "DEV-PRD-2026-012",
      title: "Granulation suite temperature excursion (+1.8°C for 14 min)",
      severity: "MINOR",
      capaRef: "CAPA-2026-004",
      status: "UNDER_QA_REVIEW",
    },
    {
      code: "DEV-WH-2026-003",
      title: "Packaging foil seal verification sample count discrepancy",
      severity: "LOW",
      capaRef: "N/A (Corrected)",
      status: "CLOSED",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Quality Assurance Command Center — Batch Release & GMP Compliance"
      departmentCode="QA"
      departmentBadgeColor="rose"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Batch Releases & Deviations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Batches Awaiting Final QA Release Sign-Off
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Finished goods clearance prior to commercial warehouse dispatch
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {pendingReleases.length} Ready for Release
              </span>
            </div>

            <div className="space-y-3">
              {pendingReleases.map((batch, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">
                        {batch.batchNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {batch.market}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{batch.productName}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                      <span>Lot Size: <strong>{batch.lotSize}</strong></span>
                      <span>&bull;</span>
                      <span className="text-emerald-600 font-semibold">{batch.qcStatus}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Initiating 21 CFR Part 11 Electronic Signature for Batch ${batch.batchNumber}`)}
                    className="px-3.5 py-1.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center space-x-1.5 flex-shrink-0"
                  >
                    <span>Sign & Release</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Active Deviations & CAPA */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Deviations & CAPA Oversight</h3>
                <p className="text-[11px] text-slate-400">Root-cause investigation and corrective actions</p>
              </div>
            </div>

            <div className="space-y-3">
              {deviations.map((dev, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-700">{dev.code}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700">
                        {dev.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{dev.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">CAPA Link: {dev.capaRef}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-[#00A896]">
                    {dev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: WHO-GMP Audit Readiness */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">WHO-GMP Audit Readiness</h3>
                <p className="text-[11px] text-slate-400">Schedule M & CDSCO Standards</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">SOP Periodic Review</span>
                <span className="font-bold text-emerald-600">100% Up to Date</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Annual Product Quality Review (APQR)</span>
                <span className="font-bold text-slate-800">Completed (2025-26)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Cleanroom Media Fill Validation</span>
                <span className="font-bold text-emerald-600">Passed (Zero Contamination)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-600">Self-Inspection Internal Audit</span>
                <span className="font-bold text-slate-800">Q3 Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
