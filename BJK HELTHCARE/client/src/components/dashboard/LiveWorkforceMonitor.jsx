import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Building2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Moon,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { hrmsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const LiveWorkforceMonitor = ({ defaultDate }) => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [branch, setBranch] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [departmentsList, setDepartmentsList] = useState([]);

  const fetchWorkforce = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        department: department !== 'ALL' ? department : undefined,
        branch: branch !== 'ALL' ? branch : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        date,
        page,
        limit: 10
      };

      const res = await hrmsAPI.getDashboardWorkforce(params);
      if (res.data?.success) {
        setEmployees(res.data.data || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch workforce telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforce();
  }, [page, department, branch, statusFilter, date]);

  // Handle debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchWorkforce();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load department options
  useEffect(() => {
    hrmsAPI.getDepartments()
      .then(res => {
        if (res.data?.data) {
          setDepartmentsList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Present
          </span>
        );
      case 'LATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Late
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            On Leave
          </span>
        );
      case 'NIGHT_SHIFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Moon size={11} className="text-purple-600" />
            Night Shift
          </span>
        );
      case 'ABSENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            No Punch
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-bjk-teal flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Employee Live Workforce Status
              </h3>
              <p className="text-[11px] text-slate-400">
                Real-time shift presence, punch timestamps, and active status across facilities
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-bjk-teal/30 w-40 sm:w-48 bg-slate-50/50"
            />
          </div>

          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-bjk-teal/30 bg-slate-50/50"
          >
            <option value="ALL">All Departments</option>
            {departmentsList.map((d, i) => (
              <option key={d._id || i} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            value={branch}
            onChange={(e) => { setBranch(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-bjk-teal/30 bg-slate-50/50"
          >
            <option value="ALL">All Facilities</option>
            <option value="Unit 1">Unit 1 - Formulations</option>
            <option value="Unit 2">Unit 2 - Corporate & QC</option>
            <option value="Ahmedabad">Ahmedabad Branch</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-bjk-teal/30 bg-slate-50/50"
          />

          <button
            onClick={fetchWorkforce}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh workforce status"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-bjk-teal' : ''} />
          </button>
        </div>
      </div>

      {/* Workforce Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department & Role</th>
              <th className="py-3 px-4">Facility & Shift</th>
              <th className="py-3 px-4">Punch In / Out</th>
              <th className="py-3 px-4">Live Status</th>
              <th className="py-3 px-4">Hours</th>
              <th className="py-3 px-4">Manager</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <RefreshCw size={20} className="animate-spin text-bjk-teal" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Querying Live Telemetry from MongoDB...</span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <p className="font-semibold text-slate-600 text-sm">No employees match current criteria</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the filters or date range</p>
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-bjk-teal to-teal-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                        {emp.photo ? (
                          <img src={emp.photo} alt={emp.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{emp.fullName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">{emp.employeeCode}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{emp.departmentName}</div>
                    <span className="text-[11px] text-slate-400">{emp.designationTitle}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-700 font-medium flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{emp.branch}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{emp.shiftName}</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px]">
                    <div className="text-slate-700 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">In:</span> {emp.punchIn}
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <span className="text-slate-500 font-bold">Out:</span> {emp.punchOut}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {getStatusBadge(emp.currentStatus)}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span className="text-slate-800 font-bold">{emp.workingHours || 0}h</span>
                    {emp.overtime > 0 && (
                      <span className="text-cyan-600 font-semibold block text-[10px]">+{emp.overtime}h OT</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {emp.manager}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/hr/employees/${emp.id}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-bjk-teal text-slate-600 text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <div>
          Showing <strong className="text-slate-800">{employees.length}</strong> of <strong className="text-slate-800">{pagination.total}</strong> registered personnel
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center space-x-1"
          >
            <ChevronLeft size={13} />
            <span>Previous</span>
          </button>
          <span className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-slate-800 text-xs">
            Page {page} of {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages || 1, p + 1))}
            disabled={page >= (pagination.totalPages || 1)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveWorkforceMonitor;
