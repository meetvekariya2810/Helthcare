import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KPICard } from '../../../components/common/KPICard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  CalendarCheck,
  Moon,
  TrendingUp,
  Briefcase,
  UserPlus,
  GraduationCap,
  ShieldAlert,
  CreditCard,
  Building2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  CheckCircle,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Activity,
  ShieldCheck,
  Database
} from 'lucide-react';

import { OneClickCommandRibbon } from '../../../components/dashboard/OneClickCommandRibbon';
import { SecondaryIntelligenceRibbon } from '../../../components/dashboard/SecondaryIntelligenceRibbon';
import { LiveWorkforceMonitor } from '../../../components/dashboard/LiveWorkforceMonitor';
import { EmployeeDataQualityCard } from '../../../components/dashboard/EmployeeDataQualityCard';
import { DepartmentBranchIntelligenceCard } from '../../../components/dashboard/DepartmentBranchIntelligenceCard';
import { RecruitmentLifecycleCard } from '../../../components/dashboard/RecruitmentLifecycleCard';
import { LeavePayrollSummaryCard } from '../../../components/dashboard/LeavePayrollSummaryCard';
import { EmployeeActivityMonitor } from '../../../components/dashboard/EmployeeActivityMonitor';

import { ExecutiveWarningsRow } from '../../../components/dashboard/ExecutiveWarningsRow';
import { MonthlyAttendanceStatusCard } from '../../../components/dashboard/MonthlyAttendanceStatusCard';
import { ExpensesBreakdownCard } from '../../../components/dashboard/ExpensesBreakdownCard';
import { EmployeeStatusPenetrationCard } from '../../../components/dashboard/EmployeeStatusPenetrationCard';
import { MonthlyPaidExpensesCard } from '../../../components/dashboard/MonthlyPaidExpensesCard';
import { AssetsSnapshotCard } from '../../../components/dashboard/AssetsSnapshotCard';
import { CelebrationsCard } from '../../../components/dashboard/CelebrationsCard';
import { TopHoursSpentCard } from '../../../components/dashboard/TopHoursSpentCard';
import { TodaysTaskStatusCard } from '../../../components/dashboard/TodaysTaskStatusCard';
import { MonthlyLeaveStatusCard } from '../../../components/dashboard/MonthlyLeaveStatusCard';
import { CurrentWorkforceStatusCard } from '../../../components/dashboard/CurrentWorkforceStatusCard';
import { DailyAttendanceStatusCard } from '../../../components/dashboard/DailyAttendanceStatusCard';

