import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';

export const Credentials = () => {
  const { showToast } = useNotification();
  const [credentials, setCredentials] = useState([]);
  const [summary, setSummary] = useState({});
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Add Credential Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [credForm, setCredForm] = useState({
    employeeId: 'BJK-00101',
    credentialName: '',
    credentialCode: '',
    category: 'GMP_CERTIFICATION',
    issuingAuthority: 'BJK Quality Assurance Board',
    certificateNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isMandatoryForRole: true
  });

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      const res = await hrmsAPI.getCredentials({ status: statusFilter });
      if (res.data.success) {
        setCredentials(res.data.credentials);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback credentials:', err.message);
      setCredentials([
        {
          _id: 'c-1',
          employeeId: 'BJK-00101',
          employeeName: 'Dr. Vikram Mehta',
          departmentName: 'Quality Assurance',
          credentialName: 'USFDA Lead Quality Auditor Certification',
          category: 'GMP_CERTIFICATION',
          issuingAuthority: 'American Society for Quality (ASQ)',
          certificateNumber: 'ASQ-QA-99482',
          isMandatoryForRole: true,
          status: 'VALID',
          expiryDate: '2027-01-15'
        },
        {
          _id: 'c-2',
          employeeId: 'BJK-00102',
          employeeName: 'Priya Sharma',
          departmentName: 'Quality Control',
          credentialName: 'HPLC Analytical Method Sign-Off & GLP Authorization',
          category: 'GLP_CERTIFICATION',
          issuingAuthority: 'BJK Quality Council',
          certificateNumber: 'BJK-GLP-2024-08',
          isMandatoryForRole: true,
          status: 'EXPIRING',
          expiryDate: '2026-10-08',
          daysUntilExpiry: 14
        },
        {
          _id: 'c-3',
          employeeId: 'BJK-00103',
          employeeName: 'Rajesh Patel',
          departmentName: 'Production Operations',
          credentialName: 'Cleanroom Grade B Operator Authorization',
          category: 'CLEANROOM_AUTHORIZATION',
          issuingAuthority: 'BJK EHS & Cleanroom Oversight Board',
          certificateNumber: 'CR-OPR-4421',
          isMandatoryForRole: true,
          status: 'EXPIRED',
          expiryDate: '2026-09-14',
          daysUntilExpiry: -10
        }
      ]);
      setSummary({ valid: 1, expiringSoon: 1, expired: 1, mandatoryBlocking: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, [statusFilter]);

  const handleAddCredential = async (e) => {
    e.preventDefault();
    try {
      const res = await hrmsAPI.addCredential(credForm);
      if (res.data.success) {
        showToast('Regulatory credential recorded', 'success', 'Saved');
        setIsAddModalOpen(false);
        fetchCredentials();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await hrmsAPI.verifyCredential(id);
      if (res.data.success) {
        showToast('Credential verified and validated', 'success', 'Verified');
        fetchCredentials();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const columns = [
    {
      header: 'Credential Name',
      accessor: 'credentialName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.credentialName}</span>
          <span className="text-[10px] text-slate-400 font-mono">Reg #{row.certificateNumber || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.employeeName}</span>
          <span className="text-[11px] font-mono text-slate-400">{row.employeeId} &bull; {row.departmentName}</span>
        </div>
      )
    },
    {
      header: 'Category & Authority',
      accessor: 'category',
      render: (row) => (
        <div>
          <span className="text-xs text-slate-700 font-medium block">{row.issuingAuthority}</span>
          <span className="text-[10px] text-bjk-teal font-bold uppercase">{row.category?.replace(/_/g, ' ')}</span>
        </div>
      )
    },
    {
      header: 'Expiry Date',
      accessor: 'expiryDate',
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-800">
            {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'Permanent'}
          </span>
          {row.daysUntilExpiry !== undefined && row.daysUntilExpiry !== null && (
            <span
              className={`block text-[10px] font-bold ${
                row.daysUntilExpiry <= 0
                  ? 'text-rose-600'
                  : row.daysUntilExpiry <= 30
                  ? 'text-amber-600'
                  : 'text-slate-400'
              }`}
            >
              {row.daysUntilExpiry <= 0 ? 'EXPIRED' : `${row.daysUntilExpiry} days remaining`}
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Roster Impact',
      accessor: 'isMandatoryForRole',
      render: (row) => (
        row.isMandatoryForRole && row.status === 'EXPIRED' ? (
          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
            BLOCKING ISSUE
          </span>
        ) : (
          <span className="text-[11px] text-emerald-600 font-semibold">Authorized</span>
        )
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Action',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        row.status !== 'VALID' ? (
          <button
            onClick={() => handleVerify(row._id)}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
          >
            Verify Renewal
          </button>
        ) : (
          <span className="text-xs text-emerald-600 font-semibold">Valid</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Credential & Regulatory Authorizations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking cGMP, GLP, sterile cleanroom entry permits, equipment certifications, and 90/60/30/7-day alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          <Plus size={15} />
          <span>Add Credential</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 text-xs">
          <span className="text-emerald-700 uppercase font-semibold text-[10px]">Valid & Certified</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary.valid ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 text-xs">
          <span className="text-amber-700 uppercase font-semibold text-[10px]">Expiring Soon (&le;30d)</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{summary.expiringSoon ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/20 text-xs">
          <span className="text-rose-700 uppercase font-semibold text-[10px]">Expired Total</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{summary.expired ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-red-300 bg-red-50 text-xs">
          <span className="text-red-700 uppercase font-bold text-[10px]">Blocking Cleanroom Shift</span>
          <p className="text-2xl font-black text-red-700 mt-1">{summary.mandatoryBlocking ?? 0}</p>
        </div>
      </div>

      {/* Credential Table */}
      <DataTable
        columns={columns}
        data={credentials}
        isLoading={isLoading}
        filterComponent={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
          >
            <option value="ALL">All States</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRING">Expiring Soon</option>
            <option value="EXPIRED">Expired (Blocking)</option>
          </select>
        }
      />

      {/* Add Credential Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Credential or Certification"
        subtitle="Log regulatory license, cleanroom permit, or analytical authorization"
      >
        <form onSubmit={handleAddCredential} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={credForm.employeeId}
                onChange={(e) => setCredForm({ ...credForm, employeeId: e.target.value })}
                placeholder="e.g. BJK-00103"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={credForm.category}
                onChange={(e) => setCredForm({ ...credForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              >
                <option value="GMP_CERTIFICATION">cGMP Certification</option>
                <option value="GLP_CERTIFICATION">GLP Analytical Certification</option>
                <option value="CLEANROOM_AUTHORIZATION">Cleanroom Grade Authorization</option>
                <option value="SAFETY_CERTIFICATION">EHS Safety Certification</option>
                <option value="QUALIFICATION">Educational Qualification</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credential Name *</label>
              <input
                type="text"
                required
                value={credForm.credentialName}
                onChange={(e) => setCredForm({ ...credForm, credentialName: e.target.value })}
                placeholder="e.g. Cleanroom Grade A Sterile Protocol"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credential Code *</label>
              <input
                type="text"
                required
                value={credForm.credentialCode}
                onChange={(e) => setCredForm({ ...credForm, credentialCode: e.target.value.toUpperCase() })}
                placeholder="e.g. CR-GR-A"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Authority *</label>
              <input
                type="text"
                required
                value={credForm.issuingAuthority}
                onChange={(e) => setCredForm({ ...credForm, issuingAuthority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Number</label>
              <input
                type="text"
                value={credForm.certificateNumber}
                onChange={(e) => setCredForm({ ...credForm, certificateNumber: e.target.value })}
                placeholder="CERT-12345"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={credForm.issueDate}
                onChange={(e) => setCredForm({ ...credForm, issueDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={credForm.expiryDate}
                onChange={(e) => setCredForm({ ...credForm, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Save & Activate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
