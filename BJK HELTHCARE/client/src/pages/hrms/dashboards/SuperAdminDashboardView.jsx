import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../../../components/common/KPICard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  BrainCircuit,
  Building2,
  Users,
  ShieldCheck,
  Activity,
  Database,
  History,
  Settings,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Briefcase,
  CheckCircle,
  FileText,
  UserPlus,
  Network
} from 'lucide-react';

import { OneClickCommandRibbon } from '../../../components/dashboard/OneClickCommandRibbon';
import { CompanyOperationsGrid } from '../../../components/dashboard/CompanyOperationsGrid';
import { ExecutiveWarningsRow } from '../../../components/dashboard/ExecutiveWarningsRow';
import { MonthlyAttendanceStatusCard } from '../../../components/dashboard/MonthlyAttendanceStatusCard';
import { ExpensesBreakdownCard } from '../../../components/dashboard/ExpensesBreakdownCard';
import { EmployeeStatusPenetrationCard } from '../../../components/dashboard/EmployeeStatusPenetrationCard';
import { TodaysTaskStatusCard } from '../../../components/dashboard/TodaysTaskStatusCard';
import { MonthlyLeaveStatusCard } from '../../../components/dashboard/MonthlyLeaveStatusCard';
import { CurrentWorkforceStatusCard } from '../../../components/dashboard/CurrentWorkforceStatusCard';
import { DailyAttendanceStatusCard } from '../../../components/dashboard/DailyAttendanceStatusCard';
import { MonthlyPaidExpensesCard } from '../../../components/dashboard/MonthlyPaidExpensesCard';
import { AssetsSnapshotCard } from '../../../components/dashboard/AssetsSnapshotCard';
import { CelebrationsCard } from '../../../components/dashboard/CelebrationsCard';
import { TopHoursSpentCard } from '../../../components/dashboard/TopHoursSpentCard';

