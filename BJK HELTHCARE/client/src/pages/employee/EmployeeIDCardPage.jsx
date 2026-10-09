import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  ArrowLeft,
  AlertCircle,
  FileCheck,
  ExternalLink,
  Printer,
  Download,
  Calendar,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { EmployeeIDCardPreview } from '../../components/hrms/idcard/EmployeeIDCardPreview';

export const EmployeeIDCardPage = () => {
  const navigate = useNavigate();
  const { employeeUser, employeeToken } = useEmployeeAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyIdCard();
  }, [employeeToken, employeeUser]);

  const fetchMyIdCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (employeeToken) {
        headers['Authorization'] = `Bearer ${employeeToken}`;
      }

      const res = await fetch('/api/employee/profile/id-card', { headers });
      const data = await res.json();

      if (data.success && data.employee) {
        setEmployee(data.employee);
      } else {
        // Fallback: try fetching full profile
        const profRes = await fetch('/api/employee/profile', { headers });
        const profData = await profRes.json();
        if (profData.success && profData.profile) {
          setEmployee(profData.profile);
        } else if (employeeUser) {
          // If profile endpoint requires token but user exists in session
          setEmployee({
            ...employeeUser,
            employeeCode: employeeUser.employeeCode || employeeUser.employeeId,
            fullName: employeeUser.fullName || employeeUser.name
          });
        } else {
          setError(data.message || 'Unable to retrieve employee ID card.');
        }
      }
    } catch (err) {
      console.error('Failed to fetch ID card:', err);
      if (employeeUser) {
        setEmployee({
          ...employeeUser,
          employeeCode: employeeUser.employeeCode || employeeUser.employeeId,
          fullName: employeeUser.fullName || employeeUser.name
        });
      } else {
        setError('Network error while loading your ID card.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/employee/profile')}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-xs font-bold bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700"
          >
            <ArrowLeft size={14} />
            <span>Back to My Profile</span>
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-full">
            <Lock size={12} />
            <span>Strict Single-Employee View (Secured at API)</span>
          </div>
        </div>

        {/* Header Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 border border-teal-800/40 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Official Security Credential
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Template: BJK-ID-2026-V1
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
                <span>My Employee ID Card</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Official dual-sided BJK Healthcare identification pass. Use the controls below to preview both sides, flip interactively, download high-resolution PDF, or print.
              </p>
            </div>

            {employee && (
              <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-right shrink-0">
                <div className="text-xs text-slate-400 font-medium">Employee Code</div>
                <div className="text-base font-black text-teal-400">{employee.employeeCode || employee.employeeId}</div>
                <div className="text-[11px] text-slate-300 truncate max-w-[180px]">{employee.fullName}</div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/50 rounded-3xl p-16 border border-slate-700 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-300">Retrieving Official ID Card...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-3xl p-6 text-center text-rose-200 space-y-3">
            <AlertCircle size={32} className="mx-auto text-rose-400" />
            <h3 className="text-base font-bold">Unable to Load ID Card</h3>
            <p className="text-xs text-rose-300 max-w-md mx-auto">{error}</p>
            <button
              onClick={fetchMyIdCard}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Card Preview Container */}
        {!loading && employee && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <EmployeeIDCardPreview
              employee={employee}
              scale={1}
              showControls={true}
            />
          </div>
        )}

        {/* Security & Access Notice */}
        <div className="bg-slate-800/40 rounded-2xl p-4 border border-slate-700/60 flex items-start space-x-3 text-xs text-slate-400">
          <ShieldCheck size={18} className="text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-300">Privacy & Credential Policy:</span>
            <p>
              This employee identity card is dynamically generated from your official BJK Healthcare employee record. Per security policy, employees may only view and download their own personal card. The embedded QR code enables authorized verification while keeping sensitive information private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeIDCardPage;
