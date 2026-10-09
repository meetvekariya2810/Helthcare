const Credential = require('../../models/hrms/Credential');
const { LeaveRequest } = require('../../models/hrms/Leave');
const Roster = require('../../models/hrms/Roster');

/**
 * Validates an employee assignment to a shift and date
 * Enforces pharma compliance, rest periods, and credential validity
 */
const validateRosterAssignment = async ({
  employeeId,
  dateString,
  shiftStartTime = '09:00',
  shiftEndTime = '18:00',
  requiredRole = 'Standard'
}) => {
  const blockingIssues = [];
  const warnings = [];

  const targetDate = new Date(dateString);

  // 1. Check for Active Approved Leaves
  const existingLeave = await LeaveRequest.findOne({
    employeeId,
    status: 'APPROVED',
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate }
  });

  if (existingLeave) {
    blockingIssues.push(`Employee is on approved leave (${existingLeave.leaveType}) from ${existingLeave.startDateString} to ${existingLeave.endDateString}.`);
  }

  // 2. Check for Mandatory Credential Expiry (Pharma Blocking Constraint)
  const expiredMandatoryCredentials = await Credential.find({
    employeeId,
    isMandatoryForRole: true,
    blocksRosterAssignmentOnExpiry: true,
    $or: [
      { status: 'EXPIRED' },
      { expiryDate: { $lt: targetDate } }
    ]
  });

  if (expiredMandatoryCredentials && expiredMandatoryCredentials.length > 0) {
    expiredMandatoryCredentials.forEach(cred => {
      blockingIssues.push(`BLOCKING ISSUE: Mandatory Credential expired: ${cred.credentialName} (Authority: ${cred.issuingAuthority}). Roster assignment prohibited until renewed.`);
    });
  }

  // 3. Check for Credentials Expiring Soon (Warning)
  const expiringSoon = await Credential.find({
    employeeId,
    isMandatoryForRole: true,
    status: 'EXPIRING'
  });
  if (expiringSoon && expiringSoon.length > 0) {
    expiringSoon.forEach(cred => {
      warnings.push(`Credential expiring within 30 days: ${cred.credentialName}. Renew soon to avoid operational stoppage.`);
    });
  }

  // 4. Check for Consecutive Double Shifts / Same Day Conflict
  const existingShiftSameDay = await Roster.findOne({
    employeeId,
    dateString,
    validationStatus: { $ne: 'BLOCKED' }
  });

  if (existingShiftSameDay) {
    warnings.push(`Employee already has a shift assigned on ${dateString} (${existingShiftSameDay.shiftName}).`);
  }

  // 5. Rest Period Validation (Minimum 11 hours rest required)
  const previousDay = new Date(targetDate);
  previousDay.setDate(previousDay.getDate() - 1);
  const prevDateString = previousDay.toISOString().split('T')[0];

  const prevRoster = await Roster.findOne({ employeeId, dateString: prevDateString });
  if (prevRoster && prevRoster.endTime) {
    // If previous was a Night shift ending at 06:00 and next is Morning at 08:00, rest is only 2 hours!
    const [prevEndH] = prevRoster.endTime.split(':').map(Number);
    const [currStartH] = shiftStartTime.split(':').map(Number);
    
    if (prevRoster.endTime > '20:00' || prevRoster.endTime < '07:00') {
      let gapHours = currStartH - prevEndH;
      if (gapHours < 0) gapHours += 24;
      if (gapHours < 11) {
        blockingIssues.push(`BLOCKING ISSUE: Insufficient rest period (${gapHours} hours between shifts). Statutory minimum is 11 hours.`);
      }
    }
  }

  // 6. Regulated Cleanroom & Aseptic Formulation Qualification Check
  const isRegulatedShift = /cleanroom|sterile|aseptic|grade\s*[a-d]|formulation/i.test(requiredRole || '');
  if (isRegulatedShift) {
    const validCleanroomCred = await Credential.findOne({
      employeeId,
      credentialType: { $in: ['GMP_CERTIFICATE', 'ASEPTIC_GOWNING', 'CLEANROOM_QUALIFICATION'] },
      status: 'ACTIVE',
      expiryDate: { $gt: targetDate }
    });

    if (!validCleanroomCred) {
      blockingIssues.push('BLOCKING ISSUE: Employee is not eligible for this assignment because required qualification/certification is expired or missing.');
    }
  }

  const isBlocked = blockingIssues.length > 0;
  const validationStatus = isBlocked ? 'BLOCKED' : (warnings.length > 0 ? 'WARNING' : 'VALID');

  return {
    isValid: !isBlocked,
    isBlocked,
    validationStatus,
    blockingIssues,
    warnings
  };
};

module.exports = { validateRosterAssignment };
