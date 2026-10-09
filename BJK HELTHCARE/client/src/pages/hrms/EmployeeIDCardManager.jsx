import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Layers,
  FileCheck,
  Users,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { EmployeeIdCardModal } from '../../components/hrms/EmployeeIdCardModal';
import {
  generateEmployeeIdCardPdf,
  generateBulkIdCardPdf,
  printEmployeeIdCard
} from '../../components/hrms/idcard/idCardUtils';

export const EmployeeIDCardManager = () => {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    generated: 0,
    pending: 0,
    missingPhoto: 0,
    updateRequired: 0
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);

  // Modal Preview
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchIdCards();
  }, [selectedDept, selectedStatus]);

  const fetchIdCards = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedDept !== 'All') params.append('department', selectedDept);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);

      const res = await fetch(`/api/employees/id-cards?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCards(data.cards || []);
        if (data.stats) setStats(data.stats);
        if (data.departments) setDepartments(data.departments);
      }
    } catch (err) {
      console.error('Error loading ID cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIdCards();
  };

  // Selection toggles
  const handleToggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === cards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cards.map((c) => c._id)));
    }
  };

  // Bulk Generate All
  const handleGenerateAll = async () => {
    if (!window.confirm(`Generate official ID cards for all ${stats.totalEmployees} employees?`)) return;

    setIsBulkGenerating(true);
    try {
      const res = await fetch('/api/employees/id-cards/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'All ID cards successfully generated!');
        fetchIdCards();
      }
    } catch (err) {
      console.error('Bulk generate failed:', err);
      alert('Bulk generation failed. Please try again.');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // Bulk Generate Selected
  const handleGenerateSelected = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkGenerating(true);
    try {
      const res = await fetch('/api/employees/id-cards/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeIds: Array.from(selectedIds) })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Generated ID cards for ${selectedIds.size} employees!`);
        fetchIdCards();
      }
    } catch (err) {
      console.error('Selected generate failed:', err);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // Bulk Download Selected
  const handleDownloadSelected = async () => {
    const selectedEmployees = cards.filter((c) => selectedIds.has(c._id));
    if (selectedEmployees.length === 0) return;

    setIsBulkGenerating(true);
    try {
      await generateBulkIdCardPdf(selectedEmployees, (curr, total, name) => {
        setBulkProgress(`Generating card ${curr}/${total}: ${name}`);
      });
    } catch (err) {
      console.error('Bulk download error:', err);
      alert('Error downloading bulk cards');
    } finally {
      setIsBulkGenerating(false);
      setBulkProgress(null);
    }
  };

  // Bulk Download All
  const handleDownloadAll = async () => {
    if (!window.confirm(`Download a multi-page PDF containing ID cards for all ${cards.length} loaded employees?`)) return;
    setIsBulkGenerating(true);
    try {
      await generateBulkIdCardPdf(cards, (curr, total, name) => {
        setBulkProgress(`Generating card ${curr}/${total}: ${name}`);
      });
    } catch (err) {
      console.error('Download all error:', err);
      alert('Error generating bulk PDF');
    } finally {
      setIsBulkGenerating(false);
      setBulkProgress(null);
    }
  };

  // Individual Actions
  const handleOpenPreview = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handlePrintCard = (employee) => {
    printEmployeeIdCard(employee);
  };

  const handleDownloadPdf = async (employee) => {
    try {
      await generateEmployeeIdCardPdf(employee);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateIndividual = async (employee) => {
    try {
      const res = await fetch(`/api/employees/${employee._id}/id-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardTemplate: 'BJK-ID-2026-V1', status: 'ACTIVE' })
      });
      const data = await res.json();
      if (data.success) {
        fetchIdCards();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'GENERATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Generated
          </span>
        );
      case 'UPDATE_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <RefreshCw size={12} className="text-amber-600" />
            Update Required
          </span>
        );
      case 'MISSING_PHOTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Camera size={12} className="text-rose-600" />
            Missing Photo
          </span>
        );
      case 'MISSING_INFO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <AlertCircle size={12} className="text-purple-600" />
            Missing Info
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Clock size={12} className="text-slate-500" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
              Official Master System
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Template: BJK-ID-2026-V1
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-teal-600" size={28} />
            <span>Employee ID Card Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Generate, customize, download and print official dual-sided ID cards for BJK Healthcare workforce.
          </p>
        </div>

        {/* Global Bulk Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleGenerateAll}
            disabled={isBulkGenerating}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>{isBulkGenerating ? 'Processing...' : 'Generate All ID Cards'}</span>
          </button>

          <button
            onClick={handleDownloadAll}
            disabled={isBulkGenerating || cards.length === 0}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all disabled:opacity-50"
          >
            <Download size={14} />
            <span>Download All PDF</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Total Employees */}
        <div
          onClick={() => setSelectedStatus('All')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1 opacity-80">
            <span>Total Employees</span>
            <Users size={16} />
          </div>
          <div className="text-2xl font-black">{stats.totalEmployees}</div>
          <div className="text-[10px] opacity-70 mt-0.5">Active Workforce</div>
        </div>

        {/* Metric 2: Generated */}
        <div
          onClick={() => setSelectedStatus('GENERATED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'GENERATED'
              ? 'bg-emerald-800 text-white border-emerald-800 shadow-md scale-102'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1 text-emerald-600">
            <span>Generated</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats.generated}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ready for Print/PDF</div>
        </div>

        {/* Metric 3: Pending */}
        <div
          onClick={() => setSelectedStatus('PENDING')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'PENDING'
              ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-102'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1 text-slate-600">
            <span>Pending</span>
            <Clock size={16} />
          </div>
          <div className="text-2xl font-black text-slate-700">{stats.pending}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Not Yet Generated</div>
        </div>

        {/* Metric 4: Missing Photo */}
        <div
          onClick={() => setSelectedStatus('MISSING_PHOTO')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'MISSING_PHOTO'
              ? 'bg-rose-900 text-white border-rose-900 shadow-md scale-102'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1 text-rose-600">
            <span>Missing Photo</span>
            <Camera size={16} />
          </div>
          <div className="text-2xl font-black text-rose-700">{stats.missingPhoto}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Placeholder Active</div>
        </div>

        {/* Metric 5: Update Required */}
        <div
          onClick={() => setSelectedStatus('UPDATE_REQUIRED')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedStatus === 'UPDATE_REQUIRED'
              ? 'bg-amber-800 text-white border-amber-800 shadow-md scale-102'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-1 text-amber-600">
            <span>Update Required</span>
            <RefreshCw size={16} />
          </div>
          <div className="text-2xl font-black text-amber-700">{stats.updateRequired}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Data Modified Post-Gen</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee Name, Code (e.g. Dixita, BH1022, Krutika)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </form>

          {/* Department Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="GENERATED">Generated</option>
              <option value="PENDING">Pending</option>
              <option value="MISSING_PHOTO">Missing Photo</option>
              <option value="UPDATE_REQUIRED">Update Required</option>
            </select>
          </div>

          <button
            onClick={fetchIdCards}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Refresh List"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Selected Items Bulk Bar (Sticky when selected) */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900 animate-fadeIn">
            <div className="flex items-center space-x-2 font-bold">
              <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                {selectedIds.size}
              </span>
              <span>Employees Selected</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleGenerateSelected}
                disabled={isBulkGenerating}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Generate Selected
              </button>
              <button
                onClick={handleDownloadSelected}
                disabled={isBulkGenerating}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all disabled:opacity-50"
              >
                Download Selected PDF
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1.5 text-slate-500 hover:text-slate-800 font-bold"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Bulk Progress Banner */}
        {bulkProgress && (
          <div className="p-3 bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center space-x-2">
            <RefreshCw size={14} className="animate-spin text-teal-300" />
            <span>{bulkProgress}</span>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="p-4 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    {selectedIds.size === cards.length && cards.length > 0 ? (
                      <CheckSquare size={16} className="text-teal-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="p-4">Employee Code</th>
                <th className="p-4">Employee Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4 text-center">Photo</th>
                <th className="p-4 text-center">ID Card Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-2"></div>
                    Loading employee ID card records...
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                cards.map((employee) => {
                  const isSelected = selectedIds.has(employee._id);
                  return (
                    <tr
                      key={employee._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleSelect(employee._id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-teal-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Employee Code */}
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {employee.employeeCode || employee.employeeId}
                      </td>

                      {/* Employee Name */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{employee.fullName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{employee.email}</div>
                      </td>

                      {/* Department */}
                      <td className="p-4 font-medium text-slate-700">
                        {employee.departmentName || employee.department}
                      </td>

                      {/* Designation */}
                      <td className="p-4 font-medium text-slate-700">
                        {employee.designationTitle || employee.designation}
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="p-4 text-center">
                        {employee.photo ? (
                          <div className="w-9 h-9 rounded-full overflow-hidden mx-auto border-2 border-teal-600 shadow-xs">
                            <img
                              src={employee.photo}
                              alt={employee.fullName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span
                            className="inline-block p-1.5 rounded-full bg-slate-100 text-slate-400"
                            title="No Photo Uploaded"
                          >
                            <Camera size={14} />
                          </span>
                        )}
                      </td>

                      {/* ID Card Status */}
                      <td className="p-4 text-center">
                        {renderStatusBadge(employee.cardStatus)}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenPreview(employee)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all"
                            title="View / Preview Exact Reference ID Card"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handlePrintCard(employee)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                            title="Print Card"
                          >
                            <Printer size={13} />
                          </button>

                          <button
                            onClick={() => handleDownloadPdf(employee)}
                            className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg transition-all"
                            title="Download Official 2-Page PDF"
                          >
                            <Download size={13} />
                          </button>

                          <button
                            onClick={() => handleRegenerateIndividual(employee)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
                            title="Regenerate Card"
                          >
                            <RefreshCw size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong>{cards.length}</strong> of <strong>{stats.totalEmployees}</strong> active employee records
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>BJK Healthcare Enterprise System</span>
          </div>
        </div>
      </div>

      {/* Exact Reference Master ID Card Modal */}
      {isModalOpen && selectedEmployee && (
        <EmployeeIdCardModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          employee={selectedEmployee}
          onCardUpdated={(updated) => {
            fetchIdCards();
            setSelectedEmployee(updated);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeIDCardManager;
