"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  Utensils,
  ShieldCheck,
  CheckCircle2,
  X,
} from "lucide-react";

// Role-based redirect router matching BJK canonical RBAC
function getRoleRedirect(user: any): string {
  const role = (user?.role || "").toUpperCase().trim();
  const dept = (user?.department || "").toLowerCase().trim();
  const target = user?.dashboard;

  if (target && target !== "/employee" && target !== "/employee/dashboard" && target !== "/admin") {
    return target;
  }

  if (role === "EMPLOYEE" || role === "SENIOR_EMPLOYEE") return "/employee/dashboard";
  if (role === "CANTEEN_ADMIN") return "/canteen/dashboard";
  if (role === "SUPER_ADMIN" || role === "DIRECTOR") return "/dashboard/hr";
  if (
    ["HR_ADMIN", "HR_MANAGER", "HR_EXECUTIVE", "HR", "RECRUITER", "PAYROLL_ADMIN"].includes(role) ||
    dept.includes("human resource")
  ) {
    return "/dashboard/hr";
  }
  if (role === "PRODUCTION_MANAGER" || dept.includes("production") || dept.includes("manufacturing")) {
    return "/dashboard/production";
  }
  if (dept.includes("micro") || dept.includes("microbiology")) {
    return "/dashboard/microbiology";
  }
  if (role === "QC_MANAGER" || dept.includes("quality control") || dept === "qc") {
    return "/dashboard/quality-control";
  }
  if (role === "QA_MANAGER" || dept.includes("quality assurance") || dept === "qa") {
    return "/dashboard/quality-assurance";
  }
  if (
    role === "WAREHOUSE_MANAGER" ||
    role === "SUPPLY_CHAIN_MANAGER" ||
    dept.includes("warehouse") ||
    dept.includes("inventory") ||
    dept.includes("logistics")
  ) {
    return "/dashboard/warehouse";
  }
  if (dept.includes("engineering") || dept.includes("maintenance")) {
    return "/dashboard/engineering";
  }
  if (role === "FINANCE_MANAGER" || role === "FINANCE" || dept.includes("account") || dept.includes("finance")) {
    return "/dashboard/finance";
  }
  if (dept.includes("purchase") || dept.includes("procurement")) {
    return "/dashboard/procurement";
  }
  if (role === "REGULATORY_MANAGER" || role === "REGULATORY_VIEWER" || dept.includes("regulatory")) {
    return "/dashboard/regulatory";
  }
  if (
    role === "SALES_MANAGER" ||
    role === "CRM_MANAGER" ||
    role === "EXPORT_MANAGER" ||
    dept.includes("sales") ||
    dept.includes("commercial") ||
    dept.includes("crm") ||
    dept.includes("export") ||
    dept.includes("marketing")
  ) {
    return "/dashboard/sales";
  }
  if (role === "ADMIN" || dept.includes("admin") || dept.includes("facility") || dept.includes("facilities")) {
    return "/dashboard/facilities";
  }
  if (role === "AUDITOR") return "/audit-logs";
  if (role === "DOCUMENT_CONTROLLER") return "/documents";

  return "/dashboard";
}

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [infoNotice, setInfoNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoNotice("");

    if (!identifier.trim() || !password) {
      setError("Please provide your login credentials.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Authentication credentials rejected.");
      }

      // Store auth session
      if (typeof window !== "undefined") {
        if (data.token) {
          localStorage.setItem("bjk_token", data.token);
          // Set cookie for Next.js middleware and SSR
          document.cookie = `bjk_token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
        }
        if (data.user) {
          localStorage.setItem("bjk_user", JSON.stringify(data.user));
        }
      }

      const redirectPath = getRoleRedirect(data.user);
      router.push(redirectPath);
    } catch (err: any) {
      console.error("[Login Error]:", err);
      setError(err.message || "Unable to connect to authorization service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;
    setForgotLoading(true);
    setForgotMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      const data = await res.json();
      setForgotMsg(data.message || "If an account exists, a reset request has been logged.");
    } catch {
      setForgotMsg("Password reset request logged. Please contact HR Operations.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Portal Selection Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 mb-6 backdrop-blur-md">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white shadow-md shadow-teal-950/40"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Management</span>
        </button>
        <Link
          href="/employee/login"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Employee</span>
        </Link>
        <Link
          href="/canteen/login"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Canteen</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="bjk-glass-dark border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/60 relative backdrop-blur-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00A896] mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Enterprise Sign In
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Authorized pharmaceutical operators and management personnel
          </p>
        </div>

        {/* Error / Notice Banners */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {infoNotice && (
          <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{infoNotice}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="identifier"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@bjkhealthcare.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
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
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#00A896] focus:ring-[#00A896] focus:ring-offset-slate-900"
              />
              <span>Keep session active on this workstation</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-xl shadow-teal-900/30 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Identity...</span>
              </>
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Change Password Prompt */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <Link
            href="/change-password"
            className="text-xs text-slate-400 hover:text-teal-300 transition-colors"
          >
            Need to update an expired password? <span className="text-teal-400 underline">Change Password</span>
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">
              Password Recovery
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your email or employee identifier. A recovery link or HR
              dispatch notification will be generated.
            </p>
            {forgotMsg && (
              <div className="p-3 mb-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs">
                {forgotMsg}
              </div>
            )}
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="text"
                required
                value={forgotIdentifier}
                onChange={(e) => setForgotIdentifier(e.target.value)}
                placeholder="Enter email or employee code"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
              />
              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-2.5 rounded-xl font-medium text-xs text-white bg-[#00A896] hover:bg-[#009B8D] transition-colors"
              >
                {forgotLoading ? "Submitting..." : "Send Reset Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
