"use client";

import React, { useState } from "react";
import { Users, Mail, Phone, Search } from "lucide-react";

export default function EmployeeTeamPage() {
  const [search, setSearch] = useState("");
  const colleagues = [
    { name: "Dr. Rajesh Sharma", code: "BJK-EMP-001", role: "Senior QA Lead", email: "rajesh.sharma@bjkhealthcare.com", ext: "101" },
    { name: "Pooja Mehta", code: "BJK-EMP-005", role: "Regulatory Officer", email: "pooja.mehta@bjkhealthcare.com", ext: "105" },
    { name: "Kavita Shah", code: "BJK-EMP-007", role: "Microbiologist", email: "kavita.shah@bjkhealthcare.com", ext: "107" },
    { name: "Suresh Patel", code: "BJK-EMP-006", role: "Warehouse In-Charge", email: "suresh.patel@bjkhealthcare.com", ext: "106" },
  ];

  const filtered = colleagues.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Colleague Directory & Plant Extensions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department internal communication directory and plant intercom lines
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search colleagues..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.code} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#00A896] font-bold text-xs flex items-center justify-center">
                {c.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                <div className="text-xs text-teal-600 font-medium">{c.role}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Intercom Ext: <strong>{c.ext}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
