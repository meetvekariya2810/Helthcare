import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Mail,
  Building2,
  KeyRound
} from 'lucide-react';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const EmployeeLogin = () => {
  const navigate = useNavigate();
  const { login, forgotPassword, resetPassword, setEmployeeSession } = useEmployeeAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNonEmployeeWarning, setIsNonEmployeeWarning] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: request, 2: reset
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide Employee ID / Corporate Email and Password.');
      return;
    }

    setLoading(true);
    setError('');
    setIsNonEmployeeWarning(false);

    try {
      const res = await login({
        loginIdentifier: identifier.trim(),
        password,
        rememberMe
      });

      if (res.success) {
        navigate('/employee/dashboard', { replace: true });
      } else {
        if (
          res.isNonEmployee ||
          (res.message && res.message.toLowerCase().includes('appropriate portal'))
        ) {
          setIsNonEmployeeWarning(true);
          setError('Please use the appropriate portal for your account.');
        } else {
          setError(res.message || 'Invalid credentials. Please verify your employee credentials.');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Authentication service error.';
      if (msg.toLowerCase().includes('appropriate portal')) {
        setIsNonEmployeeWarning(true);
        setError('Please use the appropriate portal for your account.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your Employee ID or Corporate Email.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMessage('');
    try {
      const res = await forgotPassword(forgotIdentifier.trim());
      if (res.success) {
        setForgotMessage(res.message || 'A verification code has been dispatched to your registered address.');
        setForgotStep(2);
      } else {
        setForgotError(res.message || 'Failed to dispatch reset code.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Error communicating with credential recovery.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = async (e) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword) {
      setForgotError('Please provide the reset code and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await resetPassword({
        identifier: forgotIdentifier.trim(),
        code: resetCode.trim(),
        newPassword
      });
      if (res.success) {
        setForgotMessage('Password reset successfully! You may now sign in.');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotMessage('');
          setPassword('');
        }, 1500);
      } else {
        setForgotError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Reset transaction failed.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-teal-50/40 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#00A896]/20">
      {/* Top Brand Bar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img src="/bjk_logo.png" alt="BJK Healthcare" className="h-12 w-auto object-contain" />
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight">BJK HEALTHCARE</span>
            <span className="text-[10px] text-[#00A896] font-bold tracking-widest uppercase">
              Digital Brain & Enterprise HRMS
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all"
        >
          Executive & Admin Portal &rarr;
        </Link>
      </header>

      {/* Main Authentication Card */}
      <main className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00A896] via-[#00B4D8] to-[#7B2CBF]" />

          {/* Title Header */}
          <div className="text-center mb-6 pt-2">
            <span className="text-[11px] font-bold text-[#00A896] uppercase tracking-widest block mb-1">
              BJK HEALTHCARE
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              EMPLOYEE PORTAL
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access your self-service dashboard, attendance & leave ledger
            </p>
          </div>

          {/* Feedback & Non-Employee Alerts */}
          {error && (
            <div
              className={`rounded-2xl p-4 mb-5 text-xs font-semibold border flex flex-col gap-2 animate-in fade-in ${
                isNonEmployeeWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {isNonEmployeeWarning && (
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800">
                    Director, Admin & Executive accounts must use the main portal.
                  </span>
                  <Link
                    to="/login"
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors shrink-0"
                  >
                    Go to Admin Sign In
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee ID / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Employee ID / Corporate Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. BJK-EMP-003 or name@bjkhealthcare.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50/70 border border-slate-200 focus:border-[#00A896] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#00A896]/10 text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your enterprise password"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50/70 border border-slate-200 focus:border-[#00A896] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#00A896]/10 text-xs font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00A896] focus:ring-[#00A896] cursor-pointer"
                />
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotError('');
                  setForgotMessage('');
                  setForgotStep(1);
                  setForgotIdentifier(identifier);
                }}
                className="text-xs font-bold text-[#00A896] hover:text-[#009B8D] hover:underline transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-[#00A896] hover:bg-[#009B8D] text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Secure Employee Access Badge */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#00A896] shrink-0" />
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-700 block">Secure Employee Access</span>
              <span className="text-[10px] text-slate-400 block">
                Your account is protected by enterprise authentication.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-3 text-center text-xs text-slate-400">
        <p>© 2026 BJK Healthcare Private Limited • Corporate Employee Self-Service</p>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-teal-50 text-[#00A896] flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Credential Recovery</h3>
                <p className="text-xs text-slate-500">Reset your employee portal password</p>
              </div>
            </div>

            {forgotError && (
              <div className="rounded-xl p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold mb-3">
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold mb-3">
                {forgotMessage}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Employee ID or Work Email
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. BJK-EMP-003 or name@bjkhealthcare.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold transition-all disabled:opacity-60"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Recovery Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 6-digit verification code"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#00A896]"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold transition-all disabled:opacity-60"
                  >
                    {forgotLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLogin;
