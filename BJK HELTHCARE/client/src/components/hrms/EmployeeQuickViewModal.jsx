import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  CreditCard,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  Users,
  Award
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const EmployeeQuickViewModal = ({
  isOpen,
  onClose,
  employee,
  onOpenIdCard,
  onOpenBusinessCard
}) => {
  const navigate = useNavigate();

  if (!isOpen || !employee) return null;

  const empId = employee.employeeId || employee.employeeCode || 'BHK0000';
  const name = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee';
  const initials = name.slice(0, 2).toUpperCase();
  const designation = employee.designationTitle || employee.designation || 'Personnel';
  const department = employee.departmentName || employee.department || 'Operations';
  const branch = employee.branch || employee.facility || 'Ahmedabad';
  const email = employee.email || employee.workEmail || 'N/A';
  const phone = employee.phone || employee.officialMobile || 'N/A';
  const manager = employee.reportingManagerName || employee.managerName || employee.reportingManager || 'Executive Management';
  const joiningDate = employee.dateOfJoining || employee.joiningDate
    ? new Date(employee.dateOfJoining || employee.joiningDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : '23-Jun-2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Employee Quick Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Close Quick View"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Card Banner */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-start space-x-4">
            {employee.photo || employee.profilePhoto || employee.profilePhotoUrl || employee.avatar ? (
              <img
                src={employee.photo || employee.profilePhoto || employee.profilePhotoUrl || employee.avatar}
                alt={name}
                className="w-18 h-18 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0 border-2 border-white">
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl font-black text-slate-900 truncate">{name}</h2>
                <StatusBadge status={employee.status || 'ACTIVE'} />
              </div>

              <div className="flex items-center space-x-2 mt-1">
                <span className="font-mono text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200/60">
                  {empId}
                </span>
                <span className="text-xs font-semibold text-slate-600 truncate">{designation}</span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center space-x-1">
                  <Building2 size={13} className="text-slate-400" />
                  <span className="truncate">{department}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{branch}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Job & Contact Metadata Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[11px] mb-0.5">Joining Date</span>
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Calendar size={13} className="text-teal-600" />
                <span>{joiningDate}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[11px] mb-0.5">Reporting Manager</span>
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 truncate">
                <UserCheck size={13} className="text-teal-600 flex-shrink-0" />
                <span className="truncate">{manager}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[11px] mb-0.5">Official Email</span>
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 truncate">
                <Mail size={13} className="text-teal-600 flex-shrink-0" />
                <span className="truncate" title={email}>{email}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[11px] mb-0.5">Official Mobile</span>
              <span className="font-bold text-slate-800 flex items-center space-x-1.5 font-mono">
                <Phone size={13} className="text-teal-600 flex-shrink-0" />
                <span>{phone}</span>
              </span>
            </div>
          </div>

          {/* Quick Links Section (Requirement Step 10 & 19) */}
          <div className="pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              HR Module Quick Links
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/hrms/attendance?search=${empId}`);
                }}
                className="p-2 rounded-xl bg-teal-50/60 hover:bg-teal-100 text-teal-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-teal-200/60 transition-colors"
              >
                <Clock size={13} />
                <span>Attendance</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/hrms/leave?search=${empId}`);
                }}
                className="p-2 rounded-xl bg-purple-50/60 hover:bg-purple-100 text-purple-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-purple-200/60 transition-colors"
              >
                <Calendar size={13} />
                <span>Leave</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/hrms/payroll?search=${empId}`);
                }}
                className="p-2 rounded-xl bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-emerald-200/60 transition-colors"
              >
                <CreditCard size={13} />
                <span>Payroll</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/hr/employees/${employee._id}?tab=documents`);
                }}
                className="p-2 rounded-xl bg-sky-50/60 hover:bg-sky-100 text-sky-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-sky-200/60 transition-colors"
              >
                <FileText size={13} />
                <span>Documents</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/hr/employees/${employee._id}?tab=experience`);
                }}
                className="p-2 rounded-xl bg-amber-50/60 hover:bg-amber-100 text-amber-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-amber-200/60 transition-colors"
              >
                <Briefcase size={13} />
                <span>Experience</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/hr/employees/hierarchy?search=${empId}`);
                }}
                className="p-2 rounded-xl bg-indigo-50/60 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-indigo-200/60 transition-colors"
              >
                <Users size={13} />
                <span>Team / Org</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenIdCard) onOpenIdCard(employee);
              }}
              className="px-3.5 py-2 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
            >
              <ShieldCheck size={14} />
              <span>ID Card</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenBusinessCard) onOpenBusinessCard(employee);
              }}
              className="px-3.5 py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
            >
              <CreditCard size={14} />
              <span>Business Card</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              navigate(`/hr/employees/${employee._id || employee.employeeId}`);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <span>View Full Profile</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
