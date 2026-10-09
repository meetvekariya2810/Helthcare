const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const LeaveLedger = require('../../models/hrms/LeaveLedger');
const { LeaveBalance } = require('../../models/hrms/Leave');
const Employee = require('../../models/hrms/Employee');
const AuditLog = require('../../models/AuditLog');

const MONTH_NAMES = [
  'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26',
  'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26'
];

/**
 * Standard CSV Line Parser handling quotes and commas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const parseNumber = (val) => {
  if (val === undefined || val === null) return 0;
  const s = String(val).trim();
  if (s === '' || isNaN(s)) return 0;
  return Number(parseFloat(s).toFixed(2));
};

/**
 * Parse Leave 2026 CSV file content
 */
function parseLeave2026CSV(csvContent) {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length < 3) {
    throw new Error('CSV does not have enough rows for 2026 Leave data.');
  }

  const records = [];

  // Line 0 and 1 are headers. Line 2 onwards are data rows.
  for (let r = 2; r < lines.length; r++) {
    const cols = parseCSVLine(lines[r]);
    const empCode = (cols[1] || '').trim().toUpperCase();
    const empName = (cols[2] || '').trim();
    if (!empCode || !empName) continue;

    const srNo = parseNumber(cols[0]) || (r - 1);
    const dept = (cols[3] || '').trim().toUpperCase();
    const doj = (cols[4] || '').trim();
    const openCL = parseNumber(cols[5]);
    const openSL = parseNumber(cols[6]);

    const monthlyBreakdown = [];
    let colIdx = 7;
    for (let m = 0; m < 10; m++) {
      const cl = parseNumber(cols[colIdx]);
      const sl = parseNumber(cols[colIdx + 1]);
      const lwp = parseNumber(cols[colIdx + 2]);
      const total = Number((cl + sl + lwp).toFixed(2));
      const monthIdx = m + 1;
      const monthKey = `2026-${String(monthIdx).padStart(2, '0')}`;

      monthlyBreakdown.push({
        monthName: MONTH_NAMES[m],
        monthIndex: monthIdx,
        monthKey,
        cl,
        sl,
        lwp,
        total
      });
      colIdx += 3;
    }

    const takenCL = parseNumber(cols[colIdx]);
    const takenSL = parseNumber(cols[colIdx + 1]);
    const takenLWP = parseNumber(cols[colIdx + 2]);
    const takenTotal = Number((takenCL + takenSL + takenLWP).toFixed(2));

    const closeCL = parseNumber(cols[colIdx + 3]);
    const closeSL = parseNumber(cols[colIdx + 4]);
    const closeTotal = Number((closeCL + closeSL).toFixed(2));

    const extraCols = cols.slice(colIdx + 5).filter(c => c && c.trim().length > 0);

    records.push({
      srNo,
      employeeCode: empCode,
      employeeName: empName,
      department: dept,
      doj,
      year: 2026,
      openingBalance: {
        cl: openCL,
        sl: openSL,
        total: Number((openCL + openSL).toFixed(2))
      },
      monthlyBreakdown,
      totalLeaveTaken: {
        cl: takenCL,
        sl: takenSL,
        lwp: takenLWP,
        total: takenTotal
      },
      closingBalance: {
        cl: closeCL,
        sl: closeSL,
        total: closeTotal
      },
      extraNotes: extraCols.join('; '),
      sourceType: 'Leave 2026(Sheet1).csv',
      sourceYear: 2026,
      sourceRow: r + 1,
      rawValues: cols
    });
  }

  return records;
}

/**
 * Sync Leave Ledger and LeaveBalance collections from the 2026 CSV file
 */
