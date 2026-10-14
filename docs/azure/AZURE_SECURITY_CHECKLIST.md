# BJK HEALTHCARE DIGITAL BRAIN — AZURE SECURITY & COMPLIANCE CHECKLIST
## GxP (21 CFR Part 11), ISO 27001, and Zero-Trust Hardening Controls

---

### 1. Network & Infrastructure Security Controls

- [x] **Private Access Virtual Network (VNet) Delegation**:
  - PostgreSQL Flexible Server is isolated inside `snet-postgres` subnet with zero public internet access (`public_network_access = 'Disabled'`).
  - Container Apps communicate with the database exclusively across internal private VNet routing.
- [x] **Strict In-Transit Encryption**:
  - TLS 1.3 enforced across all public endpoints (Azure Front Door / Static Web Apps).
  - PostgreSQL enforces `sslmode=require` with TLS 1.2+ minimum protocol version.
- [x] **DDoS and Web Application Firewall (WAF)**:
  - Azure Front Door Premium WAF rules active with OWASP Top 10 Core Rule Set (CRS 3.2).
  - Rate limiting active on authentication routes (`express-rate-limit` + WAF rate rules).

---

### 2. Identity, RBAC & Credential Governance

- [x] **Least-Privilege Database Roles**:
  - Application runtime connects strictly as `bjk_app` (SELECT, INSERT, UPDATE, DELETE).
  - `bjk_app` has **zero DDL privileges** (cannot CREATE, DROP, ALTER tables).
  - `bjk_app` cannot modify or delete `audit_logs` (enforced by trigger `trg_block_audit_mutation` and schema grants).
  - Migrations run strictly under dedicated `bjk_migrator` role.
- [x] **Password Storage Standard**:
  - All passwords stored strictly as salted bcrypt hashes (`$2a$` / `$2b$`).
  - No plaintext credentials stored or transmitted.
  - External spreadsheets (`BJK_ALL_LOGIN_CREDENTIALS_MASTER.xlsx`) are strictly excluded from git, deployments, and database imports.
- [x] **Automated Account Lockout**:
  - Account locks for 15 minutes after 5 consecutive failed login attempts.
  - All failed login attempts recorded in `login_activities` with IP and User-Agent.

---

### 3. Data Privacy & Field-Level Protection (PII)

- [x] **Aadhaar Masking**: Masked as `XXXX-XXXX-1234` for non-HR / non-Director roles.
- [x] **PAN Masking**: Masked as `ABCDE****F` for unprivileged roles.
- [x] **Bank Account Masking**: Redacted on standard views, visible only to verified finance administrators.
- [x] **Salary & Compensation Protection**:
  - `ctc`, `basic_salary`, `net_salary` stripped automatically by `employeeRepo` for non-payroll roles.

---

### 4. 21 CFR Part 11 & GxP Electronic Records Integrity

- [x] **Append-Only Immutable Audit Trail**:
  - PostgreSQL trigger `trg_block_audit_mutation` rejects any `UPDATE` or `DELETE` statement against `audit_logs` with a fatal error: `Audit log records are immutable under GxP / 21 CFR Part 11 rules`.
- [x] **Audit Trail Completeness**:
  - Actor Identity (Name, Email, Role)
  - Network Metadata (Client IP, User-Agent)
  - Request Context (HTTP Method, Route)
  - State Delta (JSONB `previous_state`, `new_state`, `diff`)
  - Timestamp (UTC with microsecond precision).
- [x] **Validation Evidence Requirement**:
  - Disclaimer: While audit trail logging is technically enforced, formal 21 CFR Part 11 and WHO-GMP compliance requires computerized system validation (CSV) protocols (IQ/OQ/PQ) and documented standard operating procedures (SOPs).

---

### 5. Application Code & Injection Defenses

- [x] **Parameterized Queries Exclusively**:
  - Zero SQL string concatenation in repositories or controllers.
  - All dynamic sorting columns checked against explicit repository allowlists.
- [x] **Fail-Fast Database Connection**:
  - In `production`, application immediately aborts startup if `DATABASE_URL` is missing or invalid.
  - No fallback to in-memory or empty database engines in production paths.
