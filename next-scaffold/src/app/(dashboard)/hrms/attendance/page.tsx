"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  UserCheck,
  Calendar,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  Activity,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  shift: string;
  inTime: string;
  outTime: string;
  totalHours: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "REGULARIZED";
  isRegularized: boolean;
  gate: string;
}

const sampleMuster: AttendanceRecord[] = [
  {
    id: "att-1",
    code: "BH1076",
    name: "Ajaykumar Mesariya",
    department: "Production Operations",
    shift: "Shift A (07:00 - 15:30)",
    inTime: "06:54 AM",
    outTime: "03:32 PM",
    totalHours: "8h 38m",
    status: "PRESENT",
    isRegularized: false,
    gate: "GATE-01-TURNSTILE",
  },
  {
    id: "att-2",
    code: "BH1082",
    name: "Dr. Vikram Mehta",
    department: "Quality Assurance",
    shift: "General Shift",
    inTime: "08:52 AM",
    outTime: "--:--",
    totalHours: "In Progress",
    status: "PRESENT",
    isRegularized: false,
    gate: "MAIN-ADMIN-GATE",
  },
  {
    id: "att-3",
    code: "BH1090",
    name: "Pooja Trivedi",
    department: "Quality Control",
    shift: "Shift A (07:00 - 15:30)",
    inTime: "07:14 AM",
    outTime: "03:30 PM",
    totalHours: "8h 16m",
    status: "LATE",
    isRegularized: false,
    gate: "QC-LAB-TURNSTILE",
  },
  {
    id: "att-4",
    code: "BH1098",
    name: "Ramesh Patel",
    department: "Warehouse & Supply Chain",
    shift: "General Shift",
    inTime: "--:--",
    outTime: "--:--",
    totalHours: "0h",
    status: "ABSENT",
    isRegularized: false,
    gate: "N/A",
  },
  {
    id: "att-5",
    code: "BH1105",
    name: "Sanjay Solanki",
    department: "Plant Engineering",
    shift: "Shift B (15:00 - 23:30)",
    inTime: "02:50 PM",
    outTime: "--:--",
    totalHours: "In Progress",
    status: "PRESENT",
    isRegularized: false,
    gate: "UTILITY-GATE-02",
  },
];

export default function AttendanceMusterPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [regularizeReason, setRegularizeReason] = useState("");
  const [isRegularizedSuccess, setIsRegularizedSuccess] = useState(false);

  const filtered = sampleMuster.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegularizedSuccess(true);
    setTimeout(() => {
      setSelectedRecord(null);
      setIsRegularizedSuccess(false);
      setRegularizeReason("");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#00A896] border border-teal-200">
              Form D &bull; Muster Roll
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Live Biometric Telemetry Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Workforce Attendance & Muster Roll
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Indian Factories Act Form D statutory register, punch audits, and regularization
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          <Link
            href="/hrms/attendance/command-center"
            className="px-4 py-2.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Activity size={15} />
            <span>Telemetry Command Center</span>
          </Link>
          <Link
            href="/hrms/attendance/reports"
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Muster Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Headcount</span>
          <div className="text-2xl font-black text-slate-900 mt-1">91 Staff</div>
          <span className="text-[11px] text-slate-400">100% Biometric Enrolled</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Present Today</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">78</div>
          <span className="text-[11px] text-emerald-600 font-bold">85.7% Punctuality</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Late Arrivals</span>
          <div className="text-2xl font-black text-amber-600 mt-1">4</div>
          <span className="text-[11px] text-amber-600 font-bold">&lt; 15m Grace Used</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Absent / On Leave</span>
          <div className="text-2xl font-black text-slate-700 mt-1">9</div>
          <span className="text-[11px] text-slate-400">4 Approved Leaves</span>
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee, BH code or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00A896] focus:border-transparent outline-hidden bg-slate-50/50"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00A896] outline-hidden bg-white text-slate-700 font-bold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late Marks</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      {/* Muster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Shift</th>
                <th className="px-4 py-3">In-Time</th>
                <th className="px-4 py-3">Out-Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Turnstile Gate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-800">{rec.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{rec.code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">{rec.department}</td>
                  <td className="px-4 py-3 text-slate-500">{rec.shift}</td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">{rec.inTime}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{rec.outTime}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{rec.totalHours}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{rec.gate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : rec.status === "LATE"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedRecord(rec)}
                      className="px-2.5 py-1 text-xs font-bold text-[#00A896] hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      Regularize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Attendance Regularization (21 CFR Part 11)</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {isRegularizedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 size={16} />
                <span>Attendance punch regularized and synced to MySQL attendances table.</span>
              </div>
            ) : (
              <form onSubmit={handleRegularizeSubmit} className="space-y-4 text-xs">
                <p className="text-slate-600">
                  Adjusting punch for <strong className="text-slate-900">{selectedRecord.name}</strong> ({selectedRecord.code}).
                </p>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Official Reason for Regularization *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Turnstile scanner optical recalibration during Shift A entry..."
                    value={regularizeReason}
                    onChange={(e) => setRegularizeReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00A896] hover:bg-[#009B8D] text-white rounded-xl font-bold shadow-xs"
                  >
                    Confirm Regularization
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
