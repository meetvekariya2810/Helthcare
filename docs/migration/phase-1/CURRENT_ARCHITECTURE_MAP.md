# Current Architecture Map: BJK Healthcare Digital Brain

**Date:** 2026-10-11  
**Audit Mode:** Static Read-Only Codebase Inspection (Phase 1)  

---

## 1. System Topology Overview

```
                                  [ Browser / Client ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ (Vite Dev Server / Vercel Edge CDN) │
                        │  React 18.3.1 SPA (App.jsx, 1240L)  │
                        └──────────────────┬──────────────────┘
                                           │
                       HTTP / REST (/api, credentials, CORS)
                                           │
                                           ▼
                            [ Node.js / Express Server ]
                           (BJK HELTHCARE/server/server.js)
                        ┌──────────────────────────────────────┐
                        │ - Helmet, CORS, Morgan, JSON (10MB)  │
                        │ - 55 Route Files                     │
                        │ - 66 Controller Files                │
                        │ - 20 Service Engines                 │
                        │ - Serverless Adapter: api/index.js   │
                        └──────────────────┬───────────────────┘
                                           │
                              Mongoose ODM (8.9.5 Pool)
                                           │
                                           ▼
                              [ MongoDB Atlas Cluster28 ]
                            Database: bjk_healthcare (97 Models)
```

---

## 2. Directory Architecture & Layer Breakdown

### 2.1 Frontend Client (`BJK HELTHCARE/client/src/`)
- **Root Component:** `App.jsx` (1,240 lines, configuring 100+ routes with `React.lazy` and error boundary).
- **Context Providers:**
  - `AuthContext.jsx`: Director, Super Admin, HR, Department Head sessions via `localStorage`.
  - `EmployeeAuthContext.jsx`: Dedicated Employee Self-Service sessions (`bjk_employee_token`).
  - `NotificationContext.jsx`: Real-time workforce notifications and banner alerts.
- **Portals:**
  1. **Core Operations Portal** (`MainLayout`): Command center, 12 department dashboards, pharma modules, HRMS operations.
  2. **Employee Self-Service Portal** (`EmployeeLayout`): Profile, calendar, ID card, mobile/face attendance, leave ledger, tasks, payslips, support.
  3. **Canteen Portal** (`CanteenLayout`): Meal scanning, headcount verification, canteen reporting.
- **Components:** 140+ modular components across `components/layout/`, `components/employee/`, `components/canteen/`, `components/hr/`, `components/common/`.

### 2.2 Backend Express (`BJK HELTHCARE/server/`)
- **Server Entrypoint:** `server.js` (450 lines).
  - Handles standalone port binding (`listenWithFallback` starting on 5000).
  - Implements auto-init seed block when `process.env.VERCEL !== '1'`.
  - Bridges Vite dev middleware in development mode (`createViteServer`).
- **Route Handlers:** 55 route modules in `routes/`, `routes/hr/`, and `routes/hrms/`.
- **Controllers:** 66 controllers managing business logic across HRMS, manufacturing, quality control, regulatory, and finance.
- **Services (`services/hrms/`):**
  - `statutoryPayrollEngine.js`: Indian payroll calculation (EPF 12%, ESI 0.75%/3.25%, PT slabs, TDS, LOP).
  - `leavePolicyService.js` & `leaveLedgerService.js`: BJK-HR-POL-001 Leave policy engine and 2026 ledger.
  - `workforceCalendarService.js`: Multi-shift roster planning, calendar exceptions, holiday overrides.
  - `pdfService.js`: Payslip, employee ID card, and compliance certificate generation via PDFKit.
  - `excelReportService.js`: Muster roll, monthly attendance, and audit registers via ExcelJS.
  - `copilotService.js`: Rule-based NLP answering engine referencing 13 official HR policy documents.
  - `bankDetailsService.js`: Idempotent bank record manager with data masking.
  - `geofenceService.js`: Factory perimeter GPS verification for mobile punches.

### 2.3 Database Layer (`models/`)
- Total Mongoose model declarations: **97 models** (52 in `models/`, 45 in `models/hrms/`).
- Aggregated through `models/index.js` (barrel export).
- Connection management in `config/db.js`:
  - Enforces public DNS resolution (`8.8.8.8`, `1.1.1.1`) on Windows to resolve Atlas SRV records.
  - Connection pooling: `maxPoolSize=10` (serverless) vs `maxPoolSize=25` (server).
  - Development fallback: `MongoMemoryServer` guarded by `ALLOW_MEMORY_FALLBACK=true` (never runs in production).

---

## 3. Server Auto-Init Sequence Audit

Static review of `server.js:L50-150` identified an automated database synchronization sequence executed upon startup in non-serverless mode:
1. `seedDatabase()` if product count < 111.
2. `getSeedUsers()` to upsert default enterprise accounts.
3. `seedEmployeePortalUsers()` for self-service portal accounts.
4. `migrateUsersToHR()` and `initLeaveMaster()`.
5. `seedAttendance()` for 9-month historical records.
6. `syncExcelToDatabase()` for employee credentials from workbook.
7. `seedDepartmentTestAccounts()` for role testing accounts.
8. `syncLeaveLedgerFromSeed()` loading `Leave 2026(Sheet1).csv`.
9. `initWorkforceCalendarMaster()` for plant shift schedules.
10. `syncExistingEmployeeBankDetailsToCollection()` for bank records.

*Crucial Architecture Note:* In Next.js App Router, this sequence must NOT run on cold starts. It must be decoupled into one-time migration and seed scripts with production fail-fast guards.
