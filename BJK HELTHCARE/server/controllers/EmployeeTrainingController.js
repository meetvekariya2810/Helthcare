const mongoose = require('mongoose');
const { TrainingProgram, TrainingEnrollment } = require('../models/hrms/Training');
const Credential = require('../models/hrms/Credential');
const Employee = require('../models/Employee');
const { logEmployeeAudit } = require('../middleware/employeeAuth');

/**
 * Ensure default standard pharma training programs exist for this employee
 */
const ensureEmployeeEnrollments = async (employee) => {
  const employeeId = employee.employeeId.toUpperCase();
  let enrollments = await TrainingEnrollment.find({ employeeId });

  if (!enrollments || enrollments.length === 0) {
    // Standard Pharma Training Programs
    const standardTrainings = [
      {
        code: 'TRN-GMP-01',
        title: 'WHO-GMP Personnel Hygiene, Cleanroom Gowning & Sanitation',
        category: 'GMP',
        status: 'COMPLETED',
        scorePercentage: 96,
        completionDate: new Date('2026-01-15'),
        expiryDate: new Date('2027-01-15'),
        certificateNumber: `BJK-CERT-GMP-${employeeId}`
      },
      {
        code: 'TRN-21CFR-02',
        title: 'USFDA 21 CFR Part 11 Electronic Records & Signatures',
        category: 'DATA_INTEGRITY',
        status: 'COMPLETED',
        scorePercentage: 94,
        completionDate: new Date('2026-02-10'),
        expiryDate: new Date('2027-02-10'),
        certificateNumber: `BJK-CERT-CFR-${employeeId}`
      },
      {
        code: 'TRN-DI-03',
        title: 'Data Integrity & ALCOA+ Principles in Pharma Manufacturing',
        category: 'DATA_INTEGRITY',
        status: 'COMPLETED',
        scorePercentage: 98,
        completionDate: new Date('2026-03-01'),
        expiryDate: new Date('2027-03-01'),
        certificateNumber: `BJK-CERT-DI-${employeeId}`
      },
      {
        code: 'TRN-QMS-04',
        title: 'Quality Management Systems (QMS), Deviations & CAPA Handling',
        category: 'QUALITY_SYSTEMS',
        status: 'IN_PROGRESS',
        scorePercentage: null,
        completionDate: null,
        expiryDate: new Date('2026-11-30'),
        certificateNumber: null
      },
      {
        code: 'TRN-EHS-05',
        title: 'Pharmaceutical Chemical Handling, EHS & Emergency Protocols',
        category: 'EHS_SAFETY',
        status: 'COMPLETED',
        scorePercentage: 90,
        completionDate: new Date('2026-02-25'),
        expiryDate: new Date('2027-02-25'),
        certificateNumber: `BJK-CERT-EHS-${employeeId}`
      },
      {
        code: 'TRN-SOP-06',
        title: 'Department Specific SOP & Analytical Equipment Qualification',
        category: 'SOP_COMPLIANCE',
        status: 'IN_PROGRESS',
        scorePercentage: null,
        completionDate: null,
        expiryDate: new Date('2026-12-15'),
        certificateNumber: null
      }
    ];

    const newDocs = [];
    for (const item of standardTrainings) {
      let prog = await TrainingProgram.findOne({ code: item.code });
      if (!prog) {
        prog = await TrainingProgram.create({
          title: item.title,
          code: item.code,
          category: item.category,
          isMandatory: true,
          validityPeriodMonths: 12,
          passingScorePercentage: 80,
          durationHours: 4,
          isDemo: true
        });
      }

      newDocs.push({
        program: prog._id,
        programCode: item.code,
        programTitle: item.title,
        category: item.category,
        employee: employee._id,
        employeeId,
        employeeName: employee.fullName,
        departmentName: employee.departmentName || 'Operations',
        status: item.status,
        scorePercentage: item.scorePercentage,
        completionDate: item.completionDate,
        expiryDate: item.expiryDate,
        certificateNumber: item.certificateNumber,
        isDemo: true
      });
    }

    await TrainingEnrollment.insertMany(newDocs);
    enrollments = await TrainingEnrollment.find({ employeeId });
  }

  return enrollments;
};

/**
 * Ensure default GMP Credential exists for this employee
 */
const ensureEmployeeCredential = async (employee) => {
  const employeeId = employee.employeeId.toUpperCase();
  let cred = await Credential.findOne({ employeeId });

  if (!cred) {
    // Expiry date set to ~328 days in future as requested in prompt example
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - 37); // issued 37 days ago
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 328); // 328 days remaining

    cred = await Credential.create({
      employee: employee._id,
      employeeId,
      employeeName: employee.fullName,
      departmentName: employee.departmentName || 'Quality Control',
      credentialName: 'GMP Cleanroom Grade B Personnel Authorization',
      credentialCode: 'CRED-GMP-GRDB',
      category: 'CLEANROOM_AUTHORIZATION',
      issuingAuthority: 'BJK Quality Assurance Directorate',
      certificateNumber: `GMP-AUTH-${employeeId}-2026`,
      issueDate,
      expiryDate,
      status: 'VALID',
      isMandatoryForRole: true,
      blocksRosterAssignmentOnExpiry: true,
      notes: 'Authorized for Grade B Formulation & Aseptic Processing Zone',
      isDemo: true
    });
  }

  return cred;
};

/**
 * GET /api/employee/training
 * Returns all assigned training records strictly for current employee
 */
