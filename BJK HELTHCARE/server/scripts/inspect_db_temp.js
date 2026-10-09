require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function inspectDb() {
  await connectDB();

  const User = require('../models/User');
  const Employee = require('../models/Employee');
  const Department = require('../models/Department');
  const Role = require('../models/Role');
  const AuditLog = require('../models/AuditLog');

  const userCount = await User.countDocuments({});
  const empCount = await Employee.countDocuments({});
  const deptCount = await Department.countDocuments({});
  const roleCount = await Role.countDocuments({});
  const auditCount = await AuditLog.countDocuments({});

  console.log(`Current DB Counts:`);
  console.log(`- Users: ${userCount}`);
  console.log(`- Employees: ${empCount}`);
  console.log(`- Departments: ${deptCount}`);
  console.log(`- Roles: ${roleCount}`);
  console.log(`- AuditLogs: ${auditCount}`);

  const users = await User.find({}, 'name email role employeeId department status').lean();
  console.log(`\n--- Existing Users (${users.length}) ---`);
  users.forEach(u => {
    console.log(`User: ${u.email} | Role: ${u.role} | Name: ${u.name} | EmpId: ${u.employeeId} | Dept: ${u.department}`);
  });

  const emps = await Employee.find({}, 'fullName employeeId employeeCode department designation status').limit(20).lean();
  console.log(`\n--- Sample Employees (${emps.length} of ${empCount}) ---`);
  emps.forEach(e => {
    console.log(`Emp: ${e.employeeCode || e.employeeId} | Name: ${e.fullName} | Dept: ${e.department} | Desig: ${e.designation} | Status: ${e.status}`);
  });

  const depts = await Department.find({}, 'name code subDepartments').lean();
  console.log(`\n--- Existing Departments (${depts.length}) ---`);
  depts.forEach(d => {
    console.log(`Dept: ${d.name} (${d.code}) - SubDepts: ${(d.subDepartments || []).map(s => s.name).join(', ')}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

inspectDb().catch((err) => {
  console.error(err);
  process.exit(1);
});
