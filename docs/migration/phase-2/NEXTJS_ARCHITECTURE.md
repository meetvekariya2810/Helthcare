# Next.js Target Architecture: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Phase:** Phase 2 (Architecture & Planning — No Code Changes)  
**Status:** PROPOSED FOR OWNER APPROVAL  

---

## 1. Target Directory & Modular Monolith Architecture

The target architecture is a **modular monolith** built on **Next.js App Router + TypeScript**, preserving all business rules, branding tokens, database schemas, and permissions without introducing unnecessary microservice complexity.

```
/ (Repository Root)
├── package.json                   # Consolidated single root workspace package
├── tsconfig.json                  # Strict TypeScript configuration
├── next.config.js                 # App Router, image domains, serverExternalPackages
├── tailwind.config.js             # 100% preserved BJK brand tokens, colors & typography
├── postcss.config.js              # PostCSS autoprefixer
├── vercel.json                    # Native Next.js preset, Vercel Cron jobs, headers
├── .env.example                   # Master environment template (public & secret separation)
├── .gitignore                     # Bulletproof exclusion of credentials, .env, backups
│
├── docs/migration/                # Uncommitted migration audit and phase tracking records
│
└── src/
    ├── app/                       # Next.js App Router (File-System Routing)
    │   ├── layout.tsx             # Root HTML, fonts (Inter/Outfit), metadata
    │   ├── error.tsx              # Global crash boundary (replaces client ErrorBoundary)
    │   ├── loading.tsx            # Global suspense fallback spinner
    │   ├── not-found.tsx          # Branded pharmaceutical 404 page
    │   │
    │   ├── (public)/              # Public & Verification Routes
    │   │   ├── page.tsx           # Redirects to /login
    │   │   ├── verify/
    │   │   │   └── employee/[code]/page.tsx  # QR Employee ID card public verification
    │   │   └── verify-id/[code]/page.tsx     # Shortcode verification
    │   │
    │   ├── (auth)/                # Authentication Route Group
    │   │   ├── layout.tsx         # Auth centered card layout with BJK logo
    │   │   ├── login/page.tsx     # Director / Admin / Management login
    │   │   ├── employee/
    │   │   │   ├── login/page.tsx # Dedicated Employee Self-Service login
    │   │   │   └── change-password/page.tsx  # Permanent password creation
    │   │   ├── canteen/login/page.tsx # Dedicated Canteen operator login
    │   │   └── change-password/page.tsx
    │   │
    │   ├── (dashboard)/           # Central Management & Operations Portal
    │   │   ├── layout.tsx         # MainLayout with Role Sidebar & Header
    │   │   ├── dashboard/         # Department Dispatcher & 12 Department Dashboards
    │   │   │   ├── page.tsx       # Dispatcher
    │   │   │   ├── hr/page.tsx
    │   │   │   ├── production/page.tsx
    │   │   │   ├── quality-control/page.tsx
    │   │   │   ├── quality-assurance/page.tsx
    │   │   │   ├── warehouse/page.tsx
    │   │   │   ├── engineering/page.tsx
    │   │   │   ├── finance/page.tsx
    │   │   │   ├── procurement/page.tsx
    │   │   │   ├── regulatory/page.tsx
    │   │   │   ├── sales/page.tsx
    │   │   │   ├── microbiology/page.tsx
    │   │   │   └── facilities/page.tsx
    │   │   ├── operations/page.tsx
    │   │   ├── factory/page.tsx
    │   │   ├── production/page.tsx
    │   │   ├── quality/
    │   │   │   ├── qc/page.tsx
    │   │   │   └── qa/page.tsx
    │   │   ├── regulatory/page.tsx
    │   │   ├── inventory/page.tsx
    │   │   ├── crm/page.tsx
    │   │   ├── export/page.tsx
    │   │   ├── finance/page.tsx
    │   │   ├── documents/page.tsx
    │   │   ├── products/page.tsx  # 111-Product Catalogue
    │   │   ├── ai/page.tsx        # Platform Operations AI
    │   │   ├── modules/page.tsx
    │   │   ├── audit-logs/page.tsx# 21 CFR Part 11 Electronic Signature Logs
    │   │   ├── admin/database/page.tsx
    │   │   └── hrms/              # Master HRMS Modules
    │   │       ├── dashboard/page.tsx
    │   │       ├── employees/
    │   │       │   ├── page.tsx
    │   │       │   ├── create/page.tsx
    │   │       │   └── [id]/page.tsx
    │   │       ├── onboarding/page.tsx # 12-Stage Guided Wizard
    │   │       ├── attendance/
    │   │       │   ├── page.tsx
    │   │       │   ├── command-center/page.tsx
    │   │       │   └── reports/page.tsx
    │   │       ├── shifts/page.tsx
    │   │       ├── rostering/page.tsx
    │   │       ├── leave/page.tsx
    │   │       ├── payroll/page.tsx
    │   │       ├── id-cards/page.tsx
    │   │       ├── recruitment/page.tsx
    │   │       ├── training/page.tsx
    │   │       ├── credentials/page.tsx
    │   │       ├── assets/page.tsx
    │   │       ├── expenses/page.tsx
    │   │       ├── analytics/page.tsx
    │   │       ├── automation/page.tsx
    │   │       ├── compliance/page.tsx
    │   │       ├── copilot/page.tsx
    │   │       ├── settings/page.tsx
    │   │       ├── login-credentials/page.tsx
    │   │       └── access-audit/page.tsx
    │   │
    │   ├── (employee)/            # Employee Self-Service Portal
    │   │   ├── layout.tsx         # Dedicated EmployeeLayout with mobile bottom nav
    │   │   ├── employee/
    │   │   │   ├── dashboard/page.tsx
    │   │   │   ├── calendar/page.tsx
    │   │   │   ├── profile/page.tsx
    │   │   │   ├── id-card/page.tsx
    │   │   │   ├── attendance/page.tsx
    │   │   │   ├── attendance-face/page.tsx
    │   │   │   ├── shift/page.tsx
    │   │   │   ├── leave/page.tsx
    │   │   │   ├── tasks/page.tsx
    │   │   │   ├── payroll/page.tsx
    │   │   │   ├── documents/page.tsx
    │   │   │   ├── training/page.tsx
    │   │   │   ├── policies/page.tsx
    │   │   │   ├── team/page.tsx
    │   │   │   ├── notifications/page.tsx
    │   │   │   ├── support/page.tsx
    │   │   │   ├── canteen/page.tsx
    │   │   │   └── settings/page.tsx
    │   │
    │   ├── (canteen)/             # Dedicated Canteen Management Portal
    │   │   ├── layout.tsx         # CanteenLayout
    │   │   └── canteen/
    │   │       ├── dashboard/page.tsx
    │   │       ├── today/page.tsx
    │   │       ├── employees/page.tsx
    │   │       ├── daily/page.tsx
    │   │       ├── monthly/page.tsx
    │   │       ├── department/page.tsx
    │   │       ├── export/page.tsx
    │   │       └── settings/page.tsx
    │   │
    │   └── api/                   # Thin Next.js Route Handlers
    │       ├── health/route.ts
    │       ├── auth/
    │       │   ├── login/route.ts
    │       │   ├── logout/route.ts
    │       │   └── me/route.ts
    │       ├── employee/auth/login/route.ts
    │       └── hrms/
    │           ├── attendance/biometric/route.ts  # Biometric Hardware Webhook
    │           ├── automation/run-eval/route.ts   # Vercel Cron Trigger
    │           └── reports/export/route.ts
    │
    ├── components/                # Reusable UI Components
    │   ├── ui/                    # Base primitives (Button, Modal, Input, Badge, Table)
    │   ├── layout/                # Sidebar, Header, UserMenu, NotificationBell
    │   ├── employee/              # Employee navigation, PunchClock, LeaveCards
    │   ├── canteen/               # MealCounter, BarcodeScanner
    │   └── hr/                    # OnboardingStepper, EmployeeReview, BankForm
    │
    ├── lib/                       # Core Foundation Utilities (Server & Client)
    │   ├── db.ts                  # Server-only cached global Mongoose connection
    │   ├── auth.ts                # JWT cookie verification & session extraction
    │   ├── cookies.ts             # httpOnly SameSite secure cookie management
    │   ├── validation.ts          # Zod schema definitions for API inputs
    │   ├── env.ts                 # Zod validated environment variables
    │   └── utils.ts               # Date formatters, currency, number masking
    │
    ├── server/                    # Backend Logic Layer
    │   ├── models/                # 97 Mongoose models ported with exact schema names
    │   ├── services/              # Pure business logic services (Payroll, PDF, Excel, Leave)
    │   │   ├── statutoryPayrollEngine.ts
    │   │   ├── leavePolicyService.ts
    │   │   ├── workforceCalendarService.ts
    │   │   ├── pdfService.ts      (PDFKit in Node runtime)
    │   │   ├── excelReportService.ts (ExcelJS in Node runtime)
    │   │   ├── copilotService.ts  (13-policy internal NLP engine)
    │   │   ├── bankDetailsService.ts
    │   │   └── storageService.ts  (Persistent object storage adapter)
    │   ├── repositories/          # Mongoose database queries
    │   └── policies/              # Server-side RBAC & data scoping
    │       ├── rbac.ts            # 30-role hierarchy & action permissions
    │       └── dataScope.ts       # Employee/Dept/Plant data isolation
    │
    └── types/                     # TypeScript declarations
        ├── auth.d.ts
        ├── employee.d.ts
        ├── hrms.d.ts
        └── models.d.ts
```

