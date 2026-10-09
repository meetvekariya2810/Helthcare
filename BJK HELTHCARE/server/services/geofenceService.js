const mongoose = require('mongoose');
const AttendancePolicy = require('../models/AttendancePolicy');
const AttendanceAuditLog = require('../models/AttendanceAuditLog');

// Default BJK Healthcare Lavad Factory Geofence Parameters
const DEFAULT_FACTORY_POLICY = {
  facilityId: 'BJK-FAC-001',
  facilityName: 'BJK Healthcare Pvt. Ltd. - Lavad Factory',
  facilityAddress: 'Block/Survey No. 1248, Near Rashtriya Raksha University, Lavad-Sampa Road, Near Dahegam-Bayad Road, Lavad, Dahegam, Gujarat 382305, India',
  latitude: parseFloat(process.env.ATTENDANCE_FACTORY_LATITUDE) || 23.175920,
  longitude: parseFloat(process.env.ATTENDANCE_FACTORY_LONGITUDE) || 72.874370,
  radiusMeters: parseFloat(process.env.ATTENDANCE_RADIUS_METERS) || 100,
  gpsRequired: process.env.ATTENDANCE_GPS_REQUIRED !== 'false',
  punchInEnabled: true,
  punchOutEnabled: true,
  minimumGpsAccuracy: parseFloat(process.env.ATTENDANCE_MIN_GPS_ACCURACY_METERS) || 50,
  active: true
};

/**
 * Calculates the great-circle distance between two geographic coordinates using the Haversine formula.
 * @param {number} lat1 - Point 1 latitude
 * @param {number} lon1 - Point 1 longitude
 * @param {number} lat2 - Point 2 latitude
 * @param {number} lon2 - Point 2 longitude
 * @returns {number} Distance in meters
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Mean radius of Earth in meters
  const toRad = (degree) => (degree * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Fetches the active attendance policy or initializes it with default Lavad factory coordinates.
 */
async function getActiveAttendancePolicy(facilityId = 'BJK-FAC-001') {
  try {
    if (mongoose.connection.readyState !== 1) {
      return DEFAULT_FACTORY_POLICY;
    }

    let policy = await AttendancePolicy.findOne({
      $or: [{ facilityId }, { active: true }]
    }).sort({ updatedAt: -1 });

    if (!policy) {
      policy = await AttendancePolicy.create(DEFAULT_FACTORY_POLICY);
    }

    return policy;
  } catch (err) {
    console.warn('[Geofence Service] Warning fetching policy from DB, using defaults:', err.message);
    return DEFAULT_FACTORY_POLICY;
  }
}

/**
 * Validates whether GPS coordinates fall within the factory geofence boundary.
 *
 * @param {Object} params
 * @param {number} params.latitude - Employee device latitude
 * @param {number} params.longitude - Employee device longitude
 * @param {number} [params.accuracy] - Employee device GPS accuracy in meters
 * @param {string} params.employeeId - Employee ID / Code
 * @param {string} [params.employeeName] - Employee Name
 * @param {string} [params.action] - Action attempted (PUNCH_IN, PUNCH_OUT, LOCATION_CHECK)
 * @param {Object} [params.req] - Express request for headers / IP
 *
 * @returns {Promise<{
 *   allowed: boolean,
 *   status: string,
 *   code: string,
 *   message: string,
 *   internalDistanceMeters: number,
 *   internalAccuracy: number
 * }>}
 */
