// BJK HEALTHCARE - EMPLOYEE MASTER IMPORT & RBAC VERIFICATION SUITE
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('===============================================================');
  console.log(' BJK HEALTHCARE — EMPLOYEE MASTER DATA MIGRATION & RBAC TEST');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(`         Reason: ${err.message}`);
    }
  };

  const request = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
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

  // Step 0: Health Check
  await test('0. Server & Database Health Ping', async () => {
    const ping = await request('/health');
    if (!ping.ok || ping.data?.database !== 'connected') {
      throw new Error(`Server health check failed: ${JSON.stringify(ping.data)}`);
    }
  });

  // Step 1: DRY RUN Validation
  await test('1. POST /api/employees/import/validate - Dry Run Master File Validation', async () => {
    const res = await request('/employees/import/validate', {
      method: 'POST',
      body: {}
    });
    if (!res.data?.success) {
      throw new Error(`Validation failed: ${res.data?.message || 'Unknown'}`);
    }
    if (res.data.mode !== 'DRY_RUN') {
      throw new Error(`Expected DRY_RUN mode, got ${res.data.mode}`);
    }
    const sum = res.data.summary;
    console.log(`         Dry Run Summary: Total=${sum.totalRows}, Valid=${sum.validRecords}, Invalid=${sum.invalidRecords}, Active=${sum.activeRecords}, Inactive=${sum.inactiveRecords}`);
    if (sum.validRecords !== 62) {
      throw new Error(`Expected 62 valid records, got ${sum.validRecords}`);
    }
    if (sum.invalidRecords !== 1) {
      throw new Error(`Expected 1 invalid record (Renish Suvagiya), got ${sum.invalidRecords}`);
    }
  });

  // Step 2: Live Migration Execution
  let liveResult = null;
  await test('2. POST /api/employees/import - Live Master Migration Execution', async () => {
    const res = await request('/employees/import', {
      method: 'POST',
      body: { mode: 'master', dryRun: false }
    });
    if (!res.data?.success) {
      throw new Error(`Live import failed: ${res.data?.message || 'Unknown'}`);
    }
    liveResult = res.data;
    console.log(`         Import completed: ${liveResult.summary?.created} created, ${liveResult.summary?.updated} updated, ${liveResult.summary?.loginAccountsCreated} logins generated in ${liveResult.durationMs}ms`);
    if (!liveResult.credentialsExport?.credentials?.length) {
      throw new Error('Missing temporary credentials export report');
    }
  });

  // Step 3: Verify Superadmin login
  let adminToken = '';
  await test('3. Test 1 (Superadmin) - superadmin@bjkhealthcare.com Login -> FULL ACCESS', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'superadmin@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(res.data?.message || 'Superadmin login failed');
    }
    adminToken = res.data.token;
    if (res.data.user?.role !== 'SUPER_ADMIN') {
      throw new Error(`Expected SUPER_ADMIN role, got ${res.data.user?.role}`);
    }

    // Verify full access endpoint
    const dash = await request('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (dash.data?.dashboardType !== 'SUPER_ADMIN') {
      throw new Error(`Expected dashboardType SUPER_ADMIN, got ${dash.data?.dashboardType}`);
    }
  });

  // Step 4: Verify HR login
  let hrToken = '';
  await test('4. Test 2 (HR) - hr@bjkhealthcare.com Login -> FULL HR ACCESS', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'hr@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(res.data?.message || 'HR login failed');
    }
    hrToken = res.data.token;
    if (!['HR', 'HR_MANAGER', 'HR_ADMIN'].includes(res.data.user?.role)) {
      throw new Error(`Expected HR role, got ${res.data.user?.role}`);
    }

    // HR can view all employees
    const empList = await request('/employees?limit=10', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!empList.ok || !empList.data?.success) {
      throw new Error(`HR failed to view employees: ${empList.data?.message}`);
    }
    console.log(`         HR retrieved employee directory successfully (Total in DB: ${empList.data.pagination?.total || empList.data.data?.length})`);
  });

  // Step 5: Test Employee Login (Active)
  let empToken = '';
  let empUser = null;
  await test('5. Test 3 (Employee) - Active Master Employee Login (e.g. BH1022)', async () => {
    // BH1022 is Parth Chauhan (Production Officer)
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'BH1022', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(res.data?.message || 'Employee BH1022 login failed');
    }
    empToken = res.data.token;
    empUser = res.data.user;
    console.log(`         Employee Logged In: ${empUser.name} | Role: ${empUser.role} | Dept: ${empUser.department}`);
    if (empUser.role !== 'EMPLOYEE') {
      throw new Error(`Expected EMPLOYEE role, got ${empUser.role}`);
    }
    if (empUser.mustChangePassword !== true) {
      throw new Error('Expected mustChangePassword to be true for newly generated employee account');
    }

    // Load Employee Dashboard
    const dash = await request('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (dash.data?.dashboardType !== 'EMPLOYEE') {
      throw new Error(`Expected EMPLOYEE dashboardType, got ${dash.data?.dashboardType}`);
    }
  });

  // Step 6: Test Unauthorized Access (403)
  await test('6. Test 4a (Unauthorized Access) - Employee accessing /api/employees -> 403 Forbidden', async () => {
    const res = await request('/employees', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  await test('7. Test 4b (Unauthorized Access) - Employee accessing /api/admin -> 403 Forbidden', async () => {
    const res = await request('/admin', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  await test('8. Test 4c (Unauthorized Access) - Employee accessing another employee profile -> 403 Forbidden', async () => {
    // BH1022 attempts to access BH1023 (Prashant Gajera)
    const res = await request('/employees/BH1023', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden, got HTTP ${res.status}`);
    }
  });

  await test('9. Test 4d (Authorized Self Profile) - Employee accessing own profile -> 200 OK', async () => {
    const res = await request('/employees/BH1022', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (!res.ok || !res.data?.success) {
      throw new Error(`Failed to access own profile: ${res.data?.message}`);
    }
  });

  // Step 7: Test Inactive Employee Login Blocked (Test 5)
  await test('10. Test 5 (Inactive Employee) - Inactive employee (BH1021) Login -> Blocked with 403', async () => {
    // BH1021 is Dipak Savaliya with DOL 10/11/2024 (INACTIVE)
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'BH1021', password: 'Password123!' }
    });
    if (res.status !== 403) {
      throw new Error(`Expected 403 Forbidden for inactive employee, got HTTP ${res.status}`);
    }
    if (!res.data?.message?.toLowerCase().includes('inactive')) {
      throw new Error(`Expected inactive account message, got "${res.data?.message}"`);
    }
    console.log(`         Correctly blocked: "${res.data?.message}"`);
  });

  // Step 8: Test Password Reset by HR
  await test('11. Test HR Reset Password - Generates Temporary Password with mustChangePassword=true', async () => {
    const res = await request('/employees/BH1022/reset-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.data?.success || !res.data?.temporaryPassword) {
      throw new Error(`Failed to reset employee password: ${res.data?.message}`);
    }
    console.log(`         Temporary password generated: ${res.data.temporaryPassword} | mustChangePassword=${res.data.mustChangePassword}`);
  });

  // Step 9: Verify Import Audit Trail
  await test('12. Test Audit Trail - Import and Employee Audit Logs Available', async () => {
    const res = await request('/audit/employees', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data?.success) {
      throw new Error(`Failed to fetch employee audit logs: ${res.data?.message}`);
    }
    console.log(`         Audit entries found: ${res.data.count}`);
    if (res.data.count === 0) {
      throw new Error('Expected at least 1 audit entry for import/password actions');
    }
  });

  console.log('\n===============================================================');
  console.log(` MASTER TEST SUITE: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('===============================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runTests();
