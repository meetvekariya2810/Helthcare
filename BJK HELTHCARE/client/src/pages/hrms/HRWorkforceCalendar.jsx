import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Sparkles,
  ShieldCheck,
  CalendarCheck,
  Building2,
  AlertCircle,
  Eye,
  Filter,
  CheckCircle2,
  X,
  PlusCircle,
  Info,
  Layers,
  FileText,
  User,
  Users,
  Search,
  Download,
  Printer,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  Sliders,
  Send,
  CalendarRange,
  Zap,
  Bookmark,
  Award,
  AlertTriangle,
  ChevronDown,
  Plus,
  Flag,
  Sun,
  Bed,
  UserMinus,
  Settings,
  MoreHorizontal,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { workforceCalendarAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEPARTMENTS = ['ALL', 'PRD', 'QC', 'QA', 'HR', 'ADMIN', 'ENGG.', 'QC MICRO', 'Executive Management', 'Operations & Production', 'Commercial'];
const SHIFTS = ['All Shifts', 'General Shift (09:00 - 18:00)', 'Morning Shift (06:00 - 14:00)', 'Evening Shift (14:00 - 22:00)', 'Night Shift (22:00 - 06:00)'];
const STATUSES = ['All Status', 'Working', 'Week Off', 'On Leave', 'Holiday', 'Special Working Day'];
const LOCATIONS = ['All Locations', 'Main Campus (BJK-HQ)', 'Formulation Plant 1', 'Sterile R&D Center', 'Logistics Hub'];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const HRWorkforceCalendar = () => {
  const { user } = useAuth();
  
  // Primary View Mode (Month, Week, Day, Agenda, Timeline, Configure)
  const [viewMode, setViewMode] = useState('Month');
  
  // Safe Date States
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  
  // Filters State
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Data Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Submodule Datasets
  const [monthData, setMonthData] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [specialDays, setSpecialDays] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [inspectorData, setInspectorData] = useState(null);
  const [inspectorSearchCode, setInspectorSearchCode] = useState('BH1022');

  // UI Interactive States & Menus
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isSpecialDayModalOpen, setIsSpecialDayModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);

  const createMenuRef = useRef(null);

  // Form States
  const [scheduleForm, setScheduleForm] = useState({
    name: 'Standard 6-Day Schedule (Tuesday Off)',
    scheduleType: 'COMPANY',
    department: 'ALL',
    employeeCode: '',
    shiftName: 'General Shift (09:00 - 18:00)',
    effectiveFrom: '2026-01-01',
    effectiveTo: '',
    weeklyPattern: {
      monday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
      tuesday: { status: 'WEEK_OFF', startTime: '00:00', endTime: '00:00', workingHours: 0 },
      wednesday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
      thursday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
      friday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
      saturday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 },
      sunday: { status: 'WORKING', startTime: '09:00', endTime: '18:00', workingHours: 9 }
    }
  });

  const [holidayForm, setHolidayForm] = useState({
    name: '',
    dateString: '',
    type: 'COMPANY_HOLIDAY',
    applicableTo: 'ALL',
    department: 'ALL',
    description: ''
  });

  const [specialDayForm, setSpecialDayForm] = useState({
    name: '',
    dateString: '',
    type: 'SPECIAL_WORKING_DAY',
    reason: '',
    applicableTo: 'DEPARTMENT',
    department: 'PRD',
    workingHours: 8
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    dateString: '',
    startTime: '10:00',
    endTime: '17:00',
    type: 'CORPORATE_EVENT',
    category: 'EVENT',
    location: 'Main Auditorium / Campus',
    description: '',
    applicableTo: 'ALL',
    department: 'ALL'
  });

  const [exceptionForm, setExceptionForm] = useState({
    employeeId: '',
    dateString: '',
    newStatus: 'WEEK_OFF',
    reason: 'Special HR Adjustment'
  });

  const safeDate = currentDate instanceof Date && !isNaN(currentDate) ? currentDate : new Date();
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth() + 1;

  // Close create menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [year, month, selectedDept]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const curDateStr = safeDate.toISOString().split('T')[0];
      
      if (!workforceCalendarAPI) {
        console.warn('workforceCalendarAPI is not available');
        return;
      }

      const [statsRes, monthRes, schedRes, rostRes, holRes, specRes, evRes, leaveRes] = await Promise.all([
        workforceCalendarAPI.getMasterOverview?.({ date: curDateStr })?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getMonthCalendar?.({ year, month, department: selectedDept })?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getSchedules?.({ status: 'ACTIVE' })?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getRosters?.()?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getHolidays?.({ year })?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getSpecialDays?.({ year })?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getEvents?.({ year })?.catch(() => ({ data: { success: false } })),
        workforceCalendarAPI.getPendingLeaves?.()?.catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes?.data?.success) setStats(statsRes.data.data);
      if (monthRes?.data?.success) setMonthData(monthRes.data.data);
      if (schedRes?.data?.success && Array.isArray(schedRes.data.data)) setSchedules(schedRes.data.data);
      if (rostRes?.data?.success && Array.isArray(rostRes.data.data)) setRosters(rostRes.data.data);
      if (holRes?.data?.success && Array.isArray(holRes.data.data)) setHolidays(holRes.data.data);
      if (specRes?.data?.success && Array.isArray(specRes.data.data)) setSpecialDays(specRes.data.data);
      if (evRes?.data?.success && Array.isArray(evRes.data.data)) setEvents(evRes.data.data);
      if (leaveRes?.data?.success && Array.isArray(leaveRes.data.data)) setPendingLeaves(leaveRes.data.data);
    } catch (err) {
      console.error('Workforce calendar initial fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Inspect employee calendar
  const handleInspectEmployee = async (codeToSearch) => {
    const code = (codeToSearch || inspectorSearchCode || 'BH1022').toUpperCase().trim();
    if (!code) return;
    try {
      setActionLoading(true);
      const res = await workforceCalendarAPI.getEmployeeCalendar(code, { year, month });
      if (res?.data?.success) {
        setInspectorData(res.data.data);
        setIsInspectorModalOpen(true);
      }
    } catch (err) {
      alert('Failed to inspect employee calendar: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Create Modals
  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await workforceCalendarAPI.createSchedule(scheduleForm);
      if (res?.data?.success) {
        alert('Work schedule created successfully.');
        setIsScheduleModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await workforceCalendarAPI.createHoliday(holidayForm);
      if (res?.data?.success) {
        alert('Holiday created successfully.');
        setIsHolidayModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSpecialDay = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await workforceCalendarAPI.createSpecialDay(specialDayForm);
      if (res?.data?.success) {
        alert('Special day policy applied successfully.');
        setIsSpecialDayModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await workforceCalendarAPI.createEvent(eventForm);
      if (res?.data?.success) {
        alert('Company event scheduled successfully.');
        setIsEventModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateException = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await workforceCalendarAPI.createException(exceptionForm);
      if (res?.data?.success) {
        alert('Calendar exception created successfully.');
        setIsExceptionModalOpen(false);
        fetchInitialData();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteHoliday = async (holidayId) => {
    if (!window.confirm('Are you sure you want to cancel this holiday?')) return;
    try {
      setActionLoading(true);
      await workforceCalendarAPI.deleteHoliday(holidayId);
      setIsDayDrawerOpen(false);
      fetchInitialData();
    } catch (err) {
      alert('Error cancelling holiday: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSpecialDay = async (specialDayId) => {
    if (!window.confirm('Are you sure you want to cancel this date override?')) return;
    try {
      setActionLoading(true);
      await workforceCalendarAPI.deleteSpecialDay(specialDayId);
      setIsDayDrawerOpen(false);
      fetchInitialData();
    } catch (err) {
      alert('Error cancelling special day: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Month grid calculations
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const leadingBlanks = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // Previous month fill days
  const prevMonthDaysCount = new Date(year, month - 1, 0).getDate();

  const monthGridDays = useMemo(() => {
    const arr = [];
    
    // Leading previous month days
    for (let i = leadingBlanks - 1; i >= 0; i--) {
      const prevDayNum = prevMonthDaysCount - i;
      arr.push({
        isPadding: true,
        dayNumber: prevDayNum,
        id: `prev-${prevDayNum}`
      });
    }

    const totalEmps = stats?.totalEmployees || monthData?.totalEmployees || 104;
    const dailyStatsMap = new Map();
    if (Array.isArray(monthData?.dailyStats)) {
      for (const ds of monthData.dailyStats) {
        if (ds?.dateString) dailyStatsMap.set(ds.dateString, ds);
      }
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayObj = new Date(year, month - 1, d);
      const dayName = DAYS[dayObj.getDay() === 0 ? 6 : dayObj.getDay() - 1];

      // Check if backend returned live calculated stats for this day
      const serverDayStat = dailyStatsMap.get(dateStr);

      // Safe checks
      const hol = serverDayStat?.holiday || (Array.isArray(holidays) ? holidays.find(h => h && h.dateString === dateStr && (selectedDept === 'ALL' || h.applicableTo === 'ALL' || h.department === selectedDept)) : null);
      const spec = serverDayStat?.specialDay || (Array.isArray(specialDays) ? specialDays.find(s => s && s.dateString === dateStr && (selectedDept === 'ALL' || s.applicableTo === 'ALL' || s.department === selectedDept)) : null);
      const evs = serverDayStat?.events || (Array.isArray(events) ? events.filter(e => e && e.dateString === dateStr && (selectedDept === 'ALL' || e.applicableTo === 'ALL' || e.department === selectedDept)) : []);

      // Standard Weekly Policy
      const appliedPattern = monthData?.appliedSchedule?.weeklyPattern || {};
      const baseStatus = appliedPattern[dayName]?.status || (dayName === 'tuesday' ? 'WEEK_OFF' : 'WORKING');

      let status = serverDayStat?.status || baseStatus;
      if (hol) status = 'HOLIDAY';
      else if (spec) status = spec.type || 'SPECIAL_WORKING_DAY';

      let workingCount = serverDayStat?.workingCount;
      let leaveCount = serverDayStat?.leaveCount;
      let weekOffCount = serverDayStat?.weekOffCount;
      let shiftsCount = serverDayStat?.shiftsCount;

      if (workingCount === undefined || workingCount === null) {
        if (status === 'HOLIDAY') {
          workingCount = 0;
          leaveCount = 0;
          weekOffCount = 0;
          shiftsCount = 0;
        } else if (status === 'WEEK_OFF') {
          workingCount = 0;
          leaveCount = 0;
          weekOffCount = totalEmps;
          shiftsCount = 0;
        } else {
          workingCount = totalEmps;
          leaveCount = 0;
          weekOffCount = 0;
          shiftsCount = stats?.activeShiftsCount || 7;
        }
      }

      arr.push({
        isPadding: false,
        dayNumber: d,
        dateString: dateStr,
        dayName,
        dayObj,
        status,
        holiday: hol,
        specialDay: spec,
        events: evs,
        workingCount,
        leaveCount,
        weekOffCount,
        shiftsCount
      });
    }

    // Trailing next month days to complete 35 or 42 grid cells
    const remainingCells = (7 - (arr.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      arr.push({
        isPadding: true,
        dayNumber: i,
        id: `next-${i}`
      });
    }

    return arr;
  }, [year, month, leadingBlanks, daysInMonth, prevMonthDaysCount, holidays, specialDays, events, monthData, selectedDept, stats]);

  // Selected Day resolution
  const activeSelectedDayData = useMemo(() => {
    const validSel = selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : new Date();
    const selDateStr = validSel.toISOString().split('T')[0];
    const found = monthGridDays.find(d => !d.isPadding && d.dateString === selDateStr);
    if (found) return found;

    const dayName = DAYS[validSel.getDay() === 0 ? 6 : validSel.getDay() - 1] || 'monday';
    const totalEmps = stats?.totalEmployees || 104;
    return {
      dayNumber: validSel.getDate(),
      dateString: selDateStr,
      dayName,
      status: dayName === 'tuesday' ? 'WEEK_OFF' : 'WORKING',
      workingCount: dayName === 'tuesday' ? 0 : totalEmps,
      leaveCount: 0,
      weekOffCount: dayName === 'tuesday' ? totalEmps : 0,
      shiftsCount: dayName === 'tuesday' ? 0 : (stats?.activeShiftsCount || 7),
      events: []
    };
  }, [selectedDate, monthGridDays, stats]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Compute active week dates paired with days for schedule plan
  const currentWeekDates = useMemo(() => {
    const ref = selectedDate instanceof Date && !isNaN(selectedDate) ? new Date(selectedDate) : new Date(year, month - 1, 1);
    const currentDay = ref.getDay();
    const diffToMon = (currentDay === 0 ? -6 : 1) - currentDay;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMon);

    return DAYS.map((dayKey, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateNum = d.getDate();
      const monthStr = MONTH_NAMES[d.getMonth()]?.substring(0, 3) || 'Oct';
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
      return {
        dayKey,
        dayLabel: dayKey.substring(0, 3).toUpperCase(),
        dayFull: DAY_LABELS_FULL[idx],
        dateNum,
        dateFormatted: `${dateNum} ${monthStr}`,
        dateStr
      };
    });
  }, [selectedDate, year, month]);

  const handleSelectDay = (day) => {
    if (day.isPadding) return;
    const newSel = new Date(year, month - 1, day.dayNumber);
    setSelectedDate(newSel);
    setSelectedCalendarDay(day);
    setIsDayDrawerOpen(true);
  };

  // Mini Calendar grid for Right Sidebar
  const miniGridDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push({ isBlank: true, id: `mb-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ isBlank: false, dayNumber: d });
    }
    return arr;
  }, [leadingBlanks, daysInMonth]);

  const monthLabel = MONTH_NAMES[month - 1] || 'September';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-6 space-y-5 font-sans antialiased">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matching Reference Layout & Style)                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#00A896] flex items-center justify-center text-white shadow-md shadow-[#00A896]/20 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              HR Workforce Calendar
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Manage employee schedules, working days, shifts, leave, holidays and company events.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* + Create Dropdown */}
          <div className="relative" ref={createMenuRef}>
            <button
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00A896] hover:bg-[#009282] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCreateMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Standard Policies & Schedules
                </div>
                <button
                  onClick={() => { setIsScheduleModalOpen(true); setIsCreateMenuOpen(false); }}
                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#00A896]" />
                  <span>Configure Schedule & Week Off Policy</span>
                </button>

                <div className="my-1 border-t border-slate-100" />
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Date-Wise Overrides
                </div>
                <button
                  onClick={() => {
                    setSpecialDayForm({ ...specialDayForm, type: 'SPECIAL_WORKING_DAY' });
                    setIsSpecialDayModalOpen(true);
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors"
                >
                  <Sun className="w-4 h-4 text-emerald-500" />
                  <span>Set Date as Week-On (Working Day)</span>
                </button>
                <button
                  onClick={() => {
                    setSpecialDayForm({ ...specialDayForm, type: 'SPECIAL_HOLIDAY' });
                    setIsSpecialDayModalOpen(true);
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Bed className="w-4 h-4 text-slate-500" />
                  <span>Set Date as Week-Off (Special Rest)</span>
                </button>
                <button
                  onClick={() => { setIsHolidayModalOpen(true); setIsCreateMenuOpen(false); }}
                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-800 flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Declare Public / Company Holiday</span>
                </button>
                <button
                  onClick={() => { setIsEventModalOpen(true); setIsCreateMenuOpen(false); }}
                  className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-800 flex items-center gap-2.5 transition-colors"
                >
                  <Flag className="w-4 h-4 text-blue-500" />
                  <span>Schedule Company Event</span>
                </button>
              </div>
            )}
          </div>

          {/* Configure Schedule Button */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-sm transition-all"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>Configure Policy</span>
          </button>

          {/* Add Holiday Button */}
          <button
            onClick={() => setIsHolidayModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold rounded-xl text-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Add Holiday</span>
          </button>

          {/* Lightning Bolt Quick Action */}
          <button
            onClick={() => setIsExceptionModalOpen(true)}
            title="Add Single Employee Exception"
            className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/60 rounded-xl transition-all"
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Special Working Day Button */}
          <button
            onClick={() => setIsSpecialDayModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl text-sm shadow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Special Working Day</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI CARDS (6 Compact Premium Cards Matching Reference)                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Employees */}
        <div
          onClick={() => handleInspectEmployee('BH1022')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {stats?.totalEmployees || 104}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Total Employees</div>
            <div className="text-[10px] text-slate-400">Active Employees</div>
          </div>
        </div>

        {/* Working Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {stats?.workingToday ?? (stats?.totalEmployees || 104)}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Working Today</div>
            <div className="text-[10px] text-emerald-600 font-semibold">({stats?.workingPercentage || '100.0'}%)</div>
          </div>
        </div>

        {/* On Leave */}
        <div
          onClick={() => setIsLeaveModalOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <UserMinus className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {stats?.onLeaveToday ?? 0}
            </div>
            <div className="text-[11px] font-bold text-slate-600">On Leave</div>
            <div className="text-[10px] text-orange-600 font-semibold">({stats?.leavePercentage || '0.0'}%)</div>
          </div>
        </div>

        {/* Week Off */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {stats?.weekOffToday ?? 0}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Week Off</div>
            <div className="text-[10px] text-slate-500 font-semibold">({stats?.weekOffPercentage || '0.0'}%)</div>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div
          onClick={() => setIsHolidayModalOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {stats?.holidaysThisMonthCount ?? (Array.isArray(holidays) ? holidays.length : 0)}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Holidays</div>
            <div className="text-[10px] text-purple-600 font-semibold">This Month</div>
          </div>
        </div>

        {/* Company Events */}
        <div
          onClick={() => setIsEventModalOpen(true)}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {stats?.eventsThisMonthCount ?? (Array.isArray(events) ? events.length : 0)}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Company Events</div>
            <div className="text-[10px] text-blue-600 font-semibold">This Month</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FILTER BAR (Matching Reference Filter Inputs & Selectors)               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchEmployee}
            onChange={(e) => setSearchEmployee(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInspectEmployee(searchEmployee)}
            placeholder="Search employee..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A896]/20 focus:border-[#00A896] transition-all"
          />
        </div>

        {/* Center/Right: Dropdowns */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Department */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400">Department</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Shift */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400">Shift</span>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {SHIFTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400">Status</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400">Location</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {LOCATIONS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Filters Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN WORKFORCE CALENDAR AREA + RIGHT INFORMATION PANEL                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT / MAIN CALENDAR CONTAINER (75% width on desktop)                   */}
        {/* ======================================================================= */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-5 space-y-4">
          
          {/* Calendar Navigation Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* Left: Nav Buttons (< > Today) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleToday}
                className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
              >
                Today
              </button>
            </div>

            {/* Center: Current Month & Year */}
            <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-tight text-center">
              {monthLabel} {year}
            </h2>

            {/* Right: View Switcher (Month, Week, Day, Agenda, Timeline) */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              {['Month', 'Week', 'Day', 'Agenda', 'Timeline'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === mode
                      ? 'bg-[#00A896] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* VIEW MODE RENDER: MONTH VIEW (Default)                                */}
          {/* ===================================================================== */}
          {viewMode === 'Month' && (
            <div className="space-y-2">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {DAY_LABELS_SHORT.map((dayLabel, idx) => (
                  <div
                    key={dayLabel}
                    className={`text-xs font-bold uppercase tracking-wider py-1 ${
                      idx === 1 ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {dayLabel}
                  </div>
                ))}
              </div>

              {/* 7-Column Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {monthGridDays.map((day, idx) => {
                  if (day.isPadding) {
                    return (
                      <div
                        key={day.id || `pad-${idx}`}
                        className="min-h-[120px] rounded-xl border border-dashed border-slate-200/50 bg-slate-50/40 p-2 text-slate-300 select-none flex flex-col justify-between opacity-50"
                      >
                        <span className="text-xs font-bold text-slate-400">{day.dayNumber}</span>
                      </div>
                    );
                  }

                  const isSelected = selectedDate instanceof Date && !isNaN(selectedDate) &&
                    selectedDate.getDate() === day.dayNumber &&
                    selectedDate.getMonth() + 1 === month &&
                    selectedDate.getFullYear() === year;

                  const isTuesdayWeekOff = day.dayName === 'tuesday' && day.status === 'WEEK_OFF';
                  const isHoliday = day.status === 'HOLIDAY';
                  const isSpecial = day.status === 'SPECIAL_WORKING_DAY';
                  const hasCompanyEvent = Array.isArray(day.events) && day.events.length > 0;

                  return (
                    <div
                      key={day.dateString || `cell-${idx}`}
                      onClick={() => handleSelectDay(day)}
                      className={`min-h-[125px] rounded-xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-md ${
                        isSelected
                          ? 'border-[#00A896] bg-emerald-50/20 ring-2 ring-[#00A896]/30 shadow-sm'
                          : 'border-slate-200/90 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Cell Top Header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-[#00A896]' : 'text-slate-800'}`}>
                          {day.dayNumber}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDay(day);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition-opacity"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Status Badge / Event Pill */}
                      <div className="my-1">
                        {isHoliday ? (
                          <div className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 flex items-center gap-1 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                            <span className="truncate">{day.holiday?.name || 'Holiday'}</span>
                          </div>
                        ) : isSpecial ? (
                          <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-1 text-[10px] font-bold">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate">{day.specialDay?.name || 'Special Day'}</span>
                          </div>
                        ) : hasCompanyEvent ? (
                          <div className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-1 text-[10px] font-bold">
                            <Flag className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{day.events[0]?.title || 'Company Event'}</span>
                          </div>
                        ) : isTuesdayWeekOff ? (
                          <div className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 inline-flex items-center gap-1 text-[10px] font-bold">
                            <Zap className="w-2.5 h-2.5 text-slate-400" />
                            <span>Week Off</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 inline-flex items-center gap-1 text-[10px] font-bold">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Working</span>
                          </div>
                        )}
                      </div>

                      {/* Workforce Summary Metrics */}
                      <div className="space-y-0.5 text-[10px] font-semibold text-slate-500">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Users className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{day.workingCount ?? (day.status === 'WEEK_OFF' || day.status === 'HOLIDAY' ? 0 : (stats?.totalEmployees || 104))} Working</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600">
                          <UserMinus className="w-2.5 h-2.5 text-orange-500" />
                          <span>{day.leaveCount ?? 0} Leave</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-2.5 h-2.5 text-blue-500" />
                          <span>{day.shiftsCount ?? (day.status === 'WEEK_OFF' ? 0 : (stats?.activeShiftsCount || 7))} Shifts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE: WEEK VIEW                                                  */}
          {/* ===================================================================== */}
          {viewMode === 'Week' && (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-2">
                {DAY_LABELS_FULL.map((label, idx) => {
                  const isWeekOff = idx === 1; // Tuesday
                  const totalEmps = stats?.totalEmployees || 104;
                  return (
                    <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
                      <div className="text-sm font-black text-slate-800 mt-1">
                        {isWeekOff ? 'Week Off' : 'General Shift'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {isWeekOff ? '00:00 - 00:00' : '09:00 - 18:00 (9h)'}
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] space-y-1">
                        <div className={`font-bold ${isWeekOff ? 'text-slate-500' : 'text-emerald-700'}`}>
                          {isWeekOff ? `${totalEmps} Off` : `${totalEmps} Staff Working`}
                        </div>
                        <div className="text-slate-400">PRD • QC • QA • HR • ADMIN</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE: DAY VIEW                                                   */}
          {/* ===================================================================== */}
          {viewMode === 'Day' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Daily Schedule Timeline — {activeSelectedDayData.dateString}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {(activeSelectedDayData.dayName || 'monday').toUpperCase()} • Policy: {activeSelectedDayData.status || 'WORKING'}
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  {activeSelectedDayData.workingCount ?? (activeSelectedDayData.status === 'WEEK_OFF' ? 0 : (stats?.totalEmployees || 104))} Employees Active
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {['06:00 - Morning Shift Start', '09:00 - General Office Shift Start', '13:00 - Operations Lunch Break', '14:00 - Shift Handover', '18:00 - General Shift Out', '22:00 - Night Production Run'].map((slot, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#00A896]" />
                      <span className="text-xs font-bold text-slate-700">{slot}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Auto-Logged via Biometric</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE: AGENDA VIEW                                                */}
          {/* ===================================================================== */}
          {viewMode === 'Agenda' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Upcoming Agenda & Milestones</h3>
              <div className="space-y-2">
                {((Array.isArray(holidays) ? holidays : []).concat(Array.isArray(events) ? events : [])).map((item, idx) => (
                  <div key={item._id || item.id || idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">{item.name || item.title || 'Event'}</div>
                        <div className="text-[11px] text-slate-400">{item.dateString || ''} • {item.type || 'Event'}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {item.applicableTo || 'ALL'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE: TIMELINE VIEW                                              */}
          {/* ===================================================================== */}
          {viewMode === 'Timeline' && (
            <div className="space-y-3 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Department</th>
                    <th className="p-3">Mon</th>
                    <th className="p-3">Tue</th>
                    <th className="p-3">Wed</th>
                    <th className="p-3">Thu</th>
                    <th className="p-3">Fri</th>
                    <th className="p-3">Sat</th>
                    <th className="p-3">Sun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DEPARTMENTS.filter(d => d !== 'ALL').map((dept) => (
                    <tr key={dept} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{dept}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">09-18</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">Off</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">09-18</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">09-18</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">09-18</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">09-18</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">09-18</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===================================================================== */}
          {/* VIEW MODE: CONFIGURE SCHEDULE VIEW                                    */}
          {/* ===================================================================== */}
          {viewMode === 'Configure' && (
            <div className="space-y-4 p-4 bg-slate-50/80 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">Master Company Schedule Configuration</h3>
                  <p className="text-xs text-slate-500">
                    Standard Rule: Every Tuesday Week Off, other 6 days Working Days (Monday, Wednesday, Thursday, Friday, Saturday, Sunday).
                  </p>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="px-3.5 py-2 bg-[#00A896] hover:bg-[#009282] text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Edit Master Schedule</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {(Array.isArray(schedules) ? schedules : []).map((s) => (
                  <div key={s._id || s.id || Math.random()} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800">{s.name || 'Schedule'}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                        {s.status || 'ACTIVE'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Type: <strong>{s.scheduleType || 'COMPANY'}</strong> • Dept: <strong>{s.department || 'ALL'}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Effective From: {s.effectiveFrom ? String(s.effectiveFrom).substring(0, 10) : '2026-01-01'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ======================================================================= */}
        {/* RIGHT SIDEBAR / INFORMATION PANEL (Matching Reference Design)           */}
        {/* ======================================================================= */}
        <div className="space-y-4">
          
          {/* A. MINI MONTH CALENDAR */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-black text-slate-800">
                {monthLabel} {year}
              </span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
              {DAY_LABELS_SHORT.map(d => <span key={d}>{d}</span>)}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {miniGridDays.map((d, i) => {
                if (d.isBlank) return <div key={d.id || `mini-b-${i}`} />;
                const isSel = selectedDate instanceof Date && !isNaN(selectedDate) && d.dayNumber === selectedDate.getDate();
                const isTue = (leadingBlanks + d.dayNumber - 1) % 7 === 1;
                return (
                  <button
                    key={`mini-d-${d.dayNumber}`}
                    onClick={() => {
                      const newSel = new Date(year, month - 1, d.dayNumber);
                      setSelectedDate(newSel);
                    }}
                    className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full font-bold transition-all ${
                      isSel
                        ? 'bg-[#00A896] text-white shadow-sm'
                        : isTue
                        ? 'text-red-500 hover:bg-slate-100'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. QUICK STATS (Selected Date) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800">
                Quick Stats ({selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate.getDate() : 1} {monthLabel.substring(0, 3)} {year})
              </h3>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                activeSelectedDayData.status === 'WEEK_OFF' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                activeSelectedDayData.status === 'HOLIDAY' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {activeSelectedDayData.status === 'WEEK_OFF' ? 'Week Off' :
                 activeSelectedDayData.status === 'HOLIDAY' ? 'Holiday' :
                 activeSelectedDayData.status === 'SPECIAL_WORKING_DAY' ? 'Special Day' :
                 'Working Day'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Total Employees</span>
                </div>
                <span className="font-black text-slate-800">{stats?.totalEmployees || 104}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Working</span>
                </div>
                <span className="font-bold text-emerald-600">
                  {activeSelectedDayData.workingCount ?? (stats?.totalEmployees || 104)} ({((Number(activeSelectedDayData.workingCount ?? (stats?.totalEmployees || 104)) / (stats?.totalEmployees || 104)) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <UserMinus className="w-4 h-4 text-orange-500" />
                  <span>On Leave</span>
                </div>
                <span className="font-bold text-orange-600">
                  {activeSelectedDayData.leaveCount ?? 0} ({((Number(activeSelectedDayData.leaveCount || 0) / (stats?.totalEmployees || 104)) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Bed className="w-4 h-4 text-slate-500" />
                  <span>Week Off</span>
                </div>
                <span className="font-bold text-slate-500">
                  {activeSelectedDayData.weekOffCount ?? 0} ({((Number(activeSelectedDayData.weekOffCount || 0) / (stats?.totalEmployees || 104)) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>Total Shifts</span>
                </div>
                <span className="font-black text-slate-800">{activeSelectedDayData.shiftsCount ?? (stats?.activeShiftsCount || 7)}</span>
              </div>
            </div>
          </div>

          {/* C. UPCOMING EVENTS */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800">Upcoming Events & Holidays</h3>
              <button
                onClick={() => setViewMode('Agenda')}
                className="text-[11px] font-bold text-[#00A896] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {(() => {
                const combinedList = [];
                if (Array.isArray(stats?.upcomingHolidays) && stats.upcomingHolidays.length > 0) {
                  stats.upcomingHolidays.forEach(h => combinedList.push({ ...h, itemCategory: 'Holiday', iconType: 'purple' }));
                } else if (Array.isArray(holidays) && holidays.length > 0) {
                  holidays.forEach(h => combinedList.push({ ...h, itemCategory: 'Holiday', iconType: 'purple' }));
                }

                if (Array.isArray(stats?.upcomingEvents) && stats.upcomingEvents.length > 0) {
                  stats.upcomingEvents.forEach(e => combinedList.push({ ...e, itemCategory: 'Event', iconType: 'blue' }));
                } else if (Array.isArray(events) && events.length > 0) {
                  events.forEach(e => combinedList.push({ ...e, itemCategory: 'Event', iconType: 'blue' }));
                }

                if (Array.isArray(specialDays) && specialDays.length > 0) {
                  specialDays.forEach(s => combinedList.push({ ...s, itemCategory: 'Special Day', iconType: 'amber' }));
                }

                combinedList.sort((a, b) => (a.dateString || '').localeCompare(b.dateString || ''));
                const displayItems = combinedList.slice(0, 4);

                if (displayItems.length === 0) {
                  return (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl">
                      No upcoming events scheduled
                    </div>
                  );
                }

                return displayItems.map((item, idx) => (
                  <div
                    key={item._id || item.id || idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      item.iconType === 'purple' ? 'border-purple-100 bg-purple-50/40' :
                      item.iconType === 'blue' ? 'border-blue-100 bg-blue-50/40' :
                      'border-amber-100 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        item.iconType === 'purple' ? 'bg-purple-100 text-purple-700' :
                        item.iconType === 'blue' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {item.iconType === 'purple' ? <Sparkles className="w-3.5 h-3.5" /> :
                         item.iconType === 'blue' ? <Flag className="w-3.5 h-3.5" /> :
                         <Zap className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.name || item.title || 'Event'}</div>
                        <div className="text-[10px] text-slate-400">{item.dateString || ''}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.iconType === 'purple' ? 'bg-purple-100 text-purple-700' :
                      item.iconType === 'blue' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.itemCategory}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* D. CALENDAR LEGEND */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5">
            <h3 className="text-xs font-black text-slate-800">Calendar Legend</h3>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Working Day</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Week Off</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Company Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Special Working Day</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE DAY DETAILS DRAWER / MODAL                                 */}
      {/* ========================================================================= */}
      {isDayDrawerOpen && selectedCalendarDay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {selectedCalendarDay.dayNumber} {monthLabel} {year}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {(selectedCalendarDay.dayName || '').toUpperCase()} • Policy: {selectedCalendarDay.status || 'WORKING'}
                </p>
              </div>
              <button
                onClick={() => setIsDayDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <div className="text-lg font-black text-emerald-700">
                  {selectedCalendarDay.workingCount ?? (selectedCalendarDay.status === 'WEEK_OFF' || selectedCalendarDay.status === 'HOLIDAY' ? 0 : (stats?.totalEmployees || 104))}
                </div>
                <div className="text-[10px] font-bold text-emerald-600">Working</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl text-center">
                <div className="text-lg font-black text-orange-700">{selectedCalendarDay.leaveCount ?? 0}</div>
                <div className="text-[10px] font-bold text-orange-600">On Leave</div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-center">
                <div className="text-lg font-black text-slate-700">
                  {selectedCalendarDay.weekOffCount ?? (selectedCalendarDay.status === 'WEEK_OFF' ? (stats?.totalEmployees || 104) : 0)}
                </div>
                <div className="text-[10px] font-bold text-slate-600">Week Off</div>
              </div>
            </div>

            {/* Active Date Overrides / Holidays Cancellation */}
            {(selectedCalendarDay.holiday || selectedCalendarDay.specialDay) && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    Active Rule: {selectedCalendarDay.holiday?.name || selectedCalendarDay.specialDay?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    {selectedCalendarDay.holiday ? 'Holiday' : selectedCalendarDay.specialDay?.type || 'Special Day'}
                  </span>
                </div>
                <div className="flex justify-end">
                  {selectedCalendarDay.holiday && (
                    <button
                      onClick={() => handleDeleteHoliday(selectedCalendarDay.holiday._id || selectedCalendarDay.holiday.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Holiday</span>
                    </button>
                  )}
                  {selectedCalendarDay.specialDay && (
                    <button
                      onClick={() => handleDeleteSpecialDay(selectedCalendarDay.specialDay._id || selectedCalendarDay.specialDay.id)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Special Override</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Day Actions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-slate-700">Set Date-Wise Policy for this Day</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSpecialDayForm({
                      ...specialDayForm,
                      dateString: selectedCalendarDay.dateString,
                      type: 'SPECIAL_WORKING_DAY',
                      name: `Special Working Day (${selectedCalendarDay.dateString})`
                    });
                    setIsSpecialDayModalOpen(true);
                  }}
                  className="p-3 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Sun className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-black">Set Week-On</div>
                    <div className="text-[10px] text-emerald-600 font-normal">Working Day</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSpecialDayForm({
                      ...specialDayForm,
                      dateString: selectedCalendarDay.dateString,
                      type: 'SPECIAL_HOLIDAY',
                      name: `Compensatory Rest (${selectedCalendarDay.dateString})`
                    });
                    setIsSpecialDayModalOpen(true);
                  }}
                  className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Bed className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <div className="font-black">Set Week-Off</div>
                    <div className="text-[10px] text-slate-500 font-normal">Special Rest Day</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setHolidayForm({
                      ...holidayForm,
                      dateString: selectedCalendarDay.dateString,
                      name: ''
                    });
                    setIsHolidayModalOpen(true);
                  }}
                  className="p-3 bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="font-black">Declare Holiday</div>
                    <div className="text-[10px] text-purple-600 font-normal">Public/Company</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEventForm({
                      ...eventForm,
                      dateString: selectedCalendarDay.dateString,
                      title: ''
                    });
                    setIsEventModalOpen(true);
                  }}
                  className="p-3 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-2xl text-xs font-bold text-left flex items-center gap-2.5 transition-all active:scale-95"
                >
                  <Flag className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-black">Add Event</div>
                    <div className="text-[10px] text-blue-600 font-normal">Celebration/Meeting</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Single Employee Inspector */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-black text-slate-700">Inspect Employee on this Date</h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inspectorSearchCode}
                  onChange={(e) => setInspectorSearchCode(e.target.value)}
                  placeholder="Employee Code (e.g. BH1022)"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl focus:outline-none focus:border-[#00A896]"
                />
                <button
                  onClick={() => handleInspectEmployee()}
                  className="px-4 py-2 bg-[#00A896] hover:bg-[#009282] text-white text-xs font-bold rounded-xl"
                >
                  Inspect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE / CONFIGURE MODALS                                              */}
      {/* ========================================================================= */}

      {/* Modal: Schedule Config (Matches Reference Design) */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-[#00A896]" />
                <span>Configure Work Schedule & Week Off Policy</span>
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Schedule Name</label>
                  <input
                    type="text"
                    value={scheduleForm.name}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#00A896] shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Scope</label>
                  <select
                    value={scheduleForm.scheduleType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#00A896] shadow-sm cursor-pointer"
                  >
                    <option value="COMPANY">Organization Standard</option>
                    <option value="DEPARTMENT">Department Specific</option>
                    <option value="EMPLOYEE">Single Employee Roster</option>
                  </select>
                </div>
              </div>

              {scheduleForm.scheduleType === 'DEPARTMENT' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Department</label>
                  <select
                    value={scheduleForm.department || 'PRD'}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#00A896] shadow-sm cursor-pointer"
                  >
                    {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {scheduleForm.scheduleType === 'EMPLOYEE' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">Employee Code</label>
                  <input
                    type="text"
                    placeholder="e.g. BH1022"
                    value={scheduleForm.employeeCode || ''}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, employeeCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#00A896] shadow-sm"
                  />
                </div>
              )}

              {/* Weekly Matrix matching screenshot pills with Date and Day paired */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-black text-xs">
                    Weekly Schedule Pattern (Date & Day Wise)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Click any day to toggle ON (Work) / OFF (Rest)
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                  {currentWeekDates.map((info) => {
                    const status = scheduleForm.weeklyPattern[info.dayKey]?.status || 'WORKING';
                    const isOff = status === 'WEEK_OFF';
                    return (
                      <div
                        key={info.dayKey}
                        onClick={() => {
                          const newStatus = isOff ? 'WORKING' : 'WEEK_OFF';
                          setScheduleForm({
                            ...scheduleForm,
                            weeklyPattern: {
                              ...scheduleForm.weeklyPattern,
                              [info.dayKey]: {
                                ...scheduleForm.weeklyPattern[info.dayKey],
                                status: newStatus,
                                workingHours: newStatus === 'WEEK_OFF' ? 0 : 9
                              }
                            }
                          });
                        }}
                        className={`py-2.5 px-1 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 select-none hover:scale-[1.02] ${
                          isOff
                            ? 'bg-slate-50/90 border-slate-300 text-slate-700'
                            : 'bg-emerald-50/70 border-emerald-400 text-emerald-700 shadow-sm shadow-emerald-50'
                        }`}
                      >
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          {info.dayLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {info.dateFormatted}
                        </span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          isOff ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isOff ? 'OFF' : 'ON'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date-Wise Schedule Plan Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    Date-Wise Schedule Plan ({monthLabel} {year})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold">Effective From:</span>
                    <input
                      type="date"
                      value={scheduleForm.effectiveFrom ? String(scheduleForm.effectiveFrom).substring(0, 10) : '2026-01-01'}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, effectiveFrom: e.target.value })}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Week-On Plan (Working Days)</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      {Object.keys(scheduleForm.weeklyPattern || {})
                        .filter(d => scheduleForm.weeklyPattern[d]?.status !== 'WEEK_OFF')
                        .map(d => d.substring(0, 3).toUpperCase())
                        .join(', ') || 'Mon, Wed, Thu, Fri, Sat, Sun'} (9h Shifts)
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-slate-600" />
                      <span>Week-Off Plan (Rest Days)</span>
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      {Object.keys(scheduleForm.weeklyPattern || {})
                        .filter(d => scheduleForm.weeklyPattern[d]?.status === 'WEEK_OFF')
                        .map(d => `Every ${d.charAt(0).toUpperCase() + d.slice(1)}`)
                        .join(', ') || 'Every Tuesday (Scheduled Off)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-[#00A896] hover:bg-[#009282] text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95"
                >
                  {actionLoading ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Declare Holiday (Date & Day Wise) */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Declare Public / Company Holiday</span>
              </h3>
              <button onClick={() => setIsHolidayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHoliday} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Holiday Name</label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  placeholder="e.g. Diwali / Republic Day / Eid"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Select Date</label>
                  <input
                    type="date"
                    value={holidayForm.dateString}
                    onChange={(e) => setHolidayForm({ ...holidayForm, dateString: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 font-semibold cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Holiday Type</label>
                  <select
                    value={holidayForm.type}
                    onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="COMPANY_HOLIDAY">Company Holiday</option>
                    <option value="NATIONAL_HOLIDAY">National Holiday</option>
                    <option value="FESTIVAL_HOLIDAY">Festival Holiday</option>
                    <option value="PUBLIC_HOLIDAY">Public Holiday</option>
                  </select>
                </div>
              </div>

              {/* Explicit Date & Day Banner */}
              {holidayForm.dateString && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <CalendarCheck className="w-4 h-4 text-purple-600" />
                    <span>
                      {(() => {
                        const d = new Date(holidayForm.dateString);
                        return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                      })()}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-200 text-purple-800 rounded-md text-[10px] font-bold">
                    Holiday
                  </span>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-bold mb-1">Applicable Scope</label>
                <select
                  value={holidayForm.applicableTo}
                  onChange={(e) => setHolidayForm({ ...holidayForm, applicableTo: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="ALL">All Employees (104 Active)</option>
                  <option value="DEPARTMENT">Specific Department</option>
                </select>
              </div>

              {holidayForm.applicableTo === 'DEPARTMENT' && (
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Department</label>
                  <select
                    value={holidayForm.department || 'PRD'}
                    onChange={(e) => setHolidayForm({ ...holidayForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsHolidayModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  {actionLoading ? 'Saving...' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Date-Wise Week-Off / Week-On / Special Day */}
      {isSpecialDayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Date-Wise Schedule & Special Day Override</span>
              </h3>
              <button onClick={() => setIsSpecialDayModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpecialDay} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Adjustment Title</label>
                <input
                  type="text"
                  value={specialDayForm.name}
                  onChange={(e) => setSpecialDayForm({ ...specialDayForm, name: e.target.value })}
                  placeholder="e.g. Urgent Batch Run / Special Shift ON"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Select Date</label>
                  <input
                    type="date"
                    value={specialDayForm.dateString}
                    onChange={(e) => setSpecialDayForm({ ...specialDayForm, dateString: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Action Type</label>
                  <select
                    value={specialDayForm.type}
                    onChange={(e) => setSpecialDayForm({ ...specialDayForm, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="SPECIAL_WORKING_DAY">🟢 Week-On (Special Working Day)</option>
                    <option value="SPECIAL_HOLIDAY">⚪ Week-Off (Special Rest Day)</option>
                  </select>
                </div>
              </div>

              {/* Explicit Date & Day Banner */}
              {specialDayForm.dateString && (
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  specialDayForm.type === 'SPECIAL_WORKING_DAY'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-slate-100 border-slate-300 text-slate-800'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      {(() => {
                        const d = new Date(specialDayForm.dateString);
                        return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                      })()}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    specialDayForm.type === 'SPECIAL_WORKING_DAY'
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {specialDayForm.type === 'SPECIAL_WORKING_DAY' ? 'Week-On' : 'Week-Off'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Scope</label>
                  <select
                    value={specialDayForm.applicableTo}
                    onChange={(e) => setSpecialDayForm({ ...specialDayForm, applicableTo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="ALL">All Organization</option>
                    <option value="DEPARTMENT">Specific Department</option>
                  </select>
                </div>
                {specialDayForm.applicableTo === 'DEPARTMENT' && (
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Department</label>
                    <select
                      value={specialDayForm.department}
                      onChange={(e) => setSpecialDayForm({ ...specialDayForm, department: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      {DEPARTMENTS.filter(d => d !== 'ALL').map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Reason / Operational Purpose</label>
                <textarea
                  value={specialDayForm.reason}
                  onChange={(e) => setSpecialDayForm({ ...specialDayForm, reason: e.target.value })}
                  placeholder="e.g. Approved extra shift to meet production deadline"
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSpecialDayModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  {actionLoading ? 'Applying...' : 'Apply Date Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Employee Inspector Details */}
      {isInspectorModalOpen && inspectorData && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {inspectorData.employee?.name || inspectorData.employee?.employeeCode}
                </h3>
                <p className="text-xs text-slate-400">
                  Code: {inspectorData.employee?.employeeCode} • Dept: {inspectorData.employee?.department}
                </p>
              </div>
              <button onClick={() => setIsInspectorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 font-bold">
                Working: {inspectorData.summary?.workingDays ?? 0}
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-700 font-bold">
                Week Offs: {inspectorData.summary?.weekOffDays ?? 0}
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-purple-700 font-bold">
                Holidays: {inspectorData.summary?.holidays ?? 0}
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-700 font-bold">
                Leaves: {inspectorData.summary?.approvedLeaves ?? 0}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 font-bold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Day</th>
                    <th className="p-2.5">Expected Status</th>
                    <th className="p-2.5">Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array.isArray(inspectorData.days) && inspectorData.days.slice(0, 10).map((d) => (
                    <tr key={d.dateString || Math.random()}>
                      <td className="p-2.5 font-bold text-slate-700">{d.dateString}</td>
                      <td className="p-2.5 uppercase text-slate-500">{d.dayName || ''}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.expectedStatus === 'WEEK_OFF' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {d.expectedStatus || 'WORKING'}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{d.shiftName || 'General Shift'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HRWorkforceCalendar;
