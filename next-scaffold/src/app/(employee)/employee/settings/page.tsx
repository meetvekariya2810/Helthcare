"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Lock, Bell, Shield, Save, CheckCircle2 } from "lucide-react";

export default function EmployeeSettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Account Preferences & Security
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Workforce notification settings, communications, and password security
          </p>
        </div>

        {saved && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Updated</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-[#00A896]" />
            <h3 className="text-sm font-bold text-slate-900">Security & Authentication</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Your login password protects your payslips, personal bank information, and compliance records.
          </p>

          <Link
            href="/change-password"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#009B8D] shadow-xs transition-all"
          >
            <span>Update Account Password</span>
          </Link>
        </div>

        {/* Notifications Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-[#7B2CBF]" />
            <h3 className="text-sm font-bold text-slate-900">Notification Alerts</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="font-semibold text-slate-700">Email Shift & Payslip Notifications</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#00A896] focus:ring-[#00A896]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <span className="font-semibold text-slate-700">SMS Gate Punch Alerts</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-[#00A896] focus:ring-[#00A896]"
              />
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all"
            >
              Save Notification Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
