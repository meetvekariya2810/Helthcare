# BJK HEALTHCARE DIGITAL BRAIN — MIGRATION ASSESSMENT
## MongoDB Atlas to PostgreSQL 15+ (Azure-Ready Enterprise Architecture)

**Assessment Date**: 2026-10-14  
**Author**: Antigravity Autonomous Engineering  
**Branch**: `migration/postgres`  
**Overall Feasibility**: High (Clean Schema, Well-Structured Domain Models, Zero Unresolvable Blockers)

---

## 1. Source Environment & Technology Stack

| Component | Current State (Source) | Planned Target (PostgreSQL) | Migration Impact |
|---|---|---|---|
| **Database Engine** | MongoDB Atlas (Replica Set / Cluster28) | PostgreSQL 15+ (Azure Flexible Server) | Document to Relational with strict integrity |
| **Driver / ORM** | Mongoose v8.9.5 | `pg` (node-postgres) with Repository Layer | Lower latency, zero hidden hydrations |
| **Backend Runtime** | Node.js v26.4.0, Express v4.21.2 | Node.js v26.4.0, Express v4.21.2 | Unchanged HTTP REST API contracts |
| **Offline Dev Engine**| `mongodb-memory-server` | PostgreSQL Container / Local Postgres | Removed from production; fail-fast in prod |
| **Hosting & Deploy** | Vercel (Serverless `api/index.js`) / Render | Azure App Service / Container Apps / Vercel | Small connection pool, SSL required |
| **Frontend** | React 18, Vite 5, TailwindCSS | React 18, Vite 5, TailwindCSS | Zero UI changes; 100% contract stability |

---

## 2. Source Facts vs. Assumptions vs. Missing Info

### A. Verified Source Facts (Measured from Atlas & Codebase)
1. **Total Collections**: Exactly 129 collections registered in MongoDB Atlas database `bjk_healthcare`.
2. **Total Stored Documents**: Exactly **16,242 documents** across 53 populated collections.
3. **Core Workforce**: Exactly **135 employee profiles** and **111 active user accounts**.
4. **Product Catalogue**: Exactly **111 registered pharmaceutical and healthcare products**.
5. **High-Volume Biometric Data**: **10,527 daily attendance records** and **2,258 attendance import snapshots**.
6. **Regulatory Audit Trail**: **1,425 immutable audit log entries** recording actor IDs, IP addresses, and timestamps.
7. **HTTP Endpoints**: Exactly **635 HTTP route registrations** across 55 route modules (608 protected, 27 unauthenticated).
8. **Credential Security**: Passwords exist exclusively as pre-hashed bcrypt strings (`$2a$` / `$2b$`). Excel credential files are untracked and strictly ignored.

### B. Architectural Assumptions
1. Staging migration is approved to execute locally or in Docker staging environment.
2. PostgreSQL 15+ target supports standard extensions: `uuid-ossp`, `pgcrypto`.
3. The repository layer pattern provides maximum runtime speed, predictable SQL execution, and zero ORM overhead in serverless cold starts.
4. Unmapped or forward-compatible fields in MongoDB documents are stored losslessly in PostgreSQL `JSONB` columns named `legacy_extra`.

### C. Missing Information / External Dependencies
1. Azure subscription and deployment credentials will be provided during production cutover. (Currently `AZURE_RESOURCE_CREATION = NOT_APPROVED`).
2. Production cutover requires final human authorization (Currently `PRODUCTION_CUTOVER = NOT_APPROVED`).

---

## 3. Detailed Data Topology & Entity Relationships

The BJK Healthcare platform spans six core functional domains:

```
[Identity & Access]
  Users (111) <---> Roles (8) <---> UserSessions (277)
    |
    v
  Employees (135) <---> Departments (20) <---> Designations (9)
    |            \---> EmployeeBankDetails (38)
    |            \---> Credentials (8)
    |
    +---> Attendances (10,527) <---> Shifts (7) & Workschedules (3)
    |
    +---> LeaveBalances (58) <---> LeaveLedgers (48) <---> LeavePolicies (2)
    |
    +---> TrainingEnrollments (84) <---> TrainingPrograms (6)
    |
    +---> Products (111) <---> ProductCategories (11) <---> Batches (2)
    |
  AuditLogs (1,425) [Append-Only Compliance Trail]
```

---

## 4. Migration Strategy & Zero-Downtime Blueprint

1. **Phase 1-4**: Design normalized PostgreSQL schema, write idempotent SQL migrations, establish connection pooling and repository layers.
2. **Phase 5**: Refactor backend services to query PostgreSQL via parameterized SQL, preserving 100% of existing REST contracts.
3. **Phase 6**: Execute streaming ETL pipeline from Atlas (read-only) into PostgreSQL staging instance.
4. **Phase 7**: Automated reconciliation verifying record counts, primary/foreign keys, financial/leave balances, and authentication with existing bcrypt hashes.
5. **Phase 8-10**: Azure infrastructure templates, cutover runbooks, rollback scripts, and final executive report.
