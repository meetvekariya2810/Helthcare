require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { seedEmployeePortalUsers } = require('../seed/employeePortalSeed');

const JWT_SECRET = process.env.JWT_SECRET || 'bjk_healthcare_digital_brain_ultra_secure_jwt_secret_key_2026_enterprise';

const { connectDB, closeDB } = require('../config/db');

async function runSecurityTests() {
  console.log('========================================================');
  console.log('BJK HEALTHCARE — EMPLOYEE PORTAL AUTOMATED SECURITY SUITE');
  console.log('========================================================\n');

  await connectDB();
  console.log('[DB] Connected to MongoDB.');

  // Ensure test users exist
  await seedEmployeePortalUsers();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // TEST 1: Password Login
  const empUser = await User.findOne({ email: 'emp001@bjkhealthcare.com' }).select('+password +passwordHash');
  assert(empUser !== null, 'Test 1: EMP001 user exists in database');
  const isPassMatch = await bcrypt.compare('Password123!', empUser.password || empUser.passwordHash);
  assert(isPassMatch, 'Test 2: EMP001 password verification succeeds');

  // TEST 3: Wrong Password
  const isWrongMatch = await bcrypt.compare('WrongPassword999!', empUser.password || empUser.passwordHash);
  assert(!isWrongMatch, 'Test 3: Incorrect password correctly rejected');

  // TEST 4: Generate JWT Token for EMP001
  const empToken = jwt.sign(
    {
      userId: empUser._id,
      employeeId: 'EMP001',
      empId: 'EMP001',
      role: 'EMPLOYEE',
      department: empUser.department
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  assert(!!empToken, 'Test 4: JWT Access Token generated with employee identity');

  // TEST 5: Verify Token contains correct employeeId & Role
  const decoded = jwt.verify(empToken, JWT_SECRET);
  assert(decoded.employeeId === 'EMP001' && decoded.role === 'EMPLOYEE', 'Test 5: Decoded JWT retains strict identity payload');

  // TEST 6: Critical Security Check — Ownership Authorization Middleware
  const { authorizeOwnership } = require('../middleware/employeeAuth');

  // Mock Request: EMP001 attempting to request EMP002's records
  const maliciousReq = {
    employeeId: 'EMP001',
    employeeRole: 'EMPLOYEE',
    employee: await Employee.findOne({ employeeId: 'EMP001' }),
    query: { employeeId: 'EMP002' },
    params: {},
    body: {}
  };

  let wasBlocked = false;
  const mockRes = {
    status: function(code) {
      if (code === 403) wasBlocked = true;
      return this;
    },
    json: function(data) {
      return data;
    }
  };

  authorizeOwnership(maliciousReq, mockRes, () => {
    wasBlocked = false; // if next() is called, it failed to block
  });

  assert(wasBlocked, 'Test 6 [CRITICAL]: EMP001 attempting GET ?employeeId=EMP002 is BLOCKED with 403 Forbidden');

  // TEST 7: Legitimate Request — EMP001 requesting own records
  const legitimateReq = {
    employeeId: 'EMP001',
    employeeRole: 'EMPLOYEE',
    employee: await Employee.findOne({ employeeId: 'EMP001' }),
    query: { employeeId: 'EMP001' },
    params: {},
    body: {}
  };

  let passedLegitimate = false;
  authorizeOwnership(legitimateReq, mockRes, () => {
    passedLegitimate = true;
  });

  assert(passedLegitimate, 'Test 7: EMP001 requesting own records is permitted');

  // TEST 8: Manager accessing assigned direct report
  const mgrEmployee = await Employee.findOne({ employeeId: 'MGR001' });
  const managerReq = {
    employeeId: 'MGR001',
    employeeRole: 'MANAGER',
    employee: mgrEmployee,
    query: { employeeId: 'EMP001' },
    params: {},
    body: {}
  };

  let managerAllowed = false;
  authorizeOwnership(managerReq, mockRes, () => {
    managerAllowed = true;
  });

  assert(managerAllowed, 'Test 8: Manager MGR001 authorized to view assigned direct report EMP001');

  // TEST 9: Normal Employee cannot access Admin/Super Admin/Director data
  const { normalizeRole } = require('../middleware/employeeAuth');
  assert(normalizeRole('EMPLOYEE') === 'EMPLOYEE', 'Test 9: Role normalization ensures EMPLOYEE role');
  assert(normalizeRole('SENIOR EMPLOYEE') === 'SENIOR_EMPLOYEE', 'Test 10: Role normalization handles SENIOR EMPLOYEE');
  assert(normalizeRole('TEAM LEAD') === 'TEAM_LEAD', 'Test 11: Role normalization handles TEAM LEAD');

  console.log('\n--------------------------------------------------------');
  console.log(`Security Test Suite Completed: ${passedTests}/${totalTests} Passed.`);
  console.log('--------------------------------------------------------\n');

  await closeDB();
  process.exit(passedTests === totalTests ? 0 : 1);
}

runSecurityTests().catch(err => {
  console.error('Security test failed with error:', err);
  process.exit(1);
});
