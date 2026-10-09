const HRCompliance = require('../../models/hrms/HRCompliance');
const Credential = require('../../models/hrms/Credential');
const { TrainingEnrollment } = require('../../models/hrms/Training');
const { recordAudit } = require('../../middleware/audit');

// GET /api/hrms/compliance
const getCompliance = async (req, res) => {
  try {
    const rules = await HRCompliance.find({}).sort({ standard: 1 });

    // Overall pharma compliance index
    const totalCredentials = await Credential.countDocuments({});
    const validCredentials = await Credential.countDocuments({ status: 'VALID' });
    const credCompliancePct = totalCredentials > 0 ? Math.round((validCredentials / totalCredentials) * 100) : 100;

    const totalTrainings = await TrainingEnrollment.countDocuments({});
    const completedTrainings = await TrainingEnrollment.countDocuments({ status: 'COMPLETED' });
    const trainingCompliancePct = totalTrainings > 0 ? Math.round((completedTrainings / totalTrainings) * 100) : 100;

    const overallScore = Math.round((credCompliancePct * 0.5) + (trainingCompliancePct * 0.5));

    res.json({
      success: true,
      rules,
      metrics: {
        overallScore,
        credCompliancePct,
        trainingCompliancePct,
        activeAudits: 2,
        cleanroomReadiness: overallScore >= 85 ? 'AUTHORIZED' : 'RESTRICTED'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCompliance };

