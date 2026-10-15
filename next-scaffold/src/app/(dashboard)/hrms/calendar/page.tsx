"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText
} from "lucide-react";

interface HolidayEvent {
  date: string;
  name: string;
  day: string;
  type: "NATIONAL_MANDATORY" | "FESTIVAL_STATE" | "PLANT_MAINTENANCE_SHUTDOWN";
  scope: string;
  impact: string;
}

const mockHolidays: HolidayEvent[] = [
  { date: "2026-10-31", name: "Diwali (Deepawali)", day: "Saturday", type: "FESTIVAL_STATE", scope: "All Plant & Corporate Offices", impact: "Full Facility Closed (Critical Utilities On Guard)" },
  { date: "2026-11-01", name: "New Year (Bestu Varas)", day: "Sunday", type: "FESTIVAL_STATE", scope: "All Plant & Corporate Offices", impact: "Full Facility Closed" },
  { date: "2026-11-02", name: "Bhai Dooj", day: "Monday", type: "FESTIVAL_STATE", scope: "Corporate & Non-Sterile", impact: "Shift A Emergency Formulation Only" },
  { date: "2026-12-25", name: "Christmas", day: "Friday", type: "FESTIVAL_STATE", scope: "All Plant Units", impact: "Plant Closed" },
  { date: "2027-01-14", name: "Makar Sankranti (Uttarayan)", day: "Thursday", type: "FESTIVAL_STATE", scope: "Gujarat State Plant Units", impact: "Lavad Formulation Plant Closed" },
  { date: "2027-01-26", name: "Republic Day", day: "Tuesday", type: "NATIONAL_MANDATORY", scope: "All Units (Statutory Paid Holiday)", impact: "Flag Hoisting at Lavad Unit at 08:30 AM" },
  { date: "2026-11-14", name: "Annual WFI Loop Passivation & HVAC Overhaul", day: "Saturday - Sunday", type: "PLANT_MAINTENANCE_SHUTDOWN", scope: "Sterile Injectables Block", impact: "Formulation Paused; Maintenance Crews Active" },
];

export default function PlantCalendarPage() {
  const [selectedType, setSelectedType] = useState("ALL");

  const filtered = mockHolidays.filter((h) => {
    return selectedType === "ALL" || h.type === selectedType;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "NATIONAL_MANDATORY":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">National Mandatory</span>;
      case "FESTIVAL_STATE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">State / Festival</span>;
      case "PLANT_MAINTENANCE_SHUTDOWN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">Maintenance Shutdown</span>;
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
                Plant Holiday & Shutdown Calendar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                Lavad Formulation Facility
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Statutory Gujarat National & Festival Holidays Act 1972 schedule and sterile cleanroom maintenance shutdowns
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Plant Holidays</div>
          <div className="text-2xl font-black text-slate-900 mt-1">11 Days / Year</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">Gujarat Factories Rules Compliant</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Upcoming Holiday</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">Diwali (Oct 31)</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">16 Days Remaining</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Planned Shutdown</div>
          <div className="text-2xl font-black text-amber-600 mt-1">Nov 14 - 15</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">WFI Loop Passivation</div>
        </div>
      </div>

      {/* Holiday Events List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Official Holiday & Operational Shutdown Register
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((item) => (
            <div key={item.date} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{item.name}</span>
                  {getTypeBadge(item.type)}
                </div>

                <div className="text-xs text-slate-600">
                  <span className="text-slate-400">Scope: </span>
                  <strong className="text-slate-800">{item.scope}</strong>
                </div>

                <div className="text-[11px] text-slate-500 italic">
                  Operational Impact: {item.impact}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black text-teal-700 font-mono">{item.date}</div>
                <div className="text-[11px] text-slate-400 font-semibold">{item.day}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
