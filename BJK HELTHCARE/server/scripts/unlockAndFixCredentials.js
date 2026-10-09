const { connectDB } = require('../config/db');
const User = require('../models/User');
const Employee = require('../models/Employee');

async function unlockAndFixCredentials() {
  console.log('[Credential Fixer] Connecting to MongoDB...');
  const conn = await connectDB();
  if (!conn) {
    console.error('[Credential Fixer] Could not connect to database.');
    process.exit(1);
  }

  // 1. Unlock all locked users, reset failedLoginAttempts, and clear forced password change flags for ease of testing
  await User.updateMany(
    {},
    {
      $set: {
        isLocked: false,
        status: 'ACTIVE',
        isActive: true,
        failedLoginAttempts: 0,
        lockedReason: null,
        lockUntil: null,
        firstLogin: false,
        mustChangePassword: false,
        temporaryPassword: false
      }
    }
  );

  const defaultAccounts = [
    {
      identifier: 'bh1046@bjkhealthcare.com',
      employeeId: 'BH1046',
      name: 'Krutika Parmar',
      role: 'HR_MANAGER',
      department: 'Human Resources',
      password: 'Bjk@2810'
    },
    {
      identifier: 'admin@bjkhealthcare.com',
      employeeId: 'BJK-ADM-001',
      name: 'Dr. Vikram Mehta',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      password: 'Admin@BJK2026!'
    },
    {
      identifier: 'superadmin@bjkhealthcare.com',
      employeeId: 'BJK-ADM-000',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      department: 'Executive Management',
      password: 'Admin@BJK2026!'
    },
    {
      identifier: 'qa.manager@bjkhealthcare.com',
      employeeId: 'BJK-QA-001',
      name: 'Dr. Anita Desai',
      role: 'QA_MANAGER',
      department: 'Quality Assurance',
      password: 'Password123!'
    },
    {
      identifier: 'employee@bjkhealthcare.com',
      employeeId: 'BJK-EMP-003',
      name: 'Rajesh Patel',
      role: 'EMPLOYEE',
      department: 'Production Operations',
      password: 'Password123!'
    }
  ];

  for (const acc of defaultAccounts) {
    let user = await User.findOne({
      $or: [
        { email: acc.identifier.toLowerCase() },
        { employeeId: acc.employeeId }
      ]
    });

    if (user) {
      user.name = user.name || acc.name;
      user.email = acc.identifier.toLowerCase();
      user.employeeId = acc.employeeId;
      user.role = acc.role;
      user.department = user.department || acc.department;
      user.password = acc.password;
      user.isLocked = false;
      user.failedLoginAttempts = 0;
      user.status = 'ACTIVE';
      user.isActive = true;
      user.firstLogin = false;
      user.mustChangePassword = false;
      user.temporaryPassword = false;
      user.lockedReason = null;
      await user.save();
    }
  }

  console.log('[Credential Fixer] All accounts updated with firstLogin=false and verified passwords.');
  process.exit(0);
}

unlockAndFixCredentials().catch(err => {
  console.error('[Credential Fixer] Error:', err);
  process.exit(1);
});
