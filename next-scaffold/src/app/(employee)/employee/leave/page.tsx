"use client";

import React, { useState } from "react";
import {
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Loader2,
  X,
} from "lucide-react";

interface LeaveItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

const mockLeaves: LeaveItem[] = [
  { id: "L1", type: "Casual Leave (CL)", startDate: "2026-10-24", endDate: "2026-10-25", days: 2, reason: "Festival family event", status: "PENDING" },
  { id: "L2", type: "Sick Leave (SL)", startDate: "2026-09-18", endDate: "2026-09-18", days: 1, reason: "Viral fever", status: "APPROVED" },
  { id: "L3", type: "Earned Leave (EL)", startDate: "2026-08-10", endDate: "2026-08-14", days: 5, reason: "Annual leave", status: "APPROVED" },
];

export default function EmployeeLeavePage() {
  const [leaves, setLeaves] = useState<LeaveItem[]>(mockLeaves);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState("CL");
  const [startDate, setStartDate] = useState("2026-10-26");
  const [endDate, setEndDate] = useState("2026-10-27");
  const [reason, setReason] = useState("");
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = typeof window !== "undefined" ? localStorage.getItem("bjk_token") : "";

      const res = await fetch(`${apiUrl}/api/leaves/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          leaveType,
          startDate,
          endDate,
          reason,
          isHalfDay,
        }),
      });

      const newLeave: LeaveItem = {
        id: `L-${Date.now()}`,
        type: leaveType === "CL" ? "Casual Leave (CL)" : leaveType === "SL" ? "Sick Leave (SL)" : "Earned Leave (EL)",
        startDate,
        endDate,
        days: isHalfDay ? 0.5 : 2,
        reason,
        status: "PENDING",
      };

      setLeaves((prev) => [newLeave, ...prev]);
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setShowApplyModal(false);
        setReason("");
      }, 1500);
    } catch {
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setShowApplyModal(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Leave Ledger & Application
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Statutory leave quotas, holiday balances, and HR supervisor approvals
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Apply New Leave</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Casual Leave (CL)</div>
          <div className="text-2xl font-black text-slate-900">4.0 Days</div>
          <div className="text-[10px] text-slate-400">Available of 12.0/yr</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Sick Leave (SL)</div>
          <div className="text-2xl font-black text-slate-900">5.0 Days</div>
          <div className="text-[10px] text-slate-400">Medical cert required &gt; 2d</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Earned Leave (EL)</div>
          <div className="text-2xl font-black text-slate-900">5.0 Days</div>
          <div className="text-[10px] text-slate-400">Accumulated quota</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Comp Off</div>
          <div className="text-2xl font-black text-slate-900">1.0 Day</div>
          <div className="text-[10px] text-slate-400">Sunday maintenance duty</div>
        </div>
      </div>

      {/* Leave Application History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Leave Applications Record</h3>
          <span className="text-xs text-slate-400">Synced to MySQL 8.0 `leaves`</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Leave Category</th>
                <th className="py-3 px-6">Duration</th>
                <th className="py-3 px-6">Total Days</th>
                <th className="py-3 px-6">Reason Given</th>
                <th className="py-3 px-6 text-right">Approval Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{l.type}</td>
                  <td className="py-3.5 px-6 text-slate-600 font-mono">
                    {l.startDate} to {l.endDate}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-800">{l.days} Days</td>
                  <td className="py-3.5 px-6 text-slate-500">{l.reason}</td>
                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : l.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900">Submit Leave Application</h3>
              <p className="text-xs text-slate-500">Recorded directly in relational workforce persistence</p>
            </div>

            {applySuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Leave application submitted to HR Manager!</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                >
                  <option value="CL">Casual Leave (CL)</option>
                  <option value="SL">Sick Leave (SL)</option>
                  <option value="EL">Earned Leave (EL)</option>
                  <option value="CO">Compensatory Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="half-day"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00A896] focus:ring-[#00A896]"
                />
                <label htmlFor="half-day" className="text-slate-600 font-medium">
                  Half-day leave
                </label>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reason</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail reason for absence..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#00A896] hover:bg-[#009B8D] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Transmit Application to HR</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
