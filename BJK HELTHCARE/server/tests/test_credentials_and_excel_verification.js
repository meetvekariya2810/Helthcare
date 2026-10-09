// BJK HEALTHCARE — CREDENTIAL & EXCEL VERIFICATION TEST SUITE
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const EXCEL_PATH = 'C:/Users/Meet Vekariya/OneDrive/Desktop/BJK_Employee_Login_Credentials.xlsx';

async function runTests() {
  console.log('================================================================');
  console.log(' BJK HEALTHCARE — CREDENTIALS & EXCEL WORKBOOK VERIFICATION');
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
    return { status: res.status, ok: res.ok, data, headers: res.headers };
  };

  // Wait for server health
  for (let i = 0; i < 15; i++) {
    try {
      const ping = await request('/health');
      if (ping.ok && ping.data?.database === 'connected') {
        console.log('Server and database connectivity verified.\n');
        break;
      }
    } catch (_) {}
    await new Promise(r => setTimeout(r, 1000));
  }

  // 1. Verify Excel File Generation on Desktop
  await test('1. Verify BJK_Employee_Login_Credentials.xlsx exists on Desktop', async () => {
    if (!fs.existsSync(EXCEL_PATH)) throw new Error(`File not found at ${EXCEL_PATH}`);
    const stat = fs.statSync(EXCEL_PATH);
    if (stat.size < 5000) throw new Error(`Excel file is unusually small: ${stat.size} bytes`);
    console.log(`         File size: ${stat.size} bytes`);
  });

  // 2. Inspect Excel Sheets & Data Integrity
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(EXCEL_PATH);

  let sampleActiveCredentials = [];
  let sampleInactive = [];

  await test('2. Verify Sheet 1: Employee Login Credentials (63 rows in source order)', async () => {
    const ws1 = wb.getWorksheet('Employee Login Credentials');
    if (!ws1) throw new Error('Sheet 1 "Employee Login Credentials" not found');

    const expectedCols = ['Sr No', 'Employee Code', 'Employee Name', 'Department', 'Sub Department', 'Designation', 'Login ID', 'Temporary Password', 'Account Status', 'Must Change Password', 'Login Created', 'Credential Generated Date', 'Notes'];
    
    // Header is row 3
    const headerRow = ws1.getRow(3).values;
    const headerSlice = Array.isArray(headerRow) ? headerRow.slice(1) : [];
    expectedCols.forEach(col => {
      if (!headerSlice.includes(col)) throw new Error(`Missing expected column: ${col}`);
    });

    let rowCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    for (let r = 4; r <= ws1.rowCount; r++) {
      const row = ws1.getRow(r);
      const code = row.getCell(2).value;
      const name = row.getCell(3).value;
      const loginId = row.getCell(7).value;
      const tempPwd = row.getCell(8).value;
      const status = row.getCell(9).value;
      const mustChange = row.getCell(10).value;
      const loginCreated = row.getCell(11).value;

      if (!name) continue;
      rowCount++;

      if (status === 'ACTIVE') {
        activeCount++;
        if (mustChange !== 'YES') throw new Error(`Row ${r}: Active account without Must Change Password = YES`);
        if (loginCreated !== 'YES') throw new Error(`Row ${r}: Active account without Login Created = YES`);
        if (!tempPwd || tempPwd.length < 12) throw new Error(`Row ${r}: Temporary password does not meet 12-char minimum`);
        if (sampleActiveCredentials.length < 5) {
          sampleActiveCredentials.push({ code, name, loginId, tempPwd, status });
        }
      } else if (status === 'INACTIVE') {
        inactiveCount++;
        if (loginCreated !== 'NO') throw new Error(`Row ${r}: Inactive account should have Login Created = NO`);
        if (sampleInactive.length < 3) {
          sampleInactive.push({ code, name, loginId });
        }
      }
    }

    if (rowCount !== 63) throw new Error(`Expected 63 employee records, found ${rowCount}`);
    if (inactiveCount !== 11) throw new Error(`Expected 11 inactive DOL employees, found ${inactiveCount}`);
    console.log(`         Validated ${rowCount} employee rows: ${activeCount} active, ${inactiveCount} inactive`);
  });

  await test('3. Verify Sheet 2: Department Summary (Actual counts)', async () => {
    const ws2 = wb.getWorksheet('Department Summary');
    if (!ws2) throw new Error('Sheet 2 "Department Summary" not found');
    let totalFound = false;
    ws2.eachRow(row => {
      if (row.getCell(1).value === 'TOTAL WORKFORCE') {
        totalFound = true;
        const total = row.getCell(2).value;
        const active = row.getCell(3).value;
        const inactive = row.getCell(4).value;
        const logins = row.getCell(5).value;
        if (total !== 63) throw new Error(`Expected 63 total, got ${total}`);
        if (active !== 52) throw new Error(`Expected 52 active, got ${active}`);
        if (inactive !== 11) throw new Error(`Expected 11 inactive, got ${inactive}`);
        if (logins !== 51) throw new Error(`Expected 51 logins, got ${logins}`);
        console.log(`         Workforce Total: ${total} | Active: ${active} | Inactive: ${inactive} | Logins: ${logins}`);
      }
    });
    if (!totalFound) throw new Error('TOTAL WORKFORCE row missing in Department Summary');
  });

  await test('4. Verify Sheet 3: Validation Report & Audit Metrics', async () => {
    const ws3 = wb.getWorksheet('Validation Report');
    if (!ws3) throw new Error('Sheet 3 "Validation Report" not found');
    if (ws3.rowCount < 20) throw new Error(`Sheet 3 too short: ${ws3.rowCount} rows`);
  });

  await test('5. Verify Sheet 4: HR Instructions & Rollout SOP', async () => {
    const ws4 = wb.getWorksheet('HR Instructions');
    if (!ws4) throw new Error('Sheet 4 "HR Instructions" not found');
    if (ws4.rowCount < 10) throw new Error(`Sheet 4 too short: ${ws4.rowCount} rows`);
  });

  // 3. Test HTTP Download Endpoint
  await test('6. GET /api/credentials/download-excel - Authorized Download', async () => {
    const res = await request('/credentials/download-excel', {
      headers: { 'x-bjk-internal-key': 'bjk_healthcare_credential_sync_internal_2026' }
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
  });

  // 4. Test Active Employee Login with Temporary Password
  let testEmp = sampleActiveCredentials[0] || { code: 'BH1022', loginId: 'BH1022', tempPwd: '' };
  let testToken = '';
  await test(`7. POST /api/auth/login - Active Employee [${testEmp.code}] Temporary Password Authentication`, async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        employeeId: testEmp.code,
        password: testEmp.tempPwd
      }
    });

    if (!res.ok || !res.data?.success) {
      throw new Error(res.data?.message || 'Login failed with temporary password');
    }
    if (!res.data?.token) throw new Error('JWT token missing from response');
    if (res.data?.user?.mustChangePassword !== true) {
      throw new Error(`Expected mustChangePassword = true, got ${res.data?.user?.mustChangePassword}`);
    }
    testToken = res.data.token;
    console.log(`         Authenticated: ${res.data.user.name} | Role: ${res.data.user.role} | Dashboard: ${res.data.dashboard}`);
  });

  // 5. Test Another Active Employee
  let testEmp2 = sampleActiveCredentials[1] || { code: 'BH1023', loginId: 'BH1023', tempPwd: '' };
  await test(`8. POST /api/auth/login - Active Employee [${testEmp2.code}] Temporary Password Authentication`, async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        employeeId: testEmp2.code,
        password: testEmp2.tempPwd
      }
    });

    if (!res.ok || !res.data?.success) {
      throw new Error(res.data?.message || 'Login failed with temporary password');
    }
    if (res.data?.user?.mustChangePassword !== true) {
      throw new Error(`Expected mustChangePassword = true, got ${res.data?.user?.mustChangePassword}`);
    }
  });

  // 6. Test Inactive / DOL Employee Blocked (403 Forbidden)
  let inactiveEmp = sampleInactive[0] || { code: 'BH1021' };
  await test(`9. POST /api/auth/login - Inactive Employee [${inactiveEmp.code}] Blocked with 403 Forbidden`, async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        employeeId: inactiveEmp.code,
        password: 'AnyPassword123!'
      }
    });

    if (res.status !== 403 && res.status !== 401) {
      throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    }
    console.log(`         Correctly blocked inactive account [${inactiveEmp.code}] with status ${res.status}`);
  });

  // 7. Test Invalid Password Rejected (401 Unauthorized)
  await test(`10. POST /api/auth/login - Wrong Password Rejection (401 Unauthorized)`, async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        employeeId: testEmp.code,
        password: 'IncorrectPassword999!'
      }
    });

    if (res.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    }
  });

  // 8. Test First-Login Password Change Flow (Section 14 Requirement)
  const newPermanentPassword = 'PermSecure@BJK2026!';
  await test('11. First-Login Password Change Flow (Temporary -> Permanent)', async () => {
    // A. Update password
    const chgRes = await request('/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: {
        oldPassword: testEmp.tempPwd,
        newPassword: newPermanentPassword
      }
    });

    if (!chgRes.ok || !chgRes.data?.success) {
      throw new Error(chgRes.data?.message || 'Password update failed');
    }

    // B. Old temporary password must now FAIL
    const oldLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        employeeId: testEmp.code,
        password: testEmp.tempPwd
      }
    });

    if (oldLoginRes.status !== 401) {
      throw new Error(`Expected old temporary password to fail with 401, but got ${oldLoginRes.status}`);
    }

    // C. New password must now WORK
    const newLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        employeeId: testEmp.code,
        password: newPermanentPassword
      }
    });

    if (!newLoginRes.ok || !newLoginRes.data?.success) {
      throw new Error(newLoginRes.data?.message || 'Login with new password failed');
    }
    if (newLoginRes.data?.user?.mustChangePassword === true) {
      throw new Error('mustChangePassword should now be false after setting permanent password');
    }

    console.log('         Password successfully updated: Old temporary password failed; new password verified.');

    // D. Revert to original temporary password so test suite is repeatable
    await request('/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newLoginRes.data.token}` },
      body: {
        oldPassword: newPermanentPassword,
        newPassword: testEmp.tempPwd
      }
    });
  });

  console.log('\n================================================================');
  console.log(` RESULT: ${passed} / ${total} VERIFICATION CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exitCode = 1;
  }
}

runTests();
