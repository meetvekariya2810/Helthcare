import React from 'react';
import { Users, Heart, Shield, UserCheck } from 'lucide-react';

export const FamilyNomineeForm = ({ data, onChange }) => {
  const family = data.familyDetails || {};

  const handleUpdateFamily = (field, value) => {
    onChange('familyDetails', { ...family, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
          <Users size={18} className="text-bjk-teal" />
          <span>Step 4: Personal, Family & Statutory Nominee Details</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Family lineage, marital dependents, and statutory PF / Gratuity nominee designation.
        </p>
      </div>

      {/* Parents & Spouse */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Father's Full Name *</label>
          <input
            type="text"
            value={family.fatherName || ''}
            onChange={(e) => handleUpdateFamily('fatherName', e.target.value)}
            placeholder="e.g. Navinbhai Patel"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Full Name *</label>
          <input
            type="text"
            value={family.motherName || ''}
            onChange={(e) => handleUpdateFamily('motherName', e.target.value)}
            placeholder="e.g. Geetaben Patel"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Spouse Name (If Married)</label>
          <input
            type="text"
            value={family.spouseName || ''}
            onChange={(e) => handleUpdateFamily('spouseName', e.target.value)}
            placeholder="e.g. Sunita Patel"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>
      </div>

      {/* Dependents count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Number of Children</label>
          <input
            type="number"
            min="0"
            value={family.childrenCount || 0}
            onChange={(e) => handleUpdateFamily('childrenCount', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Total Family Dependents</label>
          <input
            type="number"
            min="0"
            value={family.dependentsCount || 0}
            onChange={(e) => handleUpdateFamily('dependentsCount', Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>
      </div>

      {/* Statutory Nominee Section */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
          <Shield size={14} className="text-bjk-teal" />
          <span>Statutory Nominee Designation (EPF, Gratuity & Mediclaim)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nominee Full Name *</label>
            <input
              type="text"
              value={family.nomineeName || ''}
              onChange={(e) => handleUpdateFamily('nomineeName', e.target.value)}
              placeholder="Nominee Legal Name"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nominee Relationship *</label>
            <input
              type="text"
              value={family.nomineeRelationship || ''}
              onChange={(e) => handleUpdateFamily('nomineeRelationship', e.target.value)}
              placeholder="e.g. Spouse / Father / Mother"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nominee Date of Birth</label>
            <input
              type="date"
              value={family.nomineeDateOfBirth ? family.nomineeDateOfBirth.split('T')[0] : ''}
              onChange={(e) => handleUpdateFamily('nomineeDateOfBirth', e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nominee Contact Number</label>
            <input
              type="tel"
              value={family.nomineeContact || ''}
              onChange={(e) => handleUpdateFamily('nomineeContact', e.target.value)}
              placeholder="+91 98980 00000"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nominee Residential Address</label>
            <input
              type="text"
              value={family.nomineeAddress || ''}
              onChange={(e) => handleUpdateFamily('nomineeAddress', e.target.value)}
              placeholder="Residential address of nominee"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyNomineeForm;