const getEmployeeTrainings = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const enrollments = await ensureEmployeeEnrollments(employee);

    // Calculate real stats
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
    const inProgress = enrollments.filter(e => e.status === 'IN_PROGRESS' || e.status === 'ENROLLED').length;
    const overdue = enrollments.filter(e => e.status === 'OVERDUE' || (e.expiryDate && new Date(e.expiryDate) < new Date())).length;
    const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 100;

    return res.status(200).json({
      success: true,
      trainings: enrollments,
      complianceStats: {
        total,
        completed,
        inProgress,
        overdue,
        complianceRate
      }
    });
  } catch (err) {
    console.error('[Get Employee Trainings Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve training records.' });
  }
};

/**
 * GET /api/employee/training/compliance
 * Returns employee's GMP credential, days remaining, and overall compliance summary
 */
const getEmployeeCompliance = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const cred = await ensureEmployeeCredential(employee);
    const enrollments = await ensureEmployeeEnrollments(employee);

    // Calculate exact days remaining from database date
    const now = new Date();
    const expiry = cred.expiryDate ? new Date(cred.expiryDate) : null;
    let daysRemaining = null;
    let credentialStatus = 'VALID';

    if (expiry) {
      const diffMs = expiry - now;
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      if (diffMs <= 0) {
        credentialStatus = 'EXPIRED';
      } else if (daysRemaining <= 30) {
        credentialStatus = 'EXPIRING_SOON';
      } else {
        credentialStatus = 'VALID';
      }
    }

    // Overall compliance
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
    const compliancePercentage = total > 0 ? Math.round((completed / total) * 100) : 100;

    return res.status(200).json({
      success: true,
      credential: {
        id: cred._id,
        name: cred.credentialName,
        code: cred.credentialCode,
        badge: 'GMP Grade B Authorized',
        certificateNumber: cred.certificateNumber,
        issuingAuthority: cred.issuingAuthority,
        issueDate: cred.issueDate,
        validUntil: cred.expiryDate,
        daysRemaining,
        status: credentialStatus
      },
      overallCompliance: {
        percentage: compliancePercentage,
        completedTrainings: completed,
        pendingTrainings: total - completed,
        gmpStatus: credentialStatus,
        sopAcknowledged: 7,
        totalSopRequired: 7
      }
    });
  } catch (err) {
    console.error('[Get Employee Compliance Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve compliance records.' });
  }
};

/**
 * POST /api/employee/training/:id/start
 * Start training module
 */
const startTraining = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;

    const enrollment = await TrainingEnrollment.findOne({
      _id: id,
      employeeId: employeeId.toUpperCase()
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Training enrollment not found.' });
    }

    enrollment.status = 'IN_PROGRESS';
    await enrollment.save();

    await logEmployeeAudit({
      employeeId,
      action: 'START_TRAINING',
      details: { programTitle: enrollment.programTitle, id }
    });

    return res.status(200).json({
      success: true,
      message: `Started module: ${enrollment.programTitle}`,
      training: enrollment
    });
  } catch (err) {
    console.error('[Start Training Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to start training module.' });
  }
};

/**
 * POST /api/employee/training/:id/complete
 * Complete training module and record score
 */
const completeTraining = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;
    const score = req.body.score || 95;

    const enrollment = await TrainingEnrollment.findOne({
      _id: id,
      employeeId: employeeId.toUpperCase()
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Training enrollment not found.' });
    }

    const completionDate = new Date();
    const expiryDate = new Date();
    expiryDate.setFullYear(completionDate.getFullYear() + 1);

    enrollment.status = 'COMPLETED';
    enrollment.scorePercentage = score;
    enrollment.completionDate = completionDate;
    enrollment.expiryDate = expiryDate;
    enrollment.certificateNumber = enrollment.certificateNumber || `BJK-CERT-${Date.now().toString().slice(-6)}`;
    await enrollment.save();

    await logEmployeeAudit({
      employeeId,
      action: 'COMPLETE_TRAINING',
      details: { programTitle: enrollment.programTitle, score, certificateNumber: enrollment.certificateNumber }
    });

    return res.status(200).json({
      success: true,
      message: `Congratulations! You successfully completed ${enrollment.programTitle} with score ${score}%. Certificate generated.`,
      training: enrollment
    });
  } catch (err) {
    console.error('[Complete Training Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to complete training module.' });
  }
};

/**
 * GET /api/employee/training/:id/certificate
 * View or download verified training certificate
 */
const getCertificate = async (req, res) => {
  try {
    const employeeId = req.employeeId;
    const { id } = req.params;

    const enrollment = await TrainingEnrollment.findOne({
      _id: id,
      employeeId: employeeId.toUpperCase()
    });

    if (!enrollment || enrollment.status !== 'COMPLETED') {
      return res.status(404).json({ success: false, message: 'Certificate not available or training incomplete.' });
    }

    return res.status(200).json({
      success: true,
      certificate: {
        certificateNumber: enrollment.certificateNumber,
        title: enrollment.programTitle,
        category: enrollment.category,
        recipient: enrollment.employeeName,
        employeeId: enrollment.employeeId,
        department: enrollment.departmentName,
        score: enrollment.scorePercentage,
        completionDate: enrollment.completionDate,
        validUntil: enrollment.expiryDate,
        issuer: 'BJK Healthcare Quality & GMP Academy',
        status: 'VERIFIED'
      }
    });
  } catch (err) {
    console.error('[Get Certificate Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve certificate.' });
  }
};

module.exports = {
  getEmployeeTrainings,
  getEmployeeCompliance,
  startTraining,
  completeTraining,
  getCertificate
};