---

## 2. Directory Renaming Proposal (P3)

- **Observed Problem:** The current inner directory `BJK HELTHCARE` contains a leading space and a typo (`HELTHCARE`). Scripts must use `--prefix "BJK HELTHCARE"`, which creates quoting hazards across Windows and Linux shells.
- **Proposal:** In Phase 3, execute a clean Git rename:
  ```bash
  git mv "BJK HELTHCARE" bjk-healthcare
  ```
- **Updates Required:**
  1. Root `package.json` scripts: replace `"BJK HELTHCARE"` with `bjk-healthcare`.
  2. Vercel project Root Directory setting: updated if configured to subfolder.
  3. `api/handler.cjs`: update relative require path.
- **Safety Gate:** This proposal will only be executed on branch `migration/nextjs` after explicit owner approval.

---

## 3. Dependency Version Plan & Compatibility Matrix

To avoid dependency conflicts and unpinned runtime unknowns (`P4`, `P26`), the following exact versions are specified:

| Package | Current Version | Target Version | Compatibility Rationale |
|---|---|---|---|
| **next** | N/A | `14.2.23` | Stable App Router LTS; proven Vercel reliability, full React 18 support |
| **react** | `18.3.1` | `18.3.1` | Preserves all existing React 18 hooks, Recharts, and UI libraries |
| **react-dom** | `18.3.1` | `18.3.1` | Matches React core |
| **typescript** | N/A | `^5.4.5` | Standard TypeScript engine |
| **tailwindcss** | `3.4.17` | `3.4.17` | Preserved identically to eliminate visual design drift (`P23`) |
| **lucide-react**| `0.475.0` | `0.475.0` | Preserved identically for UI icons |
| **mongoose** | `8.9.5` | `8.9.5` | Preserves all 97 schema types and aggregation pipelines |
| **zod** | N/A | `^3.23.8` | Type-safe environment and Route Handler input validation |
| **bcryptjs** | `2.4.3` | `2.4.3` | Identical password hash generation and verification |
| **jsonwebtoken**| `9.0.2` | `9.0.2` | Identical token signing and verification |
| **pdfkit** | `0.20.2` | `0.20.2` | Server-only PDF generation (`export const runtime = 'nodejs'`) |
| **exceljs** | `4.4.0` | `4.4.0` | Server-only Excel report generation (`export const runtime = 'nodejs'`) |
| **recharts** | `2.15.0` | `2.15.0` | Analytics and dashboard charts (wrapped in Client Components) |

