const http = require('http');

const testLogin = (identifier, password) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ email: identifier, password });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

const runUnifiedLoginTests = async () => {
  console.log('====================================================');
  console.log('BJK HEALTHCARE — UNIFIED ROLE-BASED LOGIN VERIFICATION');
  console.log('====================================================\n');

  const testMatrix = [
    {
      label: 'Employee (by Work Email)',
      identifier: 'employee@bjkhealthcare.com',
      password: 'Password123!',
      expectedRole: 'EMPLOYEE',
      expectedDashboard: '/employee/dashboard'
    },
    {
      label: 'Employee (by Employee Code BH1046)',
      identifier: 'BH1046',
      password: 'Password123!',
      expectedRole: 'EMPLOYEE',
      expectedDashboard: '/employee/dashboard'
    },
    {
      label: 'Employee (by Employee Code BJK-EMP-003)',
      identifier: 'BJK-EMP-003',
      password: 'Password123!',
      expectedRole: 'EMPLOYEE',
      expectedDashboard: '/employee/dashboard'
    },
    {
      label: 'Employee (by Employee Code EMP001)',
      identifier: 'EMP001',
      password: 'Password123!',
      expectedRole: 'EMPLOYEE',
      expectedDashboard: '/employee/dashboard'
    },
    {
      label: 'HR Manager',
      identifier: 'hr.manager@bjkhealthcare.com',
      password: 'Password123!',
      expectedRole: 'HR_MANAGER',
      expectedDashboard: '/hr/dashboard'
    },
    {
      label: 'QA Manager',
      identifier: 'qa.manager@bjkhealthcare.com',
      password: 'Password123!',
      expectedRole: 'QA_MANAGER',
      expectedDashboard: '/qa/dashboard'
    },
    {
      label: 'Super Admin',
      identifier: 'admin@bjkhealthcare.com',
      password: 'Admin@BJK2026!',
      expectedRole: 'SUPER_ADMIN',
      expectedDashboard: '/admin/dashboard'
    }
  ];

  let passed = 0;
  for (const test of testMatrix) {
    const res = await testLogin(test.identifier, test.password);
    const success = res.status === 200 && res.body?.success;
    const roleMatches = res.body?.user?.role === test.expectedRole;
    const dashboardMatches = res.body?.dashboard === test.expectedDashboard;

    if (success && roleMatches && dashboardMatches) {
      passed++;
      console.log(`✓ [PASS] ${test.label}:`);
      console.log(`   User: ${res.body.user.name} | Role: ${res.body.user.role} | Dashboard: ${res.body.dashboard}`);
    } else {
      console.error(`✗ [FAIL] ${test.label}:`, res.status, res.body);
    }
  }

  // Test invalid credentials
  console.log('\n[Security Checks]');
  const badLogin = await testLogin('fake.user@bjkhealthcare.com', 'WrongPassword!');
  if (badLogin.status === 401 && !badLogin.body.success) {
    console.log('✓ [PASS] Invalid credentials handled securely (401 Unauthorized)');
    passed++;
  } else {
    console.error('✗ [FAIL] Invalid credentials check failed:', badLogin);
  }

  console.log(`\n====================================================`);
  console.log(`TEST RESULTS: ${passed}/${testMatrix.length + 1} CHECKS PASSED`);
  console.log(`====================================================`);
  process.exit(passed === testMatrix.length + 1 ? 0 : 1);
};

runUnifiedLoginTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
