import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX, AlertTriangle, CheckCircle2, ShieldAlert, LogOut, ArrowRight, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HROffboarding = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [offboardingReason, setOffboardingReason] = useState('RESIGNED');
  const [remarks, setRemarks] = useState('');
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [assetsReturned, setAssetsReturned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const token =
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    sessionStorage.getItem('bjk_auth_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    localStorage.getItem('bjk_auth_token') ||
    localStorage.getItem('token') ||
    '';

  useEffect(() => {
    fetch('/api/hr/employees?active=true&limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setEmployees(data.employees || []);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      setError('Please select an employee to offboard.');
      return;
    }

    if (!window.confirm('Are you sure you want to proceed with employee offboarding? This will deactivate the login account and revoke active sessions.')) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/hr/employees/${selectedEmployeeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: offboardingReason,
          employmentStatus: offboardingReason,
          lastWorkingDate,
          remarks: `Offboarding: ${remarks || 'Standard offboarding completed.'} Handover: ${handoverComplete ? 'Done' : 'Pending'}. Assets: ${assetsReturned ? 'Returned' : 'Pending'}.`
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Failed to process offboarding.');
      }
    } catch (err) {
      setError('Network error processing offboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-600">
            <UserX size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Employee Offboarding & Account Deactivation</h1>
            <p className="text-xs text-slate-500">
              Gracefully offboard employees, deactivate accounts, revoke active sessions, and preserve historical audit records.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center space-x-2">
          <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Offboarding Completed Successfully</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Employee account has been deactivated, active sessions revoked, and immutable audit logs generated. Historical records remain safely preserved in MongoDB.
          </p>
          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Offboard Another
            </button>
            <button
              onClick={() => navigate('/hr/employees')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold"
            >
              Back to Employee Directory
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Step 1: Select Employee</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Employee to Offboard</label>
              <select
                required
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="">-- Choose active employee --</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.fullName} ({emp.employeeId}) &bull; {emp.departmentName} &bull; {emp.designationTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Step 2: Offboarding Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Separation Type / Status</label>
                <select
                  value={offboardingReason}
                  onChange={(e) => setOffboardingReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                >
                  <option value="RESIGNED">Voluntary Resignation</option>
                  <option value="TERMINATED">Employment Termination</option>
                  <option value="INACTIVE">Deactivate Account</option>
                  <option value="SUSPENDED">Suspended Pending Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Last Working Date</label>
                <input
                  type="date"
                  required
                  value={lastWorkingDate}
                  onChange={(e) => setLastWorkingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Handover & Offboarding Remarks</label>
              <textarea
                rows={3}
                placeholder="Details of handover, exit interview, reasons, or remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Step 3: Verification Checklist</h3>
            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={handoverComplete}
                onChange={(e) => setHandoverComplete(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-0"
              />
              <span>Operational and documentation handover completed with Department Head</span>
            </label>

            <label className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={assetsReturned}
                onChange={(e) => setAssetsReturned(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-0"
              />
              <span>Company ID Card, Cleanroom Access Badge, and Assets returned</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/hr/employees')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : 'Complete Offboarding'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default HROffboarding;
