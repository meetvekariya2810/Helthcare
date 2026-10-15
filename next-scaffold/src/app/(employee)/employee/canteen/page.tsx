"use client";

import React, { useState } from "react";
import { Utensils, CheckCircle2, Clock, Calendar, Coffee, ShieldCheck } from "lucide-react";

interface MealHistoryItem {
  date: string;
  dishType: string;
  time: string;
  subsidy: number;
  status: "SERVED";
}

const mockHistory: MealHistoryItem[] = [
  { date: "2026-10-15", dishType: "Standard Veg Thali", time: "12:42 PM", subsidy: 40, status: "SERVED" },
  { date: "2026-10-14", dishType: "Standard Veg Thali", time: "01:05 PM", subsidy: 40, status: "SERVED" },
  { date: "2026-10-13", dishType: "Standard Veg Thali", time: "12:55 PM", subsidy: 40, status: "SERVED" },
  { date: "2026-10-12", dishType: "Special Diet", time: "01:10 PM", subsidy: 40, status: "SERVED" },
];

export default function EmployeeCanteenPage() {
  const [history] = useState<MealHistoryItem[]>(mockHistory);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Canteen Pass & Personal Catering Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Personal plant meal records, company subsidy benefits, and dietary preferences
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Meals This Month</div>
          <div className="text-2xl font-black text-slate-900">{history.length} Meals</div>
          <div className="text-[10px] text-slate-400">October 2026 billing</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Company Subsidy</div>
          <div className="text-2xl font-black text-slate-900">₹{history.length * 40}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">₹40 plant contribution / meal</div>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Dietary Style</div>
          <div className="text-xl font-black text-slate-900">Standard Veg</div>
          <div className="text-[10px] text-slate-400">Registered with Catering Head</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Canteen Swipes</h3>
          <span className="text-xs text-slate-400">Barcode & Biometric Station Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Serving Date</th>
                <th className="py-3 px-6">Meal Dish</th>
                <th className="py-3 px-6">Swipe Time</th>
                <th className="py-3 px-6">Plant Subsidy</th>
                <th className="py-3 px-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {history.map((m) => (
                <tr key={m.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{m.date}</td>
                  <td className="py-3.5 px-6 font-medium text-slate-800">{m.dishType}</td>
                  <td className="py-3.5 px-6 text-slate-500 font-mono">{m.time}</td>
                  <td className="py-3.5 px-6 font-bold text-emerald-700">₹{m.subsidy}</td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{m.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
