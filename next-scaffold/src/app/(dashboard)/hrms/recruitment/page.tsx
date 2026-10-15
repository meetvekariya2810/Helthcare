"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ArrowLeft,
  Plus,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  UserPlus,
  FileText,
  Building,
  GraduationCap
} from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  position: string;
  department: string;
  experience: string;
  qualification: string;
  stage: "SCREENING" | "TECHNICAL_INTERVIEW" | "HR_ROUND" | "OFFER_ISSUED" | "SELECTED";
  rating: number;
  expectedCtc: string;
  noticePeriod: string;
}

const mockCandidates: Candidate[] = [
  { id: "CAN-104", name: "Dr. Vikram Solanki", position: "Senior Formulation Scientist", department: "Production", experience: "8 Years (Sterile Injectables)", qualification: "M.Pharm (Pharmaceutics)", stage: "OFFER_ISSUED", rating: 4.8, expectedCtc: "₹12.5 LPA", noticePeriod: "30 Days" },
  { id: "CAN-103", name: "Pooja Mehta", position: "QA Compliance Specialist", department: "Quality Assurance", experience: "4 Years (21 CFR Part 11)", qualification: "B.Pharm", stage: "TECHNICAL_INTERVIEW", rating: 4.5, expectedCtc: "₹6.8 LPA", noticePeriod: "15 Days" },
  { id: "CAN-102", name: "Amit Goswami", position: "Senior HPLC Analyst", department: "Quality Control", experience: "5 Years (Method Validation)", qualification: "M.Sc (Analytical Chemistry)", stage: "HR_ROUND", rating: 4.6, expectedCtc: "₹7.2 LPA", noticePeriod: "30 Days" },
  { id: "CAN-101", name: "Sanjay Panchal", position: "HVAC Utility Technician", department: "Engineering", experience: "3 Years (Cleanroom AHU)", qualification: "Diploma Mechanical", stage: "SCREENING", rating: 4.2, expectedCtc: "₹3.8 LPA", noticePeriod: "Immediate" },
];

export default function RecruitmentPage() {
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredCandidates = mockCandidates.filter((can) => {
    const matchesStage = selectedStage === "ALL" || can.stage === selectedStage;
    const matchesQuery = can.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      can.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      can.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesQuery;
  });

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case "SCREENING":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Screening</span>;
      case "TECHNICAL_INTERVIEW":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Technical Test</span>;
      case "HR_ROUND":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">HR Discussion</span>;
      case "OFFER_ISSUED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Offer Issued</span>;
      case "SELECTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Ready to Onboard</span>;
      default:
        return null;
    }
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
                Recruitment & Talent Pipeline
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Lavad Formulation Hiring
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pharma talent acquisition, technical GMP evaluations, candidate pipeline & offer letters
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/hrms/employees/create"
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <UserPlus size={14} />
            <span>Launch 12-Stage Onboarding</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Requisitions Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open Requisitions</div>
          <div className="text-2xl font-black text-slate-900 mt-1">4 Openings</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">Production, QA, QC, Eng</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Candidates</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">12 In Pipeline</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">4 Technical Interviewed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Offers Extended</div>
          <div className="text-2xl font-black text-amber-600 mt-1">2 Pending Acceptance</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Joining by Nov 1</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time to Fill</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">18 Days Avg</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Industry standard: 45d</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name, role, or qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="SCREENING">Screening</option>
            <option value="TECHNICAL_INTERVIEW">Technical Interview</option>
            <option value="HR_ROUND">HR Round</option>
            <option value="OFFER_ISSUED">Offer Issued</option>
          </select>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Applicant Pipeline ({filteredCandidates.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredCandidates.map((can) => (
            <div key={can.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{can.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    {can.position}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    • {can.department}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-3 pt-0.5">
                  <span>{can.qualification}</span>
                  <span>•</span>
                  <span>{can.experience}</span>
                  <span>•</span>
                  <span>Notice: <strong className="text-slate-700">{can.noticePeriod}</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{can.expectedCtc}</div>
                  <div className="mt-0.5">{getStageBadge(can.stage)}</div>
                </div>

                <Link
                  href={`/hrms/employees/create?candidate=${can.id}&name=${encodeURIComponent(can.name)}`}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors"
                >
                  <span>Onboard</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
