"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Download,
  Plus,
  Clock,
  Printer
} from "lucide-react";

interface DocumentRecord {
  id: string;
  docNumber: string;
  title: string;
  category: "MASTER_BMR" | "STANDARD_OPERATING_PROCEDURE" | "VALIDATION_PROTOCOL" | "SITE_MASTER_FILE";
  department: string;
  version: string;
  effectiveDate: string;
  reviewCycleMonths: number;
  status: "RELEASED_CURRENT" | "UNDER_QA_REVIEW" | "SUPERSEDED";
  author: string;
}

const mockDocs: DocumentRecord[] = [
  { id: "DOC-01", docNumber: "BMR-INJ-042", title: "Master Batch Manufacturing Record: Ciprofloxacin 200mg/100ml Infusion", category: "MASTER_BMR", department: "Production", version: "v4.0", effectiveDate: "2026-03-01", reviewCycleMonths: 12, status: "RELEASED_CURRENT", author: "Dr. Ananya Roy (QA Lead)" },
  { id: "DOC-02", docNumber: "SOP-QC-008", title: "HPLC Instrument Operation, Calibration & Data Integrity Standard", category: "STANDARD_OPERATING_PROCEDURE", department: "Quality Control", version: "v3.2", effectiveDate: "2026-02-15", reviewCycleMonths: 12, status: "RELEASED_CURRENT", author: "Priya Shah (Senior Chemist)" },
  { id: "DOC-03", docNumber: "VMP-2026-LAVAD", title: "Lavad Formulation Plant Annual Validation Master Plan (VMP)", category: "VALIDATION_MASTER_PLAN" as any, department: "Quality Assurance", version: "v2.0", effectiveDate: "2026-01-01", reviewCycleMonths: 12, status: "RELEASED_CURRENT", author: "Plant Validation Committee" },
  { id: "DOC-04", docNumber: "SMF-BJK-2026", title: "Lavad Plant Site Master File (WHO-GMP & PIC/S Format)", category: "SITE_MASTER_FILE", department: "Regulatory", version: "v5.1", effectiveDate: "2026-04-10", reviewCycleMonths: 24, status: "RELEASED_CURRENT", author: "Regulatory Affairs Directorate" },
  { id: "DOC-05", docNumber: "SOP-PRD-019", title: "Autoclave Sterilization & Bioburden Challenge Validation Protocol", category: "STANDARD_OPERATING_PROCEDURE", department: "Production", version: "v2.3", effectiveDate: "2026-05-01", reviewCycleMonths: 12, status: "RELEASED_CURRENT", author: "Ramesh Patel (Production Lead)" },
];

export default function ElectronicDocumentManagementPage() {
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = mockDocs.filter((d) => {
    const matchesCat = selectedCat === "ALL" || d.category === selectedCat;
    const matchesQuery = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/operations"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Electronic Document Management System (EDMS)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                21 CFR Part 11 Controlled
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Master SOP repository, Site Master File (SMF), Validation Master Plan, and electronic Batch Manufacturing Records (eBMR)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Exported controlled SOP index register for FDA / WHO-GMP audit.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Export Controlled Index</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Controlled SOPs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">142 Documents</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">100% Version Controlled</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Master eBMR Records</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">44 Formulas</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Sterile & Non-Sterile</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming Annual Reviews</div>
          <div className="text-2xl font-black text-amber-600 mt-1">4 SOPs</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Due in &lt; 30 Days</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Integrity (21 CFR 11)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100% Valid</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Cryptographic Signatures</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search document title, SOP number, or department..."
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
            <option value="ALL">All Document Types</option>
            <option value="STANDARD_OPERATING_PROCEDURE">Standard Operating Procedures (SOP)</option>
            <option value="MASTER_BMR">Master Batch Records (eBMR)</option>
            <option value="SITE_MASTER_FILE">Site Master File (SMF)</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Controlled Master Documents ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((doc) => (
            <div key={doc.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{doc.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700 font-mono">
                    {doc.docNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {doc.version}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-3 pt-0.5">
                  <span>Dept: <strong className="text-slate-700">{doc.department}</strong></span>
                  <span>•</span>
                  <span>Author: <strong>{doc.author}</strong></span>
                  <span>•</span>
                  <span>Effective: <strong className="text-slate-700">{doc.effectiveDate}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {doc.status.replace(/_/g, " ")}
                </span>

                <button
                  onClick={() => {
                    setActionSuccess(`Opened controlled digital copy for ${doc.docNumber}`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <Eye size={13} />
                  <span>Inspect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
