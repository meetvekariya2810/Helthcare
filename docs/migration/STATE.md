# BJK HEALTHCARE MIGRATION & SECURITY STATE (SOURCE OF TRUTH)
**Status:** Living Document | **Last Updated:** 2026-10-14 | **Current Track:** TRACK 1 (Security Hotfix & Pre-Deployment)  
**Branch:** `hotfix/security` (HEAD `5341b08`; 6 local commits on top of `main` `c0bab07`)  
**Release Branches Built:** `release/r1` (`fdeeb44`), `release/r2` (`5a5e7ec`), `release/r3` (`e7d7f6b`), `release/r4` (candidate)  
**Workspace Notice:** Owner re-syncing repository to `D:\Projects\bjk-healthcare`. Read-only protocol strictly active until owner confirmation.  
*Note: This file remains untracked and is NEVER committed to git.*

---

## 1. Current State Summary

- **Active Track**: Track 1 — Hotfix Pre-Deployment & Handover
- **Git State**:
  - Base Commit (`main`): `c0bab07`
  - Local Commits on `hotfix/security`:
    1. `b12215b` (R+): 30 canonical roles in `rbac.js`, role hierarchy, `PROTECTED_ROLES`, strict audit failure abort (500), allow-list projections (`sanitizeForManager`, `sanitizeForFinance`).
    2. `09d9be5` (R2): Elimination of developer password login bypass in production; strict bcrypt authentication.
    3. `f65a38a` (B8): Disabled bulk employee import in production.
    4. `3b534f6` (B7): Biometric webhook secret header validation, timing-safe compare, 503 if secret unset in prod, keyed rate limiter.
    5. `7bf6e5b` (A): Gated environment validation (`requiredEnv.js`), production database safety guards (`safetyGuards.js`), cold-start auto-init gating, canteen data wipe protection, leave ledger zero-write defaults, payroll batch deletion controls.
    6. `5341b08` (T1 a to d): RBAC protected roles (`FINANCE_MANAGER`, `PAYROLL_OFFICER`, `ACCOUNTS_EXECUTIVE`), zero-drift role mappings, route-level security probes, and trust proxy hops.
  - Release Branches Verified in Scratch Worktree (0 pushes):
    - `release/r1` (`fdeeb44`): R+ + R2 + B8 + T1a/T1b role fixes (verified).
    - `release/r2` (`5a5e7ec`): R1 + B7 + trust proxy hops resolver (verified).
    - `release/r3` (`e7d7f6b`): R2 + Group A + preflight + behaviour tests (57/57 tests passing).
    - `release/r4`: Bank and payroll rework (sequestered; awaiting owner authorization).
  - Working Tree (Uncommitted Modifications for Release 4 & Security Middleware):
    - Modified (5 files): `bankDetailsController.js`, `payrollController.js`, `hrBankRoutes.js`, `server.js`, `bankDetailsService.js`.
    - Untracked (8 items): `middleware/fileSecurity.js`, `scripts/anonymizeStaging.js`, `scripts/count_routes.js`, `scripts/ownerRunPasswordReset.js`, `tests/unit_anonymize_staging.test.js`, `tests/unit_bank_payroll_security.test.js`, `tests/unit_upload_security.test.js`, `docs/`.
- **Test Evidence**: **135/135 automated security and unit tests passing with zero failures** across 13 test suites.
- **Client Build Evidence**: Vite production build succeeded with **0 errors** (3,111 modules transformed in 42.16s).
- **Remote Push Status**: ZERO pushes to remote. ZERO commits to `main`. ZERO operations against production database.
- **Setup Status**: `D:\bjk-secrets\staging.env` and `staging-scripts.env` created by Owner. `seed-accounts.csv` (48 accounts) delivered. Awaiting Owner confirmation of `D:\Projects\bjk-healthcare`.

---

## 2. Hard Gates Status (Master Prompt Section 3)

