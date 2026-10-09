import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  CalendarRange,
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  Repeat,
  Building2,
  Lock
} from 'lucide-react';

export const Rostering = () => {
  const { showToast } = useNotification();
  const [rosters, setRosters] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Assign Shift Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: 'BJK-00101',
    shiftId: '',
    dateString: selectedDate,
    productionLine: 'Solid Oral Compression Line A',
    roleRequirement: 'Certified Cleanroom Operator'
  });

  // Shift Swap Modal
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedRosterForSwap, setSelectedRosterForSwap] = useState(null);
  const [targetSwapEmpId, setTargetSwapEmpId] = useState('BJK-00102');
  const [swapReason, setSwapReason] = useState('');

  const fetchRosterData = async () => {
    try {
      setIsLoading(true);
      const [rosterRes, shiftRes, empRes] = await Promise.all([
        hrmsAPI.getRosters({ startDate: selectedDate, endDate: selectedDate }),
        hrmsAPI.getShifts(),
        hrmsAPI.getEmployees({ limit: 50 })
      ]);

      if (rosterRes.data.success) {
        setRosters(rosterRes.data.rosters);
        setSummary(rosterRes.data.summary);
      }
      if (shiftRes.data.success) {
        setShifts(shiftRes.data.shifts);
        if (shiftRes.data.shifts.length > 0 && !assignForm.shiftId) {
          setAssignForm(prev => ({ ...prev, shiftId: shiftRes.data.shifts[0]._id }));
        }
      }
      if (empRes.data.success) {
        setEmployees(empRes.data.employees);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback rosters:', err.message);
      setRosters([
        {
          _id: 'r-1',
          employeeId: 'BJK-00101',
          employeeName: 'Dr. Vikram Mehta',
          departmentName: 'Quality Assurance',
          shiftName: 'General Shift (09:00 - 18:00)',
          startTime: '09:00',
          endTime: '18:00',
          productionLine: 'QA Oversight Lab',
          validationStatus: 'VALID',
          dateString: selectedDate
        },
        {
          _id: 'r-2',
          employeeId: 'BJK-00102',
          employeeName: 'Priya Sharma',
          departmentName: 'Quality Control',
          shiftName: 'Morning Production Shift (06:00 - 14:30)',
          startTime: '06:00',
          endTime: '14:30',
          productionLine: 'HPLC Lab 2',
          validationStatus: 'WARNING',
          warnings: ['HPLC GLP certification expiring in 14 days'],
          dateString: selectedDate
        },
        {
          _id: 'r-3',
          employeeId: 'BJK-00103',
          employeeName: 'Rajesh Patel',
          departmentName: 'Production Operations',
          shiftName: 'Pharma Night Shift (22:00 - 06:30)',
          startTime: '22:00',
          endTime: '06:30',
          productionLine: 'Solid Oral Compression Line A',
          validationStatus: 'BLOCKED',
          blockingIssues: ['BLOCKING ISSUE: Cleanroom Grade B Operator Authorization expired on 2026-09-14'],
          dateString: selectedDate
        }
      ]);
      setSummary({ totalAssigned: 3, valid: 1, warnings: 1, blocked: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRosterData();
  }, [selectedDate]);

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      const res = await hrmsAPI.assignShift(assignForm);
      if (res.data.success) {
        const val = res.data.validation;
        if (val.isBlocked) {
          showToast(`Assignment BLOCKED: ${val.blockingIssues.join('; ')}`, 'error', 'Compliance Constraint');
        } else if (val.warnings?.length > 0) {
          showToast(`Assigned with WARNING: ${val.warnings.join('; ')}`, 'warning', 'Shift Warning');
        } else {
          showToast('Shift assigned and validated successfully', 'success', 'Validated');
        }
        setIsAssignModalOpen(false);
        fetchRosterData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Assignment Error');
    }
  };

  const handleRequestSwap = async (e) => {
    e.preventDefault();
    try {
      const res = await hrmsAPI.requestShiftSwap({
        rosterId: selectedRosterForSwap._id,
        targetEmployeeId: targetSwapEmpId,
        reason: swapReason
      });
      if (res.data.success) {
        showToast('Shift swap request sent for manager validation', 'success', 'Submitted');
        setIsSwapModalOpen(false);
        setSwapReason('');
        fetchRosterData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Swap Blocked');
    }
  };

  const handleApproveSwap = async (rosterId) => {
    try {
      const res = await hrmsAPI.approveShiftSwap(rosterId, { approved: true });
      if (res.data.success) {
        showToast('Shift swap approved and roster updated', 'success', 'Approved');
        fetchRosterData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.employeeName}</span>
          <span className="text-[11px] font-mono text-slate-400">{row.employeeId} &bull; {row.departmentName}</span>
        </div>
      )
    },
    {
      header: 'Shift & Timing',
      accessor: 'shiftName',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.shiftName}</span>
          <span className="font-mono text-[11px] text-slate-500">{row.startTime} - {row.endTime}</span>
        </div>
      )
    },
    {
      header: 'Production Line / Station',
      accessor: 'productionLine',
      render: (row) => (
        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
          {row.productionLine}
        </span>
      )
    },
    {
      header: 'Validation Engine State',
      accessor: 'validationStatus',
      render: (row) => (
        <div>
          <StatusBadge status={row.validationStatus} />
          {row.blockingIssues?.map((b, idx) => (
            <p key={idx} className="text-[10px] text-rose-600 font-bold mt-1 flex items-start space-x-1">
              <ShieldAlert size={12} className="flex-shrink-0 mt-0.5" />
              <span>{b}</span>
            </p>
          ))}
          {row.warnings?.map((w, idx) => (
            <p key={idx} className="text-[10px] text-amber-600 font-medium mt-0.5 flex items-start space-x-1">
              <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
              <span>{w}</span>
            </p>
          ))}
        </div>
      )
    },
    {
      header: 'Shift Swap',
      accessor: 'swapRequest',
      render: (row) => {
        if (row.swapRequest?.requested) {
          return (
            <div className="text-xs">
              <span className="text-amber-600 font-bold block">Swap Requested:</span>
              <span className="text-slate-600">{row.swapRequest.withEmployeeName}</span>
              {row.swapRequest.status === 'PENDING' && (
                <button
                  onClick={() => handleApproveSwap(row._id)}
                  className="mt-1 text-[11px] px-2 py-0.5 bg-bjk-teal text-white rounded font-semibold hover:bg-bjk-teal-dark block"
                >
                  Approve Swap
                </button>
              )}
            </div>
          );
        }
        return (
          <button
            onClick={() => {
              setSelectedRosterForSwap(row);
              setIsSwapModalOpen(true);
            }}
            className="flex items-center space-x-1 text-slate-500 hover:text-bjk-teal text-xs font-semibold"
          >
            <Repeat size={13} />
            <span>Request Swap</span>
          </button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Intelligent Workforce Rostering</h1>
            <span className="text-xs font-bold text-bjk-purple bg-purple-100 text-bjk-purple px-2.5 py-0.5 rounded-full">
              Automated Validation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pre-flight constraint solver: detects skill gaps, expired GMP credentials, rest period violations, and shift conflicts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setAssignForm(prev => ({ ...prev, dateString: e.target.value }));
            }}
            className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:border-bjk-teal"
          />

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Plus size={15} />
            <span>Assign Shift</span>
          </button>
        </div>
      </div>

      {/* Roster Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Scheduled</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{summary.totalAssigned ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 text-xs">
          <span className="text-emerald-700 uppercase font-semibold text-[10px]">Statutory Compliant</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{summary.valid ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/20 text-xs">
          <span className="text-amber-700 uppercase font-semibold text-[10px]">With Warnings</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{summary.warnings ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/20 text-xs">
          <span className="text-rose-700 uppercase font-semibold text-[10px]">Blocked Assignments</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{summary.blocked ?? 0}</p>
        </div>
      </div>

      {/* Roster Table */}
      <DataTable
        columns={columns}
        data={rosters}
        isLoading={isLoading}
      />

      {/* Assign Shift Modal with Pre-flight Validation */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Employee to Roster"
        subtitle="Automatic validation against credentials, leaves, and rest intervals"
      >
        <form onSubmit={handleAssignShift} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee *</label>
            <select
              value={assignForm.employeeId}
              onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp.employeeId}>
                  {emp.fullName} ({emp.employeeId}) - {emp.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shift *</label>
            <select
              value={assignForm.shiftId}
              onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            >
              {shifts.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date *</label>
              <input
                type="date"
                required
                value={assignForm.dateString}
                onChange={(e) => setAssignForm({ ...assignForm, dateString: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Production Station / Line</label>
              <input
                type="text"
                value={assignForm.productionLine}
                onChange={(e) => setAssignForm({ ...assignForm, productionLine: e.target.value })}
                placeholder="e.g. Line 1 Compression"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
            <span className="font-bold flex items-center space-x-1">
              <ShieldAlert size={14} />
              <span>Pharma Pre-flight Enforcement:</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              If the selected employee has an expired GMP credential or less than 11 hours rest period from their previous shift, the system will flag a <strong>BLOCKING ISSUE</strong> and withhold roster publication.
            </p>
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
              Validate & Assign
            </button>
          </div>
        </form>
      </Modal>

      {/* Shift Swap Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Shift Swap Request"
        subtitle={`Request shift exchange for ${selectedRosterForSwap?.employeeName}`}
      >
        <form onSubmit={handleRequestSwap} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Swap With Colleague *</label>
            <select
              value={targetSwapEmpId}
              onChange={(e) => setTargetSwapEmpId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            >
              {employees
                .filter(e => e.employeeId !== selectedRosterForSwap?.employeeId)
                .map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.fullName} ({emp.employeeId}) - {emp.departmentName}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Swap *</label>
            <textarea
              required
              rows={3}
              value={swapReason}
              onChange={(e) => setSwapReason(e.target.value)}
              placeholder="e.g. Mutual accommodation for continuous shift coverage..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSwapModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Submit Swap Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
