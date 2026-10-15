"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Bot
} from "lucide-react";

interface PolicyItem {
  id: string;
  code: string;
  title: string;
  category: "GMP_QUALITY" | "GOVERNANCE_ETHICS" | "HR_ADMIN" | "SAFETY_EHS";
  version: string;
  effectiveDate: string;
  pages: number;
  description: string;
}

const mockPolicies: PolicyItem[] = [
  { id: "POL-01", code: "BJK-POL-001", title: "Master Code of Conduct & Corporate Ethics Manual", category: "GOVERNANCE_ETHICS", version: "v3.2", effectiveDate: "2026-01-01", pages: 18, description: "Standards of business conduct, conflict of interest, gift policies, and statutory compliance requirements." },
  { id: "POL-02", code: "BJK-POL-002", title: "Cleanroom Hygiene & Sterile Gowning Regulations", category: "GMP_QUALITY", version: "v4.0", effectiveDate: "2026-03-15", pages: 24, description: "Mandatory Grade A/B gowning procedures, jewelry prohibitions, hand sanitization, and air shower transit rules." },
  { id: "POL-03", code: "BJK-POL-003", title: "21 CFR Part 11 Electronic Records & Data Integrity", category: "GMP_QUALITY", version: "v2.5", effectiveDate: "2026-02-01", pages: 20, description: "Electronic signatures, audit trail review frequency, password management, and data backup integrity protocols." },
  { id: "POL-04", code: "BJK-POL-004", title: "Leave, Attendance & Overtime Regulations", category: "HR_ADMIN", version: "v3.0", effectiveDate: "2026-01-01", pages: 16, description: "3-tier approval hierarchy, casual/sick/earned leave quotas, Factories Act Section 59 overtime rates." },
  { id: "POL-05", code: "BJK-POL-005", title: "Whistleblower Protection & Anti-Corruption Policy", category: "GOVERNANCE_ETHICS", version: "v2.0", effectiveDate: "2025-11-01", pages: 12, description: "Anonymous reporting channels, non-retaliation guarantees, and audit committee investigative procedures." },
  { id: "POL-06", code: "BJK-POL-006", title: "Prevention of Sexual Harassment (POSH) Handbook", category: "HR_ADMIN", version: "v3.1", effectiveDate: "2026-01-01", pages: 14, description: "Internal Complaints Committee (ICC) composition, inquiry timelines, and redressed complaint mechanisms." },
  { id: "POL-07", code: "BJK-POL-007", title: "IT Security, BYOD & Logical Access Control Policy", category: "GOVERNANCE_ETHICS", version: "v2.8", effectiveDate: "2026-04-01", pages: 18, description: "VPN access guidelines, mandatory 90-day password rotation, cleanroom tablet handling, and network controls." },
  { id: "POL-08", code: "BJK-POL-008", title: "Environment, Health & Industrial Safety (EHS) Manual", category: "SAFETY_EHS", version: "v3.4", effectiveDate: "2026-01-10", pages: 28, description: "Hazardous chemical safety data sheets, PPE matrix, emergency spill containment, and annual fire drill protocols." },
  { id: "POL-09", code: "BJK-POL-009", title: "Quality Manual & WHO-GMP Operational Standard", category: "GMP_QUALITY", version: "v5.0", effectiveDate: "2026-05-01", pages: 42, description: "Quality management system (QMS), deviation investigation workflows, CAPA procedures, and change control." },
  { id: "POL-10", code: "BJK-POL-010", title: "Travel, Conveyance & Corporate Expense Policy", category: "HR_ADMIN", version: "v2.2", effectiveDate: "2026-01-01", pages: 10, description: "Permissible mileage allowances, hotel grade caps, client hospitality guidelines, and GST invoice mandates." },
  { id: "POL-11", code: "BJK-POL-011", title: "Separation, Resignation & Exit Clearance Policy", category: "HR_ADMIN", version: "v2.1", effectiveDate: "2025-08-15", pages: 12, description: "Notice period durations by role, cleanroom asset return, NDA non-compete covenants, and full & final settlement." },
  { id: "POL-12", code: "BJK-POL-012", title: "Canteen & Dietary Welfare Policy", category: "HR_ADMIN", version: "v1.8", effectiveDate: "2026-02-15", pages: 8, description: "Subsidized meal coupons, hygienic food preparation standards, shift meal timings, and dietary audit schedules." },
  { id: "POL-13", code: "BJK-POL-013", title: "Performance Appraisal & Annual Increments Policy", category: "HR_ADMIN", version: "v2.4", effectiveDate: "2026-04-01", pages: 14, description: "KPI appraisal cycles, bell-curve distribution guidelines, promotion criteria, and statutory bonus disbursements." },
];

export default function PoliciesDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockPolicies.filter((p) => {
    const matchesCat = selectedCat === "ALL" || p.category === selectedCat;
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

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
                13 Official Policy Handbooks
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Lavad Formulation Governance
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Controlled document repository covering cleanroom operations, data integrity, leave rules, and ethics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/hrms/copilot"
            className="px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center space-x-1.5"
          >
            <Bot size={14} />
            <span>Ask Policy Copilot</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search policy titles, document numbers, or contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Policy Categories</option>
            <option value="GMP_QUALITY">GMP & Cleanroom Quality</option>
            <option value="GOVERNANCE_ETHICS">Governance & Ethics</option>
            <option value="HR_ADMIN">HR & Administration</option>
            <option value="SAFETY_EHS">Safety & Environment</option>
          </select>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((policy) => (
          <div
            key={policy.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                  {policy.code}
                </span>
                <span className="text-[10px] font-bold text-teal-700 font-mono bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {policy.version}
                </span>
              </div>

              <h3 className="text-xs font-black text-slate-900 leading-snug">
                {policy.title}
              </h3>

              <p className="text-[11px] text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                {policy.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono text-[10px]">
                Eff: {policy.effectiveDate} ({policy.pages} pp)
              </span>

              <button
                onClick={() => {
                  setActionSuccess(`Opened controlled PDF view for ${policy.code}`);
                  setTimeout(() => setActionSuccess(null), 3000);
                }}
                className="text-teal-700 font-bold hover:underline flex items-center space-x-1"
              >
                <Eye size={12} />
                <span>View PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
