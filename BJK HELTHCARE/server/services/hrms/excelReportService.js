const ExcelJS = require('exceljs');

// Standard Column Definition Catalog for BJK Healthcare Attendance
const COLUMN_CATALOG = {
  siNo: { label: 'SI No.', width: 8, align: 'center', getter: (r, idx) => idx + 1 },
  employeeId: { label: 'Employee ID', width: 15, align: 'center', getter: r => r.employeeCode || r.employeeId || '' },
  employeeName: { label: 'Employee Name', width: 22, align: 'left', getter: r => r.sourceEmployeeName || r.employeeName || '' },
  branchName: { label: 'Branch', width: 18, align: 'left', getter: r => r.branchName || 'Ahmedabad Branch' },
  departmentName: { label: 'Department', width: 20, align: 'left', getter: r => r.sourceDepartment || r.departmentName || 'General' },
  subDepartmentName: { label: 'Sub Department', width: 18, align: 'left', getter: r => r.subDepartmentName || '-' },
  designationTitle: { label: 'Designation', width: 20, align: 'left', getter: r => r.designationTitle || '-' },
  dateString: { label: 'Date', width: 14, align: 'center', getter: r => r.attendanceDate || r.dateString || (r.date ? new Date(r.date).toISOString().split('T')[0] : '') },
  date: { label: 'Date', width: 14, align: 'center', getter: r => r.attendanceDate || r.dateString || (r.date ? new Date(r.date).toISOString().split('T')[0] : '') },
  day: { label: 'Day', width: 12, align: 'center', getter: r => (r.date || r.attendanceDate || r.dateString) ? new Date(r.date || r.attendanceDate || r.dateString).toLocaleDateString('en-US', { weekday: 'short' }) : '' },
  branch: { label: 'Branch', width: 18, align: 'left', getter: r => r.branchName || 'Ahmedabad' },
  department: { label: 'Department', width: 20, align: 'left', getter: r => r.sourceDepartment || r.departmentName || 'General' },
  designation: { label: 'Designation', width: 20, align: 'left', getter: r => r.designationTitle || '-' },
  shiftName: { label: 'Shift', width: 18, align: 'left', getter: r => r.shiftName || 'General Shift' },
  shift: { label: 'Shift', width: 18, align: 'left', getter: r => r.shiftName || 'General Shift' },
  scheduledIn: { label: 'Scheduled In', width: 14, align: 'center', getter: r => r.scheduledIn || '09:00' },
  scheduledOut: { label: 'Scheduled Out', width: 14, align: 'center', getter: r => r.scheduledOut || '18:00' },
  actualIn: { label: 'Actual IN', width: 14, align: 'center', getter: r => r.actualIn || (r.checkIn ? formatTime(r.checkIn) : (['P', 'PRESENT', 'M'].includes(r.attendanceStatus || r.status) ? '09:00' : '--')) },
  actualOut: { label: 'Actual OUT', width: 14, align: 'center', getter: r => r.actualOut || (r.checkOut ? formatTime(r.checkOut) : (['P', 'PRESENT'].includes(r.attendanceStatus || r.status) ? '18:00' : '--')) },
  status: { label: 'Attendance Status', width: 18, align: 'center', getter: r => formatStatus(r.attendanceStatus || r.status) },
  lateMinutes: { label: 'Late By (Mins)', width: 14, align: 'right', getter: r => r.lateMinutes || 0 },
  lateBy: { label: 'Late By', width: 14, align: 'right', getter: r => r.lateMinutes ? `${r.lateMinutes} mins` : '0 mins' },
  earlyExitMinutes: { label: 'Early By (Mins)', width: 14, align: 'right', getter: r => r.earlyExitMinutes || 0 },
  earlyBy: { label: 'Early By', width: 14, align: 'right', getter: r => r.earlyExitMinutes ? `${r.earlyExitMinutes} mins` : '0 mins' },
  workingHours: { label: 'Working Hours', width: 14, align: 'right', getter: r => (r.workingHours ? Number(r.workingHours).toFixed(2) : (['P', 'PRESENT'].includes(r.attendanceStatus || r.status) ? '8.00' : '0.00')) },
  overtimeHours: { label: 'Overtime (Hrs)', width: 14, align: 'right', getter: r => (r.overtimeHours ? Number(r.overtimeHours).toFixed(2) : '0.00') },
  overtime: { label: 'Overtime', width: 14, align: 'right', getter: r => r.overtimeHours ? `${r.overtimeHours} hrs` : '0 hrs' },
  nightHours: { label: 'Night Hours', width: 14, align: 'right', getter: r => r.nightHours ? `${r.nightHours} hrs` : '0 hrs' },
  halfDayType: { label: 'Half Day Type', width: 16, align: 'center', getter: r => (r.halfDayType && r.halfDayType !== 'NONE' ? r.halfDayType : '-') },
  leaveType: { label: 'Leave Type', width: 14, align: 'center', getter: r => (r.leaveType && r.leaveType !== 'NONE' ? r.leaveType : '-') },
  workLocation: { label: 'Work Location', width: 16, align: 'left', getter: r => r.workLocation || 'PLANT' },
  source: { label: 'Punch Source', width: 14, align: 'center', getter: r => r.source || 'WEB' },
  punchSource: { label: 'Punch Source', width: 14, align: 'center', getter: r => r.source || 'WEB' },
  punchCondition: { label: 'Punch Condition', width: 18, align: 'center', getter: r => r.punchCondition || (r.checkIn && !r.checkOut ? 'MISSING_OUT' : 'HAS_BOTH') },
  regularizationStatus: { label: 'Regularization Status', width: 20, align: 'center', getter: r => r.regularizationStatus || r.correctionStatus || 'NONE' },
  correctionStatus: { label: 'Regularization Status', width: 20, align: 'center', getter: r => r.correctionStatus || 'NONE' },
  remarks: { label: 'Remarks', width: 25, align: 'left', getter: r => r.remarks || r.correctionRemarks || '-' }
};