### Node.js Engine Pinning (`P26`)
In root `package.json`:
```json
"engines": {
  "node": ">=18.18.0 <21.0.0",
  "npm": ">=9.0.0"
}
```

### Authentication Architecture (`P7`, `P10`) - Phase 7
- **Retain Core Security:** Keep existing **JWT + bcrypt + RBAC 30-role system**.
- **Explicit Prohibition:** **Do NOT use Next-Auth.**
- **Token Transport:** Move session tokens from `localStorage` to **`httpOnly Secure SameSite=Lax` cookies** for seamless SSR and Next.js middleware verification.

---

## 4. Persistent Storage Architecture (AWS S3 in ap-south-1) (P15)

Because Vercel serverless functions execute on an ephemeral read-only filesystem, `multer.diskStorage` to `server/uploads/` is replaced with **AWS S3** object storage:

- **Target Provider:** AWS S3 (Standard)
- **AWS Region:** `ap-south-1` (Mumbai, India) — Ensures compliance with Indian pharmaceutical data residency and minimal plant latency.
- **Bucket Configuration:** Private bucket (zero public access allowed).
- **Access Model:** Presigned Signed URLs (temporary PUT for uploads, temporary GET for viewing/downloading authorized documents).
- **Explicit Prohibition:** **Do NOT use Vercel Blob.**

