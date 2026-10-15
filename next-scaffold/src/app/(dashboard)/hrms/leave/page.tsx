"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Check,
  X,
  MessageSquare
} from "lucide-react";

interface LeaveRequest {
  id: string;
  empCode: string;
  name: string;
  department: string;
  leaveType: "CASUAL" | "SICK" | "EARNED" | "COMP_OFF";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  tier: "TIER_1_PENDING" | "TIER_2_PENDING" | "HR_APPROVED" | "REJECTED";
  managerSign: string;
  deptHeadSign: string;
  hrSign: string;
  appliedOn: string;
}

const mockLeaves: LeaveRequest[] = [
  {
    id: "LV-2026-089",
    empCode: "BJK-PROD-014",
    name: "Ramesh Patel",
    department: "Production (Injectable)",
    leaveType: "CASUAL",
    startDate: "2026-10-22",
    endDate: "2026-10-23",
    days: 2,
    reason: "Family function in Ahmedabad. Cleanroom shift cover assigned to Suresh Thakor.",
    tier: "TIER_1_PENDING",
    managerSign: "Pending",
    deptHeadSign: "Pending",
    hrSign: "Pending",
    appliedOn: "2026-10-14"
  },
  {
    id: "LV-2026-088",
    empCode: "BJK-QC-008",
    name: "Priya Shah",
    department: "Quality Control",
    leaveType: "EARNED",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    days: 5,
    reason: "Annual leave. All HPLC ongoing batch testing completed or handed over to Neha Trivedi.",
    tier: "TIER_2_PENDING",
    managerSign: "Approved by M. Dave (QC Lead)",
    deptHeadSign: "Pending Dept Head Review",
    hrSign: "Pending",
    appliedOn: "2026-10-12"
  },
  {
    id: "LV-2026-085",
    empCode: "BJK-WH-003",
    name: "Ajay Verma",
    department: "Warehouse",
    leaveType: "SICK",
    startDate: "2026-10-15",
    endDate: "2026-10-16",
    days: 2,
    reason: "Viral fever, medical certificate attached from registered medical practitioner.",
    tier: "HR_APPROVED",
    managerSign: "Approved by V. Joshi",
    deptHeadSign: "Approved by S. Patel",
    hrSign: "Approved by HR Head (21 CFR Part 11)",
    appliedOn: "2026-10-14"
  },
  {
    id: "LV-2026-082",
    empCode: "BJK-ENG-005",
    name: "Kiran Joshi",
    department: "Engineering",
    leaveType: "COMP_OFF",
    startDate: "2026-10-18",
    endDate: "2026-10-18",
    days: 1,
    reason: "Compensatory off for Sunday boiler overhaul and HVAC validation shift on Oct 11.",
    tier: "HR_APPROVED",
    managerSign: "Approved by Plant Head",
    deptHeadSign: "Approved by Engineering Head",
    hrSign: "Approved by HR (21 CFR Part 11)",
    appliedOn: "2026-10-12"
  }
];