async function verifyGeofence({
  latitude,
  longitude,
  accuracy,
  employeeId,
  employeeCode,
  employeeName,
  action = 'LOCATION_CHECK',
  req = null
}) {
  const empId = (employeeId || employeeCode || 'UNKNOWN').toUpperCase();
  const policy = await getActiveAttendancePolicy();

  // Extract client device information safely
  const userAgent = req?.headers?.['user-agent'] || '';
  const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '';
  const platform = req?.headers?.['sec-ch-ua-platform'] || '';

  const deviceInfo = { userAgent, platform, ipAddress };

  // 1. Check if GPS is required by policy
  if (!policy.gpsRequired || process.env.ATTENDANCE_GEOFENCE_ENABLED === 'false') {
    return {
      allowed: true,
      status: 'WITHIN_ATTENDANCE_AREA',
      code: 'GEOFENCE_BYPASS',
      message: 'Geofencing check bypassed by active policy.',
      internalDistanceMeters: 0,
      internalAccuracy: accuracy || 10
    };
  }

  // 2. Validate coordinates presence & numerical type
  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  const accNum = accuracy != null ? parseFloat(accuracy) : null;

  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    const failureReason = 'Invalid or missing GPS coordinates provided.';
    await logAudit({
      employeeId: empId,
      employeeCode: employeeCode || empId,
      employeeName: employeeName || '',
      action: `${action}_REJECTED`,
      result: 'FAILURE',
      verificationStatus: 'FAILED',
      failureReason,
      deviceInfo,
      rawCoordinates: { latitude: latNum || null, longitude: lngNum || null }
    });

    return {
      allowed: false,
      status: 'INVALID_LOCATION_DATA',
      code: 'INVALID_LOCATION_DATA',
      message: 'Location access is required to verify your attendance location. Please enable GPS and try again.'
    };
  }

  // 3. Validate GPS accuracy (Accuracy threshold check)
  const maxAllowedAccuracy = policy.minimumGpsAccuracy || 50; // default 50 meters
  if (accNum !== null && !isNaN(accNum) && accNum > maxAllowedAccuracy) {
    const failureReason = `GPS accuracy too low (${accNum.toFixed(1)}m > ${maxAllowedAccuracy}m threshold).`;
    await logAudit({
      employeeId: empId,
      employeeCode: employeeCode || empId,
      employeeName: employeeName || '',
      action: 'GPS_ACCURACY_FAILED',
      result: 'REJECTED',
      verificationStatus: 'ACCURACY_POOR',
      distanceMeters: null,
      gpsAccuracy: accNum,
      failureReason,
      deviceInfo,
      rawCoordinates: { latitude: latNum, longitude: lngNum }
    });

    return {
      allowed: false,
      status: 'GPS_ACCURACY_TOO_LOW',
      code: 'GPS_ACCURACY_TOO_LOW',
      message: 'Your location accuracy is too low. Please enable precise location and try again.'
    };
  }

  // 4. Calculate Distance from Factory Center
  const distanceMeters = calculateHaversineDistance(
    latNum,
    lngNum,
    policy.latitude,
    policy.longitude
  );

  const radiusLimit = policy.radiusMeters || 100; // 100 meters
  const isWithin = distanceMeters <= radiusLimit;

  if (isWithin) {
    // Record success audit
    await logAudit({
      employeeId: empId,
      employeeCode: employeeCode || empId,
      employeeName: employeeName || '',
      action: action.includes('PUNCH') ? `${action}_SUCCESS` : 'LOCATION_CHECK',
      result: 'SUCCESS',
      verificationStatus: 'VERIFIED',
      distanceMeters: Math.round(distanceMeters * 10) / 10,
      gpsAccuracy: accNum,
      deviceInfo,
      rawCoordinates: { latitude: latNum, longitude: lngNum }
    });

    return {
      allowed: true,
      status: 'WITHIN_ATTENDANCE_AREA',
      code: 'WITHIN_ATTENDANCE_AREA',
      message: 'Location verified. You are within the authorized BJK Healthcare attendance area.',
      internalDistanceMeters: distanceMeters,
      internalAccuracy: accNum
    };
  } else {
    // Record out-of-geofence audit
    const failureReason = `Employee outside ${radiusLimit}m boundary.`;
    await logAudit({
      employeeId: empId,
      employeeCode: employeeCode || empId,
      employeeName: employeeName || '',
      action: 'OUT_OF_GEOFENCE',
      result: 'REJECTED',
      verificationStatus: 'OUT_OF_BOUNDS',
      distanceMeters: Math.round(distanceMeters * 10) / 10,
      gpsAccuracy: accNum,
      failureReason,
      deviceInfo,
      rawCoordinates: { latitude: latNum, longitude: lngNum }
    });

    return {
      allowed: false,
      status: 'OUTSIDE_ATTENDANCE_AREA',
      code: 'OUTSIDE_ATTENDANCE_AREA',
      message: 'Attendance can only be recorded when you are within the authorized BJK Healthcare attendance area.'
    };
  }
}

/**
 * Internal helper to safely log audit events without failing execution
 */
async function logAudit(data) {
  try {
    if (mongoose.connection.readyState === 1) {
      await AttendanceAuditLog.create(data);
    }
  } catch (err) {
    console.warn('[Geofence Audit Log Note]:', err.message);
  }
}

module.exports = {
  DEFAULT_FACTORY_POLICY,
  calculateHaversineDistance,
  getActiveAttendancePolicy,
  verifyGeofence,
  logAudit
};
