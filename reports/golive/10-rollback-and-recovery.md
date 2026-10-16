# Phase A10 — Rollback and Disaster Recovery Runbook
**Date:** 16 October 2026  
**Auditor:** DevOps & Reliability Engineering Lead  
**Scope:** BJK Healthcare Production Application (React + Vite + Express + MongoDB Atlas)

---

## 1. Quick Emergency Rollback (< 5 Minutes)

### Scenario A: Vercel Production Web Incident
If the live website shows runtime errors, blank screens, or API failures immediately following deployment:
1. Log into the [Vercel Dashboard](https://vercel.com).
2. Select Project: **`bjk-healthcare`** (or active project).
3. Navigate to **Deployments**.
4. Identify the last known good deployment (prior to commit `c0bab07`, e.g., commit `de24348` or `d0bb708`).
5. Click **...** (Options) -> **Instant Rollback**.
6. **Mean Time to Recovery (MTTR):** < 60 seconds.

### Scenario B: Git Revert and Automated Re-deploy
If dashboard access is unavailable, perform an emergency Git revert:
```bash
git checkout main
git pull origin main
git revert c0bab075bf2a2365664d7461482502972b6c6f75 --no-edit
git push origin main
```
Vercel's automated CI/CD pipeline triggers an immediate rebuild and production redeploy (~3 minutes).

---

## 2. Database Disaster Recovery (MongoDB Atlas)

### 2.1 Point-in-Time Restore (Atlas Cloud Console)
1. Navigate to **MongoDB Atlas Console** -> Database Deployments -> **Cluster28**.
2. Select **Backup** -> **Point-In-Time Restore**.
3. Select exact point in time prior to the failure event.
4. Restore to target cluster.

### 2.2 Local Snapshot Restore Runbook
1. From project workspace root:
   ```powershell
   cd "BJK HELTHCARE/server"
   node scripts/restore_atlas_snapshot.js --snapshot=../../backups/migration_backup_1792016320134.json
   ```
2. Verify collection counts:
   - Employees: 146
   - Products: 111
   - Users: 122
   - Attendances: 10,527

---

## 3. Incident Escalation Contacts & Responsibilities

| Role | Responsibility | Action Trigger |
|---|---|---|
| **System Owner / Director** | Production deployment authorization & credential approvals | Critical go-live blocker |
| **DevOps / Release Manager** | Vercel redeployment & rollback execution | Sustained 5xx or build failure |
| **Database Administrator** | Atlas cluster snapshot restore & connectivity | DB connection timeout > 60s |
| **Pharma QA Lead** | Audit trail verification & data integrity check | Data corruption / PII breach |
