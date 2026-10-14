# Migration Changelog: BJK Healthcare Digital Brain

All migration modifications, configurations, and structural changes are logged here in chronological order.

## [Track 1 Working Tree - Pending Gate G1-FIX] - 2026-10-13

### Added
- `BJK HELTHCARE/server/scripts/preflightCheck.js`: Read-only preflight check inspecting required environment variables and flagging forbidden production flags by name and length only.
- `BJK HELTHCARE/server/tests/unit_role_drift.test.js`: Comprehensive role scan testing canonical roles, alias mapping, and verifying 0 undefined `ROLES.*` usages in client and server.
- `BJK HELTHCARE/server/tests/unit_trust_proxy.test.js`: Express trust proxy configuration tests covering production default (1), non-production default (false), and custom `TRUST_PROXY_HOPS` settings.
- `BJK HELTHCARE/server/tests/unit_route_level_security.test.js`: In-process HTTP route tests for all 3 biometric webhook routes, dev-password login rejection in production, and zero OTP dummy bypass.
- `BJK HELTHCARE/server/tests/unit_group_a_behaviour.test.js`: Full behaviour tests for payroll batch deletion, canteen reset permissions, demo OTP absence, database topology closure, dashboard/AI query auth, and leave ledger zero-write defaults.

### Changed
- `BJK HELTHCARE/server/config/rbac.js`: Added `FINANCE_MANAGER`, `PAYROLL_OFFICER`, `ACCOUNTS_EXECUTIVE` to `PROTECTED_ROLES`; added `ROLE_ALIASES` and `normalizeRoleString`; updated `canManageCredentials` and `canAssignRole` to strictly prevent `HR_MANAGER` from resetting or re-roling finance/payroll accounts.
- `BJK HELTHCARE/server/controllers/authController.js`: Fixed role drift reference from undefined `ROLES.ADMIN` to canonical `ROLES.SUPER_ADMIN`.
- `BJK HELTHCARE/server/routes/hrRoutes.js` & `hrmsRoutes.js`: Removed undefined `ROLES.HR` and raw `'ADMIN'` from `requireHRRole`.
- `BJK HELTHCARE/server/server.js`: Implemented configurable `TRUST_PROXY_HOPS` via `resolveTrustProxy()`.
- `BJK HELTHCARE/server/tests/unit_r2_security.test.js`: Redacted compromised default password string from test name and replaced candidate test string with non-default candidate.

---

## [Hotfix Commits on hotfix/security] - 2026-10-12

### Commit 7bf6e5b (Group A)
- **Title**: `fix(security): Group A environment validation, database safety guards, cold-start gating, canteen reset protection, leave defaults, and payroll deletion controls`
- **Scope**: Added `requiredEnv.js` (JWT_SECRET >= 32 chars, MONGODB_URI), `safetyGuards.js` (production database guard), gated auto-init in production, protected canteen data reset endpoint, eliminated automatic CSV sync on missing leave ledgers, enforced reason & lock checks on payroll batch deletion.

### Commit 3b534f6 (Group B7)
- **Title**: `fix(security): B7 biometric webhook secret header, rate limiting, and trust proxy`
- **Scope**: Added secret header validation to biometric endpoints, timing-safe equality comparison, 503 fail-closed in production if secret is unset, and dedicated rate limiter.

### Commit f65a38a (Group B8)
- **Title**: `fix(security): B8 block bulk employee import in production`
- **Scope**: Blocked unauthenticated/bulk employee import in production mode.

### Commit 09d9be5 (Group R2)
- **Title**: `fix(security): R2 eliminate production login password bypass and enforce strong passwords`
- **Scope**: Removed universal dev password bypass in production; enforced strict bcrypt authentication; integrated strong random password generator.

### Commit b12215b (Group R+)
- **Title**: `fix(security): R+ role hierarchy, credential management, allow-list projections, strict audit, and authenticated credential export`
- **Scope**: Defined 30 canonical roles in `rbac.js`; numerical role hierarchy; protected roles; strict audit logging requirements; allow-list projections (`sanitizeForManager`, `sanitizeForFinance`).

---


## [Phase 3A Revision] - 2026-10-12: Immediate Security Remediation (Round 2)

### Added
- `BJK HELTHCARE/server/config/requiredEnv.js`: Fail-fast startup validation for `JWT_SECRET` (>=32 chars) and `MONGODB_URI` without printing values.
- `BJK HELTHCARE/server/config/safetyGuards.js`: Centralized safety guard module replacing copy-pasted implementations; enforces `NODE_ENV !== 'production'`, exact `SEED_ALLOWED_DB` match, and forbids production database names.
- `BJK HELTHCARE/server/scripts/ownerRunPasswordReset.js`: Owner-only emergency random password rotation script with `--confirm`, `--dry-run`, zero password printing, and audit logging.

