import React from 'react';
import {
  Heart as FiHeart,
  Shield as FiShield,
  AlertCircle as FiAlertCircle,
  CheckCircle as FiCheckCircle,
  Activity as FiActivity
} from 'lucide-react';

export default function OccupationalHealthForm({ data = {}, updateData }) {
  const health = data.occupationalHealth || {};

  const handleChange = (field, value) => {
    updateData({
      occupationalHealth: {
        ...health,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiHeart className="text-rose-500" />
            Step 10: Occupational Health & Fitness Clearance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture workplace health clearance and cleanroom suitability records. All medical data is strictly restricted under HIPAA/GxP compliance.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-full text-rose-700 dark:text-rose-400 text-xs font-semibold">
          <FiShield size={13} /> Highly Restricted Health Record
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Medical Fitness Status <span className="text-rose-500">*</span>
            </label>
            <select
              value={health.medicalFitnessStatus || 'Fit for Duty'}
              onChange={(e) => handleChange('medicalFitnessStatus', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-medium"
            >
              <option value="Fit for Duty">Fit for Duty (All Areas)</option>
              <option value="Fit with Restrictions">Fit with Restrictions</option>
              <option value="Under Medical Evaluation">Under Medical Evaluation</option>
              <option value="Pending Pre-Employment Exam">Pending Pre-Employment Exam</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Medical Examination Date
            </label>
            <input
              type="date"
              value={health.medicalExamDate ? health.medicalExamDate.slice(0, 10) : ''}
              onChange={(e) => handleChange('medicalExamDate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
            </input>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fitness Certificate Validity Expiry
            </label>
            <input
              type="date"
              value={health.fitnessExpiryDate ? health.fitnessExpiryDate.slice(0, 10) : ''}
              onChange={(e) => handleChange('fitnessExpiryDate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
            </input>
          </div>
        </div>

        {/* Cleanroom suitability & Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Cleanroom / Sterile Formulation Area Clearance
            </label>
            <select
              value={health.cleanroomSuitability !== undefined ? String(health.cleanroomSuitability) : 'true'}
              onChange={(e) => handleChange('cleanroomSuitability', e.target.value === 'true')}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="true">Cleared (No dermatological / respiratory restrictions)</option>
              <option value="false">Restricted (Non-sterile / Packaging / Admin only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Known Compound / Chemical Allergies (e.g. Beta-Lactam, Penicillin, Latex)
            </label>
            <input
              type="text"
              value={health.allergies || ''}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="e.g. Penicillin sensitive, Latex allergy, None"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Occupational Restrictions / Workplace Accommodation Requirements
            </label>
            <textarea
              rows={2}
              value={health.occupationalRestrictions || ''}
              onChange={(e) => handleChange('occupationalRestrictions', e.target.value)}
              placeholder="e.g. Ergonomic chair required, Avoid heavy powder lifting, No high-noise machinery zones"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Emergency Medical Contact & Attending Physician
            </label>
            <input
              type="text"
              value={health.emergencyMedicalContact || ''}
              onChange={(e) => handleChange('emergencyMedicalContact', e.target.value)}
              placeholder="e.g. Dr. Rajesh Shah (Family Physician) - +91 98250 11223"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
