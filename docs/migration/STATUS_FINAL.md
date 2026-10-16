# BJK HEALTHCARE — MIGRATION STATUS & DEFINITION-OF-DONE RECONCILIATION
**Audit Date:** 16 October 2026  
**Auditor / Verification Agent:** Antigravity Pairing Agent  
**Branches:** `migration/postgres` (Data Tier & Controllers) · `migration/nextjs` (Frontend Scaffold)  
**Production Isolation:** Strictly isolated; zero writes to MongoDB Atlas Cluster28 or live Vercel deployments.  

---

## 1. Measured Definition-of-Done (DoD) Scorecard

| DoD Item | Previous Claim | Measured Reality (16 Oct 2026) | Verified Status |
|---|---|---|:---:|
| **DoD #1: Staging ETL & Data Parity** | "64/67 checks pass; 3 deltas explainable by live growth" | Atlas cluster holds 129 collections (16,145 documents). 64/67 checks match exactly; the 3 deltas (`auditlogs` [1,598], `loginactivities` [572], `usersessions` [196]) are live append-only operational collections that grow with active traffic. | **DONE (Bounded Exceptions Documented)** |
| **DoD #2: Express Controller SQL Conversion** | "IN PROGRESS (25/66 controllers converted)" | Static analysis via `scratch/analyze_conversions.js`: **0 of 66 controllers run on SQL**. 63 controllers are 100% Mongoose, 0 mixed, 0 pure SQL, 3 utility. | **IN PROGRESS (0 / 66 Pure SQL)** |
| **DoD #3: Aggregation Pipeline Parity** | "18 aggregations DONE: mapped and documented" | 18 runtime `.aggregate()` calls identified in controllers. Documentation completed in `AGGREGATION_PARITY.md`. Parity hashes against PostgreSQL staging pending. | **IN PROGRESS (18 Mapped)** |
| **DoD #4: Independent Server Boot (Mongoose Removal)** | "DONE: Server boots with MongoDB unreachable" | Contradicted by DoD #2. With 0 SQL controllers and 165 Mongoose runtime references across 63 controllers, backend cannot serve business endpoints without MongoDB. | **IN PROGRESS (Relabeled Honestly)** |
| **DoD #5: SQL Test Suite on PostgreSQL 16** | "DONE: All tests pass" | Verified against Docker Compose PostgreSQL 16 staging container (`docker-compose.postgres.yml`). Migration scripts 001–012 verified. | **IN PROGRESS (Awaiting Controller Conversion)** |
| **DoD #6: G5 History Purge Gate** | "PENDING OWNER" | Commits `ee66879` and `20a42cf` remain in git history. `git-filter-repo` runbook tested and proven on dummy mirror clone in `scratch/`. | **PENDING OWNER (Runbook Verified)** |
| **DoD #7: Next.js Frontend Migration** | "DONE (Scaffold)" | `next-scaffold/package.json` contains Next.js 16.4.1 + React 19.3.0. 102 page routes prerendered. Branch history contains exposed credentials; scaffold is unapproved for production cutover until G5 cleared. | **UNGATED WORK (Pending G5 Purge)** |

---

## 2. Static Analysis: Controller & Service Inventory

Measured via script `scratch/analyze_conversions.js`:
- **Total Controller Files:** 66
  - Mongoose-Only: **63 (95.5%)**
  - Mixed (Mongoose + SQL): **0 (0%)**
  - Pure SQL: **0 (0%)**
  - Utility / Passthrough: **3 (4.5%)**
- **Total Service Files:** 20
- **Total Runtime `.aggregate()` Calls:** 18
- **Total Mongoose Reference Instances:** 165

### Conversion Priority Queue (Post-Go-Live Roadmap):
1. **Batch 1 (Auth & Users):** `authController.js`, `userController.js`, `loginCredentialsController.js` (Target: 3 controllers).
2. **Batch 2 (Employee Core):** `employeeController.js`, `hrms/employeeController.js`, `departmentController.js`, `designationController.js` (Target: 6 controllers).
3. **Batch 3 (Attendance & Shifts):** `attendanceController.js`, `hrms/attendanceController.js`, `shiftController.js` (Target: 5 controllers).
4. **Batch 4 (Leaves & Holidays):** `leaveController.js`, `holidayController.js` (Target: 4 controllers).
5. **Batch 5 (Payroll & Banking):** `payrollController.js`, `bankDetailsController.js` (Target: 4 controllers).
6. **Batch 6 (QA & Compliance):** `deviationController.js`, `capaController.js`, `auditController.js` (Target: 6 controllers).
7. **Batch 7 (Operational Rest):** 38 remaining controllers.

---

## 3. Next.js Migration Reconciliation

### Version Discrepancy:
- **Phase 2 Plan:** Next.js 14 / 15 with App Router and Node runtime.
- **Installed Scaffold (`next-scaffold`):** Next.js 16.4.1 (`react: 19.3.0`, `tailwindcss: 4.x`).
- **Compatibility Assessment:** Next.js 16 introduces asynchronous request headers (`cookies()`, `headers()`), React 19 server actions, and Turbopack by default.
- **Decision:** The scaffold remains strictly on branch `migration/nextjs` as `UNGATED WORK`. No further routes or production traffic will be directed to Next.js until:
  1. Gate G5 (Git history purge) is executed and verified on the repository mirror.
  2. The working React 18 + Vite 5 + Express + Atlas system is live and stable.
  3. The branch is rebased onto the rewritten history.

### Route Inventory Reconciliation:
- **Prerendered Scaffold Routes:** 102 static page components (`next-scaffold/src/app/**/page.tsx`).
- **Phase 1 Route Inventory Target:** 142 total mapped routes.
- **Delta (40 Routes):** Consists of dynamic parameterized routes (`[id]`, `[code]`), modals, print views, and redirect handlers.
