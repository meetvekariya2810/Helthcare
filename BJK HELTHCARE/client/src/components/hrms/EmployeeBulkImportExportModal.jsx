import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { employeeAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const EmployeeBulkImportExportModal = ({
  isOpen,
  onClose,
  initialMode = 'import', // 'import' | 'export'
  onImportComplete
}) => {
  if (!isOpen) return null;

  const { showToast } = useNotification();
  const [mode, setMode] = useState(initialMode); // 'import' | 'export'

  // Import Pipeline States
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Preview & Validate, 3 = Completed

  // Export Filter States
  const [exportFilter, setExportFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  // 1. Download official template
  const handleDownloadTemplate = async () => {
    try {
      const res = await employeeAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'BJK_Employee_Import_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Excel template downloaded successfully', 'success', 'Downloaded');
    } catch (err) {
      showToast('Failed to download template: ' + (err.normalizedMessage || err.message), 'error', 'Template Error');
    }
  };

  // 2. Select file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setValidationResult(null);
      setImportSummary(null);
    }
  };

  // 3. Step 2: Validate File (Preview Mode)
  const handleValidateFile = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confirm', 'false'); // Preview mode

      const res = await employeeAPI.importExcel(formData);
      if (res.data && res.data.success) {
        setValidationResult(res.data);
        setStep(2);
        showToast(`Validated ${res.data.summary.total} rows. ${res.data.summary.valid} valid records ready for import.`, 'info', 'Validation Complete');
      }
    } catch (err) {
      showToast('Validation failed: ' + (err.normalizedMessage || err.message), 'error', 'Validation Error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Step 3: Confirm Import (Execution Mode)
  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confirm', 'true'); // Execute mode

      const res = await employeeAPI.importExcel(formData);
      if (res.data && res.data.success) {
        setImportSummary(res.data);
        setStep(3);
        showToast(`Successfully created ${res.data.createdCount} employee master records!`, 'success', 'Import Succeeded');
        if (onImportComplete) onImportComplete();
      }
    } catch (err) {
      showToast('Import error: ' + (err.normalizedMessage || err.message), 'error', 'Import Error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Export Master Excel
  const handleExportExcel = async (type = exportFilter) => {
    try {
      setIsExporting(true);
      const res = await employeeAPI.exportBulkExcel({ filter: type });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BJK_Healthcare_Employees_${type}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast(`Exported ${type} employee records to Excel!`, 'success', 'Export Complete');
    } catch (err) {
      showToast('Export failed: ' + (err.normalizedMessage || err.message), 'error', 'Export Error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                {mode === 'import' ? 'Bulk Employee Upload & Excel Import' : 'Employee Master Data Export'}
              </h2>
              <p className="text-xs text-slate-400">
                Official BJK Healthcare XLSX Data Exchange Center
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex rounded-xl bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setMode('import')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  mode === 'import' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Import Bulk
              </button>
              <button
                onClick={() => setMode('export')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  mode === 'export' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Export Excel
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MODE: IMPORT BULK (Step 1 -> Step 2 -> Step 3) */}
        {/* ======================================================== */}
        {mode === 'import' && (
          <div className="p-6 space-y-6">
            {/* Step Progress Pills */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-bold">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-teal-600' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px]">1</span>
                <span>Select & Template</span>
              </div>
              <ArrowRight size={14} className="text-slate-300" />
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-teal-600' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px]">2</span>
                <span>Validate & Preview</span>
              </div>
              <ArrowRight size={14} className="text-slate-300" />
              <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-teal-600' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-[10px]">3</span>
                <span>Confirm & Create</span>
              </div>
            </div>

            {/* STEP 1: Upload or Download Template */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-teal-950">1. Download Template First</h4>
                    <p className="text-xs text-teal-800 mt-0.5">
                      Download the official multi-column employee workbook template with sample rows and guidelines.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3.5 py-2 bg-white hover:bg-teal-100 text-teal-800 border border-teal-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all flex-shrink-0"
                  >
                    <Download size={14} />
                    <span>Download XLSX Template</span>
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white text-teal-600 border border-slate-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Upload size={24} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {selectedFile ? selectedFile.name : 'Click or drag employee Excel (.xlsx) or Master CSV here'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB selected` : 'Supports standard multi-column XLSX or Master Detail CSV files up to 10MB'}
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleValidateFile}
                    disabled={!selectedFile || isProcessing}
                    className="px-5 py-2 bg-slate-900 hover:bg-teal-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
                  >
                    {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>{isProcessing ? 'Validating Workbook...' : 'Upload & Validate Excel'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Validation Preview */}
            {step === 2 && validationResult && (
              <div className="space-y-4">
                {/* Metric Summary Counters (Requirement 25) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                    <span className="text-[11px] text-teal-700 font-bold block uppercase tracking-wider">Technical Employees</span>
                    <span className="text-xl font-black text-teal-900">
                      {validationResult.summary.technicalEmployees !== undefined 
                        ? validationResult.summary.technicalEmployees
                        : (validationResult.rows?.filter(r => r.isValid && (r.employeeCategory === 'TECHNICAL' || r.staffCategory === 'TECHNICAL' || (!r.isNonTechnical && r.employeeCategory !== 'NON_TECHNICAL'))).length || 0)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-[11px] text-blue-700 font-bold block uppercase tracking-wider">Non-Technical Staff</span>
                    <span className="text-xl font-black text-blue-900">
                      {validationResult.summary.nonTechnicalEmployees !== undefined
                        ? validationResult.summary.nonTechnicalEmployees
                        : (validationResult.rows?.filter(r => r.isValid && (r.employeeCategory === 'NON_TECHNICAL' || r.staffCategory === 'NON_TECHNICAL' || r.isNonTechnical)).length || 0)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-[11px] text-rose-700 font-bold block uppercase tracking-wider">Invalid Records</span>
                    <span className="text-xl font-black text-rose-700">{validationResult.summary.errors || validationResult.summary.invalidCount || 0}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[11px] text-amber-700 font-bold block uppercase tracking-wider">Duplicate Records</span>
                    <span className="text-xl font-black text-amber-700">{validationResult.summary.duplicateCount || 0}</span>
                  </div>
                </div>

                {/* Validation Records Table Preview */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Full Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5">Designation</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationResult.rows.map((r, idx) => {
                        const isNonTech = r.employeeCategory === 'NON_TECHNICAL' || r.staffCategory === 'NON_TECHNICAL' || r.isNonTechnical;
                        return (
                          <tr key={idx} className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/60'}>
                            <td className="p-2.5 font-mono text-slate-500">#{r.rowNumber}</td>
                            <td className="p-2.5 font-bold text-slate-800">{r.fullName || '-'}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isNonTech ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-teal-100 text-teal-800 border border-teal-200'
                              }`}>
                                {isNonTech ? 'NON_TECHNICAL' : 'TECHNICAL'}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-600">{r.email || '-'}</td>
                            <td className="p-2.5 text-slate-600">{r.department || '-'}</td>
                            <td className="p-2.5 text-slate-600">{r.designation || '-'}</td>
                            <td className="p-2.5">
                              {r.isValid ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Ready to Import
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800" title={r.errors?.join(', ')}>
                                  {r.errors?.[0]}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Back to File Selection
                  </button>

                  <button
                    onClick={handleConfirmImport}
                    disabled={validationResult.summary.valid === 0 || isProcessing}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all"
                  >
                    {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>
                      {isProcessing
                        ? 'Creating Records...'
                        : `Confirm Import (${validationResult.summary.valid} Employees)`}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Successful Creation Report */}
            {step === 3 && importSummary && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Bulk Import Executed Successfully!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Registered <strong className="text-emerald-700">{importSummary.createdCount}</strong> new employee master records with automatically allocated sequential BHK employee codes.
                </p>

                <div className="flex items-center justify-center space-x-3 pt-3">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.reload();
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    View Updated Employee Directory
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE: EXPORT EXCEL (All, Department, Branch, Active, Former) */}
        {/* ======================================================== */}
        {mode === 'export' && (
          <div className="p-6 space-y-5 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Export employee master records as structured, multi-sheet Microsoft Excel (.xlsx) workbooks containing complete biographical, departmental, payroll, and identity metadata.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExportExcel('all')}
                disabled={isExporting}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-500 bg-slate-50 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-teal-700">Export All Employees</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Complete enterprise master directory</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportExcel('active')}
                disabled={isExporting}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-emerald-700">Export Active Employees</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Currently active staff and personnel</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportExcel('former')}
                disabled={isExporting}
                className="p-4 rounded-2xl border border-slate-200 hover:border-rose-500 bg-slate-50 hover:bg-rose-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <XCircle size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-rose-700">Export Former Employees</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Resigned, retired & offboarded archive</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleExportExcel('department')}
                disabled={isExporting}
                className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/50 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Layers size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-purple-700">Export Department-wise</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Sorted and grouped by plant department</p>
                  </div>
                </div>
              </button>
            </div>

            {isExporting && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-center font-bold animate-pulse">
                Generating Excel workbook with BJK corporate styling...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
