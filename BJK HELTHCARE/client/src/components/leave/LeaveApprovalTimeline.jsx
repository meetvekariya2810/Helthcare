import React from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

export const LeaveApprovalTimeline = ({ request }) => {
  if (!request) return null;

  const currentStatus = request.currentStatus || request.status || 'TEAM_MANAGER_PENDING';
  const history = request.approvalHistory || [];

  const stages = [
    {
      id: 'EMPLOYEE',
      title: '1. Employee Application',
      subtitle: request.employeeName || 'Employee',
      date: request.submittedAt || request.createdAt,
      state: 'COMPLETED',
      icon: UserCheck
    },
    {
      id: 'TEAM_MANAGER',
      title: '2. Team Manager Review',
      subtitle: request.teamManagerName || 'Team Manager',
      date: request.teamManagerActionAt,
      state:
        currentStatus === 'TEAM_MANAGER_REJECTED'
          ? 'REJECTED'
          : currentStatus === 'RETURNED_FOR_CORRECTION'
          ? 'RETURNED'
          : ['DEPARTMENT_MANAGER_PENDING', 'DEPARTMENT_HEAD_REVIEW', 'DEPARTMENT_MANAGER_APPROVED', 'DEPARTMENT_MANAGER_REJECTED', 'HR_REVIEW', 'APPROVED'].includes(currentStatus)
          ? 'COMPLETED'
          : ['TEAM_MANAGER_PENDING', 'SUBMITTED', 'MANAGER_REVIEW'].includes(currentStatus)
          ? 'ACTIVE'
          : 'PENDING',
      icon: CheckCircle
    },
    {
      id: 'DEPARTMENT_MANAGER',
      title: '3. Department Head Approval',
      subtitle: request.departmentManagerName || 'Department Head',
      date: request.departmentManagerActionAt,
      state:
        currentStatus === 'DEPARTMENT_MANAGER_REJECTED'
          ? 'REJECTED'
          : ['HR_REVIEW', 'APPROVED'].includes(currentStatus)
          ? 'COMPLETED'
          : ['DEPARTMENT_MANAGER_PENDING', 'DEPARTMENT_HEAD_REVIEW', 'TEAM_MANAGER_APPROVED'].includes(currentStatus)
          ? 'ACTIVE'
          : 'PENDING',
      icon: CheckCircle
    },
    {
      id: 'HR',
      title: '4. HR Compliance & Final Sanction',
      subtitle: 'HR Administration',
      date: request.hrActionAt,
      state:
        currentStatus === 'APPROVED'
          ? 'COMPLETED'
          : currentStatus === 'REJECTED'
          ? 'REJECTED'
          : currentStatus === 'HR_REVIEW'
          ? 'ACTIVE'
          : 'PENDING',
      icon: Sparkles
    }
  ];

  return (
    <div className="bg-slate-900/90 text-white rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-bjk-teal/20 text-bjk-teal font-bold">
              {request.requestId}
            </span>
            <h3 className="text-sm font-black text-white">Controlled Approval Workflow</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sequential governance: Employee &rarr; Team Manager &rarr; Department Head &rarr; HR Sanction
          </p>
        </div>

        {request.isOverridden && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold animate-pulse">
            <ShieldAlert size={14} />
            <span>HR Administrative Override</span>
          </div>
        )}
      </div>

      {/* Workflow Horizontal Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative mb-6">
        {stages.map((stage, idx) => {
          let badgeBg = 'bg-slate-800/80 border-slate-700 text-slate-400';
          let iconColor = 'text-slate-500';

          if (stage.state === 'COMPLETED') {
            badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
            iconColor = 'text-emerald-400';
          } else if (stage.state === 'ACTIVE') {
            badgeBg = 'bg-bjk-teal/20 border-bjk-teal text-white ring-2 ring-bjk-teal/30';
            iconColor = 'text-bjk-teal animate-bounce';
          } else if (stage.state === 'REJECTED') {
            badgeBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
            iconColor = 'text-rose-400';
          } else if (stage.state === 'RETURNED') {
            badgeBg = 'bg-blue-500/10 border-blue-500/30 text-blue-400';
            iconColor = 'text-blue-400';
          }

          return (
            <div
              key={stage.id}
              className={`p-3 rounded-xl border flex flex-col justify-between relative transition-all ${badgeBg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                    Step 0{idx + 1}
                  </span>
                  <stage.icon size={15} className={iconColor} />
                </div>
                <h4 className="text-xs font-bold leading-tight truncate">{stage.title}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{stage.subtitle}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="font-semibold">
                  {stage.state === 'COMPLETED' ? 'Approved' : stage.state === 'ACTIVE' ? 'In Review' : stage.state === 'REJECTED' ? 'Rejected' : stage.state === 'RETURNED' ? 'Returned' : 'Queued'}
                </span>
                {stage.date && (
                  <span className="text-slate-400 font-mono">
                    {new Date(stage.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Action Timeline Log */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
          <Clock size={13} className="text-bjk-teal" />
          <span>Audit & Decision History Timeline</span>
        </h4>

        {history.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No decision entries recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start justify-between text-xs"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{h.actor?.name || 'Authorized Operator'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                      {h.actor?.role || h.step}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        h.action === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : h.action === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300'
                          : h.action === 'OVERRIDDEN'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-bjk-teal/20 text-bjk-teal'
                      }`}
                    >
                      {h.action}
                    </span>
                  </div>

                  {h.comment && (
                    <p className="text-[11px] text-slate-300 mt-1 pl-2 border-l-2 border-slate-600">
                      "{h.comment}"
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0 text-[10px] font-mono text-slate-400">
                  {new Date(h.timestamp || request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <div className="text-[9px] text-slate-500">
                    {new Date(h.timestamp || request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalTimeline;
