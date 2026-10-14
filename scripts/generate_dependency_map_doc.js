const fs = require('fs');
const path = require('path');

const grepData = JSON.parse(fs.readFileSync('docs/database/GREP_CLASSIFICATION.json', 'utf8'));

let md = '# DEPENDENCY MAP & MONGOOSE RETIREMENT BLUEPRINT\n\n';
md += '## 1. Mongoose & MongoDB Pattern Classification\n\n';
md += 'Exhaustive grep classification across repository tiers (Runtime, Unit/Integration Tests, Database Seeds, Migration Scripts, and Documentation):\n\n';

md += '| Pattern | Total Occurrences | Runtime Server | Test Suites | Seed Scripts | Migration Scripts | Docs/Markdown |\n';
md += '|---|---|---|---|---|---|---|\n';

for (const [term, d] of Object.entries(grepData)) {
  md += `| \`${term}\` | **${d.total}** | ${d.runtime.count} | ${d.test.count} | ${d.seed.count} | ${d.migration.count} | ${d.docs.count} |\n`;
}

md += '\n---\n\n';
md += '## 2. In-Depth Classification & Migration Directives\n\n';

md += '### A. Query Execution & Cursor Hooks (`lean()`, `populate()`)\n';
md += `- **\`lean()\` (${grepData['lean('].runtime.count} runtime occurrences)**: In Mongoose, \`lean()\` bypasses document hydration and returns plain JavaScript objects. In PostgreSQL, all driver results (\`pg.rows\`) are natively plain JS objects, meaning all \`lean()\` calls are naturally satisfied with higher performance.\n`;
md += `- **\`populate()\` (${grepData['populate('].runtime.count} runtime occurrences)**: Mongoose uses \`populate()\` to fetch foreign documents over separate round-trips. In PostgreSQL, these will be replaced with clean, single-round-trip \`JOIN\` queries or nested JSON aggregations (\`json_build_object()\` / \`json_agg()\`), drastically eliminating N+1 database round-trips.\n\n`;

md += '### B. Aggregation Pipelines & Grouping (`aggregate()`, `$group`)\n';
md += `- **\`aggregate()\` (${grepData['aggregate('].runtime.count} runtime occurrences)** and **\`$group\` (${grepData['$group'].runtime.count} runtime occurrences)**:\n`;
md += `  - Daily & monthly attendance aggregation (\`attendanceController.js\`, \`attendanceReportEngine.js\`).\n`;
md += `  - HRMS executive dashboard KPIs (headcount by department, gender diversity, leave utilization).\n`;
md += `  - In PostgreSQL, these translate directly into indexed SQL \`GROUP BY\`, \`COUNT(*)\`, \`SUM()\`, \`AVG()\`, and \`FILTER (WHERE ...)\` expressions.\n\n`;

md += '### C. Atomic Writes & Upserts (`findOneAndUpdate`, `updateMany`, `bulkWrite`)\n';
md += `- **\`findOneAndUpdate\` (${grepData['findOneAndUpdate'].runtime.count} runtime occurrences)**: Replaced by PostgreSQL \`INSERT ... ON CONFLICT (...) DO UPDATE ... RETURNING *\` (upserts) or \`UPDATE ... WHERE ... RETURNING *\`.\n`;
md += `- **\`updateMany\` (${grepData['updateMany'].runtime.count} runtime occurrences)**: Standard parameterized \`UPDATE table SET ... WHERE ...\`.\n`;
md += `- **\`bulkWrite\` (${grepData['bulkWrite'].runtime.count} runtime occurrences)**: Replaced with multi-row \`INSERT INTO ... VALUES (...) ...\` or transactional batch statements.\n\n`;

md += '### D. Offline In-Memory Fallback (`mongodb-memory-server`)\n';
md += `- **Current Status**: Present in \`config/db.js\` and devDependencies (${grepData['mongodb-memory-server'].total} occurrences).\n`;
md += `- **Directive (Safety Rule 8)**: Production MUST fail fast on connection errors. \`mongodb-memory-server\` is strictly removed from production paths and will not be used in the PostgreSQL architecture.\n\n`;

md += '---\n\n';
md += '## 3. High-Impact Service Dependencies\n\n';
md += '| Service / File | Mongoose Operations | PostgreSQL Relational Strategy |\n';
md += '|---|---|---|\n';
md += '| `server/services/hrms/bankDetailsService.js` | Bank detail upsert, masking, verification | ACID transaction with row lock; store encrypted/masked attributes |\n';
md += '| `server/services/hrms/leaveService.js` | Balance decrement, ledger logging | \`SELECT ... FOR UPDATE\` on leave balances, insert into \`leave_ledgers\` within a single SQL transaction |\n';
md += '| `server/services/hrms/leaveLedgerService.js` | Balance reconciliation & month-end accrual | Relational balance validation against ledger records |\n';
md += '| `server/services/hrms/attendanceImportService.js` | Biometric punch ingestion & batch snapshotting | High-speed multi-row insert into \`attendances\` and \`attendance_import_snapshots\` |\n';
md += '| `server/services/dataScopeService.js` | Multi-tenant role-based query filtering | Append \`facility_id = $1\` and department scoping conditions to SQL parameterized queries |\n';
md += '| `server/services/pdfService.js` | Generates payslips, ID cards, certificates | Pure document generation consuming plain object payloads; zero REST contract drift |\n\n';

md += '---\n\n';
md += '## 4. Frontend API Contract & Client Compatibility\n\n';
md += '- Frontend client uses Vite 5 + React 18 with Axios/fetch wrappers in `client/src/api/`.\n';
md += '- REST contracts (endpoints, query params, pagination shapes `{ success: true, count, data, pagination }`) remain 100% stable.\n';
md += '- Frontend `idCardUtils.js`, `api.js`, and portal hooks consume field names (`employeeId`, `firstName`, `department`, `designation`) identically.\n';

fs.writeFileSync('docs/database/DEPENDENCY_MAP.md', md);
console.log('Successfully generated docs/database/DEPENDENCY_MAP.md');
