const { calculateHaversineDistance, verifyGeofence, DEFAULT_FACTORY_POLICY } = require('../services/geofenceService');

async function runGeofenceTests() {
  console.log('================================================================');
  console.log(' BJK HEALTHCARE — 100M FACTORY GEOFENCE VERIFICATION TEST SUITE ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  const factoryLat = 23.175920;
  const factoryLng = 72.874370;

  // TEST 1: Exact Factory Center (0 meters)
  const distZero = calculateHaversineDistance(factoryLat, factoryLng, factoryLat, factoryLng);
  assert(Math.abs(distZero) < 0.001, `Test 1: Exact center distance is 0m (Actual: ${distZero.toFixed(4)}m)`);

  // TEST 2: Inside 100m boundary (~30m offset)
  // 0.00025 degrees latitude is approx 27.8 meters
  const insideLat = factoryLat + 0.00025;
  const insideLng = factoryLng;
  const distInside = calculateHaversineDistance(factoryLat, factoryLng, insideLat, insideLng);
  assert(distInside < 100, `Test 2: Point within 100m (${distInside.toFixed(2)}m < 100m)`);

  const verifInside = await verifyGeofence({
    latitude: insideLat,
    longitude: insideLng,
    accuracy: 10,
    employeeId: 'BJK-EMP-001',
    action: 'PUNCH_IN'
  });
  assert(verifInside.allowed === true && verifInside.status === 'WITHIN_ATTENDANCE_AREA', 'Test 2b: Punch In allowed inside boundary');

  // TEST 3: Outside 100m boundary (~500m offset)
  // 0.005 degrees latitude is approx 555 meters
  const outsideLat = factoryLat + 0.005;
  const outsideLng = factoryLng;
  const distOutside = calculateHaversineDistance(factoryLat, factoryLng, outsideLat, outsideLng);
  assert(distOutside > 100, `Test 3: Point outside 100m (${distOutside.toFixed(2)}m > 100m)`);

  const verifOutside = await verifyGeofence({
    latitude: outsideLat,
    longitude: outsideLng,
    accuracy: 15,
    employeeId: 'BJK-EMP-001',
    action: 'PUNCH_IN'
  });
  assert(verifOutside.allowed === false && verifOutside.code === 'OUTSIDE_ATTENDANCE_AREA', 'Test 3b: Punch In blocked outside 100m boundary');

  // TEST 4: Poor GPS accuracy rejection (> 50m accuracy error)
  const verifPoorAcc = await verifyGeofence({
    latitude: insideLat,
    longitude: insideLng,
    accuracy: 120, // 120m accuracy error
    employeeId: 'BJK-EMP-001',
    action: 'PUNCH_IN'
  });
  assert(verifPoorAcc.allowed === false && verifPoorAcc.code === 'GPS_ACCURACY_TOO_LOW', 'Test 4: Poor GPS accuracy (120m) rejected');

  // TEST 5: Missing / Invalid coordinates
  const verifInvalid = await verifyGeofence({
    latitude: 'invalid_lat',
    longitude: null,
    accuracy: 10,
    employeeId: 'BJK-EMP-001',
    action: 'PUNCH_IN'
  });
  assert(verifInvalid.allowed === false && verifInvalid.code === 'INVALID_LOCATION_DATA', 'Test 5: Invalid coordinates blocked');

  // TEST 6: Zero information leakage to employee payload
  assert(!verifInside.latitude && !verifInside.longitude && !verifInside.factoryCoordinates, 'Test 6: Verified payload does NOT expose coordinates to frontend');
  assert(!verifOutside.latitude && !verifOutside.longitude && !verifOutside.factoryCoordinates, 'Test 6b: Out of range payload does NOT expose coordinates to frontend');

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGeofenceTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
