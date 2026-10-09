import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserMinus,
  Search,
  Filter,
  FileDown,
  RefreshCw,
  Building2,
  Calendar,
  Eye,
  CheckCircle2,
  History
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const FormerEmployees = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [formerEmployees, setFormerEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const fetchFormer = async () => {
    try {
      setIsLoading(true);
      const res = await employeeAPI.getAll({ isFormer: true });
      if (res.data && res.data.success) {
        setFormerEmployees(res.data.data || res.data.employees || []);
      }
    } catch (err) {
      console.error('Former employees fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFormer();
  }, []);

  const handleReactivate = async (id, name) => {
    if (!window.confirm(`Reactivate employee ${name} to Active status?`)) return;
    try {
      const res = await employeeAPI.updateStatus(id, 'ACTIVE', 'Reactivated by Super Admin');
      if (res.data && res.data.success) {
        showToast(`Employee ${name} restored to Active status!`, 'success', 'Reactivated');
        fetchFormer();
      }
    } catch (err) {
      showToast(err.normalizedMessage || err.message, 'error', 'Error');
    }
  };

  const filtered = formerEmployees.filter(emp => {
    const matchesDept = departmentFilter === 'ALL' || emp.departmentName === departmentFilter || emp.department === departmentFilter;
    const matchesSearch = !searchTerm || (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (emp.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <UserMinus size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Former Employees Archive</h1>
            <p className="text-xs text-slate-500">Historical records of resigned, retired, relieved, and archived personnel</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search former personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-teal-500"
            />
          </div>

          <button
            onClick={() => employeeAPI.exportBulkExcel({ filter: 'former' })}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <FileDown size={14} />
            <span>Export Archive</span>
          </button>
        </div>
      </div>

      {/* Grid of Former Records */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs animate-pulse">
            Loading former employee archive...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserMinus size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No Former Employees Found</p>
            <p className="text-xs text-slate-400 mt-0.5">All staff records are currently active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((emp) => (
              <div
                key={emp._id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {(emp.fullName || emp.firstName || 'BJK').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{emp.fullName}</h4>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{emp.employeeId}</span>
                    </div>
                  </div>
                  <StatusBadge status={emp.status} />
                </div>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/50">
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="font-semibold text-slate-700">{emp.departmentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Role:</span>
                    <span className="font-semibold text-slate-700">{emp.designationTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Branch:</span>
                    <span className="font-semibold text-slate-700">{emp.branch}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/hr/employees/${emp._id}`)}
                    className="text-xs text-teal-600 font-bold hover:underline flex items-center space-x-1"
                  >
                    <Eye size={13} />
                    <span>View Dossier</span>
                  </button>

                  <button
                    onClick={() => handleReactivate(emp._id, emp.fullName)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
