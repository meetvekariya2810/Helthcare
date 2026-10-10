import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { authAPI } from '../../services/api';

// Helper to safely decode JWT token payload without external library
const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch (_) {
    return null;
  }
};
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  LogOut,
  KeyRound
} from 'lucide-react';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';
import { getRoleRedirect } from '../Login';

export const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user: authUser, setUser: setAuthUser, logout: authLogout } = useAuth();
  const { employeeUser, setEmployeeUser, logout: employeeLogout } = useEmployeeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Multi-tier user resolution: Router State -> React Context -> Session/Local Storage -> JWT Token Payload
  const [accountProfile, setAccountProfile] = useState(() => {
    // 1. Router state (passed during login redirect)
    if (location.state?.employee) return location.state.employee;
    if (location.state?.user) return location.state.user;
    if (location.state?.identifier) return { email: location.state.identifier };

    // 2. React contexts
    if (employeeUser) return employeeUser;
    if (authUser) return authUser;

    // 3. Browser storage
    try {
      const savedEmp = sessionStorage.getItem('bjk_employee_user') || localStorage.getItem('bjk_employee_user');
      if (savedEmp) return JSON.parse(savedEmp);
      const savedAuth = sessionStorage.getItem('authUser') || localStorage.getItem('authUser');
      if (savedAuth) return JSON.parse(savedAuth);
    } catch (_) {}

    // 4. JWT token decode
    const token =
      sessionStorage.getItem('bjk_employee_token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      localStorage.getItem('bjk_employee_token') ||
      localStorage.getItem('authToken');
    const decoded = decodeJwtPayload(token);
    if (decoded) {
      return {
        email: decoded.email,
        employeeId: decoded.employeeId || decoded.empId,
        name: decoded.name,
        role: decoded.role,
        department: decoded.department
      };
    }
    return null;
  });

  // Verify and fetch profile on mount if token is available
  useEffect(() => {
    let isMounted = true;
    const fetchCurrentProfile = async () => {
      const token =
        sessionStorage.getItem('bjk_employee_token') ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('bjk_token') ||
        sessionStorage.getItem('bjk_auth_token') ||
        localStorage.getItem('bjk_employee_token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('bjk_token');

      if (!token) return;

      try {
        const empRes = await fetch('/api/employee/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (empRes.ok) {
          const data = await empRes.json();
          if (data?.success && data.employee && isMounted) {
            setAccountProfile(data.employee);
            return;
          }
        }
      } catch (_) {}

      try {
        const authRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (authRes.ok) {
          const data = await authRes.json();
          if (data?.success && (data.user || data.data) && isMounted) {
            setAccountProfile(data.user || data.data);
          }
        }
      } catch (_) {}
    };

    fetchCurrentProfile();
    return () => { isMounted = false; };
  }, []);

  const activeUser = accountProfile || employeeUser || authUser;

  const displayIdentifier = (() => {
    if (!activeUser) return 'Authorized Employee';
    const email = activeUser.workEmail || activeUser.email || '';
    const empId = activeUser.employeeId || activeUser.employeeCode || '';
    const name = activeUser.fullName || activeUser.name || '';

    if (email && empId) return `${email} (${empId})`;
    if (email) return email;
    if (name && empId) return `${name} (${empId})`;
    if (empId) return empId;
    if (name) return name;
    return 'Authorized Employee';
  })();

  // Strict Password Policy Checks (Section 4)
  const hasMinLen = newPassword.length >= 12;
  const hasMaxLen = newPassword.length <= 128;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const differsFromTemp = newPassword !== 'Password123!';
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Strength score calculation (0 to 100)
  const calculateStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 12) score += 30;
    else score += Math.floor((newPassword.length / 12) * 20);
    if (hasUpper) score += 15;
    if (hasLower) score += 15;
    if (hasNumber) score += 20;
    if (hasSpecial) score += 20;
    return Math.min(100, score);
  };

  const strength = calculateStrength();
  const getStrengthLabel = () => {
    if (strength === 0) return { label: 'Empty', color: 'bg-slate-700', text: 'text-slate-400' };
    if (strength < 50) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (strength < 80) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' };
    if (strength < 100) return { label: 'Good', color: 'bg-teal-500', text: 'text-teal-400' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const isFormValid =
    hasMinLen &&
    hasMaxLen &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial &&
    differsFromTemp &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError('');
    setSuccess('');

    if (!hasMinLen) {
      setError('Password must be at least 12 characters long.');
      return;
    }
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError('Password must contain uppercase, lowercase, a number, and a special character.');
      return;
    }
    if (newPassword === 'Password123!') {
      setError('New password must differ from the temporary password.');
      return;
    }
    if (oldPassword && oldPassword === newPassword) {
      setError('New password must not be identical to current or temporary password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use standard authenticated endpoint POST /api/auth/change-password
      const res = await authAPI.changePassword({
        oldPassword,
        newPassword,
        confirmPassword
      });

      if (res.data && res.data.success) {
        setSuccess('Your permanent password has been set successfully.');

        // Update session storage and react state
        const updatedUser = res.data.user || res.data.employee || {
          ...(activeUser || {}),
          firstLogin: false,
          isFirstLogin: false,
          mustChangePassword: false,
          temporaryPassword: false
        };

        updatedUser.mustChangePassword = false;
        updatedUser.firstLogin = false;

        if (setAuthUser) setAuthUser(updatedUser);
        if (setEmployeeUser) setEmployeeUser(updatedUser);

        sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
        sessionStorage.setItem('bjk_employee_user', JSON.stringify(updatedUser));
        localStorage.setItem('authUser', JSON.stringify(updatedUser));
        localStorage.setItem('bjk_employee_user', JSON.stringify(updatedUser));

        if (res.data.token) {
          sessionStorage.setItem('authToken', res.data.token);
          sessionStorage.setItem('bjk_token', res.data.token);
          sessionStorage.setItem('bjk_auth_token', res.data.token);
          sessionStorage.setItem('bjk_employee_token', res.data.token);
          localStorage.setItem('authToken', res.data.token);
          localStorage.setItem('bjk_token', res.data.token);
          localStorage.setItem('bjk_auth_token', res.data.token);
          localStorage.setItem('bjk_employee_token', res.data.token);
        }

        setTimeout(() => {
          const role = updatedUser.role || activeUser?.role || 'EMPLOYEE';
          if (['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(role)) {
            navigate('/employee/dashboard', { replace: true });
          } else {
            const targetRoute = getRoleRedirect(role, updatedUser.dashboard);
            navigate(targetRoute, { replace: true });
          }
        }, 1200);
      } else {
        setError(res.data?.message || 'Failed to update password. Please check your credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.normalizedMessage ||
        'An error occurred while updating your password. Please verify current credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (employeeLogout) await employeeLogout();
      else if (authLogout) authLogout();
      else {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (_) {
      window.location.href = '/login';
    }
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="min-h-screen bg-[#070D18] bg-gradient-to-br from-[#060B14] via-[#0B1528] to-[#040810] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none font-sans">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#00A896]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-[#00B4D8]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[500px] bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-teal-500/40 p-6 sm:p-8 z-10 text-white">
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
            Create Your Permanent Password
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            For your account security, please change your temporary password before continuing.
          </p>

          {/* Registered Employee Account Badge */}
          <div className="mt-3.5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
            <User size={13} className="text-[#00A896]" />
            <span className="font-semibold text-slate-400">Account:</span>
            <span className="font-mono text-white font-medium">{displayIdentifier}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start space-x-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] font-medium leading-relaxed">{success}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Current / Temporary Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Current / Temporary Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current or temporary password"
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showOldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New Permanent Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              New Permanent Password
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 12 characters"
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Password Strength Guidance Bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={`font-bold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthInfo.color}`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00A896]/30 focus:border-[#00A896] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-[10px] space-y-1.5 text-slate-400">
            <p className="font-bold text-slate-300">Password Requirements:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className={`flex items-center space-x-1.5 ${hasMinLen ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasMinLen ? '✓' : '○'}</span>
                <span>12+ Characters</span>
              </span>
              <span className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasUpper ? '✓' : '○'}</span>
                <span>Uppercase Letter</span>
              </span>
              <span className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasLower ? '✓' : '○'}</span>
                <span>Lowercase Letter</span>
              </span>
              <span className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasNumber ? '✓' : '○'}</span>
                <span>Number (0-9)</span>
              </span>
              <span className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{hasSpecial ? '✓' : '○'}</span>
                <span>Special Char (!@#$)</span>
              </span>
              <span className={`flex items-center space-x-1.5 ${differsFromTemp ? 'text-emerald-400 font-semibold' : 'text-rose-400'}`}>
                <span>{differsFromTemp ? '✓' : '✕'}</span>
                <span>Not Temporary Password</span>
              </span>
              <span className={`flex items-center space-x-1.5 col-span-2 ${passwordsMatch ? 'text-emerald-400 font-semibold' : ''}`}>
                <span>{passwordsMatch ? '✓' : '○'}</span>
                <span>Passwords Match</span>
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="w-full mt-2 py-3 px-4 bg-[#00A896] hover:bg-[#009B8D] text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-[#00A896]/25 hover:shadow-[#00A896]/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Saving New Password...</span>
              </>
            ) : (
              <>
                <span>Change Password</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Safe Logout Option */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out & Return to Login</span>
          </button>
          <span className="text-[10px] text-slate-500">BJK Identity Guard</span>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
