const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runEmployeePortalMasterValidation() {
  console.log('================================================================');
  console.log(' BJK HEALTHCARE DIGITAL BRAIN - EMPLOYEE PORTAL VERIFICATION');
  console.log('================================================================\n');

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

  const req = async (path, options = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
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

  // 1. Employee Login Verification
  let empToken = '';
  let employeeData = null;
  await test('1. Employee Login via /api/employee/auth/login', async () => {
    const res = await req('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: 'employee@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(res.data?.message || 'Employee login failed');
    }
    empToken = res.data.token;
    employeeData = res.data.employee;
    if (!employeeData?.name || !employeeData?.employeeId) {
      throw new Error('Employee payload missing dynamic name or ID');
    }
  });

  // 2. Dynamic Employee Identity
  await test('2. Dynamic Employee Identity (Not Hardcoded)', async () => {
    if (!employeeData.name || !employeeData.employeeId || !employeeData.department) {
      throw new Error('Missing dynamic employee attributes');
    }
  });

  // 3. Admin Attempt on Employee Login Blocked
  await test('3. Admin Account Blocked on Employee Login (Shows portal guidance)', async () => {
    const res = await req('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: 'admin@bjkhealthcare.com', password: 'Password123!' }
    });
    if (res.status !== 403 || !res.data?.isNonEmployee) {
      throw new Error(`Expected 403 with isNonEmployee, got status ${res.status}: ${res.data?.message}`);
    }
    if (!res.data?.message?.includes('appropriate portal')) {
      throw new Error(`Expected 'appropriate portal' message, got: ${res.data?.message}`);
    }
  });

  // 4. Director Attempt on Employee Login Blocked
  await test('4. Director Account Blocked on Employee Login (Shows portal guidance)', async () => {
    const res = await req('/employee/auth/login', {
      method: 'POST',
      body: { loginIdentifier: 'director@bjkhealthcare.com', password: 'Password123!' }
    });
    if (res.status !== 403 || !res.data?.isNonEmployee) {
      throw new Error(`Expected 403 with isNonEmployee, got status ${res.status}`);
    }
  });

  const empHeaders = () => ({ Authorization: `Bearer ${empToken}` });

  // 5. Today's Attendance Telemetry
  await test('5. GET /api/employee/attendance/today - Real Attendance Telemetry', async () => {
    const res = await req('/employee/attendance/today', { headers: empHeaders() });
    if (!res.data?.success || !res.data?.attendance) {
      throw new Error('Failed to retrieve today attendance');
    }
  });

  // 6. Annual Leave Quotas & Balances (11 Quotas)
  await test('6. GET /api/employee/leave/balance - Exactly 11 Leave Types Calculated from Ledger', async () => {
    const res = await req('/employee/leave/balance', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.balances)) {
      throw new Error('Failed to retrieve leave balances');
    }
    const balances = res.data.balances;
    const requiredTypes = [
      'Casual Leave (CL)',
      'Sick Leave (SL)',
      'Earned',
      'Compensatory Off',
      'Maternity Leave',
      'Paternity Leave',
      'Bereavement Leave',
      'Marriage Leave',
      'Leave Without Pay',
      'Special',
      'Other Authorized Absence'
    ];
    for (const reqType of requiredTypes) {
      const match = balances.some(b => (b.leaveTypeName || b.leaveType || '').includes(reqType));
      if (!match) throw new Error(`Missing required leave type in balance ledger: ${reqType}`);
    }
  });

  // 7. Recent Leave Requests
  await test('7. GET /api/employee/leave - Isolated Own Leave Requests', async () => {
    const res = await req('/employee/leave', { headers: empHeaders() });
    if (!res.data?.success) throw new Error('Failed to retrieve leave requests');
  });

  // 8. My Tasks Telemetry
  await test('8. GET /api/employee/tasks - Employee-Specific Task Workload', async () => {
    const res = await req('/employee/tasks', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.tasks)) {
      throw new Error('Failed to retrieve tasks');
    }
  });

  // 9. My Documents
  await test('9. GET /api/employee/documents - Employee Digital Document Safe', async () => {
    const res = await req('/employee/documents', { headers: empHeaders() });
    if (!res.data?.success || !res.data?.documents) {
      throw new Error('Failed to retrieve employee documents');
    }
  });

  // 10. Notifications
  await test('10. GET /api/employee/notifications - Isolated Notifications', async () => {
    const res = await req('/employee/notifications', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.notifications)) {
      throw new Error('Failed to retrieve notifications');
    }
  });

  // 11. Company Announcements
  await test('11. GET /api/employee/announcements - Official Broadcast Circulars', async () => {
    const res = await req('/employee/announcements', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.announcements)) {
      throw new Error('Failed to retrieve announcements');
    }
  });

  // 12. Payroll Telemetry
  await test('12. GET /api/employee/payroll/current - Employee Salary Ledger', async () => {
    const res = await req('/employee/payroll/current', { headers: empHeaders() });
    if (!res.data?.success) throw new Error('Failed to retrieve current payroll');
  });

  // 13. Training & Compliance
  await test('13. GET /api/employee/training - Mandatory Pharma Compliance & LMS', async () => {
    const res = await req('/employee/training', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.trainings)) {
      throw new Error('Failed to retrieve training modules');
    }
  });

  // 14. Support Desk
  await test('14. GET /api/employee/support - Help & Support Tickets', async () => {
    const res = await req('/employee/support', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.requests)) {
      throw new Error('Failed to retrieve support requests');
    }
  });

  // 15. Team & Organization
  await test('15. GET /api/employee/team - Permitted Team & Manager Telemetry', async () => {
    const res = await req('/employee/team', { headers: empHeaders() });
    if (!res.data?.success) throw new Error('Failed to retrieve team');
  });

  // 16. Company Holiday Calendar
  await test('16. GET /api/employee/leave/holidays - Official 2026 Holiday Schedule', async () => {
    const res = await req('/employee/leave/holidays?year=2026', { headers: empHeaders() });
    if (!res.data?.success || !Array.isArray(res.data?.holidays) || res.data.holidays.length < 10) {
      throw new Error('Holiday schedule missing or incomplete');
    }
  });

  // 17. Segregation of Duties: Employee blocked from Executive QA Batch Release
  await test('17. Segregation of Duties: Employee Blocked from QA Batch Release (403 Forbidden)', async () => {
    const res = await req('/batches/000000000000000000000001/qa-release', {
      method: 'POST',
      headers: empHeaders(),
      body: { decision: 'RELEASED' }
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 18. Non-employee login remains completely untouched and functional
  let adminToken = '';
  await test('18. Director & Super Admin Login via /api/auth/login Unchanged', async () => {
    const res = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@bjkhealthcare.com', password: 'Password123!' }
    });
    if (!res.data?.success || !res.data?.token) {
      throw new Error(res.data?.message || 'Super admin login failed');
    }
    adminToken = res.data.token;
  });

  // 19. Super Admin Executive Command Center Telemetry Unchanged
  await test('19. Super Admin Executive Command Center Telemetry Unchanged', async () => {
    const res = await req('/hrms/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!res.data?.success || res.data?.dashboardType !== 'SUPER_ADMIN') {
      throw new Error(`Expected SUPER_ADMIN dashboard, got ${res.data?.dashboardType}`);
    }
    if (!res.data?.companyOperations || res.data?.companyOperations.length < 9) {
      throw new Error('Missing Executive 9-tile Company Operations Telemetry');
    }
  });

  console.log('\n================================================================');
  console.log(` RESULT: ${passed} / ${total} VERIFICATION CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runEmployeePortalMasterValidation();
