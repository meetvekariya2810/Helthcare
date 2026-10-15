"use client";

import React from "react";
import { Megaphone, Bell, Calendar, CheckCircle2 } from "lucide-react";

export default function EmployeeNotificationsPage() {
  const notices = [
    { id: "1", title: "October 2026 Salary Disbursed", date: "01 Oct 2026", text: "Salary credits have been processed into registered bank accounts with HDFC / SBI.", unread: false },
    { id: "2", title: "Annual Gowning Competency Test", date: "10 Oct 2026", text: "All cleanroom personnel must undergo annual gowning competency review before end of the month.", unread: true },
    { id: "3", title: "Fire Drill Scheduled", date: "14 Oct 2026", text: "Mandatory emergency evacuation and assembly drill will take place on Friday at 04:00 PM.", unread: true },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Notifications & Plant Broadcasts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time workforce announcements, compliance alerts, and administrative messages
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {notices.map((n) => (
          <div key={n.id} className="p-5 flex items-start gap-3.5 hover:bg-slate-50/80 transition-colors">
            <div className={`p-2.5 rounded-2xl shrink-0 ${n.unread ? "bg-teal-50 text-[#00A896]" : "bg-slate-100 text-slate-400"}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-bold ${n.unread ? "text-slate-900" : "text-slate-600"}`}>
                  {n.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{n.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
