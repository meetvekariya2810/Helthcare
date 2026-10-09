const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Employee = require('../models/Employee');

async function syncUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // 1. HR Manager: bh1046@bjkhealthcare.com / Bjk@2810 / BH1046
    const hrEmail = 'bh1046@bjkhealthcare.com';
    const hrPass = 'Bjk@2810';
    const hrHashedPassword = await bcrypt.hash(hrPass, 10);

    let hrUser = await User.findOne({
      $or: [{ email: hrEmail.toLowerCase() }, { employeeId: 'BH1046' }]
    });

    if (!hrUser) {
      hrUser = new User({
        name: 'HR Manager',
        email: hrEmail.toLowerCase(),
        employeeId: 'BH1046',
        password: hrHashedPassword,
        role: 'HR_MANAGER',
        department: 'HR',
        designation: 'HR Manager',
        status: 'ACTIVE',
        firstLogin: false,
        isActive: true,
        permissions: [
          'hr:read', 'hr:write', 'hr:manage',
          'employee:read', 'employee:write',
          'attendance:read', 'attendance:write',
          'leave:read', 'leave:approve',
          'payroll:read', 'payroll:write'
        ]
      });
      await hrUser.save();
      console.log(`Created new HR Manager user: ${hrEmail} (BH1046)`);
    } else {
      hrUser.name = hrUser.name || 'HR Manager';
      hrUser.email = hrEmail.toLowerCase();
      hrUser.employeeId = 'BH1046';
      hrUser.password = hrHashedPassword;
      hrUser.role = 'HR_MANAGER';
      hrUser.department = 'HR';
      hrUser.status = 'ACTIVE';
      hrUser.firstLogin = false;
      hrUser.mustChangePassword = false;
      hrUser.isActive = true;
      await hrUser.save();
      console.log(`Updated existing HR Manager user: ${hrEmail} (BH1046) with password ${hrPass}`);
    }

    // Also ensure Employee record for BH1046 exists & is active
    let hrEmp = await Employee.findOne({
      $or: [{ employeeId: 'BH1046' }, { workEmail: hrEmail.toLowerCase() }]
    });
    if (hrEmp) {
      hrEmp.workEmail = hrEmail.toLowerCase();
      hrEmp.employeeId = 'BH1046';
      hrEmp.role = 'HR_MANAGER';
      hrEmp.department = 'HR';
      hrEmp.status = 'ACTIVE';
      await hrEmp.save();
      console.log('Synchronized Employee profile for BH1046.');
    }

    // 2. Super Admin: admin@bjkhealthcare.com / Admin@BJK2026!
    const adminEmail = 'admin@bjkhealthcare.com';
    const adminPass = 'Admin@BJK2026!';
    const adminHashedPassword = await bcrypt.hash(adminPass, 10);

    let superAdmin = await User.findOne({
      $or: [{ email: adminEmail.toLowerCase() }, { role: 'SUPER_ADMIN' }]
    });

    if (!superAdmin) {
      superAdmin = new User({
        name: 'Super Admin',
        email: adminEmail.toLowerCase(),
        employeeId: 'ADM001',
        password: adminHashedPassword,
        role: 'SUPER_ADMIN',
        department: 'MANAGEMENT',
        designation: 'Super Administrator',
        status: 'ACTIVE',
        firstLogin: false,
        isActive: true,
        permissions: ['*']
      });
      await superAdmin.save();
      console.log(`Created Super Admin user: ${adminEmail}`);
    } else {
      superAdmin.email = adminEmail.toLowerCase();
      superAdmin.password = adminHashedPassword;
      superAdmin.role = 'SUPER_ADMIN';
      superAdmin.status = 'ACTIVE';
      superAdmin.firstLogin = false;
      superAdmin.mustChangePassword = false;
      superAdmin.isActive = true;
      superAdmin.permissions = ['*'];
      await superAdmin.save();
      console.log(`Updated Super Admin user: ${adminEmail} with full permissions [*]`);
    }

    console.log('\n--- Sync Complete ---');
    console.log('HR Manager: email = bh1046@bjkhealthcare.com, employeeId = BH1046, password = Bjk@2810, role = HR_MANAGER');
    console.log('Super Admin: email = admin@bjkhealthcare.com, password = Admin@BJK2026!, role = SUPER_ADMIN (All Access)');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  }
}

syncUsers();
