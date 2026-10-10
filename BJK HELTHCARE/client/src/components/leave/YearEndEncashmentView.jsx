import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  DollarSign,
  Calculator,
  FileText,
  UserCheck
} from 'lucide-react';

export const YearEndEncashmentView = ({ isHR = true }) => {
  const { showToast } = useNotification();
  const [activeSubTab, setActiveSubTab] = useState('ENCASHMENT');
  const [encashments, setEncashments] = useState([]);
  const [regularizations, setRegularizations] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);

  // LOP Calculator State
  const [lopCalc, setLopCalc] = useState({
    monthlyGrossSalary: 35000,
    calendarDaysInMonth: 30,
    lopDays: 2
  });
  const [lopResult, setLopResult] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, rRes, pRes] = await Promise.all([
        leaveAPI.getEncashments(),
        leaveAPI.getRegularizations(),
        leaveAPI.previewYearEnd({ year: 2026 })
      ]);
      if (eRes.data?.success) setEncashments(eRes.data.requests || []);
      if (rRes.data?.success) setRegularizations(rRes.data.regularizations || []);
      if (pRes.data?.success) setPreviewData(pRes.data.preview || null);
    } catch (err) {
      console.error('Failed to load Year-End/Encashment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveEncashment = async (id, approved) => {
    try {
      const res = await leaveAPI.approveEncashment(id, {
        approved,
        remarks: approved ? 'Encashment approved per Section 12.1.' : 'Encashment request rejected.'
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleApproveRegularization = async (id, approved) => {
    try {
      const res = await leaveAPI.approveRegularization(id, {
        approved,
        remarks: approved ? 'Absence regularized per Section 13.4 emergency exception.' : 'Regularization rejected.'
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  const handleExecuteYearEnd = async () => {
    if (!window.confirm('Execute official Year-End 2026 balance reconciliation? This will lapse unused CL & SL, apply 50% EL carry-forward (capped at 50 days), and expire unutilized Comp-Offs >90 days.')) return;
    try {
      setIsExecuting(true);
      const res = await leaveAPI.executeYearEnd({ year: 2026 });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Year-end execution failed', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCalculateLOP = async (e) => {
    e.preventDefault();
    try {
      const res = await leaveAPI.calculateLOP(lopCalc);
      if (res.data?.success) {
        setLopResult(res.data.calculation);
      }
    } catch (err) {
      showToast('LOP calculation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 font-mono text-[11px] font-bold uppercase border border-purple-200">
              Policy Ref: Sections 10, 12 &amp; 13
            </span>
            <span className="text-slate-500 text-xs font-semibold">Financial &amp; Year-End Reconciliations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Year-End Reconciliation, EL Encashment &amp; Loss of Pay
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            50% EL carry-forward engine, December encashment processing, and statutory pro-rata LOP deductions.
          </p>
        </div>

        {isHR && (
          <button
            onClick={handleExecuteYearEnd}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition-all shrink-0"
          >
            <Play size={15} />
            <span>{isExecuting ? 'Processing...' : 'Run Year-End Reconcile Batch'}</span>
          </button>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ENCASHMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'ENCASHMENT' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          EL Encashment Requests ({encashments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('YEAR_END_RUNNER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'YEAR_END_RUNNER' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Year-End Balance Reconciliation Preview
        </button>
        <button
          onClick={() => setActiveSubTab('REGULARIZATION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'REGULARIZATION' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Absence Regularization Queue ({regularizations.length})
        </button>
        <button
          onClick={() => setActiveSubTab('LOP_CALCULATOR')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'LOP_CALCULATOR' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pro-Rata LOP Salary Calculator
        </button>
      </div>

      {/* SUBTAB 1: ENCASHMENT QUEUE */}
      {activeSubTab === 'ENCASHMENT' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">December Earned Leave Encashment Applications (Section 12.1)</span>
            <span className="text-[11px] text-slate-500">Max 10 Days &bull; Min 20 Days Retained</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Encash ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Current EL Balance</th>
                  <th className="py-3 px-4">Requested Days</th>
                  <th className="py-3 px-4">Retained Balance</th>
                  <th className="py-3 px-4">Basic Salary</th>
                  <th className="py-3 px-4">Calculated Payout</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {encashments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-400">
                      No leave encashment requests submitted.
                    </td>
                  </tr>
                ) : (
                  encashments.map((enc) => (
                    <tr key={enc._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{enc.encashmentId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{enc.employeeName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{enc.employeeCode} &bull; {enc.department}</div>
                      </td>
                      <td className="py-3 px-4 font-bold">{enc.currentELBalance} Days</td>
                      <td className="py-3 px-4 font-bold text-purple-700">{enc.requestedDays} Days</td>
                      <td className="py-3 px-4 font-bold text-teal-700">{enc.retainedBalance} Days</td>
                      <td className="py-3 px-4 font-mono">₹{enc.basicSalary?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        ₹{enc.calculatedEncashmentAmount?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          enc.status === 'HR_APPROVED' || enc.status === 'PAYROLL_PROCESSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enc.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {enc.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {enc.status === 'SUBMITTED' && isHR && (
                          <>
                            <button
                              onClick={() => handleApproveEncashment(enc._id, true)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveEncashment(enc._id, false)}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {enc.status !== 'SUBMITTED' && (
                          <span className="text-[11px] text-slate-500 font-medium">Decided</span>
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

      {/* SUBTAB 2: YEAR END RUNNER PREVIEW */}
      {activeSubTab === 'YEAR_END_RUNNER' && previewData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/20">
              <span className="text-[10px] text-rose-700 font-bold uppercase block">CL to Lapse on Dec 31</span>
              <span className="text-xl font-black text-rose-900 mt-1 block">{previewData.clLapsedTotal || 0} Days</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-purple-200 bg-purple-50/20">
              <span className="text-[10px] text-purple-700 font-bold uppercase block">SL to Lapse on Dec 31</span>
              <span className="text-xl font-black text-purple-900 mt-1 block">{previewData.slLapsedTotal || 0} Days</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-teal-200 bg-teal-50/20">
              <span className="text-[10px] text-teal-700 font-bold uppercase block">50% EL to Carry Forward</span>
              <span className="text-xl font-black text-teal-900 mt-1 block">{previewData.elCarriedForwardTotal || 0} Days</span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">Comp-Off Expiring (&gt;90 Days)</span>
              <span className="text-xl font-black text-amber-900 mt-1 block">{previewData.compOffExpiredTotal || 0} Days</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Employee-Wise Reconciliation Simulation ({previewData.employeesReconciled?.length || 0} records)</span>
              <span className="text-[11px] text-slate-500">Section 5.3 &bull; Max 50 Accumulation Cap</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] sticky top-0">
                    <th className="py-2.5 px-4 bg-slate-50">Employee</th>
                    <th className="py-2.5 px-4 bg-slate-50">Dept</th>
                    <th className="py-2.5 px-4 bg-slate-50">CL Before</th>
                    <th className="py-2.5 px-4 bg-slate-50">CL Lapsed</th>
                    <th className="py-2.5 px-4 bg-slate-50">SL Before</th>
                    <th className="py-2.5 px-4 bg-slate-50">SL Lapsed</th>
                    <th className="py-2.5 px-4 bg-slate-50">EL Balance</th>
                    <th className="py-2.5 px-4 bg-slate-50">50% EL Carried</th>
                    <th className="py-2.5 px-4 bg-slate-50">EL Forfeited (&gt;50)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(previewData.employeesReconciled || []).map((emp, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">{emp.employeeName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{emp.employeeId}</div>
                      </td>
                      <td className="py-2.5 px-4 font-medium">{emp.department}</td>
                      <td className="py-2.5 px-4 text-slate-500">{emp.clBefore}</td>
                      <td className="py-2.5 px-4 text-rose-600 font-bold">-{emp.clLapsed}</td>
                      <td className="py-2.5 px-4 text-slate-500">{emp.slBefore}</td>
                      <td className="py-2.5 px-4 text-purple-600 font-bold">-{emp.slLapsed}</td>
                      <td className="py-2.5 px-4 font-bold">{emp.elBefore}</td>
                      <td className="py-2.5 px-4 text-teal-700 font-black">+{emp.elCarriedForward}</td>
                      <td className="py-2.5 px-4 text-slate-400">{emp.elForfeited > 0 ? `-${emp.elForfeited}` : '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REGULARIZATION QUEUE */}
      {activeSubTab === 'REGULARIZATION' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Unauthorized Absence Regularization Applications (Section 13.4)</span>
            <span className="text-[11px] text-slate-500">Genuine Emergency Exceptions Approved by Head – HR</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Reg ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Absence Period</th>
                  <th className="py-3 px-4">Emergency Category</th>
                  <th className="py-3 px-4">Written Explanation</th>
                  <th className="py-3 px-4">Requested As</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {regularizations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400">
                      No absence regularization requests pending.
                    </td>
                  </tr>
                ) : (
                  regularizations.map((reg) => (
                    <tr key={reg._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{reg.regularizationId}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{reg.employeeName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{reg.employeeCode} &bull; {reg.department}</div>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {new Date(reg.absenceStartDate).toISOString().split('T')[0]} ({reg.absenceDaysCount} Days)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {reg.reasonType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={reg.explanation}>{reg.explanation}</td>
                      <td className="py-3 px-4 font-bold text-teal-700">{reg.requestedConversionType}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          reg.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : reg.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {reg.status === 'SUBMITTED' && isHR && (
                          <>
                            <button
                              onClick={() => handleApproveRegularization(reg._id, true)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-bold border border-emerald-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveRegularization(reg._id, false)}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[11px] font-bold border border-rose-200"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {reg.status !== 'SUBMITTED' && (
                          <span className="text-[11px] text-slate-500 font-medium">Processed</span>
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

      {/* SUBTAB 4: PRO-RATA LOP CALCULATOR */}
      {activeSubTab === 'LOP_CALCULATOR' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
            <Calculator className="text-teal-600" size={20} />
            <div>
              <h3 className="text-base font-black text-slate-900">
                Statutory Loss of Pay (LOP) Salary Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Formula per Section 13.3: <code>(Monthly Gross Salary / Calendar Days) × LOP Days</code>
              </p>
            </div>
          </div>

          <form onSubmit={handleCalculateLOP} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Gross (₹)</label>
                <input
                  type="number"
                  required
                  value={lopCalc.monthlyGrossSalary}
                  onChange={(e) => setLopCalc({ ...lopCalc, monthlyGrossSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Days in Month</label>
                <input
                  type="number"
                  min="28"
                  max="31"
                  required
                  value={lopCalc.calendarDaysInMonth}
                  onChange={(e) => setLopCalc({ ...lopCalc, calendarDaysInMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">LOP Days</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={lopCalc.lopDays}
                  onChange={(e) => setLopCalc({ ...lopCalc, lopDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Compute Pro-Rata Deduction
            </button>
          </form>

          {lopResult && (
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-2 mt-4">
              <span className="text-[10px] text-teal-800 font-bold uppercase block">Computation Result</span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Per Day Rate:</span>
                <span className="text-xs font-mono font-bold text-slate-900">₹{lopResult.perDayRate}</span>
              </div>
              <div className="flex items-center justify-between border-t border-teal-200/60 pt-2">
                <span className="text-sm font-bold text-slate-800">Total Salary Deduction:</span>
                <span className="text-base font-mono font-black text-rose-700">₹{lopResult.totalDeduction}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">{lopResult.formula}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
