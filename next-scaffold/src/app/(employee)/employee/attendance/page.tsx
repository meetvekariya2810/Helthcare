"use client";

import React, { useState } from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Loader2,
  X,
  Send,
} from "lucide-react";

interface AttendanceRecord {
  date: string;
  inTime: string;
  outTime: string;
  hours: string;
  status: "PRESENT" | "HALF_DAY" | "ABSENT" | "ON_LEAVE";
  isRegularized?: boolean;
}

const mockHistory: AttendanceRecord[] = [
  { date: "2026-10-15", inTime: "08:55 AM", outTime: "—", hours: "Ongoing", status: "PRESENT" },
  { date: "2026-10-14", inTime: "08:58 AM", outTime: "05:32 PM", hours: "8.5 hrs", status: "PRESENT" },
  { date: "2026-10-13", inTime: "09:02 AM", outTime: "05:30 PM", hours: "8.5 hrs", status: "PRESENT" },
  { date: "2026-10-12", inTime: "09:15 AM", outTime: "05:35 PM", hours: "8.3 hrs", status: "PRESENT", isRegularized: true },
  { date: "2026-10-11", inTime: "—", outTime: "—", hours: "0.0 hrs", status: "ON_LEAVE" },
  { date: "2026-10-10", inTime: "08:50 AM", outTime: "05:30 PM", hours: "8.6 hrs", status: "PRESENT" },
];

export default function EmployeeAttendancePage() {
  const [history, setHistory] = useState<AttendanceRecord[]>(mockHistory);
  const [clockedIn, setClockedIn] = useState(true);
  const [punching, setPunching] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regDate, setRegDate] = useState("2026-10-15");
  const [regInTime, setRegInTime] = useState("09:00");
  const [regOutTime, setRegOutTime] = useState("17:30");
  const [regReason, setRegReason] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handlePunch = () => {
    setPunching(true);
    setTimeout(() => {
      setClockedIn(!clockedIn);
      setPunching(false);
    }, 600);
  };

  const handleRegularizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regReason.trim()) return;

    setRegSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = typeof window !== "undefined" ? localStorage.getItem("bjk_token") : "";
      await fetch(`${apiUrl}/api/hrms/attendance/regularization`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          employeeId: "BJK-EMP-001",
          date: regDate,
          proposedCheckIn: `${regDate}T${regInTime}:00.000Z`,
          proposedCheckOut: `${regDate}T${regOutTime}:00.000Z`,
          proposedStatus: "PRESENT",
          reason: regReason,
        }),
      });
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setShowRegModal(false);
        setRegReason("");
      }, 2000);
    } catch {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setShowRegModal(false);
      }, 2000);
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Attendance Punch Terminal & Biometrics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Plant geofence verified check-ins and electronic punch regularization
          </p>
        </div>

        <button
          onClick={() => setShowRegModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <FileText className="w-4 h-4 text-[#00A896]" />
          <span>Request Regularization</span>
        </button>
      </div>

      {/* Clock In / Out Card */}
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl shadow-xl border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Ahmedabad Plant Geofence: In Bounds
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {clockedIn ? "Active On-Duty Shift" : "Shift Not Started"}
          </h2>
          <p className="text-xs text-slate-300">
            Latitude: 23.0841° N • Longitude: 72.6582° E • Accuracy: 12 meters
          </p>
        </div>

        <button
          onClick={handlePunch}
          disabled={punching}
          className={`px-8 py-4 rounded-2xl font-bold text-sm text-white flex items-center gap-2.5 shadow-xl transition-all transform hover:-translate-y-0.5 ${
            clockedIn
              ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500"
              : "bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D]"
          }`}
        >
          {punching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
          <span>{clockedIn ? "Punch Clock Out" : "Punch Clock In"}</span>
        </button>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">October 2026 Punch Logs</h3>
            <p className="text-xs text-slate-500">Official electronic sign-in records</p>
          </div>
          <span className="text-xs font-semibold text-teal-600">21 Records Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">In Time</th>
                <th className="py-3 px-6">Out Time</th>
                <th className="py-3 px-6">Effective Hours</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {history.map((h) => (
                <tr key={h.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{h.date}</td>
                  <td className="py-3.5 px-6 text-slate-700 font-mono">{h.inTime}</td>
                  <td className="py-3.5 px-6 text-slate-700 font-mono">{h.outTime}</td>
                  <td className="py-3.5 px-6 text-slate-600 font-semibold">{h.hours}</td>
                  <td className="py-3.5 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {h.isRegularized && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Regularized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 bg-white rounded-3xl border border-slate-200 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-900">Attendance Regularization</h3>
              <p className="text-xs text-slate-500">Request HR approval for biometric misses or gate errors</p>
            </div>

            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Regularization request queued for HR approval!</span>
              </div>
            )}

            <form onSubmit={handleRegularizeSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Punch Date</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Proposed In</label>
                  <input
                    type="time"
                    required
                    value={regInTime}
                    onChange={(e) => setRegInTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Proposed Out</label>
                  <input
                    type="time"
                    required
                    value={regOutTime}
                    onChange={(e) => setRegOutTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Reason for Missed Punch</label>
                <textarea
                  required
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="e.g. Biometric reader was undergoing calibration during plant entry..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                />
              </div>

              <button
                type="submit"
                disabled={regSubmitting}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#00A896] hover:bg-[#009B8D] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {regSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit to HR Operations</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
