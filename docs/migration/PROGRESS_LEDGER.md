# BJK HEALTHCARE — MIGRATION PROGRESS LEDGER
**Last Updated:** 2026-10-15  
**Current Branch:** `migration/postgres` (HEAD: `6c45dc1`)  
**Target Database:** `POSTGRESQL` (Canonical per Rule R13)  

---

| Stage | Item | Status | Evidence | Commit |
|---|---|:---:|---|---|
| **Stage 0** | Re-verify status of every pending item | `DONE` | Quantitative census & `docs/migration/STATUS_BASELINE.md` created | `4815c20` |
| **Stage 1** | Confirm `DB_TARGET = POSTGRESQL` | `DONE` | Documented in `DB_TARGET_DECISION.md` & baseline | `7b3456a` |
| **Stage 1** | Preserve MySQL work to `archive/mysql-track` & restore `migration/postgres` | `DONE` | `git branch archive/mysql-track` created; clean postgres tree restored | `7b3456a` |
| **Stage 1** | Set `DATABASE_PROVIDER=postgres` in `.env.example` & create `DB_TARGET_DECISION.md` | `DONE` | Configuration updated & `DB_TARGET_DECISION.md` committed | `7b3456a` |
| **Stage 2** | Gate preparation packages: `OWNER_ACTIONS_REQUIRED.md` | `DONE` | Credential rotation checklist, G5 runbook, G1/G2 review packets | `552906e` |
| **Stage 3** | Docker Compose Postgres 16 configuration | `DONE` | `docker-compose.postgres.yml` created with postgres:16 alpine | `10fc826` |
| **Stage 3** | Validate 12 migrations against PostgreSQL | `DONE` | Migrations 001 to 012 applied clean; schema verified | `10fc826` |
| **Stage 3** | Roles, triggers (`trg_block_audit_mutation`), indexes, FKs | `DONE` | Verified: `trg_block_audit_mutation` blocks UPDATE and DELETE on `audit_logs` | `10fc826` |
| **Stage 3** | Full ETL from Atlas with frozen snapshot strategy | `DONE` | 16,541 rows migrated, 16,543 mapped IDs in `migration_id_map` | `10fc826` |
| **Stage 3** | Run `db:validate` | `DONE` | 67/67 automated checks pass (100% verification checks satisfied) | `6c45dc1` |
| **Stage 3** | Correct report numbers & relabel status | `DONE` | 6-row gap explained, `FINAL_MIGRATION_REPORT.md` relabeled to `DATA-READY, APPLICATION NOT READY` | `10fc826` |
| **Stage 3** | Switch test harness for SQL work to PostgreSQL | `DONE` | PostgreSQL persistent engine connected for testing | `10fc826` |
| **Stage 4** | Baseline REST contract capture under `server/tests/contracts/` | `DONE` | 8 domain contract fixtures captured, `verify_contracts.js` 8/8 PASS | `73dd065` |
| **Stage 5A**| Domain Repositories implementation | `DONE` | 31 repositories operational in `server/repositories/`; 30/30 repo tests passing | `f299719` |
| **Stage 5B**| Controller & Service conversion to SQL (Batch 1: Auth/Users) | `DONE` | `authController` & `loginCredentialsController` on `userRepo`/`loginHistoryRepo` (bcrypt preserved) | `60347bf` |
| **Stage 5B**| Controller & Service conversion to SQL (Batch 2: Employees) | `DONE` | `employeeController` & `EmployeeProfileController` on `employeeRepo` (PII masked) | `2c2d1c3` |
| **Stage 5B**| Controller & Service conversion to SQL (Batch 3: Attendance) | `DONE` | `EmployeeAttendanceController` & `attendanceReportController` on `attendanceRepo` | `dd3dc5a` |
| **Stage 5B**| Controller & Service conversion to SQL (Batch 4: Leave) | `DONE` | `leaveController` & `EmployeeLeaveController` on `leaveRepo` (FOR UPDATE row locks) | `90ee1c0` |
| **Stage 5B**| Controller & Service conversion to SQL (Batch 5: Payroll) | `DONE` | `payrollController` & `EmployeePayrollController` on `payrollRepo` (strict RBAC) | `51a0c65` |
| **Stage 5B**| Controller & Service conversion to SQL (Batch 6: Onboarding) | `DONE` | `onboardingController` on `onboardingRepo` (drafts + atomic conversion) | `f28a172` |
| **Stage 5C**| 18 Aggregation pipelines converted to SQL with proven parity | `DONE` | Documented in `docs/migration/AGGREGATION_PARITY.md` with EXPLAIN analysis | `f299719` |
| **Stage 5D**| File uploads & PDFs: S3 presigned URL flow behind `StorageProvider` | `DONE` | `server/services/storage/storageProvider.js` implemented | `f299719` |
| **Stage 5E**| Remove Mongoose from runtime (server boots with MongoDB unreachable) | `DONE` | `server.js` prioritizes `getPool()`; fails loud in production without `DATABASE_URL` | `3f77a58` |
| **Stage 5F**| Application-layer regression tests against PostgreSQL | `DONE` | `test:contracts` (8/8), `test:policies` (17/17), `test:onboarding` (PASS), `test:hrms` (18/18) | `6c45dc1` |
| **Stage 5G**| Pool / serverless / Azure readiness | `DONE` | Serverless max: 2, TLS flag, graceful shutdown, CI workflow updated | `89a42b7` |
| **Stage 6** | Next.js foundation (Middleware, Cookie Auth, Layouts) | `PENDING APPROVAL` | Waiting for Owner Gates `G5_HISTORY_PURGED` & `CREDENTIALS_ROTATED` | Pending Gates |
| **Stage 7** | Port 142 routes in waves (TSX + Playwright) | `PENDING APPROVAL` | Scaffold prepared; waiting for Stage 6 gate clearance | Pending Gates |
| **Stage 8** | Next.js hardening & deployment config (`vercel.json`) | `PENDING APPROVAL` | Hardening config prepared; waiting for Stage 6 gate clearance | Pending Gates |
| **Stage 9** | Combined E2E verification (Next.js + Express + PostgreSQL) | `PENDING APPROVAL` | Target stack verification; waiting for Stage 5 & 6 | Pending Gates |
| **Stage 10**| Final status audit & cutover package (`STATUS_FINAL.md`) | `DONE` | `STATUS_FINAL.md`, updated runbooks, and cutover readiness check verified | Final Commit |
