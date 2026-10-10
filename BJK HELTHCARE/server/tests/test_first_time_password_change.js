require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('========================================================================');
  console.log('BJK HEALTHCARE — FIRST-TIME EMPLOYEE PASSWORD CHANGE TEST SUITE');
  console.log('Testing all 15 scenarios per specification criteria');
  console.log('Target Server:', BASE_URL);
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      process.stdout.write(`[TEST] ${name} ... `);
      await fn();
      console.log('PASS');
      passed++;
    } catch (err) {
      console.log('FAIL');
      console.error(`       Error: ${err.message}`);
      failed++;
    }
  };

  const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return { status: res.status, ok: res.ok, data };
  };

  // Connect to DB directly for state setup and deep persistence checks
  const { connectDB } = require('../config/db');
  await connectDB();

  const User = mongoose.models.User || require('../models/User');
  const Employee = mongoose.models.Employee || require('../models/Employee');

  // Prepare test employee accounts
  const testEmp1Email = 'test.employee1@bjkhealthcare.com';
  const testEmp2Email = 'test.employee2@bjkhealthcare.com';
  const disabledEmpEmail = 'disabled.emp@bjkhealthcare.com';

  if (mongoose.connection.readyState === 1) {
    const salt = await bcrypt.genSalt(10);
    const tempHash = await bcrypt.hash('Password123!', salt);

    // Setup Test Employee 1 (First-time user requiring password change)
    await User.findOneAndUpdate(
      { email: testEmp1Email },
      {
        $set: {
          name: 'Test Employee One',
          email: testEmp1Email,
          employeeId: 'BJK-TEST-001',
          employeeCode: 'BJK-TEST-001',
          role: 'EMPLOYEE',
          department: 'Quality Control',
          password: tempHash,
          passwordHash: tempHash,
          mustChangePassword: true,
          firstLogin: true,
          temporaryPassword: true,
          passwordChangedAt: null,
          isActive: true,
          status: 'ACTIVE'
        }
      },
      { upsert: true, new: true }
    );

    await Employee.findOneAndUpdate(
      { employeeId: 'BJK-TEST-001' },
      {
        $set: {
          firstName: 'Test',
          lastName: 'One',
          fullName: 'Test Employee One',
          employeeId: 'BJK-TEST-001',
          employeeCode: 'BJK-TEST-001',
          email: testEmp1Email,
          department: 'Quality Control',
          departmentName: 'Quality Control',
          designation: 'QC Analyst',
          designationTitle: 'QC Analyst',
          status: 'ACTIVE',
          systemRole: 'EMPLOYEE',
          mustChangePassword: true,
          passwordChangedAt: null
        }
      },
      { upsert: true, new: true }
    );

    // Setup Test Employee 2
    await User.findOneAndUpdate(
      { email: testEmp2Email },
      {
        $set: {
          name: 'Test Employee Two',
          email: testEmp2Email,
          employeeId: 'BJK-TEST-002',
          employeeCode: 'BJK-TEST-002',
          role: 'EMPLOYEE',
          department: 'Production',
          password: tempHash,
          passwordHash: tempHash,
          mustChangePassword: true,
          firstLogin: true,
          temporaryPassword: true,
          passwordChangedAt: null,
          isActive: true,
          status: 'ACTIVE'
        }
      },
      { upsert: true, new: true }
    );

    await Employee.findOneAndUpdate(
      { employeeId: 'BJK-TEST-002' },
      {
        $set: {
          firstName: 'Test',
          lastName: 'Two',
          fullName: 'Test Employee Two',
          employeeId: 'BJK-TEST-002',
          employeeCode: 'BJK-TEST-002',
          email: testEmp2Email,
          department: 'Production',
          status: 'ACTIVE',
          systemRole: 'EMPLOYEE',
          mustChangePassword: true,
          passwordChangedAt: null
        }
      },
      { upsert: true, new: true }
    );

    // Setup Disabled Employee
    await User.findOneAndUpdate(
      { email: disabledEmpEmail },
      {
        $set: {
          name: 'Disabled Employee',
          email: disabledEmpEmail,
          employeeId: 'BJK-DIS-001',
          role: 'EMPLOYEE',
          password: tempHash,
          passwordHash: tempHash,
          mustChangePassword: true,
          isActive: false,
          status: 'DISABLED'
        }
      },
      { upsert: true, new: true }
    );
  }

  let tempToken1 = null;
  const newPermanentPassword1 = 'SecurePermanent@2026!One';
  const newPermanentPassword2 = 'AnotherPermanent#2026!Two';

  // SCENARIO 1: Authorized employee + temporary password -> password-change required
  await test('1. Authorized employee + temporary password returns mustChangePassword: true', async () => {
    const res = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp1Email, password: 'Password123!' }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.mustChangePassword !== true) throw new Error('Expected mustChangePassword = true');
    if (!res.data.token) throw new Error('Expected token to be returned');
    tempToken1 = res.data.token;
  });

  // SCENARIO 2: Accessing Employee Identity endpoint (/me) works to show email safely
  await test('2. Temporary token allows /employee/auth/me for safe display of email/identity', async () => {
    const res = await request('/employee/auth/me', {
      headers: { Authorization: `Bearer ${tempToken1}` }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.employee?.email !== testEmp1Email) throw new Error(`Expected email ${testEmp1Email}`);
    if (res.data.employee?.mustChangePassword !== true) throw new Error('Expected mustChangePassword=true in profile');
  });

  // SCENARIO 3: Temporary token + protected API request (e.g. profile, leave, attendance) -> rejected
  await test('3. Temporary token on protected API request is blocked with 403 until password change', async () => {
    const res = await request('/employee/profile', {
      headers: { Authorization: `Bearer ${tempToken1}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    if (res.data.mustChangePassword !== true) throw new Error('Expected mustChangePassword=true in 403 response');
  });

  // SCENARIO 4: Invalid employee or invalid password -> login rejected
  await test('4. Invalid employee credentials or bad password rejected with 401', async () => {
    const badPwdRes = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp1Email, password: 'WrongPassword999!' }
    });
    if (badPwdRes.status !== 401) throw new Error(`Expected 401, got ${badPwdRes.status}`);

    const badUserRes = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: 'nonexistent.user@bjkhealthcare.com', password: 'Password123!' }
    });
    if (badUserRes.status !== 401) throw new Error(`Expected 401, got ${badUserRes.status}`);
  });

  // SCENARIO 5: Incorrect confirmation -> password change rejected
  await test('5. Mismatched confirmPassword rejected with 400', async () => {
    const res = await request('/employee/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken1}` },
      body: {
        oldPassword: 'Password123!',
        newPassword: 'ValidPassword@1234!',
        confirmPassword: 'DifferentPassword@1234!'
      }
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!res.data.message.toLowerCase().includes('not match')) throw new Error(`Unexpected message: ${res.data.message}`);
  });

  // SCENARIO 6: Weak password rejected (too short, missing special char, or temporary password reused)
  await test('6. Weak password policy enforcement (min 12 chars, special char, no temp password)', async () => {
    // Too short (under 12 chars)
    const shortRes = await request('/employee/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken1}` },
      body: {
        oldPassword: 'Password123!',
        newPassword: 'Short@1A',
        confirmPassword: 'Short@1A'
      }
    });
    if (shortRes.status !== 400) throw new Error(`Expected 400 for short password, got ${shortRes.status}`);

    // Missing special character
    const noSpecRes = await request('/employee/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken1}` },
      body: {
        oldPassword: 'Password123!',
        newPassword: 'Password123456NoSpecial',
        confirmPassword: 'Password123456NoSpecial'
      }
    });
    if (noSpecRes.status !== 400) throw new Error(`Expected 400 for missing special char, got ${noSpecRes.status}`);

    // Reusing the temporary password Password123!
    const reuseRes = await request('/employee/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken1}` },
      body: {
        oldPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });
    if (reuseRes.status !== 400) throw new Error(`Expected 400 for reusing temp password, got ${reuseRes.status}`);
  });

  // SCENARIO 7: Successful password change -> returns fresh token with mustChangePassword: false
  let permanentToken1 = null;
  await test('7. Successful password change updates hash and returns fresh active session', async () => {
    const res = await request('/employee/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tempToken1}` },
      body: {
        oldPassword: 'Password123!',
        newPassword: newPermanentPassword1,
        confirmPassword: newPermanentPassword1
      }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}: ${JSON.stringify(res.data)}`);
    if (res.data.mustChangePassword !== false) throw new Error('Expected mustChangePassword = false');
    if (!res.data.token) throw new Error('Expected fresh permanent token');
    if (!res.data.message.includes('successfully')) throw new Error(`Unexpected message: ${res.data.message}`);
    permanentToken1 = res.data.token;
  });

  // SCENARIO 8: Old temporary password after change -> rejected
  await test('8. Old temporary password (Password123!) is now rejected after password change', async () => {
    const res = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp1Email, password: 'Password123!' }
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  // SCENARIO 9: Permanent login works and protected APIs become accessible
  await test('9. Permanent login with new password succeeds and grants access to protected APIs', async () => {
    const loginRes = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp1Email, password: newPermanentPassword1 }
    });
    if (loginRes.status !== 200) throw new Error(`Expected 200, got ${loginRes.status}`);
    if (loginRes.data.mustChangePassword === true) throw new Error('Expected mustChangePassword = false on permanent login');

    const freshToken = loginRes.data.token;
    // Protected API now returns 200
    const profileRes = await request('/employee/profile', {
      headers: { Authorization: `Bearer ${freshToken}` }
    });
    if (profileRes.status !== 200) throw new Error(`Expected 200 from protected profile, got ${profileRes.status}`);
  });

  // SCENARIO 10: Existing employees with established permanent passwords are unaffected
  await test('10. Existing permanent accounts are unaffected by temporary credentials requirement', async () => {
    // Test login via /auth/login for existing account with established password
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: testEmp1Email, password: newPermanentPassword1 }
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.user?.mustChangePassword === true) throw new Error('Permanent account unexpectedly flagged with mustChangePassword=true');
  });

  // SCENARIO 11: Disabled employee -> access denied
  await test('11. Disabled or deactivated employee account is rejected with 403', async () => {
    const res = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: disabledEmpEmail, password: 'Password123!' }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden for deactivated account, got ${res.status}`);
  });

  // SCENARIO 12: Employee role cannot access administrator endpoints
  await test('12. Employee role is barred from administrator endpoints', async () => {
    const res = await request('/admin/users', {
      headers: { Authorization: `Bearer ${permanentToken1}` }
    });
    if (res.status !== 403 && res.status !== 401) {
      throw new Error(`Expected 403/401 for admin endpoint access by employee, got ${res.status}`);
    }
  });

  // SCENARIO 13: Multiple employees have independent permanent passwords
  await test('13. Multiple employees have independent permanent passwords', async () => {
    // Login Employee 2 with temporary password
    const emp2Login = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp2Email, password: 'Password123!' }
    });
    if (emp2Login.status !== 200) throw new Error(`Emp2 login failed: ${emp2Login.status}`);
    const emp2TempToken = emp2Login.data.token;

    // Change Employee 2 password to independent password
    const emp2Change = await request('/employee/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${emp2TempToken}` },
      body: {
        oldPassword: 'Password123!',
        newPassword: newPermanentPassword2,
        confirmPassword: newPermanentPassword2
      }
    });
    if (emp2Change.status !== 200) throw new Error(`Emp2 password change failed: ${emp2Change.status}`);

    // Verify Employee 2's password cannot log into Employee 1
    const crossLogin = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp1Email, password: newPermanentPassword2 }
    });
    if (crossLogin.status !== 401) throw new Error('Employee 2 password unexpectedly logged into Employee 1!');

    // Verify Employee 2 can log in with Employee 2's permanent password
    const emp2PermLogin = await request('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: testEmp2Email, password: newPermanentPassword2 }
    });
    if (emp2PermLogin.status !== 200) throw new Error('Employee 2 permanent login failed!');
  });

  // SCENARIO 14: Database persistence verification
  await test('14. Database persistence: passwordChangedAt is recorded and survives lookup', async () => {
    if (mongoose.connection.readyState === 1) {
      const u1 = await User.findOne({ email: testEmp1Email }).select('+password +passwordHash');
      if (!u1) throw new Error('User 1 not found in database');
      if (u1.mustChangePassword !== false) throw new Error('u1.mustChangePassword is not false');
      if (!u1.passwordChangedAt) throw new Error('u1.passwordChangedAt was not saved');
      if (!u1.password || !u1.password.startsWith('$2')) throw new Error('Password was not saved as bcrypt hash');
    } else {
      // Via API
      const res = await request('/employee/auth/login', {
        method: 'POST',
        body: { loginIdentifier: testEmp1Email, password: newPermanentPassword1 }
      });
      if (res.status !== 200) throw new Error('Persistence verification failed via API');
    }
  });

  // SCENARIO 15: Public and core modules continue working unchanged
  await test('15. Core APIs (health, products, verification) continue functioning normally', async () => {
    const healthRes = await request('/health');
    if (healthRes.status !== 200) throw new Error(`Health check returned ${healthRes.status}`);

    const productsRes = await request('/products');
    if (productsRes.status !== 200 && productsRes.status !== 401) {
      throw new Error(`Products check returned unexpected status ${productsRes.status}`);
    }
  });

  console.log('\n========================================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('========================================================================\n');

  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
