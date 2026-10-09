import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  Key,
  User,
  Clock,
  ArrowRight,
  Eye,
  X,
  FileText
} from 'lucide-react';

export const HRAccessAudit = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const token =
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('bjk_token') ||
        sessionStorage.getItem('bjk_auth_token') ||
        localStorage.getItem('authToken') ||
        localStorage.getItem('bjk_token');
      const res = await fetch('/api/audit?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || data.auditLogs || []);
      }
    } catch (err) {
      console.error('[HRAccessAudit Fetch Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'ALL' && !log.action.includes(actionFilter)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const userMatch = log.user?.name?.toLowerCase().includes(q) || log.user?.email?.toLowerCase().includes(q);
      const targetMatch = log.targetUser?.name?.toLowerCase().includes(q) || log.targetUser?.employeeId?.toLowerCase().includes(q);
      const reasonMatch = log.reason?.toLowerCase().includes(q) || log.details?.toLowerCase().includes(q);
      return userMatch || targetMatch || reasonMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300 text-xs">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#00A896] shadow-xs flex-shrink-0">
            <History size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00A896] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Security & Audit Trail
              </span>
              <span className="text-[10px] text-slate-400 font-mono">21 CFR Part 11</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Access & Credential Audit Trail
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Immutable ledger of all login credential creations, permission customizations, password resets, and account status alterations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAuditLogs}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            title="Refresh Audit Logs"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by HR Operator, Target Employee, or Reason..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#00A896]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:outline-none"
          >
            <option value="ALL">All Audit Actions</option>
            <option value="LOGIN_CREDENTIALS">Credential Creation & Updates</option>
            <option value="PERMISSION">Permission Matrix Updates</option>
            <option value="PASSWORD">Password Changes & Resets</option>
            <option value="ACCOUNT">Account Status & Lockout</option>
            <option value="BULK">Bulk Access Operations</option>
            <option value="USER_LOGIN">Authentication Logins</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 pl-6 pr-3">Timestamp</th>
                <th className="py-3.5 px-3">Action</th>
                <th className="py-3.5 px-3">Authorized Operator</th>
                <th className="py-3.5 px-3">Target Employee</th>
                <th className="py-3.5 px-3">Reason / Details</th>
                <th className="py-3.5 px-3">IP Address</th>
                <th className="py-3.5 pr-6 pl-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#00A896] mb-2" />
                    <span>Loading immutable audit records...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No audit records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-6 pr-3 whitespace-nowrap text-[11px] text-slate-500">
                      <span className="font-bold text-slate-800 block">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-50 text-[#00A896] border border-teal-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block">{log.user?.name || 'System Operator'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.user?.role || 'SUPER_ADMIN'}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      {log.targetUser?.name || log.targetUser?.employeeId ? (
                        <div>
                          <span className="font-bold text-slate-800 block">{log.targetUser.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.targetUser.employeeId}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic font-mono">{log.resourceId || 'N/A'}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 max-w-xs truncate text-[11px] text-slate-600">
                      {log.reason || log.details || 'Administrative security record.'}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[10px] text-slate-400">
                      {log.ipAddress || log.ip || '127.0.0.1'}
                    </td>

                    <td className="py-3.5 pr-6 pl-3 text-right">
                      <button
                        onClick={() => setSelectedAuditLog(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="View Full Audit Snapshot"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Diff Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <FileText size={18} className="text-[#00A896]" />
                <h3 className="text-sm font-extrabold">Audit Record Detail: {selectedAuditLog.action}</h3>
              </div>
              <button onClick={() => setSelectedAuditLog(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <div><strong>Authorized HR User:</strong> {selectedAuditLog.user?.name} ({selectedAuditLog.user?.role})</div>
                <div><strong>Timestamp:</strong> {new Date(selectedAuditLog.timestamp).toLocaleString()}</div>
                <div><strong>Reason:</strong> {selectedAuditLog.reason || selectedAuditLog.details}</div>
                <div><strong>IP Address:</strong> {selectedAuditLog.ipAddress}</div>
              </div>

              {selectedAuditLog.oldData && (
                <div className="space-y-1">
                  <span className="font-bold text-rose-700 text-[11px]">Previous State (Before):</span>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[10px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedAuditLog.oldData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedAuditLog.newData && (
                <div className="space-y-1">
                  <span className="font-bold text-emerald-700 text-[11px]">New State (After):</span>
                  <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[10px] overflow-x-auto max-h-40">
                    {JSON.stringify(selectedAuditLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAccessAudit;
