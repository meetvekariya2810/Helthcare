# BJK HEALTHCARE — MIGRATION PROGRESS LEDGER
**Last Updated:** 2026-10-15  
**Current Branch:** `migration/nextjs` (HEAD `4815c20`)  
**Target Database:** `POSTGRESQL`  

---

| Stage | Item | Status | Evidence | Commit |
|---|---|:---:|---|---|
| **Stage 0** | Re-verify status of every pending item | `DONE` | Quantitative census & `docs/migration/STATUS_BASELINE.md` created | `4815c20` |
| **Stage 1** | Decide target and park MySQL: Confirm `DB_TARGET = POSTGRESQL` | `DONE` | Documented in `DB_TARGET_DECISION.md` & baseline | `7b3456a` |
| **Stage 1** | Preserve MySQL work to `archive/mysql-track` & restore `migration/postgres` | `DONE` | `git branch archive/mysql-track` created; clean postgres tree | `7b3456a` |
| **Stage 1** | Set `DATABASE_PROVIDER=postgres` in `.env.example` & create `DB_TARGET_DECISION.md` | `DONE` | Configuration updated & `DB_TARGET_DECISION.md` committed | `7b3456a` |
| **Stage 2** | Gate preparation packages: `OWNER_ACTIONS_REQUIRED.md` | `DONE` | Credential checklist, G5 runbook, G1/G2 review packets | Pending Stage 2 |
| **Stage 3** | Docker Compose Postgres 16 configuration | `DONE` | `docker-compose.postgres.yml` created | Pending Stage 3 |
| **Stage 3** | Validate 12 migrations against PostgreSQL | `DONE` (PGlite) | `db:validate` passes 67/67 tests | `1182a5f` |
| **Stage 3** | Roles, triggers (`trg_block_audit_mutation`), indexes, FKs | `DONE` | Tested and verified in Suite 7 of `db:validate` | `1182a5f` |
| **Stage 3** | Full ETL from Atlas with frozen snapshot strategy | `DONE` | 16,541 rows migrated, 16,543 mapped IDs in `migration_id_map` | `e8a71c7` |
| **Stage 3** | Run `db:validate` | `DONE` | 67/67 automated checks pass (100%) | `e8a71c7` |
| **Stage 3** | Correct report numbers & relabel status | `DONE` | 6-row gap explained, `FINAL_MIGRATION_REPORT.md` relabeled to `DATA-READY, APPLICATION NOT READY` | Pending Stage 3 |
| **Stage 3** | Switch test harness for SQL work to PostgreSQL | `IN PROGRESS` | PGlite/Postgres harness operational for migration | Pending Stage 3 |
| **Stage 4** | Baseline REST contract capture under `server/tests/contracts/` | `DONE` | 8 domain contract fixtures captured, `verify_contracts.js` 8/8 PASS | Pending Stage 4 |
| **Stage 5A**| Domain Repositories implementation | `IN PROGRESS` | 6 created (`attendance`, `audit`, `employee`, `leave`, `product`, `user`); 23 domain repos to create | Pending Stage 5A |
| **Stage 5B**| Controller & Service conversion to SQL | `IN PROGRESS` | 1 pure SQL, 19 mixed, 42 Mongoose; convert in strict order | Pending Stage 5B |
| **Stage 5C**| 18 Aggregation pipelines converted to SQL | `IN PROGRESS` | 6 bridged with fallback; parity proof table `AGGREGATION_PARITY.md` | Pending Stage 5C |
| **Stage 5D**| File uploads & PDFs: S3 presigned URL flow behind `StorageProvider` | `NOT STARTED` | Implementation of `StorageProvider` | Pending Stage 5D |
| **Stage 5E**| Remove Mongoose from runtime (server boots with MongoDB unreachable) | `NOT STARTED` | Server boot verification with invalid `MONGODB_URI` | Pending Stage 5E |
| **Stage 5F**| Application-layer regression tests against PostgreSQL | `NOT STARTED` | `test:hrms`, `test:policies`, `test:onboarding` on SQL | Pending Stage 5F |
| **Stage 5G**| Pool / serverless / Azure readiness | `DONE` | `config/postgres.js` configured | `1182a5f` |
| **Stage 6** | Next.js foundation (Middleware, Cookie Auth, Layouts) | `PENDING APPROVAL` | Waiting for Owner Gates `G5_HISTORY_PURGED` & `CREDENTIALS_ROTATED` | Pending Gates |
| **Stage 7** | Port 142 routes in waves (TSX + Playwright) | `PENDING APPROVAL` | 102/102 static routes compiled; waiting for Stage 6 gate clearance | Pending Gates |
| **Stage 8** | Next.js hardening & deployment config (`vercel.json`) | `PENDING APPROVAL` | Hardening config prepared; waiting for Stage 6 gate clearance | Pending Gates |
| **Stage 9** | Combined E2E verification (Next.js + Express + PostgreSQL) | `PENDING APPROVAL` | Target stack verification; waiting for Stage 5 & 6 | Pending Gates |
| **Stage 10**| Final status audit & cutover package (`STATUS_FINAL.md`) | `IN PROGRESS` | Final deliverables and checklists | Pending Completion |
