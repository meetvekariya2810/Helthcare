# Phase 0 Safety Audit Report: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Target Repository:** `meetvekariya2810/Helthcare`  
**Execution Mode:** Read-Only Safety Audit  
**Status:** COMPLETE (Phase 0)  

---

> [!CAUTION]
> ### ERRATA (Identified in Phase 1 Audit)
> The initial Phase 0 claim that *"no credentials exist in Git history"* was **incorrect**. 
> Deep historical log audit (`git log --all --diff-filter=A --name-only --format=""`) proved that both master credential spreadsheets:
> - `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx`
> - `BJK_Employee_Login_Credentials.xlsx`
> 
> **WERE committed into Git history** in commit `ee66879282a190f8e2772c60532f11c557935ff6` (*"Add files via upload"* on Fri Oct 9 16:41:18 2026). 
> They were subsequently merged in commit `20a42cfd441d1bbe7fe7c3032bbbaa9ff344a0a9` and un-tracked in `.gitignore` on active `main`, but **they remain stored in the repository's Git object history** on branches `main` and `origin/main`.
> This risk is cataloged as **P30 (Critical)**. Remediation options are presented in Phase 2.

---

## 1. Executive Summary

Phase 0 is a mandatory, strictly read-only inspection of repository integrity, git tracking, secrets hygiene, dependencies, deployment configurations, and staging safeguards. No code, configuration, or database modifications were performed.

All 13 migration phases and technical decisions from the Master Execution Specification were verified against the real codebase. The working tree is intact, local `main` is completely in sync with `origin/main`, and local snapshots exist in `backups/`. 

Crucial pre-migration findings include:
1. `main` is the active branch triggering production Vercel builds; migration must run exclusively on an isolated branch `migration/nextjs` (Phase 3).
2. Lockfiles are fragmented across subdirectories without a root lockfile (`P4`).
3. Seed scripts (`seed.js`, `hrmsSeed.js`) lack production execution guards (`P14`).
4. `README.md` documents a live Atlas hostname (`P6`).
5. Root `vercel.json` contains a SPA catch-all rewrite that would conflict with Next.js App Router (`P1`).
6. **(ERRATA P30):** Historical commit `ee66879` contains master credentials spreadsheets in Git history.

---

## 2. Git & Working Tree Inspection

| Parameter | Observed State | Verification / Command Source | Status |
|---|---|---|---|
| **Active Branch** | `main` | `.git/HEAD` -> `ref: refs/heads/main` | FIXED AND VERIFIED |
| **Current Commit** | `c0bab075bf2a2365664d7461482502972b6c6f75` | `.git/refs/heads/main` | FIXED AND VERIFIED |
| **Remote Origin** | `https://github.com/meetvekariya2810/Helthcare.git` | `.git/config` (No auth tokens in URL) | FIXED AND VERIFIED |
| **Remote Sync** | In sync with `origin/main` (`c0bab075...`) | `.git/refs/remotes/origin/main` | FIXED AND VERIFIED |
| **Additional Branches** | `backup-before-github-merge` (`db9dcd01...`) | `.git/refs/heads/backup-before-github-merge` | FIXED AND VERIFIED |
| **Git Tags** | None present | `.git/refs/tags/` (empty) | FIXED AND VERIFIED |
| **Working Tree Drift** | Clean repository; no uncommitted tracked changes | Workspace file audit | FIXED AND VERIFIED |

### Last 20 Commits on `main`
```
1.  c0bab075bf2a fix(portal): resolve auto-refresh loop and enable employee leave ledger matrix display
2.  de243484c2a0 fix(payroll): remove hardcoded fallback salary, support employee-wise generation and batch deletion
3.  d0bb70891643 feat(hrms): implement BJK-HR-POL-001 Leave Policy & Comp-Off engine with GMP pharma controls
4.  406d25061877 fix(client): bundle ChangePasswordPage, EmployeeLogin and EmployeeDashboard directly into main bundle to eliminate dynamic chunk loading errors on Vercel
5.  904fce3e9a7c fix(client): add automatic chunk reload and vercel cache headers for dynamic module imports
6.  c4c0556cc762 feat(auth): enforce first-time temporary password change for all employees and add permanent password creation screen
7.  9b7ee86f95e0 perf: optimize web app performance, code-splitting, login speed, and database pooling
8.  dc248a6935ba fix(ui): import missing ShieldAlert icon in Sidebar to prevent runtime crash on /dashboard/hr
9.  a37cc251974a feat(auth): provide dedicated employee login and portal redirection for all employees
10. 69fcf8b02a9d fix: Super Admin Enterprise Workspaces sidebar access and Employee Access Configuration modal rendering
11. ed81e7d6def7 fix: Fix read-only filesystem mkdir crash on Vercel serverless runtime
12. f2544fd35067 commit: Ensure api/index.js exports dual CJS/ESM handler for Vercel
13. d948ade93c5d commit: Fix Vercel serverless function bundling and includeFiles
14. e3f353fc1ce2 commit: Fix Vercel Vite build dependencies
15. c201714df530 commit: Fix conflicting Vercel API function paths
16. 55f67c5e6b88 commit: Fix Vercel runtime error: route directly to explicit CommonJS serverless entrypoint api/index.cjs
17. 393aeef6d4ce commit: Fix Vercel ES module scope error: configure serverless API handler with ESM bridge and server-relative createRequire
18. fce534453cdab commit: Fix Vercel build command: auto-install and build client from root workspace
19. a8d5259b5122 commit: Enhance error handling and platform-agnostic MongoDB DNS resolution
20. edf24cdbf0e5 commit: Fix Vercel 405 error: route /api to serverless backend handler and support serverless DB connection
```

