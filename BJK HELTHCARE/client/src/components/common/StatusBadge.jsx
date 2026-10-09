import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const s = String(status).toUpperCase();

  const statusStyles = {
    // Employee & User Statuses
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    ON_LEAVE: 'bg-amber-50 text-amber-700 border-amber-200/80',
    PROBATION: 'bg-blue-50 text-blue-700 border-blue-200/80',
    SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200/80',
    TERMINATED: 'bg-slate-100 text-slate-700 border-slate-200',
    RESIGNED: 'bg-purple-50 text-purple-700 border-purple-200/80',

    // Attendance Statuses
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200/80',
    HALF_DAY: 'bg-amber-50 text-amber-700 border-amber-200/80',
    LATE: 'bg-orange-50 text-orange-700 border-orange-200/80',
    EARLY_EXIT: 'bg-orange-50 text-orange-700 border-orange-200/80',
    WEEK_OFF: 'bg-slate-100 text-slate-600 border-slate-200',
    HOLIDAY: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    WORK_FROM_HOME: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    MISSING_PUNCH: 'bg-red-50 text-red-700 border-red-300 font-bold animate-pulse',

    // Validation & Credential Statuses
    VALID: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    EXPIRING: 'bg-amber-50 text-amber-700 border-amber-300',
    EXPIRED: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    BLOCKED: 'bg-red-100 text-red-800 border-red-300 font-bold',
    WARNING: 'bg-amber-50 text-amber-700 border-amber-200/80',

    // Compliance
    COMPLIANT: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    NON_COMPLIANT: 'bg-rose-50 text-rose-700 border-rose-200/80',
    PENDING_AUDIT: 'bg-slate-100 text-slate-700 border-slate-200',

    // Workflow & Approvals
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/80',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200/80',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    IN_PROGRESS: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    OVERDUE: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',

    // Recruitment Stages
    APPLIED: 'bg-slate-100 text-slate-700 border-slate-200',
    SCREENING: 'bg-blue-50 text-blue-700 border-blue-200/80',
    SHORTLISTED: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    TECHNICAL_INTERVIEW: 'bg-purple-50 text-purple-700 border-purple-200/80',
    HR_INTERVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    SELECTED: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    OFFER_EXTENDED: 'bg-teal-50 text-teal-700 border-teal-200/80',
    HIRED: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
  };

  const style = statusStyles[s] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = s.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border shadow-xs capitalize ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {label.toLowerCase()}
    </span>
  );
};
