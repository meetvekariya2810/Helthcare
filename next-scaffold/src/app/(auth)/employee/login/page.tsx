"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Utensils,
  BadgeCheck,
  CreditCard,
} from "lucide-react";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!employeeCode.trim() || !password) {
      setError("Please provide your Employee ID and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/employee/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeCode: employeeCode.trim().toUpperCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid Employee ID or password.");
      }

      if (typeof window !== "undefined") {
        if (data.token) {
          localStorage.setItem("bjk_employee_token", data.token);
          localStorage.setItem("bjk_token", data.token);
          document.cookie = `bjk_token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
        }
        if (data.employee) {
          localStorage.setItem("bjk_employee_user", JSON.stringify(data.employee));
          localStorage.setItem("bjk_user", JSON.stringify(data.employee));
        }
      }

      // Check if employee must change temporary initial password
      if (data.requiresPasswordChange || data.isDefaultPassword) {
        router.push("/employee/change-password");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      console.error("[Employee Login Error]:", err);
      setError(err.message || "Failed to authenticate with Employee Portal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Portal Selection Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 mb-6 backdrop-blur-md">
        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Management</span>
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white shadow-md shadow-teal-950/40"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Employee</span>
        </button>
        <Link
          href="/canteen/login"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Canteen</span>
        </Link>
      </div>

      {/* Main Employee Login Card */}
      <div className="bjk-glass-dark border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/60 relative backdrop-blur-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00A896] mb-1">
            <BadgeCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Employee Self-Service
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Attendance check-in, leave requests, shift roster, and payslips
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="employeeCode"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Employee ID Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <CreditCard className="w-4 h-4" />
              </div>
              <input
                id="employeeCode"
                type="text"
                required
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                placeholder="e.g. BJK-001 or BJK-EMP-001"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="emp-password"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="emp-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="employee-login-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-xl shadow-teal-900/30 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Employee Pass...</span>
              </>
            ) : (
              <>
                <span>Enter Employee Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
          First time signing in? Use your initial HR-provided temporary password to activate your portal.
        </div>
      </div>
    </div>
  );
}