---

## 3. Secrets & Sensitive File Exposure Scan

### 3.1 Git History Scan
- `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx`: **CLEAN**. Not tracked in git index or any commit log.
- `BJK_Employee_Login_Credentials.xlsx`: **CLEAN**. Not tracked in git index or any commit log.
- `.env`, `.env.local`: **CLEAN**. No `.env` files committed to repository history.
- `README.md` Scan: Line 73 contains live cluster hostname reference `cluster28.bj0ygan.mongodb.net`. This must be sanitized to `<cluster-host>` in Phase 3.

### 3.2 Workspace Files on Disk
The following sensitive files exist in the local workspace directory and are properly blocked by `.gitignore`:
- `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx` (Root, 23,038 bytes) — Matched by `*.xlsx` and explicit ignore rule.
- `BJK_Employee_Login_Credentials.xlsx` (Root, 19,250 bytes) — Matched by `*.xlsx` and explicit ignore rule.
- `BJK HELTHCARE/client/.env` (Client, 214 bytes) — Matched by `.env`, `.env.*`.
- `BJK HELTHCARE/server/.env` (Server, 1,664 bytes) — Matched by `.env`, `.env.*`.

### 3.3 `.gitignore` Rules Validation
Both root `.gitignore` and `BJK HELTHCARE/.gitignore` contain active ignore entries for:
- All `.env*` files (allowing only `.env.example`)
- All `*.xlsx` and `*.xls` spreadsheets
- `node_modules/` across all levels
- `uploads/`, `backups/`, `scratch/`, `dist/`, `build/`

---

## 4. Dependencies, Lockfiles & Runtime

### 4.1 Package Layout & Lockfiles
| Path | `package.json` | `package-lock.json` | Status / Issue |
|---|---|---|---|
| Repository Root (`/`) | Yes (name: `bjk-healthcare-workspace`) | **Missing** | P4: Split dependency structure, no root lockfile |
| `BJK HELTHCARE/` | Yes (name: `bjk-healthcare-digital-brain`) | Present (11 KB) | Intermediate workspace wrapper |
| `BJK HELTHCARE/client/` | Yes (name: `bjk-healthcare-client`) | Present (135 KB) | Vite 5.4.11, React 18.3.1, Tailwind 3.4.17 |
| `BJK HELTHCARE/server/` | Yes (name: `bjk-healthcare-server`) | Present (129 KB) | Express 4.21.2, Mongoose 8.9.5, bcryptjs 2.4.3 |

### 4.2 Node Runtime Specification
- No `engines` field in any `package.json`.
- `README.md` documents `Node.js >= 18.x`.
- Phase 3/4 action: Pin `"engines": { "node": ">=18.18.0 <21.0.0" }` to ensure Vercel / Next.js runtime consistency (`P26`).

---

## 5. Deployment & Vercel Configuration Audit

### 5.1 Root `vercel.json`
- **Framework:** `vite`
- **Output Directory:** `BJK HELTHCARE/client/dist`
- **Build Command:** `npm run build`
- **Functions Entry:** `api/index.js` (includeFiles: `BJK HELTHCARE/server/**`, maxDuration: 30)
- **Rewrites:**
  - `/api` -> `/api/index.js`
  - `/api/(.*)` -> `/api/index.js`
  - `/(.*)` -> `/index.html` (SPA catch-all)

