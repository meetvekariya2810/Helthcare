import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrmsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Columns,
  Calendar,
  Building,
  Users,
  Clock,
  Layers,
  CheckSquare,
  Square,
  ArrowUpDown,
  ChevronRight,
  Eye,
  RotateCcw,
  Sparkles,
  Bookmark,
  History,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowUp,
  ArrowDown,
  Printer,
  FileText
} from 'lucide-react';

const ALL_AVAILABLE_COLUMNS = [
  { key: 'siNo', label: 'SI No.' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'branch', label: 'Branch / Plant' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'date', label: 'Date' },
  { key: 'day', label: 'Day' },
  { key: 'shift', label: 'Shift' },
  { key: 'scheduledIn', label: 'Scheduled In' },
  { key: 'scheduledOut', label: 'Scheduled Out' },
  { key: 'actualIn', label: 'Actual IN' },
  { key: 'actualOut', label: 'Actual OUT' },
  { key: 'status', label: 'Attendance Status' },
  { key: 'lateBy', label: 'Late By' },
  { key: 'earlyBy', label: 'Early By' },
  { key: 'workingHours', label: 'Working Hours' },
  { key: 'overtime', label: 'Overtime Hours' },
  { key: 'nightHours', label: 'Night Hours' },
  { key: 'halfDayType', label: 'Half Day Type' },
  { key: 'leaveType', label: 'Leave Type' },
  { key: 'workLocation', label: 'Work Location' },
  { key: 'punchSource', label: 'Punch Source' },
  { key: 'punchCondition', label: 'Punch Condition' },
  { key: 'regularizationStatus', label: 'Regularization' },
  { key: 'remarks', label: 'Remarks' }
];

