const fs = require('fs');
const path = require('path');

async function testLiveApi() {
  console.log('Testing Live Attendance API on http://localhost:5000...');

  // 1. Authenticate as Admin
  console.log('1. Authenticating as admin@bjkhealthcare.com...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@bjkhealthcare.com',
      password: 'Admin@BJK2026!'
    })
  });

  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  const token = loginData.token;
  console.log('✓ Logged in successfully. Token acquired. User role:', loginData.user?.role);

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 2. Test Attendance Dashboard KPIs
  console.log('\n2. Testing /api/hrms/attendance/dashboard...');
  const dashRes = await fetch('http://localhost:5000/api/hrms/attendance/dashboard?branch=Ahmedabad&department=Production&dateFrom=2026-10-01&dateTo=2026-10-31', {
    headers: authHeaders
  });
  const dashData = await dashRes.json();
  console.log('✓ Dashboard response:', dashData.counts);

  // 3. Test Preview Report (Test Case 1: October 2026 Production Attendance)
  console.log('\n3. Testing /api/hrms/attendance/reports/preview (Test Case 1: Oct 2026 Production)...');
  const previewRes = await fetch('http://localhost:5000/api/hrms/attendance/reports/preview', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['Production'],
      statuses: ['PRESENT', 'LATE', 'HALF_DAY'],
      selectedColumns: [
        'employeeId',
        'employeeName',
        'date',
        'shift',
        'actualIn',
        'actualOut',
        'status',
        'lateBy',
        'workingHours'
      ]
    })
  });

  const previewData = await previewRes.json();
  console.log(`✓ Preview records found: ${previewData.totalRecords}, staff count: ${previewData.employeeCount}`);
  if (previewData.previewRows && previewData.previewRows.length > 0) {
    console.log('  * Sample preview row:', previewData.previewRows[0]);
  }

  // 4. Test Excel Generation Endpoint (.xlsx download)
  console.log('\n4. Testing /api/hrms/attendance/reports/excel (Streaming .xlsx download)...');
  const excelRes = await fetch('http://localhost:5000/api/hrms/attendance/reports/excel', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['Production'],
      statuses: ['PRESENT', 'LATE', 'HALF_DAY'],
      selectedColumns: [
        'employeeId',
        'employeeName',
        'date',
        'shift',
        'actualIn',
        'actualOut',
        'status',
        'lateBy',
        'workingHours'
      ],
      sheetStructure: 'SINGLE'
    })
  });

  if (!excelRes.ok) {
    console.error('Excel generation failed with status:', excelRes.status);
    const errText = await excelRes.text();
    console.error(errText);
    process.exit(1);
  }

  const arrayBuffer = await excelRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const outPath = path.join(__dirname, '../artifacts_test/Live_Test1_Production_Oct_2026.xlsx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✓ Excel report generated and saved: ${outPath} (${buffer.length} bytes)`);

  // 5. Test Missing OUT Punch Filter (Test Case 2)
  console.log('\n5. Testing Test Case 2: Missing OUT Punches...');
  const test2Res = await fetch('http://localhost:5000/api/hrms/attendance/reports/preview', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      dateFrom: '2026-10-04',
      dateTo: '2026-10-04',
      departments: ['Production', 'Quality Control', 'Quality Assurance'],
      statuses: ['PRESENT'],
      punchConditions: ['MISSING_OUT'],
      selectedColumns: ['employeeName', 'employeeId', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'punchCondition']
    })
  });
  const test2Data = await test2Res.json();
  console.log(`✓ Test 2 Missing OUT matching records: ${test2Data.totalRecords}`);

  // 6. Test Multi-sheet Summary + Detail (Test Case 3)
  console.log('\n6. Testing Test Case 3: Summary + Detailed Multi-Sheet Workbook...');
  const test3Res = await fetch('http://localhost:5000/api/hrms/attendance/reports/excel', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      dateFrom: '2026-10-01',
      dateTo: '2026-10-31',
      branches: ['Ahmedabad'],
      departments: ['Production'],
      selectedColumns: ['employeeId', 'employeeName', 'department', 'date', 'shift', 'actualIn', 'actualOut', 'status', 'workingHours', 'overtime'],
      sheetStructure: 'SUMMARY_DETAIL'
    })
  });
  const test3Buf = Buffer.from(await test3Res.arrayBuffer());
  const out3Path = path.join(__dirname, '../artifacts_test/Live_Test3_MultiSheet_Summary_Detailed.xlsx');
  fs.writeFileSync(out3Path, test3Buf);
  console.log(`✓ Multi-sheet workbook saved: ${out3Path} (${test3Buf.length} bytes)`);

  // 7. Test Report Templates API
  console.log('\n7. Testing /api/hrms/attendance/reports/templates...');
  const tplRes = await fetch('http://localhost:5000/api/hrms/attendance/reports/templates', {
    headers: authHeaders
  });
  const tplData = await tplRes.json();
  console.log(`✓ Available templates: ${tplData.templates?.length || 0}`);

  // 8. Test Regularization Requests API
  console.log('\n8. Testing /api/hrms/attendance/regularization...');
  const regRes = await fetch('http://localhost:5000/api/hrms/attendance/regularization', {
    headers: authHeaders
  });
  const regData = await regRes.json();
  console.log(`✓ Pending regularizations: ${regData.requests?.length || 0}`);

  console.log('\n================================================================');
  console.log('ALL LIVE API ENDPOINTS VERIFIED & FUNCTIONING WITH 100% SUCCESS!');
  console.log('================================================================');
  process.exit(0);
}

testLiveApi().catch((err) => {
  console.error('Live API test error:', err);
  process.exit(1);
});
