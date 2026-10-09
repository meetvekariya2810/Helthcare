const http = require('http');

function postJSON(path, payload, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');

async function run() {
  await connectDB();
  const hrUser = await User.findOne({ role: 'HR_ADMIN' }) || await User.findOne();
  console.log('Using User:', hrUser.email, 'Role:', hrUser.role);

  const token = jwt.sign(
    { id: hrUser._id, role: hrUser.role, email: hrUser.email },
    process.env.JWT_SECRET || 'bjk-healthcare-enterprise-secret-key-2026',
    { expiresIn: '1d' }
  );

  // 2. Test Attendance Dashboard KPIs for August 2026
  const dashRes = await getJSON('/api/attendance/dashboard?dateFrom=2026-08-01&dateTo=2026-08-31&branch=ALL&department=ALL', token);
  console.log('\n--- DASHBOARD KPI (AUG 2026) ---');
  console.log('Dashboard Counts:', dashRes.data?.counts);

  // 3. Test Preview Attendance Report (All Depts, Aug 2026)
  const previewRes = await postJSON('/api/attendance/reports/preview', {
    filters: {
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
      branches: ['Ahmedabad'],
      departments: ['ALL'],
      statuses: ['ALL']
    }
  }, token);

  console.log('\n--- PREVIEW API (AUG 2026) ---');
  console.log('Total Records:', previewRes.data?.totalRecords);
  console.log('Employee Count:', previewRes.data?.employeeCount);
  console.log('Preview Rows Length:', previewRes.data?.previewRows?.length);
  if (previewRes.data?.previewRows?.length > 0) {
    console.log('Sample Row 1:', {
      empId: previewRes.data.previewRows[0].employeeId,
      name: previewRes.data.previewRows[0].employeeName,
      dept: previewRes.data.previewRows[0].department,
      date: previewRes.data.previewRows[0].date,
      status: previewRes.data.previewRows[0].status
    });
  }

  // 4. Test Single Employee Search Preview (BH1022)
  const empSearchRes = await postJSON('/api/attendance/reports/preview', {
    filters: {
      dateFrom: '2026-08-01',
      dateTo: '2026-08-31',
      employeeSearch: 'BH1022'
    }
  }, token);

  console.log('\n--- EMPLOYEE SEARCH PREVIEW (BH1022) ---');
  console.log('Total Records:', empSearchRes.data?.totalRecords);
  console.log('Employee Count:', empSearchRes.data?.employeeCount);

  // 5. Test Month API endpoints for Jan, Aug, and Sep
  for (const m of [1, 3, 8, 9]) {
    const monthRes = await getJSON(`/api/attendance/month/2026/${m}`, token);
    console.log(`\n--- MONTH API (/api/attendance/month/2026/${m}) ---`);
    console.log('Monthly Summaries count:', monthRes.data?.data?.summaries?.length);
    console.log('Daily Attendance count:', monthRes.data?.data?.dailyRecords?.length);
    console.log('Month Stats:', monthRes.data?.data?.stats);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
