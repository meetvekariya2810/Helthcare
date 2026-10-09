const path = require('path');
const fs = require('fs');

const {
  validateAttendanceImport,
  executeAttendanceImport,
  rollbackAttendanceImport,
  DEFAULT_CSV_PATH,
  SOURCE_FILE_NAME
} = require('../../services/hrms/attendanceImportService');

const {
  validateMasterSheet,
  enrichMatchedProfiles
} = require('../../services/hrms/employeeMasterSyncService');

const Attendance = require('../../models/hrms/Attendance');
const AttendanceMonthlySummary = require('../../models/hrms/AttendanceMonthlySummary');
const AttendanceImportBatch = require('../../models/hrms/AttendanceImportBatch');
const User = require('../../models/User');
const Employee = require('../../models/Employee');

const PRIVILEGED_ROLES = [
  'SUPER_ADMIN',
  'DIRECTOR',
  'HR_ADMIN',
  'HR_MANAGER',
  'HR_EXECUTIVE',
  'SYSTEM_ADMINISTRATOR',
  'ADMIN'
];

function isPrivileged(user) {
  if (!user) return false;
  return PRIVILEGED_ROLES.includes(user.role?.toUpperCase());
}

/**
 * POST /api/attendance/import/validate
 * Run Pre-Import Dry Run
 */
exports.validateImport = async (req, res) => {
  try {
    let csvContent = null;
    let csvPath = DEFAULT_CSV_PATH;

    if (req.file) {
      csvContent = req.file.buffer.toString('utf8');
      csvPath = req.file.originalname;
    } else if (req.body.csvContent) {
      csvContent = req.body.csvContent;
    } else {
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({
          success: false,
          message: `Source file not found at: ${csvPath}. Please upload file.`
        });
      }
    }

    const report = await validateAttendanceImport({
      csvPath,
      csvContent,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance Dry Run Validation Completed',
      data: report
    });
  } catch (error) {
    console.error('[Attendance Validate Error]:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Validation failed'
    });
  }
};

/**
 * POST /api/attendance/import
 * Execute Live Attendance Import
 */
exports.executeImport = async (req, res) => {
  try {
    if (!isPrivileged(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Superadmin and Authorized HR can perform attendance imports.'
      });
    }

    let csvContent = null;
    let csvPath = DEFAULT_CSV_PATH;

    if (req.file) {
      csvContent = req.file.buffer.toString('utf8');
      csvPath = req.file.originalname;
    } else if (req.body.csvContent) {
      csvContent = req.body.csvContent;
    } else {
      if (!fs.existsSync(csvPath)) {
        return res.status(404).json({
          success: false,
          message: `Source file not found at: ${csvPath}. Please upload file.`
        });
      }
    }

    const report = await executeAttendanceImport({
      csvPath,
      csvContent,
      user: req.user
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance data imported successfully into BJK Healthcare database',
      data: report
    });
  } catch (error) {
    console.error('[Attendance Import Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Import failed'
    });
  }
};

/**
 * GET /api/attendance/imports
 * Fetch list of all attendance import batches
 */
