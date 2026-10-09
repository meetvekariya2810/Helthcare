import React from 'react';
import {
  CheckSquare as FiCheckSquare,
  Plus as FiPlus,
  Trash2 as FiTrash2,
  AlertTriangle as FiAlertTriangle,
  Calendar as FiCalendar,
  UserCheck as FiUserCheck
} from 'lucide-react';

const STANDARD_MODULES = [
  { code: 'GMP-01', title: 'Good Manufacturing Practices (GMP) Induction', mandatory: true, category: 'GMP' },
  { code: 'GDP-01', title: 'Good Distribution Practice (GDP) & Cold Chain', mandatory: true, category: 'GDP' },
  { code: 'ALCOA-01', title: 'Data Integrity & ALCOA+ Principles', mandatory: true, category: 'Data Integrity' },
  { code: 'SOP-GEN-01', title: 'General SOP Compliance & Good Documentation', mandatory: true, category: 'SOP' },
  { code: 'SAFE-01', title: 'Workplace Chemical & Fire Safety Protocol', mandatory: true, category: 'Safety' },
  { code: 'PV-01', title: 'Pharmacovigilance & Adverse Event Reporting', mandatory: false, category: 'Pharmacovigilance' },
  { code: 'HYG-01', title: 'Cleanroom Hygiene & PPE Gowning Procedure', mandatory: true, category: 'Hygiene' }
];

export default function ComplianceTrainingForm({ data = {}, updateData }) {
  const complianceList = data.complianceTraining || [];

  const handleAddDefaultModules = () => {
    const existingCodes = complianceList.map((c) => c.trainingModule);
    const missingDefaults = STANDARD_MODULES.filter((m) => !existingCodes.includes(m.title)).map((m) => ({
      trainingModule: m.title,
      mandatory: m.mandatory,
      status: 'Scheduled',
      completionDate: '',
      validityMonths: 12,
      expiryDate: '',
      trainerName: 'BJK QA Training Division',
      score: 100
    }));

    updateData({ complianceTraining: [...complianceList, ...missingDefaults] });
  };

  const handleAddCustom = () => {
    const newEntry = {
      trainingModule: '',
      mandatory: true,
      status: 'Scheduled',
      completionDate: '',
      validityMonths: 12,
      expiryDate: '',
      trainerName: 'BJK QA/HR Trainer',
      score: 100
    };
    updateData({ complianceTraining: [...complianceList, newEntry] });
  };

  const handleRemove = (index) => {
    const updated = complianceList.filter((_, i) => i !== index);
    updateData({ complianceTraining: updated });
  };

  const handleChange = (index, field, value) => {
    const updated = [...complianceList];
    updated[index] = { ...updated[index], [field]: value };

    // Auto calculate expiry date if completionDate and validityMonths are set
    if (field === 'completionDate' && value) {
      const compDate = new Date(value);
      const months = updated[index].validityMonths || 12;
      compDate.setMonth(compDate.getMonth() + months);
      updated[index].expiryDate = compDate.toISOString().slice(0, 10);
    }

    updateData({ complianceTraining: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiCheckSquare className="text-teal-600 dark:text-teal-400" />
            Step 9: Healthcare & Pharmaceutical Compliance Training
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track mandatory GMP, GDP, Data Integrity, and GxP training modules required for regulatory audit readiness.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {complianceList.length === 0 && (
            <button
              type="button"
              onClick={handleAddDefaultModules}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <FiCheckSquare size={14} /> Populate Standard Pharma Modules
            </button>
          )}
          <button
            type="button"
            onClick={handleAddCustom}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <FiPlus size={14} /> Add Training Module
          </button>
        </div>
      </div>

      {complianceList.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
          <FiAlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
          <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No Compliance Modules Assigned</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Pharmaceutical manufacturing and quality roles require baseline compliance certifications. Click below to load standard GMP/GDP modules.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleAddDefaultModules}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Load Standard BJK Pharma Compliance Pack
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {complianceList.map((mod, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">
                    {mod.trainingModule || `Custom Training #${idx + 1}`}
                  </div>
                  {mod.mandatory && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                      MANDATORY GxP
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove module"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Training Module Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={mod.trainingModule || ''}
                    onChange={(e) => handleChange(idx, 'trainingModule', e.target.value)}
                    placeholder="e.g. Good Manufacturing Practice (GMP) Induction"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Training Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={mod.status || 'Scheduled'}
                    onChange={(e) => handleChange(idx, 'status', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="Completed">Completed & Verified</option>
                    <option value="Scheduled">Scheduled for Onboarding Week</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Exempted">Exempted / Previous Valid Cert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Trainer / Certified Body
                  </label>
                  <input
                    type="text"
                    value={mod.trainerName || ''}
                    onChange={(e) => handleChange(idx, 'trainerName', e.target.value)}
                    placeholder="e.g. BJK QA Training Dept."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={mod.completionDate ? mod.completionDate.slice(0, 10) : ''}
                    onChange={(e) => handleChange(idx, 'completionDate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Validity (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={mod.validityMonths || 12}
                    onChange={(e) => handleChange(idx, 'validityMonths', parseInt(e.target.value) || 12)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expiry / Recertification Due
                  </label>
                  <input
                    type="date"
                    value={mod.expiryDate ? mod.expiryDate.slice(0, 10) : ''}
                    onChange={(e) => handleChange(idx, 'expiryDate', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assessment Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={mod.score || 100}
                    onChange={(e) => handleChange(idx, 'score', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
