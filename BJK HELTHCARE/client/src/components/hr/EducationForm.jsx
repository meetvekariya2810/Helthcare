import React from 'react';
import {
  Plus as FiPlus,
  Trash2 as FiTrash2,
  Award as FiAward,
  BookOpen as FiBook,
  Calendar as FiCalendar,
  CheckCircle as FiCheckCircle
} from 'lucide-react';

const QUALIFICATION_LEVELS = [
  'Secondary School (10th)',
  'Higher Secondary (12th)',
  'Diploma / Polytechnic',
  'B.Pharm (Bachelor of Pharmacy)',
  'M.Pharm (Master of Pharmacy)',
  'Pharm.D (Doctor of Pharmacy)',
  'B.Sc / M.Sc (Chemistry / Microbiology / Biotech)',
  'B.Tech / B.E (Chemical / Mechanical / CS)',
  'B.Com / BBA / MBA',
  'Ph.D / Doctorate',
  'Post Graduate Diploma',
  'Professional Certification / Licensure',
  'Other'
];

export default function EducationForm({ data = {}, updateData }) {
  const educationList = data.educationDetails || [];

  const handleAddEducation = () => {
    const newEntry = {
      level: 'B.Pharm (Bachelor of Pharmacy)',
      degree: '',
      specialization: '',
      institution: '',
      universityOrBoard: '',
      passingYear: new Date().getFullYear(),
      percentageOrCgpa: '',
      gradeOrDivision: 'First Class with Distinction',
      registrationNumber: '',
      verified: false
    };
    updateData({ educationDetails: [...educationList, newEntry] });
  };

  const handleRemoveEducation = (index) => {
    const updated = educationList.filter((_, i) => i !== index);
    updateData({ educationDetails: updated });
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...educationList];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ educationDetails: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiAward className="text-teal-600 dark:text-teal-400" />
            Step 6: Education & Professional Qualifications
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture academic degrees, pharmacy qualifications, university certifications, and professional board licenses.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddEducation}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <FiPlus size={14} /> Add Qualification
        </button>
      </div>

      {educationList.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
          <FiBook className="mx-auto h-10 w-10 text-slate-400" />
          <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No Qualifications Added</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the button below to add academic credentials, pharma degrees, or technical certifications.
          </p>
          <button
            type="button"
            onClick={handleAddEducation}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm"
          >
            <FiPlus size={14} /> Add First Qualification
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {educationList.map((edu, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {edu.degree || edu.level || `Qualification #${idx + 1}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove qualification"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Qualification Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={edu.level || ''}
                    onChange={(e) => handleFieldChange(idx, 'level', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    {QUALIFICATION_LEVELS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Degree / Course Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.degree || ''}
                    onChange={(e) => handleFieldChange(idx, 'degree', e.target.value)}
                    placeholder="e.g. Bachelor of Pharmacy"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Specialization / Stream
                  </label>
                  <input
                    type="text"
                    value={edu.specialization || ''}
                    onChange={(e) => handleFieldChange(idx, 'specialization', e.target.value)}
                    placeholder="e.g. Quality Assurance / Organic Chemistry"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Institute / College Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.institution || ''}
                    onChange={(e) => handleFieldChange(idx, 'institution', e.target.value)}
                    placeholder="e.g. Gujarat Technological University College"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    University / Affiliated Board
                  </label>
                  <input
                    type="text"
                    value={edu.universityOrBoard || ''}
                    onChange={(e) => handleFieldChange(idx, 'universityOrBoard', e.target.value)}
                    placeholder="e.g. GTU / Mumbai University"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Passing Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max={new Date().getFullYear() + 2}
                    value={edu.passingYear || ''}
                    onChange={(e) => handleFieldChange(idx, 'passingYear', parseInt(e.target.value) || '')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Percentage / CGPA
                  </label>
                  <input
                    type="text"
                    value={edu.percentageOrCgpa || ''}
                    onChange={(e) => handleFieldChange(idx, 'percentageOrCgpa', e.target.value)}
                    placeholder="e.g. 8.4 CGPA or 78.5%"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Grade / Division
                  </label>
                  <input
                    type="text"
                    value={edu.gradeOrDivision || ''}
                    onChange={(e) => handleFieldChange(idx, 'gradeOrDivision', e.target.value)}
                    placeholder="e.g. Distinction / Grade A"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Pharmacy Council / Reg. Number (if applicable)
                  </label>
                  <input
                    type="text"
                    value={edu.registrationNumber || ''}
                    onChange={(e) => handleFieldChange(idx, 'registrationNumber', e.target.value)}
                    placeholder="e.g. GPC-REG-109482"
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