async function syncLeaveLedgerFromSeed(filePath) {
  try {
    const csvPath = filePath || path.join(__dirname, '..', '..', 'seed', 'Leave 2026(Sheet1).csv');
    if (!fs.existsSync(csvPath)) {
      console.warn(`[LeaveLedgerService] Seed CSV not found at ${csvPath}`);
      return { success: false, message: 'CSV file not found' };
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const records = parseLeave2026CSV(content);

    let created = 0;
    let updated = 0;

    for (const rec of records) {
      const existing = await LeaveLedger.findOne({ employeeCode: rec.employeeCode, year: 2026 });
      if (!existing) {
        await LeaveLedger.create(rec);
        created++;
      } else {
        Object.assign(existing, rec);
        existing.lastUpdated = new Date();
        await existing.save();
        updated++;
      }

      // Also ensure LeaveBalance collection has synchronized balances for this employee
      try {
        let emp = await Employee.findOne({
          $or: [
            { employeeCode: rec.employeeCode },
            { employeeId: rec.employeeCode }
          ]
        });

        let balDoc = await LeaveBalance.findOne({ employeeId: rec.employeeCode, leaveYear: 2026 });
        if (!balDoc && emp) {
          balDoc = new LeaveBalance({
            employee: emp._id,
            employeeId: rec.employeeCode,
            employeeName: rec.employeeName,
            department: rec.department,
            leaveYear: 2026,
            year: 2026,
            balances: []
          });
        }

        if (balDoc) {
          balDoc.balances = [
            {
              leaveType: 'CASUAL_LEAVE',
              leaveTypeName: 'Casual Leave (CL)',
              openingBalance: rec.openingBalance.cl,
              allocated: rec.openingBalance.cl,
              carriedForward: 0,
              adjusted: 0,
              used: rec.totalLeaveTaken.cl,
              pending: 0,
              available: rec.closingBalance.cl,
              lastUpdated: new Date()
            },
            {
              leaveType: 'SICK_LEAVE',
              leaveTypeName: 'Sick Leave (SL)',
              openingBalance: rec.openingBalance.sl,
              allocated: rec.openingBalance.sl,
              carriedForward: 0,
              adjusted: 0,
              used: rec.totalLeaveTaken.sl,
              pending: 0,
              available: rec.closingBalance.sl,
              lastUpdated: new Date()
            },
            {
              leaveType: 'LEAVE_WITHOUT_PAY',
              leaveTypeName: 'Leave Without Pay (LWP)',
              openingBalance: 0,
              allocated: 0,
              carriedForward: 0,
              adjusted: 0,
              used: rec.totalLeaveTaken.lwp,
              pending: 0,
              available: 0,
              lastUpdated: new Date()
            }
          ];
          balDoc.employeeName = rec.employeeName;
          balDoc.department = rec.department;
          await balDoc.save();
        }
      } catch (balErr) {
        console.warn(`[LeaveLedgerService] Note updating LeaveBalance for ${rec.employeeCode}:`, balErr.message);
      }
    }

    console.log(`[LeaveLedgerService] Successfully synced 2026 leave data: ${created} created, ${updated} updated (Total ${records.length} employees).`);
    return { success: true, count: records.length, created, updated };
  } catch (err) {
    console.error('[LeaveLedgerService.syncLeaveLedgerFromSeed Error]:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Get single employee's complete 2026 leave ledger
 */
async function getEmployeeLedger(employeeCode, year = 2026) {
  if (!employeeCode) return null;
  const empCode = String(employeeCode).toUpperCase().trim();
  let ledger = await LeaveLedger.findOne({ employeeCode: empCode, year: Number(year) });
  if (!ledger) {
    // Try syncing if not found
    await syncLeaveLedgerFromSeed();
    ledger = await LeaveLedger.findOne({ employeeCode: empCode, year: Number(year) });
  }
  return ledger;
}

/**
 * Get all leave ledgers with filtering
 */
async function getAllLedgers(filters = {}) {
  const { search, department, month, leaveType, year = 2026, page = 1, limit = 100 } = filters;

  const query = { year: Number(year) };

  if (department && department !== 'ALL') {
    query.department = new RegExp(`^${department.trim()}$`, 'i');
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { employeeCode: new RegExp(s, 'i') },
      { employeeName: new RegExp(s, 'i') },
      { department: new RegExp(s, 'i') }
    ];
  }

  const count = await LeaveLedger.countDocuments(query);
  const skip = (Number(page) - 1) * Number(limit);
  const ledgers = await LeaveLedger.find(query)
    .sort({ srNo: 1, employeeCode: 1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit)) || 1,
    ledgers
  };
}

/**
 * Get Monthly Leave matrix for all employees
 */
async function getMonthlyMatrix(monthName, year = 2026, filters = {}) {
  const { department, search } = filters;
  const query = { year: Number(year) };

  if (department && department !== 'ALL') {
    query.department = new RegExp(`^${department.trim()}$`, 'i');
  }
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { employeeCode: new RegExp(s, 'i') },
      { employeeName: new RegExp(s, 'i') },
      { department: new RegExp(s, 'i') }
    ];
  }

  const ledgers = await LeaveLedger.find(query).sort({ srNo: 1, employeeCode: 1 });
  const targetMonth = monthName || 'Jan-26';

  const rows = ledgers.map(l => {
    const mData = (l.monthlyBreakdown || []).find(m => m.monthName.toLowerCase() === targetMonth.toLowerCase()) || {
      cl: 0,
      sl: 0,
      lwp: 0,
      total: 0
    };

    return {
      srNo: l.srNo,
      employeeCode: l.employeeCode,
      employeeName: l.employeeName,
      department: l.department,
      doj: l.doj,
      month: targetMonth,
      cl: mData.cl,
      sl: mData.sl,
      lwp: mData.lwp,
      total: mData.total,
      closingBalance: l.closingBalance
    };
  });

  const totals = rows.reduce((acc, r) => {
    acc.cl = Number((acc.cl + r.cl).toFixed(2));
    acc.sl = Number((acc.sl + r.sl).toFixed(2));
    acc.lwp = Number((acc.lwp + r.lwp).toFixed(2));
    acc.total = Number((acc.total + r.total).toFixed(2));
    return acc;
  }, { cl: 0, sl: 0, lwp: 0, total: 0 });

  return {
    month: targetMonth,
    year: Number(year),
    count: rows.length,
    totals,
    rows
  };
}