| Gate ID | Description | Status | Requirements to Clear |
| :--- | :--- | :---: | :--- |
| **G1-FIX** | Hotfix Security Fixes Review (T1 Working Tree) | **PENDING OWNER REVIEW** | Owner reviews full diffs and test output for T1a–T1g: `APPROVED G1-FIX` |
| **G2-1** | Fresh Production Backup Verification | **PENDING OWNER REVIEW** | Evidence submitted: `bjk_production_backup_20261013T101342Z.archive.gz` (553,453 bytes, SHA-256 `2D71D0E66B38B32B2A87DEEE2C0D5B483856BB8C55BF4D2FBB25121CCDFA6764`), restore tested (16,270 docs, 129 collections, 505 indexes). Pending Owner: `APPROVED G2-1` |
| **G2-2** | Dedicated Staging Database Isolation | **BLOCKED** | Provision `bjk_healthcare_staging` with isolated user; test non-production guard refusal of production DB |
| **G2-3** | Environment Secrets Setup | **BLOCKED** | New `JWT_SECRET` (32+ chars) set on all hosts; `BIOMETRIC_WEBHOOK_SECRET` set |
| **G2-4** | Incident Check & Topology | **BLOCKED** | Atlas audit query counts (anonymous admin check), `db.users.distinct('role')`, hosting topology confirmation |
| **G2-5** | Admin Password Rotation | **BLOCKED** | System owner changes default admin and executive passwords directly |
| **G3-R1** | Deploy Release 1 to Production | **BLOCKED** | Ships R+ (`b12215b`), R2 (`09d9be5`), B8 (`f65a38a`), T1a, T1b together after G2 clearance |
| **G3-R2** | Deploy Release 2 to Production | **BLOCKED** | Ships B7 (`3b534f6`), T1c, T1f (biometric webhook & trust proxy) |
| **G3-R3** | Deploy Release 3 to Production | **BLOCKED** | Ships A (`7bf6e5b`), T1d, T1e, T1g (safety guards, leave defaults, preflight) |
| **G3-MERGE**| Merge Release Branches to Main | **BLOCKED** | Fast-forward merge verified release branches into `main` and tag `hotfix-deployed` |
| **G4** | Systematic Password Rotation | **BLOCKED** | Owner runs `ownerRunPasswordReset.js` (`--detect-defaults`, `--dry-run`, `--production`) |
| **G5** | Git History Purge | **BLOCKED** | Owner runs `git filter-repo` on mirror clone to eliminate historical spreadsheets |
| **G6** | Next.js Migration Branch Creation | **BLOCKED** | Tag `pre-nextjs-migration`, branch `migration/nextjs`, rename folder `bjk-healthcare` |

---

## 3. Evidence Pointers & Test Verification (135/135 Tests Passing)

### Automated Test Suites (`node --test`):
1. `tests/unit_role_hierarchy.test.js`: **9/9 passing** (RBAC 30 roles, rank direction, `PROTECTED_ROLES` covers finance/payroll, `canManageCredentials`, `canAssignRole`, secure password generator)
2. `tests/unit_role_drift.test.js`: **3/3 passing** (All canonical roles exist in `ROLE_HIERARCHY`, legacy aliases resolve, static scan of entire client/server has 0 undefined `ROLES.*` usages)
3. `tests/unit_trust_proxy.test.js`: **6/6 passing** (Prod default 1, non-prod default false, numeric/boolean/subnet options, client IP resolution via X-Forwarded-For)
4. `tests/unit_route_level_security.test.js`: **7/7 passing** (Route tests on 3 biometric endpoints: 401 on wrong secret, 200 on valid secret, 503 when unset in prod; dev passwords rejected in prod on admin/employee login routes; dummy OTP 123456 rejected)
5. `tests/unit_controller_security.test.js`: **10/10 passing** (`resetEmployeePassword` authorization, protected role denial, self-reset block, audit failure abort 500, `sanitizeForManager`, `sanitizeForFinance`, `updateEmployeeRole` hierarchy)
6. `tests/unit_rplus_real_db.test.js`: **6/6 passing** (Real `User`, `Employee`, `UserSession` schemas in MongoMemoryServer: identical reset fields login, revocation schema fields, `protect` 401 on revoked session, `protect` 403 on stale JWT role, DB unchanged on audit failure, 409 Conflict, allow-list projections)
7. `tests/unit_r2_security.test.js`: **2/2 passing** (Dev password rejected in production, strict bcrypt compare, HTTP login endpoint reject)
8. `tests/unit_b7_security.test.js`: **4/4 passing** (Biometric webhook: missing/wrong secret header returns 401, unset in prod returns 503, valid secret returns 200, timing-safe compare)
9. `tests/unit_safety_guards.test.js`: **27/27 passing** (`requiredEnv` child process exit codes, `safetyGuards` production database block, URI parser edge cases)
10. `tests/unit_group_a_behaviour.test.js`: **13/13 passing** (Payroll batch delete reasons/status locks, canteen reset permissions/tokens, demo OTP absence in prod, database topology closure, dashboard/AI query 401 auth, leave ledger zero-write default)
11. `tests/unit_bank_payroll_security.test.js`: **15/15 passing** (Bank details masking & encryption, payroll authorization, zero salary fallback, finance/payroll audit trails)
12. `tests/unit_upload_security.test.js`: **28/28 passing** (Path traversal mitigation, extension blacklist [.xlsx, .csv, .env, .json], token auth, role-based document access control)
13. `tests/unit_anonymize_staging.test.js`: **5/5 passing** (Production guard refusal, default-deny collection whitelist, PII scrubbing, numeric fake bank accounts, 0 residual PII scan)

