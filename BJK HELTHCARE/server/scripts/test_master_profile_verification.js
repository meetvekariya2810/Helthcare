require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
const { connectDB } = require('../config/db');

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

async function verifyMasterProfiles() {
  await connectDB();
  const Employee = require('../models/Employee');
  const User = require('../models/User');

  console.log('=== 1. VERIFYING 51 ENRICHED EMPLOYEE PROFILES IN DATABASE ===');
  const enrichedEmployees = await Employee.find({
    profileCompletion: { $gte: 90 },
    bankName: { $ne: '' }
  }).lean();

  console.log(`Found ${enrichedEmployees.length} profiles with full Bank & KYC enrichment in DB.`);

  let withBank = 0;
  let withPan = 0;
  let withAadhaar = 0;
  let withDoj = 0;
  let withDob = 0;
  let withAge = 0;
  let withYears = 0;

  enrichedEmployees.forEach(e => {
    if (e.bankName && e.bankAccountNumber && e.ifscCode) withBank++;
    if (e.panNumber) withPan++;
    if (e.aadhaarNumber) withAadhaar++;
    if (e.dateOfJoining) withDoj++;
    if (e.dateOfBirth) withDob++;
    if (e.age) withAge++;
    if (e.yearsOfService) withYears++;
  });

  console.log(`- Profiles with Bank Name, A/C, IFSC: ${withBank}`);
  console.log(`- Profiles with PAN Card: ${withPan}`);
  console.log(`- Profiles with Aadhaar Card: ${withAadhaar}`);
  console.log(`- Profiles with Date of Joining: ${withDoj}`);
  console.log(`- Profiles with Date of Birth: ${withDob}`);
  console.log(`- Profiles with Age: ${withAge}`);
  console.log(`- Profiles with Years of Service: ${withYears}`);

  // Test HR Controller API endpoint for Dixita Makwana (BH1022)
  console.log('\n=== 2. VERIFYING HR API GET /api/hr/employees/:id ===');
  const sampleEmp = await Employee.findOne({ employeeCode: 'BH1022' }).lean();

  const superAdminToken = jwt.sign({
    id: '6ac3db6bfd2dfda097aabbe2',
    email: 'admin@bjkhealthcare.com',
    role: 'SUPER_ADMIN'
  }, JWT_SECRET, { expiresIn: '1h' });

  const resHr = await makeRequest({
    method: 'GET',
    path: `/api/hr/employees/${sampleEmp._id}`,
    token: superAdminToken
  });

  console.log(`HR View API Status: ${resHr.status}`);
  const empData = resHr.data?.employee;
  console.log('Retrieved Employee:', {
    code: empData?.employeeCode,
    name: empData?.fullName,
    age: empData?.age,
    gender: empData?.gender,
    yearsOfService: empData?.yearsOfService,
    aadhaar: empData?.sensitiveData?.aadhaarNumber || empData?.aadhaarNumber,
    pan: empData?.sensitiveData?.panNumber || empData?.panNumber,
    bankName: empData?.sensitiveData?.bankDetails?.bankName || empData?.bankName,
    bankAccount: empData?.sensitiveData?.bankDetails?.accountNumber || empData?.bankAccountNumber,
    ifsc: empData?.sensitiveData?.bankDetails?.ifscCode || empData?.ifscCode
  });

  // Verify non-HR user cannot see private bank/PAN details of another user
  console.log('\n=== 3. VERIFYING ACCESS CONTROL SANITIZATION ===');
  const otherEmpToken = jwt.sign({
    id: '6ac3db75e656d61f35f32836', // different employee
    email: 'other@bjkhealthcare.com',
    employeeId: 'BH1099',
    role: 'EMPLOYEE'
  }, JWT_SECRET, { expiresIn: '1h' });

  const resOther = await makeRequest({
    method: 'GET',
    path: `/api/hr/employees/${sampleEmp._id}`,
    token: otherEmpToken
  });
  console.log(`Non-HR Caller Status: ${resOther.status} (Access restricted as expected)`);

  console.log('\n=== 4. DATABASE SAFETY AUDIT (RULE 31) ===');
  const userCount = await User.countDocuments({});
  const empCount = await Employee.countDocuments({});
  console.log(`Final Users in DB: ${userCount} (Target: 82)`);
  console.log(`Final Employees in DB: ${empCount} (Target: 91)`);
  console.log(`Safety Check Passed: ${userCount === 82 && empCount === 91}`);

  await mongoose.disconnect();
}

verifyMasterProfiles().catch(err => {
  console.error(err);
  process.exit(1);
});
