# BJK Healthcare Digital Brain: Migration Phase Status Tracker

**Current Date:** 2026-10-14  
**Target Architecture:** Next.js App Router + TypeScript + Vercel + MongoDB Atlas  
**Active Track:** Track 1 — Hotfix Security Remediation & Handover  
**Active Branch:** `hotfix/security` (HEAD `5341b08` on top of `main` `c0bab07`; 6 local commits; 135 automated tests passing; nothing pushed or deployed)  

---

## 1. Unified Master Gate Pipeline (Section 3)

| Gate ID | Gate Name | Owner / Agent | Current Status | Blocker / Next Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **G1-FIX** | Hotfix Security Fixes Review | Owner Approval | **PENDING OWNER REVIEW** | Review full diffs for T1a (finance/payroll `PROTECTED_ROLES`), T1b (drift fixes), T1c (route tests), T1d (behaviour tests), T1e (OTP report), T1f (`TRUST_PROXY_HOPS`), T1g (preflight script) |
| **G2-1** | Production Backup Verification | Owner Action | **BLOCKED** | Atlas snapshot ID + UTC timestamp, or mongodump archive + SHA-256 (outside repo & OneDrive) |
| **G2-2** | Staging Database Isolation | Owner Action | **BLOCKED** | Provision `bjk_healthcare_staging` with isolated user; test non-production guard refusal of production DB |
| **G2-3** | Environment Secrets Setup | Owner Action | **BLOCKED** | New `JWT_SECRET` (32+ chars) set on all hosts; `BIOMETRIC_WEBHOOK_SECRET` set |
| **G2-4** | Incident Check & Topology | Owner Action | **BLOCKED** | Atlas audit query counts (anonymous admin check), `db.users.distinct('role')`, hosting topology confirmation |
| **G2-5** | Admin Password Rotation | Owner Action | **BLOCKED** | System owner changes default admin and executive passwords directly |
| **G3-R1** | Deploy Release 1 to Production | Owner Action | **BLOCKED** | Ships R+ (`b12215b`), R2 (`09d9be5`), B8 (`f65a38a`), T1a, T1b together |
| **G3-R2** | Deploy Release 2 to Production | Owner Action | **BLOCKED** | Ships B7 (`3b534f6`), T1c, T1f (biometric webhook & trust proxy) |
| **G3-R3** | Deploy Release 3 to Production | Owner Action | **BLOCKED** | Ships A (`7bf6e5b`), T1d, T1e, T1g (safety guards, leave defaults, preflight) |
| **G3-MERGE**| Merge Release Branches to Main | Owner Action | **BLOCKED** | Fast-forward merge verified release branches into `main` and tag `hotfix-deployed` |
| **G4** | Systematic Password Rotation | Owner Action | **BLOCKED** | Owner runs `ownerRunPasswordReset.js` (`--detect-defaults`, `--dry-run`, `--production`) |
| **G5** | Git History Purge | Owner Action | **BLOCKED** | Owner runs `git filter-repo` on mirror clone to eliminate historical spreadsheets |
| **G6** | Next.js Migration Branch Creation | Owner Approval | **BLOCKED** | Tag `pre-nextjs-migration`, branch `migration/nextjs`, rename folder `bjk-healthcare` |

---

## 2. Track Status Overview

- **Track 1 (Hotfix & Handover)**:
  - 5 Commits in local history on `hotfix/security`:
    1. `b12215b` (R+): RBAC hierarchy, credential management, allow-list projections, strict audit.
    2. `09d9be5` (R2): Elimination of dev password bypass, strict bcrypt authentication.
    3. `f65a38a` (B8): Disabled bulk employee import in production.
    4. `3b534f6` (B7): Biometric webhook authentication header, rate limiter, timing-safe compare.
    5. `7bf6e5b` (A): Production safety guards, auto-init gating, canteen reset protection, leave defaults, payroll deletion controls.
  - Working Tree Fixes (T1) completed and verified across 91 automated unit/route/integration tests.
  - Zero changes pushed to remote; zero live database connections.
- **Track 2 (Next.js Migration)**:
  - Planning complete (Phase 2 documents).
  - Code execution strictly held until G5 history purge and G6 branch creation.
