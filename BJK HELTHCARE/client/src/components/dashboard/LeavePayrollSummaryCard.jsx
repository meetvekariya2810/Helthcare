import React from 'react';
import { CalendarCheck, CreditCard, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LeavePayrollSummaryCard = ({ leaveSummary, payrollSummary }) => {
  const navigate = useNavigate();

  const totalLeaves = leaveSummary?.totalRequests ?? 0;
  const approvedLeaves = leaveSummary?.approved ?? 0;
  const pendingLeaves = leaveSummary?.pending ?? 0;

  const payrollStatus = payrollSummary?.status || 'Ready for Disbursal';
  const missingBank = payrollSummary?.missingBankDetails || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Leave Management Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CalendarCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Leave Management Summary
                </h3>
                <p className="text-[11px] text-slate-400">Request workflows, absence tracking, and leave categories</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/hrms/leave')}
              className="text-xs font-bold text-amber-600 hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pending</span>
              <div className="text-lg font-black text-amber-600 font-mono mt-0.5">{pendingLeaves}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Approved</span>
              <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">{approvedLeaves}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Logged</span>
              <div className="text-lg font-black text-slate-800 font-mono mt-0.5">{totalLeaves}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-600">Casual Leave (CL) Usage</span>
              <span className="font-mono font-bold text-slate-800">11 Recorded</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-600">Sick Leave (SL) Usage</span>
              <span className="font-mono font-bold text-slate-800">2 Recorded</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-600">Leave Without Pay (LWP)</span>
              <span className="font-mono font-bold text-slate-800">0 Recorded</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Policy: Standard Pharma HRMS Policy</span>
          <span className="text-amber-600 font-semibold">Workflow Active</span>
        </div>
      </div>

      {/* 2. Payroll Summary (RBAC Protected) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Payroll & Disbursal Summary
                </h3>
                <p className="text-[11px] text-slate-400">Statutory deductions, bank verification, and salary cycles</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/hrms/payroll')}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
            >
              <span>Payroll Run</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Current Cycle Status
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-200">
                RBAC Protected
              </span>
            </div>
            <div className="text-base font-black text-white mt-1.5 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{payrollStatus}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Automated EPF, ESIC, and Professional Tax compliance engine verified for active personnel.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-600">Pending Bank Account Verification</span>
              <span className={`font-mono font-bold ${missingBank > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {missingBank} Profiles
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-600">Attendance Exception Adjustments</span>
              <span className="font-mono font-bold text-slate-800">0 Overrides</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-slate-600">Sample Account Number Masking</span>
              <span className="font-mono font-bold text-slate-500">XXXXXX4892</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Statutory Compliance: EPF / ESI / PT</span>
          <span className="text-emerald-600 font-semibold">Strict RBAC</span>
        </div>
      </div>
    </div>
  );
};

export default LeavePayrollSummaryCard;
