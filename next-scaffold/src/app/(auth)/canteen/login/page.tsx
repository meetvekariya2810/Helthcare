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
  Coffee,
  ScanLine,
} from "lucide-react";

export default function CanteenLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please provide canteen operator credentials.");
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
        throw new Error(data.message || "Invalid canteen operator credentials.");
      }

      if (typeof window !== "undefined") {
        if (data.token) {
          localStorage.setItem("bjk_token", data.token);
          document.cookie = `bjk_token=${data.token}; path=/; max-age=${7 * 86400}; SameSite=Lax`;
        }
        if (data.user) {
          localStorage.setItem("bjk_user", JSON.stringify(data.user));
        }
      }

      router.push("/canteen/dashboard");
    } catch (err: any) {
      console.error("[Canteen Login Error]:", err);
      setError(err.message || "Failed to authenticate canteen terminal.");
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
        <Link
          href="/employee/login"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Employee</span>
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00A896] to-[#009B8D] text-white shadow-md shadow-teal-950/40"
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Canteen</span>
        </button>
      </div>

      {/* Main Canteen Login Card */}
      <div className="bjk-glass-dark border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/60 relative backdrop-blur-2xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00A896] mb-1">
            <Coffee className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Canteen Operations
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Meal serving terminal, scanner validation, and dietary ledger
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
              htmlFor="canteen-identifier"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Operator Identifier
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <ScanLine className="w-4 h-4" />
              </div>
              <input
                id="canteen-identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="canteen.operator@bjkhealthcare.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="canteen-password"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              Terminal PIN / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="canteen-password"
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
            id="canteen-login-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-xl shadow-teal-900/30 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authorizing Station...</span>
              </>
            ) : (
              <>
                <span>Launch Canteen Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
