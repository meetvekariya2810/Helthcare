"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  FileText,
  AlertCircle,
  Building,
  Printer,
  Calendar,
  Lock
} from "lucide-react";

interface StatutoryRegister {
  code: string;
  actName: string;
  formName: string;
  description: string;
  frequency: string;
  lastUpdated: string;
  inspectorReadiness: "100% READY" | "PENDING_SIGNOFF";
}

const mockRegisters: StatutoryRegister[] = [
  { code: "REG-FORM-D", actName: "Factories Act, 1948 (Section 62)", formName: "Form D: Muster Roll Register", description: "Daily attendance, working hours, shifts & rest intervals for all factory workers", frequency: "Daily", lastUpdated: "Today, 17:00", inspectorReadiness: "100% READY" },
  { code: "REG-FORM-B", actName: "Code on Wages, 2019 / Gujarat Rules", formName: "Form B: Master Employee Register", description: "Official bio-data, statutory Aadhaar/UAN/ESIC tokens, wage rates and category", frequency: "Continuous", lastUpdated: "Today, 14:30", inspectorReadiness: "100% READY" },
  { code: "REG-FORM-E", actName: "Factories Act, 1948 (Section 59)", formName: "Form E: Overtime & Double Wage Register", description: "Audit trail of overtime hours and calculated double rate compensations", frequency: "Monthly", lastUpdated: "Oct 15, 2026", inspectorReadiness: "100% READY" },
  { code: "REG-POSH", actName: "POSH Act, 2013", formName: "Internal Complaints Committee (ICC) Annual Report", description: "Composition of ICC, awareness training sessions & zero complaints certification", frequency: "Annual", lastUpdated: "Oct 01, 2026", inspectorReadiness: "100% READY" },
  { code: "REG-MED-33", actName: "Gujarat Factories Rules, 1963", formName: "Form 33: Health & Fitness Register", description: "Certifying factory surgeon annual medical examinations for cleanroom personnel", frequency: "Bi-Annual", lastUpdated: "Sep 30, 2026", inspectorReadiness: "100% READY" },
];

export default function LaborLawCompliancePage() {
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleExportRegister = (regName: string) => {
    setActionSuccess(`Generated certified statutory docket for ${regName}. 21 CFR Part 11 sign-off logged.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/hrms"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Labor Law & Statutory Factory Registers
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                DISHA & Factory Inspector Ready
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Prescribed Gujarat Factories Rules registers, Code on Wages Form B/C/D, and labor inspection compliance dossiers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportRegister("Consolidated Factory Audit Dossier")}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Export Complete Inspector Dossier</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Aggregate Readiness KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Statutory Registers</div>
          <div className="text-2xl font-black text-slate-900 mt-1">5 Registers</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">100% Up to Date</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inspector Readiness</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100% Passed</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Zero Non-Conformances</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">POSH ICC Standing</div>
          <div className="text-2xl font-black text-slate-900 mt-1">Active</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">External Member Appointed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Form D Muster Sync</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">Auto-Bio</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">Optical Turnstiles Synced</div>
        </div>
      </div>

      {/* Registers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockRegisters.map((reg) => (
          <div key={reg.code} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                  {reg.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {reg.inspectorReadiness}
                </span>
              </div>

              <div className="text-xs font-bold text-teal-700">{reg.actName}</div>
              <h3 className="text-sm font-black text-slate-900 mt-1">{reg.formName}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {reg.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Updated: {reg.lastUpdated}</span>
              <button
                onClick={() => handleExportRegister(reg.formName)}
                className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
              >
                <Download size={12} />
                <span>Download Register</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
