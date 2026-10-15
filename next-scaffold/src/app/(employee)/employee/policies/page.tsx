"use client";

import React from "react";
import { BookOpen, CheckCircle2, Download } from "lucide-react";

export default function EmployeePoliciesPage() {
  const policies = [
    { title: "BJK Healthcare Code of Conduct & Ethics", code: "POL-001", signed: true },
    { title: "Cleanroom Good Manufacturing Practices (GMP) Policy", code: "POL-002", signed: true },
    { title: "Workplace Health, Safety & Environmental Standard", code: "POL-003", signed: true },
    { title: "Prevention of Sexual Harassment (POSH) Guidelines", code: "POL-004", signed: true },
    { title: "Information Security & Intellectual Property Agreement", code: "POL-005", signed: true },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          HR Policy Handbooks & Digital Sign-Offs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Corporate governance handbooks, compliance policies, and signed electronic acknowledgments
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {policies.map((p) => (
          <div key={p.code} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50 text-[#7B2CBF]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{p.title}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.code} • Signed Electronically</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Acknowledged</span>
              </span>
              <button
                onClick={() => alert(`Downloading policy handbook ${p.code}...`)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
