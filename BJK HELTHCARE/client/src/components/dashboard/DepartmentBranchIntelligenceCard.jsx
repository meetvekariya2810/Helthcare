import React from 'react';
import { Building2, GitBranch, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DepartmentBranchIntelligenceCard = ({ distribution }) => {
  const navigate = useNavigate();

  const departments = distribution?.department || [];
  const facilities = distribution?.facility || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Department Distribution */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-bjk-teal flex items-center justify-center">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Department Intelligence
                </h3>
                <p className="text-[11px] text-slate-400">Workforce distribution and operational capacity across departments</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/setup/departments')}
              className="text-xs font-bold text-bjk-teal hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {departments.slice(0, 6).map((dept, i) => {
              const totalHeadcount = dept.headcount || 0;
              const maxCount = Math.max(...departments.map(d => d.headcount || 1), 1);
              const percent = Math.round((totalHeadcount / maxCount) * 100);

              return (
                <div key={i} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{dept.name}</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {totalHeadcount} Staff
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-bjk-teal to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Active Departments: <strong>{departments.length}</strong></span>
          <span className="text-bjk-teal font-semibold">100% DB Sourced</span>
        </div>
      </div>

      {/* 2. Branch & Facility Distribution */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <GitBranch size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Branch & Facility Intelligence
                </h3>
                <p className="text-[11px] text-slate-400">Headcount distribution across manufacturing units and corporate centers</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/hrms/organization')}
              className="text-xs font-bold text-cyan-600 hover:underline flex items-center space-x-1"
            >
              <span>View Sites</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {facilities.map((fac, i) => {
              const count = fac.headcount || 0;
              const maxCount = Math.max(...facilities.map(f => f.headcount || 1), 1);
              const percent = Math.round((count / maxCount) * 100);

              return (
                <div key={i} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{fac.name}</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {count} Employees
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Enterprise Production Sites: <strong>{facilities.length}</strong></span>
          <span className="text-cyan-600 font-semibold">cGMP Validated</span>
        </div>
      </div>
    </div>
  );
};

export default DepartmentBranchIntelligenceCard;
