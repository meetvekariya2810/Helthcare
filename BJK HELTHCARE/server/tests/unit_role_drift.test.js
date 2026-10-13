const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { ROLES, ROLE_HIERARCHY, ROLE_ALIASES, normalizeRoleString, isKnownRole } = require('../config/rbac');

test('Role Drift Verification: All canonical roles exist in ROLE_HIERARCHY', () => {
  const canonicalList = Object.values(ROLES);
  assert.strictEqual(canonicalList.length, 30, 'ROLES must define exactly 30 roles');

  for (const role of canonicalList) {
    assert.ok(
      isKnownRole(role),
      `Canonical role ${role} must be recognized by isKnownRole`
    );
    assert.ok(
      typeof ROLE_HIERARCHY[role] === 'number',
      `Canonical role ${role} must have a numeric rank`
    );
  }
});

test('Role Aliases Mapping: Standard legacy and frontend aliases map to canonical roles', () => {
  const expectedMappings = {
    ADMIN: ROLES.SUPER_ADMIN,
    SYSTEM_ADMIN: ROLES.SYSTEM_ADMINISTRATOR,
    HR: ROLES.HR_ADMIN,
    FINANCE: ROLES.FINANCE_MANAGER,
    PAYROLL_OFFICER: ROLES.PAYROLL_ADMIN,
    ACCOUNTS_EXECUTIVE: ROLES.FINANCE_MANAGER,
    DEPARTMENT_HEAD: ROLES.DEPARTMENT_MANAGER,
    TEAM_HEAD: ROLES.TEAM_LEAD
  };

  for (const [alias, target] of Object.entries(expectedMappings)) {
    assert.strictEqual(
      ROLE_ALIASES[alias],
      target,
      `Alias ${alias} must map to canonical role ${target}`
    );
    assert.strictEqual(
      normalizeRoleString(alias),
      target,
      `normalizeRoleString(${alias}) must return ${target}`
    );
    assert.ok(
      isKnownRole(alias),
      `Alias ${alias} must be recognized as known role`
    );
  }
});

test('Role Drift Scan: No server or client file references undefined ROLES properties', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const serverDir = path.join(repoRoot, 'server');
  const clientDir = path.join(repoRoot, 'client/src');

  function getCodeFiles(dir) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          files = files.concat(getCodeFiles(full));
        }
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        files.push(full);
      }
    }
    return files;
  }

  const allFiles = [...getCodeFiles(serverDir), ...getCodeFiles(clientDir)];
  const undefinedUsages = [];

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.matchAll(/ROLES\.([A-Z0-9_]+)/g);
    for (const m of matches) {
      const prop = m[1];
      if (!ROLES[prop]) {
        undefinedUsages.push({
          file: path.relative(repoRoot, file),
          property: prop
        });
      }
    }
  }

  assert.strictEqual(
    undefinedUsages.length,
    0,
    `Found undefined ROLES.* properties: ${JSON.stringify(undefinedUsages, null, 2)}`
  );
});