const PREDEFINED_TEMPLATES = [
  {
    id: 'sep_2026_master',
    title: 'September 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for September 2026 across all departments and shifts.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-09-01',
      dateTo: '2026-09-30',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'aug_2026_master',
    title: 'August 2026 Master Attendance (Imported)',
    desc: 'Complete imported August 2026 workforce attendance dataset with 47 matched staff and 1,129 daily records.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'jul_2026_master',
    title: 'July 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for July 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'jun_2026_master',
    title: 'June 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for June 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-06-01',
      dateTo: '2026-06-30',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'may_2026_master',
    title: 'May 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for May 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-05-01',
      dateTo: '2026-05-31',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'apr_2026_master',
    title: 'April 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for April 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'mar_2026_master',
    title: 'March 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for March 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-03-01',
      dateTo: '2026-03-31',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'feb_2026_master',
    title: 'February 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for February 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-02-01',
      dateTo: '2026-02-28',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'jan_2026_master',
    title: 'January 2026 Master Attendance',
    desc: 'Complete workforce attendance dataset for January 2026.',
    category: 'Master Data',
    filters: {
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      branches: ['ALL'],
      departments: ['ALL'],
      statuses: ['ALL'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'prod_oct_2026',
    title: 'Production Attendance (Oct 2026)',
    desc: 'Production employees in Ahmedabad plant with Present, Late In, and Half Day statuses.',
    category: 'Production',
    filters: {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['Production'],
      statuses: ['PRESENT', 'LATE', 'HALF_DAY'],
      shifts: [],
      punchConditions: []
    },
    columns: ['employeeId', 'employeeName', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'lateBy', 'workingHours'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'missing_out_today',
    title: 'Missing OUT Punches (Today)',
    desc: 'Targeted audit of employees with active IN punch but missing OUT punch across Production, QC, and QA.',
    category: 'Compliance',
    filters: {
      dateFrom: '2026-10-04',
      dateTo: '2026-10-04',
      branches: ['Ahmedabad'],
      departments: ['Production', 'Quality Control', 'Quality Assurance'],
      statuses: ['PRESENT'],
      punchConditions: ['MISSING_OUT']
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'punchCondition', 'remarks'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'night_shift_diff',
    title: 'Night Shift Attendance & Differential',
    desc: 'Overnight operations (22:00 - 06:30) with night differential hours and overtime metrics.',
    category: 'Operations',
    filters: {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      shifts: ['Pharma Night Shift (22:00 - 06:30)'],
      statuses: ['PRESENT', 'NIGHT_SHIFT', 'LATE']
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'scheduledIn', 'scheduledOut', 'actualIn', 'actualOut', 'workingHours', 'overtime', 'nightHours', 'status'],
    sheetStructure: 'SUMMARY_DETAIL'
  },
  {
    id: 'late_arrival_audit',
    title: 'Late Arrival Workforce Audit',
    desc: 'Employees arriving past grace threshold with delay durations and punch timestamps.',
    category: 'HR Audit',
    filters: {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      statuses: ['LATE']
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'scheduledIn', 'actualIn', 'lateBy', 'remarks'],
    sheetStructure: 'SINGLE'
  },
  {
    id: 'executive_monthly_summary',
    title: 'Monthly Summary + Detailed Roster',
    desc: 'Complete company workforce report generating Sheet 1 (Executive Summary) + Sheet 2 (Detailed Records).',
    category: 'Executive',
    filters: {
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['Production', 'Quality Control', 'Quality Assurance', 'Regulatory Affairs', 'Warehouse & Logistics', 'HR & Admin']
    },
    columns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours', 'overtime'],
    sheetStructure: 'SUMMARY_DETAIL'
  }
];

export const AttendanceReportBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  // Active view tab: 'BUILDER' | 'TEMPLATES' | 'HISTORY'
  const [activeTab, setActiveTab] = useState('BUILDER');

  // Filter state - default to August 2026 imported dataset
  const [datePreset, setDatePreset] = useState('AUG_2026');
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-08-31');
  const [selectedBranch, setSelectedBranch] = useState('Ahmedabad');
  const [selectedDepartments, setSelectedDepartments] = useState(['ALL']);
  const [selectedStatuses, setSelectedStatuses] = useState(['ALL']);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [selectedPunchConditions, setSelectedPunchConditions] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [sheetStructure, setSheetStructure] = useState('SINGLE'); // 'SINGLE' | 'SUMMARY_DETAIL' | 'BY_DEPARTMENT'
  const [groupBy, setGroupBy] = useState('NONE');

  // Columns selection state: array of column keys in display order
  const [selectedColumns, setSelectedColumns] = useState([
    'employeeId',
    'employeeName',
    'date',
    'shift',
    'actualIn',
    'actualOut',
    'status',
    'lateBy',
    'workingHours'
  ]);

  // Preview & Loading state
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');

  // Saved templates & History
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');

  // Handle Date Presets
  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === 'YESTERDAY') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setDateFrom(yStr);
      setDateTo(yStr);
    } else if (preset === 'JAN_2026') {
      setDateFrom('2026-01-01');
      setDateTo('2026-01-31');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'FEB_2026') {
      setDateFrom('2026-02-01');
      setDateTo('2026-02-28');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'MAR_2026') {
      setDateFrom('2026-03-01');
      setDateTo('2026-03-31');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'APR_2026') {
      setDateFrom('2026-04-01');
      setDateTo('2026-04-30');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'MAY_2026') {
      setDateFrom('2026-05-01');
      setDateTo('2026-05-31');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'JUN_2026') {
      setDateFrom('2026-06-01');
      setDateTo('2026-06-30');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'JUL_2026') {
      setDateFrom('2026-07-01');
      setDateTo('2026-07-31');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'AUG_2026') {
      setDateFrom('2026-08-01');
      setDateTo('2026-08-31');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'SEP_2026') {
      setDateFrom('2026-09-01');
      setDateTo('2026-09-30');
      setSelectedDepartments(['ALL']);
      setSelectedStatuses(['ALL']);
    } else if (preset === 'OCT_2026') {
      setDateFrom('2026-10-01');
      setDateTo('2026-10-31');
    } else if (preset === 'THIS_MONTH') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      setDateFrom(`${year}-${month}-01`);
      setDateTo(`${year}-${month}-${lastDay}`);
    }
  };

  // Load preview data
  const fetchPreview = async () => {
    try {
      setIsPreviewLoading(true);
      const payload = {
        dateFrom,
        dateTo,
        branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
        departments: selectedDepartments.includes('ALL') ? [] : selectedDepartments,
        employees: selectedEmployees,
        employeeSearch,
        statuses: selectedStatuses,
        shifts: selectedShifts,
        punchConditions: selectedPunchConditions,
        selectedColumns,
        sheetStructure,
        groupBy
      };

      const res = await hrmsAPI.previewAttendanceReport(payload);
      if (res.data.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      console.error('Preview error:', err);
      showToast(err.response?.data?.message || err.message, 'error', 'Preview Failed');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Trigger preview when key filters change
  useEffect(() => {
    fetchPreview();
  }, [dateFrom, dateTo, selectedBranch, selectedDepartments, selectedStatuses, selectedShifts, selectedPunchConditions, selectedColumns]);

  // Load Saved Templates and History
  const loadTemplatesAndHistory = async () => {
    try {
      const [tplRes, histRes] = await Promise.all([
        hrmsAPI.getReportTemplates(),
        hrmsAPI.getReportHistory()
      ]);
      if (tplRes.data.success) setSavedTemplates(tplRes.data.templates || []);
      if (histRes.data.success) setReportHistory(histRes.data.history || []);
    } catch (err) {
      console.warn('Could not load templates/history:', err.message);
    }
  };

  useEffect(() => {
    loadTemplatesAndHistory();
  }, [activeTab]);

  // Column toggle
  const toggleColumn = (key) => {
    if (selectedColumns.includes(key)) {
      if (selectedColumns.length === 1) {
        showToast('At least one column must be selected', 'warning');
        return;
      }
      setSelectedColumns(selectedColumns.filter((c) => c !== key));
    } else {
      setSelectedColumns([...selectedColumns, key]);
    }
  };

  // Move column order
  const moveColumn = (index, direction) => {
    const newCols = [...selectedColumns];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newCols.length) return;
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;
    setSelectedColumns(newCols);
  };

  // Select all / Deselect all
  const selectAllColumns = () => {
    setSelectedColumns(ALL_AVAILABLE_COLUMNS.map((c) => c.key));
  };
  const resetDefaultColumns = () => {
    setSelectedColumns([
      'employeeId',
      'employeeName',
      'date',
      'shift',
      'actualIn',
      'actualOut',
      'status',
      'lateBy',
      'workingHours'
    ]);
  };

  // Apply predefined template
  const applyTemplate = (tpl) => {
    if (tpl.filters.dateFrom) setDateFrom(tpl.filters.dateFrom);
    if (tpl.filters.dateTo) setDateTo(tpl.filters.dateTo);
    if (tpl.filters.branches) setSelectedBranch(tpl.filters.branches[0] || 'ALL');
    if (tpl.filters.departments) setSelectedDepartments(tpl.filters.departments);
    if (tpl.filters.statuses) setSelectedStatuses(tpl.filters.statuses);
    if (tpl.filters.shifts) setSelectedShifts(tpl.filters.shifts);
    if (tpl.filters.punchConditions) setSelectedPunchConditions(tpl.filters.punchConditions);
    if (tpl.columns) setSelectedColumns(tpl.columns);
    if (tpl.sheetStructure) setSheetStructure(tpl.sheetStructure);
    setActiveTab('BUILDER');
    showToast(`Loaded template: ${tpl.title || tpl.name}`, 'success', 'Template Applied');
  };

  // Generate Excel (.xlsx) Download
  const handleGenerateExcel = async () => {
    if (!previewData || previewData.totalRecords === 0) {
      showToast('No attendance records found for the selected filters. Modify filters to generate.', 'warning', '0 Records');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgressText('Preparing attendance dataset...');
      await new Promise((r) => setTimeout(r, 300));

      setExportProgressText('Applying healthcare compliance filters & scopes...');
      await new Promise((r) => setTimeout(r, 300));

      setExportProgressText('Generating Excel workbook with styled headers...');

      const payload = {
        dateFrom,
        dateTo,
        branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
        departments: selectedDepartments.includes('ALL') ? [] : selectedDepartments,
        employees: selectedEmployees,
        employeeSearch,
        statuses: selectedStatuses,
        shifts: selectedShifts,
        punchConditions: selectedPunchConditions,
        selectedColumns,
        sheetStructure,
        groupBy
      };

      const res = await hrmsAPI.generateAttendanceExcel(payload);

      setExportProgressText('Finalizing download...');
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const deptPart = selectedDepartments.length === 1 && !selectedDepartments.includes('ALL') ? selectedDepartments[0] : 'Workforce';
      a.download = `BJK_Attendance_${deptPart.replace(/[^a-zA-Z0-9]/g, '_')}_${dateFrom}_to_${dateTo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Excel report generated and downloaded successfully.', 'success', 'Export Ready');
      loadTemplatesAndHistory();
    } catch (err) {
      console.error('Export error:', err);
      showToast(err.response?.data?.message || err.message, 'error', 'Export Failed');
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // Generate CSV Download
  const handleGenerateCsv = async () => {
    try {
      setIsExporting(true);
      setExportProgressText('Formatting CSV records...');
      const payload = {
        dateFrom,
        dateTo,
        branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
        departments: selectedDepartments.includes('ALL') ? [] : selectedDepartments,
        employees: selectedEmployees,
        statuses: selectedStatuses,
        shifts: selectedShifts,
        punchConditions: selectedPunchConditions,
        selectedColumns
      };

      const res = await hrmsAPI.generateAttendanceCsv(payload);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BJK_Attendance_${dateFrom}_to_${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('CSV export downloaded', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  // Save Current Filter Preset as Template
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    try {
      const colsToSave = selectedColumns.map((key, idx) => {
        const item = ALL_AVAILABLE_COLUMNS.find((c) => c.key === key);
        return { key, label: item?.label || key, order: idx + 1 };
      });

      const payload = {
        name: templateName.trim(),
        description: templateDesc.trim(),
        reportType: 'CUSTOM',
        filters: {
          dateMode: datePreset,
          startDate: dateFrom,
          endDate: dateTo,
          branches: selectedBranch === 'ALL' ? [] : [selectedBranch],
          departments: selectedDepartments,
          statuses: selectedStatuses,
          shifts: selectedShifts,
          punchConditions: selectedPunchConditions
        },
        selectedColumns: colsToSave,
        sheetStructure,
        groupBy
      };

      const res = await hrmsAPI.saveReportTemplate(payload);
      if (res.data.success) {
        showToast('Report template saved successfully', 'success', 'Template Saved');
        setIsSaveModalOpen(false);
        setTemplateName('');
        setTemplateDesc('');
        loadTemplatesAndHistory();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Save Failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-teal-50 text-bjk-teal rounded-xl">
              <FileSpreadsheet size={22} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Attendance Custom Excel Report Engine
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate tailored Microsoft Excel (.xlsx) workbooks containing ONLY filtered employees, selected dates, and chosen columns.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/hr/attendance')}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Back to Attendance
          </button>

          <button
            onClick={handleGenerateExcel}
            disabled={isExporting || (previewData && previewData.totalRecords === 0)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-bjk-teal hover:bg-bjk-teal-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-bjk-teal/20 transition-all"
          >
            <Download size={16} />
            <span>{isExporting ? 'Generating...' : 'Generate Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Top Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('BUILDER')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'BUILDER'
              ? 'border-bjk-teal text-bjk-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Filter size={15} />
          <span>Report Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('TEMPLATES')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'TEMPLATES'
              ? 'border-bjk-teal text-bjk-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bookmark size={15} />
          <span>Healthcare Templates Library ({PREDEFINED_TEMPLATES.length + savedTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 ${
            activeTab === 'HISTORY'
              ? 'border-bjk-teal text-bjk-teal'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History size={15} />
          <span>Export History ({reportHistory.length})</span>
        </button>
      </div>

      {/* TAB 1: REPORT BUILDER */}
      {activeTab === 'BUILDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Filter Controls & Column Customizer (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Step 1: Date Range */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Calendar size={14} className="text-bjk-teal" />
                  <span>1. Date Range Control</span>
                </span>
                <span className="text-[10px] text-slate-400">Single or Range</span>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                {[
                  { id: 'JAN_2026', label: 'Jan 2026' },
                  { id: 'FEB_2026', label: 'Feb 2026' },
                  { id: 'MAR_2026', label: 'Mar 2026' },
                  { id: 'APR_2026', label: 'Apr 2026' },
                  { id: 'MAY_2026', label: 'May 2026' },
                  { id: 'JUN_2026', label: 'Jun 2026' },
                  { id: 'JUL_2026', label: 'Jul 2026' },
                  { id: 'AUG_2026', label: 'Aug 2026' },
                  { id: 'SEP_2026', label: 'Sep 2026' },
                  { id: 'TODAY', label: 'Today' },
                  { id: 'THIS_MONTH', label: 'Current Mo.' }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => applyDatePreset(m.id)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold border transition-all ${
                      datePreset === m.id
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value);
                      setDatePreset('CUSTOM');
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-1 focus:ring-bjk-teal focus:border-bjk-teal"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value);
                      setDatePreset('CUSTOM');
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-1 focus:ring-bjk-teal focus:border-bjk-teal"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 & 3: Organization Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Building size={14} className="text-bjk-teal" />
                <span>2. Branch & Department Scope</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Branch / Plant</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
                  >
                    <option value="Ahmedabad">Ahmedabad Plant</option>
                    <option value="Vadodara">Vadodara Plant</option>
                    <option value="Mumbai">Mumbai Corporate</option>
                    <option value="ALL">All Branches</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Department</label>
                  <select
                    value={selectedDepartments[0] || 'ALL'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedDepartments(val === 'ALL' ? ['ALL'] : [val]);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
                  >
                    <option value="Production">Production</option>
                    <option value="Quality Control">Quality Control (QC)</option>
                    <option value="Quality Assurance">Quality Assurance (QA)</option>
                    <option value="Regulatory Affairs">Regulatory Affairs</option>
                    <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                    <option value="HR & Admin">HR & Admin</option>
                    <option value="Engineering">Engineering & Utilities</option>
                    <option value="ALL">All Departments</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Attendance Status Filters (Multi-select) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Clock size={14} className="text-bjk-teal" />
                  <span>3. Attendance Status Filter (Multi-select)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStatuses(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WEEK_OFF', 'HOLIDAY', 'NIGHT_SHIFT'])}
                  className="text-[10px] text-bjk-teal font-semibold hover:underline"
                >
                  Select Common
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'PRESENT', label: 'Present' },
                  { key: 'ABSENT', label: 'Absent' },
                  { key: 'LATE', label: 'Late In' },
                  { key: 'HALF_DAY', label: 'Half Day' },
                  { key: 'ON_LEAVE', label: 'Leave' },
                  { key: 'WEEK_OFF', label: 'Week Off' },
                  { key: 'HOLIDAY', label: 'Holiday' },
                  { key: 'NIGHT_SHIFT', label: 'Night Shift' },
                  { key: 'WORK_FROM_HOME', label: 'WFH' },
                  { key: 'FIELD_DUTY', label: 'Field Duty' },
                  { key: 'ON_DUTY', label: 'On Duty' },
                  { key: 'COMPENSATORY_OFF', label: 'Comp Off' }
                ].map((st) => {
                  const isChecked = selectedStatuses.includes(st.key);
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedStatuses(selectedStatuses.filter((s) => s !== st.key));
                        } else {
                          setSelectedStatuses([...selectedStatuses, st.key]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        isChecked
                          ? 'bg-teal-50 border-bjk-teal text-bjk-teal font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isChecked ? '☑ ' : '☐ '}
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 5: Punch & Shift Conditions */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Layers size={14} className="text-bjk-teal" />
                <span>4. Shift & Punch Anomaly Filter</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Shift</label>
                  <select
                    value={selectedShifts[0] || 'ALL'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedShifts(val === 'ALL' ? [] : [val]);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
                  >
                    <option value="ALL">All Shifts</option>
                    <option value="General Shift (09:00 - 18:00)">General Shift</option>
                    <option value="Morning Shift (06:00 - 14:30)">Morning Shift</option>
                    <option value="Pharma Night Shift (22:00 - 06:30)">Pharma Night Shift (Overnight)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Punch Conditions</label>
                  <select
                    value={selectedPunchConditions[0] || 'ALL'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedPunchConditions(val === 'ALL' ? [] : [val]);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
                  >
                    <option value="ALL">All Punches</option>
                    <option value="MISSING_OUT">Missing OUT Punch</option>
                    <option value="MISSING_IN">Missing IN Punch</option>
                    <option value="BOTH_MISSING">Both Punches Missing</option>
                    <option value="HAS_BOTH">Valid IN & OUT</option>
                    <option value="LATE_IN">Late IN</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 6: Column Customization & Reordering */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Columns size={14} className="text-bjk-teal" />
                  <span>5. Customize Columns ({selectedColumns.length} selected)</span>
                </span>
                <div className="flex items-center space-x-2 text-[10px]">
                  <button
                    type="button"
                    onClick={selectAllColumns}
                    className="text-bjk-teal hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={resetDefaultColumns}
                    className="text-slate-500 hover:underline"
                  >
                    Reset Default
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                The Excel file will contain <strong>ONLY</strong> these selected columns in this exact sequence.
              </p>

              {/* Selected Columns Ordered List with Up/Down buttons */}
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {selectedColumns.map((colKey, index) => {
                  const colDef = ALL_AVAILABLE_COLUMNS.find((c) => c.key === colKey);
                  return (
                    <div
                      key={colKey}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-4">{index + 1}.</span>
                        <span className="font-semibold text-slate-800">{colDef?.label || colKey}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => moveColumn(index, -1)}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveColumn(index, 1)}
                          disabled={index === selectedColumns.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleColumn(colKey)}
                          className="p-1 text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs"
                          title="Remove column"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Unselected Columns Pills */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">Add More Columns:</span>
                <div className="flex flex-wrap gap-1">
                  {ALL_AVAILABLE_COLUMNS.filter((c) => !selectedColumns.includes(c.key)).map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleColumn(c.key)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-bjk-teal rounded-md text-[10px] text-slate-600 font-medium transition-colors"
                    >
                      + {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 7: Workbook Sheets Option */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <FileSpreadsheet size={14} className="text-bjk-teal" />
                <span>6. Excel Workbook Structure</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSheetStructure('SINGLE')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sheetStructure === 'SINGLE'
                      ? 'bg-teal-50 border-bjk-teal text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block text-xs">Single Sheet</span>
                  <span className="text-[10px] text-slate-500">Filtered records table</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSheetStructure('SUMMARY_DETAIL')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sheetStructure === 'SUMMARY_DETAIL'
                      ? 'bg-teal-50 border-bjk-teal text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold block text-xs">Summary + Detailed</span>
                  <span className="text-[10px] text-slate-500">Sheet 1: Summary, Sheet 2: Rows</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Data Preview & Export Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Report Metadata Summary Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                <div>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-teal-400">
                    BJK Healthcare Private Limited
                  </span>
                  <h3 className="text-base font-black text-white">Live Report Configuration Preview</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsSaveModalOpen(true)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Bookmark size={13} />
                    <span>Save Template</span>
                  </button>

                  <button
                    onClick={handleGenerateExcel}
                    disabled={isExporting || (previewData && previewData.totalRecords === 0)}
                    className="px-4 py-1.5 bg-bjk-teal hover:bg-bjk-teal-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Download size={14} />
                    <span>Generate Excel</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Date Range</span>
                  <span className="font-bold text-teal-300 font-mono text-xs">{dateFrom} → {dateTo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Branch</span>
                  <span className="font-bold text-white text-xs">{selectedBranch}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Department</span>
                  <span className="font-bold text-white text-xs">
                    {selectedDepartments.join(', ') || 'All'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Matching Records</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {isPreviewLoading ? 'Calculating...' : `${previewData?.totalRecords ?? 0} records (${previewData?.employeeCount ?? 0} staff)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Toolbar Buttons (Inspired by Reference, styled for BJK Healthcare) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Quick Exports:</span>
                <button
                  onClick={handleGenerateExcel}
                  disabled={isExporting}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <FileSpreadsheet size={14} />
                  <span>Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handleGenerateCsv}
                  disabled={isExporting}
                  className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <FileText size={14} />
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {previewData && (
                  <span>
                    Showing preview of first <strong>{previewData.previewRows?.length || 0}</strong> of{' '}
                    <strong>{previewData.totalRecords || 0}</strong> matching records
                  </span>
                )}
              </div>
            </div>

            {/* Loading / Progress Notification Banner */}
            {isExporting && (
              <div className="p-4 bg-teal-50 border border-bjk-teal/30 rounded-2xl flex items-center space-x-3 text-bjk-teal animate-pulse">
                <div className="w-5 h-5 border-2 border-bjk-teal border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold">{exportProgressText}</span>
              </div>
            )}

            {/* Live Data Preview Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Data Preview (Exact Columns to be Exported)
                </span>
                <button
                  onClick={fetchPreview}
                  disabled={isPreviewLoading}
                  className="text-xs text-bjk-teal font-semibold hover:underline flex items-center space-x-1"
                >
                  <RotateCcw size={12} />
                  <span>Refresh Preview</span>
                </button>
              </div>

              {isPreviewLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <div className="w-6 h-6 border-2 border-bjk-teal border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Applying database filters and compiling preview...</p>
                </div>
              ) : previewData?.totalRecords === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <AlertCircle size={32} className="mx-auto text-amber-500 opacity-80" />
                  <p className="text-sm font-bold text-slate-800">No attendance records found for the selected filters.</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try broadening your date range (e.g. Oct 2026), selecting additional statuses, or choosing all departments.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[460px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        {selectedColumns.map((colKey) => {
                          const colDef = ALL_AVAILABLE_COLUMNS.find((c) => c.key === colKey);
                          return (
                            <th key={colKey} className="px-3 py-2.5 whitespace-nowrap text-[11px]">
                              {colDef?.label || colKey}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewData?.previewRows?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          {selectedColumns.map((colKey) => (
                            <td key={colKey} className="px-3 py-2 whitespace-nowrap text-[11px] text-slate-700">
                              {colKey === 'status' ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.status === 'PRESENT'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : row.status === 'LATE'
                                      ? 'bg-amber-100 text-amber-800'
                                      : row.status === 'HALF_DAY'
                                      ? 'bg-orange-100 text-orange-800'
                                      : row.status === 'NIGHT_SHIFT'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {row.status}
                                </span>
                              ) : (
                                row[colKey] || '-'
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES LIBRARY */}
      {activeTab === 'TEMPLATES' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Predefined Healthcare & Pharma Workflows</h2>
            <p className="text-xs text-slate-500">
              Instant 1-click attendance report presets built for pharmaceutical and manufacturing workforce operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PREDEFINED_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-bjk-teal/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-teal-50 text-bjk-teal rounded text-[10px] font-bold uppercase tracking-wider">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{tpl.columns.length} columns</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{tpl.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {tpl.sheetStructure === 'SUMMARY_DETAIL' ? 'Summary + Detail' : 'Single Sheet'}
                  </span>
                  <button
                    onClick={() => applyTemplate(tpl)}
                    className="px-3.5 py-1.5 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Load Preset</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* User Saved Custom Templates */}
          {savedTemplates.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900">Your Saved Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedTemplates.map((st) => (
                  <div
                    key={st._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-bjk-teal/50 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold uppercase">
                        Custom Template
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{st.name}</h3>
                      <p className="text-xs text-slate-500">{st.description || 'Custom configured attendance report.'}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={async () => {
                          try {
                            await hrmsAPI.deleteReportTemplate(st._id);
                            showToast('Template deleted', 'success');
                            loadTemplatesAndHistory();
                          } catch (err) {
                            showToast(err.message, 'error');
                          }
                        }}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          const colKeys = st.selectedColumns?.map((c) => c.key) || [];
                          applyTemplate({
                            title: st.name,
                            filters: {
                              dateFrom: st.filters?.startDate || dateFrom,
                              dateTo: st.filters?.endDate || dateTo,
                              branches: st.filters?.branches || [],
                              departments: st.filters?.departments || [],
                              statuses: st.filters?.statuses || [],
                              shifts: st.filters?.shifts || [],
                              punchConditions: st.filters?.punchConditions || []
                            },
                            columns: colKeys.length > 0 ? colKeys : selectedColumns,
                            sheetStructure: st.sheetStructure || 'SINGLE'
                          });
                        }}
                        className="px-3.5 py-1.5 bg-bjk-teal text-white rounded-xl text-xs font-bold"
                      >
                        Run Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EXPORT HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attendance Report Audit & Export History</h2>
              <p className="text-xs text-slate-500">
                Immutable audit trail of generated attendance spreadsheets in compliance with 21 CFR Part 11 requirements.
              </p>
            </div>
            <button
              onClick={loadTemplatesAndHistory}
              className="text-xs text-bjk-teal font-semibold hover:underline flex items-center space-x-1"
            >
              <RotateCcw size={12} />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Report Name</th>
                  <th className="px-4 py-3">Generated By</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Records</th>
                  <th className="px-4 py-3">Filters Applied</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Generated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      No report exports logged yet.
                    </td>
                  </tr>
                ) : (
                  reportHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900 flex items-center space-x-2">
                        <FileSpreadsheet size={15} className="text-emerald-600" />
                        <span>{item.reportName}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{item.generatedByName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{item.dateRange || '-'}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.recordCount} rows</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate" title={item.filtersSummary}>
                        {item.filtersSummary || '-'}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{item.format}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div>
              <h3 className="text-base font-bold text-slate-900">Save Current Configuration as Template</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Save active filters and column ordering to re-run this exact report with one click later.
              </p>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Template Name *</label>
                <input
                  required
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Monthly Production Roster"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-bjk-teal focus:border-bjk-teal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="e.g. Production team attendance with overtime and half day breakdown."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-bjk-teal focus:border-bjk-teal"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
