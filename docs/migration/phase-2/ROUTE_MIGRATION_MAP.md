# Route Migration Map: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Phase:** Phase 2 (Architecture & Planning — No Code Changes)  
**Status:** PROPOSED FOR OWNER APPROVAL  

---

## 1. Route Group Architecture

Next.js App Router utilizes Route Groups (parenthesized directory names) to apply distinct root layouts without altering the public URL paths:
- `(public)`: Public verification and unauthenticated entry routes.
- `(auth)`: Centered branded authentication layout.
- `(dashboard)`: Primary enterprise application layout with collapsible 30-role sidebar and header.
- `(employee)`: Dedicated Employee Self-Service layout with mobile-first bottom navigation.
- `(canteen)`: High-contrast kiosk layout for barcode scanning and catering operators.

---

## 2. Comprehensive Route Migration & Redirect Map

| Legacy Vite / React Router Path | Target Next.js App Router Path | Route Group | Component Type | Access Level / Allowed Roles | Redirect Strategy |
|---|---|---|---|---|---|
| `/` | `src/app/(public)/page.tsx` | `(public)` | Server | Public | Redirects to `/login` |
| `/login` | `src/app/(auth)/login/page.tsx` | `(auth)` | Client | Public | None (Canonical) |
| `/change-password` | `src/app/(auth)/change-password/page.tsx` | `(auth)` | Client | Public / Token | None (Canonical) |
| `/employee/change-password` | `src/app/(auth)/employee/change-password/page.tsx` | `(auth)` | Client | Public / Token | None (Canonical) |
| `/employee/login` | `src/app/(auth)/employee/login/page.tsx` | `(auth)` | Client | Public | None (Canonical) |
| `/canteen/login` | `src/app/(auth)/canteen/login/page.tsx` | `(auth)` | Client | Public | None (Canonical) |
| `/verify/employee/:code` | `src/app/(public)/verify/employee/[code]/page.tsx` | `(public)` | Server | Public | None (Canonical) |
| `/verify-id/:code` | `src/app/(public)/verify-id/[code]/page.tsx` | `(public)` | Server | Public | None (Canonical) |
| `/canteen/dashboard` | `src/app/(canteen)/canteen/dashboard/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/today` | `src/app/(canteen)/canteen/today/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/employees` | `src/app/(canteen)/canteen/employees/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/daily` | `src/app/(canteen)/canteen/daily/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/monthly` | `src/app/(canteen)/canteen/monthly/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/department` | `src/app/(canteen)/canteen/department/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/export` | `src/app/(canteen)/canteen/export/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/canteen/settings` | `src/app/(canteen)/canteen/settings/page.tsx` | `(canteen)` | Client | `CANTEEN_ADMIN` | None (Canonical) |
| `/employee/dashboard` | `src/app/(employee)/employee/dashboard/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/calendar` | `src/app/(employee)/employee/calendar/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/profile` | `src/app/(employee)/employee/profile/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/id-card` | `src/app/(employee)/employee/id-card/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/attendance` | `src/app/(employee)/employee/attendance/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/attendance-face` | `src/app/(employee)/employee/attendance-face/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/shift` | `src/app/(employee)/employee/shift/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/leave` | `src/app/(employee)/employee/leave/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/tasks` | `src/app/(employee)/employee/tasks/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/payroll` | `src/app/(employee)/employee/payroll/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/documents` | `src/app/(employee)/employee/documents/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/training` | `src/app/(employee)/employee/training/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/policies` | `src/app/(employee)/employee/policies/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/team` | `src/app/(employee)/employee/team/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/notifications` | `src/app/(employee)/employee/notifications/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/support` | `src/app/(employee)/employee/support/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/canteen` | `src/app/(employee)/employee/canteen/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/employee/settings` | `src/app/(employee)/employee/settings/page.tsx` | `(employee)` | Client | `EMPLOYEE` tier | None (Canonical) |
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | `(dashboard)` | Server | Authenticated | None (Canonical) |
| `/dashboard/hr` | `src/app/(dashboard)/dashboard/hr/page.tsx` | `(dashboard)` | Client | HR Department | None (Canonical) |
| `/dashboard/production`| `src/app/(dashboard)/dashboard/production/page.tsx`| `(dashboard)` | Client | Production Dept | None (Canonical) |
| `/dashboard/qc` | `src/app/(dashboard)/dashboard/qc/page.tsx` | `(dashboard)` | Client | QC Department | None (Canonical) |
| `/dashboard/quality-control`| `src/app/(dashboard)/dashboard/qc/page.tsx` | `(dashboard)` | Client | QC Department | 301 Permanent Redirect to `/dashboard/qc` |
| `/dashboard/qa` | `src/app/(dashboard)/dashboard/qa/page.tsx` | `(dashboard)` | Client | QA Department | None (Canonical) |
| `/dashboard/quality-assurance`| `src/app/(dashboard)/dashboard/qa/page.tsx`| `(dashboard)` | Client | QA Department | 301 Permanent Redirect to `/dashboard/qa` |
| `/dashboard/warehouse` | `src/app/(dashboard)/dashboard/warehouse/page.tsx`| `(dashboard)` | Client | Warehouse Dept | None (Canonical) |
| `/dashboard/inventory`| `src/app/(dashboard)/dashboard/warehouse/page.tsx`| `(dashboard)` | Client | Warehouse Dept | 301 Permanent Redirect to `/dashboard/warehouse` |
| `/dashboard/engineering`| `src/app/(dashboard)/dashboard/engineering/page.tsx`| `(dashboard)`| Client | Engineering Dept | None (Canonical) |
| `/dashboard/finance` | `src/app/(dashboard)/dashboard/finance/page.tsx` | `(dashboard)` | Client | Finance Dept | None (Canonical) |
| `/dashboard/accounts` | `src/app/(dashboard)/dashboard/finance/page.tsx` | `(dashboard)` | Client | Finance Dept | 301 Permanent Redirect to `/dashboard/finance` |
| `/dashboard/procurement`| `src/app/(dashboard)/dashboard/procurement/page.tsx`| `(dashboard)`| Client | Procurement Dept | None (Canonical) |
| `/dashboard/purchase` | `src/app/(dashboard)/dashboard/procurement/page.tsx`| `(dashboard)`| Client | Procurement Dept | 301 Permanent Redirect to `/dashboard/procurement` |
| `/dashboard/regulatory`| `src/app/(dashboard)/dashboard/regulatory/page.tsx`| `(dashboard)` | Client | Regulatory Dept | None (Canonical) |
| `/dashboard/sales` | `src/app/(dashboard)/dashboard/sales/page.tsx` | `(dashboard)` | Client | Sales Dept | None (Canonical) |
| `/dashboard/crm` | `src/app/(dashboard)/dashboard/sales/page.tsx` | `(dashboard)` | Client | Sales Dept | 301 Permanent Redirect to `/dashboard/sales` |
| `/dashboard/microbiology`| `src/app/(dashboard)/dashboard/microbiology/page.tsx`| `(dashboard)`| Client | Micro Dept | None (Canonical) |
| `/dashboard/micro` | `src/app/(dashboard)/dashboard/microbiology/page.tsx`| `(dashboard)`| Client | Micro Dept | 301 Permanent Redirect to `/dashboard/microbiology` |
| `/dashboard/facilities`| `src/app/(dashboard)/dashboard/facilities/page.tsx`| `(dashboard)` | Client | Facilities Dept | None (Canonical) |
| `/dashboard/admin` | `src/app/(dashboard)/dashboard/facilities/page.tsx`| `(dashboard)` | Client | Facilities Dept | 301 Permanent Redirect to `/dashboard/facilities` |
| `/operations` | `src/app/(dashboard)/operations/page.tsx` | `(dashboard)` | Server | Executive Ops | None (Canonical) |
| `/factory` | `src/app/(dashboard)/factory/page.tsx` | `(dashboard)` | Server | Executive Ops | None (Canonical) |
| `/production` | `src/app/(dashboard)/production/page.tsx` | `(dashboard)` | Client | Production | None (Canonical) |
| `/quality/qc` | `src/app/(dashboard)/quality/qc/page.tsx` | `(dashboard)` | Client | QC Dept | None (Canonical) |
| `/quality/qa` | `src/app/(dashboard)/quality/qa/page.tsx` | `(dashboard)` | Client | QA Dept | None (Canonical) |
| `/regulatory` | `src/app/(dashboard)/regulatory/page.tsx` | `(dashboard)` | Client | Regulatory | None (Canonical) |
| `/inventory` | `src/app/(dashboard)/inventory/page.tsx` | `(dashboard)` | Client | Inventory | None (Canonical) |
| `/crm` | `src/app/(dashboard)/crm/page.tsx` | `(dashboard)` | Client | CRM | None (Canonical) |
| `/export` | `src/app/(dashboard)/export/page.tsx` | `(dashboard)` | Client | Export | None (Canonical) |
| `/finance` | `src/app/(dashboard)/finance/page.tsx` | `(dashboard)` | Client | Finance | None (Canonical) |
| `/documents` | `src/app/(dashboard)/documents/page.tsx` | `(dashboard)` | Client | Documents Vault | None (Canonical) |
| `/products` | `src/app/(dashboard)/products/page.tsx` | `(dashboard)` | Server/Client | Public / All Auth | None (Canonical) |
| `/ai` | `src/app/(dashboard)/ai/page.tsx` | `(dashboard)` | Client | AI Knowledge | None (Canonical) |
| `/modules` | `src/app/(dashboard)/modules/page.tsx` | `(dashboard)` | Client | Executive | None (Canonical) |
| `/audit-logs` | `src/app/(dashboard)/audit-logs/page.tsx` | `(dashboard)` | Client | Audit & Executive | None (Canonical) |
| `/admin/database` | `src/app/(dashboard)/admin/database/page.tsx` | `(dashboard)` | Client | Super Admin | None (Canonical) |
| `/hrms` | `src/app/(dashboard)/hrms/dashboard/page.tsx` | `(dashboard)` | Client | HR Admins | 301 Redirect to `/hrms/dashboard` |
| `/hr` | `src/app/(dashboard)/hrms/dashboard/page.tsx` | `(dashboard)` | Client | HR Admins | 301 Redirect to `/hrms/dashboard` |
| `/hr/*` (All subroutes) | `src/app/(dashboard)/hrms/*` | `(dashboard)` | Varied | Varied | 301 Redirect to canonical `/hrms/*` equivalents |
| `/hrms/employees` | `src/app/(dashboard)/hrms/employees/page.tsx` | `(dashboard)` | Client | HR Admins | None (Canonical) |
| `/hrms/employees/create`| `src/app/(dashboard)/hrms/employees/create/page.tsx`| `(dashboard)`| Client | HR Admins | None (Canonical) |
| `/hrms/onboarding` | `src/app/(dashboard)/hrms/onboarding/page.tsx` | `(dashboard)` | Client | HR Admins / Recruiters | None (Canonical) |
| `/hrms/employees/:id` | `src/app/(dashboard)/hrms/employees/[id]/page.tsx` | `(dashboard)` | Client | HR & Managers | None (Canonical) |
| `/hrms/attendance` | `src/app/(dashboard)/hrms/attendance/page.tsx` | `(dashboard)` | Client | HR Admins | None (Canonical) |
| `/hrms/attendance/command-center`| `src/app/(dashboard)/hrms/attendance/command-center/page.tsx`| `(dashboard)`| Client | HR & Directors | None (Canonical) |
| `/hrms/attendance/reports`| `src/app/(dashboard)/hrms/attendance/reports/page.tsx`| `(dashboard)`| Client | HR Admins | None (Canonical) |
| `/hrms/shifts` | `src/app/(dashboard)/hrms/shifts/page.tsx` | `(dashboard)` | Client | HR Admins | None (Canonical) |
| `/hrms/rostering` | `src/app/(dashboard)/hrms/rostering/page.tsx` | `(dashboard)` | Client | HR & Dept Managers | None (Canonical) |
| `/hrms/leave` | `src/app/(dashboard)/hrms/leave/page.tsx` | `(dashboard)` | Client | HR & Dept Managers | None (Canonical) |
| `/hrms/payroll` | `src/app/(dashboard)/hrms/payroll/page.tsx` | `(dashboard)` | Client | HR & Finance | None (Canonical) |
| `/hrms/id-cards` | `src/app/(dashboard)/hrms/id-cards/page.tsx` | `(dashboard)` | Client | HR Admins | None (Canonical) |
| `/hrms/recruitment` | `src/app/(dashboard)/hrms/recruitment/page.tsx` | `(dashboard)` | Client | Recruiters | None (Canonical) |
| `/hrms/training` | `src/app/(dashboard)/hrms/training/page.tsx` | `(dashboard)` | Client | QA & HR | None (Canonical) |
| `/hrms/credentials` | `src/app/(dashboard)/hrms/credentials/page.tsx` | `(dashboard)` | Client | QA & HR | None (Canonical) |
| `/hrms/assets` | `src/app/(dashboard)/hrms/assets/page.tsx` | `(dashboard)` | Client | IT & HR | None (Canonical) |
| `/hrms/expenses` | `src/app/(dashboard)/hrms/expenses/page.tsx` | `(dashboard)` | Client | Finance & HR | None (Canonical) |
| `/hrms/analytics` | `src/app/(dashboard)/hrms/analytics/page.tsx` | `(dashboard)` | Client | HR & Directors | None (Canonical) |
| `/hrms/automation` | `src/app/(dashboard)/hrms/automation/page.tsx` | `(dashboard)` | Client | HR Admins | None (Canonical) |
| `/hrms/compliance` | `src/app/(dashboard)/hrms/compliance/page.tsx` | `(dashboard)` | Client | QA & HR | None (Canonical) |
| `/hrms/copilot` | `src/app/(dashboard)/hrms/copilot/page.tsx` | `(dashboard)` | Client | HR Roles | None (Canonical) |
| `/hrms/login-credentials`| `src/app/(dashboard)/hrms/login-credentials/page.tsx`| `(dashboard)`| Client | Super Admin & HR | None (Canonical) |
| `/hrms/access-audit` | `src/app/(dashboard)/hrms/access-audit/page.tsx` | `(dashboard)` | Client | Auditors & HR | None (Canonical) |
| `/hrms/settings` | `src/app/(dashboard)/hrms/settings/page.tsx` | `(dashboard)` | Client | HR Admins | None (Canonical) |
| `/restricted` | `src/app/(dashboard)/restricted/page.tsx` | `(dashboard)` | Server | Authenticated | 403 Forbidden Page |
| `/*` (Unmatched) | `src/app/not-found.tsx` | Root | Server | Public | Branded 404 |