export default function LeaveManagementPage() {
  const [filterTier, setFilterTier] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [leavesList, setLeavesList] = useState(mockLeaves);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [signModalLeave, setSignModalLeave] = useState<LeaveRequest | null>(null);
  const [cfrReason, setCfrReason] = useState("");

  const filteredLeaves = leavesList.filter((l) => {
    const matchesTier = filterTier === "ALL" || l.tier === filterTier;
    const matchesQuery = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesQuery;
  });

  const handleApprove = (leave: LeaveRequest) => {
    setSignModalLeave(leave);
  };

  const handleConfirmSign = (action: "APPROVE" | "REJECT") => {
    if (!signModalLeave) return;

    setLeavesList((prev) =>
      prev.map((item) => {
        if (item.id === signModalLeave.id) {
          if (action === "APPROVE") {
            const nextTier = item.tier === "TIER_1_PENDING" ? "TIER_2_PENDING" : "HR_APPROVED";
            return {
              ...item,
              tier: nextTier,
              hrSign: nextTier === "HR_APPROVED" ? "Approved by HR (21 CFR Part 11)" : item.hrSign,
              managerSign: item.tier === "TIER_1_PENDING" ? "Approved by Reporting Manager" : item.managerSign
            };
          } else {
            return {
              ...item,
              tier: "REJECTED",
              hrSign: `Rejected: ${cfrReason || "Operational requirements"}`
            };
          }
        }
        return item;
      })
    );

    setActionSuccess(
      `Leave ${signModalLeave.id} ${action === "APPROVE" ? "Approved" : "Rejected"} with 21 CFR Part 11 digital sign-off.`
    );
    setSignModalLeave(null);
    setCfrReason("");
    setTimeout(() => setActionSuccess(null), 5000);
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
                3-Tier Enterprise Leave Approvals
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Tier 1 - Tier 2 - HR Sign-off
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Statutory leave ledger, cleanroom shift cover verification & 21 CFR Part 11 electronic approvals
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/hrms/attendance"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            View Muster Roll
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</div>
          <div className="text-2xl font-black text-amber-600 mt-1">2 Requests</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">1 Tier 1, 1 Tier 2</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Currently On Leave</div>
          <div className="text-2xl font-black text-slate-900 mt-1">4 Employees</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">All cleanroom covers active</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Casual Leave (CL) Quota</div>
          <div className="text-2xl font-black text-slate-900 mt-1">12 Days / Year</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">Statutory Factory Rule 1963</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Earned Leave (EL) Balance</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">15 Days / Year</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-1">Encashment eligible</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, code, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="TIER_1_PENDING">Tier 1: Reporting Manager Pending</option>
            <option value="TIER_2_PENDING">Tier 2: Dept Head Pending</option>
            <option value="HR_APPROVED">HR Approved (Final)</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Active Leave Applications
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredLeaves.length} Records
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLeaves.map((leave) => {
            const isPending = leave.tier === "TIER_1_PENDING" || leave.tier === "TIER_2_PENDING";
            return (
              <div key={leave.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-900">{leave.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{leave.empCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {leave.department}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        {leave.leaveType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 font-medium pt-1">
                      <span className="text-slate-400">Dates: </span>
                      <span className="font-bold text-slate-800">{leave.startDate}</span> to{" "}
                      <span className="font-bold text-slate-800">{leave.endDate}</span> ({leave.days} {leave.days > 1 ? "Days" : "Day"})
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-0.5">
                      &quot;{leave.reason}&quot;
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right text-[11px]">
                      <div className="font-bold text-slate-700">
                        {leave.tier === "TIER_1_PENDING" && <span className="text-amber-600 font-bold">Tier 1: Manager Sign Pending</span>}
                        {leave.tier === "TIER_2_PENDING" && <span className="text-blue-600 font-bold">Tier 2: Dept Head Sign Pending</span>}
                        {leave.tier === "HR_APPROVED" && <span className="text-emerald-600 font-bold">HR Approved</span>}
                        {leave.tier === "REJECTED" && <span className="text-rose-600 font-bold">Application Rejected</span>}
                      </div>
                      <div className="text-[10px] text-slate-400">{leave.hrSign}</div>
                    </div>

                    {isPending && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleApprove(leave)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors"
                        >
                          <ShieldCheck size={14} />
                          <span>Review & Sign</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 21 CFR Part 11 Electronic Signature Modal */}
      {signModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="text-teal-600" size={20} />
                <h3 className="text-sm font-black text-slate-900">
                  21 CFR Part 11 Electronic Signature Sign-Off
                </h3>
              </div>
              <button
                onClick={() => setSignModalLeave(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Applicant:</span>
                <span className="font-bold text-slate-900">{signModalLeave.name} ({signModalLeave.empCode})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Leave Period:</span>
                <span className="font-bold text-slate-900">{signModalLeave.startDate} to {signModalLeave.endDate} ({signModalLeave.days} Days)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Type & Dept:</span>
                <span className="font-bold text-slate-900">{signModalLeave.leaveType} — {signModalLeave.department}</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason / Cleanroom Handover Verification Remark
              </label>
              <textarea
                rows={2}
                value={cfrReason}
                onChange={(e) => setCfrReason(e.target.value)}
                placeholder="Enter mandatory justification or handover confirmation..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 leading-relaxed">
              <strong>Statutory Declaration:</strong> By providing your electronic signature, you legally certify that the operational shift cover has been verified according to Schedule M and WHO-GMP guidelines.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => handleConfirmSign("REJECT")}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleConfirmSign("APPROVE")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs flex items-center space-x-1"
              >
                <Check size={14} />
                <span>Digitally Approve (Sign)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
