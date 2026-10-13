const test = require('node:test');
const assert = require('node:assert');
const {
  ROLES,
  ROLE_HIERARCHY,
  PROTECTED_ROLES,
  getRoleRank,
  isKnownRole,
  canManageCredentials,
  canAssignRole,
  generateSecureRandomPassword
} = require('../config/rbac');

test('RBAC Hierarchy: Every role defined in ROLES has an explicit entry in ROLE_HIERARCHY', () => {
  const allRoles = Object.values(ROLES);
  assert.strictEqual(allRoles.length, 30, 'ROLES must define exactly 30 roles');

  for (const role of allRoles) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(ROLE_HIERARCHY, role),
      `Role ${role} is missing from ROLE_HIERARCHY`
    );
    assert.strictEqual(
      typeof ROLE_HIERARCHY[role],
      'number',
      `Role ${role} must have a numeric rank in ROLE_HIERARCHY`
    );
  }
});

test('RBAC Hierarchy Direction: Lower numbers represent strictly higher privilege', () => {
  // Rank 1 is the highest authority (SUPER_ADMIN)
  assert.strictEqual(ROLE_HIERARCHY[ROLES.SUPER_ADMIN], 1, 'SUPER_ADMIN must be rank 1');
  assert.strictEqual(ROLE_HIERARCHY[ROLES.DIRECTOR], 2, 'DIRECTOR must be rank 2');
  assert.strictEqual(ROLE_HIERARCHY[ROLES.EMPLOYEE], 30, 'EMPLOYEE must be rank 30');

  // Authority check: callerRank < targetRank means caller outranks target
  const callerRank = getRoleRank(ROLES.HR_MANAGER); // 8
  const employeeRank = getRoleRank(ROLES.EMPLOYEE); // 30
  assert.ok(callerRank < employeeRank, 'HR_MANAGER (rank 8) outranks EMPLOYEE (rank 30)');
});

test('RBAC Hierarchy: PROTECTED_ROLES list is explicit and contains all required protected roles', () => {
  const expected = [
    ROLES.SUPER_ADMIN,
    ROLES.DIRECTOR,
    ROLES.AUDITOR,
    ROLES.SYSTEM_ADMINISTRATOR,
    ROLES.IT_ADMIN,
    ROLES.HR_ADMIN,
    ROLES.PAYROLL_ADMIN,
    ROLES.FINANCE_MANAGER,
    'PAYROLL_OFFICER',
    'ACCOUNTS_EXECUTIVE'
  ];
  assert.strictEqual(PROTECTED_ROLES.length, 10, 'PROTECTED_ROLES must contain exactly 10 roles');
  for (const r of expected) {
    assert.ok(PROTECTED_ROLES.includes(r), `Missing protected role: ${r}`);
  }
});

test('RBAC Hierarchy: Unknown or missing roles return Infinity and are not known', () => {
  assert.strictEqual(getRoleRank('NON_EXISTENT_ROLE'), Infinity);
  assert.strictEqual(getRoleRank(''), Infinity);
  assert.strictEqual(getRoleRank(null), Infinity);
  assert.strictEqual(getRoleRank(undefined), Infinity);
  assert.strictEqual(isKnownRole('NON_EXISTENT_ROLE'), false);
  assert.strictEqual(isKnownRole(''), false);
  assert.strictEqual(isKnownRole(null), false);
});

test('canManageCredentials: HR_MANAGER can reset EMPLOYEE but cannot reset PROTECTED_ROLES or HR_ADMIN', () => {
  // HR_MANAGER can reset EMPLOYEE
  const allowEmp = canManageCredentials(ROLES.HR_MANAGER, ROLES.EMPLOYEE);
  assert.strictEqual(allowEmp.allowed, true);

  // Cannot reset PROTECTED_ROLES (including Finance and Payroll roles)
  for (const protRole of PROTECTED_ROLES) {
    const res = canManageCredentials(ROLES.HR_MANAGER, protRole);
    assert.strictEqual(res.allowed, false, `HR_MANAGER must not reset ${protRole}`);
  }

  // Explicit verification for finance and payroll roles
  assert.strictEqual(canManageCredentials(ROLES.HR_MANAGER, ROLES.FINANCE_MANAGER).allowed, false);
  assert.strictEqual(canManageCredentials(ROLES.HR_MANAGER, ROLES.PAYROLL_ADMIN).allowed, false);
  assert.strictEqual(canManageCredentials(ROLES.HR_MANAGER, 'PAYROLL_OFFICER').allowed, false);
  assert.strictEqual(canManageCredentials(ROLES.HR_MANAGER, 'ACCOUNTS_EXECUTIVE').allowed, false);

  // Cannot reset equal or higher rank non-protected role (e.g. HR_ADMIN is rank 6, HR_MANAGER is rank 8)
  const resHrAdmin = canManageCredentials(ROLES.HR_MANAGER, ROLES.HR_ADMIN);
  assert.strictEqual(resHrAdmin.allowed, false, 'HR_MANAGER must not reset HR_ADMIN');

  // Cannot reset peer HR_MANAGER (equal rank 8)
  const resPeer = canManageCredentials(ROLES.HR_MANAGER, ROLES.HR_MANAGER);
  assert.strictEqual(resPeer.allowed, false, 'HR_MANAGER must not reset peer HR_MANAGER');
});

