import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KPICard } from '../../../components/common/KPICard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import {
  Users,
  Clock,
  UserX,
  CalendarCheck,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle,
  FileText,
  CalendarDays,
  FileCheck
} from 'lucide-react';

export const QAManagerDashboardView = ({ data, user }) => {
  const navigate = useNavigate();

  const kpis = data?.kpis || {
    qaHeadcount: 2,
    qaPresentToday: 2,
    qaAbsent: 0,
    qaOnLeave: 0,
    qaTrainingDue: 1,
    qaCredentialsExpiring: 1,
    qaNonCompliant: 1,
    qaOpenPositions: 0
  };

  const attentionCenter = data?.attentionCenter || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. QA Manager Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-bjk-teal/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 uppercase tracking-widest border border-cyan-500/30">
                Quality & Regulatory Operations
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                QA / QC Scope
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {user?.name ? `${user.name} • Lead QA Manager` : 'Priya Sharma • Lead QA Manager'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              BJK Quality & Workforce Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Live Quality Operations, GMP/GLP compliance monitoring, laboratory workforce rostering, and analyst authorization management.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/hrms/compliance')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center space-x-2"
            >
              <FileCheck size={15} />
              <span>GMP Compliance Hub</span>
            </button>
            <button
              onClick={() => navigate('/hrms/credentials')}
              className="px-4 py-2.5 rounded-xl bg-bjk-teal hover:bg-[#009B8D] text-white text-xs font-bold transition-all shadow-md shadow-bjk-teal/20 flex items-center space-x-2"
            >
              <ShieldCheck size={15} />
              <span>Review QA Sign-Offs</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. QA Operational KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            Quality Workforce & Compliance Telemetry
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Department: Quality Assurance & QC Lab</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KPICard
            title="QA Headcount"
            value={kpis.qaHeadcount}
            subtitle="Registered QA/QC analysts"
            icon={Users}
            color="teal"
            onClick={() => navigate('/hr/employees')}
          />
          <KPICard
            title="QA Present Today"
            value={kpis.qaPresentToday}
            subtitle="Clocked into laboratory shifts"
            icon={Clock}
            color="cyan"
            onClick={() => navigate('/hrms/attendance')}
          />
          <KPICard
            title="QA Absent"
            value={kpis.qaAbsent}
            subtitle="Unplanned lab absences"
            icon={UserX}
            color="rose"
          />
          <KPICard
            title="QA On Leave"
            value={kpis.qaOnLeave}
            subtitle="Approved team leaves"
            icon={CalendarCheck}
            color="purple"
            onClick={() => navigate('/hrms/leave')}
          />
          <KPICard
            title="QA Training Due"
            value={kpis.qaTrainingDue}
            subtitle="GMP / GLP recertification"
            icon={GraduationCap}
            color="orange"
            onClick={() => navigate('/hrms/training')}
          />
          <KPICard
            title="Credentials Expiring"
            value={kpis.qaCredentialsExpiring}
            subtitle="Method sign-offs & auditor creds"
            icon={ShieldAlert}
            color="rose"
            onClick={() => navigate('/hrms/credentials')}
          />
          <KPICard
            title="QA Non-Compliant"
            value={kpis.qaNonCompliant}
            subtitle="Overdue items requiring action"
            icon={AlertTriangle}
            color="orange"
          />
          <KPICard
            title="QA Open Positions"
            value={kpis.qaOpenPositions}
            subtitle="Published requisitions"
            icon={Briefcase}
            color="teal"
          />
        </div>
      </div>

      {/* 3. QA Attention Center & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: QA Operational Attention Center */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  QA Compliance Attention Center
                </h3>
                <p className="text-[11px] text-slate-400">Quality authorizations, training exceptions & shift validations</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              {attentionCenter.length} Urgent Items
            </span>
          </div>

          {attentionCenter.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">All Quality Authorizations Active</p>
              <p className="text-[11px] text-slate-400 mt-0.5">No QA or GLP compliance blocking issues found.</p>
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
                        Due Date: {item.due}
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

        {/* Right: QA Manager Quick Actions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between bjk-card-glow">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles size={16} className="text-cyan-500" />
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                QA Quick Actions
              </h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/hr/employees')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100/60 text-cyan-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">View QA Workforce</div>
                    <div className="text-[10px] text-slate-400">QA & QC analyst records</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/attendance')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/60 text-bjk-teal flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Review QA Attendance</div>
                    <div className="text-[10px] text-slate-400">Shift logs & punches</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-bjk-teal group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/training')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100/60 text-purple-600 flex items-center justify-center">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Review QA Training</div>
                    <div className="text-[10px] text-slate-400">LMS & cGMP progress</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/credentials')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Review QA Credentials</div>
                    <div className="text-[10px] text-slate-400">GLP & Method sign-offs</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/manager')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-rose-600 flex items-center justify-center">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Approve QA Requests</div>
                    <div className="text-[10px] text-slate-400">Team leaves & swaps</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => navigate('/hrms/rostering')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/60 text-blue-600 flex items-center justify-center">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">View QA Roster</div>
                    <div className="text-[10px] text-slate-400">Quality shift schedules</div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Authorized Scope: Quality Operations</span>
            <span className="font-semibold text-cyan-600">21 CFR Part 11</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAManagerDashboardView;
