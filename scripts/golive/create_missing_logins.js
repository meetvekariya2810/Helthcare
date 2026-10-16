const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../../BJK HELTHCARE/server/config/db');

async function createMissingLogins() {
  const isExecute = process.argv.includes('--execute');
  const isDryRun = !isExecute || process.argv.includes('--dry-run');

  console.log('========================================================================');
  console.log('  BJK HEALTHCARE — PROVISION MISSING EMPLOYEE LOGINS');
  console.log(`  MODE: ${isDryRun ? 'DRY-RUN (Safe Read-Only Simulation)' : 'EXECUTE (Live Database Modification)'}`);
  console.log('========================================================================\n');

  await connectDB();
  const db = mongoose.connection.db;

  const employeesCol = db.collection('employees');
  const usersCol = db.collection('users');

  const activeEmployees = await employeesCol.find({ status: 'ACTIVE' }).toArray();
  const existingUsers = await usersCol.find({}).toArray();

  const userEmails = new Set(existingUsers.map(u => (u.email || '').toLowerCase()).filter(Boolean));
  const userEmpIds = new Set(existingUsers.map(u => (u.employeeId || u.empId || '').toUpperCase()).filter(Boolean));

  const missingLogins = activeEmployees.filter(emp => {
    const email = (emp.email || emp.workEmail || '').toLowerCase();
    const code = (emp.employeeCode || emp.employeeId || '').toUpperCase();
    return !userEmails.has(email) && !userEmpIds.has(code);
  });

  console.log(`Active Workforce Headcount: ${activeEmployees.length}`);
  console.log(`Total Existing User Accounts: ${existingUsers.length}`);
  console.log(`Active Employees Lacking Login: ${missingLogins.length}`);

  if (missingLogins.length === 0) {
    console.log('\n[PASS] All active employees have associated login accounts! No action required.');
    await mongoose.disconnect();
    return;
  }

  console.log('\nMissing Accounts Candidate List:');
  missingLogins.forEach((emp, idx) => {
    console.log(`  [${idx + 1}] Code: ${emp.employeeCode || emp.employeeId} | Name: ${emp.fullName} | Email: ${emp.email || emp.workEmail}`);
  });

  if (isDryRun) {
    console.log('\n[DRY RUN COMPLETE] Zero database records modified. To apply, re-run with:');
    console.log('  node scripts/golive/create_missing_logins.js --execute');
    await mongoose.disconnect();
    return;
  }

  // Live creation path (Only executed with explicit --execute switch by Owner/HR)
  console.log('\n[EXECUTE] Provisioning missing user accounts with mustChangePassword=true...');
  const auditLogsCol = db.collection('auditlogs');
  const secureOutputFile = path.resolve(process.env.TEMP || 'C:\\temp', `bjk_created_logins_${Date.now()}.json`);
  const secureOutput = [];

  for (const emp of missingLogins) {
    const email = (emp.email || emp.workEmail || '').toLowerCase().trim();
    const tempPassword = 'Bjk@' + crypto.randomBytes(4).toString('hex') + '!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const code = emp.employeeCode || emp.employeeId;

    const userDoc = {
      name: emp.fullName || 'BJK Employee',
      email: email,
      employeeId: code,
      empId: code,
      role: 'EMPLOYEE',
      department: emp.departmentName || emp.department || 'Operations',
      password: passwordHash,
      passwordHash: passwordHash,
      mustChangePassword: true,
      isActive: true,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const insertRes = await usersCol.insertOne(userDoc);

    await auditLogsCol.insertOne({
      action: 'USER_CREATED_MISSING_PROVISION',
      module: 'AUTH',
      resource: 'User',
      details: `Provisioned missing login for active employee ${code} (${email})`,
      user: { role: 'SUPER_ADMIN', email: 'owner@bjkhealthcare.com' },
      timestamp: new Date()
    });

    secureOutput.push({
      employeeCode: code,
      email: email,
      tempPassword: tempPassword,
      mustChangePassword: true
    });
  }

  fs.writeFileSync(secureOutputFile, JSON.stringify(secureOutput, null, 2), { mode: 0o600 });
  console.log(`Successfully created ${missingLogins.length} accounts.`);
  console.log(`Temporary credentials written securely OUTSIDE the repository at:`);
  console.log(`  ${secureOutputFile}`);

  await mongoose.disconnect();
}

createMissingLogins().catch(err => {
  console.error('Account provisioning error:', err);
  process.exit(1);
});
