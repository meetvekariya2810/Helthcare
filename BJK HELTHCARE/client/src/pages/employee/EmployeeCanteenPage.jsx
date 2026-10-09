import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { useNotification } from '../../context/NotificationContext';
import { canteenAPI } from '../../services/api';
import {
  Utensils,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  Calendar,
  History,
  TrendingUp,
  RefreshCw,
  Search,
  User,
  Building2,
  Briefcase,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Flame,
  Coffee,
  X
} from 'lucide-react';

export const EmployeeCanteenPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const { showToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'today';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDishType, setSelectedDishType] = useState(''); // 'Full Dish' | 'Half Dish'
  const [dishSelectionError, setDishSelectionError] = useState(false);

  // Today's lunch data state
  const [todayData, setTodayData] = useState({
    employeeId: employeeUser?.employeeId || '',
    employeeName: employeeUser?.fullName || employeeUser?.name || 'Employee',
    department: employeeUser?.department || 'General',
    designation: employeeUser?.designation || 'Staff',
    date: new Date().toISOString().split('T')[0],
    dateDisplay: '--',
    dishType: null,
    status: 'NOT_MARKED',
    lunchInAt: null,
    lunchInDisplay: '--',
    lunchOutAt: null,
    lunchOutDisplay: '--',
    durationMinutes: 0,
    durationDisplay: '--',
    finalized: false
  });

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchDate, setSearchDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Summary state
  const [summaryData, setSummaryData] = useState({
    month: 'Current Month',
    totalWorkingDays: 0,
    lunchInDays: 0,
    fullDishDays: 0,
    halfDishDays: 0,
    lunchCompletedDays: 0,
    missingLunchEntries: 0,
    totalLunchRecords: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Sync tab with URL
  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Fetch Today Status
  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await canteenAPI.getMyToday();
      if (res.data?.success && res.data?.data) {
        setTodayData(res.data.data);
        if (res.data.data.dishType) {
          setSelectedDishType(res.data.data.dishType);
        }
      }
    } catch (err) {
      console.error('Failed to load today lunch status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch History
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchDate) params.date = searchDate;

      const res = await canteenAPI.getMyHistory(params);
      if (res.data?.success && res.data?.data) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load canteen history:', err);
      showToast('error', 'Unable to fetch lunch history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch Monthly Summary
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await canteenAPI.getMySummary();
      if (res.data?.success && res.data?.data) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load canteen summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'summary') {
      fetchSummary();
    }
  }, [activeTab, startDate, endDate, searchDate]);

  // Handle LUNCH IN Action
  const handleLunchIn = async () => {
    if (!selectedDishType) {
      setDishSelectionError(true);
      showToast('error', 'Mandatory selection: Please select either 1. Full Dish or 2. Half Dish first.');
      return;
    }

    setDishSelectionError(false);

    try {
      setSubmitting(true);
      const res = await canteenAPI.lunchIn({ dishType: selectedDishType });
      if (res.data?.success) {
        showToast('success', res.data.message || `Lunch IN (${selectedDishType}) Recorded Successfully`);
        fetchTodayStatus();
      }
    } catch (err) {
      console.error('Lunch IN error:', err);
      showToast('error', err.response?.data?.message || err.normalizedMessage || 'Failed to record Lunch IN');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle LUNCH OUT Action
  const handleLunchOut = async () => {
    try {
      setSubmitting(true);
      const res = await canteenAPI.lunchOut();
      if (res.data?.success) {
        showToast('success', res.data.message || 'Lunch OUT Recorded Successfully');
        fetchTodayStatus();
      }
    } catch (err) {
      console.error('Lunch OUT error:', err);
      showToast('error', err.response?.data?.message || err.normalizedMessage || 'Failed to record Lunch OUT');
    } finally {
      setSubmitting(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Lunch IN (In Progress)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            <CheckCircle2 size={13} className="text-emerald-500" />
            Lunch Completed
          </span>
        );
      case 'FINALIZED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 border border-teal-500/30">
            <ShieldCheck size={13} className="text-teal-600" />
            Finalized by HR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Clock size={13} />
            Not Marked
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 lg:p-6 space-y-6">
      {/* 1. Header Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start md:items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-[#00A896] text-white flex items-center justify-center font-extrabold shadow-md shadow-teal-500/20 flex-shrink-0">
              <Utensils size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Employee Canteen</h1>
                {renderStatusBadge(todayData.status)}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                BJK Healthcare Digital Brain — Daily Employee Dining & Meal Recording
              </p>
            </div>
          </div>

          {/* Employee Identity Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold">
              <User size={14} className="text-teal-600" />
              <span>{todayData.employeeName || employeeUser?.fullName || 'Employee'}</span>
              <span className="text-slate-400 font-normal">({todayData.employeeId || employeeUser?.employeeId || 'ID'})</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold">
              <Building2 size={14} className="text-teal-600" />
              <span>{todayData.department || 'Operations'}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 font-semibold">
              <Calendar size={14} className="text-teal-600" />
              <span>{todayData.dateDisplay || 'Today'}</span>
            </div>
            <button
              onClick={fetchTodayStatus}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh status"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-teal-600' : ''} />
            </button>
          </div>
        </div>

        {/* Canteen Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coffee size={15} />
            <span>Today's Lunch</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History size={15} />
            <span>Lunch History</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('summary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-[#00A896] text-white shadow-sm shadow-teal-500/30'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp size={15} />
            <span>My Canteen Summary</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}

      {/* TAB 1: TODAY'S LUNCH */}
      {activeTab === 'today' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Action Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Today's Lunch Card</h2>
                  <p className="text-xs text-slate-500 font-medium">Record your lunch attendance with real-time canteen sync</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{todayData.dateDisplay}</div>
                  <div className="text-[10px] text-teal-600 font-bold uppercase">Asia/Kolkata Timezone</div>
                </div>
              </div>

              {/* Status Visual Display */}
              <div className="my-6 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-teal-100">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Lunch Status</span>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">
                      {todayData.status === 'NOT_MARKED' ? 'Not Marked' : todayData.status}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Lunch IN Time</span>
                    <div className="text-sm font-extrabold text-teal-700 mt-1">
                      {todayData.lunchInDisplay || '--'}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs col-span-2 md:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Lunch OUT Time</span>
                    <div className="text-sm font-extrabold text-slate-800 mt-1">
                      {todayData.lunchOutDisplay || '--'}
                    </div>
                  </div>
                </div>

                {todayData.durationDisplay && todayData.durationDisplay !== '--' && (
                  <div className="mt-3 text-center text-xs font-semibold text-slate-600">
                    Recorded Duration: <span className="text-teal-700 font-bold">{todayData.durationDisplay}</span>
                  </div>
                )}
              </div>

              {/* Dish Selection Section (Step 1 - Mandatory) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00A896] text-white text-[11px] font-extrabold">1</span>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Select Meal Portion <span className="text-rose-500 font-bold">* (Mandatory)</span>
                    </h3>
                  </div>
                  {selectedDishType && (
                    <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      Selected: {selectedDishType}
                    </span>
                  )}
                </div>

                {dishSelectionError && !selectedDishType && (
                  <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2 animate-bounce">
                    <AlertCircle size={14} className="text-rose-600 flex-shrink-0" />
                    <span>Please select either 1. Full Dish or 2. Half Dish before recording Lunch IN.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* OPTION 1: FULL DISH */}
                  <button
                    type="button"
                    disabled={todayData.lunchInAt !== null}
                    onClick={() => {
                      if (todayData.lunchInAt === null) {
                        setSelectedDishType('Full Dish');
                        setDishSelectionError(false);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      selectedDishType === 'Full Dish'
                        ? 'bg-gradient-to-br from-teal-500/10 via-emerald-50/40 to-teal-500/5 border-teal-500 ring-2 ring-teal-500/30 shadow-sm'
                        : dishSelectionError
                        ? 'bg-white border-rose-300 hover:border-rose-400'
                        : 'bg-white border-slate-200/90 hover:border-teal-300 hover:bg-slate-50/70'
                    } ${todayData.lunchInAt !== null ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${
                          selectedDishType === 'Full Dish'
                            ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/20'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          🍱
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-slate-900">1. Full Dish</span>
                            {selectedDishType === 'Full Dish' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Standard Full Meal / Complete Thali Portion
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedDishType === 'Full Dish'
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {selectedDishType === 'Full Dish' && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </button>

                  {/* OPTION 2: HALF DISH */}
                  <button
                    type="button"
                    disabled={todayData.lunchInAt !== null}
                    onClick={() => {
                      if (todayData.lunchInAt === null) {
                        setSelectedDishType('Half Dish');
                        setDishSelectionError(false);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      selectedDishType === 'Half Dish'
                        ? 'bg-gradient-to-br from-teal-500/10 via-emerald-50/40 to-teal-500/5 border-teal-500 ring-2 ring-teal-500/30 shadow-sm'
                        : dishSelectionError
                        ? 'bg-white border-rose-300 hover:border-rose-400'
                        : 'bg-white border-slate-200/90 hover:border-teal-300 hover:bg-slate-50/70'
                    } ${todayData.lunchInAt !== null ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${
                          selectedDishType === 'Half Dish'
                            ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-sm shadow-teal-500/20'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          🥣
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-slate-900">2. Half Dish</span>
                            {selectedDishType === 'Half Dish' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-600 text-white">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Light Meal / Half Thali Portion
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        selectedDishType === 'Half Dish'
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {selectedDishType === 'Half Dish' && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Interactive Punch Buttons */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00A896] text-white text-[11px] font-extrabold">2</span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Punch Today's Lunch Time
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LUNCH IN BUTTON */}
                  <button
                    type="button"
                    onClick={handleLunchIn}
                    disabled={submitting || todayData.lunchInAt !== null}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
                      todayData.lunchInAt !== null
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : !selectedDishType
                        ? 'bg-emerald-600/70 hover:bg-emerald-600 text-white shadow-emerald-600/20 cursor-pointer'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <Utensils size={18} />
                    <span>{todayData.lunchInAt ? `✓ Lunch IN (${todayData.dishType || selectedDishType || 'Done'})` : 'LUNCH IN'}</span>
                  </button>

                  {/* LUNCH OUT BUTTON */}
                  <button
                    type="button"
                    onClick={handleLunchOut}
                    disabled={submitting || !todayData.lunchInAt || todayData.lunchOutAt !== null}
                    className={`flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
                      todayData.lunchOutAt !== null
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : todayData.lunchInAt
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 hover:shadow-md cursor-pointer animate-pulse'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <Clock size={18} />
                    <span>{todayData.lunchOutAt ? '✓ Lunch OUT Recorded' : 'LUNCH OUT'}</span>
                  </button>
                </div>
              </div>

              {/* Helpful Guidance Notice */}
              <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                <AlertCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>How it works:</strong> First select either <strong className="text-slate-800">1. Full Dish</strong> or <strong className="text-slate-800">2. Half Dish</strong>, then click <span className="text-emerald-700 font-bold">LUNCH IN</span> when you arrive at the canteen. Once finished dining, click <span className="text-amber-700 font-bold">LUNCH OUT</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Today's Table Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight mb-3">TODAY'S LUNCH RECORD</h2>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-600">Date</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{todayData.dateDisplay}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-600">Dish Type</td>
                      <td className="py-2.5 px-4 font-extrabold text-teal-800">
                        {todayData.dishType ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                            {todayData.dishType === 'Full Dish' ? '🍱 Full Dish' : '🥣 Half Dish'}
                          </span>
                        ) : selectedDishType ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                            {selectedDishType === 'Full Dish' ? '🍱 Full Dish (Selected)' : '🥣 Half Dish (Selected)'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not Selected</span>
                        )}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-600">Lunch IN</td>
                      <td className="py-2.5 px-4 font-semibold text-emerald-700">{todayData.lunchInDisplay}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-600">Lunch OUT</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-700">{todayData.lunchOutDisplay}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-600">Duration</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{todayData.durationDisplay}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-slate-600">Status</td>
                      <td className="py-2.5 px-4 font-semibold">{renderStatusBadge(todayData.status)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Canteen Information Box */}
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50/30 border border-teal-200/60">
                <div className="flex items-center gap-2 text-teal-800 font-extrabold text-xs mb-1">
                  <Sparkles size={14} className="text-[#00A896]" />
                  <span>BJK Canteen Department Info</span>
                </div>
                <p className="text-[11px] text-teal-900/80 leading-relaxed">
                  Portion selections (Full Dish vs Half Dish) are synced live with HR and the canteen culinary team for optimized food preparation and zero wastage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LUNCH HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Personal Lunch History</h2>
              <p className="text-xs text-slate-500 font-medium">View your past dining entries, portion types, and duration logs</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-400 mr-2 text-[10px] font-bold uppercase">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-slate-400 mr-2 text-[10px] font-bold uppercase">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
                />
              </div>

              {(startDate || endDate || searchDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setSearchDate('');
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Reset
                </button>
              )}

              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <RefreshCw size={13} className={historyLoading ? 'animate-spin text-teal-600' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Dish Type</th>
                  <th className="py-3 px-4">Lunch IN</th>
                  <th className="py-3 px-4">Lunch OUT</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      <RefreshCw size={20} className="animate-spin text-teal-600 mx-auto mb-2" />
                      Loading your canteen records...
                    </td>
                  </tr>
                ) : historyList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                      <Coffee size={28} className="mx-auto mb-2 text-slate-300" />
                      No canteen records found for selected period.
                    </td>
                  </tr>
                ) : (
                  historyList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{item.dateDisplay}</td>
                      <td className="py-3 px-4 font-bold">
                        {item.dishType === 'Full Dish' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            🍱 Full Dish
                          </span>
                        ) : item.dishType === 'Half Dish' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            🥣 Half Dish
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{item.lunchInDisplay}</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">{item.lunchOutDisplay}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{item.durationDisplay}</td>
                      <td className="py-3 px-4">{renderStatusBadge(item.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY CANTEEN SUMMARY */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">My Canteen Monthly Summary</h2>
                <p className="text-xs text-slate-500 font-medium">Monthly meal adherence and portion breakdown overview</p>
              </div>
              <div className="px-3 py-1 rounded-xl bg-teal-50 border border-teal-200/80 text-xs font-bold text-teal-800">
                {summaryData.month}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
              {/* Working Days */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Working Days</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">{summaryData.totalWorkingDays}</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Elapsed this month</p>
              </div>

              {/* Total Lunch Records */}
              <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 text-center">
                <span className="text-[10px] font-extrabold uppercase text-[#00A896]">Total Lunch Records</span>
                <div className="text-2xl font-extrabold text-[#00A896] mt-1">{summaryData.totalLunchRecords}</div>
                <p className="text-[10px] text-teal-700 mt-0.5">Recorded entries</p>
              </div>

              {/* Full Dish Count */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 text-center">
                <span className="text-[10px] font-extrabold uppercase text-emerald-700">Full Dish Portions</span>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">{summaryData.fullDishDays || 0}</div>
                <p className="text-[10px] text-emerald-600 mt-0.5">Full thali meals</p>
              </div>

              {/* Half Dish Count */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 text-center">
                <span className="text-[10px] font-extrabold uppercase text-blue-700">Half Dish Portions</span>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">{summaryData.halfDishDays || 0}</div>
                <p className="text-[10px] text-blue-600 mt-0.5">Light thali meals</p>
              </div>

              {/* Lunch Completed */}
              <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-200 text-center">
                <span className="text-[10px] font-extrabold uppercase text-teal-700">Completed Sessions</span>
                <div className="text-2xl font-extrabold text-teal-700 mt-1">{summaryData.lunchCompletedDays}</div>
                <p className="text-[10px] text-teal-600 mt-0.5">With Lunch OUT</p>
              </div>

              {/* Missing Lunch Entries */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 text-center">
                <span className="text-[10px] font-extrabold uppercase text-rose-700">Missing Entry</span>
                <div className="text-2xl font-extrabold text-rose-700 mt-1">{summaryData.missingLunchEntries}</div>
                <p className="text-[10px] text-rose-600 mt-0.5">Missing OUT punch</p>
              </div>
            </div>

            {/* Example Card Format Matching Spec */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-slate-50 to-emerald-500/10 border border-teal-200/80">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Monthly Breakdown — {summaryData.month}
              </h3>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
                <div>
                  Total Lunch Records: <strong className="text-slate-900">{summaryData.totalLunchRecords}</strong>
                </div>
                <div>
                  Full Dish: <strong className="text-emerald-700">{summaryData.fullDishDays || 0}</strong>
                </div>
                <div>
                  Half Dish: <strong className="text-blue-700">{summaryData.halfDishDays || 0}</strong>
                </div>
                <div>
                  Lunch Completed: <strong className="text-teal-700">{summaryData.lunchCompletedDays}</strong>
                </div>
                <div>
                  Missing Entry: <strong className="text-rose-700">{summaryData.missingLunchEntries}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCanteenPage;
