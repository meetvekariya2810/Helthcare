"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  FileText,
  Download,
  ShieldCheck,
  Plus,
  Calendar
} from "lucide-react";

interface TrainingRecord {
  id: string;
  sopNumber: string;
  title: string;
  category: "CLEANROOM_GMP" | "DATA_INTEGRITY" | "INSTRUMENT_SOP" | "SAFETY_EHS";
  trainer: string;
  certifiedStaff: number;
  totalEnrolled: number;
  passPercentage: number;
  renewalCycle: string;
  nextSession: string;
}

const mockTrainingSops: TrainingRecord[] = [
  { id: "TRN-01", sopNumber: "SOP-PRD-012", title: "Grade A/B Cleanroom Sterile Gowning & Air Shower Protocols", category: "CLEANROOM_GMP", trainer: "Dr. Ananya Roy (QA Lead)", certifiedStaff: 42, totalEnrolled: 42, passPercentage: 98, renewalCycle: "Annual (12M)", nextSession: "2026-11-15" },
  { id: "TRN-02", sopNumber: "SOP-QA-001", title: "21 CFR Part 11 Compliance, Audit Trails & Electronic Signatures", category: "DATA_INTEGRITY", trainer: "Nilesh Varma (IT & QA)", certifiedStaff: 88, totalEnrolled: 91, passPercentage: 96, renewalCycle: "Annual (12M)", nextSession: "2026-10-28" },
  { id: "TRN-03", sopNumber: "SOP-QC-008", title: "High-Performance Liquid Chromatography (HPLC) Method Validation & Calibration", category: "INSTRUMENT_SOP", trainer: "Priya Shah (Senior Chemist)", certifiedStaff: 14, totalEnrolled: 16, passPercentage: 92, renewalCycle: "Bi-Annual (6M)", nextSession: "2026-11-04" },
  { id: "TRN-04", sopNumber: "SOP-EHS-005", title: "Hazardous Chemical Handling, Eye Wash & Cleanroom Spill Response", category: "SAFETY_EHS", trainer: "Safety Committee Head", certifiedStaff: 91, totalEnrolled: 91, passPercentage: 100, renewalCycle: "Bi-Annual (6M)", nextSession: "2026-12-01" },
];

export default function TrainingManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredTraining = mockTrainingSops.filter((trn) => {
    const matchesCat = selectedCategory === "ALL" || trn.category === selectedCategory;
    const matchesQuery = trn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trn.sopNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trn.trainer.toLowerCase().includes(searchQuery.toLowerCase());
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
                Cleanroom GMP & SOP Training Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                WHO-GMP • Schedule M
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mandatory sterile gowning, data integrity certifications, and post-training examination score tracking
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setActionSuccess("Schedule M training completion matrix generated for FDA / CDSCO audit.");
              setTimeout(() => setActionSuccess(null), 4000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <Award size={14} />
            <span>Generate Regulatory Audit Matrix</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Mandatory SOPs</div>
          <div className="text-2xl font-black text-slate-900 mt-1">4 Modules</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">100% Curriculum Approved</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overall Qualification</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">96.8% Pass</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Passing score &gt;= 80%</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Refresher Sessions Due</div>
          <div className="text-2xl font-black text-amber-600 mt-1">3 Staff</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Next session in 12 days</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Integrity (21 CFR 11)</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">88 / 91</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">96.7% Certified</div>
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTraining.map((trn) => (
          <div key={trn.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200 font-mono">
                  {trn.sopNumber}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  Cycle: {trn.renewalCycle}
                </span>
              </div>

              <h3 className="text-sm font-black text-slate-900 leading-snug">
                {trn.title}
              </h3>

              <div className="text-xs text-slate-500 mt-2">
                <span className="text-slate-400">Lead Trainer: </span>
                <strong className="text-slate-700">{trn.trainer}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 font-medium">Certified Compliance</span>
                <span className="font-black text-teal-700">
                  {trn.certifiedStaff} / {trn.totalEnrolled} Staff ({Math.round((trn.certifiedStaff / trn.totalEnrolled) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${(trn.certifiedStaff / trn.totalEnrolled) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                <span className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>Next Batch: {trn.nextSession}</span>
                </span>
                <button
                  onClick={() => {
                    setActionSuccess(`Issued batch certification record for ${trn.sopNumber}.`);
                    setTimeout(() => setActionSuccess(null), 3000);
                  }}
                  className="text-teal-700 font-bold hover:underline"
                >
                  View Dossier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
