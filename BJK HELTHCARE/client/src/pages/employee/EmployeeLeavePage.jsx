import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Users,
  Check,
  X,
  Eye,
  RotateCcw,
  FileText,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  BarChart3,
  CalendarDays,
  Sparkles,
  Info,
  Trash2
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeLeaveAPI, employeeAttendanceAPI } from '../../services/employeeApi';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { LeaveApprovalTimeline } from '../../components/leave/LeaveApprovalTimeline';

export const EmployeeLeavePage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [balances, setBalances] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [summary, setSummary] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [activeTab, setActiveTab] = useState('my-ledger'); // 'my-ledger' | 'my-leaves' | 'my-calendar' | 'team-approvals'

  // Apply Modal state (opens automatically if ?action=apply)
  const [showApplyModal, setShowApplyModal] = useState(searchParams.get('action') === 'apply');

  // Timeline / Details Modal state
  const [selectedLeaveForTimeline, setSelectedLeaveForTimeline] = useState(null);

  // Manager action modal
  const [managerActionState, setManagerActionState] = useState({
    isOpen: false,
    leave: null,
    action: 'APPROVE',
    reason: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadLeaveData = async () => {
    setIsLoading(true);
    try {
      const [balRes, leaveRes, attRes] = await Promise.all([
        employeeLeaveAPI.getBalance(),
        employeeLeaveAPI.getLeaves(),
        employeeAttendanceAPI.getSummary().catch(() => ({ data: { summary: null } }))
      ]);

      if (balRes.data?.success) {
        setBalances(balRes.data.balances || []);
        setLedger(balRes.data.ledger || null);
        setSummary(balRes.data.summary || null);
      }
      if (leaveRes.data?.success) {
        setMyLeaves(leaveRes.data.leaves || []);
      }
      if (attRes.data?.success) {
        setAttendanceSummary(attRes.data.summary || null);
      }

      // If team lead or manager, load team leaves
      const role = employeeUser?.role || employeeUser?.systemRole;
      if (['TEAM_LEAD', 'MANAGER', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DIRECTOR', 'SUPER_ADMIN'].includes(role)) {
        const teamRes = await employeeLeaveAPI.getTeamLeaves().catch(() => ({ data: { leaves: [] } }));
        if (teamRes.data?.leaves) setTeamLeaves(teamRes.data.leaves);
      }
    } catch (err) {
      console.error('[Load Leave Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  // Sync modal with URL search parameter
  useEffect(() => {
    if (searchParams.get('action') === 'apply') {
      setShowApplyModal(true);
    }
  }, [searchParams]);

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
    if (searchParams.get('action') === 'apply') {
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  };

  const handleWithdrawLeave = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this pending leave application? Your pending balance will be restored immediately.')) return;
    setMessage('');
    setErrorMessage('');
    try {
      const res = await employeeLeaveAPI.withdraw(id, { reason: 'Withdrawn by employee' });
      if (res.data?.success) {
        setMessage(res.data.message || 'Leave application withdrawn successfully.');
        loadLeaveData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to withdraw leave application.');
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave application? This will restore your leave balance.')) return;
    setMessage('');
    setErrorMessage('');
    try {
      const res = await employeeLeaveAPI.cancel(id, { reason: 'Cancelled by employee' });
      if (res.data?.success) {
        setMessage(res.data.message || 'Leave application cancelled and balance restored.');
        loadLeaveData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel leave.');
    }
  };

  const handleDeleteLeave = async (id, requestId) => {
    if (!window.confirm(`Are you sure you want to delete/cancel leave application [${requestId || id}]? This will remove the record and restore your leave balance.`)) return;
    setMessage('');
    setErrorMessage('');
    try {
      const res = await employeeLeaveAPI.delete(id);
      if (res.data?.success) {
        setMessage(res.data.message || `Leave application [${requestId || id}] deleted successfully.`);
        loadLeaveData();
      }
    } catch (err) {
      try {
        const cancelRes = await employeeLeaveAPI.cancel(id, { reason: 'Deleted by employee' });
        if (cancelRes.data?.success) {
          setMessage('Leave application cancelled and balance restored.');
          loadLeaveData();
        }
      } catch (cancelErr) {
        setErrorMessage(err.response?.data?.message || 'Failed to delete leave application.');
      }
    }
  };

  const handleOpenManagerAction = (leave, action) => {
    setManagerActionState({
      isOpen: true,
      leave,
      action,
      reason: ''
    });
  };

  const handleSubmitManagerAction = async (e) => {
    e.preventDefault();
    if ((managerActionState.action === 'REJECT' || managerActionState.action === 'RETURN') && !managerActionState.reason.trim()) {
      alert('A documented reason is mandatory for rejection or return.');
      return;
    }

    try {
      const res = await employeeLeaveAPI.approveTeamLeave(managerActionState.leave._id || managerActionState.leave.requestId, {
        action: managerActionState.action,
        reason: managerActionState.reason
      });

      if (res.data?.success) {
        setMessage(res.data.message);
        setManagerActionState({ isOpen: false, leave: null, action: 'APPROVE', reason: '' });
        loadLeaveData();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to process team leave.');
    }
  };

  const role = employeeUser?.role || employeeUser?.systemRole;
  const isManagerOrLead = ['TEAM_LEAD', 'MANAGER', 'DEPARTMENT_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DIRECTOR', 'SUPER_ADMIN'].includes(role);

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            Approved
          </span>
        );
      case 'REJECTED':
      case 'TEAM_MANAGER_REJECTED':
      case 'DEPARTMENT_MANAGER_REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
            Rejected
          </span>
        );
      case 'RETURNED_FOR_CORRECTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
            Returned for Correction
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
            Cancelled
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pending Review
          </span>
        );
    }
  };

  const clOpen = ledger?.openingBalance?.cl ?? 7;
  const slOpen = ledger?.openingBalance?.sl ?? 7;
  const clTaken = ledger?.totalLeaveTaken?.cl ?? 0;
  const slTaken = ledger?.totalLeaveTaken?.sl ?? 0;
  const lwpTaken = ledger?.totalLeaveTaken?.lwp ?? 0;
  const totalTaken = ledger?.totalLeaveTaken?.total ?? (clTaken + slTaken + lwpTaken);
  const clClose = ledger?.closingBalance?.cl ?? Math.max(0, clOpen - clTaken);
  const slClose = ledger?.closingBalance?.sl ?? Math.max(0, slOpen - slTaken);
  const closeTotal = ledger?.closingBalance?.total ?? (clClose + slClose);

  return (
    <div className="space-y-6">
      {/* Page Header with Authenticated Employee Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-mono text-[10px] font-bold uppercase tracking-wider">
              {employeeUser?.employeeCode || employeeUser?.employeeId || 'EMPLOYEE'}
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-slate-600 text-xs font-semibold">
              {ledger?.department || employeeUser?.department || 'Operations'}
            </span>
            {ledger?.doj && (
              <>
                <span className="text-slate-400 text-xs">&bull;</span>
                <span className="text-slate-500 text-xs font-mono">DOJ: {ledger.doj}</span>
              </>
            )}
          </div>
          <h1 className="text-xl font-black text-slate-900">
            {ledger?.employeeName || employeeUser?.fullName || employeeUser?.name || 'Employee Leave Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Year 2026 Master Leave Ledger & Absence Management &bull; BJK Healthcare Digital Brain
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all self-start sm:self-auto group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          <span>APPLY FOR LEAVE</span>
        </button>
      </div>

      {/* Feedback Messages */}
      {message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between gap-2 text-xs text-emerald-800 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 flex items-center justify-between gap-2 text-xs text-rose-800 font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5 Authoritative Leave Balance Cards (Exact 2026 Source Ledger Values) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>My Leave Balances (Year 2026)</span>
          </h2>
          <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
            Closing Balance: {closeTotal} Days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* 1. Casual Leave (CL) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500/40 hover:shadow-md transition-all text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                Casual Leave (CL)
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-teal-800">{clClose}</span>
                <span className="text-slate-400 text-[11px]">Opening: {clOpen}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Taken: <strong className="text-slate-800">{clTaken}</strong></span>
              <span className="text-teal-700 font-semibold">Rem: {clClose}</span>
            </div>
          </div>

          {/* 2. Sick Leave (SL) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-purple-500/40 hover:shadow-md transition-all text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Sick Leave (SL)
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-purple-800">{slClose}</span>
                <span className="text-slate-400 text-[11px]">Opening: {slOpen}</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Taken: <strong className="text-slate-800">{slTaken}</strong></span>
              <span className="text-purple-700 font-semibold">Rem: {slClose}</span>
            </div>
          </div>

          {/* 3. Leave Without Pay (LWP) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/40 hover:shadow-md transition-all text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Leave Without Pay (LWP)
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-amber-800">{lwpTaken}</span>
                <span className="text-slate-400 text-[11px]">Unpaid Days</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Status: <strong className="text-amber-700">Deducted</strong></span>
              <span>Total: {lwpTaken}</span>
            </div>
          </div>

          {/* 4. Total Leave Taken */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-500/40 hover:shadow-md transition-all text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                Total Leave Taken
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-rose-800">{totalTaken}</span>
                <span className="text-slate-400 text-[11px]">CL + SL + LWP</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Paid: {clTaken + slTaken}</span>
              <span>LWP: {lwpTaken}</span>
            </div>
          </div>

          {/* 5. Closing / Remaining Balance */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 hover:shadow-md transition-all text-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Closing Balance
              </span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-teal-900">{closeTotal}</span>
                <span className="text-teal-700 text-[11px] font-semibold">Days Left</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-teal-200/60 flex justify-between text-[11px] text-teal-900 font-mono">
              <span>CL: {clClose}</span>
              <span>SL: {slClose}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('my-ledger')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'my-ledger'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>2026 MONTHLY LEAVE MATRIX</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-leaves')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'my-leaves'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>MY LEAVE HISTORY</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {myLeaves.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-calendar')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'my-calendar'
              ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>ATTENDANCE + LEAVE CALENDAR</span>
        </button>

        {isManagerOrLead && (
          <button
            type="button"
            onClick={() => setActiveTab('team-approvals')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'team-approvals'
                ? 'border-teal-600 text-teal-700 bg-teal-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>TEAM LEAVE APPROVALS</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
              {teamLeaves.filter(l => l.currentStatus === 'TEAM_MANAGER_PENDING' || l.status === 'PENDING_APPROVAL').length}
            </span>
          </button>
        )}
      </div>

      {/* TAB 1: 2026 MONTHLY BREAKDOWN MATRIX */}
      {activeTab === 'my-ledger' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Monthly Leave Usage Matrix (Jan 2026 &mdash; Oct 2026)</span>
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Source: Leave 2026(Sheet1).csv
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Month-by-month verified records of Casual Leave (CL), Sick Leave (SL), and Leave Without Pay (LWP).
                </p>
              </div>
            </div>

            {/* Monthly Matrix Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Month</th>
                    <th className="py-3 px-3 text-center">Casual Leave (CL)</th>
                    <th className="py-3 px-3 text-center">Sick Leave (SL)</th>
                    <th className="py-3 px-3 text-center">Leave Without Pay (LWP)</th>
                    <th className="py-3 px-3 text-right">Total Days</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {ledger?.monthlyBreakdown && ledger.monthlyBreakdown.length > 0 ? (
                    ledger.monthlyBreakdown.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-sans font-bold text-slate-900">
                          {m.monthName}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={m.cl > 0 ? 'font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded' : 'text-slate-400'}>
                            {m.cl}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={m.sl > 0 ? 'font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded' : 'text-slate-400'}>
                            {m.sl}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={m.lwp > 0 ? 'font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded' : 'text-slate-400'}>
                            {m.lwp}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          {m.total}
                        </td>
                        <td className="py-3 px-3 text-right font-sans">
                          {m.total > 0 ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                              Recorded
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Nil</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400 font-sans">
                        No monthly breakdown records available for this employee.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100/70 border-t-2 border-slate-200 font-bold font-mono">
                  <tr>
                    <td className="py-3 px-3 font-sans text-slate-900 uppercase text-[11px]">Total Leave Taken:</td>
                    <td className="py-3 px-3 text-center text-teal-800">{clTaken}</td>
                    <td className="py-3 px-3 text-center text-purple-800">{slTaken}</td>
                    <td className="py-3 px-3 text-center text-amber-800">{lwpTaken}</td>
                    <td className="py-3 px-3 text-right text-slate-900 font-black text-sm">{totalTaken}</td>
                    <td className="py-3 px-3 text-right font-sans text-[11px] text-teal-700">Closing: {closeTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY LEAVE HISTORY */}
      {activeTab === 'my-leaves' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Application ID</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">From</th>
                  <th className="py-3.5 px-4">To</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Current Approval Stage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.length > 0 ? (
                  myLeaves.map((l) => (
                    <tr key={l._id || l.requestId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {l.requestId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {l.leaveTypeName || l.leaveType}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {l.startDateString}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {l.endDateString}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {l.duration} {l.isHalfDay ? '(Half)' : ''}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {l.currentApprovalStage || 'Team Manager Review'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(l.currentStatus || l.status)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLeaveForTimeline(l)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="View Full Approval Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(l.currentStatus === 'TEAM_MANAGER_PENDING' || l.currentStatus === 'SUBMITTED') && (
                            <button
                              type="button"
                              onClick={() => handleWithdrawLeave(l._id || l.requestId)}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Withdraw Pending Application"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          {!['CANCELLED', 'WITHDRAWN'].includes(l.currentStatus || l.status) && (
                            <button
                              type="button"
                              onClick={() => handleDeleteLeave(l._id || l.requestId, l.requestId)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
                              title="Delete / Cancel this Leave and Restore Balance"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline text-[10px]">Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No leave applications submitted yet. Click "Apply for Leave" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE + LEAVE COMBINED CALENDAR */}
      {activeTab === 'my-calendar' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Attendance & Approved Leave Calendar (2026)
              </h3>
              <p className="text-xs text-slate-500">
                Unified visibility connecting attendance punches with sanctioned CL, SL, and LWP records
              </p>
            </div>
            {attendanceSummary && (
              <div className="flex items-center gap-3 text-xs">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  Present: {attendanceSummary.present || 0}
                </span>
                <span className="font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                  Attendance: {attendanceSummary.attendancePercentage || 0}%
                </span>
              </div>
            )}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Legend:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span> Present
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-teal-500"></span> Casual Leave (CL)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500"></span> Sick Leave (SL)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500"></span> Leave Without Pay (LWP)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-400"></span> Weekly Off
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500"></span> Holiday
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500"></span> Absent
            </span>
          </div>

          {/* Quick Calendar Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ledger?.monthlyBreakdown?.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{m.monthName}</span>
                  <span className="text-[11px] font-mono text-slate-500">Total: {m.total} Days</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-teal-50 border border-teal-200">
                    <span className="block text-[9px] text-teal-600 font-bold">CL</span>
                    <span className="font-black text-teal-900">{m.cl}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="block text-[9px] text-purple-600 font-bold">SL</span>
                    <span className="font-black text-purple-900">{m.sl}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="block text-[9px] text-amber-600 font-bold">LWP</span>
                    <span className="font-black text-amber-900">{m.lwp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TEAM APPROVALS (For Managers) */}
      {isManagerOrLead && activeTab === 'team-approvals' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Direct Team Approval Queue</h3>
              <p className="text-xs text-slate-500">Review leave applications submitted by your direct reporting staff</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">From &rarr; To</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamLeaves.length > 0 ? (
                  teamLeaves.map((tl) => (
                    <tr key={tl._id || tl.requestId} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{tl.employeeName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{tl.employeeId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{tl.leaveTypeName || tl.leaveType}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{tl.startDateString} &rarr; {tl.endDateString}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{tl.duration} day(s)</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{tl.reason}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenManagerAction(tl, 'APPROVE')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenManagerAction(tl, 'REJECT')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">
                      No pending team leave applications to review.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal Component */}
      <ApplyLeaveModal
        isOpen={showApplyModal}
        onClose={handleCloseApplyModal}
        onSuccess={() => {
          handleCloseApplyModal();
          setMessage('Leave application submitted successfully. Approval status: Pending Review.');
          loadLeaveData();
        }}
        balances={balances}
      />

      {/* Timeline Modal */}
      {selectedLeaveForTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                  {selectedLeaveForTimeline.requestId}
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Leave Approval Workflow Timeline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeaveForTimeline(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Category</span>
                  <span className="font-bold text-slate-900">{selectedLeaveForTimeline.leaveTypeName || selectedLeaveForTimeline.leaveType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Duration</span>
                  <span className="font-bold text-slate-900">{selectedLeaveForTimeline.duration} Days</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">From Date</span>
                  <span className="font-mono font-bold text-slate-900">{selectedLeaveForTimeline.startDateString}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">To Date</span>
                  <span className="font-mono font-bold text-slate-900">{selectedLeaveForTimeline.endDateString}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1">Documented Reason</span>
                <p className="text-slate-700">{selectedLeaveForTimeline.reason}</p>
              </div>

              {/* Master 4-Step Approval Timeline Component */}
              <LeaveApprovalTimeline request={selectedLeaveForTimeline} />
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedLeaveForTimeline(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manager Action Modal (Approve / Reject / Return) */}
      {managerActionState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {managerActionState.action === 'APPROVE'
                  ? 'Approve Team Leave'
                  : managerActionState.action === 'RETURN'
                  ? 'Return Application for Correction'
                  : 'Reject Team Leave'}
              </h3>
              <button
                type="button"
                onClick={() => setManagerActionState({ isOpen: false, leave: null, action: 'APPROVE', reason: '' })}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600">
              Leave Request <strong className="font-mono text-teal-700">{managerActionState.leave?.requestId}</strong> for{' '}
              <strong className="text-slate-800">{managerActionState.leave?.employeeName}</strong> ({managerActionState.leave?.duration} days).
            </p>

            <form onSubmit={handleSubmitManagerAction} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {managerActionState.action === 'APPROVE'
                    ? 'Approval Note (Optional)'
                    : managerActionState.action === 'RETURN'
                    ? 'Correction Note / Required Changes *'
                    : 'Rejection Reason *'}
                </label>
                <textarea
                  required={managerActionState.action !== 'APPROVE'}
                  rows={3}
                  value={managerActionState.reason}
                  onChange={(e) => setManagerActionState({ ...managerActionState, reason: e.target.value })}
                  placeholder={
                    managerActionState.action === 'APPROVE'
                      ? 'Add any comments for the Department Head...'
                      : 'Specify why this application is being returned or rejected...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManagerActionState({ isOpen: false, leave: null, action: 'APPROVE', reason: '' })}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-bold shadow-md ${
                    managerActionState.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : managerActionState.action === 'RETURN'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {managerActionState.action}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeavePage;