/**
 * Get Department-wise Leave analytics
 */
async function getDepartmentAnalytics(year = 2026) {
  const ledgers = await LeaveLedger.find({ year: Number(year) });
  const deptMap = {};

  ledgers.forEach(l => {
    const dept = l.department || 'OTHER';
    if (!deptMap[dept]) {
      deptMap[dept] = {
        department: dept,
        employeeCount: 0,
        openingCL: 0,
        openingSL: 0,
        takenCL: 0,
        takenSL: 0,
        takenLWP: 0,
        takenTotal: 0,
        closingCL: 0,
        closingSL: 0
      };
    }
    const d = deptMap[dept];
    d.employeeCount++;
    d.openingCL += l.openingBalance.cl;
    d.openingSL += l.openingBalance.sl;
    d.takenCL += l.totalLeaveTaken.cl;
    d.takenSL += l.totalLeaveTaken.sl;
    d.takenLWP += l.totalLeaveTaken.lwp;
    d.takenTotal += l.totalLeaveTaken.total;
    d.closingCL += l.closingBalance.cl;
    d.closingSL += l.closingBalance.sl;
  });

  const list = Object.values(deptMap).map(d => ({
    ...d,
    openingCL: Number(d.openingCL.toFixed(2)),
    openingSL: Number(d.openingSL.toFixed(2)),
    takenCL: Number(d.takenCL.toFixed(2)),
    takenSL: Number(d.takenSL.toFixed(2)),
    takenLWP: Number(d.takenLWP.toFixed(2)),
    takenTotal: Number(d.takenTotal.toFixed(2)),
    closingCL: Number(d.closingCL.toFixed(2)),
    closingSL: Number(d.closingSL.toFixed(2))
  })).sort((a, b) => b.employeeCount - a.employeeCount);

  return list;
}

/**
 * Overall KPI calculation for HR/Admin leave dashboard
 */
async function getLeaveKPIs(year = 2026) {
  const ledgers = await LeaveLedger.find({ year: Number(year) });
  const { LeaveRequest } = require('../../models/hrms/Leave');

  const pendingCount = await LeaveRequest.countDocuments({
    currentStatus: { $in: ['TEAM_MANAGER_PENDING', 'DEPARTMENT_MANAGER_PENDING', 'HR_REVIEW', 'SUBMITTED', 'MANAGER_REVIEW'] }
  });
  const approvedCount = await LeaveRequest.countDocuments({ currentStatus: 'APPROVED' });
  const rejectedCount = await LeaveRequest.countDocuments({ currentStatus: { $in: ['REJECTED', 'TEAM_MANAGER_REJECTED', 'DEPARTMENT_MANAGER_REJECTED'] } });

  const totalEmployees = ledgers.length;
  let totalCLTaken = 0;
  let totalSLTaken = 0;
  let totalLWPTaken = 0;
  let totalLeaveTaken = 0;
  let totalClosingBalance = 0;

  ledgers.forEach(l => {
    totalCLTaken += l.totalLeaveTaken.cl || 0;
    totalSLTaken += l.totalLeaveTaken.sl || 0;
    totalLWPTaken += l.totalLeaveTaken.lwp || 0;
    totalLeaveTaken += l.totalLeaveTaken.total || 0;
    totalClosingBalance += l.closingBalance.total || 0;
  });

  return {
    totalEmployees,
    pendingRequests: pendingCount,
    approvedRequests: approvedCount,
    rejectedRequests: rejectedCount,
    totalCLTaken: Number(totalCLTaken.toFixed(2)),
    totalSLTaken: Number(totalSLTaken.toFixed(2)),
    totalLWPTaken: Number(totalLWPTaken.toFixed(2)),
    totalLeaveTaken: Number(totalLeaveTaken.toFixed(2)),
    totalClosingBalance: Number(totalClosingBalance.toFixed(2))
  };
}

module.exports = {
  parseCSVLine,
  parseLeave2026CSV,
  syncLeaveLedgerFromSeed,
  getEmployeeLedger,
  getAllLedgers,
  getMonthlyMatrix,
  getDepartmentAnalytics,
  getLeaveKPIs,
  MONTH_NAMES
};
