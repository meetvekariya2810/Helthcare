const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixAllTemporaryPasswordUsers() {
  console.log('[Fix] Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const usersCol = db.collection('users');
  const employeesCol = db.collection('employees');

  const allUsers = await usersCol.find({}).toArray();
  let updatedUsersCount = 0;

  for (const u of allUsers) {
    const hash = u.password || u.passwordHash;
    let isTemp = false;
    if (hash) {
      if (hash === 'Password123!') {
        isTemp = true;
      } else {
        try {
          isTemp = await bcrypt.compare('Password123!', hash);
        } catch (_) {}
      }
    }

    if (isTemp) {
      await usersCol.updateOne(
        { _id: u._id },
        {
          $set: {
            mustChangePassword: true,
            firstLogin: true,
            temporaryPassword: true,
            passwordChangedAt: null
          }
        }
      );
      updatedUsersCount++;
    }
  }

  console.log(`[Fix] Updated ${updatedUsersCount} users with temporary password (Password123!) to mustChangePassword=true, passwordChangedAt=null.`);

  // Also update employees collection
  const allEmployees = await employeesCol.find({}).toArray();
  let updatedEmployeesCount = 0;
  for (const emp of allEmployees) {
    // If employee has mustChangePassword !== true or null passwordChangedAt
    if (!emp.passwordChangedAt || emp.mustChangePassword !== false) {
      await employeesCol.updateOne(
        { _id: emp._id },
        {
          $set: {
            mustChangePassword: true,
            passwordChangedAt: null
          }
        }
      );
      updatedEmployeesCount++;
    }
  }
  console.log(`[Fix] Updated ${updatedEmployeesCount} employees in employees collection to mustChangePassword=true.`);

  // Verify Ajaykumar Mesariya (BH1076)
  const bh1076User = await usersCol.findOne({ email: /bh1076/i });
  const bh1076Emp = await employeesCol.findOne({ email: /bh1076/i });
  console.log('BH1076 User status:', {
    email: bh1076User?.email,
    mustChangePassword: bh1076User?.mustChangePassword,
    passwordChangedAt: bh1076User?.passwordChangedAt,
    firstLogin: bh1076User?.firstLogin
  });
  console.log('BH1076 Emp status:', {
    email: bh1076Emp?.email,
    mustChangePassword: bh1076Emp?.mustChangePassword,
    passwordChangedAt: bh1076Emp?.passwordChangedAt
  });

  await mongoose.disconnect();
  console.log('[Fix] Completed successfully.');
}

fixAllTemporaryPasswordUsers().catch(console.error);
