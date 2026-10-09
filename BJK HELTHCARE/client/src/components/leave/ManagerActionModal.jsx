import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { leaveAPI } from '../../services/api';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, User } from 'lucide-react';

export const ManagerActionModal = ({
  isOpen,
  onClose,
  onSuccess,
  request,
  actionType, // 'TEAM_APPROVE', 'TEAM_REJECT', 'DEPT_APPROVE', 'DEPT_REJECT', 'HR_APPROVE', 'HR_REJECT'
  userRole
}) => {
  const { showToast } = useNotification();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!request) return null;

  const isReject = actionType.includes('REJECT');
  const stageName = actionType.startsWith('TEAM')
    ? 'Team Manager Review'
    : actionType.startsWith('DEPT')
    ? 'Department Head Review'
    : 'HR Compliance Review';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReject && (!comment || !comment.trim())) {
      showToast('A documented reason is mandatory when rejecting a leave application.', 'error', 'Reason Required');
      return;
    }

    try {
      setIsSubmitting(true);
      let res;
      if (actionType === 'TEAM_APPROVE') {
        res = await leaveAPI.teamApprove(request._id || request.requestId, { comment });
      } else if (actionType === 'TEAM_REJECT') {
        res = await leaveAPI.teamReject(request._id || request.requestId, { reason: comment, comment });
      } else if (actionType === 'DEPT_APPROVE') {
        res = await leaveAPI.deptApprove(request._id || request.requestId, { comment });
      } else if (actionType === 'DEPT_REJECT') {
        res = await leaveAPI.deptReject(request._id || request.requestId, { reason: comment, comment });
      } else if (actionType === 'HR_APPROVE') {
        res = await leaveAPI.hrApprove(request._id || request.requestId, { comment });
      } else if (actionType === 'HR_REJECT') {
        res = await leaveAPI.hrReject(request._id || request.requestId, { reason: comment, comment });
      }

      if (res?.data?.success) {
        showToast(res.data.message || 'Action executed successfully', 'success', 'Decision Recorded');
        onSuccess?.();
        onClose?.();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(msg, 'error', 'Action Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isReject ? 'Reject' : 'Approve'} Leave Request — ${stageName}`}
      subtitle={`Application ${request.requestId} for ${request.employeeName} (${request.employeeId})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Briefing Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{request.employeeName}</span>
            <span className="font-mono text-slate-500">{request.department}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Leave Type</span>
              <span className="font-semibold text-slate-800">{request.leaveTypeName || request.leaveType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
              <span className="font-semibold text-slate-800">
                {request.duration || request.totalDays} day(s) ({request.startDateString} &rarr; {request.endDateString})
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason Provided</span>
            <p className="text-slate-700 italic bg-white p-2 rounded border border-slate-100 mt-0.5">
              "{request.reason}"
            </p>
          </div>
        </div>

        {/* Action Description / Warning */}
        {isReject ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-rose-800 text-xs">
            <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Rejection Policy Notice</span>
              <span>
                Rejecting this application will terminate the workflow, immediately release reserved leave balance, and notify the employee with the reason below.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-emerald-800 text-xs">
            <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Approval Confirmation</span>
              <span>
                {actionType === 'TEAM_APPROVE'
                  ? 'Approving will forward this request to the Department Head for stage 2 evaluation.'
                  : actionType === 'DEPT_APPROVE'
                  ? 'Approving will forward this request to HR Master Review for final compliance sanction.'
                  : 'Final approval will deduct the employee leave balance and update the enterprise roster.'}
              </span>
            </div>
          </div>
        )}

        {/* Comment or Mandatory Rejection Reason */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            {isReject ? 'Documented Rejection Reason *' : 'Reviewer Note / Handover Remark (Optional)'}
          </label>
          <textarea
            required={isReject}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              isReject
                ? 'State the official operational or compliance justification for rejection...'
                : 'Add any team coverage remarks or handover notes...'
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
          />
        </div>

        {/* Actions */}
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
            disabled={isSubmitting || (isReject && !comment.trim())}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center space-x-1.5 ${
              isReject
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 disabled:bg-slate-300'
                : 'bg-bjk-teal hover:bg-bjk-teal-dark shadow-bjk-teal/20 disabled:bg-slate-300'
            }`}
          >
            {isSubmitting ? (
              <span>Recording Decision...</span>
            ) : (
              <span>{isReject ? 'Confirm Rejection' : 'Confirm Approval'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ManagerActionModal;
