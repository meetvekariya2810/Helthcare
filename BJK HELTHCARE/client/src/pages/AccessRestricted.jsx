import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import bjkLogo from '../assets/bjk-healthcare-logo.svg';

export const AccessRestricted = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 text-center relative overflow-hidden">
        {/* Top ambient aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldAlert size={32} />
        </div>

        <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 text-rose-700">
          Access Restricted
        </span>

        <h2 className="text-xl font-bold text-slate-800 mt-4 tracking-tight">
          Restricted Operational Domain
        </h2>

        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          You don't have permission to access this area. Your current account role (
          <strong className="text-slate-700 font-semibold">{user?.role || 'EMPLOYEE'}</strong>
          ) is scoped to{' '}
          <strong className="text-bjk-teal font-semibold">{user?.scopeLabel || 'Self Service'}</strong>.
        </p>

        {/* Info box */}
        <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center justify-center space-x-2">
          <Lock size={14} className="text-slate-400" />
          <span>Need access? Contact BJK Healthcare System Administrator.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/hrms')}
            className="w-full sm:w-auto px-5 py-2.5 bg-bjk-teal hover:bg-[#009B8D] text-white rounded-xl text-xs font-bold shadow-md shadow-bjk-teal/20 transition-all flex items-center justify-center space-x-2"
          >
            <Home size={15} />
            <span>Return to My Dashboard</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessRestricted;
