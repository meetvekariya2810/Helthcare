import React, { useState, useEffect } from 'react';
import { leaveAPI } from '../../services/api';
import { DataTable } from '../common/DataTable';
import { ShieldCheck, Search, Filter, History, Clock } from 'lucide-react';

export const LeaveActivityView = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const res = await leaveAPI.getActivity({
        action: filterAction,
        search
      });
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (err) {
      console.warn('Activity fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filterAction, search]);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900 block">
            {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(row.timestamp).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      header: 'Request ID',
      accessor: 'requestId',
      render: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {row.requestId}
        </span>
      )
    },
    {
      header: 'Employee',
      accessor: 'employee.name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 block text-xs">{row.employee?.name || '--'}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.employee?.employeeId} &bull; {row.employee?.department}
          </span>
        </div>
      )
    },
    {
      header: 'Actor & Role',
      accessor: 'actor.name',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{row.actor?.name || 'System'}</span>
          <span className="text-[10px] font-mono text-bjk-teal font-bold">{row.actor?.role}</span>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => {
        let badgeStyle = 'bg-slate-100 text-slate-700';
        if (row.action === 'APPROVE') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (row.action === 'REJECT') badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
        if (row.action === 'OVERRIDE') badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-black animate-pulse';
        if (row.action === 'SUBMIT') badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
        if (row.action === 'BALANCE_ADJUST') badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';

        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>
            {row.action}
          </span>
        );
      }
    },
    {
      header: 'Workflow Transition',
      accessor: 'newStatus',
      render: (row) => (
        <div className="text-[11px] font-mono">
          <span className="text-slate-400">{row.previousStatus || 'START'}</span>
          <span className="text-slate-400 mx-1">&rarr;</span>
          <span className="font-bold text-slate-800">{row.newStatus || row.action}</span>
        </div>
      )
    },
    {
      header: 'Documented Remarks',
      accessor: 'comment',
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-1 max-w-xs" title={row.comment}>
          {row.comment || '--'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <ShieldCheck size={18} className="text-bjk-teal" />
            <span>Immutable Leave Governance & Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographically audited record of every leave submission, manager determination, HR override, and balance adjustment.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search request or actor..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal w-48"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="SUBMIT">SUBMIT</option>
            <option value="APPROVE">APPROVE</option>
            <option value="REJECT">REJECT</option>
            <option value="OVERRIDE">OVERRIDE</option>
            <option value="BALANCE_ADJUST">BALANCE_ADJUST</option>
            <option value="WITHDRAW">WITHDRAW</option>
            <option value="CANCEL">CANCEL</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={activities}
        isLoading={isLoading}
      />
    </div>
  );
};

export default LeaveActivityView;