---

## 5. Background Jobs & Scheduler Evaluation (P17)

The application requires periodic execution for:
- 30/60/90-day credential expiry notifications
- Daily leave accrual calculations
- Daily attendance missing punch alerts
- Monthly payroll auto-generation

| Option | Architecture | Reliability | Cost | Recommendation |
|---|---|---|---|---|
| **Vercel Cron Jobs** | Configured in `vercel.json` calling protected API Route Handlers | High; built-in to Vercel deployment | Free on Hobby (1 job/day) / Included on Pro | **(Recommended)** Zero infrastructure overhead |
| **Upstash QStash** | Serverless message queue with cron scheduling | Very high; retry queues and dead-letter | Free tier (500 msg/day) | Excellent for decoupled job retries |
| **Dedicated Worker** | Standalone Node.js process on Render/Railway | High; continuous interval process | ~$7/month per worker instance | Best if jobs exceed 300s timeout limits |

*Recommendation:* **Vercel Cron Jobs** triggering `/api/cron/evaluate-rules` and `/api/cron/expiry-alerts` with `CRON_SECRET` authorization.

---

## 6. Security Remediation Track (Pre-Phase 3 Gate)

Before any code is committed on `migration/nextjs` in Phase 3, the following security controls must be completed:

### 6.1 Git History Spreadsheet Purge Options (P30)
*Owner Decision Required — History will NOT be rewritten without explicit instruction:*
- **Option 1: Complete History Purge via `git-filter-repo` (Recommended):**  
  Purges `BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx` and `BJK_Employee_Login_Credentials.xlsx` from historical commit `ee66879282a1` across all commits.  
  *Risk:* Rewrites Git commit hashes. Requires force-pushing `main` and all collaborators to re-clone.
- **Option 2: Cut Isolated Clean Migration Branch from Baseline:**  
  Create `migration/nextjs` from current clean commit without modifying `main` history. Purge history only on the migration branch.  
  *Risk:* Old history on `main` still retains historical commits unless rotated.
- **Option 3: Retain History & Rotate All Credentials Immediately:**  
  Leave Git history untouched. Treat all passwords in the two spreadsheets as compromised. Execute a mandatory password rotation for all accounts, invalidate existing sessions, and rotate all JWT secrets.  
  *Risk:* Spreadsheets remain visible to anyone with repository clone access, but credentials inside are neutralized.

### 6.2 Pre-Phase 3 Security Remediation Checklist
1. **Immediate Credential Rotation:** Generate new temporary random passwords for all administrative, manager, and employee accounts; force `mustChangePassword: true` on next login.
2. **Fail-Fast JWT Configuration (P31):** Remove all 10 fallback strings in code. Replace with strict assertion:
   ```javascript
   if (!process.env.JWT_SECRET) {
     throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing.');
   }
   ```
3. **Decouple `server.js` Auto-Init (P33):** Eliminate the automatic seed/sync block on cold starts. Relocate to explicit, manual admin CLI tools (`scripts/admin-sync.js`) that refuse to run without `--confirm-action`.
4. **Seed Script Production Guards (P14):** Inject fail-fast check refusing to run when `NODE_ENV === 'production'` or when target URI matches production.
5. **README Sanitization (P6):** Replace live Atlas cluster host with `<cluster-host>` placeholder.
