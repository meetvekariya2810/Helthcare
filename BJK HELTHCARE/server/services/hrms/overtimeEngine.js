/**
 * BJK Healthcare Overtime & Night Shift Intelligence Engine
 */

const calculateShiftHours = ({
  shiftStartTime = '09:00',
  shiftEndTime = '18:00',
  checkIn,
  checkOut,
  gracePeriodMinutes = 15,
  breakDurationMinutes = 60,
  overtimeMinimumMinutes = 30,
  nightStartHour = 22,
  nightEndHour = 6
}) => {
  if (!checkIn || !checkOut) {
    return {
      regularHours: 0,
      overtimeHours: 0,
      nightHours: 0,
      workingHours: 0,
      lateMinutes: 0,
      earlyExitMinutes: 0
    };
  }

  const inTime = new Date(checkIn);
  const outTime = new Date(checkOut);
  const totalWorkedMillis = outTime.getTime() - inTime.getTime();

  if (totalWorkedMillis <= 0) {
    return {
      regularHours: 0,
      overtimeHours: 0,
      nightHours: 0,
      workingHours: 0,
      lateMinutes: 0,
      earlyExitMinutes: 0
    };
  }

  // Net working hours excluding break
  const grossMinutes = Math.floor(totalWorkedMillis / (1000 * 60));
  const netMinutes = Math.max(0, grossMinutes - breakDurationMinutes);
  const workingHours = parseFloat((netMinutes / 60).toFixed(2));

  // Determine standard shift duration
  const [sStartH, sStartM] = shiftStartTime.split(':').map(Number);
  const [sEndH, sEndM] = shiftEndTime.split(':').map(Number);

  let shiftScheduledMinutes = (sEndH * 60 + sEndM) - (sStartH * 60 + sStartM);
  if (shiftScheduledMinutes <= 0) {
    shiftScheduledMinutes += 24 * 60; // Crosses midnight
  }
  const standardNetShiftMinutes = Math.max(0, shiftScheduledMinutes - breakDurationMinutes);
  const standardShiftHours = parseFloat((standardNetShiftMinutes / 60).toFixed(2));

  // Overtime Calculation
  let overtimeHours = 0;
  let regularHours = Math.min(workingHours, standardShiftHours);

  if (netMinutes > standardNetShiftMinutes) {
    const extraMinutes = netMinutes - standardNetShiftMinutes;
    if (extraMinutes >= overtimeMinimumMinutes) {
      overtimeHours = parseFloat((extraMinutes / 60).toFixed(2));
    }
  }

  // Night Hours Calculation (Between 22:00 and 06:00)
  let nightMinutes = 0;
  let cursor = new Date(inTime);
  while (cursor < outTime) {
    const hour = cursor.getHours();
    if (hour >= nightStartHour || hour < nightEndHour) {
      nightMinutes += 1;
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  const nightHours = parseFloat((nightMinutes / 60).toFixed(2));

  // Calculate Late Minutes
  const checkInHour = inTime.getHours();
  const checkInMin = inTime.getMinutes();
  const actualInTotalMin = checkInHour * 60 + checkInMin;
  const scheduledInTotalMin = sStartH * 60 + sStartM;
  let lateMinutes = 0;
  if (actualInTotalMin > scheduledInTotalMin + gracePeriodMinutes) {
    lateMinutes = actualInTotalMin - scheduledInTotalMin;
  }

  return {
    workingHours,
    regularHours,
    overtimeHours,
    nightHours,
    lateMinutes,
    earlyExitMinutes: 0
  };
};

module.exports = { calculateShiftHours };
