// Comprehensive Employee Login Regression Suite
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runTestSuite() {
  console.log('===========================================================');
  console.log(' BJK HEALTHCARE — EMPLOYEE LOGIN RELIABILITY TEST SUITE');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         Reason: ${err.message}`);
      failed++;
    }
  };

  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
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

  // Wait for server health
  for (let i = 0; i < 10; i++) {
    try {
      const ping = await request('/health');
      if (ping.ok) break;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 500));
  }

  let sessionToken = '';
  let employeeAData = null;

  // Test A: Valid employee login → SUCCESS
  await test('Test A: Valid employee login (employee@bjkhealthcare.com) -> SUCCESS', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(`Login failed with status ${res.status}: ${res.data?.message}`);
    }
    if (res.data?.user?.role !== 'EMPLOYEE') {
      throw new Error(`Expected role EMPLOYEE, got: ${res.data?.user?.role}`);
    }
    if (!res.data?.user?.employeeId) {
      throw new Error('User missing employeeId');
    }
    sessionToken = res.data.token;
    employeeAData = res.data.user;
  });

  // Verify dashboard telemetry access with session token
  await test('Test A2: Access /employee/auth/me with employee session token -> SUCCESS', async () => {
    const res = await request('/employee/auth/me', {
      headers: { Authorization: `Bearer ${sessionToken}` }
    });
    if (!res.data?.success || !res.data?.employee) {
      throw new Error(`Failed to fetch employee profile: ${res.data?.message}`);
    }
    if (res.data.employee.employeeId !== employeeAData.employeeId) {
      throw new Error(`Identity mismatch: expected ${employeeAData.employeeId}, got ${res.data.employee.employeeId}`);
    }
  });

  // Test B: Logout -> SUCCESS
  await test('Test B: Logout employee session -> SUCCESS', async () => {
    const res = await request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` }
    });
    if (!res.data?.success) {
      throw new Error(`Logout failed: ${res.data?.message}`);
    }
  });

  // Test C: Login again -> SUCCESS
  let sessionToken2 = '';
  await test('Test C: Login again immediately -> SUCCESS', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(`Login failed on retry: ${res.data?.message}`);
    }
    sessionToken2 = res.data.token;
  });

  // Test D: Browser refresh simulation (fetch /auth/me and /employee/auth/me with existing token)
  await test('Test D: Browser session restoration after page refresh -> SUCCESS', async () => {
    const authMe = await request('/auth/me', {
      headers: { Authorization: `Bearer ${sessionToken2}` }
    });
    if (!authMe.data?.success) {
      throw new Error(`Session validation failed on refresh: ${authMe.data?.message}`);
    }
    const empMe = await request('/employee/auth/me', {
      headers: { Authorization: `Bearer ${sessionToken2}` }
    });
    if (!empMe.data?.success) {
      throw new Error(`Employee session validation failed on refresh: ${empMe.data?.message}`);
    }
  });

  // Test E: Wrong password -> Correct error
  await test('Test E: Invalid password rejected with HTTP 401 and error message -> SUCCESS', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'employee@bjkhealthcare.com', password: 'WrongPassword999!' }
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401, got: ${res.status}`);
    }
    if (res.data?.success) {
      throw new Error('Expected failure response, got success');
    }
  });

  // Test F: Inactive/disabled account rejection
  await test('Test F: Inactive/disabled account rejection check -> SUCCESS', async () => {
    // Attempt with non-existent or inactive credential
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'disabled.employee@bjkhealthcare.com', password: 'Password123!' }
    });
    if (res.data?.success) {
      throw new Error('Disabled/unknown account should never succeed login');
    }
  });

  // Test G: Empty credentials rejection
  await test('Test G: Empty credentials rejected safely without server hang -> SUCCESS', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: '', password: '' }
    });
    if (res.status !== 400 || res.data?.success) {
      throw new Error(`Expected HTTP 400, got ${res.status}`);
    }
  });

  // Test H: Repeated fast login attempts (idempotence & concurrency)
  await test('Test H: Repeated fast login requests process reliably without race condition -> SUCCESS', async () => {
    const requests = await Promise.all([
      request('/auth/login', { method: 'POST', body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' } }),
      request('/auth/login', { method: 'POST', body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' } }),
      request('/auth/login', { method: 'POST', body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' } })
    ]);
    for (const r of requests) {
      if (!r.data?.success || !r.data?.token) {
        throw new Error('Concurrent request failed');
      }
    }
  });

  // Test I: Multiple employee accounts -> Correct distinct accounts loaded
  await test('Test I: Multiple distinct employee accounts authenticate independently without cross-talk -> SUCCESS', async () => {
    // Employee 1: BH1046 (Rohan Joshi)
    const res1 = await request('/auth/login', {
      method: 'POST',
      body: { identifier: 'BH1046', password: 'Password123!' }
    });
    if (!res1.data?.success) throw new Error(`BH1046 login failed: ${res1.data?.message}`);
    if (res1.data.user.employeeId !== 'BH1046') {
      throw new Error(`Expected BH1046, got: ${res1.data.user.employeeId}`);
    }

    // Employee 2: employee@bjkhealthcare.com (Rajesh Patel)
    const res2 = await request('/auth/login', {
      method: 'POST',
      body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res2.data?.success) throw new Error(`employee@ login failed: ${res2.data?.message}`);
    if (res2.data.user.employeeId !== 'BJK-EMP-003') {
      throw new Error(`Expected BJK-EMP-003, got: ${res2.data.user.employeeId}`);
    }

    // Verify profile for BH1046
    const prof1 = await request('/employee/auth/me', {
      headers: { Authorization: `Bearer ${res1.data.token}` }
    });
    if (prof1.data.employee.employeeId !== 'BH1046') {
      throw new Error('BH1046 profile employeeId mismatch');
    }

    // Verify profile for BJK-EMP-003
    const prof2 = await request('/employee/auth/me', {
      headers: { Authorization: `Bearer ${res2.data.token}` }
    });
    if (prof2.data.employee.employeeId !== 'BJK-EMP-003') {
      throw new Error('BJK-EMP-003 profile employeeId mismatch');
    }
  });

  // Test J: Verified Dashboard APIs work with employee token
  await test('Test J: Employee Dashboard endpoints respond correctly with employee token -> SUCCESS', async () => {
    const headers = { Authorization: `Bearer ${sessionToken2}` };
    const [att, leaves, shifts, tasks, profile] = await Promise.all([
      request('/employee/attendance/today', { headers }),
      request('/employee/leave', { headers }),
      request('/employee/shift', { headers }),
      request('/employee/tasks', { headers }),
      request('/employee/profile', { headers })
    ]);
    if (!att.ok) throw new Error(`Attendance endpoint failed: ${att.status}`);
    if (!leaves.ok) throw new Error(`Leave endpoint failed: ${leaves.status}`);
    if (!shifts.ok) throw new Error(`Shift endpoint failed: ${shifts.status}`);
    if (!tasks.ok) throw new Error(`Tasks endpoint failed: ${tasks.status}`);
    if (!profile.ok) throw new Error(`Profile endpoint failed: ${profile.status}`);
  });

  // Test K: Repeated Login -> Logout -> Login sequence
  await test('Test K: Rapid sequential Login -> Logout -> Login cycle -> SUCCESS', async () => {
    for (let i = 0; i < 3; i++) {
      const loginRes = await request('/auth/login', {
        method: 'POST',
        body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' }
      });
      if (!loginRes.data?.success || !loginRes.data?.token) {
        throw new Error(`Cycle ${i + 1} login failed`);
      }
      const logoutRes = await request('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${loginRes.data.token}` }
      });
      if (!logoutRes.data?.success) {
        throw new Error(`Cycle ${i + 1} logout failed`);
      }
    }
  });

  console.log('\n===========================================================');
  console.log(` TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===========================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTestSuite();
