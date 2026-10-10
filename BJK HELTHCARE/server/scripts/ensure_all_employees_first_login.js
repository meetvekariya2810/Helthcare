const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function checkAndEnforce() {
  const uri = process.env.MONGODB_URI;
  console.log('[Script] Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('[Script] Connected successfully.');

  const db = mongoose.connection.db;
  const usersCol = db.collection('users');
  const employeesCol = db.collection('employees');

  const totalUsers = await usersCol.countDocuments({});
  const totalEmployees = await employeesCol.countDocuments({});
  console.log(`Total users in DB: ${totalUsers}`);
  console.log(`Total employees in DB: ${totalEmployees}`);

  // Find employees and users without passwordChangedAt
  const usersWithoutPermanent = await usersCol.find({
    $or: [
      { passwordChangedAt: null },
      { passwordChangedAt: { $exists: false } }
    ]
  }).toArray();

  console.log(`Users without permanent password: ${usersWithoutPermanent.length}`);

  // Update employee-level users to have mustChangePassword: true if not permanent
  // Only for non-admin accounts or employees
  const updateResultUsers = await usersCol.updateMany(
    {
      $or: [
        { passwordChangedAt: null },
        { passwordChangedAt: { $exists: false } }
      ],
      role: { $nin: ['SUPER_ADMIN', 'DIRECTOR'] }
    },
    {
      $set: {
        mustChangePassword: true,
        firstLogin: true
      }
    }
  );
  console.log(`Users updated with mustChangePassword: true -> ${updateResultUsers.modifiedCount}`);

  // Update employees collection
  const updateResultEmployees = await employeesCol.updateMany(
    {
      $or: [
        { passwordChangedAt: null },
        { passwordChangedAt: { $exists: false } }
      ]
    },
    {
      $set: {
        mustChangePassword: true
      }
    }
  );
  console.log(`Employees updated with mustChangePassword: true -> ${updateResultEmployees.modifiedCount}`);

  // List summary of active test accounts
  const sampleEmployees = await usersCol.find({
    role: { $in: ['EMPLOYEE', 'QC_ANALYST', 'OPERATOR', 'TECHNICIAN'] }
  }).limit(5).toArray();

  console.log('Sample employee users status:');
  sampleEmployees.forEach(u => {
    console.log(` - ${u.email} (${u.employeeId}): mustChangePassword=${u.mustChangePassword}, passwordChangedAt=${u.passwordChangedAt}`);
  });

  await mongoose.disconnect();
  console.log('[Script] Completed successfully.');
  process.exit(0);
}

checkAndEnforce().catch(err => {
  console.error('[Script Error]', err);
  process.exit(1);
});
