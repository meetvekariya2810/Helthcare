const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} });
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  // 1. Login as HR
  const hrLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'bh1046@bjkhealthcare.com', password: 'Bjk@2810' });

  const hrToken = hrLogin.body.data?.token || hrLogin.body.token;
  console.log('HR Login status:', hrLogin.status, 'Token exists:', !!hrToken);

  // Test HR accessing /api/hrms/attendance
  const hrAttendance = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/hrms/attendance',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${hrToken}` }
  });
  console.log('HR accessing HRMS Attendance:', hrAttendance.status, hrAttendance.body.success !== undefined ? hrAttendance.body.success : hrAttendance.body.length || 'Data returned');

  // 2. Login as Super Admin
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@bjkhealthcare.com', password: 'Admin@BJK2026!' });

  const adminToken = adminLogin.body.data?.token || adminLogin.body.token;
  console.log('Admin Login status:', adminLogin.status, 'Token exists:', !!adminToken);

  // Test Superadmin accessing /api/admin/system/health or /api/auth/me
  const adminMe = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Super Admin accessing /api/auth/me:', adminMe.status, adminMe.body.data?.role || adminMe.body.user?.role);

  // Test Superadmin accessing HRMS Attendance
  const adminAttendance = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/hrms/attendance',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log('Super Admin accessing HRMS Attendance:', adminAttendance.status);
})();
