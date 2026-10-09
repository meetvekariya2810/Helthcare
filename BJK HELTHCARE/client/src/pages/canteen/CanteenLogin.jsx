import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Utensils, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ChefHat, 
  Sparkles 
} from 'lucide-react';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const CanteenLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setIdentifier('canteen@bjkhealthcare.com');
    setPassword('BJK@Canteen#2026');
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setError('');
    const cleanId = (identifier || '').trim();
    if (!cleanId || !password) {
      setError('Please enter your Canteen Department email/username and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(cleanId, password);
      if (res.success) {
        // Successful login - redirect to Canteen Dashboard
        navigate('/canteen/dashboard', { replace: true });
      } else {
        setError(res.message || 'Invalid Canteen credentials. Please check your username and password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify server connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00A896]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#8B5CF6]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src={bjkLogo} 
              alt="BJK Healthcare" 
              className="h-12 w-auto object-contain mx-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
            <Utensils className="w-3.5 h-3.5 text-emerald-600" />
            <span>Canteen Department Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            BJK Healthcare
          </h1>
          <p className="text-lg font-bold text-[#00A896] mt-0.5">
            Canteen Management
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Dedicated Operations & Live Dining Intelligence
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-xs leading-relaxed animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Username / Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="canteen-username"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="canteen@bjkhealthcare.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-[#00A896] focus:ring-4 focus:ring-[#00A896]/10 outline-none transition-all font-medium"
                required
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Secure Canteen Pass</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="canteen-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-200 focus:border-[#00A896] focus:ring-4 focus:ring-[#00A896]/10 outline-none transition-all font-medium"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="canteen-signin-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-[#00A896] to-[#028090] hover:from-[#009686] hover:to-[#026c7a] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#00A896]/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Canteen Portal...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper Card */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs font-semibold text-slate-600 hover:text-[#00A896] bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-200 rounded-xl px-4 py-2 flex items-center gap-2 transition-all w-full justify-center"
          >
            <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fill Canteen Credentials (<code className="font-mono text-[11px] text-emerald-700">canteen@bjkhealthcare.com</code>)</span>
          </button>
        </div>

        {/* Security Isolation Notice */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Strictly Isolated Canteen Operational Portal</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} BJK Healthcare Pvt. Ltd. — All rights reserved.
      </div>
    </div>
  );
};

export default CanteenLogin;
