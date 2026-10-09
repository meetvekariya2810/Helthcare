import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { leaveAPI } from '../../services/api';
import { Sliders, AlertCircle, PlusCircle, MinusCircle } from 'lucide-react';

export const AdjustBalanceModal = ({ isOpen, onClose, onSuccess, employee, leaveTypes = [] }) => {
  const { showToast } = useNotification();
  const [leaveType, setLeaveType] = useState('CASUAL_LEAVE');
  const [adjustmentAmount, setAdjustmentAmount] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!employee) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !reason.trim()) {
      showToast('A documented reason is mandatory for manual balance adjustments.', 'error', 'Reason Required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await leaveAPI.adjustBalance(employee.employeeId, {
        leaveType,
        adjustmentAmount: Number(adjustmentAmount),
        reason
      });

      if (res.data.success) {
        showToast(res.data.message || 'Balance adjusted successfully', 'success', 'Balance Updated');
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(msg, 'error', 'Adjustment Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Employee Leave Quota"
      subtitle={`Manual balance adjustment for ${employee.employeeName || employee.fullName} (${employee.employeeId})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Employee:</span>
            <span className="font-bold text-slate-900">{employee.employeeName || employee.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department:</span>
            <span className="font-semibold text-slate-700">{employee.department || employee.departmentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Leave Year:</span>
            <span className="font-mono font-bold text-slate-800">2026</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Leave Type to Adjust <span className="text-rose-500">*</span>
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal bg-white"
          >
            {leaveTypes.map((t) => (
              <option key={t.code} value={t.code}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Adjustment Days (+ to credit, - to debit) <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="0.5"
              required
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
            <span className="text-xs text-slate-500 flex-shrink-0 font-medium">days</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Documented HR Reason / Reference <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Compensatory credit for GMP audit weekend support or statutory tenure accrual..."
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !reason.trim()}
            className="px-5 py-2 bg-bjk-teal hover:bg-bjk-teal-dark disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-bjk-teal/20 transition-all flex items-center space-x-1.5"
          >
            {isSubmitting ? <span>Saving Adjustment...</span> : <span>Confirm Balance Adjustment</span>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdjustBalanceModal;
