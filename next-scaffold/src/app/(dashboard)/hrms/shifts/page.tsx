"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Users,
  Plus,
  Edit2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";

interface ShiftDefinition {
  code: string;
  name: string;
  timing: string;
  breakDuration: string;
  headcount: number;
  color: string;
  description: string;
}

const shiftDefs: ShiftDefinition[] = [
  { code: "SHIFT_A", name: "Morning Shift (A)", timing: "07:00 - 15:30", breakDuration: "30 min lunch", headcount: 42, color: "teal", description: "Formulation, sterile compounding & cleanroom filling lines" },
  { code: "SHIFT_B", name: "Evening Shift (B)", timing: "15:30 - 00:00", breakDuration: "30 min dinner", headcount: 24, color: "blue", description: "Terminal autoclaving, visual inspection & secondary packaging" },
  { code: "SHIFT_GEN", name: "General Day Shift", timing: "09:00 - 17:30", breakDuration: "45 min lunch", headcount: 21, color: "emerald", description: "QC Analytical chemistry, QA compliance, Regulatory & Admin" },
  { code: "SHIFT_NIGHT", name: "Night / Validation", timing: "00:00 - 07:00", breakDuration: "30 min midnight break", headcount: 4, color: "purple", description: "Continuous stability chambers & emergency plant maintenance" },
];

const mockRoster = [
  { empCode: "BJK-PROD-001", name: "Ramesh Patel", department: "Production", role: "Cleanroom Operator", mon: "A", tue: "A", wed: "A", thu: "A", fri: "A", sat: "A", sun: "OFF" },
  { empCode: "BJK-PROD-014", name: "Suresh Thakor", department: "Production", role: "Filling Technician", mon: "B", tue: "B", wed: "B", thu: "B", fri: "B", sat: "B", sun: "OFF" },
  { empCode: "BJK-QC-004", name: "Priya Shah", department: "Quality Control", role: "Senior Chemist", mon: "GEN", tue: "GEN", wed: "GEN", thu: "GEN", fri: "GEN", sat: "OFF", sun: "OFF" },
  { empCode: "BJK-QA-002", name: "Dr. Ananya Roy", department: "Quality Assurance", role: "QA Officer", mon: "GEN", tue: "GEN", wed: "GEN", thu: "GEN", fri: "GEN", sat: "OFF", sun: "OFF" },
  { empCode: "BJK-WH-006", name: "Ajay Verma", department: "Warehouse", role: "Dispensing Supervisor", mon: "A", tue: "A", wed: "A", thu: "A", fri: "A", sat: "A", sun: "OFF" },
  { empCode: "BJK-ENG-003", name: "Kiran Joshi", department: "Engineering", role: "HVAC Engineer", mon: "B", tue: "B", wed: "B", thu: "B", fri: "B", sat: "B", sun: "OFF" },
  { empCode: "BJK-MICRO-002", name: "Neha Trivedi", department: "Microbiology", role: "Microbiologist", mon: "GEN", tue: "GEN", wed: "GEN", thu: "GEN", fri: "GEN", sat: "OFF", sun: "OFF" },
];

export default function ShiftsRosteringPage() {
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeWeek, setActiveWeek] = useState("Week 42 (Oct 19 - Oct 25, 2026)");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredRoster = mockRoster.filter((row) => {
    const matchesDept = selectedDept === "ALL" || row.department.toLowerCase().includes(selectedDept.toLowerCase());
    const matchesQuery = row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.empCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case "A":
        return <span className="px-2 py-1 rounded text-[10px] font-black bg-teal-100 text-teal-800">Shift A</span>;
      case "B":
        return <span className="px-2 py-1 rounded text-[10px] font-black bg-blue-100 text-blue-800">Shift B</span>;
      case "GEN":
        return <span className="px-2 py-1 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">General</span>;
      case "NIGHT":
        return <span className="px-2 py-1 rounded text-[10px] font-black bg-purple-100 text-purple-800">Night</span>;
      case "OFF":
      default:
        return <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 text-slate-400">OFF</span>;
    }
  };

  const handlePublishRoster = () => {
    setStatusMessage("Shift Roster for Week 42 officially published and synchronized with Biometric turnstiles.");
    setTimeout(() => setStatusMessage(null), 5000);
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
                Shifts & Multi-Department Rostering
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Lavad Formulation Plant
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure rotational shift policies, mandatory rest intervals, and cleanroom operator allocations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setStatusMessage("AI Optimizer analyzed historical demand: Rebalanced 4 staff from Shift B to Shift A for injectable batch run.");
              setTimeout(() => setStatusMessage(null), 5000);
            }}
            className="px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles size={14} />
            <span>AI Roster Optimizer</span>
          </button>
          <button
            onClick={handlePublishRoster}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1.5"
          >
            <ShieldCheck size={14} />
            <span>Publish & Bio-Sync</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Shift Definition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {shiftDefs.map((shift) => (
          <div key={shift.code} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-900">{shift.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                  {shift.headcount} Staff
                </span>
              </div>
              <div className="text-base font-bold text-teal-700 font-mono">{shift.timing}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{shift.breakDuration}</div>
              <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                {shift.description}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Cleanroom Adherent</span>
              <button className="text-teal-600 font-bold hover:underline">Edit Rules</button>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Roster Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Roster Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-slate-800">{activeWeek}</span>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Production">Production</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Engineering">Engineering</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Employee Details</th>
                <th className="px-4 py-3">Department & Role</th>
                <th className="px-3 py-3 text-center">Mon (19)</th>
                <th className="px-3 py-3 text-center">Tue (20)</th>
                <th className="px-3 py-3 text-center">Wed (21)</th>
                <th className="px-3 py-3 text-center">Thu (22)</th>
                <th className="px-3 py-3 text-center">Fri (23)</th>
                <th className="px-3 py-3 text-center">Sat (24)</th>
                <th className="px-3 py-3 text-center">Sun (25)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.map((row) => (
                <tr key={row.empCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{row.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{row.empCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{row.department}</div>
                    <div className="text-[10px] text-slate-400">{row.role}</div>
                  </td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.mon)}</td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.tue)}</td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.wed)}</td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.thu)}</td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.fri)}</td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.sat)}</td>
                  <td className="px-3 py-3 text-center">{getShiftBadge(row.sun)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
