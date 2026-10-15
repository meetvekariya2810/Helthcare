"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Strength validation
  const hasMinLength = newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isStrong = hasMinLength && hasUpperCase && hasLowerCase && hasDigit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!hasMinLength) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("bjk_token") ||
            localStorage.getItem("bjk_employee_token")
          : "";

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update password.");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("[Change Password Error]:", err);
      setError(err.message || "Failed to update credentials in security registry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bjk-glass-dark border border-teal-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00A896]">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Password Updated</h2>
          <p className="text-xs text-slate-300">
            Your credentials have been securely hashed and synced across PostgreSQL
            and MySQL 8.0 relational tables.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-lg shadow-teal-900/30 transition-all"
        >
          <span>Sign In With New Password</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bjk-glass-dark border border-slate-700/60 rounded-3xl p-8 shadow-2xl shadow-black/60 relative backdrop-blur-2xl">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#00A896] mb-1">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Update Security Password
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Set a secure 256-bit compliant password for your account
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Current / Temporary Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full pl-10 pr-11 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <input
              type={showNew ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-11 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896] focus:border-transparent transition-all"
          />
        </div>

        {/* Password Strength Checklist */}
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 text-slate-400">
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                hasMinLength ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-600"
              }`}
            >
              <Check className="w-2.5 h-2.5" />
            </span>
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                hasUpperCase && hasLowerCase ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-600"
              }`}
            >
              <Check className="w-2.5 h-2.5" />
            </span>
            <span>Uppercase and lowercase letters</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                hasDigit ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-600"
              }`}
            >
              <Check className="w-2.5 h-2.5" />
            </span>
            <span>At least one number</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#00A896] to-[#009B8D] hover:from-[#009B8D] hover:to-[#02C39A] shadow-xl shadow-teal-900/30 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Credentials...</span>
            </>
          ) : (
            <>
              <span>Save & Activate Password</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
