import React from 'react';
import { History, Plus, Trash2, Building, Calendar, FileText, CheckCircle } from 'lucide-react';

export const PreviousEmploymentForm = ({ data, onChange }) => {
  const previousList = data.previousEmployment || [];

  const handleAddPrevious = () => {
    const newItem = {
      companyName: '',
      companyAddress: '',
      industry: 'Pharmaceuticals / Healthcare',
      designation: '',
      department: '',
      employmentType: 'Full Time',
      joiningDate: '',
      leavingDate: '',
      totalExperience: '2 Years',
      lastDrawnSalary: '',
      reportingManager: '',
      managerContact: '',
      reasonForLeaving: 'Career Growth',
      majorResponsibilities: '',
      verificationStatus: 'PENDING'
    };
    onChange('previousEmployment', [...previousList, newItem]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...previousList];
    updated[index] = { ...updated[index], [field]: value };
    onChange('previousEmployment', updated);
  };

  const handleRemoveItem = (index) => {
    const updated = previousList.filter((_, i) => i !== index);
    onChange('previousEmployment', updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <History size={18} className="text-bjk-teal" />
            <span>Step 3: Previous Employment History</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Document previous industry tenures, company contacts, responsibilities, and background verification checkpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddPrevious}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-bjk-teal/10 hover:bg-bjk-teal/20 text-bjk-teal rounded-xl text-xs font-bold transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Previous Company</span>
        </button>
      </div>

      {previousList.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Building size={28} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500">No previous employment records added yet.</p>
          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={handleAddPrevious}
              className="px-4 py-2 bg-bjk-teal text-white rounded-xl text-xs font-bold"
            >
              Add Prior Employment Record
            </button>
            <button
              type="button"
              onClick={() => onChange('hasNoPreviousExperience', true)}
              className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-semibold"
            >
              Fresh Graduate / First Job
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {previousList.map((item, idx) => (
            <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-900 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                    #{idx + 1}
                  </span>
                  <span>{item.companyName || 'Previous Company'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs"
                  title="Remove this employment record"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={item.companyName}
                    onChange={(e) => handleUpdateItem(idx, 'companyName', e.target.value)}
                    placeholder="e.g. Torrent Pharmaceuticals Ltd"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation Held *</label>
                  <input
                    type="text"
                    required
                    value={item.designation}
                    onChange={(e) => handleUpdateItem(idx, 'designation', e.target.value)}
                    placeholder="e.g. Quality Control Analyst"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Industry Sector</label>
                  <input
                    type="text"
                    value={item.industry}
                    onChange={(e) => handleUpdateItem(idx, 'industry', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={item.joiningDate ? item.joiningDate.split('T')[0] : ''}
                    onChange={(e) => handleUpdateItem(idx, 'joiningDate', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Leaving Date</label>
                  <input
                    type="date"
                    value={item.leavingDate ? item.leavingDate.split('T')[0] : ''}
                    onChange={(e) => handleUpdateItem(idx, 'leavingDate', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Last Drawn Salary</label>
                  <input
                    type="text"
                    value={item.lastDrawnSalary}
                    onChange={(e) => handleUpdateItem(idx, 'lastDrawnSalary', e.target.value)}
                    placeholder="e.g. ₹ 4.5 LPA"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reason for Leaving</label>
                  <input
                    type="text"
                    value={item.reasonForLeaving}
                    onChange={(e) => handleUpdateItem(idx, 'reasonForLeaving', e.target.value)}
                    placeholder="e.g. Higher growth"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reporting Manager & Contact</label>
                  <input
                    type="text"
                    value={item.reportingManager}
                    onChange={(e) => handleUpdateItem(idx, 'reportingManager', e.target.value)}
                    placeholder="e.g. Dr. Anil Verma (+91 98980 12345)"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Major Responsibilities</label>
                  <input
                    type="text"
                    value={item.majorResponsibilities}
                    onChange={(e) => handleUpdateItem(idx, 'majorResponsibilities', e.target.value)}
                    placeholder="e.g. HPLC analysis of finished dosage formulations"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PreviousEmploymentForm;
