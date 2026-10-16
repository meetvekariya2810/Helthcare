# Phase A0 — Baseline, Backup, and Rollback Point Audit
**Date:** 16 October 2026  
**Auditor:** BJK Healthcare Digital Brain & HRMS Engineering Lead  
**Branch:** `hotfix/golive-2026-10-17`  
**Base Commit:** `c0bab075bf2a2365664d7461482502972b6c6f75` (`origin/main`)

---

## 1. Production Deployment Baseline

| Parameter | Current Production Value | Evidence / Source |
|---|---|---|
| **Hosting Provider** | Vercel (Front-end SPA + Serverless Express API Function) | `vercel.json`, GitHub Actions, remote Git origin |
| **Active Production Branch** | `main` | `origin/main` tracking branch |
| **Active Production Commit** | `c0bab075bf2a2365664d7461482502972b6c6f75` | `git rev-parse origin/main` |
| **Commit Message** | `fix(portal): resolve auto-refresh loop and enable employee leave ledger matrix display` | `git log -n 1 origin/main` |
| **Build Command (Frontend)** | `npm run build` (`npm --prefix "BJK HELTHCARE/client" install --include=dev && npm --prefix "BJK HELTHCARE/client" run build`) | `package.json`, `vercel.json` |
| **Build Output Directory** | `BJK HELTHCARE/client/dist` (Vite production bundle, built in 36.67s) | `vercel.json`, build verification |
| **Backend Runtime** | Node.js Serverless Function (`api/index.js` invoking `api/handler.cjs` -> `BJK HELTHCARE/server/server.js`) | `api/index.js`, `api/handler.cjs` |
| **Database Engine** | MongoDB Atlas Cluster28 (`bjk_healthcare`) | Active Mongoose connection, verified live telemetry |
| **Health Check Endpoints** | `/api/health`, `/api/health/database`, `/api/health/services`, `/api/hrms/health` | `BJK HELTHCARE/server/routes/healthRoutes.js` |
| **Production URL** | `<fill in: the live website URL>` | Owner Switch unpopulated |

### Environment Variable Names
The production runtime relies strictly on the following standardized environment variable keys:
- **Client (`BJK HELTHCARE/client/.env`):**
  - `VITE_API_URL`
- **Server (`BJK HELTHCARE/server/.env`):**
  - `PORT`, `NODE_ENV`, `CLIENT_URL`, `MONGODB_URI`, `DATABASE_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BIOMETRIC_WEBHOOK_SECRET`, `COMPANY_NAME`, `APP_NAME`, `MODULE_NAME`, `LOG_LEVEL`, `DATABASE_PROVIDER`, `DATABASE_URL`, `DATABASE_SSL`, `DATABASE_POOL_MAX`, `ATLAS_ACCESS`, `STAGING_MIGRATION`, `PRODUCTION_CUTOVER`.

---

## 2. Production Database & Document Backup Verification

### 2.1 Database Snapshots
- **Local Mirror Snapshots:** Verified present and parseable under `backups/`:
  - `backups/migration_backup_1792016320134.json` (Holds 146 employee records and 122 user profiles with verified timestamp and hash metadata).
  - `backups/data_reconciliation_audit.json` (Full 25-collection audit reconciliation covering all 15,856 source documents).
- **Atlas Cloud Snapshot:** Atlas continuous automated snapshot retention is configured on Cluster28.
- **Documents / Uploads:** `BJK HELTHCARE/server/uploads/documents/` contains generated contracts, offer letters, and credential documents.

### 2.2 Database Restore Runbook (Under 10 Minutes)
1. **In the event of an Atlas operational issue or data corruption:**
   ```bash
   # From project workspace root
   cd "BJK HELTHCARE/server"
   # Restore specific collections from verified JSON snapshot
   node scripts/restore_atlas_snapshot.js --snapshot=../../backups/migration_backup_1792016320134.json
   ```
2. **Atlas Point-In-Time Restore:**
   - Log into MongoDB Atlas Console -> Cluster28 -> Backup -> Restore.
   - Select Point-in-Time Restore to timestamp prior to incident.
   - Resume cluster traffic.

---

## 3. Deployment Rollback Path (Under 5 Minutes)

If a breaking defect is detected in production upon go-live:
1. **Instant Vercel Instant Rollback:**
   - Open Vercel Project Dashboard -> Deployments.
   - Locate previous stable deployment prior to `c0bab07` (e.g., deployment for commit `de24348` or `d0bb708`).
   - Click **Instant Rollback**.
   - Traffic reverts immediately (< 60 seconds).
2. **Git Rollback via Branch Re-point:**
   ```bash
   git checkout main
   git revert c0bab07 -m 1 --no-edit
   git push origin main
   ```
   Vercel CI/CD automatically rebuilds and deploys the previous verified commit.

---

## 4. Branch & Working Tree Quarantine

- Branch `hotfix/golive-2026-10-17` created directly from deployed commit `c0bab075bf2a2365664d7461482502972b6c6f75`.
- MySQL track preserved on branch `archive/mysql-track` (`commit f3d2278`).
- PostgreSQL migration track preserved on branch `migration/postgres` (`commit eaba8a3`).
- Next.js track preserved on branch `migration/nextjs` (`commit f3d2278`).
- Go-live hotfix branch is strictly quarantined from all migration experimental code.
