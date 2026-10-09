// BJK HEALTHCARE - ROLE-BASED DASHBOARD & FUNCTIONAL REGRESSION TEST SUITE
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runRegressionSuite() {
  console.log('====================================================');
  console.log(' BJK HEALTHCARE - ROLE DASHBOARDS & WORKFLOW TESTS');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passedTests++;
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
  for (let i = 0; i < 15; i++) {
    try {
      const ping = await request('/health');
      if (ping.ok && ping.data?.database === 'connected') {
        console.log('Server and MongoDB connection verified.\n');
        break;
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1000));
  }

  // 1. Director / Super Admin Login & Executive Dashboard Telemetry
  let adminToken = '';
  await test('POST /api/auth/login - Super Admin Login', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      // try alternate Admin password if configured
      const resAlt = await request('/auth/login', {
        method: 'POST',
        body: { email: 'admin@bjkhealthcare.com', password: 'Admin@BJK2026!' }
      });
      if (!resAlt.data?.success) throw new Error(res.data?.message || 'Login failed');
      adminToken = resAlt.data.token;
      return;
    }
    adminToken = res.data.token;
  });

  await test('GET /api/hrms/dashboard - Super Admin Executive Command Center Telemetry', async () => {
    const res = await request('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch executive dashboard');
    if (res.data?.dashboardType !== 'SUPER_ADMIN') throw new Error(`Expected SUPER_ADMIN, got ${res.data?.dashboardType}`);
    if (!res.data?.companyOperations || res.data?.companyOperations.length < 9) {
      throw new Error('Missing 9-tile Company Operations Status');
    }
  });

  // 2. HR Manager Login & Workforce Command Center Telemetry
  let hrToken = '';
  await test('POST /api/auth/login - HR Manager Login', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'hr.manager@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) throw new Error(res.data?.message || 'Login failed');
    hrToken = res.data.token;
  });

  await test('GET /api/hrms/dashboard - HR Workforce Command Center Telemetry', async () => {
    const res = await request('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch HR dashboard');
    if (res.data?.dashboardType !== 'HR_MANAGER') throw new Error(`Expected HR_MANAGER, got ${res.data?.dashboardType}`);
    if (!res.data?.kpis || typeof res.data.kpis.totalEmployees !== 'number') {
      throw new Error('Missing workforce telemetry KPIs');
    }
  });

  // 3. QA Manager Login & Quality & Workforce Command Center Telemetry
  let qaToken = '';
  await test('POST /api/auth/login - QA Manager Login', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'qa.manager@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) throw new Error(res.data?.message || 'Login failed');
    qaToken = res.data.token;
  });

  await test('GET /api/hrms/dashboard - QA Quality & Workforce Command Center Telemetry', async () => {
    const res = await request('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${qaToken}` }
    });
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch QA dashboard');
    if (res.data?.dashboardType !== 'QA_MANAGER') throw new Error(`Expected QA_MANAGER, got ${res.data?.dashboardType}`);
    if (!res.data?.kpis || typeof res.data.kpis.qaHeadcount !== 'number') {
      throw new Error('Missing QA telemetry KPIs');
    }
  });

  // 4. Employee Login & Self Service Portal Telemetry
  let empToken = '';
  await test('POST /api/auth/login - Employee Login', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: { email: 'employee@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) throw new Error(res.data?.message || 'Login failed');
    empToken = res.data.token;
  });

  await test('GET /api/hrms/dashboard - Employee Self-Service Telemetry', async () => {
    const res = await request('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${empToken}` }
    });
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to fetch Employee dashboard');
    if (res.data?.dashboardType !== 'EMPLOYEE') throw new Error(`Expected EMPLOYEE, got ${res.data?.dashboardType}`);
  });

  // 5. HR Operations Workflows: Employee Directory, Attendance, Leaves
  await test('GET /api/employees - HR Manager Employee Directory', async () => {
    const res = await request('/employees?limit=24', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('GET /api/hrms/attendance - Attendance Live Telemetry', async () => {
    const res = await request('/hrms/attendance', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('GET /api/hrms/leaves - Leave Management Queue', async () => {
    const res = await request('/hrms/leaves', {
      headers: { Authorization: `Bearer ${hrToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 6. QA Operations Workflows: Deviations, CAPAs, Batch Release Gate
  await test('GET /api/qa/deviations - QA Deviations Register', async () => {
    const res = await request('/qa/deviations', {
      headers: { Authorization: `Bearer ${qaToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  await test('GET /api/qa/capas - QA CAPA Investigations', async () => {
    const res = await request('/qa/capas', {
      headers: { Authorization: `Bearer ${qaToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  // 7. Segregation of Duties: HR Manager blocked from Batch Release
  await test('POST /api/batches/:id/qa-release (HR Manager) - Rejects with 403 Forbidden', async () => {
    const res = await request('/batches/000000000000000000000001/qa-release', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hrToken}` },
      body: { decision: 'RELEASED' }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 8. Grounded AI Copilot Query with Role Permissions
  await test('POST /api/ai/query - Authorized Telemetry AI Query', async () => {
    const res = await request('/ai/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { query: 'How many products are registered in the brochure?' }
    });
    if (!res.ok || !res.data?.success) throw new Error(res.data?.message || 'AI query failed');
  });

  // 9. Immutable Audit Trail Ingestion
  await test('GET /api/audit - Audit Trail Verification', async () => {
    const res = await request('/audit?limit=10', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  });

  console.log('\n====================================================');
  console.log(` RESULT: ${passedTests} / ${totalTests} CHECKS PASSED (${Math.round((passedTests / totalTests) * 100)}% PASS RATE)`);
  console.log('====================================================\n');

  process.exit(passedTests === totalTests ? 0 : 1);
}

runRegressionSuite();
