import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';
import { getRoleRedirect } from '../Login';

export const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  // Password Policy Checks
  const hasMinLen = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid = hasMinLen && hasUpper && hasLower && hasNumber && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setSuccess('');

    if (!hasMinLen) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (!hasUpper || !hasLower || !hasNumber) {
      setError('New password must include uppercase, lowercase, and a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (oldPassword && oldPassword === newPassword) {
      setError('New password must not be identical to current/temporary password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authAPI.changePassword({ oldPassword, newPassword });
      if (res.data && res.data.success) {
        setSuccess('Password changed successfully! Redirecting to your dashboard...');
        
        // Update user session state to mark firstLogin = false
        const updatedUser = res.data.user || {
          ...user,
          firstLogin: false,
          isFirstLogin: false,
          mustChangePassword: false,
          temporaryPassword: false
        };

        if (setUser) setUser(updatedUser);
        sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        if (res.data.token) {
          sessionStorage.setItem('authToken', res.data.token);
          sessionStorage.setItem('bjk_token', res.data.token);
          sessionStorage.setItem('bjk_auth_token', res.data.token);
          localStorage.setItem('authToken', res.data.token);
          localStorage.setItem('bjk_token', res.data.token);
          localStorage.setItem('bjk_auth_token', res.data.token);
        }

        setTimeout(() => {
          const targetRoute = getRoleRedirect(updatedUser.role, updatedUser.dashboard);
          navigate(targetRoute, { replace: true });
        }, 1200);
      } else {
        setError(res.data?.message || 'Failed to update password. Please check your credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.normalizedMessage ||
        'An error occurred while updating your password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] bg-gradient-to-br from-[#060B14] via-[#0B1528] to-[#040810] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#00A896]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#8338EC]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-teal-500/40 p-6 sm:p-8 z-10 text-white">
        
        {/* Logo Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img
              src={bjkLogo}
              alt="BJK Healthcare"
              className="w-[160px] h-auto max-h-14 object-contain"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/bjk-healthcare-logo.svg') {
                  e.currentTarget.src = '/bjk-healthcare-logo.svg';
                }
              }}
            />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} />
            <span>Security Action Required</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            Change Temporary Password
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            First-time login detected. Please create a secure permanent password to activate your BJK Healthcare account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start space-x-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] font-medium leading-relaxed">{success}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Current / Temporary Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter temporary password received"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              New Permanent Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896] transition-all"
              />
            </div>
          </div>

          {/* Password Policy Tracker */}
          <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800 text-[10px] space-y-1 text-slate-400">
            <p className="font-bold text-slate-300 mb-1">Password Requirements:</p>
            <div className="grid grid-cols-2 gap-1">
              <span className={`flex items-center space-x-1 ${hasMinLen ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasMinLen ? '✓' : '○'}</span>
                <span>8+ Characters</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasUpper ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasUpper ? '✓' : '○'}</span>
                <span>1 Uppercase Letter</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasLower ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasLower ? '✓' : '○'}</span>
                <span>1 Lowercase Letter</span>
              </span>
              <span className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasNumber ? '✓' : '○'}</span>
                <span>1 Number</span>
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full mt-3 py-3 px-4 bg-[#00A896] hover:bg-[#009B8D] text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-[#00A896]/25 hover:shadow-[#00A896]/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Activating Account...</span>
              </>
            ) : (
              <>
                <span>Save New Password & Continue</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-slate-500">
          BJK Healthcare Digital Brain &#8226; Enterprise Identity Management
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordPage;
