"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Key,
  RefreshCw,
  Search,
  Filter,
  Unlock,
  UserCheck,
  Clock,
  ShieldAlert
} from "lucide-react";

interface UserAccount {
  id: string;
  empCode: string;
  name: string;
  department: string;
  role: string;
  accountStatus: "ACTIVE" | "LOCKED" | "PASSWORD_EXPIRED";
  mfaEnabled: boolean;
  passwordAgeDays: number;
  lastLogin: string;
  failedAttempts: number;
}

const mockUsers: UserAccount[] = [
  { id: "USR-001", empCode: "BJK-PROD-001", name: "Ramesh Patel", department: "Production", role: "production_operator", accountStatus: "ACTIVE", mfaEnabled: true, passwordAgeDays: 42, lastLogin: "Today, 07:14", failedAttempts: 0 },
  { id: "USR-002", empCode: "BJK-QC-004", name: "Priya Shah", department: "Quality Control", role: "qc_chemist", accountStatus: "ACTIVE", mfaEnabled: true, passwordAgeDays: 18, lastLogin: "Today, 17:12", failedAttempts: 0 },
  { id: "USR-003", empCode: "BJK-QA-002", name: "Dr. Ananya Roy", department: "Quality Assurance", role: "qa_officer", accountStatus: "ACTIVE", mfaEnabled: true, passwordAgeDays: 12, lastLogin: "Today, 17:01", failedAttempts: 0 },
  { id: "USR-004", empCode: "BJK-WH-006", name: "Ajay Verma", department: "Warehouse", role: "warehouse_supervisor", accountStatus: "LOCKED", mfaEnabled: false, passwordAgeDays: 78, lastLogin: "Oct 14, 09:12", failedAttempts: 3 },
  { id: "USR-005", empCode: "BJK-ENG-003", name: "Kiran Joshi", department: "Engineering", role: "maintenance_engineer", accountStatus: "ACTIVE", mfaEnabled: true, passwordAgeDays: 85, lastLogin: "Today, 17:05", failedAttempts: 0 },
];

export default function AccountCredentialsPage() {
  const [usersList, setUsersList] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filtered = usersList.filter((u) => {
    const matchesStatus = statusFilter === "ALL" || u.accountStatus === statusFilter;
    const matchesQuery = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.empCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleUnlock = (empCode: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.empCode === empCode ? { ...u, accountStatus: "ACTIVE", failedAttempts: 0 } : u))
    );
    setActionSuccess(`Account ${empCode} unlocked with 21 CFR Part 11 security audit trail.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleTriggerReset = (empCode: string) => {
    setActionSuccess(`Temporary one-time password generated for ${empCode}. User must change upon next login.`);
    setTimeout(() => setActionSuccess(null), 4000);
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
                Account Credentials & Security Administration
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                21 CFR Part 11 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage enterprise access credentials, account lockouts, 90-day password rotation rules, and multi-factor tokens
            </p>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total User Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">91 Accounts</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">100% RBAC Governed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Locked Accounts</div>
          <div className="text-2xl font-black text-rose-600 mt-1">1 Account</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">3 failed attempts lockout</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">MFA Adoption</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">98.9%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">TOTP / Biometric Enabled</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">90-Day Password Policy</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">Active</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">Auto-expiry enforced</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            User Accounts & Security Credentials
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {filtered.length} Accounts
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((user) => (
            <div key={user.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">{user.name}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{user.empCode}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                    {user.role}
                  </span>
                  {user.accountStatus === "LOCKED" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                      LOCKED
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-3 pt-0.5">
                  <span>Dept: <strong className="text-slate-700">{user.department}</strong></span>
                  <span>•</span>
                  <span>Last Login: <strong className="text-slate-700">{user.lastLogin}</strong></span>
                  <span>•</span>
                  <span>Password Age: <strong>{user.passwordAgeDays} / 90 Days</strong></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {user.accountStatus === "LOCKED" ? (
                  <button
                    onClick={() => handleUnlock(user.empCode)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition-colors"
                  >
                    <Unlock size={14} />
                    <span>Unlock Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTriggerReset(user.empCode)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1"
                  >
                    <Key size={13} />
                    <span>Reset Password</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
