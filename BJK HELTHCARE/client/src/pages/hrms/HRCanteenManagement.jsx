import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { canteenAPI, downloadBlobFile } from '../../services/api';
import {
  Utensils,
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Calendar,
  Search,
  RefreshCw,
  Building2,
  Lock,
  Unlock,
  Edit,
  History,
  Flame,
  X
} from 'lucide-react';

export const HRCanteenManagement = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    date: selectedDate,
    dateDisplay: '--',
    summary: {
      totalEmployees: 0,
      lunchRequired: 0,
      lunchIn: 0,
      lunchOut: 0,
      currentlyIn: 0,
      completed: 0,
      notMarked: 0,
      expectedLunchCount: 0
    },
    isFinalized: false,
    finalizedAt: null,
    finalizedByName: null,
    employees: []
  });

  // Department Breakdown state
  const [departmentData, setDepartmentData] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // Active view sub-tab: 'live' | 'departments' | 'audit'
  const [activeView, setActiveView] = useState('live');

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dishTypeFilter, setDishTypeFilter] = useState('ALL'); // 'ALL' | 'Full Dish' | 'Half Dish'

  // Finalization modal state
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Reopen modal state
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  // Correction modal state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecordForCorrection, setSelectedRecordForCorrection] = useState(null);
  const [correctionInTime, setCorrectionInTime] = useState('');
  const [correctionOutTime, setCorrectionOutTime] = useState('');
  const [correctionDishType, setCorrectionDishType] = useState('Full Dish');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correcting, setCorrecting] = useState(false);

  // Monthly export modal state
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [exportingMonthly, setExportingMonthly] = useState(false);
  const [exportingDaily, setExportingDaily] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Fetch HR Dashboard Data
  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setRefreshing(true);
      const res = await canteenAPI.getTodayHR({ date: selectedDate });
      if (res.data?.success && res.data?.data) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load HR Canteen data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  // Fetch Department Summary Data
  const fetchDeptData = useCallback(async () => {
    try {
      setDeptLoading(true);
      const res = await canteenAPI.getDepartmentSummary({ date: selectedDate });
      if (res.data?.success && res.data?.data) {
        setDepartmentData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch department summary:', err);
    } finally {
      setDeptLoading(false);
    }
  }, [selectedDate]);

  // Fetch Audit Logs
  const fetchAudit = useCallback(async () => {
    try {
      setAuditLoading(true);
      const res = await canteenAPI.getAuditLogs();
      if (res.data?.success && res.data?.data) {
        setAuditLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch canteen audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  // Initial and Date Change Effect
  useEffect(() => {
    fetchData();
    fetchDeptData();
  }, [selectedDate]);

  // Real-time Polling Effect (Every 15s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData(true);
      if (activeView === 'departments') {
        fetchDeptData();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedDate, activeView]);

  useEffect(() => {
    if (activeView === 'audit') {
      fetchAudit();
    }
  }, [activeView, fetchAudit]);

  // Filter employees list
  const filteredEmployees = (dashboardData.employees || []).filter((emp) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      (emp.employeeName && emp.employeeName.toLowerCase().includes(query)) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query)) ||
      (emp.designation && emp.designation.toLowerCase().includes(query));

    const matchesDept = selectedDepartment === 'ALL' || emp.department === selectedDepartment;

    let matchesStatus = true;
    if (statusFilter === 'IN') {
      matchesStatus = emp.status === 'IN' || emp.status === 'COMPLETED' || emp.lunchInAt !== null;
    } else if (statusFilter === 'CURRENTLY_IN') {
      matchesStatus = emp.status === 'IN';
    } else if (statusFilter === 'COMPLETED') {
      matchesStatus = emp.status === 'COMPLETED' || emp.status === 'FINALIZED';
    } else if (statusFilter === 'NOT_MARKED') {
      matchesStatus = emp.status === 'NOT_MARKED';
    }

    let matchesDish = true;
    if (dishTypeFilter === 'Full Dish') {
      matchesDish = emp.dishType === 'Full Dish';
    } else if (dishTypeFilter === 'Half Dish') {
      matchesDish = emp.dishType === 'Half Dish';
    }

    return matchesSearch && matchesDept && matchesStatus && matchesDish;
  });

  const uniqueDepartments = Array.from(
    new Set((dashboardData.employees || []).map((e) => e.department).filter(Boolean))
  ).sort();

  // Finalize Day Handler
  const handleFinalize = async () => {
    try {
      setFinalizing(true);
      const res = await canteenAPI.finalizeDay({ date: selectedDate });
      if (res.data?.success) {
        showToast('success', res.data.message || 'Daily Canteen count finalized successfully');
        setShowFinalizeModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Finalize error:', err);
      showToast('error', err.response?.data?.message || 'Failed to finalize canteen day');
    } finally {
      setFinalizing(false);
    }
  };

  // Reopen Day Handler
  const handleReopen = async () => {
    try {
      if (!reopenReason.trim() || reopenReason.trim().length < 5) {
        showToast('error', 'Please enter a valid authorization reason (min 5 chars)');
        return;
      }
      setReopening(true);
      const res = await canteenAPI.reopenDay({ date: selectedDate, reason: reopenReason.trim() });
      if (res.data?.success) {
        showToast('success', res.data.message || 'Canteen day unlocked successfully');
        setShowReopenModal(false);
        setReopenReason('');
        fetchData();
      }
    } catch (err) {
      console.error('Reopen error:', err);
      showToast('error', err.response?.data?.message || 'Failed to reopen canteen day');
    } finally {
      setReopening(false);
    }
  };

  // Open Record Correction Modal
  const openCorrectionModal = (empRecord) => {
    setSelectedRecordForCorrection(empRecord);
    setCorrectionInTime(empRecord.lunchInAt ? new Date(empRecord.lunchInAt).toISOString().slice(11, 16) : '');
    setCorrectionOutTime(empRecord.lunchOutAt ? new Date(empRecord.lunchOutAt).toISOString().slice(11, 16) : '');
    setCorrectionDishType(empRecord.dishType || 'Full Dish');
    setCorrectionReason(empRecord.correctionReason || '');
    setShowCorrectionModal(true);
  };

  // Save Record Correction Handler
  const handleSaveCorrection = async () => {
    try {
      if (!correctionReason.trim()) {
        showToast('error', 'Correction reason is required for compliance audit logging');
        return;
      }
      setCorrecting(true);
      const payload = {
        recordId: selectedRecordForCorrection.recordId,
        employeeId: selectedRecordForCorrection.employeeId,
        date: selectedDate,
        dishType: correctionDishType,
        lunchInTime: correctionInTime || null,
        lunchOutTime: correctionOutTime || null,
        status: (correctionInTime && correctionOutTime) ? 'COMPLETED' : (correctionInTime ? 'IN' : 'NOT_MARKED'),
        reason: correctionReason.trim()
      };

      const res = await canteenAPI.correctRecord(payload);
      if (res.data?.success) {
        showToast('success', 'Canteen record updated and logged in Audit trail');
        setShowCorrectionModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Correction save error:', err);
      showToast('error', err.response?.data?.message || 'Failed to save record correction');
    } finally {
      setCorrecting(false);
    }
  };

  // Export Daily Excel
  const handleExportDailyExcel = async () => {
    try {
      setExportingDaily(true);
      const res = await canteenAPI.exportExcel({ date: selectedDate });
      const filename = `BJK_Canteen_Lunch_Report_${selectedDate}.xlsx`;
      downloadBlobFile(res.data, filename);
      showToast('success', `Exported: ${filename}`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      showToast('error', 'Failed to generate Excel report');
    } finally {
      setExportingDaily(false);
    }
  };

  // Export Monthly Excel
  const handleExportMonthlyExcel = async () => {
    try {
      setExportingMonthly(true);
      const res = await canteenAPI.exportMonthlyExcel({ year: monthlyYear, month: monthlyMonth });
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const mName = monthNames[Number(monthlyMonth) - 1] || 'Month';
      const filename = `BJK_Canteen_Monthly_Report_${mName}_${monthlyYear}.xlsx`;
      downloadBlobFile(res.data, filename);
      showToast('success', `Exported: ${filename}`);
      setShowMonthlyModal(false);
    } catch (err) {
      console.error('Monthly Excel Export Error:', err);
      showToast('error', 'Failed to generate Monthly Excel report');
    } finally {
      setExportingMonthly(false);
    }
  };

  const summary = dashboardData.summary || {};

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen space-y-6">
      {/* 1. Header Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-[#00A896] text-white flex items-center justify-center font-extrabold shadow-md shadow-teal-500/20 flex-shrink-0">
              <Utensils size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">HR Canteen Management Dashboard</h1>
                {dashboardData.isFinalized ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 border border-teal-500/30">
                    <Lock size={12} />
                    Finalized
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Active Day
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Core HRMS — Real-Time Dining Data, Live Daily Meal Count & Excel Generation for Canteen Department
              </p>
            </div>
          </div>

          {/* Action Tools: Date, Refresh, Finalize, Export Excel */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Calendar size={14} className="text-slate-500 mr-2" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            {/* Auto-Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh
                  ? 'bg-teal-50 border-teal-200 text-[#00A896]'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title="Toggle Live Auto-Refresh (every 15s)"
            >
              <RefreshCw size={13} className={autoRefresh ? 'animate-spin text-[#00A896]' : ''} />
              <span>{autoRefresh ? 'Live Sync' : 'Paused'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchData()}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs shadow-2xs transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-teal-600' : ''} />
            </button>

            {/* Finalize / Reopen Button */}
            {dashboardData.isFinalized ? (
              <button
                type="button"
                onClick={() => setShowReopenModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 hover:bg-amber-500/20 text-xs font-bold transition-all"
              >
                <Unlock size={14} />
                <span>Reopen Day</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowFinalizeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-xs transition-all"
              >
                <Lock size={14} />
                <span>Finalize Day</span>
              </button>
            )}

            {/* Export Daily Excel Button */}
            <button
              type="button"
              onClick={handleExportDailyExcel}
              disabled={exportingDaily}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009383] text-white text-xs font-extrabold shadow-sm shadow-teal-500/20 transition-all"
            >
              <FileSpreadsheet size={15} />
              <span>{exportingDaily ? 'Exporting...' : 'EXPORT EXCEL'}</span>
            </button>

            {/* Monthly Report Button */}
            <button
              type="button"
              onClick={() => setShowMonthlyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Download size={14} />
              <span>Monthly Report</span>
            </button>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveView('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'live'
                ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={14} />
            <span>Today's Employee Live Table</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('departments');
              fetchDeptData();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'departments'
                ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 size={14} />
            <span>Department-Wise Count</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveView('audit');
              fetchAudit();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeView === 'audit'
                ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History size={14} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Canteen Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Total Staff</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{summary.totalEmployees || 0}</div>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active workforce</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50/40 p-4 rounded-xl border border-teal-300 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase text-[#00A896] tracking-wider">Lunch Req.</span>
            <Utensils size={16} className="text-[#00A896]" />
          </div>
          <div className="text-2xl font-extrabold text-[#00A896]">{summary.lunchRequired || 0}</div>
          <p className="text-[10px] text-teal-700 font-semibold mt-0.5">Total meals required</p>
        </div>

        {/* FULL DISH COUNT */}
        <div className="bg-white p-4 rounded-xl border border-teal-300/80 bg-teal-50/20 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase text-teal-800 tracking-wider">1. Full Dish</span>
            <span className="text-base">🍱</span>
          </div>
          <div className="text-2xl font-black text-teal-800">{summary.fullDishCount || 0}</div>
          <p className="text-[10px] text-teal-700 font-medium mt-0.5">Full thali meals</p>
        </div>

        {/* HALF DISH COUNT */}
        <div className="bg-white p-4 rounded-xl border border-blue-300/80 bg-blue-50/20 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase text-blue-800 tracking-wider">2. Half Dish</span>
            <span className="text-base">🥣</span>
          </div>
          <div className="text-2xl font-black text-blue-800">{summary.halfDishCount || 0}</div>
          <p className="text-[10px] text-blue-700 font-medium mt-0.5">Half thali meals</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/15 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">Lunch IN</span>
            <UserCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{summary.lunchIn || 0}</div>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Recorded IN</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/15 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-amber-700 tracking-wider">Currently IN</span>
            <Flame size={16} className="text-amber-600 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{summary.currentlyIn || 0}</div>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Currently dining</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200/80 bg-teal-50/15 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-teal-700 tracking-wider">Completed</span>
            <CheckCircle2 size={16} className="text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-700">{summary.completed || 0}</div>
          <p className="text-[10px] text-teal-600 font-medium mt-0.5">With OUT punch</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200/80 bg-rose-50/15 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase text-rose-700 tracking-wider">Not Marked</span>
            <UserX size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">{summary.notMarked || 0}</div>
          <p className="text-[10px] text-rose-600 font-medium mt-0.5">Pending / skipped</p>
        </div>
      </div>

      {/* 3. Canteen Department Requirement Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-teal-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-teal-400/20 text-teal-300 font-bold text-[10px] uppercase tracking-wider border border-teal-400/30">
                CANTEEN DEPARTMENT VIEW
              </span>
              <span className="text-xs text-teal-200 font-semibold">Date: {dashboardData.dateDisplay}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight mt-1">
              Food Preparation Target: <span className="text-teal-300">{summary.lunchRequired || 0} Meals Total</span>
            </h2>
            <p className="text-xs text-teal-100/80 font-normal mt-1 max-w-2xl">
              Breakdown: <strong className="text-white">🍱 {summary.fullDishCount || 0} Full Dishes</strong> &bull; <strong className="text-white">🥣 {summary.halfDishCount || 0} Half Dishes</strong>. Total Workforce: {summary.totalEmployees} | Dining: {summary.currentlyIn} | Completed: {summary.completed} | Not Marked: {summary.notMarked}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-teal-500/20 backdrop-blur-md border border-teal-400/30 text-center">
              <span className="text-[10px] uppercase tracking-wider text-teal-200 font-bold">1. Full Dish</span>
              <div className="text-xl font-black text-white mt-0.5">{summary.fullDishCount || 0} Portions</div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-center">
              <span className="text-[10px] uppercase tracking-wider text-blue-200 font-bold">2. Half Dish</span>
              <div className="text-xl font-black text-white mt-0.5">{summary.halfDishCount || 0} Portions</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN VIEW CONTENT */}

      {/* VIEW 1: LIVE TODAY EMPLOYEE LUNCH TABLE */}
      {activeView === 'live' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-4 p-4 lg:p-5">
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee by name, ID, department, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Department Filter */}
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Dish Type Filter */}
              <select
                value={dishTypeFilter}
                onChange={(e) => setDishTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold text-slate-700"
              >
                <option value="ALL">All Portions (Full & Half)</option>
                <option value="Full Dish">🍱 Full Dish Only</option>
                <option value="Half Dish">🥣 Half Dish Only</option>
              </select>

              {/* Status Tabs */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-bold">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'IN', label: 'Lunch IN' },
                  { id: 'CURRENTLY_IN', label: 'Currently IN' },
                  { id: 'COMPLETED', label: 'Completed' },
                  { id: 'NOT_MARKED', label: 'Not Marked' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statusFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Dish Type</th>
                  <th className="py-3 px-4">Lunch IN</th>
                  <th className="py-3 px-4">Lunch OUT</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400">
                      <RefreshCw size={22} className="animate-spin text-teal-600 mx-auto mb-2" />
                      Loading live canteen records...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-10 text-center text-slate-400">
                      No employee lunch records found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-extrabold text-slate-900">{emp.employeeId}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {emp.employeeName}
                        {emp.correctionReason && (
                          <span className="block text-[9px] text-amber-600 font-semibold">
                            Corrected: {emp.correctionReason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                      <td className="py-3 px-4 text-slate-500">{emp.designation}</td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{emp.dateDisplay}</td>
                      <td className="py-3 px-4 font-bold">
                        {emp.dishType === 'Full Dish' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                            🍱 Full Dish
                          </span>
                        ) : emp.dishType === 'Half Dish' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                            🥣 Half Dish
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {emp.lunchInDisplay || '--'}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-700">
                        {emp.lunchOutDisplay || '--'}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {emp.durationDisplay || '--'}
                      </td>
                      <td className="py-3 px-4">
                        {emp.status === 'IN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            IN
                          </span>
                        ) : emp.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Completed
                          </span>
                        ) : emp.status === 'FINALIZED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                            Finalized
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Not Marked
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openCorrectionModal(emp)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 hover:bg-teal-50 border border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Correct/Adjust employee record"
                        >
                          <Edit size={12} />
                          <span>Correct</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="text-xs text-slate-400 font-medium px-1 flex items-center justify-between">
            <span>Showing {filteredEmployees.length} of {dashboardData.employees?.length || 0} employees</span>
            <span>Live data connects directly to Employee Lunch IN/OUT actions</span>
          </div>
        </div>
      )}

      {/* VIEW 2: DEPARTMENT-WISE COUNT */}
      {activeView === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Department-Wise Lunch Counts</h2>
              <p className="text-xs text-slate-500 font-medium">
                Operational food preparation & workforce dining analysis for {dashboardData.dateDisplay}
              </p>
            </div>
            <button
              onClick={fetchDeptData}
              disabled={deptLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RefreshCw size={13} className={deptLoading ? 'animate-spin text-teal-600' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Total Employees</th>
                  <th className="py-3 px-4 text-center">Lunch Required</th>
                  <th className="py-3 px-4 text-center">Full Dish</th>
                  <th className="py-3 px-4 text-center">Half Dish</th>
                  <th className="py-3 px-4 text-center">Completed</th>
                  <th className="py-3 px-4 text-center">Currently IN</th>
                  <th className="py-3 px-4 text-center">Not Marked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {deptLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading department breakdown...
                    </td>
                  </tr>
                ) : departmentData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No department data available.
                    </td>
                  </tr>
                ) : (
                  departmentData.map((dept) => (
                    <tr key={dept.department} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{dept.department}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">{dept.totalEmployees}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-teal-700 bg-teal-50/40">
                        {dept.lunchIn}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-teal-800 bg-teal-50/20">
                        {dept.fullDish || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-800 bg-blue-50/20">
                        {dept.halfDish || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-emerald-700">{dept.completed}</td>
                      <td className="py-3 px-4 text-center font-semibold text-amber-700">{dept.currentlyIn}</td>
                      <td className="py-3 px-4 text-center font-semibold text-rose-700">{dept.notMarked}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: AUDIT TRAIL */}
      {activeView === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Immutable Canteen Audit Log</h2>
              <p className="text-xs text-slate-500 font-medium">
                Complete historical record of Lunch IN/OUT punches, HR corrections, and daily finalizations
              </p>
            </div>
            <button
              onClick={fetchAudit}
              disabled={auditLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <RefreshCw size={13} className={auditLoading ? 'animate-spin text-teal-600' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Target Employee</th>
                  <th className="py-3 px-4">Details / Reason</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No canteen audit records found.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : '--'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{log.action}</td>
                      <td className="py-3 px-4 text-slate-700">{log.user?.name || 'System'}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {log.targetUser?.name || log.targetUser?.employeeId || '--'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {log.details}
                        {log.reason && log.reason !== log.details && (
                          <span className="block text-[10px] text-amber-700 font-semibold mt-0.5">
                            Reason: {log.reason}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {log.status || 'SUCCESS'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODALS */}

      {/* FINALIZATION CONFIRMATION MODAL */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00A896] flex items-center justify-center mb-4 border border-teal-200">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Finalize Today's Canteen Count</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Are you sure you want to finalize today's canteen lunch count for <strong>{dashboardData.dateDisplay}</strong>?
            </p>

            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <strong className="text-slate-800">{dashboardData.dateDisplay}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Workforce:</span>
                <strong className="text-slate-800">{summary.totalEmployees}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-700 font-bold">Final Lunch Required:</span>
                <strong className="text-teal-700 font-bold">{summary.lunchRequired} Meals</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completed Lunches:</span>
                <strong className="text-slate-800">{summary.completed}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              This action will lock the report from accidental modification and preserve the audit log for the Canteen Department.
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                disabled={finalizing}
                className="px-5 py-2 text-xs font-extrabold text-white bg-[#00A896] hover:bg-[#009383] rounded-xl shadow-sm transition-all"
              >
                {finalizing ? 'Finalizing...' : 'Confirm & Finalize Day'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REOPEN DAY MODAL */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-200">
              <Unlock size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Reopen Canteen Records</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Provide an authorized justification to reopen records for <strong>{dashboardData.dateDisplay}</strong>.
            </p>

            <div className="my-4">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Authorization Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="Enter mandatory audit reason (e.g. Late shift dining adjustments authorized by HR Manager)..."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopen}
                disabled={reopening}
                className="px-5 py-2 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all"
              >
                {reopening ? 'Reopening...' : 'Authorize & Reopen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD CORRECTION MODAL */}
      {showCorrectionModal && selectedRecordForCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Correct Canteen Record</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedRecordForCorrection.employeeName} ({selectedRecordForCorrection.employeeId})
                </p>
              </div>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lunch IN Time (HH:MM)</label>
                  <input
                    type="time"
                    value={correctionInTime}
                    onChange={(e) => setCorrectionInTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Lunch OUT Time (HH:MM)</label>
                  <input
                    type="time"
                    value={correctionOutTime}
                    onChange={(e) => setCorrectionOutTime(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Meal Portion (Dish Type) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCorrectionDishType('Full Dish')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left font-bold transition-all ${
                      correctionDishType === 'Full Dish'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/30'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">🍱</span>
                    <div>
                      <p className="text-xs leading-none">Full Dish</p>
                      <span className="text-[10px] text-slate-400 font-normal">Complete Meal</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCorrectionDishType('Half Dish')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 text-left font-bold transition-all ${
                      correctionDishType === 'Half Dish'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/30'
                        : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">🥣</span>
                    <div>
                      <p className="text-xs leading-none">Half Dish</p>
                      <span className="text-[10px] text-slate-400 font-normal">Light Meal</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Correction Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Employee forgot to punch OUT upon return from dining hall..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                disabled={correcting}
                className="px-5 py-2 text-xs font-extrabold text-white bg-[#00A896] hover:bg-[#009383] rounded-xl shadow-sm transition-all"
              >
                {correcting ? 'Saving...' : 'Save & Log Correction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MONTHLY REPORT EXPORT MODAL */}
      {showMonthlyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet size={20} className="text-[#00A896]" />
                <h3 className="text-base font-extrabold text-slate-900">Generate Monthly Canteen Report</h3>
              </div>
              <button
                onClick={() => setShowMonthlyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <p className="text-slate-500">
                Generates a 4-sheet enterprise Excel workbook containing Monthly Summary, Daily Counts, Employee-wise records, and Department-wise summaries for submission to the Canteen Department.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Month</label>
                  <select
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                  >
                    {[
                      'January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'
                    ].map((m, idx) => (
                      <option key={m} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowMonthlyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportMonthlyExcel}
                disabled={exportingMonthly}
                className="px-5 py-2 text-xs font-extrabold text-white bg-[#00A896] hover:bg-[#009383] rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>{exportingMonthly ? 'Generating Excel...' : 'Generate & Download Excel'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRCanteenManagement;