function formatTime(dateVal) {
  if (!dateVal) return '--';
  const d = new Date(dateVal);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatStatus(status) {
  if (!status) return 'ABSENT';
  const u = String(status).toUpperCase().trim();
  if (u === 'P' || u === 'PRESENT') return 'PRESENT';
  if (u === 'WO' || u === 'WEEK_OFF' || u === 'WEEKOFF') return 'WEEK OFF';
  if (u === 'PH' || u === 'HOLIDAY' || u === 'PUBLIC_HOLIDAY') return 'HOLIDAY';
  if (u === 'CL' || u === 'CASUAL_LEAVE') return 'CASUAL LEAVE (CL)';
  if (u === 'SL' || u === 'SICK_LEAVE') return 'SICK LEAVE (SL)';
  if (u === 'CO' || u === 'COMP_OFF') return 'COMP OFF (CO)';
  if (u === 'LWP' || u === 'LEAVE_WITHOUT_PAY') return 'LWP';
  if (u === 'AB' || u === 'A' || u === 'ABSENT') return 'ABSENT';
  if (u === 'P1/2' || u === 'HALF_DAY') return 'HALF DAY';
  if (u === 'M') return 'PRESENT (M)';
  if (u === 'E') return 'EMERGENCY LEAVE';
  return status.replace(/_/g, ' ');
}

// Color coding for status values
const STATUS_COLORS = {
  PRESENT: { bg: 'D1FAE5', fg: '065F46' }, // emerald
  LATE: { bg: 'FEF3C7', fg: '92400E' },    // amber
  HALF_DAY: { bg: 'FFEDD5', fg: '9A3412' },// orange
  ABSENT: { bg: 'FEE2E2', fg: '991B1B' },  // rose
  ON_LEAVE: { bg: 'EDE9FE', fg: '5B21B6' },// purple
  WORK_FROM_HOME: { bg: 'E0F2FE', fg: '075985' }, // sky
  FIELD_DUTY: { bg: 'CCFBF1', fg: '115E59' }, // teal
  HOLIDAY: { bg: 'F3E8FF', fg: '6B21A8' }, // fuchsia
  WEEK_OFF: { bg: 'F1F5F9', fg: '475569' } // slate
};

/**
 * Builds an Excel Workbook (.xlsx) according to strict BJK Enterprise HRMS specifications.
 */
async function generateAttendanceExcel({
  records = [],
  selectedColumns = [],
  metadata = {},
  sheetsMode = 'SINGLE'
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BJK Healthcare Digital Brain';
  workbook.lastModifiedBy = metadata.generatedByName || 'HR Admin';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Resolve active column definitions in requested order
  const activeColKeys = (selectedColumns && selectedColumns.length > 0)
    ? selectedColumns.map(c => typeof c === 'string' ? c : (c.key || c.id)).filter(k => COLUMN_CATALOG[k])
    : ['siNo', 'employeeId', 'employeeName', 'departmentName', 'dateString', 'shiftName', 'actualIn', 'actualOut', 'status', 'workingHours'];

  // -------------------------------------------------------------
  // Option 1: Multi-sheet SUMMARY + DETAILED
  // -------------------------------------------------------------
  if (sheetsMode === 'SUMMARY_DETAIL') {
    createSummarySheet(workbook, records, metadata);
    createDetailedSheet(workbook, 'Detailed Attendance Records', records, activeColKeys, metadata);
  }
  // -------------------------------------------------------------
  // Option 2: Multi-sheet BY DEPARTMENT
  // -------------------------------------------------------------
  else if (sheetsMode === 'BY_DEPARTMENT') {
    createSummarySheet(workbook, records, metadata);
    const byDept = {};
    records.forEach(r => {
      const dept = r.departmentName || 'General';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(r);
    });

    Object.keys(byDept).forEach(deptName => {
      // Excel sheet names limited to 31 chars and no special chars
      const safeSheetName = deptName.replace(/[:\\/?*[\]]/g, '').slice(0, 30);
      createDetailedSheet(workbook, safeSheetName, byDept[deptName], activeColKeys, { ...metadata, department: deptName });
    });
  }
  // -------------------------------------------------------------
  // Option 3: Default SINGLE SHEET
  // -------------------------------------------------------------
  else {
    createDetailedSheet(workbook, 'Attendance Report', records, activeColKeys, metadata);
  }

  // Generate binary buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

/**
 * Creates the Executive Summary Sheet
 */
function createSummarySheet(workbook, records, metadata) {
  const sheet = workbook.addWorksheet('Executive Summary', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'BJK HEALTHCARE PRIVATE LIMITED';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A896' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 36;

  sheet.mergeCells('A2:F2');
  const subCell = sheet.getCell('A2');
  subCell.value = 'ATTENDANCE INTELLIGENCE SUMMARY & AUDIT AUDIT';
  subCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 24;

  // Metadata block
  sheet.getCell('A4').value = 'Report Period:';
  sheet.getCell('B4').value = metadata.dateRange || 'Current Active Period';
  sheet.getCell('D4').value = 'Generated By:';
  sheet.getCell('E4').value = metadata.generatedByName || 'HR Operations';

  sheet.getCell('A5').value = 'Branch Scope:';
  sheet.getCell('B5').value = metadata.branches || 'Ahmedabad Branch';
  sheet.getCell('D5').value = 'Generated On:';
  sheet.getCell('E5').value = new Date().toLocaleString();

  sheet.getCell('A6').value = 'Department Scope:';
  sheet.getCell('B6').value = metadata.departments || 'All Departments';
  sheet.getCell('D6').value = 'Total Records:';
  sheet.getCell('E6').value = records.length;

  ['A4', 'A5', 'A6', 'D4', 'D5', 'D6'].forEach(cellId => {
    sheet.getCell(cellId).font = { bold: true, color: { argb: 'FF475569' } };
  });

  // KPI Statistics Calculation
  const totalRecords = records.length;
  const presentCount = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const absentCount = records.filter(r => r.status === 'ABSENT').length;
  const lateCount = records.filter(r => r.status === 'LATE').length;
  const halfDayCount = records.filter(r => r.status === 'HALF_DAY').length;
  const leaveCount = records.filter(r => r.status === 'ON_LEAVE').length;
  const overtimeCount = records.filter(r => (r.overtimeHours || 0) > 0).length;
  const totalWorkingHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0);
  const totalOvertimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  // KPI Overview Section
  sheet.getCell('A8').value = 'KEY ATTENDANCE METRICS';
  sheet.getCell('A8').font = { bold: true, size: 12, color: { argb: 'FF00A896' } };

  const kpis = [
    ['Total Registered Records', totalRecords],
    ['Present Employees', presentCount],
    ['Absent Employees', absentCount],
    ['Late Arrivals', lateCount],
    ['Half Day Records', halfDayCount],
    ['Approved Leaves', leaveCount],
    ['Overtime Instances', overtimeCount],
    ['Total Working Hours', totalWorkingHours.toFixed(2)],
    ['Total Overtime Hours', totalOvertimeHours.toFixed(2)]
  ];

  sheet.getRow(9).values = ['Metric Dimension', 'Count / Total'];
  sheet.getRow(9).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(9).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  });

  kpis.forEach((kpi, i) => {
    const row = sheet.getRow(10 + i);
    row.values = [kpi[0], kpi[1]];
    row.getCell(2).alignment = { horizontal: 'right' };
    row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  // Department Breakdown Table
  const deptMap = {};
  records.forEach(r => {
    const d = r.departmentName || 'General';
    if (!deptMap[d]) {
      deptMap[d] = { total: 0, present: 0, absent: 0, late: 0, leave: 0, overtimeHrs: 0 };
    }
    deptMap[d].total += 1;
    if (r.status === 'PRESENT' || r.status === 'LATE') deptMap[d].present += 1;
    if (r.status === 'ABSENT') deptMap[d].absent += 1;
    if (r.status === 'LATE') deptMap[d].late += 1;
    if (r.status === 'ON_LEAVE') deptMap[d].leave += 1;
    deptMap[d].overtimeHrs += (r.overtimeHours || 0);
  });

  const deptStartRow = 10 + kpis.length + 2;
  sheet.getCell(`A${deptStartRow}`).value = 'DEPARTMENTAL PRESENCE BREAKDOWN';
  sheet.getCell(`A${deptStartRow}`).font = { bold: true, size: 12, color: { argb: 'FF00A896' } };

  const deptHeaders = ['Department Name', 'Total Records', 'Present', 'Absent', 'Late', 'Leave', 'Overtime (Hrs)'];
  const headerRow = sheet.getRow(deptStartRow + 1);
  headerRow.values = deptHeaders;
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A896' } };
    cell.alignment = { horizontal: 'center' };
  });

  let curRow = deptStartRow + 2;
  Object.keys(deptMap).forEach(dName => {
    const d = deptMap[dName];
    const r = sheet.getRow(curRow);
    r.values = [dName, d.total, d.present, d.absent, d.late, d.leave, d.overtimeHrs.toFixed(2)];
    r.getCell(1).alignment = { horizontal: 'left' };
    for (let c = 2; c <= 7; c++) {
      r.getCell(c).alignment = { horizontal: 'right' };
    }
    r.eachCell(cell => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
    curRow++;
  });

  // Adjust widths
  sheet.columns = [
    { width: 28 },
    { width: 20 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 16 }
  ];
}

/**
 * Creates Detailed Table Sheet containing ONLY the selected fields and filtered records
 */
function createDetailedSheet(workbook, sheetName, records, activeColKeys, metadata) {
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: 'frozen', ySplit: 7, showGridLines: true }]
  });

  const totalCols = activeColKeys.length;
  const lastColLetter = getColumnLetter(totalCols);

  // 1. Company Banner (Row 1)
  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'BJK HEALTHCARE PRIVATE LIMITED';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00A896' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(1).height = 32;

  // 2. Sub-Banner (Row 2)
  sheet.mergeCells(`A2:${lastColLetter}2`);
  const subCell = sheet.getCell('A2');
  subCell.value = `ATTENDANCE REPORT — ${metadata.reportTitle || 'CUSTOM SELECTION'}`;
  subCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.getRow(2).height = 20;

  // 3. Metadata Block (Rows 4-5)
  sheet.getCell('A4').value = 'Period:';
  sheet.getCell('B4').value = metadata.dateRange || 'Custom Period';
  sheet.getCell('A4').font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
  sheet.getCell('B4').font = { size: 9, bold: true };

  const midCol1 = Math.max(3, Math.floor(totalCols / 2));
  const midCol2 = midCol1 + 1;
  const midLetter1 = getColumnLetter(midCol1);
  const midLetter2 = getColumnLetter(midCol2);

  sheet.getCell(`${midLetter1}4`).value = 'Generated By:';
  sheet.getCell(`${midLetter2}4`).value = metadata.generatedByName || 'HR Admin';
  sheet.getCell(`${midLetter1}4`).font = { bold: true, size: 9, color: { argb: 'FF64748B' } };

  sheet.getCell('A5').value = 'Applied Filters:';
  sheet.getCell('B5').value = metadata.filtersSummary || 'Standard Scope';
  sheet.getCell('A5').font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
  sheet.getCell('B5').font = { size: 9 };

  sheet.getCell(`${midLetter1}5`).value = 'Total Records:';
  sheet.getCell(`${midLetter2}5`).value = `${records.length} records`;
  sheet.getCell(`${midLetter1}5`).font = { bold: true, size: 9, color: { argb: 'FF64748B' } };
  sheet.getCell(`${midLetter2}5`).font = { bold: true, size: 9, color: { argb: 'FF00A896' } };

  // 4. Table Header Row (Row 7)
  const headerRow = sheet.getRow(7);
  headerRow.height = 26;
  const headerValues = activeColKeys.map(k => COLUMN_CATALOG[k].label);
  headerRow.values = headerValues;

  headerRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00A896' } // BJK Teal
    };
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: COLUMN_CATALOG[activeColKeys[colNumber - 1]].align };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF009B8D' } },
      bottom: { style: 'medium', color: { argb: 'FF009B8D' } },
      left: { style: 'thin', color: { argb: 'FF2DD4BF' } },
      right: { style: 'thin', color: { argb: 'FF2DD4BF' } }
    };
  });

  // 5. Insert Data Rows
  records.forEach((record, index) => {
    const rowNum = 8 + index;
    const row = sheet.getRow(rowNum);
    row.height = 22;

    const rowValues = activeColKeys.map(k => {
      const def = COLUMN_CATALOG[k];
      return def ? def.getter(record, index) : '';
    });
    row.values = rowValues;

    // Apply Zebra Striping & Cell Styles
    const isEven = index % 2 === 0;
    const zebraBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

    row.eachCell((cell, colNumber) => {
      const colKey = activeColKeys[colNumber - 1];
      const align = COLUMN_CATALOG[colKey].align;

      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraBg } };
      cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: align };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Status pill coloring
      if (colKey === 'status') {
        const rawStatus = record.status || 'ABSENT';
        const colorSet = STATUS_COLORS[rawStatus] || STATUS_COLORS.ABSENT;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + colorSet.bg } };
        cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF' + colorSet.fg } };
      }
    });
  });

  // Enable AutoFilter on Table Headers
  sheet.autoFilter = {
    from: `A7`,
    to: `${lastColLetter}${7 + records.length}`
  };

  // Auto-fit Column Widths based on content and header
  sheet.columns = activeColKeys.map((k, colIdx) => {
    const def = COLUMN_CATALOG[k];
    let maxLen = def.label.length;
    records.forEach((r, rowIdx) => {
      const val = String(def.getter(r, rowIdx) || '');
      if (val.length > maxLen) maxLen = val.length;
    });
    return {
      width: Math.max(def.width, Math.min(maxLen + 4, 38))
    };
  });
}

function getColumnLetter(colIndex) {
  let temp, letter = '';
  while (colIndex > 0) {
    temp = (colIndex - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    colIndex = (colIndex - temp - 1) / 26;
  }
  return letter || 'A';
}

module.exports = {
  generateAttendanceExcel,
  COLUMN_CATALOG
};
