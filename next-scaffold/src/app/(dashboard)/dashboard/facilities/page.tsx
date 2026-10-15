"use client";

import React from "react";
import {
  Building2,
  Utensils,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Fuel,
  Users,
  FileCheck,
} from "lucide-react";
import {
  DepartmentDashboardContainer,
  KPICardItem,
  QuickActionItem,
} from "@/components/dashboard/DepartmentDashboardContainer";

export default function FacilitiesDashboardPage() {
  const kpis: KPICardItem[] = [
    {
      title: "Open Service Requests",
      value: 3,
      subtext: "Facility Maintenance",
      icon: Building2,
      iconBg: "bg-teal-50 text-[#00A896]",
      trend: "In Progress",
      trendLabel: "SLA < 24h",
    },
    {
      title: "Canteen Meals Served",
      value: 248,
      subtext: "Staff & Guest Lunches",
      icon: Utensils,
      iconBg: "bg-amber-50 text-amber-600",
      trend: "Hygienic Verified",
      trendColor: "text-emerald-600 font-bold",
    },
    {
      title: "DG Generator Fuel",
      value: "100% (48h Cover)",
      subtext: "Emergency Power Grid",
      icon: Fuel,
      iconBg: "bg-indigo-50 text-indigo-600",
      trend: "Standby Ready",
      trendColor: "text-indigo-600 font-bold",
    },
    {
      title: "Fire & Facility Safety",
      value: "Certified Valid",
      subtext: "NOC & Extinguishers OK",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
      trend: "100% Compliant",
      trendColor: "text-emerald-600 font-bold",
    },
  ];

  const quickActions: QuickActionItem[] = [
    { label: "Log Facility Service Request", icon: Plus, primary: true },
    { label: "Check Canteen Attendance Count", icon: Utensils },
    { label: "Issue Visitor Gate Pass", icon: Users },
    { label: "Log Housekeeping Sanitization", icon: FileCheck },
  ];

  const requests = [
    {
      ticketNo: "FAC-TKT-2026-088",
      area: "Lavad Plant Gate 1 (Main Security Turnstile)",
      issue: "Turnstile biometric sensor optical glass cleaning & calibration",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
    },
    {
      ticketNo: "FAC-TKT-2026-089",
      area: "Plant Cafeteria & Dining Hall",
      issue: "Water purifier UV filter candle routine replacement",
      priority: "LOW",
      status: "COMPLETED",
    },
    {
      ticketNo: "FAC-TKT-2026-090",
      area: "Effluent Treatment Plant (ETP)",
      issue: "Activated carbon filter media backwash cycle",
      priority: "HIGH",
      status: "SCHEDULED",
    },
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="General Administration & Plant Facilities Command Center"
      departmentCode="FAC"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Service Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Facility & Infrastructure Maintenance Requests
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Plant security gates, cafeteria, HVAC non-critical & housekeeping
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">{requests.length} Active Tickets</span>
            </div>

            <div className="space-y-3">
              {requests.map((req, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{req.ticketNo}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{req.issue}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Location: {req.area}</p>
                  </div>

                  <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex-shrink-0">
                    {req.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Safety & Environmental NOCs */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Plant Environmental & Safety Consents
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between font-bold">
                  <span>GPCB Consent to Operate (CTO)</span>
                  <span className="text-emerald-600">Valid till 2028</span>
                </div>
                <p className="text-[10px] text-slate-400">Gujarat Pollution Control Board</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between font-bold">
                  <span>Fire Safety NOC</span>
                  <span className="text-emerald-600">Certified Valid</span>
                </div>
                <p className="text-[10px] text-slate-400">Annual Audit & Drill Passed</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between font-bold">
                  <span>Effluent Quality (COD/BOD)</span>
                  <span className="text-emerald-600">Zero Discharge Violation</span>
                </div>
                <p className="text-[10px] text-slate-400">Daily ETP Lab Testing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
}
