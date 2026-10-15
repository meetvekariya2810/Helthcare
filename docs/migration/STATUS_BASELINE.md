# BJK HEALTHCARE — MIGRATION STATUS BASELINE
**Generated:** 2026-10-15  
**Audit Mode:** READ-ONLY PRE-EXECUTION EVIDENCE RE-VERIFICATION  
**Workspace Root:** `C:\Users\Meet Vekariya\OneDrive\Desktop\Antigravity project\BJK HELTHCARE 22`  
**Active Git Branch:** `migration/nextjs` (HEAD commit `4815c20`)  
**Target Database:** `POSTGRESQL` (Rule R13 Confirmed)  

---

## 1. Git Repository State

### 1.1 Branches Present
- `backup-before-github-merge`
- `hotfix/security`
- `main`
- `* migration/nextjs` (active branch, contains Next.js waves & MySQL exploration commits)
- `migration/postgres` (HEAD: `1182a5f` — committed PostgreSQL track with 12 migrations)
- `release/r1`
- `release/r2`
- `release/r3`
- `release/r4`
- `remotes/origin/main`

### 1.2 Last 30 Commits (on active branch `migration/nextjs`)
1. `4815c20` feat(sql-bridge): bridge Mongoose aggregations to SQL repositories and update migration audit docs
2. `2a833fe` feat(migration): complete Wave 6 Master HRMS and Wave 5 Pharma Operations modules
3. `971ae68` feat(migration): complete Wave 4 Next.js dashboards and SQL aggregation bridges
4. `1182a5f` feat(database): automate end-to-end SQL permissions and default privileges with migration 012 and db:permissions
5. `36020be` fix(migration): enhance db_inspect snake_case table normalization for accurate inspection
6. `e8a71c7` fix(migration): validate 16411 documents parity and align regression suites with 100% pass rate
7. `f81992f` docs(database): update progress ledger with migration 011 and latest commit a75e6f6
8. `a75e6f6` feat(database): codify versioned migration 011 for schema constraint alignments and refine live dynamic log reconciliation
9. `34f407b` feat(ui): support functional column accessors in DataTable and connect auditRoutes to postgresql audit_logs
10. `45dd1cb` docs(database): update Phase 7 commit reference to a68275c
11. `a68275c` fix(database): allow dynamic upper bound for live audit log count assertion in db:validate
12. `267a11d` feat(database): codify schema constraint alignment and postgresql health endpoint
13. `34aa572` docs(database): update commit reference in migration progress ledger
14. `ccacd5a` feat(database): complete end-to-end postgresql migration (phases 1-10)
15. `d882085` docs(database): complete Phase 1 read-only audit and source schema inventory
16. `3ca3922` chore(security): save pre-migration security hardening and file security updates
17. `5341b08` fix(security): T1 RBAC protected roles, zero-drift role mappings, route-level security probes, and trust proxy hops
18. `7bf6e5b` fix(security): Group A environment validation, database safety guards, cold-start gating, canteen reset protection, leave defaults, and payroll deletion controls
19. `3b534f6` fix(security): B7 biometric webhook secret header, rate limiting, and trust proxy
20. `f65a38a` fix(security): B8 block bulk employee import in production
21. `09d9be5` fix(security): R2 eliminate production login password bypass and enforce strong passwords
22. `b12215b` fix(security): R+ role hierarchy, credential management, allow-list projections, strict audit, and authenticated credential export
23. `c0bab07` fix(portal): resolve auto-refresh loop and enable employee leave ledger matrix display
24. `de24348` fix(payroll): remove hardcoded fallback salary, support employee-wise generation and batch deletion
25. `d0bb708` feat(hrms): implement BJK-HR-POL-001 Leave Policy & Comp-Off engine with GMP pharma controls
26. `406d250` fix(client): bundle ChangePasswordPage, EmployeeLogin and EmployeeDashboard directly into main bundle to eliminate dynamic chunk loading errors on Vercel
27. `904fce3` fix(client): add automatic chunk reload and vercel cache headers for dynamic module imports
28. `c4c0556` feat(auth): enforce first-time temporary password change for all employees and add permanent password creation screen
29. `9b7ee86` perf: optimize web app performance, code-splitting, login speed, and database pooling
30. `dc248a6` fix(ui): import missing ShieldAlert icon in Sidebar to prevent runtime crash on /dashboard/hr