export const SuperAdminDashboardView = ({ data, user }) => {
  const navigate = useNavigate();

  const kpis = {
    totalWorkforce: data?.kpis?.totalWorkforce ?? data?.kpis?.totalEmployees ?? data?.totalEmployees ?? 91,
    activeWorkforce: data?.kpis?.activeWorkforce ?? data?.kpis?.activeEmployees ?? data?.activeEmployees ?? 91,
    facilitiesCount: data?.kpis?.facilitiesCount ?? (data?.distribution?.facility?.length || 2),
    departmentsCount: data?.kpis?.departmentsCount ?? (data?.distribution?.department?.length || 4),
    systemHealth: data?.kpis?.systemHealth ?? '100%',
    databaseStatus: data?.kpis?.databaseStatus ?? 'Connected',
    activeUsers: data?.kpis?.activeUsers ?? data?.kpis?.totalUsers ?? 8,
    systemRoles: data?.kpis?.systemRoles ?? 14,
    auditEventsCount: data?.kpis?.auditEventsCount ?? data?.kpis?.totalAuditLogs ?? 42,
    presentToday: data?.kpis?.presentToday ?? data?.todayAttendance?.present ?? 0,
    absentToday: data?.kpis?.absentToday ?? data?.todayAttendance?.absent ?? 0,
    openPositions: data?.kpis?.openPositions ?? 0,
    trainingDue: data?.kpis?.trainingDue ?? 0,
    credentialsExpiring: data?.kpis?.credentialsExpiring ?? 0
  };

  const domainOverviews = {
    hr: {
      active: data?.domainOverviews?.hr?.active ?? kpis.activeWorkforce ?? 91,
      presentToday: data?.domainOverviews?.hr?.presentToday ?? kpis.presentToday ?? 0,
      onLeave: data?.domainOverviews?.hr?.onLeave ?? data?.kpis?.onLeave ?? 0,
      pendingOnboarding: data?.domainOverviews?.hr?.pendingOnboarding ?? data?.onboardingSummary?.totalActive ?? 0
    },
    production: {
      activeLines: data?.domainOverviews?.production?.activeLines ?? 2,
      nightShiftOperators: data?.domainOverviews?.production?.nightShiftOperators ?? data?.kpis?.nightShift ?? 1,
      gmpStatus: data?.domainOverviews?.production?.gmpStatus ?? 'Action Required: Operator Expiry'
    },
    quality: {
      qaQcStaff: data?.domainOverviews?.quality?.qaQcStaff ?? 4,
      glpCertificationsDue: data?.domainOverviews?.quality?.glpCertificationsDue ?? data?.kpis?.credentialsExpiring ?? 1,
      batchReleaseStatus: data?.domainOverviews?.quality?.batchReleaseStatus ?? 'Verified'
    },
    finance: {
      payrollStatus: data?.domainOverviews?.finance?.payrollStatus ?? data?.payrollSummary?.status ?? 'Verified & Ready for Run',
      statutoryCompliance: data?.domainOverviews?.finance?.statutoryCompliance ?? 'EPF/ESI Active'
    }
  };

  const attentionCenter = data?.attentionCenter || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 🚀 1. FRONT PAGE VIEW: COMMAND CENTER & TODAY'S OPERATIONS STATUS          */}
      {/* ========================================================================= */}

      {/* Step 1: One-Click Jump Ribbon */}
      <OneClickCommandRibbon />

      {/* Step 2: Super Admin Executive Header & System Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-bjk-teal/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 uppercase tracking-widest border border-purple-500/30">
                Executive Command Center
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {user?.name ? `${user.name} • ${user?.role || 'SUPER_ADMIN'}` : 'Dr. Vikram Mehta • SUPER_ADMIN'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Enterprise Core Active</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              BJK Healthcare Executive Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Enterprise multi-facility orchestration, cross-departmental operations, digital brain service mesh, role-based access control, and platform audit trail.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/audit-logs')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <History size={15} />
              <span>Audit Trail</span>
            </button>
            <button
              onClick={() => navigate('/hrms/settings')}
              className="px-4 py-2.5 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white text-xs font-bold transition-all shadow-md shadow-bjk-teal/20 flex items-center space-x-2"
            >
              <Settings size={15} />
              <span>System Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Today's Company Operations Status (Clickable 9-domain grid) */}
      <CompanyOperationsGrid operationsData={data?.companyOperations} />

      {/* 2. Executive Platform & Infrastructure KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            Enterprise Infrastructure & Platform Telemetry
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Multi-Tenant Real-Time Scope</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            title="Total Workforce"
            value={kpis.totalWorkforce}
            subtitle={`${kpis.activeWorkforce} Active in service`}
            icon={Users}
            color="teal"
            onClick={() => navigate('/hr/employees')}
          />
          <KPICard
            title="Active Facilities"
            value={kpis.facilitiesCount}
            subtitle="Unit 1 Formulations & Corp HQ"
            icon={Building2}
            color="purple"
            onClick={() => navigate('/hrms/organization')}
          />
          <KPICard
            title="Departments"
            value={kpis.departmentsCount}
            subtitle="QA, QC, Prod & HR configured"
            icon={Network}
            color="cyan"
            onClick={() => navigate('/hrms/organization')}
          />
          <KPICard
            title="System Health"
            value="100%"
            subtitle="All microservices healthy"
            icon={Activity}
            color="teal"
          />
          <KPICard
            title="Atlas Cluster"
            value="Connected"
            subtitle="bjk_healthcare primary replica"
            icon={Database}
            color="cyan"
          />
          <KPICard
            title="Active Users"
            value={kpis.activeUsers}
            subtitle="Configured personnel credentials"
            icon={Users}
            color="purple"
            onClick={() => navigate('/hrms/settings')}
          />
          <KPICard
            title="System Roles"
            value={kpis.systemRoles}
            subtitle="Granular RBAC engine matrix"
            icon={ShieldCheck}
            color="teal"
            onClick={() => navigate('/hrms/settings')}
          />
          <KPICard
            title="Security Audit Events"
            value={kpis.auditEventsCount}
            subtitle="Total actions recorded"
            icon={History}
            color="orange"
            onClick={() => navigate('/audit-logs')}
          />
        </div>
      </div>

      {/* 3. Cross-Departmental Domain Overviews */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-1">
          Cross-Departmental Operational Matrix
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* HR Operations Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm bjk-card-glow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">HR Operations</span>
              <StatusBadge status="ACTIVE" label="Healthy" />
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Headcount</span>
                <span className="font-semibold">{domainOverviews.hr.active} Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Present Today</span>
                <span className="font-semibold text-emerald-600">{domainOverviews.hr.presentToday} Clocked In</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">On Leave</span>
                <span className="font-semibold">{domainOverviews.hr.onLeave}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/hrms')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Inspect HRMS</span>
              <ArrowRight size={13} className="text-bjk-teal" />
            </button>
          </div>

          {/* Production Operations Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm bjk-card-glow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Production Operations</span>
              <StatusBadge status="WARNING" label="Action Needed" />
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Lines</span>
                <span className="font-semibold">{domainOverviews.production.activeLines} Lines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Night Shift</span>
                <span className="font-semibold">{domainOverviews.production.nightShiftOperators} Operator</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Roster Check</span>
                <span className="font-semibold text-rose-600">Cleanroom Expiry</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/hrms/rostering')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Inspect Rosters</span>
              <ArrowRight size={13} className="text-bjk-teal" />
            </button>
          </div>

          {/* Quality Operations Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm bjk-card-glow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Quality Operations</span>
              <StatusBadge status="ACTIVE" label="Compliant" />
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">QA/QC Staff</span>
                <span className="font-semibold">{domainOverviews.quality.qaQcStaff} Analysts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GLP Renewals</span>
                <span className="font-semibold text-amber-600">1 Due Soon</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Batch Release</span>
                <span className="font-semibold text-emerald-600">Verified</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/hrms/compliance')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Inspect Quality Hub</span>
              <ArrowRight size={13} className="text-bjk-teal" />
            </button>
          </div>

          {/* Finance & Statutory Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm bjk-card-glow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Finance & Payroll</span>
              <StatusBadge status="ACTIVE" label="Verified" />
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Cycle Status</span>
                <span className="font-semibold">September Run Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EPF / ESI</span>
                <span className="font-semibold text-emerald-600">Statutory Compliant</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auto Disbursal</span>
                <span className="font-semibold">Awaiting Approval</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/hrms/payroll')}
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Inspect Payroll</span>
              <ArrowRight size={13} className="text-bjk-teal" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Attention Center & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Attention Items */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-bjk-purple flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Enterprise Critical Attention Center
                </h3>
                <p className="text-[11px] text-slate-400">High-priority operational exceptions across all facilities</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {attentionCenter.length} Platform Exceptions
            </span>
          </div>

          <div className="space-y-3">
            {attentionCenter.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-50 border-slate-200/80"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      item.severity === 'BLOCKING'
                        ? 'bg-rose-500 ring-4 ring-rose-100 animate-pulse'
                        : 'bg-amber-400 ring-4 ring-amber-100'
                    }`}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{item.title}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          item.severity === 'BLOCKING'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.severity}
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
                    <span>Manage</span>
                    <ArrowRight size={13} className="text-bjk-teal" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Super Admin Quick Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between bjk-card-glow">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={16} className="text-bjk-purple" />
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Executive Quick Actions
              </h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/hrms/settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100/60 text-bjk-purple flex items-center justify-center">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Add User / Provision</div>
                    <div className="text-[10px] text-slate-400">Create new system operator</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-bjk-purple group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/60 text-bjk-teal flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Manage Roles & RBAC</div>
                    <div className="text-[10px] text-slate-400">Configure permission sets</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-bjk-teal group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/settings')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                    <Settings size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">System Settings</div>
                    <div className="text-[10px] text-slate-400">Global configurations</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/audit-logs')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center">
                    <History size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Audit Trail</div>
                    <div className="text-[10px] text-slate-400">Inspect system events</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/modules')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100/60 text-cyan-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Digital Brain Modules</div>
                    <div className="text-[10px] text-slate-400">Enterprise services mesh</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Privileged Session: Unrestricted Access</span>
            <span className="font-semibold text-emerald-600">Audit Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📜 2. AFTER SCROLL VIEW (SCREENSHOT 2): ATTENDANCE, OPERATIONS & ANALYTICS */}
      {/* ========================================================================= */}

      {/* Visual Section Divider */}
      <div className="pt-6 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center space-x-2">
              <span>Workforce Attendance & Operations Intelligence</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
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

      {/* 1. Executive Anomaly Warning Banner (Screenshot 5 Top) */}
      <ExecutiveWarningsRow warningsData={data?.executiveWarnings} />

      {/* 2. Today's Task Status, Monthly Leave Status, and Current Status (Screenshot 5 Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <TodaysTaskStatusCard data={data?.todayTasks} />
        <MonthlyLeaveStatusCard data={data?.monthlyLeaveStatus} />
        <CurrentWorkforceStatusCard data={data?.currentStatus} />
      </div>

      {/* 3. Employee Daily Attendance Status Bar Chart (Screenshot 5 Full-Width Row 2) */}
      <DailyAttendanceStatusCard data={data?.dailyAttendance} />

      {/* 4. Monthly Attendance Status, Expenses Breakdown, and Employee App Penetration (Screenshot 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MonthlyAttendanceStatusCard data={data?.monthlyAttendanceStatus} />
        <ExpensesBreakdownCard data={data?.expensesBreakdown} />
        <EmployeeStatusPenetrationCard data={data?.employeeStatus} />
      </div>

      {/* 5. Monthly Paid Expenses, Assets, and Most Hours Spent (Screenshot 1 & 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <MonthlyPaidExpensesCard data={data?.monthlyPaidExpenses} />
        <AssetsSnapshotCard data={data?.assetsOverview} />
        <TopHoursSpentCard employeesData={data?.topHoursEmployees} />
      </div>

      {/* 6. Birthdays and Anniversaries (Screenshot 1) */}
      <CelebrationsCard celebrationsData={data?.celebrations} />
    </div>
  );
};

export default SuperAdminDashboardView;
