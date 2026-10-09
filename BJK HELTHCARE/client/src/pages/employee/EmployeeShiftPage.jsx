import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  RefreshCw,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Coffee,
  X,
  History,
  CalendarDays
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeShiftAPI } from '../../services/employeeApi';

export const EmployeeShiftPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [shiftData, setShiftData] = useState(null);
  const [swaps, setSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'swap-history'
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Swap Form State
  const [swapForm, setSwapForm] = useState({
    date: new Date().toISOString().split('T')[0],
    currentShift: '',
    requestedShift: 'Morning Shift (07:00 - 15:30)',
    reason: '',
    colleagueName: ''
  });

  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadShiftData = async () => {
    setIsLoading(true);
    try {
      const [shiftRes, swapRes] = await Promise.all([
        employeeShiftAPI.getShift(),
        employeeShiftAPI.getSwaps()
      ]);

      if (shiftRes.data?.success) {
        setShiftData(shiftRes.data);
        setSwapForm(prev => ({
          ...prev,
          currentShift: shiftRes.data.currentShift?.name || 'General Shift (09:00 - 18:00)'
        }));
      }
      if (swapRes.data?.success) {
        setSwaps(swapRes.data.swaps || []);
      }
    } catch (err) {
      console.error('[Load Shift Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShiftData();
  }, []);

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    try {
      const res = await employeeShiftAPI.requestSwap(swapForm);
      if (res.data?.success) {
        setMessage(res.data.message);
        setShowSwapModal(false);
        setSwapForm({
          date: new Date().toISOString().split('T')[0],
          currentShift: shiftData?.currentShift?.name || '',
          requestedShift: 'Morning Shift (07:00 - 15:30)',
          reason: '',
          colleagueName: ''
        });
        loadShiftData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to submit shift swap request.');
    }
  };

  const currentShift = shiftData?.currentShift;
  const roster = shiftData?.weeklyRoster || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Shift & Rostering</h1>
          <p className="text-xs text-slate-500">
            View allocated manufacturing shift timings, weekly roster schedule, and submit mutual shift swap requests
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSwapModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Request Shift Swap</span>
        </button>
      </div>

      {/* Action Alerts */}
      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:underline">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center justify-between text-xs text-rose-800 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Current Shift Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" /> Active Allocated Shift
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              {currentShift?.name || 'General Shift (09:00 - 18:00)'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                Timing: <strong>{currentShift?.timing || '09:00 AM – 06:00 PM'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-teal-400" />
                Break: <strong>{currentShift?.breakTiming || '01:00 PM – 02:00 PM (60 Mins)'}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                Weekly Off: <strong>{currentShift?.weeklyOff || 'Sunday'}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{currentShift?.workLocation || 'BJK Unit 1 - Formulations Facility'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Building className="w-4 h-4 text-teal-300 shrink-0" />
              <span>{currentShift?.department || 'Operations'}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-semibold pt-1 border-t border-white/10">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>15 Min Grace Period Allowed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Weekly Roster vs Swap Requests */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'current'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Weekly Roster Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('swap-history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'swap-history'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>My Shift Swap Requests ({swaps.length})</span>
        </button>
      </div>

      {/* Tab 1: Weekly Roster Table */}
      {activeTab === 'current' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Current Week Duty Schedule</h3>
              <p className="text-[11px] text-slate-500">Official plant station allocation and rostered work timings</p>
            </div>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
              Live Synchronized Roster
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4">Allocated Shift</th>
                  <th className="py-3 px-4">Shift Timings</th>
                  <th className="py-3 px-4">Station / Facility</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((r, idx) => {
                  const isToday = r.date === new Date().toISOString().split('T')[0];
                  const isOff = r.status === 'OFF';

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isToday ? 'bg-teal-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{r.day}</span>
                          <span className="text-slate-500 font-mono text-[11px]">{r.date}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-teal-600 text-white text-[9px] uppercase font-bold">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {r.shift}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {r.timing}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.station}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isOff
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isOff && (
                          <button
                            type="button"
                            onClick={() => {
                              setSwapForm(prev => ({ ...prev, date: r.date, currentShift: r.shift }));
                              setShowSwapModal(true);
                            }}
                            className="text-teal-600 hover:text-teal-800 font-semibold hover:underline text-[11px]"
                          >
                            Swap
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Shift Swap History */}
      {activeTab === 'swap-history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Shift Swap Applications</h3>
              <p className="text-[11px] text-slate-500">Track mutual shift swap requests and supervisor approvals</p>
            </div>
            <button
              type="button"
              onClick={() => setShowSwapModal(true)}
              className="text-xs font-bold text-teal-600 hover:underline"
            >
              + New Swap Request
            </button>
          </div>

          {swaps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No shift swap requests submitted yet.</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Need to adjust a shift? Click "Request Shift Swap" above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Shift Date</th>
                    <th className="py-3 px-4">Original Shift</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Colleague</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Requested Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {swaps.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {s.date}
                      </td>
                      <td className="py-3 px-4 text-slate-800">
                        {s.originalShift}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {s.reason}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.withColleague}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {s.requestDate ? new Date(s.requestDate).toLocaleDateString() : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Shift Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Request Shift Swap</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSwapModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Shift Date</label>
                <input
                  type="date"
                  required
                  value={swapForm.date}
                  onChange={(e) => setSwapForm({ ...swapForm, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Allocated Shift</label>
                <input
                  type="text"
                  readOnly
                  value={swapForm.currentShift || currentShift?.name || 'General Shift'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requested Target Shift</label>
                <select
                  value={swapForm.requestedShift}
                  onChange={(e) => setSwapForm({ ...swapForm, requestedShift: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 - 15:30)</option>
                  <option value="General Shift (09:00 - 18:00)">General Shift (09:00 - 18:00)</option>
                  <option value="Evening Shift (15:00 - 23:30)">Evening Shift (15:00 - 23:30)</option>
                  <option value="Night Shift (23:00 - 07:30)">Night Shift (23:00 - 07:30)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mutual Colleague Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma or leave blank for pool swap"
                  value={swapForm.colleagueName}
                  onChange={(e) => setSwapForm({ ...swapForm, colleagueName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Shift Swap</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why the shift change is required..."
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Submit Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeShiftPage;