**Total**: **135/135 automated security and unit tests passing with zero failures**

---

## 4. Operational & Architecture Decisions

1. **Release Grouping (Master Prompt Problem 1)**:
   - Release 1 consolidates R+ (`b12215b`), R2 (`09d9be5`), B8 (`f65a38a`), T1a, and T1b. Shipping R+ and R2 together ensures that accounts reset during lockout remediation cannot be accessed via developer bypass credentials.
   - Release 2 deploys B7 (`3b534f6`) with T1c and T1f when the physical biometric device sends the secret header.
   - Release 3 deploys Group A (`7bf6e5b`) with T1d, T1e, and T1g once `JWT_SECRET` is confirmed on all hosts.
2. **Employee Authentication Strategy (Master Prompt Problem 3, T1e)**:
   - Live Employee UI (`EmployeeLogin.jsx`) uses **Email/Employee ID + Password** login.
   - Mobile OTP endpoints (`send-otp` / `verify-otp`) lack SMS/email carrier integration (no DLT entity/template registered in India). In production, demo OTPs are suppressed.
   - Retain password-based authentication with HR-assisted reset via secure random temporary passwords (`mustChangePassword: true`) for live operations.
3. **Canonical Role Hierarchy & Drift (Master Prompt Problem 4, T1b)**:
   - 30 canonical roles in `rbac.js` are preserved. Legacy aliases (`ADMIN`, `HR`, `FINANCE`, `PAYROLL_OFFICER`, etc.) map to canonical equivalents. Zero undefined `ROLES.*` references exist in code.

---

## 5. Owner Actions Required (Gates G1-FIX & G2)

1. **Gate G1-FIX**: Review full diffs for T1a–T1g and reply `APPROVED G1-FIX`.
2. **Gate G2-1 (Backup)**: Evidence complete (archive `bjk_production_backup_20261013T101342Z.archive.gz` + SHA-256 + restore test verified). Reply `APPROVED G2-1`.
3. **Gate G2-2 (Staging)**: Provision `bjk_healthcare_staging` with its own isolated database user.
4. **Gate G2-3 (Secrets)**: Set new `JWT_SECRET` (32+ chars) on all hosts before any push.
5. **Gate G2-4 (Incident & Topology)**: Run mongosh incident check queries and confirm topology.
6. **Gate G2-5 (Admin Passwords)**: Directly change default administrative and executive passwords.

---

## 6. Next Immediate Action & NEXT Pointer

**NEXT:** Await Owner approval of Gate G1-FIX (`APPROVED G1-FIX`) and Gate G2-1 (`APPROVED G2-1`). Continue authorized gate-free preparatory tasks. Zero remote pushes, zero production modifications.
