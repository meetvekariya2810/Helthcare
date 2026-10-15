"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Sparkles, AlertCircle } from "lucide-react";

interface Holiday {
  date: string;
  name: string;
  type: "MANDATORY" | "OPTIONAL";
  day: string;
}

const mockHolidays: Holiday[] = [
  { date: "24 Oct 2026", name: "Diwali (Deepavali)", type: "MANDATORY", day: "Saturday" },
  { date: "26 Oct 2026", name: "Bhai Dooj", type: "MANDATORY", day: "Monday" },
  { date: "15 Nov 2026", name: "Guru Nanak Jayanti", type: "OPTIONAL", day: "Sunday" },
  { date: "25 Dec 2026", name: "Christmas Day", type: "MANDATORY", day: "Friday" },
  { date: "26 Jan 2027", name: "Republic Day", type: "MANDATORY", day: "Tuesday" },
];

export default function EmployeeCalendarPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Plant Shift & Holiday Calendar
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official manufacturing operations holiday schedule and batch rotation calendar
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Upcoming Gazetted & Factory Holidays</h3>
          <span className="text-xs font-semibold text-teal-600">Year 2026-27</span>
        </div>

        <div className="divide-y divide-slate-100">
          {mockHolidays.map((h) => (
            <div key={h.date} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00A896] font-bold text-xs flex flex-col items-center justify-center">
                  <CalendarIcon className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px]">{h.day.slice(0, 3)}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{h.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{h.date}</div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  h.type === "MANDATORY"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
              >
                {h.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
