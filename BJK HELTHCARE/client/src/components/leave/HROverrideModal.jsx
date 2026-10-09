import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { leaveAPI } from '../../services/api';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const HROverrideModal = ({ isOpen, onClose, onSuccess, request }) => {
  const { showToast } = useNotification();
  const [targetStatus, setTargetStatus] = useState('APPROVED');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !reason.trim()) {
      showToast('A documented administrative justification is mandatory for HR overrides.', 'error', 'Justification Required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await leaveAPI.hrOverride(request._id || request.requestId, {
        targetStatus,
        reason
      });

      if (res.data.success) {
        showToast(res.data.message || 'HR Administrative Override executed successfully', 'success', 'Override Recorded');
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(msg, 'error', 'Override Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="HR Administrative Workflow Override"
      subtitle={`Executive Authority Override for Request [${request.requestId}]`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start space-x-3 text-amber-900 text-xs">
          <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-900">Audit-Controlled Executive Action</span>
            <span className="text-amber-800 text-[11px] leading-relaxed">
              This action will bypass standard workflow approvals (Team Manager / Department Head) or overturn previous determinations. An immutable audit record will be logged with your timestamp, IP, and justification.
            </span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Employee:</span>
            <span className="font-bold text-slate-800">{request.employeeName} ({request.employeeId})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Workflow State:</span>
            <span className="font-mono font-bold text-slate-700">{request.currentStatus || request.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Duration & Dates:</span>
            <span className="font-semibold text-slate-800">{request.duration || request.totalDays} days ({request.startDateString} &rarr; {request.endDateString})</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Desired Target Status <span className="text-rose-500">*</span>
          </label>
          <select
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal bg-white"
          >
            <option value="APPROVED">Force Sanction / Direct Approval (APPROVED)</option>
            <option value="REJECTED">Administrative Rejection (REJECTED)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mandatory Override Justification <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Document executive reason, e.g. 'Department Head unavailable; approved per documented Director instruction'..."
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
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center space-x-1.5"
          >
            {isSubmitting ? <span>Logging Override...</span> : <span>Execute Administrative Override</span>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HROverrideModal;