### 1.3 Working Tree Status
- `git status`: Clean (`nothing to commit, working tree clean`)
- Branches relationship: `migration/nextjs` is 3 commits ahead of `migration/postgres` (`971ae68`, `2a833fe`, `4815c20`). Those 3 commits contain both the MySQL experimental scripts/migrations and the Next.js 16 App Router wave components.

---

## 2. Quantitative System Census (Measured by Command)

| Metric | Measured Value | Command / Verification Source |
|---|---|---|
| **Total Backend Controllers** | **66** | `(Get-ChildItem -Path "BJK HELTHCARE\server\controllers" -Recurse -File).Count` |
| ↳ *Mongoose-only Controllers* | **42** | Node AST/pattern scan of `controllers/` |
| ↳ *Mixed Controllers (Mongoose + SQL/Repo)* | **19** | Node AST/pattern scan (`authController`, `leaveController`, `employeeController`, etc.) |
| ↳ *Pure SQL Controllers* | **1** | `productController.js` |
| ↳ *Neither / Service Delegators* | **4** | `EmployeeCopilotController`, `enterpriseController`, `hrms/copilotController`, `hrms/leaveController` |
| **Total Backend Services** | **21** | `(Get-ChildItem -Path "BJK HELTHCARE\server\services" -Recurse -File).Count` |
| ↳ *Mongoose-only Services* | **8** | Node AST/pattern scan of `services/` |
| ↳ *Mixed Services* | **6** | `attendanceImportService`, `copilotService`, `credentialExcelService`, `employeeMasterMigrationService`, `excelEmployeeService`, `leavePolicyService` |
| ↳ *Pure SQL Services* | **3** | `mysqlPersistenceService.js`, `excelReportService.js`, `pdfService.js` |
| ↳ *Neither / Pure Logic Engines* | **4** | `dataScopeService`, `documentChecklistService`, `overtimeEngine`, `statutoryPayrollEngine` |
| **Runtime `.aggregate(` Calls** | **30** across **7 files** | `employeeController.js` (2), `hrController.js` (4), `leaveController.js` (4), `analyticsController.js` (11), `coreHrmsController.js` (4), `dashboardController.js` (3), `orgController.js` (2) |
| **Mongoose References in Server** | **1,153** in **167 files** | Node scan across `BJK HELTHCARE/server` excluding `node_modules` |
| **Client Source Files (.jsx / .js)** | **201** .jsx, **10** .js (0 .tsx, 0 .ts) | Recursive extension scan in `BJK HELTHCARE/client` |
| **Next.js Scaffold Source Files** | **109** .tsx, **3** .ts (0 .jsx, 0 .js) | Recursive extension scan in `next-scaffold/` |
| **Routes in `client/src/App.jsx`** | **226** `<Route` tags | RegEx scan of `<Route` tags in `App.jsx` (maps to 142 unique application URLs) |
| **Next.js Build Route Count** | **102** prerendered routes | `npm run build` in `next-scaffold/` (102 static pages generated, 0 errors) |
| **PostgreSQL Staging Tables** | **134** tables (12 migrations) | `npm run db:validate` (67/67 tests passing) |
| **PostgreSQL Record Count** | **16,541** rows | `npm run db:validate` (16,436 Atlas + 105 active session/audit delta) |
| **Mapped Document IDs** | **16,543** rows | `migration_id_map` in PostgreSQL staging |
| **Audit Trigger Protection** | **Active & Enforced** | `trg_block_audit_mutation` verified blocking `UPDATE` & `DELETE` on `audit_logs` |

---

## 3. Environment Variables & Gate Switches

### 3.1 Environment Variable Names Present (Zero Values Disclosed)
- **`BJK HELTHCARE/server/.env`**:
  `PORT`, `NODE_ENV`, `CLIENT_URL`, `MONGODB_URI`, `DATABASE_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COMPANY_NAME`, `APP_NAME`, `MODULE_NAME`, `LOG_LEVEL`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_HR_MANAGER_PASSWORD`, `SEED_SUPER_ADMIN_PASSWORD`, `SEED_DIRECTOR_PASSWORD`, `SEED_HR_ADMIN_PASSWORD`, `SEED_QA_MANAGER_PASSWORD`, `SEED_EMPLOYEE_PASSWORD`, `DATABASE_PROVIDER`, `DATABASE_READ_ONLY`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_CONNECTION_LIMIT`.
- **`BJK HELTHCARE/client/.env`**:
  `VITE_API_URL`, `VITE_APP_NAME`.
