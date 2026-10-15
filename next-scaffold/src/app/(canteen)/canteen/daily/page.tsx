"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  UtensilsCrossed,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

interface DailySummary {
  date: string;
  totalPresent: number;
  totalServed: number;
  vegMeals: number;
  specialMeals: number;
  subsidyAmount: number;
  fulfillmentRate: string;
}

const mockDaily: DailySummary[] = [
  { date: "2026-10-15", totalPresent: 182, totalServed: 124, vegMeals: 118, specialMeals: 6, subsidyAmount: 4960, fulfillmentRate: "68%" },
  { date: "2026-10-14", totalPresent: 180, totalServed: 168, vegMeals: 160, specialMeals: 8, subsidyAmount: 6720, fulfillmentRate: "93%" },
  { date: "2026-10-13", totalPresent: 178, totalServed: 165, vegMeals: 157, specialMeals: 8, subsidyAmount: 6600, fulfillmentRate: "92%" },
  { date: "2026-10-12", totalPresent: 175, totalServed: 161, vegMeals: 155, specialMeals: 6, subsidyAmount: 6440, fulfillmentRate: "92%" },
  { date: "2026-10-11", totalPresent: 140, totalServed: 132, vegMeals: 128, specialMeals: 4, subsidyAmount: 5280, fulfillmentRate: "94%" },
];

export default function CanteenDailyPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-10");

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Daily Catering Audits & Headcount Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical day-by-day plant meal distribution and statutory billing rollups
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">Service Date</th>
                <th className="py-3 px-6">Plant Headcount</th>
                <th className="py-3 px-6">Meals Served</th>
                <th className="py-3 px-6">Veg / Special</th>
                <th className="py-3 px-6">Plant Subsidy Cost</th>
                <th className="py-3 px-6 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {mockDaily.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{row.date}</td>
                  <td className="py-3.5 px-6 text-slate-600 font-medium">{row.totalPresent} staff</td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">{row.totalServed} meals</td>
                  <td className="py-3.5 px-6 text-slate-500">
                    {row.vegMeals} Veg • {row.specialMeals} Special
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-emerald-600">
                    ₹{row.subsidyAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {row.fulfillmentRate}
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
