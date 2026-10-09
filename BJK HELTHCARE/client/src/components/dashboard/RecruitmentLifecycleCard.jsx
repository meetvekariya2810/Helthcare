import React from 'react';
import { UserPlus, UserCheck, UserX, Briefcase, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RecruitmentLifecycleCard = ({
  recruitmentSummary,
  onboardingSummary,
  offboardingSummary
}) => {
  const navigate = useNavigate();

  const openPositions = recruitmentSummary?.openPositions ?? 0;
  const newJoiners30d = recruitmentSummary?.newJoiners30Days ?? 0;
  const activeOnboarding = onboardingSummary?.totalActive ?? 0;
  const resignations = offboardingSummary?.resignations ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Recruitment Monitor */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-bjk-teal flex items-center justify-center">
                <Briefcase size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Recruitment & ATS
                </h3>
                <p className="text-[11px] text-slate-400">Open roles & pipeline</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/hrms/recruitment')}
              className="text-xs font-bold text-bjk-teal hover:underline flex items-center space-x-1"
            >
              <span>ATS</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Open Positions</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{openPositions}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">New Joiners (Last 30d)</span>
              <span className="font-mono font-bold text-bjk-teal text-sm">{newJoiners30d}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Interview Pipeline</span>
              <span className="font-mono font-bold text-slate-700">0 Scheduled</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Active Requisitions</span>
          <span className="text-bjk-teal font-semibold">Live ATS Connected</span>
        </div>
      </div>

      {/* 2. Onboarding Monitor */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Onboarding (90-Day)
                </h3>
                <p className="text-[11px] text-slate-400">New joiner readiness & IT</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/hr/onboarding')}
              className="text-xs font-bold text-pink-600 hover:underline flex items-center space-x-1"
            >
              <span>Track</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Active Onboarding</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{activeOnboarding}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Documentation Status</span>
              <span className="font-mono font-bold text-emerald-600">Compliant</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">IT & Asset Allocation</span>
              <span className="font-mono font-bold text-slate-700">Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Workflow Progress</span>
          <span className="text-pink-600 font-semibold">GMP Induction Valid</span>
        </div>
      </div>

      {/* 3. Offboarding & Exit Monitor */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm bjk-card-glow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <UserX size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Offboarding & Separations
                </h3>
                <p className="text-[11px] text-slate-400">Notice period & clearances</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/hrms/former-employees')}
              className="text-xs font-bold text-orange-600 hover:underline flex items-center space-x-1"
            >
              <span>Exits</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Notice Period Active</span>
              <span className="font-mono font-bold text-amber-600 text-sm">{resignations}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Pending Asset Returns</span>
              <span className="font-mono font-bold text-slate-900">0</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Exit Interviews Due</span>
              <span className="font-mono font-bold text-slate-700">0</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Exit Settlement</span>
          <span className="text-orange-600 font-semibold">Clearance Engine</span>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentLifecycleCard;
