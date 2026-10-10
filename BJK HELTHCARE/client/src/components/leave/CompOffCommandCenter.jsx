import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Calendar,
  AlertCircle,
  CheckSquare,
  ShieldCheck,
  UserCheck,
  ArrowRight
} from 'lucide-react';

export const CompOffCommandCenter = ({ isHR = true, user = null }) => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('PRE_AUTH');
  const [authorizations, setAuthorizations] = useState([]);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Pre-Auth Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newAuth, setNewAuth] = useState({
    employeeCode: '',
    workDate: '',
    workType: 'WEEKLY_OFF',
    plannedHours: 8,
    businessJustification: ''
  });

  // Verify Work Modal State
  const [verifyState, setVerifyState] = useState({
    isOpen: false,
    auth: null,
    actualHoursWorked: 8,
    remarks: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [authRes, credRes] = await Promise.all([
        leaveAPI.getCompOffAuthorizations(),
        leaveAPI.getCompOffCredits()
      ]);
      if (authRes.data?.success) setAuthorizations(authRes.data.authorizations || []);
      if (credRes.data?.success) setCredits(credRes.data.credits || []);
    } catch (err) {
      console.error('Failed to load Comp-Off data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveRM = async (id, approved) => {
    try {
      const res = await leaveAPI.approveCompOffRM(id, { approved, remarks: 'Reporting Manager verified.' });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleApproveHR = async (id, approved) => {
    try {
      const res = await leaveAPI.approveCompOffHR(id, { approved, remarks: 'Head – HR authorized.' });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleVerifyWork = async () => {
    if (!verifyState.auth) return;
    try {
      const res = await leaveAPI.verifyCompOffWork(verifyState.auth._id, {
        actualHoursWorked: Number(verifyState.actualHoursWorked),
        remarks: verifyState.remarks
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setVerifyState({ isOpen: false, auth: null, actualHoursWorked: 8, remarks: '' });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Verification failed', 'error');
    }
  };

  const handleCreateAuth = async (e) => {
    e.preventDefault();
    try {
      const res = await leaveAPI.createCompOffAuthorization(newAuth);
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setIsNewModalOpen(false);
        setNewAuth({ employeeCode: '', workDate: '', workType: 'WEEKLY_OFF', plannedHours: 8, businessJustification: '' });
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit authorization', 'error');
    }
  };

  const getDaysRemaining = (expiryDate) => {
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono text-[11px] font-bold uppercase border border-amber-200">
              Policy Ref: Section 8
            </span>
            <span className="text-slate-500 text-xs font-semibold">90-Day Expiry Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Compensatory Off (Comp-Off) Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Advance authorization workflow, completed work verification, and 90-day ledger consumption.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <Plus size={16} />
          <span>New Work Pre-Approval</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('PRE_AUTH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PRE_AUTH' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Work Pre-Authorizations ({authorizations.length})
        </button>
        <button
          onClick={() => setActiveTab('CREDITS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CREDITS' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Credit Ledger &amp; 90-Day Expiry Tracker ({credits.length})
        </button>
      </div>

      {/* TAB 1: WORK AUTHORIZATIONS */}
      {activeTab === 'PRE_AUTH' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Pre-Authorization Queue (Section 8.2 &amp; 8.5)</span>
            <span className="text-[11px] text-slate-500">Advance RM + HR Approval Required Before Work</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Auth ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Proposed Work Date</th>
                  <th className="py-3 px-4">Hours / Type</th>
                  <th className="py-3 px-4">Credit Value</th>
                  <th className="py-3 px-4">Justification</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {authorizations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No Comp-Off pre-authorizations submitted yet.
                    </td>
                  </tr>
                ) : (
                  authorizations.map((auth) => (
                    <tr key={auth._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{auth.authorizationId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{auth.employeeName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{auth.employeeCode} &bull; {auth.department}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">{auth.workDateString}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{auth.plannedHours} hrs</span>
                        <span className="text-[10px] text-slate-500 block">({auth.workType})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {auth.creditEligible} Day
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={auth.businessJustification}>
                        {auth.businessJustification}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          auth.status === 'CREDITED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : auth.status === 'PRE_APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : auth.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {auth.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {auth.status === 'PENDING_RM' && (
                          <>
                            <button
                              onClick={() => handleApproveRM(auth._id, true)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-200"
                            >
                              RM Approve
                            </button>
                            <button
                              onClick={() => handleApproveRM(auth._id, false)}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {auth.status === 'PENDING_HR' && isHR && (
                          <>
                            <button
                              onClick={() => handleApproveHR(auth._id, true)}
                              className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-[11px] font-bold border border-blue-200"
                            >
                              HR Sanction
                            </button>
                            <button
                              onClick={() => handleApproveHR(auth._id, false)}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {auth.status === 'PRE_APPROVED' && isHR && (
                          <button
                            onClick={() => setVerifyState({ isOpen: true, auth, actualHoursWorked: auth.plannedHours, remarks: '' })}
                            className="px-2.5 py-1 bg-teal-600 text-white hover:bg-teal-700 rounded-lg text-[11px] font-bold shadow-2xs"
                          >
                            Verify &amp; Credit Ledger
                          </button>
                        )}
                        {auth.status === 'CREDITED' && (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end space-x-1">
                            <CheckCircle size={13} />
                            <span>Posted to Ledger</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE CREDIT LEDGER & 90-DAY EXPIRY TRACKER */}
      {activeTab === 'CREDITS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Comp-Off Ledger with 90-Day Lapsing Rule (Section 8.3 &amp; 8.4)</span>
            <span className="text-[11px] text-slate-500">FIFO Deduction Engine</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Credit ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Work Date</th>
                  <th className="py-3 px-4">Earned Date</th>
                  <th className="py-3 px-4">Expiry Date (90 Days)</th>
                  <th className="py-3 px-4">Days Granted</th>
                  <th className="py-3 px-4">Used</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Expiry Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {credits.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-400">
                      No active Comp-Off credits posted to ledger.
                    </td>
                  </tr>
                ) : (
                  credits.map((cred) => {
                    const daysLeft = getDaysRemaining(cred.expiryDate);
                    return (
                      <tr key={cred._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{cred.creditId}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{cred.employeeName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{cred.employeeCode}</div>
                        </td>
                        <td className="py-3 px-4 font-medium">{new Date(cred.workDate).toISOString().split('T')[0]}</td>
                        <td className="py-3 px-4">{new Date(cred.earnedDate).toISOString().split('T')[0]}</td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-900">
                          {new Date(cred.expiryDate).toISOString().split('T')[0]}
                        </td>
                        <td className="py-3 px-4 font-bold">{cred.creditDays}</td>
                        <td className="py-3 px-4 text-slate-500">{cred.usedDays}</td>
                        <td className="py-3 px-4 font-bold text-teal-700">{cred.remainingDays}</td>
                        <td className="py-3 px-4">
                          {cred.status === 'EXPIRED' || daysLeft <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-700">
                              Lapsed (90 Days)
                            </span>
                          ) : cred.status === 'CONSUMED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600">
                              Fully Consumed
                            </span>
                          ) : daysLeft <= 15 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800">
                              Expires in {daysLeft} Days
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                              Active ({daysLeft} Days left)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Verify Work Modal */}
      {verifyState.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Verify Extra Work &amp; Grant Comp-Off Credit
            </h3>
            <p className="text-xs text-slate-500">
              Confirm actual hours worked by <strong>{verifyState.auth?.employeeName}</strong> on {verifyState.auth?.workDateString}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Actual Hours Worked</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={verifyState.actualHoursWorked}
                  onChange={(e) => setVerifyState({ ...verifyState, actualHoursWorked: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  &ge;8 hours = 1.0 day credit; 4–7 hours = 0.5 day credit.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">HR Verification Remarks</label>
                <textarea
                  rows="2"
                  value={verifyState.remarks}
                  onChange={(e) => setVerifyState({ ...verifyState, remarks: e.target.value })}
                  placeholder="Verification note (e.g. Attended manufacturing shift approved by HOD)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVerifyState({ isOpen: false, auth: null, actualHoursWorked: 8, remarks: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyWork}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                Post Credit to Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Pre-Auth Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateAuth} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Submit Advance Work Authorization (Comp-Off Pre-Approval)
            </h3>
            <p className="text-xs text-slate-500">
              Required by BJK-HR-POL-001 Section 8.2 before working on a weekly off, public holiday, or overtime shift.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Employee Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BH1022"
                  value={newAuth.employeeCode}
                  onChange={(e) => setNewAuth({ ...newAuth, employeeCode: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Work Date</label>
                <input
                  type="date"
                  required
                  value={newAuth.workDate}
                  onChange={(e) => setNewAuth({ ...newAuth, workDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Work Type</label>
                <select
                  value={newAuth.workType}
                  onChange={(e) => setNewAuth({ ...newAuth, workType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value="WEEKLY_OFF">Weekly Off Duty</option>
                  <option value="PUBLIC_HOLIDAY">Public Holiday Duty</option>
                  <option value="OVERTIME">Overtime Extra Shift</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Planned Hours</label>
                <select
                  value={newAuth.plannedHours}
                  onChange={(e) => setNewAuth({ ...newAuth, plannedHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  <option value={8}>8 Hours (Full Day = 1.0 Day Credit)</option>
                  <option value={4}>4 Hours (Partial Day = 0.5 Day Credit)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Operational Necessity &amp; Justification</label>
              <textarea
                rows="2"
                required
                placeholder="Explain the production schedule, batch cycle, regulatory audit, or plant emergency requiring this extra work."
                value={newAuth.businessJustification}
                onChange={(e) => setNewAuth({ ...newAuth, businessJustification: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                Submit for Approval
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
