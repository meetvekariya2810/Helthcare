import React, { useState } from 'react';
import { History, Shield, ArrowRight, RefreshCw, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';

export const EmployeeActivityMonitor = ({ initialLogs = [] }) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await hrmsAPI.getDashboardActivity({
        search: search.trim() || undefined,
        module: moduleFilter !== 'ALL' ? moduleFilter : undefined,
        limit: 15
      });
      if (res.data?.success) {
        setLogs(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(item => {
    if (moduleFilter !== 'ALL' && !new RegExp(moduleFilter, 'i').test(item.module)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.user?.toLowerCase().includes(q) ||
        item.action?.toLowerCase().includes(q) ||
        item.details?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <History size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Employee Activity & System Monitor
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Immutable Audit Trail
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time chronological events, employee punches, document verifications, and admin actions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-xs font-bold text-bjk-teal hover:underline flex items-center space-x-1"
          >
            <span>Full Audit Trail</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p className="text-xs font-semibold">No recent activity matching criteria</p>
          </div>
        ) : (
          filteredLogs.slice(0, 10).map((log, idx) => {
            const timeStr = log.timestamp
              ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : '--';
            const dateStr = log.timestamp
              ? new Date(log.timestamp).toLocaleDateString('en-GB')
              : '--';

            return (
              <div
                key={log.id || idx}
                className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 bg-bjk-teal ring-4 ring-teal-50 flex-shrink-0" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800">{log.user || 'System'}</span>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        [{log.module}]
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:flex-shrink-0 font-mono text-[10px] text-slate-400">
                  <span className="block text-slate-600 font-semibold">{timeStr}</span>
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>21 CFR §11 Validated Audit Ledger</span>
        <span className="text-slate-500 font-mono">Source: MongoDB Atlas (auditlogs)</span>
      </div>
    </div>
  );
};

export default EmployeeActivityMonitor;
