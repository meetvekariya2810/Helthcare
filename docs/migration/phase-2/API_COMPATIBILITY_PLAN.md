# API Compatibility & Classification Plan: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Phase:** Phase 2 (Architecture & Planning — No Code Changes)  
**Status:** PROPOSED FOR OWNER APPROVAL  

---

## 1. API Classification Scheme (A / B / C / D)

Every backend endpoint group across the 55 route modules is classified into one of four architectural tiers:

- **Category A (Direct Next.js Route Handlers):** Standard REST CRUD, lightweight lookups, user management, simple status updates. Easily ported to thin Route Handlers (`app/api/**/route.ts`).
- **Category B (Complex Transactional Logic):** High-stakes business logic (BJK-HR-POL-001 Leave Policy, Statutory Indian Payroll calculations, 12-stage Onboarding approvals, Bank Details verification). Requires strict service isolation and automated contract verification tests.
- **Category C (Node.js Streaming & File Generators):** Heavy file processing relying on Node.js stream buffers (PDFKit payslips/ID cards, ExcelJS muster rolls, CSV attendance parsers, Multer upload ingestion). Requires explicit `export const runtime = 'nodejs'` and persistent object storage.
- **Category D (Scheduled & Long-Running Automation):** Background tasks (automation rule evaluation, 30/60/90d credential expiry notifications, daily muster roll aggregation). Offloaded to Vercel Cron Jobs calling secured endpoints.

---

## 2. API Endpoint Group Classification Matrix

| Controller / Route Group | Endpoints & Key Actions | Category | Target Implementation Path | Runtime Constraints |
|---|---|---|---|---|
| **Health & Status** | `GET /api/health`, `GET /api/status` | **A** | `app/api/health/route.ts` | Edge / Node |
| **Authentication (Admin/HR)** | `POST /api/auth/login`, `logout`, `me`, `change-password` | **A** | `app/api/auth/[action]/route.ts` | Node (bcrypt + httpOnly Cookie) |
| **Authentication (Employee)** | `POST /api/employee/login`, `POST /api/employee/auth/change-password` | **A** | `app/api/employee/auth/[action]/route.ts` | Node (bcrypt + httpOnly Cookie) |
| **Canteen Portal Auth** | `POST /api/canteen/login`, `POST /api/canteen/logout` | **A** | `app/api/canteen/auth/route.ts` | Node (bcrypt + Cookie) |
| **Company & Facilities** | `GET/PUT /api/company`, `GET/POST /api/facilities` | **A** | `app/api/company/route.ts`, `app/api/facilities/route.ts` | Node |
| **Product Catalogue (111 Products)**| `GET/POST /api/products`, `GET/PUT /api/products/:id` | **A** | `app/api/products/route.ts` | Node (Cached) |
| **Users & Roles Directory** | `GET/POST /api/users`, `GET /api/roles`, `GET /api/permissions` | **A** | `app/api/users/route.ts`, `app/api/roles/route.ts` | Node |
| **Employee Directory** | `GET/POST /api/employees`, `GET/PUT /api/employees/:id` | **A** | `app/api/employees/route.ts` | Node (Zod validation) |
| **Department Dashboards Telemetry** | `GET /api/dashboard/:department` | **A** | `app/api/dashboard/[department]/route.ts` | Node |
| **Public Verification** | `GET /api/verify/employee/:code` | **A** | `app/api/verify/employee/[code]/route.ts` | Node (Public) |
| **Leave Policy Engine & Ledger** | `POST /api/leave/apply`, `POST /api/leave/approve`, `GET /ledger` | **B** | `app/api/leave/route.ts` -> `server/services/leaveService` | Node (Transaction Safe) |
| **12-Stage Onboarding Wizard** | `POST /api/hrms/onboarding/draft`, `POST /submit`, `POST /approve` | **B** | `app/api/hrms/onboarding/route.ts` -> `onboardingService` | Node (3-Tier Approval) |
| **Bank Details Management** | `GET/POST /api/hr/bank-details`, `POST /verify`, `POST /reject` | **B** | `app/api/hr/bank-details/route.ts` -> `bankDetailsService`| Node (Auto-Masking) |
| **Statutory Payroll Calculation** | `POST /api/hrms/payroll/calculate`, `POST /batch-generate` | **B** | `app/api/hrms/payroll/route.ts` -> `statutoryPayrollEngine`| Node (Gross-to-net checks) |
| **Attendance & Regularization** | `POST /api/attendance/punch`, `POST /regularize`, `POST /adjust` | **B** | `app/api/attendance/route.ts` -> `geofenceService` | Node (GPS Validation) |
| **Biometric Hardware Webhook** | `POST /api/hrms/attendance/biometric` | **B** | `app/api/hrms/attendance/biometric/route.ts` | Node (Idempotent Webhook) |
| **Workforce Calendar & Shifts** | `GET/POST /api/hr/calendar`, `POST /exceptions` | **B** | `app/api/hr/calendar/route.ts` -> `workforceCalendarService`| Node |
| **PDF Payslip & Certificate Gen**| `GET /api/employee/payroll/:id/pdf`, `GET /api/hr/id-cards/pdf` | **C** | `app/api/employee/payroll/[id]/pdf/route.ts` | `runtime = 'nodejs'` (PDFKit stream) |
| **Excel Muster Roll & Reports** | `POST /api/hrms/attendance/reports/excel`, `/csv` | **C** | `app/api/hrms/reports/excel/route.ts` | `runtime = 'nodejs'` (ExcelJS stream) |
| **Employee Document Uploads** | `POST /api/employee/documents/upload` | **C** | `app/api/employee/documents/upload/route.ts` | `runtime = 'nodejs'` (Object Storage Presigned URL) |
| **Attendance CSV Batch Parser** | `POST /api/attendance/import` | **C** | `app/api/attendance/import/route.ts` | `runtime = 'nodejs'` (Multipart stream) |
| **Automation Rule Evaluation** | `POST /api/hrms/automation/run-eval` | **D** | `app/api/cron/evaluate-rules/route.ts` | Node (`CRON_SECRET` Header) |
| **Credential Expiry Alerts** | `POST /api/cron/credential-alerts` | **D** | `app/api/cron/credential-alerts/route.ts` | Node (`CRON_SECRET` Header) |

---

## 3. Contract Testing & Compatibility Verification Protocol

To satisfy **Rule 8** and ensure that API replacement never breaks existing client contracts, each ported API endpoint group must pass an automated contract test suite before the legacy Express route is retired.

### Contract Assertions on Every Endpoint:
1. **HTTP Status Code:** Matches legacy route (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found).
2. **Content-Type Header:** Strictly `application/json; charset=utf-8` (or `application/pdf` / `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`). Never returns HTML (`P11`).
3. **Payload Structure:** Exact JSON key structure matching legacy responses:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Operation completed successfully"
   }
   ```
4. **Error Handling:** Errors return uniform JSON structure with `success: false` and sanitized error message. Stack traces are never exposed in production.
5. **Data Masking Assertions:** For sensitive bank details, verify `accountNumber` is masked (`XXXX XXXX 1234`) for non-privileged requests.
6. **Authorization Assertion:** Verify unauthenticated requests return 401; unauthorized roles return 403.
