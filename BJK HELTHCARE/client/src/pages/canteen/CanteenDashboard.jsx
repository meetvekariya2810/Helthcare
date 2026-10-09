import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  canteenAPI,
  downloadBlobFile
} from '../../services/api';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  RefreshCw,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Flame,
  ChefHat,
  Sparkles,
  ArrowRight,
  UserCheck,
  Coffee,
  Info,
  SlidersHorizontal,
  History,
  CheckCircle,
  XCircle,
  HelpCircle,
  Save,
  Check,
  BarChart3,
  Trash2,
  RotateCcw
} from 'lucide-react';

export const CanteenDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const setActiveTab = (tabId) => {
    setSearchParams(tabId === 'dashboard' ? {} : { tab: tabId });
  };

  // -------------------------------------------------------------
  // Operational State
  // -------------------------------------------------------------
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [countdown, setCountdown] = useState(10);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilterMode, setDateFilterMode] = useState('today'); // 'today', 'yesterday', 'custom'

  // Employee history tab state
  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeHistoryData, setEmployeeHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  // Monthly report tab state
  const [monthlyYear, setMonthlyYear] = useState(() => new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(() => new Date().getMonth() + 1);
  const [monthlyReportData, setMonthlyReportData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  // Department summary state
  const [deptSummaryData, setDeptSummaryData] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // Settings tab state
  const [settingsData, setSettingsData] = useState({
    departmentName: 'BJK Healthcare Canteen Department',
    cafeteriaLocation: 'Ground Floor Central Dining Hall (Unit-1)',
    inChargeName: 'Canteen Supervisor / Catering Manager',
    contactExtension: 'Ext. 402 / 403',
    lunchStartTime: '12:30',
    lunchEndTime: '14:30',
    gracePeriodMinutes: 15,
    dailyTargetCapacity: 250,
    bufferPercent: 10,
    autoRefreshIntervalSeconds: 10,
    allowDishTypeSelection: true,
    defaultDishType: 'Full Dish',
    enableNotificationThresholds: true
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  const handleResetAllData = async () => {
    setResetLoading(true);
    try {
      const res = await canteenAPI.resetAllData();
      if (res.data && res.data.success) {
        showToast('success', res.data.message || 'All canteen data deleted successfully. Ready for new Lunch IN/OUT.');
        setShowResetModal(false);
        fetchDashboard();
        fetchDepartmentSummary();
        fetchAllEmployees();
      } else {
        showToast('error', res.data?.message || 'Failed to reset canteen data');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to reset canteen data');
    } finally {
      setResetLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Data Loaders
  // -------------------------------------------------------------
  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');

    try {
      const res = await canteenAPI.getDashboard({ date: selectedDate });
      if (res.data && res.data.success) {
        setDashboardData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load canteen dashboard');
      }
    } catch (err) {
      console.error('[Canteen Dashboard Error]:', err);
      setError(err.response?.data?.message || 'Failed to connect to Canteen backend service');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(refreshInterval);
    }
  };

  const fetchDepartmentSummary = async () => {
    setDeptLoading(true);
    try {
      const res = await canteenAPI.getCanteenDepartmentSummary({ date: selectedDate });
      if (res.data && res.data.success) {
        setDeptSummaryData(res.data.data || []);
      }
    } catch (err) {
      console.error('[Dept Summary Error]:', err);
    } finally {
      setDeptLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setMonthlyLoading(true);
    try {
      const res = await canteenAPI.getMonthlyReport({ year: monthlyYear, month: monthlyMonth });
      if (res.data && res.data.success) {
        setMonthlyReportData(res.data);
      }
    } catch (err) {
      console.error('[Monthly Report Error]:', err);
    } finally {
      setMonthlyLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const res = await canteenAPI.getEmployees({ date: selectedDate });
      if (res.data && res.data.success) {
        setAllEmployeesList(res.data.data || []);
        if (res.data.data?.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(res.data.data[0].employeeId);
        }
      }
    } catch (err) {
      console.error('[Employees List Error]:', err);
    }
  };

  const fetchEmployeeHistory = async (empId) => {
    if (!empId) return;
    setHistoryLoading(true);
    try {
      const res = await canteenAPI.getEmployeeHistory(empId);
      if (res.data && res.data.success) {
        setEmployeeHistoryData(res.data);
      }
    } catch (err) {
      console.error('[Employee History Error]:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await canteenAPI.getSettings();
      if (res.data && res.data.success && res.data.data) {
        setSettingsData(res.data.data);
        if (res.data.data.autoRefreshIntervalSeconds) {
          setRefreshInterval(res.data.data.autoRefreshIntervalSeconds);
        }
      }
    } catch (err) {
      console.error('[Settings Error]:', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await canteenAPI.updateSettings(settingsData);
      if (res.data && res.data.success) {
        showToast('success', 'Canteen settings saved successfully');
      } else {
        showToast('error', res.data?.message || 'Failed to save settings');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboard();
    fetchDepartmentSummary();
    fetchAllEmployees();
    fetchSettings();
  }, [selectedDate]);

  // Load employee history when selectedEmployeeId changes
  useEffect(() => {
    if (selectedEmployeeId) {
      fetchEmployeeHistory(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  // Load monthly report when tab is active or year/month changes
  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyReport();
    }
  }, [activeTab, monthlyYear, monthlyMonth]);

  // Live Auto-Refresh Timer
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchDashboard(true);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, refreshInterval, selectedDate]);

  // Quick date filters
  const handleDateMode = (mode) => {
    setDateFilterMode(mode);
    const today = new Date();
    if (mode === 'today') {
      setSelectedDate(today.toISOString().split('T')[0]);
    } else if (mode === 'yesterday') {
      const yest = new Date(today);
      yest.setDate(today.getDate() - 1);
      setSelectedDate(yest.toISOString().split('T')[0]);
    }
  };

  // -------------------------------------------------------------
  // Excel Export Handlers
  // -------------------------------------------------------------
  const [exportingDaily, setExportingDaily] = useState(false);
  const [exportingMonthly, setExportingMonthly] = useState(false);

  const handleExportDailyExcel = async () => {
    setExportingDaily(true);
    try {
      const res = await canteenAPI.exportDailyExcel({ date: selectedDate });
      const filename = `BJK_Canteen_Daily_Report_${selectedDate}.xlsx`;
      downloadBlobFile(res.data, filename);
      showToast('success', `Exported: ${filename}`);
    } catch (err) {
      console.error('[Export Daily Excel Error]:', err);
      showToast('error', 'Failed to generate Daily Excel report');
    } finally {
      setExportingDaily(false);
    }
  };

  const handleExportMonthlyExcel = async () => {
    setExportingMonthly(true);
    try {
      const res = await canteenAPI.exportMonthlyReportExcel({ year: monthlyYear, month: monthlyMonth });
      const mName = new Date(monthlyYear, monthlyMonth - 1, 1).toLocaleString('en-US', { month: 'long' });
      const filename = `BJK_Canteen_Monthly_Report_${mName}_${monthlyYear}.xlsx`;
      downloadBlobFile(res.data, filename);
      showToast('success', `Exported: ${filename}`);
    } catch (err) {
      console.error('[Export Monthly Excel Error]:', err);
      showToast('error', 'Failed to generate Monthly Excel report');
    } finally {
      setExportingMonthly(false);
    }
  };

  // -------------------------------------------------------------
  // Filtered Table Data for Today's List
  // -------------------------------------------------------------
  const filteredEmployees = useMemo(() => {
    if (!dashboardData?.employees) return [];
    let list = dashboardData.employees;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(emp =>
        emp.employeeId?.toLowerCase().includes(q) ||
        emp.employeeName?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q)
      );
    }

    // Department filter
    if (selectedDept !== 'ALL') {
      list = list.filter(emp => emp.department === selectedDept);
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      list = list.filter(emp => {
        if (selectedStatus === 'NOT_MARKED') return emp.status === 'NOT_MARKED';
        if (selectedStatus === 'IN') return emp.status === 'IN';
        if (selectedStatus === 'COMPLETED') return emp.status === 'COMPLETED' || emp.status === 'FINALIZED';
        return true;
      });
    }

    return list;
  }, [dashboardData, searchQuery, selectedDept, selectedStatus]);

  // Unique departments for filter dropdown
  const departmentList = useMemo(() => {
    if (!dashboardData?.employees) return [];
    const depts = new Set(dashboardData.employees.map(e => e.department).filter(Boolean));
    return Array.from(depts).sort();
  }, [dashboardData]);

  // Summary Metrics
  const summary = dashboardData?.summary || {
    totalEmployees: 0,
    lunchRequired: 0,
    lunchIn: 0,
    lunchOut: 0,
    currentlyIn: 0,
    notMarked: 0,
    completed: 0,
    fullDishCount: 0,
    halfDishCount: 0
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-4 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. HEADER & HERO BANNER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#00A896] border border-teal-200">
              CANTEEN MANAGEMENT
            </span>
            <span className="text-xs text-slate-400 font-medium">BJK Healthcare Enterprise</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Canteen Management Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            BJK Healthcare — Canteen Department | Live Lunch Monitoring & Food Requirement
          </p>
        </div>

        {/* Date Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Date Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => handleDateMode('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilterMode === 'today' ? 'bg-white text-[#00A896] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handleDateMode('yesterday')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateFilterMode === 'yesterday' ? 'bg-white text-[#00A896] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yesterday
            </button>
          </div>

          {/* Custom Date Input */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setDateFilterMode('custom');
                setSelectedDate(e.target.value);
              }}
              className="bg-transparent border-none outline-none text-slate-800 text-xs font-bold cursor-pointer"
            />
          </div>

          {/* Live Auto-Refresh Button & Indicator */}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Refresh canteen records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#00A896]' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            {autoRefresh && (
              <span className="text-[10px] text-slate-400 font-mono">({countdown}s)</span>
            )}
          </button>
        </div>
      </div>

      {/* 2. SECTION 10: PROMINENT TODAY'S LUNCH REQUIREMENT BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00A896]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left Requirement Pipeline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <ChefHat className="w-4 h-4 text-emerald-400" />
                <span>KITCHEN OPERATIONS — FOOD PREPARATION TARGET</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Today's Lunch Requirement
              </h2>

              {/* Dynamic Flow: Total Employees -> Lunch IN -> Final Target */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs">
                <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
                  <span className="text-slate-400 block text-[11px] font-medium">Total Employees</span>
                  <span className="text-base font-extrabold text-white">{summary.totalEmployees}</span>
                </div>

                <div className="text-slate-500">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
                  <span className="text-slate-400 block text-[11px] font-medium">Employees with Lunch IN</span>
                  <span className="text-base font-extrabold text-[#00A896]">{summary.lunchIn}</span>
                </div>

                <div className="text-slate-500">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="bg-gradient-to-r from-[#00A896]/30 to-emerald-500/30 px-4 py-2.5 rounded-2xl border border-emerald-400/40">
                  <span className="text-emerald-300 block text-[11px] font-bold uppercase tracking-wider">
                    Preparation Target
                  </span>
                  <span className="text-base font-black text-white">{summary.lunchRequired} Lunches</span>
                </div>
              </div>
            </div>

            {/* Right Big Highlight Number */}
            <div className="bg-white/10 backdrop-blur-md px-6 sm:px-8 py-5 rounded-3xl border border-white/20 text-center lg:text-right shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block">
                FINAL LUNCH REQUIREMENT
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white my-1">
                {summary.lunchRequired} <span className="text-2xl sm:text-3xl text-emerald-400">LUNCHES</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Live meals required for {dashboardData?.dateDisplay || selectedDate}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 3. SECTION 5: TOP KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        
        {/* Total Employees */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Employees</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {summary.totalEmployees}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Active Workforce</span>
        </div>

        {/* Today's Lunch Required */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-4 rounded-2xl shadow-md text-white">
          <div className="flex items-center justify-between text-teal-100 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Lunch Required</span>
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {summary.lunchRequired}
          </div>
          <span className="text-[10px] text-teal-100 font-bold mt-1 block">Preparation Count</span>
        </div>

        {/* Lunch IN */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lunch IN</span>
            <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700">
            {summary.lunchIn}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Marked IN</span>
        </div>

        {/* Lunch OUT */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lunch OUT</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700">
            {summary.lunchOut}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Exited Canteen</span>
        </div>

        {/* Currently IN */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider">Currently IN</span>
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {summary.currentlyIn}
          </div>
          <span className="text-[10px] text-amber-700/80 font-bold mt-1 block">Dining Active</span>
        </div>

        {/* Not Marked */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Not Marked</span>
            <XCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-700">
            {summary.notMarked}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Not Taken</span>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-700">
            {summary.completed}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Finished Dining</span>
        </div>

      </div>

      {/* 4. NAVIGATION TABS (Sections 19, 6, 12, 13, 14, 15, 17, 20) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-1">
        {[
          { id: 'dashboard', label: "Today's Lunch Status", icon: UtensilsCrossed },
          { id: 'today', label: "Live Dining Table", icon: LayoutDashboard },
          { id: 'employees', label: 'Employee Canteen History', icon: History },
          { id: 'daily', label: 'Daily Reports', icon: Calendar },
          { id: 'monthly', label: 'Monthly Reports', icon: BarChart3 },
          { id: 'department', label: 'Department Summary', icon: Building2 },
          { id: 'export', label: 'Export Excel', icon: FileSpreadsheet },
          { id: 'settings', label: 'Canteen Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = (activeTab === 'dashboard' && tab.id === 'dashboard') ||
            (activeTab === 'today' && tab.id === 'today') ||
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================= */}
      {/* TAB CONTENT: 1. TODAY'S LUNCH & LIVE DINING STATUS TABLE */}
      {/* ============================================================= */}
      {(activeTab === 'dashboard' || activeTab === 'today') && (
        <div className="space-y-4">
          
          {/* Filters & Search Header (Sections 8 & 9) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Today's Employee Lunch Status ({filteredEmployees.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time dining logs for {dashboardData?.dateDisplay || selectedDate}
                </p>
              </div>

              {/* Quick Excel Export for Today */}
              <button
                onClick={handleExportDailyExcel}
                disabled={exportingDaily}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exportingDaily ? 'Exporting...' : 'Export Today Excel'}</span>
              </button>
            </div>

            {/* Filter Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              
              {/* Search Employee (Section 8) */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, name, department..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#00A896] outline-none transition-all"
                />
              </div>

              {/* Department Filter (Section 9) */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-[#00A896] outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {departmentList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Lunch Status Filter (Section 9) */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:border-[#00A896] outline-none"
                >
                  <option value="ALL">All Lunch Statuses</option>
                  <option value="IN">Lunch IN (Dining Active)</option>
                  <option value="COMPLETED">Completed (Lunch OUT)</option>
                  <option value="NOT_MARKED">Not Marked</option>
                </select>
              </div>

            </div>
          </div>

          {/* Section 6: Main Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-[11px] tracking-wider uppercase">
                    <th className="py-3.5 px-4 w-12 text-center">Sr. No.</th>
                    <th className="py-3.5 px-4">Employee ID</th>
                    <th className="py-3.5 px-4">Employee Name</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Designation</th>
                    <th className="py-3.5 px-4">Lunch IN</th>
                    <th className="py-3.5 px-4">Lunch OUT</th>
                    <th className="py-3.5 px-4 text-center">Duration</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <div className="inline-flex items-center gap-2 text-xs font-bold">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#00A896]" />
                          <span>Loading canteen dining records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400 text-xs font-semibold">
                        No canteen records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp, idx) => {
                      let statusBadge;
                      if (emp.status === 'IN') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Flame className="w-3 h-3 text-amber-600" />
                            Lunch IN (Dining)
                          </span>
                        );
                      } else if (emp.status === 'COMPLETED' || emp.status === 'FINALIZED') {
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Completed
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200">
                            Not Marked
                          </span>
                        );
                      }

                      return (
                        <tr key={emp.employeeId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{emp.employeeName}</td>
                          <td className="py-3 px-4 text-slate-600">{emp.department}</td>
                          <td className="py-3 px-4 text-slate-500">{emp.designation}</td>
                          <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{emp.lunchInDisplay || '--'}</td>
                          <td className="py-3 px-4 font-mono text-blue-700 font-bold">{emp.lunchOutDisplay || '--'}</td>
                          <td className="py-3 px-4 text-center font-mono">{emp.durationDisplay || '--'}</td>
                          <td className="py-3 px-4 text-center">{statusBadge}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB CONTENT: 2. EMPLOYEE-WISE CANTEEN HISTORY (Section 12) */}
      {/* ============================================================= */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Employee Selector */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Select Employee</h3>
              <p className="text-xs text-slate-500 font-medium">Choose an employee to view their full canteen history</p>
            </div>

            {/* Search filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                placeholder="Filter employee list..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:border-[#00A896] outline-none"
              />
            </div>

            {/* Employee Scrollable List */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {allEmployeesList
                .filter(e => 
                  !employeeSearchTerm ||
                  e.employeeId.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                  e.employeeName.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
                  e.department.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                )
                .map(emp => (
                  <button
                    key={emp.employeeId}
                    onClick={() => setSelectedEmployeeId(emp.employeeId)}
                    className={`w-full p-3 rounded-2xl text-left text-xs transition-all flex items-center justify-between border ${
                      selectedEmployeeId === emp.employeeId
                        ? 'bg-[#00A896]/10 border-[#00A896] text-slate-900 font-bold'
                        : 'bg-slate-50/60 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{emp.employeeName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.employeeId} • {emp.department}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${selectedEmployeeId === emp.employeeId ? 'text-[#00A896]' : 'text-slate-300'}`} />
                  </button>
                ))}
            </div>
          </div>

          {/* Right: History Details */}
          <div className="lg:col-span-2 space-y-4">
            {employeeHistoryData?.employee && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase mb-1">
                    EMPLOYEE CANTEEN PROFILE
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {employeeHistoryData.employee.employeeName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    ID: <strong className="font-mono text-slate-700">{employeeHistoryData.employee.employeeId}</strong> • {employeeHistoryData.employee.department} • {employeeHistoryData.employee.designation}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Lunches</span>
                    <span className="text-lg font-black text-[#00A896]">{employeeHistoryData.employee.totalLunchesTaken}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Completed</span>
                    <span className="text-lg font-black text-slate-800">{employeeHistoryData.employee.totalCompletedLunches}</span>
                  </div>
                </div>
              </div>
            )}

            {/* History Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Historical Canteen Lunch Records
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {employeeHistoryData?.count || 0} Total Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-white font-black text-[11px] uppercase">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Lunch IN</th>
                      <th className="py-3 px-4">Lunch OUT</th>
                      <th className="py-3 px-4 text-center">Duration</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {historyLoading ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-slate-400 text-xs font-bold">
                          Loading history...
                        </td>
                      </tr>
                    ) : !employeeHistoryData?.data || employeeHistoryData.data.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-slate-400 text-xs font-semibold">
                          No historical lunch records found for this employee.
                        </td>
                      </tr>
                    ) : (
                      employeeHistoryData.data.map((rec) => (
                        <tr key={rec.id || rec.date} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-bold text-slate-900">{rec.dateDisplay || rec.date}</td>
                          <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{rec.lunchInDisplay || '--'}</td>
                          <td className="py-3 px-4 font-mono text-blue-700 font-bold">{rec.lunchOutDisplay || '--'}</td>
                          <td className="py-3 px-4 text-center font-mono">{rec.durationDisplay || '--'}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB CONTENT: 3. DAILY REPORTS (Section 13) */}
      {/* ============================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Daily Canteen Report</h3>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive meal breakdown for date: <strong className="text-slate-800">{selectedDate}</strong>
              </p>
            </div>

            <button
              onClick={handleExportDailyExcel}
              disabled={exportingDaily}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00A896] hover:bg-[#009686] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00A896]/20 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{exportingDaily ? 'Exporting...' : 'Download Daily Excel (.xlsx)'}</span>
            </button>
          </div>

          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-400 font-bold uppercase block">Total Workforce</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{summary.totalEmployees}</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-700 font-bold uppercase block">Total Lunches Served</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">{summary.lunchIn}</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
              <span className="text-xs text-blue-700 font-bold uppercase block">Completed Lunches</span>
              <span className="text-2xl font-black text-blue-800 mt-1 block">{summary.completed}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase block">Not Marked</span>
              <span className="text-2xl font-black text-slate-700 mt-1 block">{summary.notMarked}</span>
            </div>
          </div>

          {/* Detailed Employee Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Daily Employee Meal Records
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-[11px] uppercase">
                    <th className="py-3 px-4 w-12 text-center">Sr.</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Lunch IN</th>
                    <th className="py-3 px-4">Lunch OUT</th>
                    <th className="py-3 px-4 text-center">Duration</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dashboardData?.employees?.map((emp, idx) => (
                    <tr key={emp.employeeId || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{emp.employeeId}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{emp.employeeName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{emp.department}</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-700 font-bold">{emp.lunchInDisplay || '--'}</td>
                      <td className="py-2.5 px-4 font-mono text-blue-700 font-bold">{emp.lunchOutDisplay || '--'}</td>
                      <td className="py-2.5 px-4 text-center font-mono">{emp.durationDisplay || '--'}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'IN' ? 'bg-amber-100 text-amber-800' :
                          emp.status === 'COMPLETED' || emp.status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB CONTENT: 4. MONTHLY REPORTS (Section 14) */}
      {/* ============================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          
          {/* Header & Month Selector */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Monthly Canteen Reports</h3>
              <p className="text-xs text-slate-500 font-medium">
                Aggregated monthly statistics & daily meal distribution
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#00A896] outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => {
                  const mName = new Date(2026, i, 1).toLocaleString('en-US', { month: 'long' });
                  return <option key={i + 1} value={i + 1}>{mName}</option>;
                })}
              </select>

              <select
                value={monthlyYear}
                onChange={(e) => setMonthlyYear(Number(e.target.value))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#00A896] outline-none"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>

              <button
                onClick={handleExportMonthlyExcel}
                disabled={exportingMonthly}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A896] hover:bg-[#009686] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00A896]/20 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{exportingMonthly ? 'Exporting...' : 'Export Monthly Excel'}</span>
              </button>
            </div>
          </div>

          {/* Monthly KPI Cards */}
          {monthlyReportData?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-xs text-slate-400 font-bold uppercase block">Total Workforce</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {monthlyReportData.summary.totalWorkforce}
                </span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-700 font-bold uppercase block">Total Monthly Lunches</span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">
                  {monthlyReportData.summary.totalMonthlyLunches}
                </span>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200">
                <span className="text-xs text-blue-700 font-bold uppercase block">Avg. Lunches / Day</span>
                <span className="text-2xl font-black text-blue-800 mt-1 block">
                  {monthlyReportData.summary.averageLunchesPerDay}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 font-bold uppercase block">Days in Month</span>
                <span className="text-2xl font-black text-slate-700 mt-1 block">
                  {monthlyReportData.summary.daysInMonth}
                </span>
              </div>
            </div>
          )}

          {/* Daily Breakdown Table for the Month */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Daily Lunch Count Breakdown ({monthlyReportData?.monthDisplay})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-[11px] uppercase">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4 text-center">Total Workforce</th>
                    <th className="py-3 px-4 text-center font-bold text-emerald-400">Lunch IN</th>
                    <th className="py-3 px-4 text-center">Completed</th>
                    <th className="py-3 px-4 text-center">Not Marked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {monthlyLoading ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-400 text-xs font-bold">
                        Loading monthly breakdown...
                      </td>
                    </tr>
                  ) : !monthlyReportData?.dailyBreakdown || monthlyReportData.dailyBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-400 text-xs font-semibold">
                        No monthly records found.
                      </td>
                    </tr>
                  ) : (
                    monthlyReportData.dailyBreakdown.map((row) => (
                      <tr key={row.date} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{row.dateDisplay || row.date}</td>
                        <td className="py-2.5 px-4 text-slate-500 font-medium">{row.day}</td>
                        <td className="py-2.5 px-4 text-center text-slate-700">{row.totalWorkforce}</td>
                        <td className="py-2.5 px-4 text-center font-bold text-emerald-700 font-mono text-sm">
                          {row.lunchIn}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono">{row.completed}</td>
                        <td className="py-2.5 px-4 text-center text-slate-400 font-mono">{row.notMarked}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB CONTENT: 5. DEPARTMENT SUMMARY (Section 15) */}
      {/* ============================================================= */}
      {activeTab === 'department' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Department Lunch Summary</h3>
              <p className="text-xs text-slate-500 font-medium">
                Department-wise meal demand for {dashboardData?.dateDisplay || selectedDate}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-[11px] uppercase">
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4 text-center">Employees</th>
                    <th className="py-3.5 px-4 text-center text-emerald-400 font-bold">Lunch IN</th>
                    <th className="py-3.5 px-4 text-center">Lunch OUT</th>
                    <th className="py-3.5 px-4 text-center text-amber-300 font-bold">Currently IN</th>
                    <th className="py-3.5 px-4 text-center">Not Marked</th>
                    <th className="py-3.5 px-4 text-center bg-[#00A896] text-white">Lunch Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {deptLoading ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-400 text-xs font-bold">
                        Loading department summary...
                      </td>
                    </tr>
                  ) : deptSummaryData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-slate-400 text-xs font-semibold">
                        No department data available.
                      </td>
                    </tr>
                  ) : (
                    deptSummaryData.map((d) => (
                      <tr key={d.department} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{d.department}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">{d.totalEmployees}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 font-mono text-sm">{d.lunchIn}</td>
                        <td className="py-3 px-4 text-center text-blue-700 font-mono">{d.lunchOut}</td>
                        <td className="py-3 px-4 text-center font-bold text-amber-700 font-mono">{d.currentlyIn}</td>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{d.notMarked}</td>
                        <td className="py-3 px-4 text-center font-black text-emerald-800 bg-emerald-50/60 font-mono text-sm">
                          {d.lunchRequired}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB CONTENT: 6. EXCEL EXPORT CENTER (Sections 16, 17, 18) */}
      {/* ============================================================= */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Daily Report Export Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Daily Canteen Report</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Generates a multi-sheet Microsoft Excel workbook containing:
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                <li><strong>Sheet 1 — Summary:</strong> Total Employees, Lunch Required, Lunch IN, Lunch OUT, Currently IN, Not Marked.</li>
                <li><strong>Sheet 2 — Employee Details:</strong> Sr. No., Employee ID, Name, Department, Designation, Lunch IN/OUT, Duration, Status.</li>
                <li><strong>Sheet 3 — Department Summary:</strong> Department meal requirement breakdown.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Selected Date:</span>
                <span className="font-bold text-slate-900 font-mono">{selectedDate}</span>
              </div>
              <button
                onClick={handleExportDailyExcel}
                disabled={exportingDaily}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportingDaily ? 'Generating Workbook...' : 'Download Daily Excel (.xlsx)'}</span>
              </button>
            </div>
          </div>

          {/* Monthly Report Export Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Monthly Canteen Report</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Generates a full month enterprise Excel workbook containing:
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 font-medium">
                <li><strong>Sheet 1 — Monthly Summary:</strong> Month totals and workforce averages.</li>
                <li><strong>Sheet 2 — Daily Lunch Counts:</strong> Day-by-day lunch requirement counts.</li>
                <li><strong>Sheet 3 — Employee-wise Records:</strong> Detailed monthly meal history.</li>
                <li><strong>Sheet 4 — Department-wise Summary:</strong> Department monthly breakdown.</li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={monthlyMonth}
                  onChange={(e) => setMonthlyMonth(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const mName = new Date(2026, i, 1).toLocaleString('en-US', { month: 'long' });
                    return <option key={i + 1} value={i + 1}>{mName}</option>;
                  })}
                </select>
                <select
                  value={monthlyYear}
                  onChange={(e) => setMonthlyYear(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <button
                onClick={handleExportMonthlyExcel}
                disabled={exportingMonthly}
                className="w-full py-3.5 bg-gradient-to-r from-[#00A896] to-[#028090] hover:from-[#009686] hover:to-[#026c7a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#00A896]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportingMonthly ? 'Generating Workbook...' : 'Download Monthly Excel (.xlsx)'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* TAB CONTENT: 7. CANTEEN SETTINGS (Section 20) */}
      {/* ============================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={saveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Canteen Operational Settings</h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure dining hours, food preparation margins, cafeteria details, and live refresh preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            {/* Lunch Timing Window */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lunch Window Start Time
              </label>
              <input
                type="time"
                value={settingsData.lunchStartTime}
                onChange={(e) => setSettingsData({ ...settingsData, lunchStartTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-[#00A896] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Lunch Window End Time
              </label>
              <input
                type="time"
                value={settingsData.lunchEndTime}
                onChange={(e) => setSettingsData({ ...settingsData, lunchEndTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-[#00A896] outline-none"
              />
            </div>

            {/* Daily Capacity & Buffer */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kitchen Daily Prep Capacity (Portions)
              </label>
              <input
                type="number"
                value={settingsData.dailyTargetCapacity}
                onChange={(e) => setSettingsData({ ...settingsData, dailyTargetCapacity: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-[#00A896] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Food Preparation Buffer Margin (%)
              </label>
              <input
                type="number"
                value={settingsData.bufferPercent}
                onChange={(e) => setSettingsData({ ...settingsData, bufferPercent: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-[#00A896] outline-none"
              />
            </div>

            {/* Department Info */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Canteen Department Location
              </label>
              <input
                type="text"
                value={settingsData.cafeteriaLocation}
                onChange={(e) => setSettingsData({ ...settingsData, cafeteriaLocation: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:border-[#00A896] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cafeteria Contact / Extension
              </label>
              <input
                type="text"
                value={settingsData.contactExtension}
                onChange={(e) => setSettingsData({ ...settingsData, contactExtension: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:border-[#00A896] outline-none"
              />
            </div>

            {/* Auto Refresh Interval */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Auto-Refresh Interval (Seconds)
              </label>
              <select
                value={settingsData.autoRefreshIntervalSeconds}
                onChange={(e) => setSettingsData({ ...settingsData, autoRefreshIntervalSeconds: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:border-[#00A896] outline-none"
              >
                <option value={5}>5 Seconds (Fast)</option>
                <option value={10}>10 Seconds (Standard)</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
              </select>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Reset & Clear All Canteen Data</span>
            </button>

            <button
              type="submit"
              disabled={settingsSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00A896] to-[#028090] hover:from-[#009686] hover:to-[#026c7a] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00A896]/20 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{settingsSaving ? 'Saving Settings...' : 'Save Canteen Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* CONFIRMATION MODAL FOR RESETTING CANTEEN DATA */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Reset All Canteen Data?</h3>
                <p className="text-xs text-slate-500 font-medium">Start fresh for live employee Lunch IN/OUT</p>
              </div>
            </div>

            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-800 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                This action will delete all historical & today's canteen lunch records.
              </p>
              <p className="text-slate-600 leading-relaxed font-medium">
                The database will be completely fresh. When employees perform Lunch IN/OUT from their Employee Portal, new live records will populate cleanly.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={resetLoading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                disabled={resetLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{resetLoading ? 'Deleting Records...' : 'Yes, Delete All Canteen Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CanteenDashboard;
