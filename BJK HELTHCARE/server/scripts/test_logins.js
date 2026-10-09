const http = require('http');

function postLogin(payload, name) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n=== Test: ${name} ===`);
        console.log('Status Code:', res.statusCode);
        try {
          const json = JSON.parse(body);
          console.log('Success:', json.success);
          console.log('Role:', json.data?.user?.role || json.user?.role);
          console.log('Email:', json.data?.user?.email || json.user?.email);
          console.log('EmployeeId:', json.data?.user?.employeeId || json.user?.employeeId);
          console.log('Token Received:', !!(json.data?.token || json.token));
          console.log('FirstLogin:', json.data?.user?.firstLogin || json.user?.firstLogin);
        } catch(e) {
          console.log('Raw response:', body);
        }
        resolve();
      });
    });
    req.on('error', (err) => {
      console.error(`Request error for ${name}:`, err.message);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

(async () => {
  await postLogin({ email: 'bh1046@bjkhealthcare.com', password: 'Bjk@2810' }, 'HR Manager via Email');
  await postLogin({ employeeId: 'BH1046', password: 'Bjk@2810' }, 'HR Manager via Employee Code');
  await postLogin({ loginIdentifier: 'bh1046@bjkhealthcare.com', password: 'Bjk@2810' }, 'HR Manager via loginIdentifier');
  await postLogin({ email: 'admin@bjkhealthcare.com', password: 'Admin@BJK2026!' }, 'Super Admin (Universal All Access)');
})();
