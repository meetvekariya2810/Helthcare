import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle2,
  Eye,
  EyeOff,
  X,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import bjkLogoOfficial from '../assets/bjk-logo-official.png';
import bjkLoginBg from '../assets/bjk-login-bg.jpg';
import bjkLogoSvg from '../assets/bjk-healthcare-logo.svg';

// Role and department specific navigation routing
export const getRoleRedirect = (userOrRole, customDashboard, optionalDept) => {
  let role = '';
  let dept = '';
  let target = customDashboard;

  if (typeof userOrRole === 'object' && userOrRole !== null) {
    role = (userOrRole.role || '').toUpperCase().trim();
    dept = (userOrRole.department || '').toLowerCase().trim();
    target = userOrRole.dashboard || customDashboard;
  } else {
    role = (userOrRole || '').toUpperCase().trim();
    dept = (optionalDept || '').toLowerCase().trim();
  }

  if (target && target !== '/employee' && target !== '/employee/dashboard' && target !== '/admin') {
    return target;
  }

  if (role === 'EMPLOYEE' || role === 'SENIOR_EMPLOYEE') return '/employee/dashboard';
  if (role === 'CANTEEN_ADMIN') return '/canteen/dashboard';
  if (role === 'SUPER_ADMIN' || role === 'DIRECTOR') return '/dashboard/hr';
  if (['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR', 'RECRUITER', 'PAYROLL_ADMIN'].includes(role) || dept.includes('human resource')) {
    return '/dashboard/hr';
  }
  if (role === 'PRODUCTION_MANAGER' || dept.includes('production') || dept.includes('manufacturing')) {
    return '/dashboard/production';
  }
  if (dept.includes('micro') || dept.includes('microbiology')) {
    return '/dashboard/microbiology';
  }
  if (role === 'QC_MANAGER' || dept.includes('quality control') || dept === 'qc') {
    return '/dashboard/quality-control';
  }
  if (role === 'QA_MANAGER' || dept.includes('quality assurance') || dept === 'qa') {
    return '/dashboard/quality-assurance';
  }
  if (role === 'WAREHOUSE_MANAGER' || role === 'SUPPLY_CHAIN_MANAGER' || dept.includes('warehouse') || dept.includes('inventory') || dept.includes('logistics')) {
    return '/dashboard/warehouse';
  }
  if (dept.includes('engineering') || dept.includes('maintenance')) {
    return '/dashboard/engineering';
  }
  if (role === 'FINANCE_MANAGER' || role === 'FINANCE' || dept.includes('account') || dept.includes('finance')) {
    return '/dashboard/finance';
  }
  if (dept.includes('purchase') || dept.includes('procurement')) {
    return '/dashboard/procurement';
  }
  if (role === 'REGULATORY_MANAGER' || role === 'REGULATORY_VIEWER' || dept.includes('regulatory')) {
    return '/dashboard/regulatory';
  }
  if (role === 'SALES_MANAGER' || role === 'CRM_MANAGER' || role === 'EXPORT_MANAGER' || dept.includes('sales') || dept.includes('commercial') || dept.includes('crm') || dept.includes('export') || dept.includes('marketing')) {
    return '/dashboard/sales';
  }
  if (role === 'ADMIN' || dept.includes('admin') || dept.includes('facility') || dept.includes('facilities')) {
    return '/dashboard/facilities';
  }
  if (role === 'AUDITOR') return '/audit-logs';
  if (role === 'DOCUMENT_CONTROLLER') return '/documents';

  return '/dashboard';
};

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Force Password Change state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState('');

  const { login, user } = useAuth();
  const { setEmployeeSession } = useEmployeeAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setInfoNotice('');
    setIsSubmitting(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        // Sync employee tokens for seamless portal integration
        if (['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(res.user?.role)) {
          const token =
            res.token ||
            sessionStorage.getItem('authToken') ||
            sessionStorage.getItem('bjk_token') ||
            localStorage.getItem('authToken') ||
            localStorage.getItem('bjk_token');
          const cleanEmpId = res.user.employeeId || identifier.trim().toUpperCase();
          const empData = {
            id: res.user.id || res.user._id,
            employeeId: cleanEmpId,
            employeeCode: cleanEmpId,
            name: res.user.name,
            fullName: res.user.name,
            email: res.user.workEmail || res.user.email,
            department: res.user.department,
            role: res.user.role,
            designation: res.user.designation || ''
          };
          if (token) sessionStorage.setItem('bjk_employee_token', token);
          sessionStorage.setItem('bjk_employee_user', JSON.stringify(empData));
          if (setEmployeeSession) {
            setEmployeeSession(empData, token);
          }
        }

        if (res.user?.mustChangePassword || res.mustChangePassword) {
          navigate('/employee/change-password', {
            replace: true,
            state: { user: res.user, identifier: identifier.trim() }
          });
        } else {
          const targetRoute = getRoleRedirect(res.user?.role, res.user?.dashboard || res.dashboard);
          navigate(targetRoute, { replace: true });
        }
      } else {
        setError(res.message || 'Invalid Work Email, Employee ID, or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordChangeError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Passwords do not match.');
      return;
    }

    setPasswordChangeLoading(true);
    setPasswordChangeError('');

    try {
      const token = localStorage.getItem('bjk_auth_token') || localStorage.getItem('authToken');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword: password, newPassword })
      });

      const data = await response.json();
      if (data.success) {
        setShowPasswordChangeModal(false);
        const targetRoute = getRoleRedirect(user?.role, user?.dashboard);
        navigate(targetRoute, { replace: true });
      } else {
        setPasswordChangeError(data.message || 'Failed to update password.');
      }
    } catch (err) {
      setPasswordChangeError('Failed to communicate with server.');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSubmitting(true);
    setTimeout(() => {
      setForgotSubmitting(false);
      setForgotSuccess(true);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4FBFE] overflow-x-hidden select-none font-sans">
      
      {/* ========================================================================= */}
      {/* LEFT PANEL: BRAND PRESENTATION (Desktop: ~54% width)                      */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[54%] min-h-[560px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white overflow-hidden bg-[#003B46]">
        
        {/* Authentic Pharmaceutical Background Render */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
          style={{ backgroundImage: `url(${bjkLoginBg})` }}
        />

        {/* Ambient Deep Teal / Cyan Gradient Overlays matching Image 1 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#003B46]/70 via-[#004D59]/55 to-[#00262E]/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00333C]/80 via-transparent to-[#00232B]/60" />

        {/* Glowing Luminous Accents */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#00DDEB]/15 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00BFAF]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Space */}
        <div className="relative z-10" />

        {/* Center: Main Branding Block */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto py-4 lg:py-6 max-w-2xl mx-auto w-full">
          {/* Official BJK Logo Badge */}
          <div className="relative mb-3 group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#00DDEB] to-[#00BFAF] rounded-full blur-md opacity-35 group-hover:opacity-60 transition duration-500" />
            <img
              src={bjkLogoOfficial}
              alt="BJK Healthcare"
              className="relative w-24 sm:w-28 lg:w-32 h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
              onError={(e) => {
                e.currentTarget.src = bjkLogoSvg;
              }}
            />
          </div>

          {/* Company Name */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-white uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            BJK HEALTHCARE
          </h1>

          {/* Primary Tagline */}
          <p className="text-xs sm:text-sm lg:text-[13px] font-extrabold text-[#00DDEB] uppercase tracking-[0.25em] mt-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            DIGITAL BRAIN &#8226; WORKFORCE INTELLIGENCE
          </p>

          {/* Supporting Statement */}
          <p className="text-xs sm:text-sm text-cyan-50/95 font-medium italic mt-2.5 max-w-lg leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            &ldquo;Intelligent Workforce Management for Healthcare &amp; Pharmaceutical Operations&rdquo;
          </p>

          {/* Four Feature Indicators in a Horizontal Row */}
          <div className="w-full mt-8 sm:mt-10 pt-6 border-t border-cyan-300/25 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-1">
            
            {/* Feature 1: People */}
            <div className="flex flex-col items-center text-center sm:border-r border-cyan-200/20 px-2 group">
              <div className="w-12 h-12 rounded-full border border-[#00DDEB]/70 bg-[#003B46]/60 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg shadow-cyan-950/40 group-hover:scale-110 group-hover:border-[#00DDEB] group-hover:bg-[#00DDEB]/20 transition-all duration-300">
                <Users size={20} className="text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">People</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-100/80 mt-0.5">Empowering Teams</span>
            </div>

            {/* Feature 2: Process */}
            <div className="flex flex-col items-center text-center sm:border-r border-cyan-200/20 px-2 group">
              <div className="w-12 h-12 rounded-full border border-[#00DDEB]/70 bg-[#003B46]/60 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg shadow-cyan-950/40 group-hover:scale-110 group-hover:border-[#00DDEB] group-hover:bg-[#00DDEB]/20 transition-all duration-300">
                <Settings size={20} className="text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Process</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-100/80 mt-0.5">Streamlined Operations</span>
            </div>

            {/* Feature 3: Quality */}
            <div className="flex flex-col items-center text-center sm:border-r border-cyan-200/20 px-2 group">
              <div className="w-12 h-12 rounded-full border border-[#00DDEB]/70 bg-[#003B46]/60 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg shadow-cyan-950/40 group-hover:scale-110 group-hover:border-[#00DDEB] group-hover:bg-[#00DDEB]/20 transition-all duration-300">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Quality</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-100/80 mt-0.5">Ensuring Compliance</span>
            </div>

            {/* Feature 4: Growth */}
            <div className="flex flex-col items-center text-center px-2 group">
              <div className="w-12 h-12 rounded-full border border-[#00DDEB]/70 bg-[#003B46]/60 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-lg shadow-cyan-950/40 group-hover:scale-110 group-hover:border-[#00DDEB] group-hover:bg-[#00DDEB]/20 transition-all duration-300">
                <BarChart3 size={20} className="text-white" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Growth</span>
              <span className="text-[10px] sm:text-[11px] text-cyan-100/80 mt-0.5">Driving Better Healthcare</span>
            </div>

          </div>
        </div>

        {/* Bottom Slogan in Script Font over Pharmaceutical Foreground */}
        <div className="relative z-10 text-left pt-3">
          <div className="inline-block relative">
            <p className="font-['Dancing_Script',cursive] text-2xl sm:text-3xl lg:text-[34px] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] leading-tight">
              Better Healthcare <br />
              <span className="pl-4 sm:pl-6 text-cyan-100">for a Healthier Tomorrow</span>
            </p>
            {/* Elegant curved cyan line flourish */}
            <svg
              className="absolute -bottom-2 left-4 w-44 sm:w-56 h-3 text-[#00DDEB]/80"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 9C50 2 150 1 198 9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Curved Organic Wave Overlay for Desktop Transition */}
        <div className="hidden lg:block absolute -right-[1px] top-0 bottom-0 w-28 pointer-events-none z-20">
          <svg
            className="h-full w-full text-[#F4FBFE]"
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C65,220 15,620 100,1000 L100,0 Z" />
          </svg>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: WHITE LOGIN EXPERIENCE (Desktop: ~46% width)                 */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-[46%] min-h-[600px] lg:min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-[#F4FBFE]">
        
        {/* Subtle Decorative Hexagonal Molecular Lattice on Right Edge */}
        <div className="absolute right-0 top-1/4 w-48 h-96 pointer-events-none opacity-20 hidden sm:block">
          <svg viewBox="0 0 200 400" className="w-full h-full text-[#00B4D8]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="100,30 140,55 140,95 100,120 60,95 60,55" />
            <polygon points="140,95 180,120 180,160 140,185 100,160 100,120" />
            <polygon points="100,160 140,185 140,225 100,250 60,225 60,185" />
            <polygon points="140,225 180,250 180,290 140,315 100,290 100,250" />
            <circle cx="100" cy="30" r="4" fill="currentColor" />
            <circle cx="140" cy="55" r="4" fill="currentColor" />
            <circle cx="140" cy="95" r="4" fill="currentColor" />
            <circle cx="180" cy="120" r="4" fill="currentColor" />
            <circle cx="100" cy="160" r="4" fill="currentColor" />
            <circle cx="140" cy="225" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Centered White Login Card with Soft Cyan Shadow */}
        <div className="relative z-10 w-full max-w-[500px] bg-white rounded-[24px] shadow-[0_20px_50px_-10px_rgba(0,180,216,0.14),0_10px_30px_-10px_rgba(16,30,80,0.06)] border border-[#E2ECF6] p-7 sm:p-10">
          
          {/* Card Header — Logo & Identity */}
          <div className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <img
                src={bjkLogoOfficial}
                alt="BJK Healthcare"
                className="w-16 sm:w-20 h-auto object-contain drop-shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = bjkLogoSvg;
                }}
              />
            </div>
            
            <h2 className="text-lg sm:text-xl font-black text-[#101E50] tracking-tight uppercase">
              BJK HEALTHCARE
            </h2>
            
            <p className="text-[10px] sm:text-[11px] font-extrabold text-[#00B8AD] uppercase tracking-[0.2em] mt-0.5">
              DIGITAL BRAIN &#8226; WORKFORCE INTELLIGENCE
            </p>
            
            <p className="text-[10.5px] sm:text-[11px] text-[#53658B] font-medium italic mt-1 max-w-sm mx-auto leading-relaxed">
              Intelligent Workforce Management for Healthcare &amp; Pharmaceutical Operations
            </p>

            {/* Short Teal Divider */}
            <div className="w-12 h-[2.5px] bg-[#00B8AD] mx-auto my-3 rounded-full" />
          </div>

          {/* Login Card Heading */}
          <div className="text-center mb-6">
            <h3 className="text-2xl sm:text-3xl font-black text-[#101E50] tracking-tight">
              Welcome Back
            </h3>
            <p className="text-xs sm:text-sm text-[#53658B] mt-1 font-medium">
              Sign in to access BJK Digital Brain
            </p>
          </div>

          {/* Alerts / Error UI */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle size={17} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-[11.5px] font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {infoNotice && (
            <div className="mb-4 p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-800 flex items-start space-x-2.5 animate-in fade-in duration-200">
              <Info size={17} className="text-[#00B8AD] flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-[11.5px] font-medium leading-relaxed">{infoNotice}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Input 1: Work Email / Employee ID */}
            <div>
              <label className="block text-[11px] font-bold text-[#101E50] uppercase tracking-wider mb-1.5">
                WORK EMAIL / EMPLOYEE ID
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF]" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your work email or employee ID"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#D7E2F1] rounded-xl text-xs sm:text-sm text-[#101E50] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00B8AD]/25 focus:border-[#00B8AD] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Input 2: Password */}
            <div>
              <label className="block text-[11px] font-bold text-[#101E50] uppercase tracking-wider mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#D7E2F1] rounded-xl text-xs sm:text-sm text-[#101E50] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#00B8AD]/25 focus:border-[#00B8AD] transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA3BF] hover:text-[#101E50] transition-colors p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Controls: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-[#53658B] hover:text-[#101E50] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D7E2F1] text-[#00B8AD] focus:ring-[#00B8AD] focus:ring-offset-0 cursor-pointer accent-[#00B8AD]"
                />
                <span className="text-xs font-medium text-[#53658B]">Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier(identifier);
                  setForgotSuccess(false);
                  setShowForgotModal(true);
                }}
                className="text-xs font-semibold text-[#00B8AD] hover:text-[#009B98] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary Login Button matching Image 1 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-5 bg-gradient-to-r from-[#08C6BA] to-[#009C9A] hover:from-[#07b5aa] hover:to-[#008f8d] text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-[#00B8AD]/25 hover:shadow-[#00B8AD]/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Digital Brain</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Security Footer */}
          <div className="mt-6 pt-4 border-t border-[#EDF2F7] text-center text-xs text-[#64748B] flex items-center justify-center space-x-1.5 font-medium">
            <ShieldCheck size={16} className="text-[#00B8AD]" />
            <span>256-bit Encrypted Session &#8226; Secure &amp; Compliant</span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL                                                     */}
      {/* ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-[#101E50]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D7E2F1] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-[#8FA3BF] hover:text-[#101E50]"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-cyan-50 rounded-2xl border border-cyan-100 text-[#00B8AD]">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101E50]">Reset Account Password</h3>
                <p className="text-xs text-[#53658B]">Secure enterprise identity recovery</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2.5">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-900">Recovery Instructions Dispatched</p>
                    <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                      If an active account matches this identifier, password recovery instructions have been sent to your registered work email.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 bg-[#101E50] hover:bg-[#0D1840] text-white rounded-xl text-xs font-semibold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#101E50] mb-1">
                    Work Email or Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. hr.manager@bjkhealthcare.com or BH1046"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#D7E2F1] rounded-xl text-xs text-[#101E50] placeholder-[#94A3B8] focus:outline-none focus:border-[#00B8AD]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#08C6BA] to-[#009C9A] text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {forgotSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <span>Dispatch Recovery Link</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIRST LOGIN PASSWORD CHANGE MODAL                                         */}
      {/* ========================================================================= */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 bg-[#101E50]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-teal-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100 text-[#00B8AD]">
                <Lock size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#101E50]">First Login Password Setup</h3>
                <p className="text-xs text-[#53658B]">Set your personal permanent password to activate account</p>
              </div>
            </div>

            {passwordChangeError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{passwordChangeError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#101E50] mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new permanent password"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D7E2F1] rounded-xl text-xs text-[#101E50] placeholder-[#94A3B8] focus:outline-none focus:border-[#00B8AD]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#101E50] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new permanent password"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D7E2F1] rounded-xl text-xs text-[#101E50] placeholder-[#94A3B8] focus:outline-none focus:border-[#00B8AD]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordChangeLoading}
                  className="w-full py-3 bg-gradient-to-r from-[#08C6BA] to-[#009C9A] text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {passwordChangeLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Activate Account &amp; Continue</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;


