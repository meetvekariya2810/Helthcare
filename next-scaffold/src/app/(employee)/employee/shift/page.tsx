"use client";

import React, { useState } from "react";
import { Clock, Calendar, Users, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

export default function EmployeeShiftPage() {
  const [activeShift] = useState({
    code: "GS",
    name: "General Shift",
    timing: "09:00 AM - 05:30 PM",
    graceTime: "15 Minutes",
    breakDuration: "45 Minutes",
    weekOff: "Sunday",
  });

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Shift Schedule & Roster
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Active manufacturing shift assignment and peer shift swap requests
        </p>
      </div>

      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl shadow-xl border border-slate-700/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Assigned Roster
            </span>
            <h2 className="text-xl font-bold text-white">{activeShift.name} ({activeShift.code})</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Timings</span>
            <span className="font-bold text-white text-sm block mt-0.5">{activeShift.timing}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Grace Period</span>
            <span className="font-bold text-white text-sm block mt-0.5">{activeShift.graceTime}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Lunch Break</span>
            <span className="font-bold text-white text-sm block mt-0.5">{activeShift.breakDuration}</span>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Weekly Off</span>
            <span className="font-bold text-teal-300 text-sm block mt-0.5">{activeShift.weekOff}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
