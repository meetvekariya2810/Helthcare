import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Coffee,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Search,
  Building,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  Activity,
  Layers,
  Percent,
  Lock,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { hrmsAPI } from '../../services/api';

const COLORS = {
  teal: '#00A896',
  tealDark: '#009B8D',
  purple: '#7B2CBF',
  purpleLight: '#8338EC',
  orange: '#F77F00',
  amber: '#FCBF49',
  emerald: '#10B981',
  rose: '#EF4444',
  blue: '#3B82F6',
  slateDark: '#0F172A'
};

const PIE_COLORS = ['#00A896', '#3B82F6', '#F77F00', '#10B981'];

export const AttendanceCommandCenter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Role Access Control (Admin / HR Admin / HR only)
  const isAuthorized = useMemo(() => {
    if (!user) return false;
    const role = (user.role || '').toUpperCase();
    const allowed = [
      'SUPER_ADMIN',
      'DIRECTOR',
      'ADMIN',
      'HR_ADMIN',
      'HR_MANAGER',
      'HR_EXECUTIVE',
      'HR'
    ];
    return allowed.includes(role);
  }, [user]);

  // Helper to format ISO date string to readable display (e.g. 09-October-2026)
  const formatDisplayDate = (dStr) => {
    if (!dStr) return 'Today';
    const parts = dStr.split('-');
    if (parts.length !== 3) return dStr;
    const y = parts[0];
    const mIdx = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${d}-${monthNames[mIdx] || parts[1]}-${y}`;
  };

  const getTodayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Loading & Filter States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState(new Date().toLocaleTimeString());

  // Global Filters
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');

  // Sub-tabs in widgets
  const [commitmentTab, setCommitmentTab] = useState('HOURS'); // 'HOURS' | 'OVERTIME' | 'REGULAR'
  const [anomalyTab, setAnomalyTab] = useState('LATE'); // 'LATE' | 'EARLY' | 'BREAKS' | 'REMAINING'
  const [exceptionTab, setExceptionTab] = useState('MISSING'); // 'MISSING' | 'REQUESTS' | 'OUT_OF_RANGE'
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Data State
  const [data, setData] = useState(null);

  const fetchCommandCenterData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await hrmsAPI.getAttendanceCommandCenter({
        date: selectedDate,
        month: selectedMonth,
        year: selectedYear,
        branch: selectedBranch,
        department: selectedDepartment,
        subDepartment: selectedSubDepartment,
        shift: selectedShift,
        commitmentTab,
        anomalyTab,
        exceptionTab
      });

      if (res.data?.success || res.data?.kpis) {
        setData(res.data);
        setDataError(false);
      } else {
        setDataError(true);
      }
      setLastRefreshedTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[Attendance Command Center Error]:', err);
      setDataError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sync Month/Year when Date changes
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (newDate && newDate.includes('-')) {
      const parts = newDate.split('-');
      if (parts.length === 3) {
        const y = parts[0];
        const mIdx = parseInt(parts[1], 10) - 1;
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        if (monthNames[mIdx]) {
          setSelectedMonth(`${monthNames[mIdx]} ${y}`);
          setSelectedYear(y);
        }
      }
    }
  };

  // Sync Date when Month selector changes
  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ];
    const mLower = newMonth.toLowerCase();
    const foundIdx = monthNames.findIndex(mn => mLower.includes(mn));
    if (foundIdx !== -1) {
      const mStr = String(foundIdx + 1).padStart(2, '0');
      const yearPart = newMonth.match(/\d{4}/) ? newMonth.match(/\d{4}/)[0] : selectedYear;
      setSelectedYear(yearPart);
      setSelectedDate(`${yearPart}-${mStr}-01`);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchCommandCenterData();
    }
  }, [
    isAuthorized,
    selectedDate,
    selectedMonth,
    selectedYear,
    selectedBranch,
    selectedDepartment,
    selectedSubDepartment,
    selectedShift,
    commitmentTab,
    anomalyTab,
    exceptionTab
  ]);

  // Auto-refresh interval (every 45 seconds)
  useEffect(() => {
    if (!isAuthorized) return;
    const interval = setInterval(() => {
      fetchCommandCenterData(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [
    isAuthorized,
    selectedDate,
    selectedMonth,
    selectedYear,
    selectedBranch,
    selectedDepartment,
    selectedSubDepartment,
    selectedShift,
    commitmentTab,
    anomalyTab,
    exceptionTab
  ]);

  // --------------------------------------------------------------------------
  // UNAUTHORIZED ROLE SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-rose-100">
            <Lock className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Attendance Command Center is available only to authorized HR and Administrator users.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 font-mono mb-6">
            Confidential HR Attendance Intelligence • RBAC Protected
          </div>
          <button
            onClick={() => navigate('/hrms/attendance')}
            className="w-full py-3 px-5 bg-[#00A896] hover:bg-[#009B8D] text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-[1.01] transition-all text-sm flex items-center justify-center gap-2"
          >
            <span>Return to Attendance Records</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Safe extraction of payload from live backend
  const kpis = data?.kpis || {
    totalEmployees: '--',
    presentToday: '--',
    presentRate: '--',
    absentToday: '--',
    absentRate: '--',
    lateToday: '--',
    lateRate: '--',
    leaveToday: '--',
    leaveRate: '--',
    onBreakToday: '--',
    onBreakRate: '--',
    punchChannels: { webPortal: 0, faceApp: 0, mobileApp: 0, biometric: 0 },
    onTimeCount: 0,
    inFieldCount: 0,
    missingPunchCount: 0,
    overtimeCount: 0
  };

  const workforceSplit = data?.workforceSplit || {
    totalRoster: kpis.totalEmployees || '--',
    presentCount: kpis.presentToday || 0,
    presentRate: kpis.presentRate || '0.0%',
    absentCount: kpis.absentToday || 0,
    absentRate: kpis.absentRate || '0.0%',
    approvedLeaveCount: kpis.leaveToday || 0,
    approvedLeaveRate: kpis.leaveRate || '0.0%',
    onBreakCount: 0,
    workMode: { inOfficeCount: 0, inOfficeRate: '100.0%', wfhCount: 0, inFieldCount: 0 },
    livePunchMedia: { faceApp: 0, mobileApp: 0, biometricDevice: 0 }
  };

  const hourlyArrivalBellCurve = data?.hourlyArrivalBellCurve || {
    peakVelocity: 'No punch-in data recorded',
    data: [
      { time: '07:30', count: 0 },
      { time: '08:00', count: 0 },
      { time: '08:30', count: 0 },
      { time: '09:00', count: 0 },
      { time: '09:30', count: 0 }
    ]
  };

  const punctualityDiagnostics = data?.punctualityDiagnostics || {
    onTimePercent: '--',
    targetPercent: '95%',
    midWindowLateCount: 0,
    severeLateCount: 0,
    latePenaltyExposure: 0
  };

  const leaveBurnAndSla = data?.leaveBurnAndSla || {
    averageApprovalHours: '--',
    slaPercent: '--',
    totalLeaves: 0,
    paidLeaves: 0,
    breakdown: { sickLeave: 0, casualLeave: 0, compOff: 0 }
  };

  const overtimeVsDeficit = data?.overtimeVsDeficit || {
    otSurplusHours: '--',
    otShifts: '0 shifts',
    shiftDeficitHours: '--',
    deficitShifts: '0 shifts',
    netHours: '--'
  };

  const departmentAdherence = data?.departmentAdherence || [];
  const dailyAttendanceStatus = data?.dailyAttendanceStatus || [];
  const monthlyAttendanceStatus = data?.monthlyAttendanceStatus || [];
  const monthlyLeaveStatus = data?.monthlyLeaveStatus || [];
  const commitmentAndRecognition = data?.commitmentAndRecognition || [];
  const shiftBreakAnomalies = data?.shiftBreakAnomalies || [];
  const statutoryExceptions = data?.statutoryExceptions || [];
  const monthlyAttendanceHistory = data?.monthlyAttendanceHistory || [];

  const splitDonutData = [
    { name: 'Present Check-In', value: Number(workforceSplit.presentCount) || 0, color: '#00A896' },
    { name: 'Absent / Unlogged', value: Number(workforceSplit.absentCount) || 0, color: '#3B82F6' },
    { name: 'Approved Leave', value: Number(workforceSplit.approvedLeaveCount) || 0, color: '#F77F00' }
  ];

  return (
    <div className="space-y-5 pb-16 max-w-[1720px] mx-auto">
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-teal-50 via-cyan-50/30 to-transparent rounded-full pointer-events-none -mr-16 -mt-16" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Attendance Command Center
              </h1>
              {dataError ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Data Connection Issue
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-[#00A896] border border-teal-200/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] animate-pulse" />
                  Live System
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                Auto-refreshed: {lastRefreshedTime}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              BJK Healthcare Private Limited • Workforce Attendance • Workforce Analytics • Compliance
            </p>
          </div>

          {/* Quick Navigation Jump to Existing Attendance Dashboard */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/hrms/attendance"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <span>Existing Attendance Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => fetchCommandCenterData(true)}
              disabled={refreshing}
              title="Refresh Attendance Telemetry"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00A896]' : ''}`} />
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-4 pt-4 border-t border-slate-100">
          {/* Branch */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <label className="block text-[10px] font-semibold text-slate-400">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              <option value="Ahmedabad">Ahmedabad Plant</option>
              <option value="Baddi">Baddi Facility</option>
              <option value="Mumbai">Mumbai HQ</option>
              <option value="Hyderabad">Hyderabad R&D</option>
            </select>
          </div>

          {/* Department */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <label className="block text-[10px] font-semibold text-slate-400">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Production">Production (eBR)</option>
              <option value="Quality Control">Quality Control (QC)</option>
              <option value="Quality Assurance">Quality Assurance (QA)</option>
              <option value="Warehouse">Warehouse & Logistics</option>
              <option value="HR & Admin">HR & Admin</option>
              <option value="Regulatory">Regulatory Affairs</option>
            </select>
          </div>

          {/* Sub-Department */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <label className="block text-[10px] font-semibold text-slate-400">Sub-Department</label>
            <select
              value={selectedSubDepartment}
              onChange={(e) => setSelectedSubDepartment(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sub-Departments</option>
              <option value="Tableting">Tableting & Coating</option>
              <option value="Injectables">Sterile Injectables</option>
              <option value="Microbiology">Microbiology Lab</option>
              <option value="Packaging">Primary Packaging</option>
            </select>
          </div>

          {/* Shift */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <label className="block text-[10px] font-semibold text-slate-400">Shift</label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Shifts</option>
              <option value="General">General Shift (09:00 - 18:00)</option>
              <option value="Morning">Morning Shift (07:00 - 15:30)</option>
              <option value="Evening">Evening Shift (15:00 - 23:30)</option>
              <option value="Night">Night Shift (23:00 - 07:30)</option>
            </select>
          </div>

          {/* Month / Year */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <label className="block text-[10px] font-semibold text-slate-400">Month / Year</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="October 2026">October 2026</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
              <option value="February 2026">February 2026</option>
              <option value="January 2026">January 2026</option>
            </select>
          </div>

          {/* Attendance Date */}
          <div className="bg-slate-50 border border-teal-200/80 rounded-xl px-3 py-1.5 text-xs">
            <label className="block text-[10px] font-semibold text-teal-700">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            />
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. STICKY MONTHLY ATTENDANCE HISTORY NAVIGATOR */}
      {/* -------------------------------------------------------------------- */}
      <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 border border-slate-200/80 shadow-md flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 flex-shrink-0 pl-2">
          <Calendar className="w-4 h-4 text-[#00A896]" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Attendance History:
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {monthlyAttendanceHistory.map((m, idx) => {
            const isSelected = selectedMonth.toLowerCase().includes(m.month.toLowerCase().split(' ')[0]);
            return (
              <button
                key={idx}
                onClick={() => handleMonthChange(m.month)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span>{m.month.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                  {m.attendancePercent}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pr-2 hidden xl:block text-[11px] text-slate-400 font-mono">
          Preserved History • 2026 Records
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-center gap-2.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 3. PRIMARY ATTENDANCE KPI CARDS (MATCHING REFERENCE SCREENSHOT 1) */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: PRESENT CHECK-IN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Present Check-In
            </span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{kpis.presentToday}</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {kpis.presentRate}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {kpis.onTimeCount !== undefined ? `${kpis.onTimeCount} On Time • ${kpis.inFieldCount || 0} In Field` : 'On Time Check-in'}
            </p>
          </div>
        </div>

        {/* Card 2: LATE CHECK-IN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Late Check-In
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{kpis.lateToday}</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {kpis.lateRate} Rate
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">of check-in</p>
          </div>
        </div>

        {/* Card 3: ABSENT / UNLOGGED */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Absent / Unlogged
            </span>
            <UserX className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{kpis.absentToday}</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {kpis.absentRate}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Unpunched / no response</p>
          </div>
        </div>

        {/* Card 4: APPROVED LEAVE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Approved Leave
            </span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{kpis.leaveToday}</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                {kpis.leaveRate}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Full Day Leave</p>
          </div>
        </div>

        {/* Card 5: PUNCH CHANNELS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Punch Channels
            </span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{kpis.punchChannels?.faceApp || 0}</span>
              <span className="text-xs font-semibold text-slate-500">FaceApp</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Web Portal regularized: {kpis.punchChannels?.webPortal || 0}</p>
          </div>
        </div>

        {/* Card 6: ON BREAK */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              On Break
            </span>
            <Coffee className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-slate-900">{kpis.onBreakToday}</span>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {kpis.onBreakRate}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">of check-in</p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 4. EMPLOYEE ATTENDANCE STATUS & LIVE WORKFORCE SPLIT */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Attendance Status Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Employee Attendance Status <span className="text-slate-400 font-normal">({selectedMonth})</span>
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Present
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Missing Punch Out
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Pending
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyAttendanceStatus}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(entry) => {
                  if (entry?.activePayload?.[0]?.payload?.date) {
                    handleDateChange(entry.activePayload[0].payload.date);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '1rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} className="cursor-pointer" />
                <Bar dataKey="missingPunch" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} className="cursor-pointer" />
                <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Workforce Split Donut Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Live Workforce Split</h3>
              <span className="text-[11px] font-mono text-slate-400">{formatDisplayDate(selectedDate)}</span>
            </div>
            <div className="text-xs text-slate-400 mb-3">Total Employees {workforceSplit.totalRoster}</div>

            <div className="flex items-center gap-4">
              {/* Donut Chart */}
              <div className="w-32 h-32 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={splitDonutData}
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {splitDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-slate-900 leading-none">{workforceSplit.totalRoster}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ROSTER</span>
                </div>
              </div>

              {/* Breakdown Labels */}
              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#00A896]" />
                    Present Check-In
                  </span>
                  <span className="font-bold text-slate-900">{workforceSplit.presentCount} ({workforceSplit.presentRate})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Absent / Unlogged
                  </span>
                  <span className="font-bold text-slate-900">{workforceSplit.absentCount} ({workforceSplit.absentRate})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Approved Leave
                  </span>
                  <span className="font-bold text-slate-900">{workforceSplit.approvedLeaveCount} ({workforceSplit.approvedLeaveRate})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-matrices: Work Mode & Punch Media */}
          <div className="grid grid-cols-2 gap-3 pt-4 mt-3 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Work Mode Status</div>
              <div className="space-y-0.5 text-[11px] text-slate-600">
                <div>In-office: <strong>{workforceSplit.workMode?.inOfficeCount || 0}</strong></div>
                <div>Work from home: <strong>{workforceSplit.workMode?.wfhCount || 0}</strong></div>
                <div>In Field: <strong>{workforceSplit.workMode?.inFieldCount || 0}</strong></div>
                <div className="text-teal-600 font-bold mt-1">{workforceSplit.workMode?.inOfficeRate || '100.0%'} In-office</div>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Live Punch Media</div>
              <div className="space-y-0.5 text-[11px] text-slate-600">
                <div>FaceApp: <strong>{workforceSplit.livePunchMedia?.faceApp || 0}</strong></div>
                <div>Mobile App: <strong>{workforceSplit.livePunchMedia?.mobileApp || 0}</strong></div>
                <div>Biometric Device: <strong>{workforceSplit.livePunchMedia?.biometricDevice || 0}</strong></div>
                <div className="text-emerald-600 font-bold mt-1">{workforceSplit.onBreakCount || 0} On Break</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 5. TODAY'S HOURLY PUNCH-IN ARRIVAL BELL CURVE */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase text-slate-800 tracking-wider">
              Today's Hourly Punch-in Arrival Bell Curve
            </h3>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-0.5 rounded-full border border-teal-200/50">
            {hourlyArrivalBellCurve.peakVelocity}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {hourlyArrivalBellCurve.data?.map((slot, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border transition-all ${
                slot.count >= 20
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold'
                  : 'bg-slate-50 border-slate-100 text-slate-800'
              }`}
            >
              <div className="text-xs text-slate-400 font-mono">{slot.time}</div>
              <div className="text-2xl font-black mt-1">
                {slot.count > 0 ? slot.count : '--'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 6. DIAGNOSTICS & VELOCITY (PUNCTUALITY, LEAVE SLA, OVERTIME, DEPT) */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Punctuality Diagnostics */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Punctuality Diagnostics
              </h4>
              <span className="text-[10px] font-bold text-slate-400">Target: {punctualityDiagnostics.targetPercent}</span>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="w-16 h-16 rounded-full border-4 border-teal-500 flex items-center justify-center flex-shrink-0 bg-teal-50">
                <span className="text-xs font-black text-slate-900">{punctualityDiagnostics.onTimePercent}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-amber-700">15–45m Mid-window:</span>
                  <strong>{punctualityDiagnostics.midWindowLateCount} emp</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-rose-700">&gt;45m Severe:</span>
                  <strong>{punctualityDiagnostics.severeLateCount} emp</strong>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Late Penalty Exposure: <strong>{punctualityDiagnostics.latePenaltyExposure}</strong>
          </div>
        </div>

        {/* Leave Burn & SLA Velocity */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Leave Burn & SLA Velocity
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {leaveBurnAndSla.slaPercent}
              </span>
            </div>

            <div className="text-xs text-slate-600 mb-2">
              Avg approval: <strong>{leaveBurnAndSla.averageApprovalHours}</strong>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex mb-2">
              <div className="bg-blue-500 h-full" style={{ width: '50%' }} />
              <div className="bg-teal-500 h-full" style={{ width: '33%' }} />
              <div className="bg-purple-500 h-full" style={{ width: '17%' }} />
            </div>

            <div className="text-[10px] text-slate-500 space-y-0.5">
              <span>
                • Sick Leave {leaveBurnAndSla.breakdown?.sickLeave || 0}d • Casual Leave {leaveBurnAndSla.breakdown?.casualLeave || 0}d • Comp Off {leaveBurnAndSla.breakdown?.compOff || 0}d
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
            <span>Total Leave: {leaveBurnAndSla.totalLeaves}d</span>
            <span>Paid: {leaveBurnAndSla.paidLeaves}d</span>
          </div>
        </div>

        {/* Overtime vs Shift Deficit */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Overtime vs Shift Deficit
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {overtimeVsDeficit.netHours}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600">
                  <span>OT surplus ({overtimeVsDeficit.otShifts}):</span>
                  <strong className="text-emerald-600">{overtimeVsDeficit.otSurplusHours}</strong>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600">
                  <span>Shift deficit ({overtimeVsDeficit.deficitShifts}):</span>
                  <strong className="text-rose-600">{overtimeVsDeficit.shiftDeficitHours}</strong>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Net: <strong className="text-slate-900">{overtimeVsDeficit.netHours}</strong>
          </div>
        </div>

        {/* Dept Adherence Matrix */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Dept Adherence Matrix
              </h4>
              <span className="text-[10px] font-mono text-teal-600 font-bold">Live Data</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {departmentAdherence.slice(0, 5).map((dept, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span className="truncate">{dept.name} ({dept.count})</span>
                    <span className="font-bold text-teal-600">{dept.attendance}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: `${dept.attendance}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            {departmentAdherence.length} operational departments tracked
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 7. MONTHLY ATTENDANCE STATUS & MONTHLY LEAVE STATUS */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Attendance Status Chart */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Monthly Attendance Status</h3>
              <span className="text-xs font-mono text-slate-400">2026 Run Rate</span>
            </div>
            <div className="text-xs text-slate-400 mb-4">Quarterly cumulative logs from active workforce records</div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyAttendanceStatus}>
                  <defs>
                    <linearGradient id="monthAttGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '1rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#monthAttGrad)"
                    dot={{ r: 4, fill: '#3B82F6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Current Tracking:</span>
            <span className="font-bold text-slate-700">{selectedMonth} Active Telemetry</span>
          </div>
        </div>

        {/* Monthly Leave Status */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Monthly Leave Status</h3>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                Live Records
              </span>
            </div>
            <div className="text-xs text-slate-400 mb-4">Historical leave frequency normalized across departments</div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyLeaveStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '1rem',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="approved" fill="#00A896" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Approved vs Pending Leaves:</span>
            <span className="font-bold text-teal-600">{leaveBurnAndSla.totalLeaves || 0} Recorded in {selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 8. COMMITMENT, ANOMALIES & STATUTORY EXCEPTIONS (3-COLUMN ROW) */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Commitment & Recognition */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Commitment & Recognition
              </h3>
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                {['HOURS', 'OVERTIME', 'REGULAR'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCommitmentTab(tab)}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      commitmentTab === tab ? 'bg-[#00A896] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'HOURS' ? 'Top Hours' : tab === 'OVERTIME' ? 'Overtime' : 'Regular'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 uppercase font-mono mb-4">
              TOP 10 MOST HOURS ARE SPENT IN ({selectedMonth.toUpperCase()})
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {commitmentAndRecognition.length > 0 ? (
                commitmentAndRecognition.map((emp, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-bold font-mono w-4">#{emp.rank || (i + 1)}</span>
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-teal-400">
                        {emp.name ? emp.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'EM'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{emp.name}</div>
                        <div className="text-[10px] text-slate-400">{emp.designation} • {emp.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-teal-400 text-xs">{emp.hours}</div>
                      <div className="text-[10px] text-slate-400">{emp.rawHours} hrs</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">
                  Insufficient attendance data recorded for this selection
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Workforce Engagement Index:</span>
            <span className="font-bold text-teal-400">Calculated from Live Logs</span>
          </div>
        </div>

        {/* Shift & Break Anomalies */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Shift & Break Anomalies
              </h3>
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                {['LATE', 'EARLY', 'BREAKS', 'REMAINING'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAnomalyTab(tab)}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      anomalyTab === tab ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'LATE' ? 'Late In' : tab === 'EARLY' ? 'Early Exit' : tab === 'BREAKS' ? 'Breaks' : 'Remaining'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 uppercase font-mono mb-4">
              ANOMALIES & EXCEPTIONS IN ({selectedMonth.toUpperCase()})
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {shiftBreakAnomalies.length > 0 ? (
                shiftBreakAnomalies.map((anom, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-bold font-mono w-4">#{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-amber-400">
                        {anom.employee ? anom.employee.split(' ').map(n => n[0]).slice(0, 2).join('') : 'EM'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{anom.employee}</div>
                        <div className="text-[10px] text-slate-400">{anom.designation} • {anom.issue}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                        {anom.count || 1}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">
                  No shift anomalies recorded
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Shift Exceptions:</span>
            <span className="font-bold text-amber-400">Live Telemetry</span>
          </div>
        </div>

        {/* Statutory & Exceptions */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Statutory & Exceptions
              </h3>
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                {['MISSING', 'REQUESTS', 'OUT_OF_RANGE'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setExceptionTab(tab)}
                    className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                      exceptionTab === tab ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab === 'MISSING' ? 'Missing Out' : tab === 'REQUESTS' ? 'Requests' : 'Out of Range'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-400 uppercase font-mono mb-4">
              STATUTORY COMPLIANCE IN ({selectedMonth.toUpperCase()})
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {statutoryExceptions.length > 0 ? (
                statutoryExceptions.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-400 font-bold font-mono w-4">#{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-rose-400">
                        {ex.employee ? ex.employee.split(' ').map(n => n[0]).slice(0, 2).join('') : 'EM'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{ex.employee}</div>
                        <div className="text-[10px] text-slate-400">{ex.designation} • {ex.issue}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] flex items-center justify-center">
                        {ex.count || 1}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">
                  No active exceptions recorded
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pending Approvals:</span>
            <Link to="/hrms/attendance" className="font-bold text-teal-400 hover:underline">
              Review Regularizations →
            </Link>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 9. QUICK ACTION BUTTONS LINKING TO EXISTING HRMS MODULES */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quick Attendance Workflows
          </h4>
          <p className="text-xs text-slate-500">Jump directly into existing operational attendance submodules</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'View Attendance', path: '/hrms/attendance' },
            { label: 'Add Attendance', path: '/hrms/attendance?tab=add' },
            { label: 'Monthly Attendance', path: '/hrms/attendance/reports' },
            { label: 'Attendance Requests', path: '/hrms/attendance?tab=requests' },
            { label: 'Missing Punch Out', path: '/hrms/attendance?filter=missing' },
            { label: 'Shift Roster', path: '/hrms/shifts' },
            { label: 'Leave Center', path: '/hrms/leave' }
          ].map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="px-3 py-1.5 bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-[#00A896] rounded-xl text-xs font-bold transition shadow-2xs"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MODAL: EXPORT REPORT */}
      {/* -------------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-scaleUp text-center">
            <div className="w-12 h-12 bg-teal-50 text-[#00A896] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Export Attendance Command Report</h3>
            <p className="text-xs text-slate-500 mb-6">
              Export month-wise attendance analytics, shift adherence, or punctuality audit for BJK Healthcare
            </p>

            <div className="space-y-2.5 text-xs font-bold">
              <button
                onClick={() => {
                  window.print();
                  setShowExportModal(false);
                }}
                className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF Command Report</span>
              </button>

              <button
                onClick={() => {
                  setActionSuccess('Excel attendance analytics ledger export initiated.');
                  setShowExportModal(false);
                  setTimeout(() => setActionSuccess(''), 4000);
                }}
                className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                <span>Export Excel / CSV Analytics</span>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCommandCenter;
