import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import {
  BarChart3,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';

export const LeaveReportsView = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await leaveAPI.getReports();
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.warn('Report fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportData?.departmentStats) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Department,Total Requests,Approved,Pending,Rejected\n';

    reportData.departmentStats.forEach(d => {
      csvContent += `"${d._id || 'Unassigned'}",${d.total},${d.approved},${d.pending},${d.rejected}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BJK_Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = reportData?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <BarChart3 size={18} className="text-bjk-teal" />
            <span>Leave Analytics & Compliance Reports</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time workforce absence distribution, approval turnaround metrics, and quota utilization.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet size={15} className="text-emerald-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Applications</span>
            <Users size={16} className="text-bjk-teal" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block">{kpis.totalRequests || 0}</span>
          <span className="text-[10px] text-slate-400">Enterprise wide in 2026</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Pending In Review</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 mt-2 block">{kpis.pendingTotal || 0}</span>
          <span className="text-[10px] text-slate-400">
            TM: {kpis.pendingTeamManager || 0} &bull; DH: {kpis.pendingDeptManager || 0} &bull; HR: {kpis.pendingHRReview || 0}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Currently On Leave</span>
            <Calendar size={16} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-2 block">
            {kpis.currentlyOnLeaveCount || 0}
          </span>
          <span className="text-[10px] text-slate-400">Active today ({new Date().toLocaleDateString()})</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Low Balance Alert</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-600 mt-2 block">{kpis.lowBalanceCount || 0}</span>
          <span className="text-[10px] text-slate-400">Employees with &le; 2 days remaining</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center space-x-2">
            <Building2 size={16} className="text-bjk-teal" />
            <span>Department Absence Summary</span>
          </h3>

          <div className="space-y-3">
            {reportData?.departmentStats?.map((d, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1.5">
                  <span>{d._id || 'General Operations'}</span>
                  <span className="font-mono text-slate-500">{d.total} total</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-emerald-600 font-semibold">{d.approved} Approved</span>
                  <span className="text-amber-600 font-semibold">{d.pending} Pending</span>
                  <span className="text-rose-600 font-semibold">{d.rejected} Rejected</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Type Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center space-x-2">
            <Calendar size={16} className="text-bjk-teal" />
            <span>Leave Category Breakdown</span>
          </h3>

          <div className="space-y-3">
            {reportData?.typeStats?.map((t, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{t._id}</span>
                  <span className="text-[10px] text-slate-400">{t.total} total applications</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-bjk-teal font-mono">{t.totalDays}</span>
                  <span className="text-[10px] text-slate-500 block">days utilized</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReportsView;
