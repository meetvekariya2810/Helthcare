import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Mail,
  Phone,
  Building2,
  MapPin,
  QrCode,
  CheckCircle2,
  Copy,
  Globe
} from 'lucide-react';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const EmployeeBusinessCardModal = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) return null;

  const [copied, setCopied] = useState(false);
  const [template, setTemplate] = useState('CORPORATE_DARK'); // 'CORPORATE_DARK' | 'PLATINUM_WHITE' | 'TEAL_GRADIENT'

  const empId = employee.employeeId || employee.employeeCode || 'BHK0146';
  const name = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee Name';
  const designation = employee.designationTitle || employee.designation || 'Manager';
  const department = employee.departmentName || employee.department || 'Operations';
  const branch = employee.branch || employee.facility || 'Ahmedabad';
  const email = employee.email || employee.workEmail || 'employee@bjkhealthcare.com';
  const phone = employee.phone || employee.officialMobile || '+91 98251 00000';
  const website = 'www.bjkhealthcare.com';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://bjkhealthcare.com/card/${empId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Digital Employee Business Card</h2>
            <p className="text-xs text-slate-400">
              Interactive BJK Healthcare vCard & Executive Representation Pass
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600">Card Theme Style:</span>
          <div className="flex rounded-xl bg-slate-200 p-0.5 font-semibold space-x-1">
            <button
              onClick={() => setTemplate('CORPORATE_DARK')}
              className={`px-3 py-1 rounded-lg transition-all ${
                template === 'CORPORATE_DARK' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Corporate Dark
            </button>
            <button
              onClick={() => setTemplate('TEAL_GRADIENT')}
              className={`px-3 py-1 rounded-lg transition-all ${
                template === 'TEAL_GRADIENT' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teal Signature
            </button>
            <button
              onClick={() => setTemplate('PLATINUM_WHITE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                template === 'PLATINUM_WHITE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Platinum Crisp
            </button>
          </div>
        </div>

        {/* Card Stage Canvas */}
        <div className="p-8 bg-slate-100 flex items-center justify-center min-h-[320px]">
          <div
            className={`w-[480px] h-[270px] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border ${
              template === 'CORPORATE_DARK'
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white border-slate-700'
                : template === 'TEAL_GRADIENT'
                ? 'bg-gradient-to-br from-teal-900 via-teal-700 to-cyan-800 text-white border-teal-500/40'
                : 'bg-white text-slate-900 border-slate-300'
            }`}
          >
            {/* Background Decorative Gradient Orb */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar: Logo & Company Name */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-2.5">
                <img
                  src={bjkLogo}
                  alt="BJK Healthcare"
                  className={`h-7 w-auto object-contain ${template === 'PLATINUM_WHITE' ? '' : 'brightness-0 invert'}`}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <span className="font-black text-sm tracking-wider uppercase block leading-none">
                    BJK HEALTHCARE
                  </span>
                  <span className="text-[9px] tracking-widest text-teal-400 uppercase font-bold">
                    Pharmaceuticals & Diagnostics
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 backdrop-blur-xs border border-white/10">
                {empId}
              </span>
            </div>

            {/* Middle Section: Photo & Identity */}
            <div className="flex items-center space-x-4 my-2 relative z-10">
              {employee.photo || employee.profilePhoto ? (
                <img
                  src={employee.photo || employee.profilePhoto}
                  alt={name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-teal-300 flex-shrink-0">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h3 className="font-black text-lg tracking-tight leading-tight truncate">
                  {name}
                </h3>
                <p className="text-xs font-bold text-teal-400 truncate mt-0.5">
                  {designation} &bull; {department}
                </p>
                <p className="text-[11px] opacity-75 truncate flex items-center space-x-1 mt-0.5">
                  <MapPin size={11} className="flex-shrink-0" />
                  <span>{branch} Facility &bull; Gujarat, India</span>
                </p>
              </div>
            </div>

            {/* Bottom Bar: Contact Details & QR Code */}
            <div className="flex items-end justify-between pt-2 border-t border-white/10 relative z-10 text-[11px]">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 opacity-90">
                  <Phone size={12} className="text-teal-400 flex-shrink-0" />
                  <span className="font-mono font-semibold">{phone}</span>
                </div>
                <div className="flex items-center space-x-1.5 opacity-90">
                  <Mail size={12} className="text-teal-400 flex-shrink-0" />
                  <span className="font-semibold">{email}</span>
                </div>
                <div className="flex items-center space-x-1.5 opacity-75 text-[10px]">
                  <Globe size={11} className="text-teal-400 flex-shrink-0" />
                  <span>{website}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-1 rounded-xl bg-white text-slate-900 border border-slate-200 shadow-md">
                <QrCode size={38} className="text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Card URL Copied!' : 'Copy vCard Link'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Printer size={14} />
              <span>Print Business Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
