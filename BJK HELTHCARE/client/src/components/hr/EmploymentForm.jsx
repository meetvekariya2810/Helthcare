import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, MapPin, Layers, Clock, ShieldCheck } from 'lucide-react';

const DEPARTMENTS = [
  'Quality Assurance',
  'Quality Control',
  'Production',
  'Manufacturing',
  'Warehouse',
  'Inventory',
  'Procurement',
  'Supply Chain',
  'Regulatory Affairs',
  'Research & Development',
  'Human Resources',
  'Finance',
  'Accounts',
  'Sales',
  'Marketing',
  'Export',
  'IT',
  'Administration',
  'Maintenance',
  'Management'
];

export const EmploymentForm = ({ data, onChange, managers = [] }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
          <Briefcase size={18} className="text-bjk-teal" />
          <span>Step 2: Job & Organization Details</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Department assignment across 20 official divisions, plant facility, reporting chain, grade, and shift.
        </p>
      </div>

      {/* Department & Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Department (20 Divisions) <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={data.department || 'Quality Assurance'}
            onChange={(e) => {
              onChange('department', e.target.value);
              onChange('departmentName', e.target.value);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Designation Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={data.designation || ''}
            onChange={(e) => {
              onChange('designation', e.target.value);
              onChange('designationTitle', e.target.value);
            }}
            placeholder="e.g. Senior Formulation Scientist / QA Lead"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Sub-Department / Division</label>
          <input
            type="text"
            value={data.subDepartment || ''}
            onChange={(e) => onChange('subDepartment', e.target.value)}
            placeholder="e.g. Analytical Lab / Tablet Compression"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>
      </div>

      {/* Reporting Chain & Facility */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Reporting Manager</label>
          <select
            value={data.reportingManager || ''}
            onChange={(e) => onChange('reportingManager', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          >
            <option value="">-- Select Reporting Manager --</option>
            {managers.map(m => (
              <option key={m._id} value={m._id}>
                {m.firstName} {m.lastName} ({m.departmentName || m.department})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Plant Facility *</label>
          <select
            value={data.facility || 'BJK Unit 1 - Formulations Facility'}
            onChange={(e) => onChange('facility', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          >
            <option value="BJK Unit 1 - Formulations Facility">BJK Unit 1 - Formulations Facility (Ahmedabad)</option>
            <option value="BJK Unit 2 - Injectables & Lyophilization">BJK Unit 2 - Injectables (Sanand)</option>
            <option value="BJK Corporate Headquarters">BJK Corporate Headquarters (Ahmedabad)</option>
            <option value="BJK R&D Technical Center">BJK R&D Technical Center (Changodar)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Work Location</label>
          <input
            type="text"
            value={data.location || 'Ahmedabad Plant'}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="e.g. Ahmedabad Plant"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>
      </div>

      {/* Employment Details & Shift */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Employment Type *</label>
          <select
            value={data.employmentType || 'FULL_TIME'}
            onChange={(e) => onChange('employmentType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="CONSULTANT">Consultant</option>
            <option value="INTERN">Intern</option>
            <option value="APPRENTICE">Apprentice</option>
            <option value="PROBATION">On Probation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
          <select
            value={data.grade || 'L2'}
            onChange={(e) => onChange('grade', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          >
            {['L1 - Associate', 'L2 - Executive', 'L3 - Senior Executive', 'L4 - Assistant Manager', 'L5 - Manager', 'L6 - Senior Manager', 'L7 - General Manager', 'L8 - Vice President', 'L9 - Director'].map(g => (
              <option key={g} value={g.split(' ')[0]}>{g}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Official Joining Date *</label>
          <input
            type="date"
            required
            value={data.joiningDate ? data.joiningDate.split('T')[0] : ''}
            onChange={(e) => onChange('joiningDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Shift Schedule</label>
          <select
            value={data.shiftName || 'General Shift (09:00 - 18:00)'}
            onChange={(e) => onChange('shiftName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
          >
            <option value="General Shift (09:00 - 18:00)">General Shift (09:00 - 18:00)</option>
            <option value="Pharma Morning Shift A (06:00 - 14:30)">Pharma Morning Shift A (06:00 - 14:30)</option>
            <option value="Pharma Evening Shift B (14:00 - 22:30)">Pharma Evening Shift B (14:00 - 22:30)</option>
            <option value="Pharma Night Shift C (22:00 - 06:30)">Pharma Night Shift C (22:00 - 06:30)</option>
          </select>
        </div>
      </div>

      {/* Probation & Notice Period Terms */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Probation Period (Months)</label>
          <input
            type="number"
            value={data.probationPeriodMonths || 6}
            onChange={(e) => onChange('probationPeriodMonths', Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Notice Period (Days)</label>
          <input
            type="number"
            value={data.noticePeriodDays || 30}
            onChange={(e) => onChange('noticePeriodDays', Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Basic Salary (Monthly ₹)</label>
          <input
            type="number"
            value={data.basicSalary || 35000}
            onChange={(e) => onChange('basicSalary', Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-mono font-bold"
          />
        </div>
      </div>
    </div>
  );
};

export default EmploymentForm;
