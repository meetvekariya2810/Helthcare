"use client";

import React, { useState } from "react";
import {
  Settings,
  Clock,
  UtensilsCrossed,
  Save,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function CanteenSettingsPage() {
  const [lunchStart, setLunchStart] = useState("12:30");
  const [lunchEnd, setLunchEnd] = useState("15:00");
  const [mealCost, setMealCost] = useState("50");
  const [companySubsidy, setCompanySubsidy] = useState("40");
  const [employeeDeduction, setEmployeeDeduction] = useState("10");
  const [guestMealPrice, setGuestMealPrice] = useState("75");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Canteen Policies & Service Parameters
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure meal service windows, subsidy allowances, and terminal operational rules
          </p>
        </div>

        {saved && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parameters Successfully Synced</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Service Windows Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-[#00A896]" />
            <h3 className="text-sm font-bold text-slate-900">Plant Service Window (Lunch)</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Service Opening Time</label>
              <input
                type="time"
                value={lunchStart}
                onChange={(e) => setLunchStart(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Service Closing Time</label>
              <input
                type="time"
                value={lunchEnd}
                onChange={(e) => setLunchEnd(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>
          </div>
        </div>

        {/* Financial Subsidies Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <UtensilsCrossed className="w-5 h-5 text-[#F77F00]" />
            <h3 className="text-sm font-bold text-slate-900">Pricing & Subsidy Structure</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Total Thali Cost (₹)</label>
              <input
                type="number"
                value={mealCost}
                onChange={(e) => setMealCost(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Company Subsidy (₹)</label>
              <input
                type="number"
                value={companySubsidy}
                onChange={(e) => setCompanySubsidy(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Employee Deduction (₹)</label>
              <input
                type="number"
                value={employeeDeduction}
                onChange={(e) => setEmployeeDeduction(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-md shadow-teal-900/20 flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Canteen Parameters</span>
        </button>
      </form>
    </div>
  );
}