- **`.env.example` (Root)**:
  `PORT`, `NODE_ENV`, `CLIENT_URL`, `DATABASE_PROVIDER`, `DATABASE_READ_ONLY`, `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_CONNECTION_LIMIT`, `MYSQL_SSL_MODE`, `MONGODB_URI`, `DATABASE_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COMPANY_NAME`, `APP_NAME`, `MODULE_NAME`, `LOG_LEVEL`, `VITE_API_URL`.

### 3.2 Owner Switches (Section 0)
```
DB_TARGET                = POSTGRESQL      # Fixed & Confirmed Target
CREDENTIALS_ROTATED      = NO              # PENDING OWNER ACTION
G5_HISTORY_PURGED        = NO              # PENDING OWNER ACTION
G1_FIX_APPROVED          = NO              # PENDING OWNER ACTION
G2_1_APPROVED            = NO              # PENDING OWNER ACTION
PRODUCTION_CUTOVER       = NOT_APPROVED    # Safe Hold at CUTOVER-READY
VITE_CLIENT_RETIREMENT   = NOT_APPROVED    # Dual-Run Active
AZURE_RESOURCE_CREATION  = NOT_APPROVED    # Zero Cloud Resource Creation
ATLAS_ACCESS             = READ_ONLY       # Strict Read-Only Driver
```

### 3.3 Gate Documentation Files in `docs/migration/`
- `docs/migration/G1-A_OWNER_REVIEW.md`
- `docs/migration/G2_RESOLUTION_PLAN.md`
- `docs/migration/HOTFIX_DEPLOY_CHECKLIST.md`
- `docs/migration/SECURITY_CHECKPOINT_REPORT.md`
- `docs/migration/STATE.md`
- `docs/migration/MIGRATION_RISK_REGISTER.md`
- `docs/migration/PHASE_STATUS.md`
- `docs/migration/TEST_EVIDENCE.md`
- `docs/migration/phase-0/PHASE_0_SAFETY_REPORT.md`
- `docs/migration/phase-1/` (5 architecture & inventory documents)
- `docs/migration/phase-2/` (8 design & planning documents)

---

## 4. Master Status Table of All Pending Items

