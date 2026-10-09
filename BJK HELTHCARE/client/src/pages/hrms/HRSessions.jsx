import React, { useState, useEffect } from 'react';
import { Monitor, ShieldAlert, LogOut, CheckCircle2, XCircle, RefreshCw, Smartphone, Laptop, Clock, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HRSessions = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [logins, setLogins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getToken = () =>
    sessionStorage.getItem('bjk_auth_token') ||
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    localStorage.getItem('bjk_auth_token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    '';

  const fetchData = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const token = getToken();
      const [sessRes, loginRes] = await Promise.all([
        fetch('/api/hr/sessions?status=ACTIVE', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/hr/login-activity?limit=50', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const sessData = await sessRes.json();
      const loginData = await loginRes.json();

      if (sessData.success) setSessions(sessData.sessions || []);
      if (loginData.success) setLogins(loginData.logins || []);
    } catch (err) {
      setError('Failed to retrieve session data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTerminateSession = async (sessionId) => {
    if (!window.confirm('Terminate this active session immediately?')) return;

    try {
      const res = await fetch(`/api/hr/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Session terminated successfully.');
        setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to terminate session.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 rounded-2xl border border-teal-200 text-teal-600">
            <Monitor size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Active Sessions & Login Activity</h1>
            <p className="text-xs text-slate-500">
              Live enterprise session management, remote termination, and login security audit logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh Live</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-2xl flex items-center space-x-2">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-2xl flex items-center space-x-2">
          <XCircle size={16} className="text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sessions'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Active Sessions ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('logins')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'logins'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Login History & Security Audit ({logins.length})
        </button>
      </div>

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="space-y-3">
            {sessions.length > 0 ? (
              sessions.map(s => (
                <div key={s._id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-teal-600">
                      {s.device === 'Mobile' ? <Smartphone size={20} /> : <Laptop size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-900">{s.userId?.name || 'Authorized Operator'}</h4>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold">
                          {s.userId?.role || 'OPERATOR'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {s.userId?.email} &bull; {s.browser} on {s.operatingSystem} ({s.device})
                      </p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono mt-1">
                        <span>IP: {s.ipAddress}</span>
                        <span>&bull;</span>
                        <span>Session ID: {s.sessionId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <div className="text-right text-xs">
                      <span className="text-[10px] text-slate-400 block">Last Active</span>
                      <span className="font-semibold text-slate-700">{new Date(s.lastActivity).toLocaleTimeString()}</span>
                    </div>

                    <button
                      onClick={() => handleTerminateSession(s.sessionId)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                    >
                      <LogOut size={13} />
                      <span>Terminate</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">No active user sessions currently recorded.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'logins' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="space-y-2.5">
            {logins.length > 0 ? (
              logins.map(l => (
                <div key={l._id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'BLOCKED' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {l.status}
                      </span>
                      <span className="font-bold text-slate-900">{l.email}</span>
                      {l.userId?.role && (
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 rounded font-semibold text-slate-700">
                          {l.userId.role}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {l.browser} on {l.operatingSystem} ({l.device}) &bull; IP: <span className="font-mono">{l.ipAddress}</span>
                    </p>
                    {l.failureReason && (
                      <p className="text-[11px] text-rose-600 mt-0.5 font-medium">Reason: {l.failureReason}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(l.loginTime).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-12 text-center">No login activity logs recorded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRSessions;