exports.getImportBatches = async (req, res) => {
  try {
    if (!isPrivileged(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Authorized HR/Admin only.'
      });
    }

    const batches = await AttendanceImportBatch.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    console.error('[Get Batches Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/attendance/imports/:importBatchId
 * Get details of a specific batch
 */
exports.getImportBatchById = async (req, res) => {
  try {
    if (!isPrivileged(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    const { importBatchId } = req.params;
    const batch = await AttendanceImportBatch.findOne({ importBatchId }).lean();

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: `Import batch [${importBatchId}] not found.`
      });
    }

    const dailyCount = await Attendance.countDocuments({ importBatchId });
    const summaryCount = await AttendanceMonthlySummary.countDocuments({ importBatchId });

    return res.status(200).json({
      success: true,
      data: {
        ...batch,
        activeRecords: {
          dailyCount,
          summaryCount
        },
        isRollbackEligible: batch.status === 'IMPORTED' || batch.status === 'PARTIAL'
      }
    });
  } catch (error) {
    console.error('[Get Batch By Id Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/attendance/imports/:importBatchId/rollback
 * Safe Rollback of a batch
 */
exports.rollbackImport = async (req, res) => {
  try {
    // Rule 15: Allowed ONLY for Superadmin / Authorized HR
    if (!isPrivileged(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Superadmin and Authorized HR can perform rollback.'
      });
    }

    const { importBatchId } = req.params;
    const { reason } = req.body;

    const result = await rollbackAttendanceImport({
      importBatchId,
      user: req.user,
      rollbackReason: reason || 'Administrative rollback triggered from dashboard'
    });

    return res.status(200).json({
      success: true,
      message: 'Rollback Successful',
      data: result
    });
  } catch (error) {
    console.error('[Rollback Error]:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Rollback failed'
    });
  }
};

/**
 * GET /api/attendance/employee/:employeeCode
 * Strict employee isolation as mandated by Section 23 & 26
 */
exports.getEmployeeAttendanceByCode = async (req, res) => {
  try {
    const requestedCode = (req.params.employeeCode || '').trim().toUpperCase();

    // Section 26: Verify authenticated user's identity against the employee record
    if (!isPrivileged(req.user)) {
      const userCode = (req.user.employeeCode || req.user.employeeId || '').toUpperCase().trim();
      if (!userCode || userCode !== requestedCode) {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: You are only authorized to view your own attendance.'
        });
      }
    }

    // Find Employee Info
    const userDoc = await User.findOne({
      $or: [
        { employeeCode: requestedCode },
        { employeeId: requestedCode }
      ]
    }).select('name employeeCode employeeId department role designation email').lean();

    const empDoc = await Employee.findOne({
      $or: [
        { employeeCode: requestedCode },
        { employeeId: requestedCode }
      ]
    }).select('fullName employeeCode employeeId department designation').lean();

    const employeeInfo = {
      name: userDoc?.name || empDoc?.fullName || requestedCode,
      employeeCode: requestedCode,
      department: userDoc?.department || empDoc?.department || 'General',
      designation: userDoc?.designation || empDoc?.designation || 'Staff'
    };

    // Daily attendance records
    const dailyRecords = await Attendance.find({
      $or: [
        { employeeCode: requestedCode },
        { employeeId: requestedCode }
      ]
    }).sort({ attendanceDate: 1, dateString: 1 }).lean();

    // Monthly summaries
    const monthlySummaries = await AttendanceMonthlySummary.find({
      employeeCode: requestedCode
    }).sort({ year: -1, month: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: {
        employee: employeeInfo,
        dailyRecords,
        monthlySummaries
      }
    });
  } catch (error) {
    console.error('[Employee Attendance Query Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/attendance/month/:year/:month
 * Monthly Attendance Overview
 */
exports.getMonthAttendance = async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year or month parameter.'
      });
    }

    const monthStr = String(month).padStart(2, '0');
    const datePrefix = `${year}-${monthStr}`;

    // If regular employee, restrict strictly to their own data
    if (!isPrivileged(req.user)) {
      const userCode = (req.user.employeeCode || req.user.employeeId || '').toUpperCase().trim();
      const dailyRecords = await Attendance.find({
        employeeCode: userCode,
        $or: [
          { month, year },
          { attendanceDate: { $regex: `^${datePrefix}` } },
          { dateString: { $regex: `^${datePrefix}` } }
        ]
      }).sort({ attendanceDate: 1 }).lean();

      const summary = await AttendanceMonthlySummary.findOne({
        employeeCode: userCode,
        month,
        year
      }).lean();

      return res.status(200).json({
        success: true,
        data: {
          year,
          month,
          dailyRecords,
          summary
        }
      });
    }

    // Authorized HR / Admin: full overview
    const [summaries, dailyRecords] = await Promise.all([
      AttendanceMonthlySummary.find({ month, year }).sort({ employeeCode: 1 }).lean(),
      Attendance.find({
        $or: [
          { month, year },
          { attendanceDate: { $regex: `^${datePrefix}` } },
          { dateString: { $regex: `^${datePrefix}` } }
        ]
      }).sort({ employeeCode: 1, attendanceDate: 1 }).lean()
    ]);

    // Aggregate stats
    const stats = {
      totalEmployees: summaries.length,
      totalDailyRecords: dailyRecords.length,
      presentDays: summaries.reduce((acc, s) => acc + (s.present || 0), 0),
      weeklyOffDays: summaries.reduce((acc, s) => acc + (s.weeklyOff || 0), 0),
      holidayDays: summaries.reduce((acc, s) => acc + (s.publicHoliday || 0), 0),
      casualLeaveDays: summaries.reduce((acc, s) => acc + (s.casualLeave || 0), 0),
      sickLeaveDays: summaries.reduce((acc, s) => acc + (s.sickLeave || 0), 0),
      lwpDays: summaries.reduce((acc, s) => acc + (s.leaveWithoutPay || 0), 0)
    };

    return res.status(200).json({
      success: true,
      data: {
        year,
        month,
        stats,
        summaries,
        dailyRecords
      }
    });
  } catch (error) {
    console.error('[Month Attendance Query Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/attendance/department/:departmentId
 * Department-wise Attendance
 */
exports.getDepartmentAttendance = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!isPrivileged(req.user) && req.user.department !== departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You cannot view attendance outside your department.'
      });
    }

    const summaries = await AttendanceMonthlySummary.find({
      sourceDepartment: { $regex: new RegExp(`^${departmentId}$`, 'i') }
    }).lean();

    const dailyRecords = await Attendance.find({
      $or: [
        { sourceDepartment: { $regex: new RegExp(`^${departmentId}$`, 'i') } },
        { departmentName: { $regex: new RegExp(`^${departmentId}$`, 'i') } }
      ]
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        department: departmentId,
        summaries,
        dailyRecords
      }
    });
  } catch (error) {
    console.error('[Department Attendance Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * GET /api/attendance/master-validation
 * Non-destructive Employee Master Sheet vs DB Comparison (Rule 1, 4, 28, 29)
 */
exports.validateMaster = async (req, res) => {
  try {
    if (!isPrivileged(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: HR/Admin privilege required.'
      });
    }

    const fileSource = req.file ? req.file.buffer : null;
    const report = await validateMasterSheet(fileSource);

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[Master Validation Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * POST /api/attendance/master-enrich
 * Non-destructive Profile Setup & Fill KYC/Bank Data for Matched Employees
 */
exports.enrichMasterProfiles = async (req, res) => {
  try {
    if (!isPrivileged(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: HR/Admin privilege required.'
      });
    }

    const fileSource = req.file ? req.file.buffer : null;
    const result = await enrichMatchedProfiles(req.user, fileSource);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Master Profile Enrichment Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