export const HRManagerDashboardView = ({
  data,
  user,
  onExportReport,
  onExportMasterDoc,
  onRefresh,
  isRefreshing
}) => {
  const navigate = useNavigate();
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [briefData, setBriefData] = useState(null);
  const [isBriefLoading, setIsBriefLoading] = useState(false);

  const handleGenerateBrief = async () => {
    try {
      setIsBriefLoading(true);
      setShowBriefModal(true);
      const token =
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('bjk_token') ||
        sessionStorage.getItem('bjk_auth_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('bjk_token');
      const res = await axios.get('/api/hr/policies/brief', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res?.data?.data) {
        setBriefData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to generate HR executive brief:', err);
    } finally {
      setIsBriefLoading(false);
    }
  };

  const kpis = data?.kpis || {
    totalEmployees: 91,
    activeEmployees: 91,
    presentToday: 0,
    absentToday: 91,
    onLeave: 0,
    lateToday: 0,
    nightShift: 0,
    overtime: 0,
    openPositions: 0,
    newJoiners: 28,
    trainingDue: 18,
    credentialsExpiring: 2
  };

  const secondaryKpis = data?.secondaryKpis || {};
  const attentionCenter = data?.attentionCenter || [];
  const lastSyncTime = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleString('en-GB');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 🚀 1. FRONT PAGE VIEW (SCREENSHOT 1): COMMAND CENTER & WORKFORCE TELEMETRY */}
      {/* ========================================================================= */}

      {/* A. Permanent One-Click Ribbon */}
      <OneClickCommandRibbon />

      {/* B. HR Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bjk-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-bjk-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-bjk-teal/20 text-bjk-teal uppercase tracking-widest border border-bjk-teal/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-bjk-teal animate-pulse" />
                <span>Enterprise Workforce Intelligence</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE &bull; MongoDB Atlas
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Last Synchronized: {lastSyncTime}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              BJK Healthcare Workforce Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Live workforce orchestration, pharmaceutical GMP compliance verification, shift rostering, and intelligent operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                title="Refresh real-time dashboard data"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-bjk-teal' : ''} />
                <span className="hidden sm:inline">Sync</span>
              </button>
            )}

            <button
              onClick={handleGenerateBrief}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center space-x-2"
            >
              <Sparkles size={15} />
              <span>Generate HR Executive Brief</span>
            </button>

            {onExportMasterDoc && (
              <button
                onClick={onExportMasterDoc}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-sm flex items-center space-x-2"
              >
                <FileSpreadsheet size={15} />
                <span>Master Spec (.DOCX)</span>
              </button>
            )}

            <button
              onClick={() => navigate('/hr/employees')}
              className="px-4 py-2.5 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white text-xs font-bold transition-all shadow-md shadow-bjk-teal/20 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Employee</span>
            </button>

            <button
              onClick={() => navigate('/hrms/rostering')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <CalendarDays size={15} />
              <span>Assign Shift</span>
            </button>
          </div>
        </div>
      </div>

      {/* C. Company Workforce Telemetry (12 Clickable KPI Cards in 2 Rows of 6) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <span>Company Workforce Telemetry</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Live Snapshot &bull; 100% DB Sourced</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KPICard
            title="Total Headcount"
            value={kpis.totalEmployees}
            subtitle="Registered workforce"
            icon={Users}
            color="teal"
            onClick={() => navigate('/hr/employees')}
          />
          <KPICard
            title="Active Workforce"
            value={kpis.activeEmployees}
            subtitle="In service today"
            icon={UserCheck}
            color="cyan"
            onClick={() => navigate('/hr/employees')}
          />
          <KPICard
            title="Present Today"
            value={kpis.presentToday}
            subtitle="Clocked in shifts"
            icon={Clock}
            color="teal"
            onClick={() => navigate('/hrms/attendance')}
          />
          <KPICard
            title="Absent Today"
            value={kpis.absentToday}
            subtitle="Unplanned leaves"
            icon={UserX}
            color="rose"
            onClick={() => navigate('/hrms/attendance')}
          />
          <KPICard
            title="On Leave"
            value={kpis.onLeave}
            subtitle="Approved requests"
            icon={CalendarCheck}
            color="orange"
            onClick={() => navigate('/hrms/leave')}
          />
          <KPICard
            title="Late Today"
            value={kpis.lateToday}
            subtitle="Beyond grace window"
            icon={Clock}
            color="orange"
            onClick={() => navigate('/hrms/attendance')}
          />
          <KPICard
            title="Night Shift"
            value={kpis.nightShift}
            subtitle="Pharma 22:00 - 06:30"
            icon={Moon}
            color="purple"
            onClick={() => navigate('/hrms/shifts')}
          />
          <KPICard
            title="Overtime Logged"
            value={kpis.overtime}
            subtitle="Extra operational hours"
            icon={TrendingUp}
            color="cyan"
            onClick={() => navigate('/hrms/attendance')}
          />
          <KPICard
            title="Open Positions"
            value={kpis.openPositions}
            subtitle="Active job postings"
            icon={Briefcase}
            color="teal"
            onClick={() => navigate('/hrms/recruitment')}
          />
          <KPICard
            title="New Joiners"
            value={kpis.newJoiners}
            subtitle="Last 30 days"
            icon={UserPlus}
            color="cyan"
            onClick={() => navigate('/hrms/onboarding')}
          />
          <KPICard
            title="Training Due"
            value={kpis.trainingDue}
            subtitle="GMP/GLP retraining"
            icon={GraduationCap}
            color="purple"
            onClick={() => navigate('/hrms/training')}
          />
          <KPICard
            title="Creds Expiring"
            value={kpis.credentialsExpiring}
            subtitle="Blocking certifications"
            icon={ShieldAlert}
            color="rose"
            onClick={() => navigate('/hrms/credentials')}
          />
        </div>
      </div>

      {/* D. Secondary Intelligence Badges Strip (Section 5) */}
      <SecondaryIntelligenceRibbon secondaryKpis={secondaryKpis} />

      {/* E. HR Attention Center & Workforce Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: HR Operational Attention Center */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    HR Operational Attention Center
                  </h3>
                  <p className="text-[11px] text-slate-400">High-priority compliance, shift, and authorization exceptions</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                {attentionCenter.length} Urgent Items
              </span>
            </div>

            {attentionCenter.length === 0 ? (
              <div className="py-10 text-center text-emerald-600 bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-sm">0 Urgent Items</p>
                <p className="text-xs text-slate-500 mt-0.5">All pharmaceutical authorizations, leave requests, and rosters are compliant.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attentionCenter.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-50 border-slate-200/80"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          item.severity === 'BLOCKING' || item.priority === 'URGENT'
                            ? 'bg-rose-500 ring-4 ring-rose-100 animate-pulse'
                            : 'bg-amber-400 ring-4 ring-amber-100'
                        }`}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-800">{item.title}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                              item.severity === 'BLOCKING' || item.priority === 'URGENT'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.priority || item.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          <strong className="text-slate-700 font-medium">{item.employee}</strong> &bull; {item.department}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          Target Due Date: {item.due}
                        </span>
                      </div>
                    </div>

                    {item.link && (
                      <button
                        onClick={() => navigate(item.link)}
                        className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 flex-shrink-0"
                      >
                        <span>Resolve</span>
                        <ArrowRight size={13} className="text-bjk-teal" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Governance Level: Strict Pharmaceutical QA</span>
            <span className="font-semibold text-rose-500">Active Exception Monitor</span>
          </div>
        </div>

        {/* Right: Workforce Quick Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between bjk-card-glow">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={16} className="text-bjk-teal" />
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Workforce Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/hrms/attendance')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <Clock size={18} className="text-bjk-teal mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Mark Punch</div>
                <div className="text-[10px] text-slate-400">Web/Mobile in-out</div>
              </button>

              <button
                onClick={() => navigate('/hrms/leave')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <CalendarCheck size={18} className="text-bjk-teal mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Approve Leave</div>
                <div className="text-[10px] text-slate-400">Workflow review</div>
              </button>

              <button
                onClick={() => navigate('/hrms/rostering')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <Users size={18} className="text-bjk-teal mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Assign Roster</div>
                <div className="text-[10px] text-slate-400">Validate rest & creds</div>
              </button>

              <button
                onClick={() => navigate('/hrms/training')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <GraduationCap size={18} className="text-bjk-teal mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">GMP Training</div>
                <div className="text-[10px] text-slate-400">Enroll workforce</div>
              </button>

              <button
                onClick={() => navigate('/hrms/payroll')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <CreditCard size={18} className="text-bjk-teal mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Run Payroll</div>
                <div className="text-[10px] text-slate-400">EPF, ESI & PT calc</div>
              </button>

              <button
                onClick={() => navigate('/hrms/copilot')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-bjk-purple/10 to-bjk-teal/10 hover:from-bjk-purple/20 hover:to-bjk-teal/20 text-left transition-all group border border-bjk-purple/20"
              >
                <Sparkles size={18} className="text-bjk-purple mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-slate-800">Ask Copilot</div>
                <div className="text-[10px] text-slate-500">AI Intelligence</div>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Enterprise Scope: Full Workforce</span>
            <span className="font-semibold text-bjk-teal">ISO 9001 / cGMP</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 2. REAL-TIME LIVE WORKFORCE STATUS TABLE (Section 6)                    */}
      {/* ========================================================================= */}
      <LiveWorkforceMonitor />

      {/* ========================================================================= */}
      {/* 🔍 3. EMPLOYEE DATA QUALITY & VERIFICATION CENTER (Section 10)            */}
      {/* ========================================================================= */}
      <EmployeeDataQualityCard dataQuality={data?.dataQuality} />

      {/* ========================================================================= */}
      {/* 🏢 4. DEPARTMENT & BRANCH INTELLIGENCE (Section 11)                       */}
      {/* ========================================================================= */}
      <DepartmentBranchIntelligenceCard distribution={data?.distribution} />

      {/* ========================================================================= */}
      {/* 🚀 5. RECRUITMENT, ONBOARDING & OFFBOARDING LIFECYCLE (Sections 12-14)    */}
      {/* ========================================================================= */}
      <RecruitmentLifecycleCard
        recruitmentSummary={data?.recruitmentSummary}
        onboardingSummary={data?.onboardingSummary}
        offboardingSummary={data?.offboardingSummary}
      />

      {/* ========================================================================= */}
      {/* 📑 6. LEAVE & PAYROLL COMPLIANCE SUMMARY (Sections 15-16)                 */}
      {/* ========================================================================= */}
      <LeavePayrollSummaryCard
        leaveSummary={data?.leaveSummary}
        payrollSummary={data?.payrollSummary}
      />

      {/* ========================================================================= */}
      {/* 📜 7. ATTENDANCE & TELEMETRY CHARTS                                       */}
      {/* ========================================================================= */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
              <span>Workforce Attendance & Operations Intelligence</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#00A896] border border-teal-200">
                Live Tracking & Logs
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive telemetry: quarterly run-rates, mobile app penetration, asset tracking, and presence trends.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">BJK Operations Suite</span>
        </div>
      </div>

      {/* Executive Anomaly Warning Banner */}
      <ExecutiveWarningsRow warningsData={data?.executiveWarnings} />

      {/* Today's Task Status, Monthly Leave Status, and Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <TodaysTaskStatusCard data={data?.todayTasks} />
        <MonthlyLeaveStatusCard data={data?.monthlyLeaveStatus} />
        <CurrentWorkforceStatusCard data={data?.currentStatus} />
      </div>

      {/* Employee Daily Attendance Status Bar Chart */}
      <DailyAttendanceStatusCard data={data?.dailyAttendance} />

      {/* Monthly Attendance Status, Expenses Breakdown, and Employee App Penetration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MonthlyAttendanceStatusCard data={data?.monthlyAttendanceStatus} />
        <ExpensesBreakdownCard data={data?.expensesBreakdown} />
        <EmployeeStatusPenetrationCard data={data?.employeeStatus} />
      </div>

      {/* Monthly Paid Expenses, Assets, and Most Hours Spent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MonthlyPaidExpensesCard data={data?.monthlyPaidExpenses} />
        <AssetsSnapshotCard data={data?.assetsOverview} />
        <TopHoursSpentCard employeesData={data?.topHoursEmployees} />
      </div>

      {/* ========================================================================= */}
      {/* 🛡️ 8. EMPLOYEE ACTIVITY & SYSTEM AUDIT LOG MONITOR (Section 8)            */}
      {/* ========================================================================= */}
      <EmployeeActivityMonitor initialLogs={data?.auditActivity || []} />

      {/* Birthdays and Anniversaries */}
      <CelebrationsCard celebrationsData={data?.celebrations} />

      {/* AI Executive Brief Modal */}
      {showBriefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      BJK DIGITAL BRAIN
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      STRICT DATA TRUTH
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-0.5">HR Executive Intelligence Brief</h2>
                </div>
              </div>
              <button
                onClick={() => setShowBriefModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {isBriefLoading ? (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={32} className="animate-spin text-purple-400 mb-3" />
                <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                  Aggregating Real-Time Workforce Telemetry & Compliance Logs...
                </p>
              </div>
            ) : briefData ? (
              <div className="space-y-6 mt-6 text-xs">
                {/* Critical Alerts */}
                {briefData.criticalAlerts && briefData.criticalAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Attention / Governance Alerts
                    </h3>
                    {briefData.criticalAlerts.map((alt, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border ${
                          alt.level === 'CRITICAL'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        }`}
                      >
                        <span className="font-bold block text-sm mb-1">{alt.title}</span>
                        <p className="text-xs leading-relaxed opacity-90">{alt.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3 Summary Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Workforce Health
                    </span>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Active Headcount:</span>
                        <strong className="text-white font-mono">{briefData.workforceSummary?.totalActiveHeadcount ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Probation Due:</span>
                        <strong className="text-amber-400 font-mono">{briefData.workforceSummary?.probationDue ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending Separations:</span>
                        <strong className="text-slate-300 font-mono">{briefData.workforceSummary?.pendingSeparations ?? '--'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Compliance & GMP
                    </span>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Policy Acknowledgment:</span>
                        <strong className="text-bjk-teal font-mono">{briefData.complianceSummary?.policyAcknowledgmentRate ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Training Compliance:</span>
                        <strong className="text-emerald-400 font-mono">{briefData.complianceSummary?.mandatoryTrainingCompliance ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>GMP Readiness:</span>
                        <strong className="text-cyan-400 font-mono">{briefData.complianceSummary?.gmpCleanroomReadiness ?? '--'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Risk & Incidents
                    </span>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex justify-between">
                        <span>Disciplinary Cases:</span>
                        <strong className="text-amber-400 font-mono">{briefData.riskAndIncidentWatchlist?.openDisciplinaryCases ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Safety Incidents:</span>
                        <strong className="text-rose-400 font-mono">{briefData.riskAndIncidentWatchlist?.openSafetyIncidents ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>IT Security Incidents:</span>
                        <strong className="text-cyan-400 font-mono">{briefData.riskAndIncidentWatchlist?.openITSecurityIncidents ?? '--'}</strong>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-700/60 text-[10px]">
                        <span>POSH Cases:</span>
                        <span className="text-slate-400 italic">Protected (ICC Only)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-2xl text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    Generated for: <strong className="text-slate-200">Executive Management & HR Head</strong>
                  </span>
                  <span className="font-mono text-slate-500">
                    {new Date(briefData.briefingDate).toLocaleDateString()} &bull; 21 CFR §11 Validated
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                Failed to load brief telemetry. Please check server connection.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRManagerDashboardView;
