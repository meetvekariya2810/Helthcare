const HRAutomationRule = require('../../models/hrms/HRAutomationRule');
const Credential = require('../../models/hrms/Credential');
const { TrainingEnrollment } = require('../../models/hrms/Training');
const Attendance = require('../../models/hrms/Attendance');
const HRNotification = require('../../models/hrms/HRNotification');
const { recordAudit } = require('../../middleware/audit');

// GET /api/hrms/automation/rules
const getRules = async (req, res) => {
  try {
    const rules = await HRAutomationRule.find({}).sort({ category: 1 });
    
    // Automation engine stats
    const summary = {
      activeRules: await HRAutomationRule.countDocuments({ isEnabled: true }),
      totalRules: rules.length,
      triggeredToday: rules.reduce((acc, r) => acc + (r.executionCount || 0), 0),
      pendingWorkforceAlerts: await HRNotification.countDocuments({ isRead: false, severity: { $in: ['URGENT', 'BLOCKING'] } })
    };

    res.json({ success: true, rules, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/automation/rules/:id/toggle
const toggleRule = async (req, res) => {
  try {
    const rule = await HRAutomationRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ success: false, message: 'Rule not found' });

    rule.isEnabled = !rule.isEnabled;
    await rule.save();

    await recordAudit({
      req,
      action: 'AUTOMATION_RULE_TOGGLED',
      module: 'AUTOMATION',
      recordId: rule._id,
      details: `${rule.name} set to ${rule.isEnabled ? 'ENABLED' : 'DISABLED'}`
    });

    res.json({ success: true, message: `Rule ${rule.isEnabled ? 'enabled' : 'disabled'}`, rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/automation/run-eval (Trigger Automation Cycle)
const runAutomationCycle = async (req, res) => {
  try {
    let triggeredCount = 0;

    // 1. Check for Credential Expiry <= 30 Days
    const expiringCreds = await Credential.find({
      status: { $in: ['EXPIRING', 'EXPIRED'] }
    });

    for (const cred of expiringCreds) {
      // Check if notification already exists
      const existingNotif = await HRNotification.findOne({
        relatedRecordId: String(cred._id),
        category: 'CREDENTIAL',
        isRead: false
      });

      if (!existingNotif) {
        await HRNotification.create({
          recipientRole: 'HR_ADMIN',
          category: 'CREDENTIAL',
          title: `Credential Alert: ${cred.credentialName}`,
          message: `${cred.employeeName}'s mandatory certification is ${cred.status.toLowerCase()}. Verify renewal immediately.`,
          severity: cred.status === 'EXPIRED' ? 'BLOCKING' : 'WARNING',
          relatedRecordId: String(cred._id),
          linkUrl: '/hrms/credentials'
        });
        triggeredCount++;
      }
    }

    // 2. Check for Overdue Mandatory Training
    const overdueTrainings = await TrainingEnrollment.find({ status: 'OVERDUE' });
    for (const trn of overdueTrainings) {
      const existingNotif = await HRNotification.findOne({
        relatedRecordId: String(trn._id),
        category: 'TRAINING',
        isRead: false
      });
      if (!existingNotif) {
        await HRNotification.create({
          recipientRole: 'HR_MANAGER',
          category: 'TRAINING',
          title: `Overdue Training: ${trn.programTitle}`,
          message: `${trn.employeeName} has missed deadline for required pharma compliance training.`,
          severity: 'URGENT',
          relatedRecordId: String(trn._id),
          linkUrl: '/hrms/training'
        });
        triggeredCount++;
      }
    }

    // 3. Multi-Tier (90-day, 60-day, 30-day) Pre-Expiry Training & Recertification Alerts
    const now = new Date();
    const d90 = new Date(Date.now() + 90 * 86400000);

    const expiringEnrollments = await TrainingEnrollment.find({
      status: 'COMPLETED',
      expiryDate: { $gte: now, $lte: d90 }
    });

    for (const enroll of expiringEnrollments) {
      const expTime = new Date(enroll.expiryDate).getTime();
      const daysLeft = Math.ceil((expTime - now.getTime()) / (1000 * 60 * 60 * 24));
      const tier = daysLeft <= 30 ? '30-Day Critical' : (daysLeft <= 60 ? '60-Day Warning' : '90-Day Notice');
      const severity = daysLeft <= 30 ? 'URGENT' : (daysLeft <= 60 ? 'WARNING' : 'INFO');

      const existingNotif = await HRNotification.findOne({
        relatedRecordId: String(enroll._id),
        title: { $regex: tier }
      });

      if (!existingNotif) {
        await HRNotification.create({
          recipientRole: 'HR_MANAGER',
          category: 'TRAINING',
          title: `Training Recertification Alert (${tier}): ${enroll.programTitle}`,
          message: `${enroll.employeeName}'s certification expires in ${daysLeft} days. Schedule periodic recertification.`,
          severity,
          relatedRecordId: String(enroll._id),
          linkUrl: '/hrms/training'
        });
        triggeredCount++;
      }
    }

    res.json({
      success: true,
      message: `Workforce Automation Cycle executed successfully. ${triggeredCount} automated actions dispatched.`,
      triggeredCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRules, toggleRule, runAutomationCycle };
