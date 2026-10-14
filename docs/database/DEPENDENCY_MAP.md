# DEPENDENCY MAP & MONGOOSE RETIREMENT BLUEPRINT

## 1. Mongoose & MongoDB Pattern Classification

Exhaustive grep classification across repository tiers (Runtime, Unit/Integration Tests, Database Seeds, Migration Scripts, and Documentation):

| Pattern | Total Occurrences | Runtime Server | Test Suites | Seed Scripts | Migration Scripts | Docs/Markdown |
|---|---|---|---|---|---|---|
| `mongoose` | **960** | 786 | 81 | 14 | 75 | 4 |
| `MongoClient` | **0** | 0 | 0 | 0 | 0 | 0 |
| `mongodb` | **84** | 44 | 22 | 2 | 1 | 15 |
| `MONGODB_URI` | **63** | 7 | 24 | 2 | 9 | 21 |
| `populate(` | **60** | 60 | 0 | 0 | 0 | 0 |
| `aggregate(` | **25** | 18 | 1 | 0 | 6 | 0 |
| `$lookup` | **0** | 0 | 0 | 0 | 0 | 0 |
| `$group` | **24** | 17 | 1 | 0 | 6 | 0 |
| `$regex` | **118** | 98 | 5 | 0 | 15 | 0 |
| `$text` | **0** | 0 | 0 | 0 | 0 | 0 |
| `ObjectId` | **299** | 276 | 17 | 0 | 6 | 0 |
| `findOneAndUpdate` | **66** | 36 | 8 | 17 | 5 | 0 |
| `updateMany` | **33** | 19 | 3 | 0 | 10 | 1 |
| `bulkWrite` | **2** | 2 | 0 | 0 | 0 | 0 |
| `startSession` | **0** | 0 | 0 | 0 | 0 | 0 |
| `lean(` | **351** | 281 | 25 | 0 | 45 | 0 |
| `mongodb-memory-server` | **23** | 15 | 2 | 0 | 0 | 6 |

---

## 2. In-Depth Classification & Migration Directives

### A. Query Execution & Cursor Hooks (`lean()`, `populate()`)
- **`lean()` (281 runtime occurrences)**: In Mongoose, `lean()` bypasses document hydration and returns plain JavaScript objects. In PostgreSQL, all driver results (`pg.rows`) are natively plain JS objects, meaning all `lean()` calls are naturally satisfied with higher performance.
- **`populate()` (60 runtime occurrences)**: Mongoose uses `populate()` to fetch foreign documents over separate round-trips. In PostgreSQL, these will be replaced with clean, single-round-trip `JOIN` queries or nested JSON aggregations (`json_build_object()` / `json_agg()`), drastically eliminating N+1 database round-trips.

### B. Aggregation Pipelines & Grouping (`aggregate()`, `$group`)
- **`aggregate()` (18 runtime occurrences)** and **`$group` (17 runtime occurrences)**:
  - Daily & monthly attendance aggregation (`attendanceController.js`, `attendanceReportEngine.js`).
  - HRMS executive dashboard KPIs (headcount by department, gender diversity, leave utilization).
  - In PostgreSQL, these translate directly into indexed SQL `GROUP BY`, `COUNT(*)`, `SUM()`, `AVG()`, and `FILTER (WHERE ...)` expressions.

### C. Atomic Writes & Upserts (`findOneAndUpdate`, `updateMany`, `bulkWrite`)
- **`findOneAndUpdate` (36 runtime occurrences)**: Replaced by PostgreSQL `INSERT ... ON CONFLICT (...) DO UPDATE ... RETURNING *` (upserts) or `UPDATE ... WHERE ... RETURNING *`.
- **`updateMany` (19 runtime occurrences)**: Standard parameterized `UPDATE table SET ... WHERE ...`.
- **`bulkWrite` (2 runtime occurrences)**: Replaced with multi-row `INSERT INTO ... VALUES (...) ...` or transactional batch statements.

### D. Offline In-Memory Fallback (`mongodb-memory-server`)
- **Current Status**: Present in `config/db.js` and devDependencies (23 occurrences).
- **Directive (Safety Rule 8)**: Production MUST fail fast on connection errors. `mongodb-memory-server` is strictly removed from production paths and will not be used in the PostgreSQL architecture.

---

## 3. High-Impact Service Dependencies

| Service / File | Mongoose Operations | PostgreSQL Relational Strategy |
|---|---|---|
| `server/services/hrms/bankDetailsService.js` | Bank detail upsert, masking, verification | ACID transaction with row lock; store encrypted/masked attributes |
| `server/services/hrms/leaveService.js` | Balance decrement, ledger logging | `SELECT ... FOR UPDATE` on leave balances, insert into `leave_ledgers` within a single SQL transaction |
| `server/services/hrms/leaveLedgerService.js` | Balance reconciliation & month-end accrual | Relational balance validation against ledger records |
| `server/services/hrms/attendanceImportService.js` | Biometric punch ingestion & batch snapshotting | High-speed multi-row insert into `attendances` and `attendance_import_snapshots` |
| `server/services/dataScopeService.js` | Multi-tenant role-based query filtering | Append `facility_id = $1` and department scoping conditions to SQL parameterized queries |
| `server/services/pdfService.js` | Generates payslips, ID cards, certificates | Pure document generation consuming plain object payloads; zero REST contract drift |

---

## 4. Frontend API Contract & Client Compatibility

- Frontend client uses Vite 5 + React 18 with Axios/fetch wrappers in `client/src/api/`.
- REST contracts (endpoints, query params, pagination shapes `{ success: true, count, data, pagination }`) remain 100% stable.
- Frontend `idCardUtils.js`, `api.js`, and portal hooks consume field names (`employeeId`, `firstName`, `department`, `designation`) identically.