| Stage | Item ID | Item Name | Status | Evidence / Verification Method | Blocking Gate / Notes |
|---|---|---|:---:|---|---|
| **Stage 1** | 1.1 | Confirm DB_TARGET = POSTGRESQL | `DONE` | Prompt Rule R13 + 12 Postgres migrations verified | None |
| **Stage 1** | 1.2 | Park MySQL track to `archive/mysql-track` & restore `migration/postgres` | `NOT STARTED` | Branch `archive/mysql-track` not yet created | Ready to execute in Stage 1 |
| **Stage 1** | 1.3 | Set `DATABASE_PROVIDER=postgres`, `DATABASE_URL` placeholder, create `DB_TARGET_DECISION.md` | `NOT STARTED` | `server/.env.example` currently references MySQL | Ready to execute in Stage 1 |
| **Stage 2** | 2.1 | Prepare `docs/migration/OWNER_ACTIONS_REQUIRED.md` (Checklist, G5 runbook, G1/G2 review packets, verify .gitignore) | `NOT STARTED` | File does not yet exist | Ready to execute in Stage 2 |
| **Stage 3** | 3.1 | Create `docker-compose.postgres.yml` (Postgres 16, local volume, env secrets) | `NOT STARTED` | Compose file not present at root | Ready to execute in Stage 3 |
| **Stage 3** | 3.2 | Apply migrations 001 to 012 to PostgreSQL | `DONE` (PGlite) / `PENDING` (Docker) | 12 migrations applied clean on `.postgres_staging_data`; host lacks Docker daemon | Docker not installed on Windows host; PGlite 16 active |
| **Stage 3** | 3.3 | Verify roles (`app`, `migrator`, `readonly`), trigger `trg_block_audit_mutation`, extensions, indexes, FKs | `DONE` | `db:validate` Suite 7: `trg_block_audit_mutation` blocks UPDATE and DELETE | Verified on local Postgres engine |
| **Stage 3** | 3.4 | Re-run ETL from Atlas with frozen snapshot strategy | `DONE` | 16,541 rows migrated, 16,543 mapped IDs in `migration_id_map` | Snapshot strategy documented |
| **Stage 3** | 3.5 | Run `db:validate` (reconciliation, FK, product catalogue, leading zeros, precision) | `DONE` | `npm run db:validate` passes 67/67 tests (100%) | Verified |
| **Stage 3** | 3.6 | Fix report numbers (explain 6-row gap, correct `FINAL_MIGRATION_REPORT.md` and `MIGRATION_PROGRESS.md`, relabel status) | `NOT STARTED` | Report currently states "zero runtime dependency on MongoDB" (untrue) and "CUTOVER-READY" | Fix scheduled in Stage 3 |
| **Stage 3** | 3.7 | Switch test harness for SQL work to PostgreSQL | `IN PROGRESS` | PGlite/Postgres pool used in migration tooling; unit tests still use MongoMemoryServer | Refactor in Stage 3/5 |
| **Stage 4** | 4.1 | Capture baseline REST contract snapshots under `server/tests/contracts/` | `NOT STARTED` | Directory `server/tests/contracts/` not yet created | Ready to execute in Stage 4 |
| **Stage 5** | 5A | Repositories for every remaining domain | `IN PROGRESS` | 6 repositories exist (`attendance`, `audit`, `employee`, `leave`, `product`, `user`); 23 domain repositories needed | Build in Stage 5A |
| **Stage 5** | 5B | Controller and service conversion to SQL in strict order | `IN PROGRESS` | 1/66 pure SQL, 19/66 mixed, 42/66 Mongoose-only; 3/21 pure SQL services | Convert in Stage 5B |
| **Stage 5** | 5C | 18 Aggregation pipelines converted to SQL with proven parity | `IN PROGRESS` | 6 aggregations bridged in `4815c20` with fallback; parity doc `AGGREGATION_PARITY.md` needed | Complete in Stage 5C |
| **Stage 5** | 5D | File uploads & PDFs: S3 presigned URL flow behind `StorageProvider` interface | `NOT STARTED` | S3 presigned architecture documented in Phase 2; code not implemented | Build in Stage 5D |
| **Stage 5** | 5E | Remove Mongoose from runtime: server boots with MongoDB unreachable | `NOT STARTED` | `server.js` still calls `ensureDatabaseConnection()` to Mongoose | Execute in Stage 5E |
| **Stage 5** | 5F | Application-layer regression against PostgreSQL | `NOT STARTED` | `test:hrms`, `test:policies`, `test:onboarding` pass against Atlas, not yet purely against SQL | Run in Stage 5F |
| **Stage 5** | 5G | Pool / serverless / Azure readiness verification | `DONE` | `config/postgres.js` has pool max, SSL toggle, fail-fast production guard | Verified |
| **Stage 6** | 6.1 | Next.js foundation & scaffolding | `PENDING APPROVAL` | Scaffold exists in `next-scaffold/` (102 routes); gated by `G5_HISTORY_PURGED` and `CREDENTIALS_ROTATED` | Blocked by Owner Gates G5 & Credentials Rotation |
| **Stage 7** | 7.1 | Port all 142 routes in waves with TSX & Playwright | `PENDING APPROVAL` | 102 routes prerendered in `next-scaffold/`; remaining 40 alias/sub-routes & Playwright tests pending | Gated behind Stage 6 clearance |
| **Stage 8** | 8.1 | Next.js hardening & deployment config | `PENDING APPROVAL` | CSP, middleware, and vercel config prepared | Gated behind Stage 6 clearance |
| **Stage 9** | 9.1 | Combined E2E verification (Next.js + Express + PostgreSQL) | `PENDING APPROVAL` | Target stack integration ready | Gated behind Stage 5 & 6 |
| **Stage 10** | 10.1| Final status audit & cutover documentation | `IN PROGRESS` | `STATUS_FINAL.md`, updated runbooks, and cutover checklist | Final stage of execution |

---

## 5. Summary Baseline Finding
- The PostgreSQL data tier is **100% data-ready** on PostgreSQL 16 schema with 67/67 automated checks passing on `db:validate`.
- The application runtime is **NOT yet pure SQL** (42/66 controllers and 8/21 services still depend on Mongoose directly; runtime still requires MongoDB connection).
- The Next.js track has completed 102/102 static route prerendering in `next-scaffold/` but is formally held at `PENDING APPROVAL` per Section 0 rules until Owner completes Git history purge (`G5`) and Credential rotation.
- MySQL work exists on `migration/nextjs` and will be cleanly parked to `archive/mysql-track` in Stage 1 without data loss.
