"use client";

import React from "react";
import {
  Globe,
  FileCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function RegulatoryDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Global Export Markets",
      value: 50,
      subtext: "Countries in Portfolio",
      icon: Globe,
      iconBg: "bg-cyan-50 text-cyan-600",
      trend: "42 Dossiers",
      trendLabel: "Approved",
    },
    {
      title: "Dossiers Under Review",
      value: 6,
      subtext: "CTD / eCTD / ACTD",
      icon: FileCheck,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "On-Track",
      trendColor: "text-indigo-600 font-bold",
    },
    {
      title: "Renewals Due (90 Days)",
      value: 1,
      subtext: "License Renewals",
      icon: Clock,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Renewal Drafted",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "CTD / eCTD Readiness",
      value: "100%",
      subtext: "ICH Module 1-5",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "Compliant",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Register New Dossier Submission", icon: Plus, primary: true },
    { label: "Upload Stability Study Data", icon: FileText },
    { label: "Review Country Requirement", icon: Globe },
    { label: "License Renewal Calendar", icon: Calendar },
  ];

  const dossiers = [
    {
      dossierNo: "DOS-KEN-2026-04",
      country: "Kenya (PPB Authority)",
      format: "eCTD Module 1-5",
      product: "Paracetamol 500mg Tablets",
      status: "UNDER_REVIEW",
      eta: "Nov 2026",
    },
    {
      dossierNo: "DOS-PHL-2026-09",
      country: "Philippines (FDA Authority)",
      format: "ACTD Format",
      product: "Amoxicillin 250mg Capsules",
      status: "APPROVED",
      eta: "Valid till 2031",
    },
    {
      dossierNo: "DOS-UZB-2026-02",
      country: "Uzbekistan (MOH Registry)",
      format: "CTD Format",
      product: "Cetirizine 5mg/5ml Syrup",
      status: "QUERIES_RESPONDED",
      eta: "Dec 2026",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Regulatory Affairs Command Center — Global Drug Dossiers & Country Filings"
      departmentCode="RA"
      departmentBadgeColor="cyan"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dossiers Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    International Drug Dossier Filings (ICH M1-M5)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Registration tracking across 50 export destination markets
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">50 Countries</span>
            </div>

            <div className="space-y-3">
              {dossiers.map((dos, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{dos.dossierNo}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dos.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {dos.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      {dos.country} &bull; <span className="font-normal text-slate-600">{dos.product}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Format: {dos.format} &bull; Expected Approval: {dos.eta}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex-shrink-0">
                    {dos.format}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Domestic Licenses */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              CDSCO & State FDA Licenses
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">Form 25 (Biological / Non-Bio)</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Valid till 31-Dec-2027</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">Form 28 (Formulation License)</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Valid till 31-Dec-2027</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                <p className="font-bold">WHO-GMP CoPP Certificate</p>
                <p className="text-[11px] font-semibold">Certified Audit Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