test('canManageCredentials: SUPER_ADMIN can reset any recognized role', () => {
  for (const role of Object.values(ROLES)) {
    const res = canManageCredentials(ROLES.SUPER_ADMIN, role);
    assert.strictEqual(res.allowed, true, `SUPER_ADMIN must be able to reset ${role}`);
  }
});

test('canManageCredentials: Unknown caller or target role is strictly denied', () => {
  assert.strictEqual(canManageCredentials('UNKNOWN', ROLES.EMPLOYEE).allowed, false);
  assert.strictEqual(canManageCredentials(ROLES.SUPER_ADMIN, 'UNKNOWN').allowed, false);
  assert.strictEqual(canManageCredentials(null, ROLES.EMPLOYEE).allowed, false);
  assert.strictEqual(canManageCredentials(ROLES.HR_MANAGER, null).allowed, false);
});

test('canAssignRole: Caller must strictly outrank both current and new role', () => {
  // HR_MANAGER can change EMPLOYEE to TEAM_LEAD (rank 8 < 30 and rank 8 < 26)
  const allowLead = canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, ROLES.TEAM_LEAD);
  assert.strictEqual(allowLead.allowed, true);

  // HR_MANAGER cannot assign PROTECTED_ROLES or higher roles
  const denySuper = canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, ROLES.SUPER_ADMIN);
  assert.strictEqual(denySuper.allowed, false);
  const denyAudit = canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, ROLES.AUDITOR);
  assert.strictEqual(denyAudit.allowed, false);
  const denyAdmin = canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, ROLES.HR_ADMIN);
  assert.strictEqual(denyAdmin.allowed, false);

  // HR_MANAGER cannot assign finance/payroll roles (PROTECTED_ROLES)
  assert.strictEqual(canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, ROLES.FINANCE_MANAGER).allowed, false);
  assert.strictEqual(canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, ROLES.PAYROLL_ADMIN).allowed, false);
  assert.strictEqual(canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, 'PAYROLL_OFFICER').allowed, false);
  assert.strictEqual(canAssignRole(ROLES.HR_MANAGER, ROLES.EMPLOYEE, 'ACCOUNTS_EXECUTIVE').allowed, false);

  // Cannot modify protected current role
  const denyModDirector = canAssignRole(ROLES.HR_MANAGER, ROLES.DIRECTOR, ROLES.EMPLOYEE);
  assert.strictEqual(denyModDirector.allowed, false);
  assert.strictEqual(canAssignRole(ROLES.HR_MANAGER, ROLES.FINANCE_MANAGER, ROLES.EMPLOYEE).allowed, false);
  assert.strictEqual(canAssignRole(ROLES.HR_MANAGER, 'PAYROLL_OFFICER', ROLES.EMPLOYEE).allowed, false);
});

test('generateSecureRandomPassword: generates strong 20-char password with 1,000 unique samples', () => {
  const set = new Set();
  for (let i = 0; i < 1000; i++) {
    const p = generateSecureRandomPassword(20);
    assert.strictEqual(p.length, 20, 'Each password must be exactly 20 characters long');
    assert.ok(/[A-Z]/.test(p), 'Must contain uppercase');
    assert.ok(/[a-z]/.test(p), 'Must contain lowercase');
    assert.ok(/[0-9]/.test(p), 'Must contain digit');
    assert.ok(/[!@#$%^&*()_=+ -]/.test(p), 'Must contain symbol');
    assert.ok(!p.endsWith('XXXXX'), 'Must not have padEnd artifacts');
    set.add(p);
  }
  assert.strictEqual(set.size, 1000, 'All 1,000 generated passwords must be completely unique');
});
