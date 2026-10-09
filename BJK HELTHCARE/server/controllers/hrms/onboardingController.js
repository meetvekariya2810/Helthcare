const Onboarding = require('../../models/hrms/Onboarding');
const { recordAudit } = require('../../middleware/audit');

// GET /api/hrms/onboarding
const getOnboardingList = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const list = await Onboarding.find(query).sort({ targetJoiningDate: 1 });
    res.json({ success: true, list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/onboarding/:id/task
const updateChecklistTask = async (req, res) => {
  try {
    const { taskKey, isCompleted, notes } = req.body;
    const item = await Onboarding.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Onboarding record not found' });

    const task = item.checklist.find(t => t.taskKey === taskKey);
    if (task) {
      task.isCompleted = isCompleted;
      task.completedAt = isCompleted ? new Date() : null;
      task.verifiedBy = req.user ? req.user.name : 'HR Coordinator';
      if (notes) task.notes = notes;
    }

    // Check if all mandatory tasks completed
    const allMandatoryDone = item.checklist.filter(t => t.isMandatory).every(t => t.isCompleted);
    if (allMandatoryDone) {
      item.status = 'COMPLETED';
    }

    await item.save();

    await recordAudit({
      req,
      action: 'ONBOARDING_TASK_UPDATED',
      module: 'ONBOARDING',
      recordId: item._id,
      details: `Updated task ${taskKey} for ${item.candidateName} (Done: ${isCompleted})`
    });

    res.json({ success: true, message: 'Task updated', item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOnboardingList, updateChecklistTask };