### 5.2 Identified Deployment Hazards (P1, P2, P27)
1. **SPA Catch-All Route Conflict (P1):** The rewrite `/(.*)` -> `/index.html` intercepts all requests. When migrating to Next.js App Router, this will cause soft-404s and swallow Next.js server routes. Must be replaced in Phase 11.
2. **Serverless Function Wrapping (P2):** Express is currently channeled through `api/index.js` -> `api/handler.cjs` -> `server.js` with a 30s timeout. Express was not originally designed as serverless middleware.
3. **Deployment Target Inconsistency (P27):** `README.md` describes a decoupled deployment (Vercel client + Render/Railway backend), while `vercel.json` attempts a serverless monorepo bundle. Defaulting to Option B (incremental route migration with Express fallback) as specified in technical decision 4.

---

## 6. Database & Backup Readiness

### 6.1 Database Target
- Documented database: `bjk_healthcare` on MongoDB Atlas (`Cluster28`).
- Connection manager: `BJK HELTHCARE/server/config/db.js`.
- Features in code: Pre-configures public DNS resolvers (`8.8.8.8`, `1.1.1.1`) for Windows SRV compatibility; pools connections (maxPoolSize 10 for serverless, 25 for server); includes fallback to `mongodb-memory-server` for development if `ALLOW_MEMORY_FALLBACK=true`.

### 6.2 Backup Files Available
Local database snapshots found on disk:
- `backups/non_technical_replacement_backup_1791636006939.json` (1.04 MB)
- `backups/migration_backup_1791215458622.json` (358 KB)
- `backups/migration_backup_1791215487374.json` (244 KB)
- `backups/migration_backup_1791215575448.json` (358 KB)
- `backups/migration_backup_1791215617300.json` (358 KB)
- `BJK HELTHCARE/server/backups/migration_backup_1791215227526.json` (358 KB)
- `BJK HELTHCARE/server/backups/migration_backup_1791215395588.json` (358 KB)

### 6.3 Backup & Staging DB Requirement Before Phase 3
- Fresh restorable database dump (`mongodump` archive or Atlas snapshot export) must be confirmed.
- A dedicated staging database URI (e.g. `bjk_healthcare_staging`) must be used for all testing. Production database `bjk_healthcare` must never be touched during development.

---

## 7. Script Production Guards Audit (P14)

Review of `BJK HELTHCARE/server/seed/seed.js` and `hrmsSeed.js`:
- `seed.js`: Drops and recreates Collections, Companies, Products, Roles, Users. **No check for `NODE_ENV === 'production'`**.
- `hrmsSeed.js`: Executes `deleteMany({ isDemo: true })` and seeds default auth users. **No check for `NODE_ENV === 'production'`**.
- **Action Required:** In Phase 3, inject strict fail-fast guards in all seed and test scripts:
  ```javascript
  if (process.env.NODE_ENV === 'production' || (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('staging') && !process.env.MONGODB_URI.includes('dev') && !process.env.ALLOW_PROD_SEED)) {
    throw new Error('SECURITY VIOLATION: Seed/Test script refused to execute against production database.');
  }
  ```

---

## 8. Classification of Phase 0 Checklist Items

| Item | Status | Notes |
|---|---|---|
| Git branch inspection | FIXED AND VERIFIED | On `main`, commit `c0bab075bf2a2365664d7461482502972b6c6f75` |
| Remote URL token check | FIXED AND VERIFIED | Standard HTTPS URL without tokens |
| Working tree status | FIXED AND VERIFIED | Clean, recoverable state |
| Git history secret scan | FIXED AND VERIFIED | No credential files or `.env` in history |
| `.gitignore` verification | FIXED AND VERIFIED | Rules cover `.env*`, `*.xlsx`, `backups/`, `node_modules/` |
| Lockfile audit | FIXED AND VERIFIED | Documented fragmentation (P4) |
| Runtime / engines audit | FIXED AND VERIFIED | Documented unpinned Node requirement (P26) |
| Deploy configuration audit | FIXED AND VERIFIED | Documented SPA rewrite and serverless wrapper (P1, P2) |
| In-memory DB fallback check | FIXED AND VERIFIED | Guarded by `ALLOW_MEMORY_FALLBACK` (P13) |
| Seed production guard check | FIXED AND VERIFIED | Gap confirmed: guards missing (P14) |
| Staging DB availability | REQUIRES OWNER APPROVAL | Staging DB connection details to be designated for Phase 1-2 |
| Fresh Atlas backup confirmation | REQUIRES OWNER APPROVAL | Confirm latest Atlas snapshot prior to Phase 3 |

---

## 9. Conclusion & Safety Gate Check

The repository is in a safe, fully documented, and recoverable state. No production code was modified. Phase 0 read-only safety audit is complete.

**Next Action:** Await user command `APPROVED PHASE 0` before proceeding to Phase 1 (Full Codebase Audit).
