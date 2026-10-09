import React from 'react';
import {
  CalendarDays,
  Cake,
  Award,
  Clock,
  CheckSquare,
  Boxes,
  ShieldAlert,
  UserX,
  FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SecondaryIntelligenceRibbon = ({ secondaryKpis }) => {
  const navigate = useNavigate();

  const metrics = [
    {
      title: 'Probation Ending',
      value: secondaryKpis?.probationEnding ?? 0,
      subtitle: 'Next 30 days',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      path: '/hr/employees'
    },
    {
      title: 'Notice Period',
      value: secondaryKpis?.noticePeriod ?? 0,
      subtitle: 'Active separation',
      icon: UserX,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      path: '/hrms/former-employees'
    },
    {
      title: 'Birthdays Today',
      value: secondaryKpis?.birthdaysToday ?? 0,
      subtitle: 'Company celebrations',
      icon: Cake,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      path: '/hr/employees'
    },
    {
      title: 'Work Anniversaries',
      value: secondaryKpis?.workAnniversariesToday ?? 0,
      subtitle: 'Years of service',
      icon: Award,
      color: 'text-teal-600 bg-teal-50 border-teal-200',
      path: '/hr/employees'
    },
    {
      title: 'Pending Approvals',
      value: secondaryKpis?.pendingApprovals ?? 0,
      subtitle: 'Leave & attendance',
      icon: CalendarDays,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      path: '/hrms/leave'
    },
    {
      title: 'Pending HR Tasks',
      value: secondaryKpis?.pendingHRTasks ?? 0,
      subtitle: 'Action items',
      icon: CheckSquare,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      path: '/hrms/automation'
    },
    {
      title: 'Assets Assigned',
      value: secondaryKpis?.assetsAssigned ?? 0,
      subtitle: 'IT & Hardware',
      icon: Boxes,
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      path: '/hrms/assets'
    },
    {
      title: 'Creds Expiring',
      value: secondaryKpis?.documentsExpiring ?? 0,
      subtitle: 'Certification renewals',
      icon: ShieldAlert,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      path: '/hrms/credentials'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Workforce Operational Signals & Events
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Real-Time Telemetry</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <button
              key={i}
              onClick={() => navigate(m.path)}
              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Icon size={14} className="text-slate-500 group-hover:scale-110 transition-transform" />
                <span className="font-mono font-bold text-slate-900 text-xs">{m.value}</span>
              </div>
              <div className="mt-1.5">
                <div className="text-[10px] font-bold text-slate-700 truncate">{m.title}</div>
                <div className="text-[9px] text-slate-400 truncate">{m.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SecondaryIntelligenceRibbon;
