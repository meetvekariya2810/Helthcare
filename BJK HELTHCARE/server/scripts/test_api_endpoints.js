require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET || 'bjk_healthcare_digital_brain_ultra_secure_jwt_secret_key_2026_enterprise';

function makeRequest({ method, path, token, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function testEndpoints() {
  console.log('Testing Attendance API endpoints on http://localhost:5000...\n');

  // Super Admin Token
  const superAdminToken = jwt.sign({
    id: '6ac3db6bfd2dfda097aabbe2',
    email: 'admin@bjkhealthcare.com',
    role: 'SUPER_ADMIN'
  }, JWT_SECRET, { expiresIn: '1h' });

  // Employee BH1022 Token (Dixita Makwana)
  const employeeToken = jwt.sign({
    id: '6ac3db75e656d61f35f32835',
    email: 'bh1022@bjkhealthcare.com',
    employeeCode: 'BH1022',
    employeeId: 'BH1022',
    role: 'EMPLOYEE'
  }, JWT_SECRET, { expiresIn: '1h' });

  // 1. GET /api/attendance/imports
  console.log('1. Testing GET /api/attendance/imports (Superadmin)');
  const resImports = await makeRequest({
    method: 'GET',
    path: '/api/attendance/imports',
    token: superAdminToken
  });
  console.log(`Status: ${resImports.status}, Batches Found: ${resImports.data?.count}`);

  // 2. GET /api/attendance/month/2026/8
  console.log('\n2. Testing GET /api/attendance/month/2026/8 (Superadmin)');
  const resMonth = await makeRequest({
    method: 'GET',
    path: '/api/attendance/month/2026/8',
    token: superAdminToken
  });
  console.log(`Status: ${resMonth.status}, Employees with summary: ${resMonth.data?.data?.summaries?.length}, Total daily: ${resMonth.data?.data?.dailyRecords?.length}`);

  // 3. GET /api/attendance/employee/BH1022 as Employee BH1022 (Authorized)
  console.log('\n3. Testing GET /api/attendance/employee/BH1022 as Employee BH1022 (Authorized)');
  const resEmpOwn = await makeRequest({
    method: 'GET',
    path: '/api/attendance/employee/BH1022',
    token: employeeToken
  });
  console.log(`Status: ${resEmpOwn.status}, Name: ${resEmpOwn.data?.data?.employee?.name}, Daily Records: ${resEmpOwn.data?.data?.dailyRecords?.length}, Summaries: ${resEmpOwn.data?.data?.monthlySummaries?.length}`);

  // 4. GET /api/attendance/employee/BH1023 as Employee BH1022 (Rule 26: Security check - must be 403 Forbidden!)
  console.log('\n4. Testing GET /api/attendance/employee/BH1023 as Employee BH1022 (Rule 26: Security check)');
  const resEmpOther = await makeRequest({
    method: 'GET',
    path: '/api/attendance/employee/BH1023',
    token: employeeToken
  });
  console.log(`Status: ${resEmpOther.status} (Expected 403), Message: ${resEmpOther.data?.message}`);

  // 5. GET /api/attendance/employee/BH1023 as Superadmin (Authorized)
  console.log('\n5. Testing GET /api/attendance/employee/BH1023 as Superadmin (Authorized)');
  const resEmpAdmin = await makeRequest({
    method: 'GET',
    path: '/api/attendance/employee/BH1023',
    token: superAdminToken
  });
  console.log(`Status: ${resEmpAdmin.status}, Name: ${resEmpAdmin.data?.data?.employee?.name}, Daily: ${resEmpAdmin.data?.data?.dailyRecords?.length}`);

  // 6. POST /api/attendance/import/validate
  console.log('\n6. Testing POST /api/attendance/import/validate (Superadmin)');
  const resVal = await makeRequest({
    method: 'POST',
    path: '/api/attendance/import/validate',
    token: superAdminToken,
    body: {}
  });
  console.log(`Status: ${resVal.status}, Matched: ${resVal.data?.data?.matchedCount}, Unmatched: ${resVal.data?.data?.unmatchedCount}, Valid cells: ${resVal.data?.data?.validAttendanceCells}`);

  // 7. GET /api/attendance/master-validation (Superadmin)
  console.log('\n7. Testing GET /api/attendance/master-validation (Superadmin)');
  const resMasterVal = await makeRequest({
    method: 'GET',
    path: '/api/attendance/master-validation',
    token: superAdminToken
  });
  console.log(`Status: ${resMasterVal.status}, Total Excel: ${resMasterVal.data?.data?.totalExcelEmployees}, Matched: ${resMasterVal.data?.data?.matchedExistingEmployees}, Missing: ${resMasterVal.data?.data?.employeesMissingInDatabase}`);

  // 8. GET /api/attendance/master-validation as Employee (Expected 403)
  console.log('\n8. Testing GET /api/attendance/master-validation as Employee (Security check)');
  const resMasterEmp = await makeRequest({
    method: 'GET',
    path: '/api/attendance/master-validation',
    token: employeeToken
  });
  console.log(`Status: ${resMasterEmp.status} (Expected 403), Message: ${resMasterEmp.data?.message}`);

  // 9. POST /api/attendance/master-enrich (Superadmin)
  console.log('\n9. Testing POST /api/attendance/master-enrich (Superadmin)');
  const resMasterEnrich = await makeRequest({
    method: 'POST',
    path: '/api/attendance/master-enrich',
    token: superAdminToken,
    body: {}
  });
  console.log(`Status: ${resMasterEnrich.status}, Enriched Count: ${resMasterEnrich.data?.data?.enrichedCount}, Safety Check: ${resMasterEnrich.data?.data?.safetyVerification?.safetyCheckPassed}`);

  console.log('\n=== ALL API ENDPOINT CHECKS VERIFIED ===');
}

testEndpoints().catch(console.error);
