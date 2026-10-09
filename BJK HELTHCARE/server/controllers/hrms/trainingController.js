const { TrainingProgram, TrainingEnrollment } = require('../../models/hrms/Training');
const Employee = require('../../models/hrms/Employee');
const { recordAudit } = require('../../middleware/audit');
const { generateTrainingCertificatePDF } = require('../../services/hrms/pdfService');
const { getScopeQuery } = require('../../services/hrms/dataScopeService');

// GET /api/hrms/training/programs
const getPrograms = async (req, res) => {
  try {
    const programs = await TrainingProgram.find({ isActive: true }).sort({ category: 1, title: 1 });
    res.json({ success: true, programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/training/enrollments
const getEnrollments = async (req, res) => {
  try {
    const { category, status, employeeId } = req.query;
    const query = {};

    const scopeFilter = getScopeQuery(req.user, 'training');
    Object.assign(query, scopeFilter);

    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.status = status;
    if (employeeId && (!scopeFilter.employeeId)) query.employeeId = employeeId;

    const enrollments = await TrainingEnrollment.find(query).sort({ createdAt: -1 });

    // Compliance statistics
    const totalEnrollments = await TrainingEnrollment.countDocuments({});
    const completed = await TrainingEnrollment.countDocuments({ status: 'COMPLETED' });
    const overdue = await TrainingEnrollment.countDocuments({ status: 'OVERDUE' });
    const inProgress = await TrainingEnrollment.countDocuments({ status: { $in: ['ENROLLED', 'IN_PROGRESS'] } });
    const complianceRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 100;

    res.json({
      success: true,
      enrollments,
      complianceStats: {
        total: totalEnrollments,
        completed,
        overdue,
        inProgress,
        complianceRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/training/enroll
const enrollEmployee = async (req, res) => {
  try {
    const { programId, employeeId } = req.body;
    const program = await TrainingProgram.findById(programId);
    if (!program) return res.status(404).json({ success: false, message: 'Training program not found' });

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    const enrollment = await TrainingEnrollment.create({
      program: program._id,
      programCode: program.code,
      programTitle: program.title,
      category: program.category,
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      departmentName: employee.departmentName,
      status: 'ENROLLED'
    });

    res.status(201).json({ success: true, message: 'Employee enrolled in training', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/training/complete/:id
const completeTraining = async (req, res) => {
  try {
    const { scorePercentage, certificateNumber } = req.body;
    const enrollment = await TrainingEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    enrollment.status = 'COMPLETED';
    enrollment.completionDate = new Date();
    enrollment.scorePercentage = scorePercentage || 95;
    enrollment.certificateNumber = certificateNumber || `BJK-CERT-${Date.now().toString().slice(-6)}`;
    
    // Set expiry 12 months in future for periodic retraining
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    enrollment.expiryDate = expiry;
    enrollment.verifiedBy = req.user ? req.user.name : 'Quality Assurance Evaluator';

    await enrollment.save();

    await recordAudit({
      req,
      action: 'TRAINING_COMPLETED',
      module: 'TRAINING',
      recordId: enrollment._id,
      details: `${enrollment.employeeName} completed ${enrollment.programTitle} with score ${enrollment.scorePercentage}%`
    });

    res.json({ success: true, message: 'Training completed successfully', enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/training/enrollments/:id/certificate-pdf
const downloadCertificatePDF = async (req, res) => {
  try {
    const enrollment = await TrainingEnrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment record not found' });

    if (enrollment.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Certificate is only available for completed training' });
    }

    const program = await TrainingProgram.findById(enrollment.program);
    const employee = await Employee.findOne({ employeeId: enrollment.employeeId });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BJK_Certificate_${enrollment.employeeId}_${enrollment.programCode}.pdf`);

    await recordAudit({
      req,
      action: 'CERTIFICATE_PDF_DOWNLOADED',
      module: 'TRAINING',
      recordId: enrollment._id,
      details: `Generated and downloaded training certificate PDF for ${enrollment.employeeName} (${enrollment.programTitle})`
    });

    generateTrainingCertificatePDF(enrollment, program, employee, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = {
  getPrograms,
  getEnrollments,
  enrollEmployee,
  completeTraining,
  downloadCertificatePDF
};
