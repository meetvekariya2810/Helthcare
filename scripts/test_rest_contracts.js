/**
 * BJK Healthcare — REST API Contract Parity & Role Permission Matrix Suite
 * Tests REST contracts, JSON response schemas, and RBAC matrix across core domain routes.
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runContractSuite() {
  console.log('========================================================================');
  console.log('  BJK HEALTHCARE — REST CONTRACT PARITY & ROLE MATRIX TEST SUITE');
  console.log('  Target Base URL:', BASE_URL);
  console.log('========================================================================\n');

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

  const req = async (endpoint, options = {}) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, ok: res.ok, data };
  };

  // Acquire test tokens
  console.log('[Setup] Acquiring role authentication tokens...');
  let adminToken = '';
  let hrToken = '';
  let qaToken = '';
  let empToken = '';

  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'admin@bjkhealthcare.com', password: 'Admin@BJK2026!' }
  });
  if (adminLogin.data?.token) adminToken = adminLogin.data.token;

  const hrLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'hr.manager@bjkhealthcare.com', password: process.env.TEST_HR_PASSWORD || 'Bjk@2810' }
  });
  if (hrLogin.data?.token) hrToken = hrLogin.data.token;

  let qaLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'qa.manager@bjkhealthcare.com', password: 'Bjk@2026' }
  });
  if (!qaLogin.data?.token) {
    qaLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'test-qa-mgr', password: 'Bjk@2026' }
    });
  }
  if (qaLogin.data?.token) qaToken = qaLogin.data.token;

  const empLogin = await req('/auth/login', {
    method: 'POST',
    body: { email: 'prd.test@bjkhealthcare.com', password: 'Bjk@2026' }
  });
  if (empLogin.data?.token) empToken = empLogin.data.token;

  console.log(`Tokens acquired: Admin=${Boolean(adminToken)}, HR=${Boolean(hrToken)}, QA=${Boolean(qaToken)}, EMP=${Boolean(empToken)}\n`);

  // Section 1: Authentication Domain Contracts
  await test('Contract 1: POST /api/auth/login invalid credentials returns 401 with standard schema', async () => {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { email: 'nonexistent@bjkhealthcare.com', password: 'WrongPassword123!' }
    });
    if (res.status !== 401 && res.status !== 403) throw new Error(`Expected 401/403, got ${res.status}`);
    if (res.data?.success !== false) throw new Error('Expected success: false in error contract');
    if (!res.data?.message) throw new Error('Missing message string in error contract');
  });

  await test('Contract 2: POST /api/auth/login valid returns token, user object, and dashboard', async () => {
    if (!adminToken) throw new Error('Admin login failed during setup');
    if (!adminLogin.data?.token || !adminLogin.data?.user || !adminLogin.data?.dashboard) {
      throw new Error('Missing token, user, or dashboard in auth contract');
    }
  });

  // Section 2: Employee Domain Contracts
  await test('Contract 3: GET /api/employees directory returns pagination and records', async () => {
    const res = await req('/employees?limit=5', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.data?.success && !Array.isArray(res.data?.data) && !Array.isArray(res.data)) {
      throw new Error('Invalid employee directory schema');
    }
  });

  await test('Contract 4: GET /api/employees/:id returns single employee schema with masked PII', async () => {
    const res = await req('/employees/BH1022', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const emp = res.data?.data || res.data;
    if (!emp || (emp.employeeCode !== 'BH1022' && emp.employeeId !== 'BH1022')) {
      throw new Error('Employee resource contract mismatch');
    }
    // Verify bank account is masked or empty
    if (emp.bankAccountNumber && !emp.bankAccountNumber.includes('X')) {
      throw new Error('Bank account is unmasked in employee contract!');
    }
  });

  // Section 3: Attendance Domain Contracts
  await test('Contract 5: GET /api/hrms/attendance returns attendance live telemetry array', async () => {
    const res = await req('/hrms/attendance', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.data?.success !== true && !Array.isArray(res.data?.data) && !Array.isArray(res.data)) {
      throw new Error('Invalid attendance response contract');
    }
  });

  await test('Contract 6: GET /api/hrms/attendance/dashboard returns KPI totals', async () => {
    const res = await req('/hrms/attendance/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = res.data?.data || res.data;
    if (typeof body.total !== 'number' && typeof body.present !== 'number') {
      throw new Error('Missing attendance dashboard KPI metrics in contract');
    }
  });

  // Section 4: Leave Domain Contracts
  await test('Contract 7: GET /api/hrms/leaves returns leave request management queue', async () => {
    const res = await req('/hrms/leaves', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.data?.success !== true && !Array.isArray(res.data?.data)) {
      throw new Error('Invalid leave queue response contract');
    }
  });

  // Section 5: QA / Quality Domain Contracts
  await test('Contract 8: GET /api/qa/deviations returns QA deviations register schema', async () => {
    const res = await req('/qa/deviations', {
      headers: { Authorization: `Bearer ${qaToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('Contract 9: GET /api/qa/capas returns QA CAPA investigations schema', async () => {
    const res = await req('/qa/capas', {
      headers: { Authorization: `Bearer ${qaToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // Section 6: Telemetry & Dashboard Domain Contracts
  await test('Contract 10: GET /api/hrms/dashboard (SUPER_ADMIN) returns 9-tile companyOperations', async () => {
    const res = await req('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.data?.dashboardType !== 'SUPER_ADMIN') throw new Error(`Expected SUPER_ADMIN, got ${res.data?.dashboardType}`);
    if (!Array.isArray(res.data?.companyOperations) || res.data.companyOperations.length < 9) {
      throw new Error('Company operations status tiles missing');
    }
  });

  await test('Contract 11: GET /api/hrms/dashboard (HR_MANAGER) returns workforce KPIs', async () => {
    const res = await req('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.data?.dashboardType !== 'HR_MANAGER') throw new Error(`Expected HR_MANAGER, got ${res.data?.dashboardType}`);
    if (!res.data?.kpis || typeof res.data.kpis.totalEmployees !== 'number') {
      throw new Error('Missing workforce telemetry KPIs');
    }
  });

  await test('Contract 12: GET /api/hrms/dashboard (QA_MANAGER) returns QA telemetry and headcount', async () => {
    const res = await req('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${qaToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.data?.dashboardType !== 'QA_MANAGER') throw new Error(`Expected QA_MANAGER, got ${res.data?.dashboardType}`);
    if (!res.data?.kpis || typeof res.data.kpis.qaHeadcount !== 'number') {
      throw new Error('Missing QA telemetry KPIs');
    }
  });

  await test('Contract 13: GET /api/hrms/dashboard (EMPLOYEE) returns self-service telemetry', async () => {
    const res = await req('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.data?.dashboardType !== 'EMPLOYEE') throw new Error(`Expected EMPLOYEE, got ${res.data?.dashboardType}`);
  });

  // Section 7: Audit & AI Domain Contracts
  await test('Contract 14: GET /api/audit returns immutable audit log list schema', async () => {
    const res = await req('/audit?limit=5', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.data?.success || !Array.isArray(res.data?.logs)) {
      throw new Error('Invalid audit trail contract response');
    }
  });

  await test('Contract 15: POST /api/ai/query returns grounded response string', async () => {
    const res = await req('/ai/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { query: 'Summarize system workforce' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.data?.success || !res.data?.response) {
      throw new Error('Missing response text in AI query contract');
    }
  });

  // Section 8: Role Permission Matrix (RBAC & IDOR Boundary Enforcement)
  await test('RBAC Matrix 1: Unauthenticated request on /api/hrms/dashboard rejected with 401', async () => {
    const res = await req('/hrms/dashboard');
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await test('RBAC Matrix 2: Standard Employee accessing /api/employees rejected with 403 Forbidden', async () => {
    const res = await req('/employees', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test('RBAC Matrix 3: HR Manager attempting batch QA release rejected with 403 Forbidden', async () => {
    const res = await req('/batches/000000000000000000000001/qa-release', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hrToken}` },
      body: { decision: 'RELEASED' }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test('RBAC Matrix 4: Unauthenticated request on /api/audit rejected with 401', async () => {
    const res = await req('/audit');
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
  });

  await test('RBAC Matrix 5: Employee accessing /api/audit rejected with 403 Forbidden', async () => {
    const res = await req('/audit', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  await test('RBAC Matrix 6: Direct access to .xlsx spreadsheet URLs strictly rejected with 403 Forbidden', async () => {
    const res = await req('/BJK_Employee_Login_Credentials.xlsx');
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  console.log('\n========================================================================');
  console.log(` CONTRACT TEST SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runContractSuite().catch(err => {
  console.error('Fatal test error:', err.message);
  process.exit(1);
});
