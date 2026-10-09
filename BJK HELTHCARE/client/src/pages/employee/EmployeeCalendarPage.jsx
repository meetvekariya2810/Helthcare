import React, { useState, useEffect, useMemo } from 'react';
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
  PartyPopper,
  Plus,
  Flag,
  Sun,
  Bed,
  UserMinus,
  Check,
  Zap,
  MoreHorizontal,
  Briefcase
} from 'lucide-react';
import { employeeCalendarAPI, employeeLeaveAPI } from '../../services/employeeApi';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const EmployeeCalendarPage = () => {
  const { currentEmployee, employeeToken } = useEmployeeAuth();
  
  // Date and View State
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('Month'); // Month, Week, Day, Agenda

  // Data States
  const [calendarData, setCalendarData] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [prefilledLeaveDate, setPrefilledLeaveDate] = useState('');

  const safeDate = currentDate instanceof Date && !isNaN(currentDate) ? currentDate : new Date();
  const year = safeDate.getFullYear();
  const month = safeDate.getMonth() + 1;
  const monthLabel = MONTH_NAMES[month - 1] || 'September';

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [calRes, schRes, holRes, evRes, leaveBalRes] = await Promise.all([
        employeeCalendarAPI.getMyCalendar({ year, month }).catch(() => ({ data: { success: false } })),
        employeeCalendarAPI.getMySchedule().catch(() => ({ data: { success: false } })),
        employeeCalendarAPI.getMyHolidays({ year }).catch(() => ({ data: { success: false } })),
        employeeCalendarAPI.getMyEvents({ year }).catch(() => ({ data: { success: false } })),
        employeeLeaveAPI.getBalance?.().catch(() => ({ data: { success: false } }))
      ]);

      if (calRes?.data?.success) setCalendarData(calRes.data.data);
      if (schRes?.data?.success) setScheduleData(schRes.data.data);
      if (holRes?.data?.success && Array.isArray(holRes.data.data)) setHolidays(holRes.data.data);
      if (evRes?.data?.success && Array.isArray(evRes.data.data)) setEvents(evRes.data.data);
      if (leaveBalRes?.data?.success && Array.isArray(leaveBalRes.data.data)) setLeaveBalances(leaveBalRes.data.data);
    } catch (err) {
      console.error('Failed to load employee calendar:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSelectDay = (day) => {
    if (day.isPadding || day.isBlank) return;
    const newSel = new Date(year, month - 1, day.dayNumber);
    setSelectedDate(newSel);
    setSelectedDay(day);
    setIsDayDrawerOpen(true);
  };

  // Month grid calculations
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun
  const leadingBlanks = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  const prevMonthDaysCount = new Date(year, month - 1, 0).getDate();

  // 7-Column Calendar Grid Cells
  const gridDays = useMemo(() => {
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

    // Days from calendarData or calculated
    if (calendarData?.days && Array.isArray(calendarData.days)) {
      calendarData.days.forEach(d => {
        arr.push({
          isPadding: false,
          ...d
        });
      });
    } else {
      // Fallback calculation if data is loading
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayObj = new Date(year, month - 1, d);
        const dayIndex = dayObj.getDay() === 0 ? 6 : dayObj.getDay() - 1;
        const isTue = dayIndex === 1;

        arr.push({
          isPadding: false,
          dayNumber: d,
          dateString: dateStr,
          dayName: DAY_LABELS_SHORT[dayIndex].toLowerCase(),
          expectedStatus: isTue ? 'WEEK_OFF' : 'WORKING',
          shiftName: isTue ? 'Weekly Off' : 'General Shift (09:00 - 18:00)',
          startTime: isTue ? '00:00' : '09:00',
          endTime: isTue ? '00:00' : '18:00',
          workingHours: isTue ? 0 : 9
        });
      }
    }

    // Trailing next month days to complete grid
    const remainingCells = (7 - (arr.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      arr.push({
        isPadding: true,
        dayNumber: i,
        id: `next-${i}`
      });
    }

    return arr;
  }, [calendarData, year, month, leadingBlanks, daysInMonth, prevMonthDaysCount]);

  // Selected Day Resolution
  const activeSelectedDay = useMemo(() => {
    const validSel = selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : new Date();
    const selDateStr = validSel.toISOString().split('T')[0];
    const found = gridDays.find(d => !d.isPadding && d.dateString === selDateStr);
    if (found) return found;

    return {
      dayNumber: validSel.getDate(),
      dateString: selDateStr,
      expectedStatus: 'WORKING',
      shiftName: 'General Shift (09:00 - 18:00)',
      startTime: '09:00',
      endTime: '18:00',
      workingHours: 9
    };
  }, [selectedDate, gridDays]);

  // Mini Calendar grid for Right Sidebar
  const miniGridDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < leadingBlanks; i++) arr.push({ isBlank: true, id: `mb-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push({ isBlank: false, dayNumber: d });
    }
    return arr;
  }, [leadingBlanks, daysInMonth]);

  // Summary KPIs from API data
  const summary = calendarData?.summary || {
    workingDays: 25,
    weekOffDays: 4,
    holidays: 2,
    approvedLeaves: 1,
    pendingLeaves: 0,
    specialWorkingDays: 0
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-4 md:p-6 space-y-5 font-sans antialiased">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER (Matching Reference Layout & Style)                          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#00A896] flex items-center justify-center text-white shadow-md shadow-[#00A896]/20 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              My Calendar
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              View your personal work schedule, shifts, week offs, leave, holidays and company events.
            </p>
          </div>
        </div>

        {/* Header Action: + Apply for Leave */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPrefilledLeaveDate(new Date().toISOString().split('T')[0]);
              setIsLeaveModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00A896] hover:bg-[#009282] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PERSONAL KPI CARDS (6 Personal Metrics Matching Reference)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Working Days */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {summary.workingDays ?? 25}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Working Days</div>
            <div className="text-[10px] text-emerald-600 font-semibold">(This Month)</div>
          </div>
        </div>

        {/* Week Offs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {summary.weekOffDays ?? 4}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Week Offs</div>
            <div className="text-[10px] text-orange-600 font-semibold">(Tuesday Offs)</div>
          </div>
        </div>

        {/* Holidays */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {summary.holidays ?? holidays.length ?? 2}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Holidays</div>
            <div className="text-[10px] text-purple-600 font-semibold">(Gazetted)</div>
          </div>
        </div>

        {/* Approved Leave */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {summary.approvedLeaves ?? 1}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Approved Leave</div>
            <div className="text-[10px] text-blue-600 font-semibold">(Paid/Casual)</div>
          </div>
        </div>

        {/* Pending Leave */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {summary.pendingLeaves ?? 0}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Pending Leave</div>
            <div className="text-[10px] text-amber-600 font-semibold">(Under Review)</div>
          </div>
        </div>

        {/* Events & Functions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 leading-tight">
              {events.length ?? 1}
            </div>
            <div className="text-[11px] font-bold text-slate-600">Events & Functions</div>
            <div className="text-[10px] text-indigo-600 font-semibold">(Company)</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKFORCE CALENDAR AREA + RIGHT INFORMATION PANEL                  */}
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

            {/* Right: View Switcher (Month, Week, Day, Agenda) */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              {['Month', 'Week', 'Day', 'Agenda'].map((mode) => (
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
          {/* VIEW MODE: MONTH VIEW (Default)                                       */}
          {/* ===================================================================== */}
          {viewMode === 'Month' && (
            <div className="space-y-2">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {DAY_LABELS_SHORT.map((dayLabel, idx) => (
                  <div
                    key={dayLabel}
                    className={`text-xs font-bold uppercase tracking-wider py-1 ${
                      idx === 1 ? 'text-orange-500 font-black' : 'text-slate-600'
                    }`}
                  >
                    {dayLabel}
                  </div>
                ))}
              </div>

              {/* 7-Column Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {gridDays.map((day, idx) => {
                  if (day.isPadding) {
                    return (
                      <div
                        key={day.id || `pad-${idx}`}
                        className="min-h-[110px] rounded-xl border border-dashed border-slate-200/50 bg-slate-50/40 p-2 text-slate-300 select-none flex flex-col justify-between opacity-50"
                      >
                        <span className="text-xs font-bold text-slate-400">{day.dayNumber}</span>
                      </div>
                    );
                  }

                  const isSelected = selectedDate instanceof Date && !isNaN(selectedDate) &&
                    selectedDate.getDate() === day.dayNumber &&
                    selectedDate.getMonth() + 1 === month &&
                    selectedDate.getFullYear() === year;

                  const status = day.expectedStatus || 'WORKING';
                  const isWeekOff = status === 'WEEK_OFF';
                  const isHoliday = status === 'HOLIDAY';
                  const isApprovedLeave = status === 'APPROVED_LEAVE';
                  const isPendingLeave = status === 'PENDING_LEAVE';
                  const isSpecial = status === 'SPECIAL_WORKING_DAY';
                  const hasEvent = day.events && day.events.length > 0;

                  return (
                    <div
                      key={day.dateString || `cell-${idx}`}
                      onClick={() => handleSelectDay(day)}
                      className={`min-h-[115px] rounded-xl border p-2.5 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-md ${
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

                      {/* Personal Status Badge Pill */}
                      <div className="my-1 space-y-1">
                        {isHoliday ? (
                          <div className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-100 text-purple-700 flex items-center gap-1 text-[10px] font-bold">
                            <Sparkles className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                            <span className="truncate">{day.holidayName || day.name || 'Holiday'}</span>
                          </div>
                        ) : isApprovedLeave ? (
                          <div className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 flex items-center gap-1 text-[10px] font-bold">
                            <CalendarCheck className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                            <span className="truncate">{day.leaveType || 'Approved Leave'}</span>
                          </div>
                        ) : isPendingLeave ? (
                          <div className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-1 text-[10px] font-bold">
                            <Clock className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span className="truncate">Pending Leave</span>
                          </div>
                        ) : isSpecial ? (
                          <div className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-amber-700 flex items-center gap-1 text-[10px] font-bold">
                            <Zap className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                            <span className="truncate">Special Day</span>
                          </div>
                        ) : isWeekOff ? (
                          <div className="px-2 py-0.5 rounded-md bg-orange-50/80 border border-orange-200/80 text-orange-700 inline-flex items-center gap-1 text-[10px] font-bold">
                            <Coffee className="w-2.5 h-2.5 text-orange-500" />
                            <span>Week Off</span>
                          </div>
                        ) : (
                          <div className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 inline-flex items-center gap-1 text-[10px] font-bold">
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Working</span>
                          </div>
                        )}

                        {hasEvent && (
                          <div className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center gap-1 text-[10px] font-bold">
                            <Flag className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                            <span className="truncate">{day.events[0]?.title || 'Event'}</span>
                          </div>
                        )}
                      </div>

                      {/* Assigned Shift Time */}
                      <div className="text-[10px] font-semibold text-slate-500 pt-1 border-t border-slate-100/80 truncate">
                        {isWeekOff ? (
                          <span className="text-orange-600 font-bold">Off Duty</span>
                        ) : isHoliday ? (
                          <span className="text-purple-600 font-bold">Public Holiday</span>
                        ) : (
                          <span>{day.startTime || '09:00'} - {day.endTime || '18:00'}</span>
                        )}
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
                {DAY_LABELS_FULL.map((label, idx) => (
                  <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
                    <div className="text-sm font-black text-slate-800 mt-1">
                      {idx === 1 ? 'Week Off' : 'General Shift'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {idx === 1 ? '00:00 - 00:00 (0h)' : '09:00 - 18:00 (9h)'}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] space-y-1">
                      <div className={idx === 1 ? 'text-orange-600 font-bold' : 'text-emerald-700 font-bold'}>
                        {idx === 1 ? 'Weekly Rest' : 'Assigned Shift'}
                      </div>
                    </div>
                  </div>
                ))}
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
                    Daily Schedule — {activeSelectedDay.dateString}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Shift: <strong>{activeSelectedDay.shiftName || 'General Shift'}</strong> • Status: <strong>{activeSelectedDay.expectedStatus}</strong>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeSelectedDay.expectedStatus === 'WEEK_OFF'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeSelectedDay.expectedStatus === 'WEEK_OFF' ? 'Week Off' : 'Working Day'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {[
                  { time: '09:00', title: 'Shift Check-In Window', desc: 'Biometric / Mobile punch active' },
                  { time: '13:00', title: 'Lunch & Rest Interval', desc: '45 mins standard break' },
                  { time: '18:00', title: 'Shift Check-Out Window', desc: 'Standard departure' }
                ].map((slot, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-[#00A896]" />
                      <div>
                        <span className="text-xs font-bold text-slate-800">{slot.time} • {slot.title}</span>
                        <p className="text-[11px] text-slate-400">{slot.desc}</p>
                      </div>
                    </div>
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
              <h3 className="text-sm font-bold text-slate-700">Monthly Schedule & Milestone Agenda</h3>
              <div className="space-y-2">
                {holidays.concat(events).map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-800">{item.name || item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.dateString} • {item.type || 'Event'}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      Applicable
                    </span>
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
                        ? 'text-orange-500 hover:bg-slate-100'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d.dayNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. UPCOMING (MY SCHEDULE) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800">Upcoming (My Schedule)</h3>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl border border-purple-100 bg-purple-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Dussehra</div>
                    <div className="text-[10px] text-slate-400">15 Oct {year}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                  Holiday
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-orange-100 bg-orange-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                    <CalendarCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Casual Leave</div>
                    <div className="text-[10px] text-slate-400">20 Oct {year}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-bold">
                  Leave
                </span>
              </div>

              <div className="p-2.5 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Flag className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Pharmacist Day</div>
                    <div className="text-[10px] text-slate-400">25 Sep {year}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                  Event
                </span>
              </div>
            </div>
          </div>

          {/* C. MY LEAVE BALANCE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-800">My Leave Balance</h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-semibold">Casual Leave (CL)</span>
                <span className="font-bold text-slate-800">3 / 12</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-semibold">Medical / Sick Leave (SL)</span>
                <span className="font-bold text-slate-800">2 / 10</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-semibold">Earned Leave (EL)</span>
                <span className="font-bold text-slate-800">5 / 15</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600 font-semibold">Compensatory Off</span>
                <span className="font-bold text-slate-800">0 / 5</span>
              </div>
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
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Week Off</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Company Event</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Special Working</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. DAY DETAIL DRAWER                                                      */}
      {/* ========================================================================= */}
      {isDayDrawerOpen && selectedDay && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  {selectedDay.dayNumber} {monthLabel} {year}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {selectedDay.dayName?.toUpperCase() || ''} • Status: {selectedDay.expectedStatus}
                </p>
              </div>
              <button
                onClick={() => setIsDayDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Shift</span>
                <div className="text-sm font-black text-slate-800">{selectedDay.shiftName || 'General Shift'}</div>
                <div className="text-xs text-slate-500">{selectedDay.startTime || '09:00'} - {selectedDay.endTime || '18:00'} ({selectedDay.workingHours || 9}h)</div>
              </div>

              {selectedDay.expectedStatus === 'WORKING' && (
                <button
                  onClick={() => {
                    setPrefilledLeaveDate(selectedDay.dateString);
                    setIsDayDrawerOpen(false);
                    setIsLeaveModalOpen(true);
                  }}
                  className="w-full p-2.5 bg-[#00A896] hover:bg-[#009282] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Apply Leave for this Day</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isLeaveModalOpen && (
        <ApplyLeaveModal
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          prefilledDate={prefilledLeaveDate}
          onSuccess={() => {
            setIsLeaveModalOpen(false);
            fetchData();
          }}
        />
      )}

    </div>
  );
};

export default EmployeeCalendarPage;
