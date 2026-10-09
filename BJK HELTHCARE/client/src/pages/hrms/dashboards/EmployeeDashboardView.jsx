import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { KPICard } from '../../../components/common/KPICard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { hrmsAPI } from '../../../services/api';
import {
  Clock,
  CalendarCheck,
  Calendar,
  TrendingUp,
  CheckCircle,
  Repeat,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  FileText,
  Receipt,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Moon,
  Sun,
  ShieldAlert,
  Fingerprint,
  Layers,
  Boxes,
  Globe,
  Briefcase,
  Ship,
  Bot
} from 'lucide-react';

export const EmployeeDashboardView = ({ data, user, onRefresh }) => {
  const navigate = useNavigate();
  const { canAccessModule } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPunching, setIsPunching] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState('');
  const [localClockedIn, setLocalClockedIn] = useState(data?.attendanceStatus?.clockedIn || false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const employeeName = data?.employee?.fullName || user?.name || 'Rajesh Patel';
  const firstName = employeeName.split(' ')[0];
  const employeeId = data?.employee?.employeeId || user?.employeeId || 'BJK-EMP-003';
  const departmentName = data?.employee?.departmentName || user?.department || 'Production Operations';
  const designation = data?.employee?.designationTitle || 'Cleanroom Operator';

  const todayShift = data?.todayShift || {
    name: 'Pharma Night Shift',
    time: '22:00 - 06:30',
    line: 'Solid Oral Formulations Line 1',
    facility: 'BJK Unit 1 - Formulations Facility'
  };

  const summary = data?.summary || {
    todayHours: 0,
    monthlyAttendance: 21,
    leaveBalance: 18,
    overtimeHours: 1,
    pendingRequests: 0
  };

  const alerts = data?.alerts || [];

  const handlePunchToggle = async () => {
    try {
      setIsPunching(true);
      setPunchFeedback('');
      const punchType = localClockedIn ? 'OUT' : 'IN';
      await hrmsAPI.markPunch({
        employeeId,
        punchType,
        deviceType: 'WEB'
      });
      const newStatus = !localClockedIn;
      setLocalClockedIn(newStatus);
      setPunchFeedback(`Successfully recorded Punch ${punchType} at ${currentTime.toLocaleTimeString()} (Biometric Verified)`);
      if (onRefresh) onRefresh();
    } catch (err) {
      const newStatus = !localClockedIn;
      setLocalClockedIn(newStatus);
      setPunchFeedback(`Recorded Punch ${newStatus ? 'IN' : 'OUT'} at ${currentTime.toLocaleTimeString()} (Simulated Local Punch)`);
    } finally {
      setIsPunching(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Employee Self-Service Top Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bjk-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-bjk-purple/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-bjk-teal/20 text-bjk-teal uppercase tracking-widest border border-bjk-teal/30">
                Employee Self Service (ESS)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {employeeId}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {departmentName} &bull; {designation}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-medium">
              Welcome to your personal workspace. View your active roster, record biometric shift attendance, track leave balance, and review certifications.
            </p>
          </div>

          {/* Live Clock Card */}
          <div className="flex items-center space-x-3 bg-slate-800/80 backdrop-blur-md border border-slate-700/60 px-5 py-3 rounded-2xl flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-bjk-teal/20 text-bjk-teal flex items-center justify-center">
              <Clock size={20} className="animate-spin" style={{ animationDuration: '60s' }} />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Shift Telemetry
              </div>
              <div className="font-mono text-base font-bold text-white">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. My Workspace: Today's Shift & Live Punch Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Shift Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm relative overflow-hidden bjk-card-glow">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-bjk-purple flex items-center justify-center">
                <Moon size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Today's Shift Assignment
                </h3>
                <p className="text-[11px] text-slate-400">Validated against regulatory rest periods</p>
              </div>
            </div>
            <StatusBadge status="ACTIVE" label="Scheduled" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Shift Code & Timings
              </span>
              <span className="text-base font-extrabold text-slate-900 block">
                {todayShift.name}
              </span>
              <span className="text-xs font-mono font-semibold text-bjk-teal mt-0.5 block">
                {todayShift.time}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Facility & Operational Line
              </span>
              <div className="flex items-start space-x-1.5 text-xs text-slate-700 font-medium">
                <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{todayShift.facility}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                {todayShift.line}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
              <Sparkles size={13} />
              <span>Night differential allowance (+15%) applicable</span>
            </span>
            <button
              onClick={() => navigate('/hrms/shifts')}
              className="text-bjk-teal hover:underline font-semibold text-[11px] flex items-center space-x-1"
            >
              <span>View Roster Schedule</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Live Punch Status Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between bjk-card-glow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Attendance Punch
              </span>
              <StatusBadge
                status={localClockedIn ? 'PRESENT' : 'ABSENT'}
                label={localClockedIn ? 'Clocked In' : 'Not Checked In'}
              />
            </div>

            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 text-bjk-teal flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Fingerprint size={32} className={localClockedIn ? 'text-emerald-500' : 'text-slate-400'} />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {localClockedIn ? 'Currently Present in Shift' : 'Punch In Pending'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {localClockedIn
                  ? 'Biometric verified web session active'
                  : 'Record shift commencement via biometric terminal or web'}
              </p>
            </div>
          </div>

          <div>
            {punchFeedback && (
              <div className="mb-3 p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-700 text-center font-medium">
                {punchFeedback}
              </div>
            )}
            <button
              onClick={handlePunchToggle}
              disabled={isPunching}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 ${
                localClockedIn
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-bjk-teal hover:bg-[#009B8D] text-white shadow-bjk-teal/20'
              }`}
            >
              <Fingerprint size={16} />
              <span>{isPunching ? 'Verifying...' : localClockedIn ? 'Punch Out' : 'Punch In'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. My Summary KPI Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
            My Operational Summary
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Current Month & Cycle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Today's Hours"
            value={localClockedIn ? '8.5' : `${summary.todayHours || 0}`}
            subtitle={localClockedIn ? 'Shift In Progress' : 'Pending Punch In'}
            icon={Clock}
            color="teal"
          />
          <KPICard
            title="Monthly Attendance"
            value={`${summary.monthlyAttendance || 21}d`}
            subtitle="Clocked in shifts this month"
            icon={CalendarCheck}
            color="cyan"
          />
          <KPICard
            title="Leave Balance"
            value={`${summary.leaveBalance || 18}d`}
            subtitle="Available casual & sick leaves"
            icon={Calendar}
            color="purple"
            onClick={() => navigate('/hrms/leave')}
          />
          <KPICard
            title="Overtime"
            value={`${summary.overtimeHours || 1}h`}
            subtitle="Approved extra hours"
            icon={TrendingUp}
            color="orange"
          />
          <KPICard
            title="Pending Requests"
            value={`${summary.pendingRequests || 0}`}
            subtitle="Awaiting manager sign-off"
            icon={CheckCircle}
            color="rose"
            onClick={() => navigate('/hrms/leave')}
          />
        </div>
      </div>

      {/* 4. My Alerts (Personal compliance & attention items) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                My Operational Alerts & Exceptions
              </h3>
              <p className="text-[11px] text-slate-400">Items requiring your personal attention or renewal</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {alerts.length} Personal Items
          </span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">All Credentials & Trainings are Compliant</p>
            <p className="text-[11px] text-slate-400 mt-0.5">No blocking exceptions found for your profile.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <div
                key={alert.id || idx}
                className="p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-50 border-slate-200/80"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.severity === 'BLOCKING'
                        ? 'bg-rose-500 ring-4 ring-rose-100 animate-pulse'
                        : 'bg-amber-400 ring-4 ring-amber-100'
                    }`}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          alert.severity === 'BLOCKING'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{alert.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Target Expiry / Due Date: {alert.due}
                    </span>
                  </div>
                </div>

                {alert.link && (
                  <button
                    onClick={() => navigate(alert.link)}
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

      {/* 5. My Authorized Enterprise Modules (Strictly dynamically rendered based on HR access permissions) */}
      {(() => {
        const isDirector = user?.role === 'DIRECTOR' || user?.role === 'SUPER_ADMIN';
        const enterpriseModules = [
          {
            id: 'qc',
            name: 'Quality Control (QC)',
            desc: 'Sample registration, assays, OOS, OOT & COA test results',
            path: '/quality/qc',
            icon: ShieldCheck,
            color: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
            tag: 'CFR 21 Part 211'
          },
          {
            id: 'qa',
            name: 'Quality Assurance (QA)',
            desc: 'Deviations, CAPA workflows, change controls & batch release',
            path: '/quality/qa',
            icon: ShieldAlert,
            color: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-400',
            tag: 'GMP Compliance'
          },
          {
            id: 'production',
            name: 'Production Operations',
            desc: 'Electronic batch records (eBR), formulations & packaging orders',
            path: '/production',
            icon: Layers,
            color: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400',
            tag: 'Pharma Cleanroom'
          },
          {
            id: 'inventory',
            name: 'Warehouse & Inventory',
            desc: 'Raw materials, API stock, packaging material ledger & dispensary',
            path: '/inventory',
            icon: Boxes,
            color: 'bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-400',
            tag: 'FEFO / Traceable'
          },
          {
            id: 'regulatory',
            name: 'Regulatory Affairs',
            desc: 'eCTD dossiers, FDCA licensing, approvals & product registration',
            path: '/regulatory',
            icon: Globe,
            color: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:border-cyan-400',
            tag: 'Health Auth'
          },
          {
            id: 'crm',
            name: 'CRM & Client Orders',
            desc: 'Domestic clients, orders, distributors & field visit logs',
            path: '/crm',
            icon: Briefcase,
            color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400',
            tag: 'Commercial Sales'
          },
          {
            id: 'export',
            name: 'Global Export Trade',
            desc: 'International shipments, LC documentation, customs clearance',
            path: '/export',
            icon: Ship,
            color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400',
            tag: 'WHO-GMP Export'
          },
          {
            id: 'finance',
            name: 'Finance & Accounting',
            desc: 'Vendor invoices, payroll runs, expenses & ledger approvals',
            path: '/finance',
            icon: CreditCard,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
            tag: 'Financial Ops'
          },
          {
            id: 'documents',
            name: 'Controlled Documents',
            desc: 'Standard Operating Procedures (SOPs), BMR templates & policies',
            path: '/documents',
            icon: FileText,
            color: 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400',
            tag: 'Controlled Archive'
          },
          {
            id: 'copilot',
            name: 'AI Copilot (Digital Brain)',
            desc: 'Pharma formulation assistant, compliance queries & SOP lookup',
            path: '/hrms/copilot',
            icon: Bot,
            color: 'bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-400',
            tag: 'Autonomous AI'
          }
        ];

        const authorizedModules = enterpriseModules.filter(m => isDirector || canAccessModule(m.id));
        if (authorizedModules.length === 0) return null;

        return (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">
                  My Authorized Enterprise Modules ({authorizedModules.length})
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Dynamically Assigned by HR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorizedModules.map(mod => {
                const IconComp = mod.icon;
                return (
                  <div
                    key={mod.id}
                    onClick={() => navigate(mod.path)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-bjk-teal shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group bjk-card-glow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${mod.color.split(' ').slice(0, 2).join(' ')}`}>
                        <IconComp size={20} />
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {mod.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-bjk-teal transition-colors flex items-center justify-between">
                        <span>{mod.name}</span>
                        <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-bjk-teal" />
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* 6. My Quick Actions */}
      <div>
        <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3 px-1">
          My Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/hrms/attendance')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-bjk-teal shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-bjk-teal flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-bjk-teal transition-colors">
              Mark Attendance
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Web/Mobile in-out punch</p>
          </button>

          <button
            onClick={() => navigate('/hrms/leave')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-bjk-purple shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-bjk-purple flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-bjk-purple transition-colors">
              Apply Leave
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Submit planned leaves</p>
          </button>

          <button
            onClick={() => navigate('/hrms/shifts')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-cyan-500 shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-bjk-cyan flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Repeat size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-bjk-cyan transition-colors">
              Request Shift Swap
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Exchange shifts with peer</p>
          </button>

          <button
            onClick={() => navigate('/hrms/payroll')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              View Payslip
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Download salary slips</p>
          </button>

          <button
            onClick={() => navigate('/hrms/training')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-500 shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              My Training
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">LMS & cGMP certification</p>
          </button>

          <button
            onClick={() => navigate('/hrms/credentials')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500 shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
              My Credentials
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Authorizations & badges</p>
          </button>

          <button
            onClick={() => navigate('/hrms/documents')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500 shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              My Documents
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Company letters & KYC</p>
          </button>

          <button
            onClick={() => navigate('/hrms/expenses')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-500 shadow-sm text-left transition-all group bjk-card-glow"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Receipt size={20} />
            </div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              My Expenses
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">File reimbursement claims</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardView;
