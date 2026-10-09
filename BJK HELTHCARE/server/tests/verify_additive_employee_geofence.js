const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { calculateHaversineDistance, verifyGeofence, DEFAULT_FACTORY_POLICY } = require('../services/geofenceService');
const AttendancePolicy = require('../models/AttendancePolicy');
const AttendanceAuditLog = require('../models/AttendanceAuditLog');
const Attendance = require('../models/hrms/Attendance');

async function runComprehensiveVerification() {
  console.log('================================================================');
  console.log(' BJK HEALTHCARE — EMPLOYEE GEOFENCE & ATTENDANCE VERIFICATION  ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // 1. Factory Coordinates Verification
  const FACTORY_LAT = 23.175920;
  const FACTORY_LNG = 72.874370;
  const ALLOWED_RADIUS = 100;

  console.log(`📍 Factory Attendance Center: ${FACTORY_LAT}, ${FACTORY_LNG}`);
  console.log(`📏 Geofence Radius Limit: ${ALLOWED_RADIUS} meters\n`);

  // Test 1: Factory center calculation (distance = 0)
  const distCenter = calculateHaversineDistance(FACTORY_LAT, FACTORY_LNG, FACTORY_LAT, FACTORY_LNG);
  assert(Math.abs(distCenter) < 0.001, 'Factory Center Distance Calculation', `Distance: ${distCenter.toFixed(4)}m`);

  // Test 2: Inside 100m boundary (~30m offset)
  const insideLat = FACTORY_LAT + 0.00025; // ~27.8 meters north
  const insideLng = FACTORY_LNG;
  const distInside = calculateHaversineDistance(FACTORY_LAT, FACTORY_LNG, insideLat, insideLng);
  assert(distInside <= ALLOWED_RADIUS, 'Inside 100m Boundary Verification', `Calculated: ${distInside.toFixed(2)}m`);

  const verifInside = await verifyGeofence({
    latitude: insideLat,
    longitude: insideLng,
    accuracy: 8,
    employeeId: 'BH1001',
    employeeCode: 'BH1001',
    employeeName: 'Ramesh Patel',
    action: 'PUNCH_IN'
  });
  assert(verifInside.allowed === true, 'Punch In Allowed Within 100m Radius');
  assert(verifInside.status === 'WITHIN_ATTENDANCE_AREA', 'Status Reports WITHIN_ATTENDANCE_AREA');
  assert(!verifInside.latitude && !verifInside.longitude, 'Zero Coordinate Leakage in Employee Response');

  // Test 3: Outside 100m boundary (~250m and ~550m offset)
  const outsideLat = FACTORY_LAT + 0.0025; // ~278 meters north
  const outsideLng = FACTORY_LNG;
  const distOutside = calculateHaversineDistance(FACTORY_LAT, FACTORY_LNG, outsideLat, outsideLng);
  assert(distOutside > ALLOWED_RADIUS, 'Outside 100m Boundary Verification', `Calculated: ${distOutside.toFixed(2)}m`);

  const verifOutside = await verifyGeofence({
    latitude: outsideLat,
    longitude: outsideLng,
    accuracy: 10,
    employeeId: 'BH1001',
    employeeCode: 'BH1001',
    employeeName: 'Ramesh Patel',
    action: 'PUNCH_IN'
  });
  assert(verifOutside.allowed === false, 'Punch In Blocked Outside 100m Radius');
  assert(verifOutside.code === 'OUTSIDE_ATTENDANCE_AREA', 'Code Reports OUTSIDE_ATTENDANCE_AREA');
  assert(!verifOutside.latitude && !verifOutside.longitude, 'Zero Coordinate Leakage When Outside Area');

  // Test 4: GPS Accuracy Validation (Threshold Check)
  const verifPoorAccuracy = await verifyGeofence({
    latitude: insideLat,
    longitude: insideLng,
    accuracy: 85, // 85m accuracy error is above 50m limit
    employeeId: 'BH1001',
    employeeCode: 'BH1001',
    employeeName: 'Ramesh Patel',
    action: 'PUNCH_IN'
  });
  assert(verifPoorAccuracy.allowed === false, 'Poor GPS Accuracy Blocked (>50m accuracy error)');
  assert(verifPoorAccuracy.code === 'GPS_ACCURACY_TOO_LOW', 'Code Reports GPS_ACCURACY_TOO_LOW');

  // Test 5: Invalid / Missing Coordinates
  const verifMissing = await verifyGeofence({
    latitude: null,
    longitude: undefined,
    accuracy: null,
    employeeId: 'BH1001',
    action: 'PUNCH_IN'
  });
  assert(verifMissing.allowed === false, 'Missing Coordinates Blocked');
  assert(verifMissing.code === 'INVALID_LOCATION_DATA', 'Code Reports INVALID_LOCATION_DATA');

  // Test 6: Policy Defaults Integrity
  assert(DEFAULT_FACTORY_POLICY.latitude === 23.175920, 'Default Factory Policy Latitude matches 23.175920');
  assert(DEFAULT_FACTORY_POLICY.longitude === 72.874370, 'Default Factory Policy Longitude matches 72.874370');
  assert(DEFAULT_FACTORY_POLICY.radiusMeters === 100, 'Default Factory Radius matches 100 meters');
  assert(DEFAULT_FACTORY_POLICY.gpsRequired === true, 'GPS Verification Required is True');

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveVerification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
