import React, { useState } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Building2,
  GitBranch,
  UserPlus,
  UserCheck,
  CheckSquare,
  Receipt,
  Boxes,
  ShieldCheck,
  GraduationCap,
  Factory,
  Package,
  Sparkles,
  FileText,
  FileSpreadsheet,
  Bot,
  ChevronDown,
  ChevronUp,
  LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OneClickCommandRibbon = () => {
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('bjk_ribbon_expanded');
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
        localStorage.setItem('bjk_ribbon_expanded', String(nextState));
      } catch {}
      return nextState;
    });
  };

  const buttons = [
    { title: 'Employees', path: '/hr/employees', icon: Users, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
    { title: 'Attendance Command Center', path: '/hrms/attendance/command-center', icon: Clock, color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100' },
    { title: 'Leave', path: '/hr/leave', icon: CalendarCheck, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
    { title: 'Payroll', path: '/hrms/payroll', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { title: 'Departments', path: '/setup/departments', icon: Building2, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { title: 'Branches', path: '/hrms/organization', icon: GitBranch, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
    { title: 'Recruitment', path: '/hrms/recruitment', icon: UserPlus, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
    { title: 'Onboarding', path: '/hr/onboarding', icon: UserCheck, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
    { title: 'Tasks', path: '/hrms/automation', icon: CheckSquare, color: 'text-slate-700 bg-slate-100 hover:bg-slate-200' },
    { title: 'Expenses', path: '/hrms/expenses', icon: Receipt, color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
    { title: 'Assets', path: '/hrms/assets', icon: Boxes, color: 'text-cyan-700 bg-cyan-50 hover:bg-cyan-100' },
    { title: 'Compliance', path: '/hr/compliance', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
    { title: 'Training', path: '/hr/training', icon: GraduationCap, color: 'text-teal-700 bg-teal-50 hover:bg-teal-100' },
    { title: 'Production', path: '/production', icon: Factory, color: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' },
    { title: 'Inventory', path: '/inventory', icon: Package, color: 'text-amber-700 bg-amber-50 hover:bg-amber-100' },
    { title: 'Reports', path: '/hr/reports', icon: FileSpreadsheet, color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
    { title: 'AI Copilot', path: '/hrms/copilot', icon: Bot, color: 'text-purple-700 bg-purple-100 hover:bg-purple-200' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs transition-all duration-300 overflow-hidden">
      <div
        onClick={toggleExpanded}
        className="p-3 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <LayoutGrid size={14} className="text-bjk-teal" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            One-Click Operational Control Center
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">&bull; 17 Modules</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold transition-all group"
            title={isExpanded ? 'Hide Quick Ribbon' : 'Show Quick Ribbon'}
          >
            <span>{isExpanded ? 'Hide' : 'Show'}</span>
            {isExpanded ? (
              <ChevronUp size={13} className="group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown size={13} className="group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-1">
            {buttons.map((btn, i) => {
              const Icon = btn.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigate(btn.path)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 border border-slate-100 ${btn.color}`}
                >
                  <Icon size={13} />
                  <span className="whitespace-nowrap">{btn.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OneClickCommandRibbon;
