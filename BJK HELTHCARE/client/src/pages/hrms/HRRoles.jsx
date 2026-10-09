import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckCircle2, XCircle, Search, Users, ChevronRight, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HRRoles = () => {
  const { user: currentUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const token =
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    sessionStorage.getItem('bjk_auth_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    localStorage.getItem('bjk_auth_token') ||
    localStorage.getItem('token') ||
    '';

  useEffect(() => {
    Promise.all([
      fetch('/api/hr/roles', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/hr/permissions', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([roleData, permData]) => {
        if (roleData.success) {
          setRoles(roleData.roles || []);
          if (roleData.roles?.length > 0) setSelectedRole(roleData.roles[0]);
        }
        if (permData.success) setPermissions(permData.permissions || {});
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-50 rounded-2xl border border-teal-200 text-teal-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Role Architecture & Granular Permissions</h1>
            <p className="text-xs text-slate-500">
              Database-enforced Role-Based Access Control (RBAC) and data scope boundaries across the enterprise.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-3">System Roles ({roles.length})</h2>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {roles.map(r => (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r)}
                className={`w-full p-3 text-left rounded-2xl border transition-all flex items-center justify-between ${
                  selectedRole?.role === r.role
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                    : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/60 text-slate-800'
                }`}
              >
                <div>
                  <h3 className="text-xs font-bold">{r.name}</h3>
                  <span className={`text-[10px] block mt-0.5 ${selectedRole?.role === r.role ? 'text-teal-100' : 'text-slate-400'}`}>
                    {r.permissionCount} Permissions Granted
                  </span>
                </div>
                <ChevronRight size={15} className={selectedRole?.role === r.role ? 'text-white' : 'text-slate-400'} />
              </button>
            ))}
          </div>
        </div>

        {/* Selected Role Permissions Matrix */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          {selectedRole ? (
            <div>
              <div className="border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                    {selectedRole.role}
                  </span>
                  <h2 className="text-lg font-black text-slate-900">{selectedRole.name}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selectedRole.description}</p>
              </div>

              <div className="space-y-6">
                {Object.entries(permissions).map(([moduleKey, permList]) => {
                  const moduleTitle = moduleKey.replace(/_/g, ' ');
                  return (
                    <div key={moduleKey} className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                        <Lock size={12} className="text-teal-600" />
                        <span>{moduleTitle} Operations</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {permList.map(p => {
                          const isGranted = selectedRole.permissions.includes(p.key) || selectedRole.permissions.includes('*');
                          return (
                            <div
                              key={p.key}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                                isGranted
                                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                  : 'bg-slate-50/40 border-slate-200/60 text-slate-400 opacity-60'
                              }`}
                            >
                              <div className="pr-2">
                                <span className="font-bold block text-[11px]">{p.label}</span>
                                <span className="font-mono text-[9px] text-slate-500">{p.key}</span>
                              </div>
                              {isGranted ? (
                                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                              ) : (
                                <XCircle size={16} className="text-slate-300 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">Select a role to inspect its permissions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HRRoles;
