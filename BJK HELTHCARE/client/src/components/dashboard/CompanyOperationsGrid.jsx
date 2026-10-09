import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  CheckSquare,
  Factory,
  ShieldCheck,
  FileCheck,
  CreditCard,
  UsersRound,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react';

export const CompanyOperationsGrid = ({ operationsData }) => {
  const navigate = useNavigate();

  // Load hide/unhide preference from localStorage (defaults to true / expanded)
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('bjk_company_status_expanded');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleExpanded = (e) => {
    if (e) e.stopPropagation();
    setIsExpanded((prev) => {
      const nextState = !prev;
      try {
        localStorage.setItem('bjk_company_status_expanded', String(nextState));
      } catch {}
      return nextState;
    });
  };

  const operations = operationsData || [
    { title: 'Attendance', metric: 'Live Present', detail: '0 Absent · 0 Late · 0 Leave', path: '/hrms/attendance/command-center', status: 'ACTIVE', note: 'Open Command Center' },
    { title: 'HR Requests', metric: '0 Open', detail: '0 Pending Approvals', path: '/hrms/leave', status: 'NORMAL', note: 'Click to view' },
    { title: 'Approvals', metric: '0 Pending', detail: 'Workforce Reviews', path: '/hrms/approval-permissions', status: 'NORMAL', note: 'Click to review' },
    { title: 'Tasks', metric: '0 Active', detail: 'System Automation', path: '/hrms/automation', status: 'NORMAL', note: 'Click to view' },
    { title: 'Production', metric: 'Running: 2 Batches', detail: 'Unit 1 Formulations Active', path: '/production', status: 'ACTIVE', note: 'Inspect Production' },
    { title: 'QC Testing', metric: 'Pending: 3 Samples', detail: '0 OOS · Stability Validated', path: '/quality/qc', status: 'ACTIVE', note: 'Inspect QC Lab' },
    { title: 'Regulatory', metric: 'Due in 7d: 0 · 30d: 0', detail: 'WHO-GMP Compliant', path: '/regulatory', status: 'NORMAL', note: 'Inspect Filings' },
    { title: 'Finance', metric: 'Ready for Run', detail: 'EPF/ESI Active', path: '/finance', status: 'NORMAL', note: 'Inspect Payroll' },
    { title: 'CRM Enquiries', metric: 'Active: 5 Stream', detail: 'Enquiries Stream', path: '/crm', status: 'NORMAL', note: 'Inspect CRM' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">LIVE</span>;
      case 'DISCONNECTED':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">NOT CONNECTED</span>;
      case 'WARNING':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">ATTN</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">READY</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all duration-300 overflow-hidden">
      {/* Interactive Header with Collapse/Expand Arrow and Controls */}
      <div
        onClick={toggleExpanded}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            isExpanded ? 'bg-bjk-teal/10 text-bjk-teal' : 'bg-slate-100 text-slate-500'
          }`}>
            <Activity size={16} className={isExpanded ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Today's Company Status
              </h3>
              <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                Strict Data Truth
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Cross-departmental operations orchestration & telemetry mesh
            </p>
          </div>
        </div>

        {/* Right Controls: Quick summary chips (when collapsed) + Hide/Unhide Toggle Button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {!isExpanded && (
            <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-500">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-100">
                {operations[0]?.metric || 'Attendance Live'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                {operations[4]?.metric || 'Production Ready'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                +7 more
              </span>
            </div>
          )}

          {/* Toggle Button with Arrow */}
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/80 transition-all shadow-2xs group"
            title={isExpanded ? 'Hide / Collapse this section' : 'Show / Expand this section'}
          >
            {isExpanded ? (
              <>
                <EyeOff size={13} className="text-slate-500 group-hover:text-slate-800" />
                <span className="hidden sm:inline">Hide</span>
                <ChevronUp size={14} className="text-slate-500 group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <Eye size={13} className="text-bjk-teal" />
                <span className="text-bjk-teal font-bold hidden sm:inline">View Details</span>
                <ChevronDown size={14} className="text-bjk-teal group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Grid Body */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
            {operations.map((op, idx) => (
              <div
                key={idx}
                onClick={() => navigate(op.path)}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-bjk-teal/50 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-bjk-teal transition-colors">
                    {op.title}
                  </span>
                  {getStatusBadge(op.status)}
                </div>

                <div className="my-2">
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {op.metric}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {op.detail}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{op.note || 'Click to view'}</span>
                  <ArrowRight size={12} className="text-slate-400 group-hover:text-bjk-teal group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyOperationsGrid;
