# Next.js Migration Baseline: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Audit Mode:** Static Read-Only Analysis (Phase 1)  
**Status:** COMPLETE (Phase 1)  

---

## 1. Executive Summary & Baseline Objectives

This document establishes the verified technical baseline for migrating the enterprise platform from its current hybrid React 18 + Vite SPA and Express backend to **Next.js App Router + TypeScript on Vercel**.

Every architectural finding in this document was extracted through static code analysis of the active repository. In strict adherence to safety protocols, no seed scripts, test commands, or database servers were run during Phase 1.

---

## 2. Verified Technology Stack Comparison

| Tier | Current Implementation (Verified from Code) | Target Architecture (Next.js App Router) | Migration Strategy |
|---|---|---|---|
| **Framework** | React 18.3.1 + Vite 5.4.11 SPA | Next.js 14/15 App Router (`src/app`) | Port pages into Route Groups: `(public)`, `(auth)`, `(employee)`, `(canteen)`, `(dashboard)` |
| **Language** | Vanilla JavaScript (ESM in client, CJS in server) | TypeScript (`strict: true`) | Progressive typing with Zod schemas for validation |
| **Styling** | TailwindCSS 3.4.17 + PostCSS + Lucide Icons | TailwindCSS 3.4.x (preserve tokens, colours, fonts) | Direct reuse of brand tokens, palette, and assets |
| **Routing** | React Router DOM v6.28.1 (1,240 lines in `App.jsx`) | Next.js File-system App Router | Map client routes to nested server/client pages |
| **Server Runtime** | Node.js Express 4.21.2 (`server.js`, 450 lines) | Next.js Route Handlers (`app/api/**/route.ts`) + Node | Option B: Maintain existing Express host during migration; convert to Route Handlers progressively |
| **Database ODM** | Mongoose 8.9.5 (`models/index.js`, 97 models) | Mongoose 8.9.x with cached serverless connection | Server-only cached global connection (`lib/db.ts`) |
| **Authentication** | JWT (`jsonwebtoken` 9.0.2) + `bcryptjs` in `localStorage` | JWT + httpOnly Secure SameSite Cookies + Middleware | Transition token storage from client `localStorage` to secure server cookies |
| **Authorization** | Dual RBAC: UI `PermissionRoute` + Server `rbac.js` (30 roles) | Next.js Middleware route guard + server `requirePermission` | Preserve 30-role hierarchy and granular action permissions |
| **File Generation** | PDFKit 0.20.2, ExcelJS 4.4.0, docx 9.7.2 | Node runtime Route Handlers (`export const runtime = 'nodejs'`) | Port generator services to `src/server/services` unchanged |
| **File Storage** | Multer 1.4.5 (`diskStorage` to `server/uploads/`) | Persistent Object Storage (Cloudflare R2 / S3 / Vercel Blob) | Migrate file uploads away from ephemeral serverless disk |
| **Automation & Jobs**| On-demand endpoint `/api/hrms/automation/run-eval` | Vercel Cron Jobs (`vercel.json`) | Call existing evaluator via authenticated cron triggers |
| **AI Copilot** | Internal Deterministic Knowledge Engine (`POLICY_KNOWLEDGE`) | Server-side RAG Service (`src/server/services/copilotService`) | Preserve local NLP logic without external API costs |

---

## 3. Discovered Inconsistencies & Verifications (Section 3.2 Resolution)

1. **Deployment Model (Inconsistency 1):**  
   - *Observation:* `README.md` documents Render/Railway backend with Vercel frontend, while root `vercel.json` routes `/api` into a serverless handler (`api/index.js` -> `api/handler.cjs`).  
   - *Verification:* Express is wrapped in `api/handler.cjs` with `process.env.VERCEL = '1'`. However, `server.js` contains a massive auto-init seed sequence (lines 50–150) that runs only when `VERCEL !== '1'`.  
   - *Resolution:* Adopt **Option B** (keep existing Express server running for unmigrated endpoints, migrate APIs incrementally to Next.js Route Handlers).

2. **Route Prefixes `/hr/*` vs `/hrms/*` (Inconsistency 2):**  
   - *Observation:* Previous documentation was ambiguous regarding whether HR or HRMS was the primary route prefix.  
   - *Verification:* Static inspection of `App.jsx` confirms BOTH prefixes are registered in parallel as aliases to the same component pages (e.g. `/hr/employees` and `/hrms/employees`).  
   - *Resolution:* In Next.js App Router, standardize on `/hrms/*` as the canonical path and implement permanent 301 redirects for `/hr/*` paths to maintain backwards compatibility.

3. **Onboarding Steps (Inconsistency 3):**  
   - *Observation:* Document claims varied between a 10-step checklist and an 11-step wizard.  
   - *Verification:* `OnboardingStepper.jsx` defines **12 distinct stages** (11 form sections: Basic Info, Job & Org, Experience, Family, Addresses, Education, Bank, Identity, Compliance, Health, Documents + 1 Review/Submission stage).  
   - *Resolution:* Maintain all 12 stages in the App Router implementation.

4. **Report Export Endpoints (Inconsistency 4):**  
   - *Observation:* Conflicts between `/api/hrms/reports/export?type=` and `/api/hrms/reports?type=`.  
   - *Verification:* `hrmsRoutes.js:L276` defines `/api/hrms/reports/export` for analytics exports. Dedicated attendance report endpoints exist at `/api/hrms/attendance/reports/excel`, `/csv`, and `/preview`. Leave reports exist at `/api/leave/reports`.  
   - *Resolution:* Preserve specific functional endpoints during API migration.

5. **`auditRoutes.js` Mounted Twice (Inconsistency 5):**  
   - *Verification:* In active `server.js`, `auditRoutes.js` is imported once on Line 19 and mounted once on Line 245 (`/api/audit`). The duplicate mention was an error in older documentation.

6. **RBAC Role Structure (Inconsistency 6 & P20):**  
   - *Observation:* Specification mentioned 5 roles, MYCO map showed 7 tiers.  
   - *Verification:* Code source of truth ([rbac.js](file:///c:/Users/Meet%20Vekariya/OneDrive/Desktop/Antigravity%20project/BJK%20HELTHCARE%2022/BJK%20HELTHCARE/server/config/rbac.js)) defines **30 specialized roles** across Executive, Manufacturing, Quality, Regulatory, HR, and Operations functions.  
   - *Resolution:* Strictly preserve the 30-role code hierarchy without widening permissions.

7. **Pharma Operations & 111-Product Catalogue (Inconsistency 7 & P29):**  
   - *Observation:* Suspected that pharmaceutical operations modules were claimed but absent.  
   - *Verification:* Real code contains full implementations for Production, Batches, Inventory, QC (LIMS), QA (QMS with CAPA/Deviations), Regulatory Dossiers, CRM, and the 111-product brochure catalogue (`products.json`).  
   - *Resolution:* All pharma modules exist and must be migrated alongside HRMS.

8. **Sensitive Data Masking (Inconsistency 8 & P22):**  
   - *Verification:* `bankDetailsService.js` provides automatic backend masking for bank accounts (`XXXX XXXX 1234`) and PAN cards (`ABCDE****F`). The list directory endpoint ALWAYS returns masked data; unmasked data requires explicit role privileges (`SUPER_ADMIN`, `DIRECTOR`, `HR_ADMIN`, `HR_MANAGER`).  
   - *Resolution:* Preserve backend masking in Route Handlers and Server Actions.
