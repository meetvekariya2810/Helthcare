import React, { useState } from 'react';
import {
  Shield as FiShield,
  FileText as FiFileText,
  Lock as FiLock,
  Eye as FiEye,
  EyeOff as FiEyeOff,
  CheckCircle as FiCheckCircle
} from 'lucide-react';

export default function IdentityDocumentsForm({ data = {}, updateData }) {
  const docs = data.identityDocuments || {};
  const [showSensitive, setShowSensitive] = useState(false);

  const handleChange = (field, value) => {
    updateData({
      identityDocuments: {
        ...docs,
        [field]: value
      }
    });
  };

  const formatAadhaar = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const getMaskedAadhaar = (num) => {
    if (!num) return '•••• •••• ••••';
    const clean = num.replace(/\s+/g, '');
    if (clean.length < 4) return '•••• •••• ' + clean;
    return '•••• •••• ' + clean.slice(-4);
  };

  const getMaskedPAN = (pan) => {
    if (!pan) return '••••••••••';
    if (pan.length < 4) return pan;
    return '••••••' + pan.slice(-4);
  };

  const isPanValid = !docs.panNumber || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(docs.panNumber);
  const isAadhaarValid = !docs.aadhaarNumber || docs.aadhaarNumber.replace(/\s+/g, '').length === 12;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiShield className="text-teal-600 dark:text-teal-400" />
            Step 8: Identity & Government Identification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture statutory government identity identifiers. Numbers are masked and accessed only by authorized HR verification officers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSensitive(!showSensitive)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
        >
          {showSensitive ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          {showSensitive ? 'Mask IDs' : 'Reveal IDs'}
        </button>
      </div>

      {/* Identity Preview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/90 to-indigo-900/90 text-white shadow-sm border border-blue-700/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">Aadhaar Card (UIDAI)</span>
            <FiLock className="text-blue-300" size={14} />
          </div>
          <div className="text-base font-mono font-bold tracking-widest mt-2">
            {showSensitive ? (docs.aadhaarNumber || 'NOT PROVIDED') : getMaskedAadhaar(docs.aadhaarNumber)}
          </div>
          <div className="text-[11px] text-blue-200 mt-1">12-Digit Unique Identification Number</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-900/90 to-emerald-900/90 text-white shadow-sm border border-teal-700/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-200 uppercase tracking-wider">Income Tax PAN</span>
            <FiLock className="text-teal-300" size={14} />
          </div>
          <div className="text-base font-mono font-bold tracking-widest mt-2">
            {showSensitive ? (docs.panNumber || 'NOT PROVIDED') : getMaskedPAN(docs.panNumber)}
          </div>
          <div className="text-[11px] text-teal-200 mt-1">10-Character Permanent Account Number</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Aadhaar */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Aadhaar Number (12 Digits) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={14}
            value={docs.aadhaarNumber || ''}
            onChange={(e) => handleChange('aadhaarNumber', formatAadhaar(e.target.value))}
            placeholder="e.g. 5432 8901 2345"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
          />
          {!isAadhaarValid && (
            <p className="text-[11px] text-rose-500 mt-1">Aadhaar must contain exactly 12 numeric digits.</p>
          )}
        </div>

        {/* PAN */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            PAN Number (10 Characters) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            maxLength={10}
            value={docs.panNumber || ''}
            onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            placeholder="e.g. ABCDE1234F"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono uppercase"
          />
          {!isPanValid && (
            <p className="text-[11px] text-amber-500 mt-1">Format: 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).</p>
          )}
        </div>

        {/* Passport */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Passport Number (Optional)
          </label>
          <input
            type="text"
            maxLength={12}
            value={docs.passportNumber || ''}
            onChange={(e) => handleChange('passportNumber', e.target.value.toUpperCase().trim())}
            placeholder="e.g. N1234567"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
          />
        </div>

        {/* Passport Expiry */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Passport Expiry Date
          </label>
          <input
            type="date"
            value={docs.passportExpiry ? docs.passportExpiry.slice(0, 10) : ''}
            onChange={(e) => handleChange('passportExpiry', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Driving License */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Driving License Number (Optional)
          </label>
          <input
            type="text"
            value={docs.drivingLicenseNumber || ''}
            onChange={(e) => handleChange('drivingLicenseNumber', e.target.value.toUpperCase().trim())}
            placeholder="e.g. GJ0120150001234"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
          />
        </div>

        {/* Voter ID */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Voter ID / EPIC Number (Optional)
          </label>
          <input
            type="text"
            value={docs.voterIdNumber || ''}
            onChange={(e) => handleChange('voterIdNumber', e.target.value.toUpperCase().trim())}
            placeholder="e.g. XYZ1234567"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none font-mono"
          />
        </div>
      </div>
    </div>
  );
}
