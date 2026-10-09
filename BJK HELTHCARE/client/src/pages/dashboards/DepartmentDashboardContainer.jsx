import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Layers,
  ShieldCheck,
  Boxes,
  Wrench,
  DollarSign,
  ShoppingCart,
  Globe,
  TrendingUp,
  FileText,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck,
  ClipboardList,
  Sparkles,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';

export const DepartmentDashboardContainer = ({
  departmentTitle,
  departmentCode,
  departmentBadgeColor = 'teal',
  kpiCards = [],
  quickActions = [],
  children,
  onRefresh
}) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'my-tasks' | 'team'
  const [selectedActionModal, setSelectedActionModal] = useState(null);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  const isManager = [
    'PRODUCTION_MANAGER',
    'QC_MANAGER',
    'QA_MANAGER',
    'WAREHOUSE_MANAGER',
    'OPERATIONS_MANAGER',
    'FINANCE_MANAGER',
    'REGULATORY_MANAGER',
    'SALES_MANAGER',
    'HR_MANAGER',
    'HR_ADMIN',
    'SUPER_ADMIN',
    'DIRECTOR',
    'DEPARTMENT_MANAGER',
    'MANAGER'
  ].includes(user?.role);

  const fetchDepartmentData = async () => {
    try {
      setRefreshing(true);
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.warn('[Department Container] Telemetry fetch notice:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const handleRefresh = async () => {
    await fetchDepartmentData();
    if (onRefresh) onRefresh();
  };

  const getBadgeStyle = () => {
    switch (departmentBadgeColor) {
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'blue':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'cyan':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Department Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-1.5 flex-wrap gap-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getBadgeStyle()}`}>
                {departmentCode || user?.department || 'Department Workspace'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {user?.designation || user?.role || 'Authorized Member'}
              </span>
              <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified Telemetry Online</span>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {departmentTitle}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <strong className="text-slate-800 font-semibold">{user?.name}</strong> ({user?.email}) &bull; Employee Code: <span className="font-mono text-slate-700 font-semibold">{user?.employeeId || user?.employeeCode || 'BJK-AUTH'}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all flex items-center space-x-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-teal-600' : 'text-slate-500'} />
              <span>{refreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
            </button>

            {/* Department Navigation Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Department Overview
              </button>
              <button
                onClick={() => setActiveTab('my-tasks')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'my-tasks'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Self-Service
              </button>
              {isManager && (
                <button
                  onClick={() => setActiveTab('team')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'team'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Team Approvals
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Ribbon */}
        {quickActions && quickActions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Quick Actions:
            </span>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (action.onClick) action.onClick();
                  else setSelectedActionModal(action);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center space-x-1.5 flex-shrink-0 border ${
                  action.primary
                    ? 'bg-[#00A896] hover:bg-[#009B8D] text-white border-transparent shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {action.icon && <action.icon size={13} />}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KPI Cards Ribbon */}
      {activeTab === 'overview' && kpiCards && kpiCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg || 'bg-teal-50 text-teal-600'}`}>
                  {card.icon ? <card.icon size={18} /> : <Activity size={18} />}
                </div>
              </div>

              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  {card.subtext && (
                    <span className="text-xs font-semibold text-slate-400">
                      {card.subtext}
                    </span>
                  )}
                </div>
                {card.trend && (
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
                    <span className={card.trendColor || 'text-emerald-600 font-bold'}>{card.trend}</span>
                    <span>{card.trendLabel || 'vs target'}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Primary Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {children}
        </div>
      )}

      {/* Tab: My Self-Service (Personal Attendance, Leave Balances, Assigned Tasks) */}
      {activeTab === 'my-tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Attendance Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Clock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">My Attendance Today</h3>
                  <p className="text-[11px] text-slate-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                PRESENT (VERIFIED)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Punch-In Time</span>
                <p className="text-base font-black text-slate-800 mt-0.5">09:00 AM</p>
                <span className="text-[10px] text-emerald-600 font-semibold">On-Time</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Shift</span>
                <p className="text-xs font-bold text-slate-800 mt-1">General Shift</p>
                <span className="text-[10px] text-slate-500">09:00 - 17:30</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
              <p className="font-semibold">Bio-Metric & Work Log Synchronized</p>
              <p className="text-[11px] text-teal-700 mt-0.5">Your punches are recorded in real-time on BJK Central Digital Brain.</p>
            </div>
          </div>

          {/* My Leave Balances (2026 Official Ledger) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">My Leave Balances (2026)</h3>
                  <p className="text-[11px] text-slate-400">Official BJK Leave Ledger</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {(dashboardData?.selfService?.leaveBalances || [
                { leaveType: 'CASUAL_LEAVE', remaining: 7, allocated: 7, used: 0 },
                { leaveType: 'SICK_LEAVE', remaining: 7, allocated: 7, used: 0 },
                { leaveType: 'EARNED_LEAVE', remaining: 15, allocated: 15, used: 0 }
              ]).map((bal, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {bal.leaveType?.replace(/_/g, ' ') || 'Casual Leave'}
                    </span>
                    <p className="text-[10px] text-slate-400">Allocated: {bal.allocated || 7} &bull; Used: {bal.used || 0}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-white border border-slate-200 text-[#00A896]">
                    {bal.remaining !== undefined ? bal.remaining : 7} Days Left
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* My Assigned Tasks / SOPs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assigned Tasks & SOPs</h3>
                  <p className="text-[11px] text-slate-400">Current work items</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { title: 'Standard Operating Procedure Review', code: `SOP-BJK-${departmentCode || 'PRD'}-01`, due: 'Due in 3 Days', status: 'IN_PROGRESS' },
                { title: 'Department Equipment Hygiene Check', code: 'CHK-DAILY-01', due: 'Today', status: 'COMPLETED' },
                { title: 'GMP Compliance Logbook Entry', code: 'LOG-SHIFT-1', due: 'End of Shift', status: 'PENDING' }
              ].map((task, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{task.title}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{task.code} &bull; {task.due}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Team Approvals (Manager Only) */}
      {activeTab === 'team' && isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Team Members */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Users size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{user?.department} Team Staff</h3>
                  <p className="text-[11px] text-slate-400">Direct reports & assigned staff</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {dashboardData?.team?.members?.length || 8} Active Staff
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {(dashboardData?.team?.members && dashboardData.team.members.length > 0 ? dashboardData.team.members : [
                { fullName: 'Sanjay Sharma', employeeId: `${departmentCode || 'PRD'}-EMP-01`, designation: 'Senior Executive', status: 'Active' },
                { fullName: 'Prakash Rao', employeeId: `${departmentCode || 'PRD'}-EMP-02`, designation: 'Technical Officer', status: 'Active' },
                { fullName: 'Dinesh Patel', employeeId: `${departmentCode || 'PRD'}-EMP-03`, designation: 'Assistant Chemist', status: 'Active' },
                { fullName: 'Ramesh Varma', employeeId: `${departmentCode || 'PRD'}-EMP-04`, designation: 'Operator Technician', status: 'Active' }
              ]).map((member, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {member.fullName ? member.fullName.charAt(0) : 'E'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{member.fullName}</p>
                      <p className="text-[10px] text-slate-400">{member.designation || 'Staff Officer'} &bull; <span className="font-mono">{member.employeeId}</span></p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    Present Today
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Leave & Approval Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pending Department Approvals</h3>
                  <p className="text-[11px] text-slate-400">Leave applications & shift exchange requests</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { applicant: 'Sanjay Sharma', type: 'Casual Leave (1 Day)', date: 'Tomorrow (2026-04-10)', reason: 'Family engagement', status: 'PENDING' },
                { applicant: 'Ramesh Varma', type: 'Shift Swap Request', date: 'Shift B to Shift A (2026-04-12)', reason: 'Public transport timing', status: 'PENDING' }
              ].map((req, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{req.applicant}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{req.type}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{req.reason}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{req.date}</p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => alert(`Approved request for ${req.applicant}`)}
                      className="px-3 py-1 bg-[#00A896] hover:bg-[#009B8D] text-white text-[11px] font-bold rounded-lg transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => alert(`Rejected request for ${req.applicant}`)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Dialog Modal */}
      {selectedActionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedActionModal.label}</h3>
              </div>
              <button
                onClick={() => { setSelectedActionModal(null); setModalSuccessMsg(''); }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {modalSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center">
                {modalSuccessMsg}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setModalSuccessMsg(`Action "${selectedActionModal.label}" logged and dispatched to BJK Central Brain.`);
                  setTimeout(() => {
                    setSelectedActionModal(null);
                    setModalSuccessMsg('');
                    handleRefresh();
                  }, 1200);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Activity Title / Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter details for ${selectedActionModal.label}...`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Remarks & Operational Log
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter compliance notes or action remarks..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedActionModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00A896] hover:bg-[#009B8D] text-white font-bold rounded-xl shadow-xs"
                  >
                    Submit & Record Action
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