### Updated
- `docs/migration/MIGRATION_RISK_REGISTER.md`: Appended risks P35 (Admin/system accounts reset on boot), P36 (Boot-time data dependencies), P37 (Reset/wipe endpoints unreviewed), P38 (Password rotation pending).
- `docs/migration/phase-2/NEXTJS_MIGRATION_PLAN.md`: Reordered Phase 5 module migration waves to 1, 3, 2, 4, 6, 5; added review buffers to estimates; set Phase 7 auth to httpOnly cookie JWT (rejecting Next-Auth); set Phase 9 storage to AWS S3 ap-south-1 (rejecting Vercel Blob); and pinned standalone host retirement to explicit written owner approval.
- `docs/migration/phase-2/NEXTJS_ARCHITECTURE.md`: Pinned storage architecture to AWS S3 in `ap-south-1` and auth to `httpOnly Secure SameSite=Lax` cookies.
- Server seed and migration scripts: Gated with shared `safetyGuards.js`.

---

## [Phase 2] - 2026-10-11: Architecture & Migration Planning (No Code Changes)

### Added
- `docs/migration/phase-2/NEXTJS_ARCHITECTURE.md`: Target directory layout, folder rename proposal, dependency version matrix, storage/scheduler evaluation, and security remediation track.
- `docs/migration/phase-2/NEXTJS_MIGRATION_PLAN.md`: 6-wave migration roadmap, effort estimates, and rollback strategy.
- `docs/migration/phase-2/ROUTE_MIGRATION_MAP.md`: Mapping of 100+ legacy routes to App Router file paths, route groups, and 301 redirects.
- `docs/migration/phase-2/API_COMPATIBILITY_PLAN.md`: A/B/C/D classification for all 55 route modules and contract testing methodology.

### Updated
- `docs/migration/phase-0/PHASE_0_SAFETY_REPORT.md`: Added ERRATA section correcting the Git history spreadsheet findings (P30).
- `docs/migration/MIGRATION_RISK_REGISTER.md`: Appended risks P30 (Spreadsheets in Git history), P31 (Fallback JWT secrets), P32 (Default passwords), P33 (`server.js` auto-init), and P34 (Undocumented scope).
- `docs/migration/TEST_EVIDENCE.md`: Added evidence for branch refs containing `ee66879`, `.gitignore` timeline, and auto-init execution conditions.
- `docs/migration/PHASE_STATUS.md`: Marked Phase 2 Completed (Awaiting Approval).

### Changed
- None (Phase 2 is strictly planning; no application code or configurations were modified).

### Reverted
- None (zero out-of-scope changes detected).

---

## [Phase 1] - 2026-10-11: Full Codebase Audit (Static Read-Only)

### Added
- `docs/migration/phase-1/NEXTJS_MIGRATION_BASELINE.md`: Technology stack comparison, architecture decisions, and resolutions for all documented inconsistencies (1–8).
- `docs/migration/phase-1/CURRENT_ARCHITECTURE_MAP.md`: System topology, component hierarchy, service catalog, and auto-init seed analysis.
- `docs/migration/phase-1/ROUTE_AND_FEATURE_INVENTORY.md`: Comprehensive inventory of 100+ React Router pages, portal layouts, and RBAC guards.
- `docs/migration/phase-1/API_AND_DATABASE_INVENTORY.md`: Catalog of 55 route modules, 66 controllers, and 97 Mongoose models.
- `docs/migration/phase-1/VERCEL_DEPLOYMENT_AUDIT.md`: Analysis of serverless function wrapper, SPA rewrite conflicts, and runtime duration limits.

### Updated
- `docs/migration/MIGRATION_RISK_REGISTER.md`: Updated all issues P1–P29 with verified code evidence and consistent `VERIFIED` labels.
- `docs/migration/TEST_EVIDENCE.md`: Added exact outputs from `git rev-list`, git history secrets scan, and hardcoded credentials line scan.
- `docs/migration/PHASE_STATUS.md`: Marked Phase 1 Complete (Awaiting Approval).

### Changed
- None (Phase 1 is strictly static read-only; zero application code, configurations, or dependencies were altered).

### Reverted
- None (zero out-of-scope changes detected).

---

## [Phase 0] - 2026-10-11: Safety & Initial Audit

### Added
- `docs/migration/phase-0/PHASE_0_SAFETY_REPORT.md`: Baseline safety and repository audit report covering Git status, remote tracking, commit history, lockfiles, runtime parameters, secrets scan, deployment configurations, and backup status.
- `docs/migration/PHASE_STATUS.md`: Phase status tracking document.
- `docs/migration/CHANGELOG_MIGRATION.md`: Chronological log of migration actions.
- `docs/migration/MIGRATION_RISK_REGISTER.md`: Issue and risk register mapped to problems P1–P29.
- `docs/migration/TEST_EVIDENCE.md`: Verification and test evidence tracker.
