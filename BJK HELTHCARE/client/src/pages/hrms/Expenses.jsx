import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Receipt, Plus, CheckCircle, XCircle } from 'lucide-react';

export const Expenses = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({
    title: '',
    category: 'TRAVEL_LOCAL',
    expenseDate: new Date().toISOString().split('T')[0],
    amount: '',
    description: ''
  });

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await hrmsAPI.getExpenses();
      if (res.data.success) {
        setExpenses(res.data.expenses);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback expenses:', err.message);
      setExpenses([
        {
          _id: 'exp-1',
          claimNumber: 'BJK-EXP-0101',
          employeeName: 'Dr. Vikram Mehta',
          employeeId: 'BJK-00101',
          title: 'USFDA Audit Regulatory Consultation Travel',
          category: 'TRAVEL_DOMESTIC',
          expenseDate: '2026-09-12',
          amount: 8500,
          status: 'APPROVED_BY_FINANCE'
        },
        {
          _id: 'exp-2',
          claimNumber: 'BJK-EXP-0102',
          employeeName: 'Priya Sharma',
          employeeId: 'BJK-00102',
          title: 'HPLC Column Consumables Urgent Purchase',
          category: 'LAB_SUPPLIES',
          expenseDate: '2026-09-20',
          amount: 3200,
          status: 'SUBMITTED'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleClaim = async (e) => {
    e.preventDefault();
    try {
      const res = await hrmsAPI.createExpense({
        ...claimForm,
        amount: Number(claimForm.amount),
        employeeId: user?.employeeId || 'BJK-00101'
      });
      if (res.data.success) {
        showToast('Expense claim filed successfully', 'success', 'Submitted');
        setIsClaimModalOpen(false);
        fetchExpenses();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      const res = await hrmsAPI.updateExpenseStatus(id, { status });
      if (res.data.success) {
        showToast(`Expense ${status.toLowerCase()}`, 'success', 'Updated');
        fetchExpenses();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const columns = [
    {
      header: 'Claim Ref',
      accessor: 'claimNumber',
      render: (row) => <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{row.claimNumber}</span>
    },
    {
      header: 'Claim Title',
      accessor: 'title',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.title}</span>
          <span className="text-[11px] text-slate-400">{row.employeeName} &bull; {row.departmentName}</span>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-xs text-slate-600 bg-slate-50 border px-2 py-0.5 rounded">{row.category}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (row) => <span className="font-bold text-slate-900 font-mono">₹{row.amount?.toLocaleString('en-IN')}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        row.status === 'SUBMITTED' ? (
          <div className="flex items-center justify-end space-x-1">
            <button
              onClick={() => handleApprove(row._id, 'APPROVED_BY_FINANCE')}
              className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
              title="Approve"
            >
              <CheckCircle size={15} />
            </button>
            <button
              onClick={() => handleApprove(row._id, 'REJECTED')}
              className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded"
              title="Reject"
            >
              <XCircle size={15} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Processed</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Travel & Operational Expenses</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reimbursement claims for travel, laboratory supplies, client audits, and operational exigencies.
          </p>
        </div>

        <button
          onClick={() => setIsClaimModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          <Plus size={15} />
          <span>Submit Claim</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="File Expense Reimbursement"
        subtitle="Submit claim with invoice details for manager and finance review"
      >
        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              value={claimForm.title}
              onChange={(e) => setClaimForm({ ...claimForm, title: e.target.value })}
              placeholder="e.g. Travel to Vendor Sterile Packaging Facility"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={claimForm.category}
                onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              >
                <option value="TRAVEL_LOCAL">Local Travel</option>
                <option value="TRAVEL_DOMESTIC">Domestic Travel</option>
                <option value="LAB_SUPPLIES">Lab Supplies & Reagents</option>
                <option value="FOOD_CLIENT_MEETING">Client & Auditor Hospitality</option>
                <option value="TRAINING_CERTIFICATION">Training Certification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={claimForm.amount}
                onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                placeholder="4500"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={claimForm.description}
              onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
              placeholder="Brief description of the operational expense..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClaimModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Submit Claim
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
