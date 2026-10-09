import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Crown
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const EmployeeHierarchy = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const res = await employeeAPI.getAll({ limit: 100 });
        if (res.data && res.data.success) {
          setEmployees(res.data.data || res.data.employees || []);
        }
      } catch (err) {
        console.error('Hierarchy fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesDept = departmentFilter === 'ALL' || emp.departmentName === departmentFilter || emp.department === departmentFilter;
    const matchesSearch = !searchTerm || (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Network size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Organization Hierarchy & Teams</h1>
            <p className="text-xs text-slate-500">Visual chain of command, reporting managers, and department allocations</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-teal-500"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-teal-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Executive Management">Executive Management</option>
            <option value="Production Operations">Production Operations</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
      </div>

      {/* Visual Organizational Hierarchy Tree */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col items-center">
          {/* Level 1: Executive Director / Department Head */}
          <div className="p-4 rounded-3xl bg-slate-900 text-white border-2 border-slate-800 shadow-xl max-w-sm w-full text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-xs">
              <Crown size={12} />
              <span>Apex Executive</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center mx-auto mb-2 mt-1 shadow-md">
              VM
            </div>
            <h3 className="font-extrabold text-base tracking-tight">Dr. Vikram Mehta</h3>
            <p className="text-xs text-amber-300 font-semibold">Managing Director & Executive Head</p>
            <span className="font-mono text-[10px] opacity-75 mt-1 block">EMP-EXEC-01 &bull; Ahmedabad HQ</span>
          </div>

          {/* Branch Connector Line */}
          <div className="w-0.5 h-10 bg-slate-300 my-1" />

          {/* Level 2: Department Heads & Senior Managers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* QA Head */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                QA
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Dr. Ananya Iyer</h4>
              <p className="text-[11px] text-purple-700 font-semibold">Head of Quality Assurance</p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">Direct Reports: 6</span>
            </div>

            {/* Production Head */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-teal-200 text-center relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                PO
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Mr. Rajesh Patel</h4>
              <p className="text-[11px] text-teal-700 font-semibold">Production Plant Manager</p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">Direct Reports: 12</span>
            </div>

            {/* HR Head */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center relative shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center mx-auto mb-2 text-xs">
                HR
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Ms. Kritika Parmar</h4>
              <p className="text-[11px] text-sky-700 font-semibold">HR & Administration Manager</p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">Direct Reports: 4</span>
            </div>
          </div>
        </div>

        {/* Level 3: Filtered Personnel List */}
        <div className="mt-12 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Users size={16} className="text-teal-600" />
              <span>Personnel & Reporting Node Directory ({filteredEmployees.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredEmployees.map((emp) => (
              <div
                key={emp._id}
                onClick={() => navigate(`/hr/employees/${emp._id}`)}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-500 bg-white hover:bg-teal-50/20 transition-all cursor-pointer shadow-2xs flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                  {(emp.fullName || emp.firstName || 'BJK').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {emp.employeeId || emp.employeeCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {emp.designationTitle || emp.designation} &bull; {emp.departmentName || emp.department}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
