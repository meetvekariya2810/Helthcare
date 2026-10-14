/**
 * BJK Healthcare - Route Audit & Reproducible Route Counter
 * Iterates through all route modules in server/routes/ and calculates the total
 * route endpoints, unauthenticated endpoints, and protected endpoints.
 *
 * Usage:
 *   node "BJK HELTHCARE/server/scripts/count_routes.js"
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.resolve(__dirname, '../routes');

function getRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getRouteFiles(fullPath));
    } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getRouteFiles(routesDir);
let totalRouteRegistrations = 0;
let totalModules = files.length;
const fileCounts = [];
const unauthenticatedRoutes = [];
let protectedCount = 0;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/);
  const relFile = path.relative(routesDir, f).replace(/\\/g, '/');

  // Find router-level protection
  let routerProtectLine = -1;
  lines.forEach((l, idx) => {
    if (/router\.use\s*\(\s*(protect|protectEmployee|authenticate|verifyToken|canteenAuth)/.test(l)) {
      if (routerProtectLine === -1) routerProtectLine = idx + 1;
    }
  });

  let moduleRouteCount = 0;

  lines.forEach((l, idx) => {
    const lineNum = idx + 1;
    const match = l.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]\s*,\s*(.*)/);
    if (match) {
      totalRouteRegistrations++;
      moduleRouteCount++;
      const method = match[1].toUpperCase();
      const routePath = match[2];
      const rest = match[3];

      const isBehindRouterProtect = routerProtectLine !== -1 && lineNum > routerProtectLine;
      const hasInlineAuth = /(protect|protectEmployee|authenticate|requireRole|requirePermission|restrictFinance|requireCanteenOrHR|allowInternalOrHR)/.test(rest);
      const hasOptionalAuth = /optionalAuth/.test(rest);

      if ((isBehindRouterProtect || hasInlineAuth) && !hasOptionalAuth) {
        protectedCount++;
      } else {
        let category = 'Public Endpoint';
        if (hasOptionalAuth) {
          category = 'optionalAuth Fallback (FUNCTIONALLY UNAUTHENTICATED prior to Group R)';
        } else if (relFile.includes('health')) {
          category = 'Health & Liveness Check';
        } else if (relFile.includes('auth')) {
          category = 'Public Authentication / OTP / Login';
        } else if (routePath.includes('verify')) {
          category = 'Public ID Verification';
        } else if (routePath.includes('template')) {
          category = 'Public Excel Template';
        }

        unauthenticatedRoutes.push({
          method,
          path: routePath,
          file: relFile,
          line: lineNum,
          category,
          isOptionalAuth: hasOptionalAuth
        });
      }
    }
  });

  fileCounts.push({
    file: relFile,
    count: moduleRouteCount
  });
}

console.log('================================================================');
console.log(' BJK HEALTHCARE — REPRODUCIBLE ROUTE REGISTRATION & AUTH AUDIT');
console.log('================================================================');
console.log(`Total Route Modules:             ${totalModules}`);
console.log(`Total HTTP Route Registrations:  ${totalRouteRegistrations}`);
console.log(`Protected Endpoints:             ${protectedCount}`);
console.log(`Unauthenticated Endpoints:       ${unauthenticatedRoutes.length}`);
console.log('================================================================\n');

console.log('--- Unauthenticated Routes Breakdown ---');
const catCounts = {};
unauthenticatedRoutes.forEach(r => {
  catCounts[r.category] = (catCounts[r.category] || 0) + 1;
});
Object.entries(catCounts).forEach(([cat, c]) => {
  console.log(`  - ${cat}: ${c}`);
});

console.log('\n--- Complete List of Unauthenticated Endpoints ---');
unauthenticatedRoutes.forEach((r, idx) => {
  console.log(`  ${String(idx + 1).padStart(2, ' ')}. [${r.method.padEnd(6)}] ${r.path.padEnd(35)} (${r.file}:${r.line}) -> ${r.category}`);
});
console.log('\n================================================================');
