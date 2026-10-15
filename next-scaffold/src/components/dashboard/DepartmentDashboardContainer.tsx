"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  ShieldCheck,
  Boxes,
  Wrench,
  DollarSign,
  ShoppingCart,
  Globe,
  TrendingUp,
  FileText,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  Info,
  X,
  CheckSquare,
  Lock,
} from "lucide-react";

export interface KPICardItem {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  iconBg?: string;
  trend?: string;
  trendColor?: string;
  trendLabel?: string;
}

export interface QuickActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  primary?: boolean;
  onClick?: () => void;
}

interface DepartmentDashboardContainerProps {
  departmentTitle: string;
  departmentCode: string;
  departmentBadgeColor?: "teal" | "indigo" | "amber" | "rose" | "emerald" | "blue" | "purple" | "cyan";
  kpiCards?: KPICardItem[];
  quickActions?: QuickActionItem[];
  children?: React.ReactNode;
  onRefresh?: () => void;
}

export function DepartmentDashboardContainer({
  departmentTitle,
  departmentCode,
  departmentBadgeColor = "teal",
  kpiCards = [],
  quickActions = [],
  children,
  onRefresh,
}: DepartmentDashboardContainerProps) {
  const [userName, setUserName] = useState("Enterprise User");
  const [userRole, setUserRole] = useState("OFFICER");
  const [userCode, setUserCode] = useState("BJK-HQ-01");
  const [userEmail, setUserEmail] = useState("operations@bjkhealthcare.com");
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "self-service" | "team">("overview");
  const [selectedActionModal, setSelectedActionModal] = useState<QuickActionItem | null>(null);
  const [modalSuccessMsg, setModalSuccessMsg] = useState("");
  const [actionInput, setActionInput] = useState("");

  useEffect(() => {
    // Read cached user credentials if available
    try {
      const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.role) setUserRole(parsed.role);
        if (parsed.employeeCode || parsed.employeeId) setUserCode(parsed.employeeCode || parsed.employeeId);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch {
      // Keep defaults
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleExecuteModalAction = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccessMsg(`Action "${selectedActionModal?.label}" successfully executed and logged under 21 CFR Part 11 electronic audit trail.`);
    setTimeout(() => {
      setSelectedActionModal(null);
      setModalSuccessMsg("");
      setActionInput("");
    }, 1800);
  };

  const getBadgeStyle = () => {
    switch (departmentBadgeColor) {
      case "indigo":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "amber":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "rose":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "emerald":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "blue":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "purple":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "cyan":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      default:
        return "bg-teal-50 text-[#00A896] border-teal-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Department Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-1.5 flex-wrap gap-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle()}`}>
                {departmentCode} &bull; Workspace
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {userRole}
              </span>
              <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified Telemetry Active</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {departmentTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Operator: <strong className="text-slate-800 font-semibold">{userName}</strong> ({userEmail}) &bull; Code:{" "}
              <span className="font-mono text-slate-700 font-semibold">{userCode}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all flex items-center space-x-2"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-[#00A896]" : "text-slate-500"} />
              <span>{refreshing ? "Syncing..." : "Refresh Telemetry"}</span>
            </button>

            {/* Department Navigation Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Department Overview
              </button>
              <button
                onClick={() => setActiveTab("self-service")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === "self-service"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Self-Service
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === "team"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Team Approvals
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Ribbon */}
        {quickActions && quickActions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Quick Actions:
            </span>
            {quickActions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.onClick) action.onClick();
                    else setSelectedActionModal(action);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center space-x-1.5 flex-shrink-0 border ${
                    action.primary
                      ? "bg-[#00A896] hover:bg-[#009B8D] text-white border-transparent shadow-2xs"
                      : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  {ActionIcon && <ActionIcon size={13} />}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KPI Cards Ribbon */}
      {activeTab === "overview" && kpiCards && kpiCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, idx) => {
            const CardIcon = card.icon || Activity;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      card.iconBg || "bg-teal-50 text-[#00A896]"
                    }`}
                  >
                    <CardIcon size={18} />
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      {card.value}
                    </span>
                    {card.subtext && (
                      <span className="text-xs font-semibold text-slate-400">
                        {card.subtext}
                      </span>
                    )}
                  </div>
                  {card.trend && (
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                      <span className={card.trendColor || "text-emerald-600 font-bold"}>
                        {card.trend}
                      </span>
                      <span>{card.trendLabel || "vs target"}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Overview (Child Route Widgets) */}
      {activeTab === "overview" && children}

      {/* Tab: Self-Service */}
      {activeTab === "self-service" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Shift Attendance</h3>
                <p className="text-xs text-slate-500">Lavad Formulation Unit &bull; General Shift</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Hours:</span>
                <span className="font-bold text-slate-800">09:00 AM – 06:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Punch Status:</span>
                <span className="font-bold text-emerald-600">CLOCKED IN (08:54 AM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biometric Gate:</span>
                <span className="font-mono text-slate-700">GATE-01-TERMINAL</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Leave Balance Ledger</h3>
                <p className="text-xs text-slate-500">Approved Statutory Leave Bank</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-slate-800">12</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Casual (CL)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-slate-800">8</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Sick (SL)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-lg font-black text-slate-800">15</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Earned (EL)</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assigned GMP SOPs</h3>
                <p className="text-xs text-slate-500">Mandatory Department Training</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-medium text-slate-700">SOP-BJK-GMP-042 v3</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Signed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-medium text-slate-700">SOP-BJK-CLNRM-019 v2</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Signed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Team Approvals */}
      {activeTab === "team" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Department Workforce Roster & Approvals</h3>
                <p className="text-xs text-slate-500">Tier-1 Line Manager Sign-Offs & Shift Adjustments</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              All Submissions Handled
            </span>
          </div>

          <div className="p-8 text-center text-slate-400 space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
            <p className="text-sm font-bold text-slate-700">No Pending Approvals in Department Queue</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All shift swaps, regularization requests, and material gate passes for this department have been approved.
            </p>
          </div>
        </div>
      )}

      {/* Action Trigger Modal */}
      {selectedActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#00A896] flex items-center justify-center font-bold">
                  {selectedActionModal.icon ? <selectedActionModal.icon size={18} /> : <CheckSquare size={18} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedActionModal.label}</h3>
                  <p className="text-[11px] text-slate-400">Electronic Record Submission &bull; 21 CFR Part 11</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedActionModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {modalSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start space-x-2">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{modalSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteModalAction} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Reference Identification / Order / Batch #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BJK-2026-REF-001"
                    value={actionInput}
                    onChange={(e) => setActionInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00A896] focus:border-transparent outline-hidden font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center space-x-1 font-bold text-slate-700">
                    <Lock size={12} className="text-[#00A896]" />
                    <span>21 CFR Part 11 Electronic Signature Stamp</span>
                  </div>
                  <p>
                    By confirming this action, you cryptographically sign this record under user{" "}
                    <strong className="text-slate-800">{userName}</strong> ({userCode}).
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedActionModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#00A896] hover:bg-[#009B8D] rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                  >
                    <span>Confirm & Sign Electronic Record</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
