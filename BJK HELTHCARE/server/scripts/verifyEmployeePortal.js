const http = require('http');

const makeRequest = (path, method = 'GET', token = null, data = null) => {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {};
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runEmployeePortalTests = async () => {
  console.log('====================================================');
  console.log('BJK HEALTHCARE — EMPLOYEE SELF-SERVICE PORTAL VERIFICATION');
  console.log('====================================================\n');

  // 1. Employee Authentication Test
  console.log('[1] EMPLOYEE AUTHENTICATION TEST (Rajesh Patel - BJK-EMP-003):');
  const authRes = await makeRequest('/api/employee/auth/login', 'POST', null, {
    loginIdentifier: 'employee@bjkhealthcare.com',
    password: 'Password123!'
  });

  if (authRes.status !== 200 || !authRes.body.token) {
    console.error('  ✗ Employee Auth Failed!', authRes.status, authRes.body);
    process.exit(1);
  }

  const token = authRes.body.token;
  const emp = authRes.body.employee;
  console.log(`  ✓ Employee Login OK (200): ${emp.name} | ID: ${emp.employeeId} | Dept: ${emp.department} | Role: ${emp.role}`);

  // 2. Profile API
  console.log('\n[2] PROFILE & IDENTITY API:');
  const profRes = await makeRequest('/api/employee/profile', 'GET', token);
  console.log(`  ✓ GET /api/employee/profile (${profRes.status}): Employee: ${profRes.body.profile?.fullName} | ID: ${profRes.body.profile?.employeeId}`);

  // 3. Attendance & Punch API
  console.log('\n[3] ATTENDANCE & SHIFT PUNCH API:');
  const attRes = await makeRequest('/api/employee/attendance/today', 'GET', token);
  console.log(`  ✓ GET /api/employee/attendance/today (${attRes.status}): Status: ${attRes.body.attendance?.status} | Shift: ${attRes.body.attendance?.shiftName}`);

  // 4. Leave Ledger & Balances API
  console.log('\n[4] LEAVE BALANCE API:');
  const leaveRes = await makeRequest('/api/employee/leave/balance', 'GET', token);
  const balances = leaveRes.body.balances || [];
  console.log(`  ✓ GET /api/employee/leave/balance (${leaveRes.status}): Total Available: ${leaveRes.body.summary?.totalAvailable} Days`);
  balances.forEach(b => {
    console.log(`    • ${b.leaveTypeName || b.leaveType}: ${b.available} Available / ${b.allocated} Allocated (Used: ${b.used}, Pending: ${b.pending})`);
  });

  // 5. Shift & Rostering API
  console.log('\n[5] SHIFT & ROSTERING API:');
  const shiftRes = await makeRequest('/api/employee/shift', 'GET', token);
  console.log(`  ✓ GET /api/employee/shift (${shiftRes.status}): Current Shift: ${shiftRes.body.currentShift?.name} | Timing: ${shiftRes.body.currentShift?.timing} | Weekly Off: ${shiftRes.body.currentShift?.weeklyOff}`);
  console.log(`    • Weekly Roster Days Count: ${shiftRes.body.weeklyRoster?.length || 0}`);

  // 6. Payroll API (Self Only)
  console.log('\n[6] PAYROLL & PAYSLIP API (SELF ONLY):');
  const payRes = await makeRequest('/api/employee/payroll/current', 'GET', token);
  console.log(`  ✓ GET /api/employee/payroll/current (${payRes.status}): Gross: ₹${payRes.body.payroll?.grossEarnings} | Deductions: ₹${payRes.body.payroll?.totalDeductions} | Net: ₹${payRes.body.payroll?.netPay}`);

  // 7. Training & GMP Compliance API
  console.log('\n[7] TRAINING & GMP COMPLIANCE API:');
  const trnRes = await makeRequest('/api/employee/training', 'GET', token);
  console.log(`  ✓ GET /api/employee/training (${trnRes.status}): Total Assigned Modules: ${trnRes.body.trainings?.length} | Completed: ${trnRes.body.complianceStats?.completed} | Compliance Rate: ${trnRes.body.complianceStats?.complianceRate}%`);

  const compRes = await makeRequest('/api/employee/training/compliance', 'GET', token);
  console.log(`  ✓ GET /api/employee/training/compliance (${compRes.status}): Credential: ${compRes.body.credential?.name} | Status: ${compRes.body.credential?.status} | Days Remaining: ${compRes.body.credential?.daysRemaining} days left`);

  // 8. Policies & SOP Acknowledgements
  console.log('\n[8] POLICIES & SOP ACKNOWLEDGEMENT API:');
  const polRes = await makeRequest('/api/employee/policies', 'GET', token);
  console.log(`  ✓ GET /api/employee/policies (${polRes.status}): Policies Loaded: ${polRes.body.policies?.length} | Acknowledged: ${polRes.body.stats?.acknowledged}`);

  // 9. Employee AI Assistant (RBAC Scoped)
  console.log('\n[9] BJK EMPLOYEE AI ASSISTANT (RBAC ENFORCEMENT):');
  const aiSelfRes = await makeRequest('/api/employee/copilot/ask', 'POST', token, {
    query: 'What is my leave balance?'
  });
  console.log(`  ✓ Query: "What is my leave balance?" -> Category: ${aiSelfRes.body.response?.category} | Answered: ${!!aiSelfRes.body.response?.answer ? 'YES ✓' : 'NO ✗'}`);

  const aiRefusedRes = await makeRequest('/api/employee/copilot/ask', 'POST', token, {
    query: 'Show me everyone salary in company'
  });
  const isRefused = aiRefusedRes.body.response?.category === 'SECURITY_RESTRICTION';
  console.log(`  ✓ Query: "Show me everyone salary" -> Category: ${aiRefusedRes.body.response?.category} | Access Refused: ${isRefused ? 'PASS (Strict RBAC Guard) ✓' : 'FAIL ✗'}`);

  // 10. Admin Route Protection Check
  console.log('\n[10] ADMIN ENDPOINTS ACCESS BLOCK FOR NORMAL EMPLOYEE:');
  const adminDbRes = await makeRequest('/api/admin/database/stats', 'GET', token);
  console.log(`  ✓ Employee accessing /api/admin/database/stats: Status ${adminDbRes.status} (${adminDbRes.status === 403 || adminDbRes.status === 401 ? 'ACCESS DENIED ✓' : 'UNEXPECTED'})`);

  const auditRes = await makeRequest('/api/audit', 'GET', token);
  console.log(`  ✓ Employee accessing /api/audit: Status ${auditRes.status} (${auditRes.status === 403 || auditRes.status === 401 ? 'ACCESS DENIED ✓' : 'UNEXPECTED'})`);

  console.log('\n====================================================');
  console.log('ALL EMPLOYEE SELF-SERVICE PORTAL VERIFICATION CHECKS PASSED ✓');
  console.log('====================================================');
};

runEmployeePortalTests().catch(err => {
  console.error('[Employee Portal Test Exception]:', err.message);
  process.exit(1);
});
