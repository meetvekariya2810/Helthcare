"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  FlaskConical,
  Gauge,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function QCDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Pending Sample Queue",
      value: 5,
      subtext: "Samples in Lab",
      icon: FlaskConical,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Avg 4.2h",
      trendLabel: "Turnaround",
    },
    {
      title: "Approved Today",
      value: 8,
      subtext: "Passed Tests",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "100%",
      trendLabel: "Accuracy Rate",
    },
    {
      title: "OOS / OOT Alerts",
      value: 0,
      subtext: "Escalations",
      icon: AlertTriangle,
      iconBg: "bg-rose-50 text-rose-600",
      trend: "0 Active OOS",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "COA Generated",
      value: 6,
      subtext: "Certificates of Analysis",
      icon: FileCheck,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "Verified",
      trendColor: "text-teal-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Register New QC Sample", icon: Plus, primary: true },
    { label: "Review & Sign-Off Test Results", icon: FileCheck },
    { label: "Generate Certificate of Analysis (COA)", icon: FileCheck },
    { label: "View HPLC & Instrument Status", icon: Gauge },
  ];

  const samples = [
    {
      sampleId: "QC-SMP-2026-101",
      sampleType: "RAW_MATERIAL",
      testName: "Assay & Identification (HPLC)",
      productName: "Paracetamol IP",
      status: "UNDER_TESTING",
      priority: "HIGH",
    },
    {
      sampleId: "QC-SMP-2026-102",
      sampleType: "IN_PROCESS",
      testName: "Uniformity of Dosage Units",
      productName: "Amoxicillin 250mg",
      status: "PASSED",
      priority: "NORMAL",
    },
    {
      sampleId: "QC-SMP-2026-103",
      sampleType: "FINISHED_PRODUCT",
      testName: "Dissolution Rate & Assay",
      productName: "Cetirizine 10mg Tablets",
      status: "UNDER_TESTING",
      priority: "HIGH",
    },
    {
      sampleId: "QC-SMP-2026-104",
      sampleType: "PACKAGING",
      testName: "Foil Thickness & Pin Hole Test",
      productName: "Alu-Alu Foil 25 Micron",
      status: "PASSED",
      priority: "NORMAL",
    },
  ];

  const instruments = [
    { instrument: "Shimadzu HPLC Prominence-i", code: "INS-HPLC-01", calibration: "Calibrated (Valid till Jun 2026)", status: "OPERATIONAL" },
    { instrument: "Agilent GC 7890B Gas Chromatograph", code: "INS-GC-01", calibration: "Calibrated (Valid till Aug 2026)", status: "OPERATIONAL" },
    { instrument: "Electrolab 8-Station Dissolution Tester", code: "INS-DIS-01", calibration: "Calibrated (Valid till May 2026)", status: "OPERATIONAL" },
    { instrument: "Mettler Toledo Analytical Balance (0.1mg)", code: "INS-BAL-01", calibration: "Daily Verification Done", status: "OPERATIONAL" },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Quality Control Command Center — Analytical Testing & COA Verification"
      departmentCode="QC"
      departmentBadgeColor="amber"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sample Queue & Instruments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <FlaskConical size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">QC Analytical Testing Queue</h3>
                  <p className="text-[11px] text-slate-400">Assay, Dissolution, Related Substances & Purity</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">{samples.length} Active Tests</span>
            </div>

            <div className="space-y-3">
              {samples.map((sample, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{sample.sampleId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {sample.sampleType}
                      </span>
                      {sample.priority === "HIGH" && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-600">
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {sample.productName} &bull; <span className="text-slate-500 font-normal">{sample.testName}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Assigned Laboratory: Analytical QC Lab Unit 1</p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        sample.status === "PASSED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {sample.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instruments */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                <Gauge size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Analytical Instrument & Calibration Registry</h3>
                <p className="text-[11px] text-slate-400">HPLC, GC, UV-Vis & Dissolution Apparatus</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {instruments.map((inst, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{inst.instrument}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">OK</span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">{inst.code}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{inst.calibration}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: OOS Status & Standards */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">OOS / OOT Status</h3>
                <p className="text-[11px] text-slate-400">Zero open lab investigations</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900">
              <p className="font-bold">100% In-Specification Tests</p>
              <p className="text-[11px] text-emerald-700 mt-1">
                All analytical test worksheets completed today comply with Indian Pharmacopoeia (IP) & USP standards.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Approved Reference Standards
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">IP Working Standards</span>
                <span className="font-bold text-slate-900">111 / 111 Verified</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">USP / BP Primary Standards</span>
                <span className="font-bold text-slate-900">Valid (2-8°C Cold Chain)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">Chemical Reagents Expiry</span>
                <span className="font-bold text-emerald-600">Zero Expired</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
