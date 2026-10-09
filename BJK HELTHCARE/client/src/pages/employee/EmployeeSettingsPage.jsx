import React, { useState, useEffect } from 'react';
import {
  Shield,
  Key,
  Lock,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeSettingsAPI } from '../../services/employeeApi';

export const EmployeeSettingsPage = () => {
  const { employeeUser, logout } = useEmployeeAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loginHistory, setLoginHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadLoginHistory = async () => {
    try {
      const res = await employeeSettingsAPI.getLoginHistory();
      if (res.data?.success) {
        setLoginHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('[Load Login History Error]:', err);
    }
  };

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await employeeSettingsAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (res.data?.success) {
        setMessage('Password updated successfully.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    try {
      const res = await employeeSettingsAPI.logoutOtherDevices();
      if (res.data?.success) {
        setMessage(res.data.message);
        loadLoginHistory();
      }
    } catch (err) {
      setErrorMessage('Failed to logout other devices.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Account Security & Preferences</h1>
        <p className="text-xs text-slate-500">Manage credentials, session authentication, and security audit log</p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Change Password Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Key className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Change Portal Password</h2>
              <p className="text-[11px] text-slate-500">Regularly updating your password safeguards workplace records</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Section 2: Account Security Summary & Active Sessions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-teal-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Security Sessions</h2>
              <p className="text-[11px] text-slate-500">Device logins and single sign-on integrity</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5 text-teal-600" />
                <div>
                  <h4 className="font-bold text-slate-800">Current Session</h4>
                  <p className="text-[11px] text-slate-500">Web Portal • Chrome / Windows</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                ACTIVE NOW
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-bold text-slate-800">Other Registered Devices</h4>
                  <p className="text-[11px] text-slate-500">Biometric Cleanroom Kiosks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogoutOtherDevices}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
              >
                Log Out Others
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Employee Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Recent Login Activity</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Device & Browser</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loginHistory.map((h, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{new Date(h.loginTime).toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{h.ipAddress || '127.0.0.1'}</td>
                  <td className="py-3 px-4 text-slate-600">{h.device || 'Desktop'} ({h.browser || 'Chrome'})</td>
                  <td className="py-3 px-4 text-slate-600">{h.location || 'Ahmedabad Plant'}</td>
                  <td className="py-3 px-4 font-bold text-teal-700">{h.loginMethod || 'PASSWORD'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'LOGGED_OUT'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
