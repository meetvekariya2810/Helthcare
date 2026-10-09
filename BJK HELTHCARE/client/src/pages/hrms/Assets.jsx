import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Boxes, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export const Assets = () => {
  const { showToast } = useNotification();
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState('BJK-00101');

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const res = await hrmsAPI.getAssets();
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback assets:', err.message);
      setAssets([
        {
          _id: 'ast-1',
          assetTag: 'BJK-IT-0042',
          name: 'ThinkPad T14s Quality Terminal',
          category: 'IT_HARDWARE',
          assignedEmployeeName: 'Dr. Vikram Mehta',
          condition: 'EXCELLENT',
          status: 'ASSIGNED'
        },
        {
          _id: 'ast-2',
          assetTag: 'BJK-LAB-0019',
          name: 'Handheld Cleanroom Airborne Particle Counter',
          category: 'LAB_EQUIPMENT',
          assignedEmployeeName: 'Rajesh Patel',
          condition: 'GOOD',
          status: 'ASSIGNED'
        },
        {
          _id: 'ast-3',
          assetTag: 'BJK-IT-0088',
          name: 'Dell Latitude Analytical Workstation',
          category: 'IT_HARDWARE',
          assignedEmployeeName: '',
          condition: 'EXCELLENT',
          status: 'AVAILABLE'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await hrmsAPI.assignAsset({
        assetId: selectedAsset._id,
        employeeId: assignEmpId
      });
      if (res.data.success) {
        showToast('Asset assigned successfully', 'success', 'Assigned');
        setIsAssignModalOpen(false);
        fetchAssets();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const columns = [
    {
      header: 'Asset Tag',
      accessor: 'assetTag',
      render: (row) => <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{row.assetTag}</span>
    },
    {
      header: 'Equipment / Asset Name',
      accessor: 'name',
      render: (row) => <span className="font-bold text-slate-900">{row.name}</span>
    },
    {
      header: 'Category',
      accessor: 'category',
      render: (row) => <span className="text-xs text-slate-600 bg-slate-50 border px-2 py-0.5 rounded">{row.category}</span>
    },
    {
      header: 'Assigned To',
      accessor: 'assignedEmployeeName',
      render: (row) => (
        <span className="font-semibold text-slate-800">
          {row.assignedEmployeeName || <em className="text-slate-400 font-normal">Unassigned</em>}
        </span>
      )
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
        row.status === 'AVAILABLE' ? (
          <button
            onClick={() => {
              setSelectedAsset(row);
              setIsAssignModalOpen(true);
            }}
            className="px-2.5 py-1 bg-bjk-teal text-white rounded-lg text-xs font-semibold hover:bg-bjk-teal-dark"
          >
            Assign
          </button>
        ) : (
          <span className="text-xs text-slate-400">Assigned</span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Enterprise Asset Custody</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking custody of IT hardware, testing instruments, lab monitors, and sterile tools.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        isLoading={isLoading}
      />

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Asset Custody"
        subtitle={`Allocate ${selectedAsset?.name} (${selectedAsset?.assetTag})`}
      >
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
            <input
              type="text"
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              placeholder="e.g. BJK-00102"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Confirm Handover
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
