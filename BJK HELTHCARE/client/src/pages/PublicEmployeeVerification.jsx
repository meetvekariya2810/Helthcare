import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  MapPin,
  ExternalLink,
  Award
} from 'lucide-react';

export const PublicEmployeeVerification = () => {
  const { employeeCode, code } = useParams();
  const token = employeeCode || code;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      verifyCredential(token);
    }
  }, [token]);

  const verifyCredential = async (tokenId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/verify/employee/${tokenId}`);
      const json = await res.json();
      if (json.success && json.verified) {
        setData(json.verificationData);
      } else {
        setError(json.message || 'Invalid verification token or record not found.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Unable to reach security verification servers. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-teal-950 border border-teal-800 shadow-xl mb-1">
            <img
              src="/idcard-assets/bjk_logo_badge.png"
              alt="BJK Healthcare Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            BJK HEALTHCARE PRIVATE LIMITED
          </h1>
          <p className="text-xs text-teal-300 font-bold tracking-wider uppercase">
            Official Credential & Security Verification Portal
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-600">Verifying Employee Security Certificate...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={28} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-black text-slate-900">Verification Failed</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">{error}</p>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Token: {token}</div>
            </div>
          ) : data ? (
            <div>
              {/* Card Top Banner */}
              <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-200">
                      Security Clearance
                    </span>
                    <h3 className="text-sm font-extrabold text-white">Active & Authorized Employee</h3>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white font-mono">
                    {data.employeeId}
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-6 space-y-5">
                {/* Employee Name & Title */}
                <div className="text-center pb-4 border-b border-slate-100 space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {data.fullName}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    {data.designation} • {data.department}
                  </p>
                </div>

                {/* Verification Fields Grid */}
                <div className="grid grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Organization
                    </span>
                    <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
                      {data.organization}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Facility / Branch
                    </span>
                    <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5">
                      {data.branch || 'Ahmedabad Facility'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Status
                    </span>
                    <span className="font-extrabold text-emerald-700 text-[11px] block mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {data.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Verification Timestamp
                    </span>
                    <span className="font-extrabold text-slate-800 text-[11px] block mt-0.5 font-mono">
                      {new Date(data.verifiedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Safe Privacy Disclaimer */}
                <div className="p-3.5 bg-teal-50/70 border border-teal-200/60 rounded-xl text-[11px] text-teal-900 leading-relaxed flex items-start gap-2">
                  <ShieldCheck size={16} className="text-teal-700 shrink-0 mt-0.5" />
                  <p>
                    This is an authentic digital credential issued by <strong>BJK Healthcare Private Limited</strong>. For compliance and personal data privacy, confidential details (DOB, salary, aadhaar, personal contact) are kept secure.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Corporate Footer */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <div>© {new Date().getFullYear()} BJK Healthcare Private Limited • Corporate Registry Gujarat</div>
          <div className="text-[11px] text-slate-400">
            410-4th Floor, Syphon Gardenia, On Sardar Patel Ring Road, Nana Chiloda, Ahmedabad, Gujarat 382330
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEmployeeVerification;
