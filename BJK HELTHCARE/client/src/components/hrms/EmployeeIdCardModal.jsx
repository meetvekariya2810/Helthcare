import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { EmployeeIDCardPreview } from './idcard/EmployeeIDCardPreview';

export const EmployeeIdCardModal = ({ isOpen, onClose, employee, onCardUpdated }) => {
  if (!isOpen || !employee) return null;

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/employees/${employee._id || employee.employeeId}/id-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardTemplate: 'BJK-ID-2026-V1',
          status: 'ACTIVE'
        })
      });
      const data = await res.json();
      if (data.success && onCardUpdated) {
        onCardUpdated(data.employee || employee);
      }
    } catch (e) {
      console.error('Error regenerating card:', e);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6 transform transition-all flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">
                  Official Employee Identity Card
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  BJK-ID-2026-V1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {employee.fullName} • {employee.employeeCode || employee.employeeId} • {employee.designationTitle || employee.designation}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body with Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <EmployeeIDCardPreview
            employee={employee}
            scale={0.88}
            showControls={true}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeIdCardModal;
