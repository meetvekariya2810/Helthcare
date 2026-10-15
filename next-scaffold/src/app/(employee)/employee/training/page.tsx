"use client";

import React from "react";
import { GraduationCap, CheckCircle2, Clock, Award } from "lucide-react";

export default function EmployeeTrainingPage() {
  const modules = [
    { id: "1", title: "WHO-GMP Good Manufacturing Practices (2026)", status: "COMPLETED", score: "98%", validity: "Dec 2026" },
    { id: "2", title: "ISO 9001:2015 Quality Management Systems", status: "COMPLETED", score: "95%", validity: "Dec 2026" },
    { id: "3", title: "Cleanroom Gowning Protocol & Contamination Control", status: "COMPLETED", score: "100%", validity: "Jan 2027" },
    { id: "4", title: "Fire Safety & Emergency Evacuation Drill", status: "UPCOMING", score: "—", validity: "Scheduled Nov 2026" },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          GMP Training & Cleanroom Certifications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Mandatory pharmaceutical regulatory certifications and continuous education credits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((m) => (
          <div key={m.id} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-[#00A896]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  m.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {m.status}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>Score: <strong className="text-slate-800">{m.score}</strong></span>
                <span className="font-mono text-[11px]">{m.validity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
