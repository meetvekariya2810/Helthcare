import React, { useState, useEffect } from 'react';
import { hrmsAPI, downloadBlobFile } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';
import {
  CreditCard,
  FileSpreadsheet,
  CheckCircle,
  FileDown,
  Lock,
  Plus,
  Building2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

export const Payroll = () => {
  const { user, can } = useAuth();
  const { showToast } = useNotification();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2026-09');
  const [isLoading, setIsLoading] = useState(true);

  // Process Payroll Modal
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processMonth, setProcessMonth] = useState(9);
  const [processYear, setProcessYear] = useState(2026);
  const [processTarget, setProcessTarget] = useState('ALL');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [employeesList, setEmployeesList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Payslip Preview Modal
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const res = await hrmsAPI.getEmployees({ limit: 300 });
        if (res.data?.success && Array.isArray(res.data.employees)) {
          setEmployeesList(res.data.employees);
        }
      } catch (_) {}
    };
    loadEmployees();
  }, []);

  const fetchPayroll = async () => {
    try {
      setIsLoading(true);
      const res = await hrmsAPI.getPayrollRuns({ payPeriod: selectedPeriod });
      if (res.data.success) {
        setRecords(res.data.records || []);
        setSummary(res.data.summary || null);
      } else {
        setRecords([]);
        setSummary(null);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: No payroll records found:', err.message);
      setRecords([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [selectedPeriod]);

  const handleProcessPayroll = async (e) => {
    e.preventDefault();
    if (processTarget === 'SPECIFIC' && !targetEmployeeId) {
      showToast('Please select an employee for the payroll run', 'error', 'Validation');
      return;
    }
    try {
      setIsProcessing(true);
      const payload = {
        month: processMonth,
        year: processYear,
        employeeId: processTarget === 'SPECIFIC' ? targetEmployeeId : 'ALL'
      };
      const res = await hrmsAPI.processPayroll(payload);
      if (res.data.success) {
        showToast(res.data.message || 'Payroll generated successfully', 'success', 'Processed');
        setIsProcessModalOpen(false);
        fetchPayroll();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Processing Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePayroll = async (id, empName) => {
    if (!window.confirm(`Are you sure you want to remove the payroll entry for ${empName || 'this employee'}?`)) {
      return;
    }
    try {
      const res = await hrmsAPI.deletePayroll(id);
      if (res.data.success) {
        showToast(res.data.message || 'Payroll record removed', 'success', 'Removed');
        fetchPayroll();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Delete Failed');
    }
  };

  const handleClearBatch = async () => {
    if (!window.confirm(`Are you sure you want to remove all payroll entries for period ${selectedPeriod}? This will remove payslips from employee dashboards.`)) {
      return;
    }
    try {
      const res = await hrmsAPI.deletePayrollBatch(selectedPeriod);
      if (res.data.success) {
        showToast(res.data.message || `Cleared payroll entries for ${selectedPeriod}`, 'success', 'Cleared');
        fetchPayroll();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Clear Failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await hrmsAPI.approvePayroll(id, { status: 'APPROVED' });
      if (res.data.success) {
        showToast('Payslip approved for disbursement', 'success', 'Approved');
        fetchPayroll();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleDownloadPDF = async (id, empId, period) => {
    try {
      showToast('Generating official BJK Payslip PDF...', 'info', 'Generating');
      const res = await hrmsAPI.downloadPayslipPDF(id);
      downloadBlobFile(res.data, `BJK_Payslip_${empId || 'Employee'}_${period || 'Period'}.pdf`);
      showToast('Payslip PDF downloaded successfully', 'success', 'Downloaded');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to download PDF payslip', 'error', 'Download Failed');
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employeeId',
      render: (row) => <span className="font-mono font-bold text-slate-800">{row.employeeId}</span>
    },
    {
      header: 'Employee Name',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.employeeName}</span>
          <span className="text-[11px] text-slate-400">{row.departmentName} &bull; {row.designationTitle}</span>
        </div>
      )
    },
    {
      header: 'Gross Earnings',
      accessor: 'grossEarnings',
      render: (row) => (
        <span className="font-semibold text-slate-900 font-mono">
          ₹{row.grossEarnings?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Statutory Deductions',
      accessor: 'totalDeductions',
      render: (row) => (
        <span className="font-semibold text-rose-600 font-mono">
          -₹{row.totalDeductions?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Net Take Home Pay',
      accessor: 'netPay',
      render: (row) => (
        <span className="font-bold text-emerald-700 font-mono text-sm">
          ₹{row.netPay?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Company CTC',
      accessor: 'totalCompanyCost',
      render: (row) => (
        <span className="font-mono text-slate-500 text-xs">
          ₹{row.totalCompanyCost?.toLocaleString('en-IN')}
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
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => handleDownloadPDF(row._id, row.employeeId, row.payPeriod)}
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Download Official PDF Payslip"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => {
              setSelectedPayslip(row);
              setIsPayslipModalOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-bjk-teal hover:bg-slate-100 rounded-lg transition-colors"
            title="View Official Payslip"
          >
            <Eye size={15} />
          </button>
          {row.status === 'CALCULATED' && (
            <button
              onClick={() => handleApprove(row._id)}
              className="text-xs px-2.5 py-1 bg-bjk-teal text-white rounded-lg font-semibold hover:bg-bjk-teal-dark shadow-xs"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => handleDeletePayroll(row._id, row.employeeName)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Remove Payroll Entry"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Statutory Payroll & Compensation</h1>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck size={12} />
              <span>India Statutory Compliant</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated integration of attendance, overtime, night differentials, EPF (12%), ESI, and Professional Tax.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {records.length > 0 && (
            <button
              onClick={handleClearBatch}
              className="flex items-center space-x-1.5 px-3 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              title="Remove all payroll entries for this period"
            >
              <Trash2 size={14} />
              <span>Clear Period Batch</span>
            </button>
          )}

          <a
            href={hrmsAPI.exportReport('PAYROLL', 'csv')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <FileDown size={15} />
            <span>Export Report</span>
          </a>

          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Plus size={15} />
            <span>Process Monthly Payroll</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Gross Disbursable</span>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{summary.totalGross?.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Net Bank Payout</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">₹{summary.totalNet?.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Statutory Deductions (EPF/PT)</span>
            <p className="text-2xl font-black text-rose-600 mt-1">₹{summary.totalDeductions?.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Company CTC Cost</span>
            <p className="text-2xl font-black text-slate-800 mt-1">₹{summary.totalCompanyCost?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      {/* Pay Period Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-semibold">Pay Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-bjk-teal"
          >
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
          </select>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Strict RBAC Enforced: Non-payroll personnel cannot view confidential salary details.
        </div>
      </div>

      {/* Payroll Table */}
      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
      />

      {/* Process Payroll Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="Execute Monthly Payroll Batch"
        subtitle="Calculates gross wages, statutory EPF/ESI, overtime and night differentials"
      >
        <form onSubmit={handleProcessPayroll} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Generation Scope *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProcessTarget('ALL')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  processTarget === 'ALL'
                    ? 'bg-bjk-teal text-white border-bjk-teal shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Active Employees
              </button>
              <button
                type="button"
                onClick={() => setProcessTarget('SPECIFIC')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                  processTarget === 'SPECIFIC'
                    ? 'bg-bjk-teal text-white border-bjk-teal shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Specific Employee
              </button>
            </div>
          </div>

          {processTarget === 'SPECIFIC' && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Select Employee *</label>
              <select
                value={targetEmployeeId}
                onChange={(e) => setTargetEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal font-medium"
                required
              >
                <option value="">-- Choose Employee --</option>
                {employeesList.map((emp) => (
                  <option key={emp._id} value={emp.employeeId}>
                    {emp.employeeId} - {emp.fullName} ({emp.department || emp.departmentName || 'Operations'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Month *</label>
              <select
                value={processMonth}
                onChange={(e) => setProcessMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              >
                <option value={9}>September (09)</option>
                <option value={10}>October (10)</option>
                <option value={11}>November (11)</option>
                <option value={12}>December (12)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year *</label>
              <input
                type="number"
                value={processYear}
                onChange={(e) => setProcessYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
            <span className="font-bold flex items-center space-x-1">
              <CheckCircle size={14} className="text-emerald-600" />
              <span>Automated Rules Verified:</span>
            </span>
            <ul className="text-[11px] list-disc list-inside space-y-0.5 text-emerald-800">
              <li>EPF: 12% on Basic up to wage ceiling threshold of ₹15,000</li>
              <li>ESI: 0.75% deduction for employees with gross ≤ ₹21,000</li>
              <li>Professional Tax: ₹200/mo state slab</li>
              <li>Attendance proration & overtime multiplier 1.5x / 2.0x</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProcessModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              {isProcessing ? 'Computing Batch...' : 'Execute Calculation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Payslip Preview Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={isPayslipModalOpen}
          onClose={() => setIsPayslipModalOpen(false)}
          title="Official Payslip"
          subtitle={`Disbursement record for ${selectedPayslip.payPeriod}`}
        >
          <div className="space-y-6 text-xs">
            {/* Payslip Header with Logo */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <img
                  src={bjkLogo}
                  alt="BJK Healthcare"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    if (e.currentTarget.src !== window.location.origin + '/bjk-healthcare-logo.svg') {
                      e.currentTarget.src = '/bjk-healthcare-logo.svg';
                    }
                  }}
                />
                <div>
                  <h4 className="font-black text-slate-900 text-sm">BJK HEALTHCARE LIMITED</h4>
                  <p className="text-[10px] text-slate-400">Unit 1 - Formulations Facility, Sanand GIDC, Ahmedabad</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 block text-xs">PAYSLIP FOR {selectedPayslip.payPeriod}</span>
                <span className="text-[10px] text-slate-400">Status: {selectedPayslip.status}</span>
              </div>
            </div>

            {/* Employee Particulars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-400 block">Employee ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPayslip.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Name:</span>
                <span className="font-bold text-slate-800">{selectedPayslip.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Department:</span>
                <span className="font-semibold text-slate-800">{selectedPayslip.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Designation:</span>
                <span className="font-semibold text-slate-800">{selectedPayslip.designationTitle}</span>
              </div>
            </div>

            {/* Earnings vs Deductions Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              {/* Earnings */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                  Earnings Breakdown
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Pay:</span>
                    <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.basic?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">HRA:</span>
                    <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.hra?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special Allowance:</span>
                    <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.specialAllowance?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transport Allowance:</span>
                    <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.transportAllowance?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Medical Allowance:</span>
                    <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.medicalAllowance?.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedPayslip.earnings?.overtimePay > 0 && (
                    <div className="flex justify-between text-cyan-700">
                      <span>Overtime Pay:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.overtimePay?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedPayslip.earnings?.nightDifferentialAllowance > 0 && (
                    <div className="flex justify-between text-purple-700">
                      <span>Night Shift Differential:</span>
                      <span className="font-mono font-semibold">₹{selectedPayslip.earnings?.nightDifferentialAllowance?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-emerald-50 border-t border-slate-200 flex justify-between font-bold text-emerald-900">
                  <span>Gross Earnings:</span>
                  <span className="font-mono">₹{selectedPayslip.grossEarnings?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2.5 bg-slate-100 font-bold text-slate-800 border-b border-slate-200">
                  Statutory Deductions
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (EPF):</span>
                    <span className="font-mono font-semibold text-rose-600">₹{selectedPayslip.deductions?.providentFund?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ESI (Health Insurance):</span>
                    <span className="font-mono font-semibold text-rose-600">₹{selectedPayslip.deductions?.employeeStateInsurance?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Professional Tax (PT):</span>
                    <span className="font-mono font-semibold text-rose-600">₹{selectedPayslip.deductions?.professionalTax?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Income Tax (TDS):</span>
                    <span className="font-mono font-semibold text-rose-600">₹{selectedPayslip.deductions?.taxDeductedAtSource?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-rose-50 border-t border-slate-200 flex justify-between font-bold text-rose-900">
                  <span>Total Deductions:</span>
                  <span className="font-mono">₹{selectedPayslip.totalDeductions?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Net Payout Box */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-emerald-800 font-bold uppercase tracking-wider text-[10px]">Net Disbursable Salary</span>
                <p className="text-xs text-emerald-700">Transferred electronically to bank account</p>
              </div>
              <span className="text-2xl font-black text-emerald-800 font-mono">
                ₹{selectedPayslip.netPay?.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Download Official PDF Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleDownloadPDF(selectedPayslip._id, selectedPayslip.employeeId, selectedPayslip.payPeriod)}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all"
              >
                <Download size={18} className="text-bjk-teal" />
                <span>Download Official BJK Salary Slip (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
