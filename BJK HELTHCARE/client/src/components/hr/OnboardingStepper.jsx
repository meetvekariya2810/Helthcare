import React from 'react';
import {
  User,
  Briefcase,
  History,
  Users,
  MapPin,
  GraduationCap,
  CreditCard,
  Shield,
  Award,
  HeartPulse,
  FolderLock,
  CheckCircle,
  Save,
  Check
} from 'lucide-react';

export const ONBOARDING_STEPS = [
  { id: 1, label: 'Basic Info', title: 'Personal & Basic Details', icon: User },
  { id: 2, label: 'Job & Org', title: 'Department & Designation', icon: Briefcase },
  { id: 3, label: 'Experience', title: 'Previous Employment History', icon: History },
  { id: 4, label: 'Family', title: 'Family & Nominee Information', icon: Users },
  { id: 5, label: 'Addresses', title: 'Residential & Address Details', icon: MapPin },
  { id: 6, label: 'Education', title: 'Education & Qualifications', icon: GraduationCap },
  { id: 7, label: 'Bank', title: 'Bank & Financial Information', icon: CreditCard },
  { id: 8, label: 'Identity', title: 'Government IDs & KYC', icon: Shield },
  { id: 9, label: 'Compliance', title: 'Pharma & GMP Compliance', icon: Award },
  { id: 10, label: 'Health', title: 'Occupational Health & Fitness', icon: HeartPulse },
  { id: 11, label: 'Documents', title: 'Document Center & Vault', icon: FolderLock },
  { id: 12, label: 'Review', title: 'Review & HR Submission', icon: CheckCircle }
];

export const OnboardingStepper = ({
  currentStep,
  onSelectStep,
  completionPercentage = 0,
  lastAutoSavedAt,
  isDraft = true,
  employeeId = 'BJK-EMP-NEW'
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Top Banner: Employee ID, Completion Bar & Auto-save Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1 bg-bjk-teal/10 border border-bjk-teal/20 rounded-xl font-mono text-xs font-black text-bjk-teal">
            {employeeId}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Guided Employee Onboarding Wizard
            </h3>
            <p className="text-[11px] text-slate-500">
              Multi-step progressive identity and credential provisioning
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 self-end sm:self-auto">
          {lastAutoSavedAt && (
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
              <Save size={13} className="text-emerald-500 animate-pulse" />
              <span>Auto-saved at {new Date(lastAutoSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          {/* Completion Score */}
          <div className="flex items-center space-x-2">
            <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-bjk-teal to-bjk-cyan h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-xs font-black text-slate-800 font-mono">
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* 12-Step Horizontal Nav Bar */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex items-center space-x-2 min-w-[780px]">
          {ONBOARDING_STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => onSelectStep(step.id)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 border relative ${
                  isActive
                    ? 'bg-bjk-teal text-white border-bjk-teal shadow-md shadow-bjk-teal/20'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isCompleted ? (
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                ) : (
                  <step.icon size={14} className={isActive ? 'text-white' : 'text-slate-400 flex-shrink-0'} />
                )}
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepper;
