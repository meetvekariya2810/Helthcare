# MIGRATION RISK REGISTER & MITIGATION STRATEGY
## MongoDB Atlas to PostgreSQL 15+ Enterprise Migration

**Assessment Date**: 2026-10-14  
**Project**: BJK Healthcare Digital Brain  
**Classification**: Enterprise Pharma HRMS & ERP Data Tier

---

## 1. High-Impact Risk Matrix

| Risk ID | Risk Description | Severity | Likelihood | Impact Area | Mitigation Strategy |
|---|---|---|---|---|---|
| **RSK-01** | **Serverless Connection Pool Starvation** (Vercel lambdas exhausting PostgreSQL connection limits) | CRITICAL | HIGH | API Runtime | Configure small `max: 2` pool per lambda instance; deploy Azure Database for PostgreSQL with PgBouncer / Connection Pooler enabled. |
| **RSK-02** | **Accidental Mutation of Source Atlas Cluster** | CRITICAL | LOW | Data Integrity | Enforce `readPreference: 'secondaryPreferred'` and execute all migration scripts under read-only database user permissions. |
| **RSK-03** | **Data Loss from Incomplete Array / Subdoc Mapping** | HIGH | MEDIUM | Schema ETL | Use structured relational child tables for 1:N entities and persist all unmapped / extensible source fields in `legacy_extra JSONB`. |
| **RSK-04** | **Loss of Leading Zeros on Business IDs** (e.g. `DEMO-EMP-000001` or department codes) | MEDIUM | MEDIUM | HRMS Workflows | Enforce explicit `VARCHAR` types (never convert string IDs to integers) across all tables and ETL transformers. |
| **RSK-05** | **Tampering / Mutation of Audit Trail** | HIGH | LOW | Compliance (GxP) | Install PostgreSQL `BEFORE UPDATE OR DELETE` immutability trigger on `audit_logs` and revoke DDL/update grants from runtime roles. |
| **RSK-06** | **Offline Development Disruption via Memory Server Removal** | MEDIUM | MEDIUM | Local Dev | Replace `mongodb-memory-server` with automated local PostgreSQL container or embedded instance; fail fast in production if DB is absent. |
| **RSK-07** | **Concurrent Leave Balance / Payroll Over-deduction** | HIGH | MEDIUM | HRMS Transactions | Wrap balance modifications in PostgreSQL transactions with `SELECT ... FOR UPDATE` row-level locks. |
| **RSK-08** | **Sensitive PII / Credential Leakage in Logs** | CRITICAL | LOW | Security & Privacy | Apply automated regex-based redaction in logging middleware, dead-letter exception payloads, and test outputs. |

---

## 2. In-Depth Technical Mitigation Strategies

### RSK-01: Serverless Connection Pooling on Azure Flexible Server
- **Problem**: Vercel serverless functions create stateless Node.js instances on demand. If 50 lambdas connect to PostgreSQL with `maxPoolSize: 10`, 500 connections are created, quickly hitting PostgreSQL `max_connections`.
- **Mitigation Architecture**:
  1. Set `DATABASE_POOL_MAX=2` when `process.env.VERCEL` is detected.
  2. Implement singleton `pg.Pool` reuse across lambda invocations using global cache.
  3. In Azure production, enable the built-in PgBouncer connection pooler on port 6432 of Azure Flexible Server.

### RSK-02 & RSK-08: Zero-Leakage & Read-Only Source Safeguard
- **Enforcement**:
  1. The migration engine connects using read-only Atlas credentials.
  2. Dumps, exports, and migration logs are included in `.gitignore`.
  3. The dead-letter table `migration_exceptions` truncates and redacts sensitive field values (`password`, `pan`, `aadhaar`, `bankAccountNumber`) before recording error payloads.

### RSK-05: Regulatory & GxP Compliance Validation
- **Assertion Reality Check**: Existing documentation claims "21 CFR Part 11 Validated". Under pharmaceutical regulatory standards, technical capability (audit logs) does not equal legal compliance.
- **Requirement**: Full validation requires formal Installation Qualification (IQ), Operational Qualification (OQ), and Performance Qualification (PQ) protocols, automated audit trail review, and verified digital signatures.

---

## 3. Contingency & Fallback Triggers

1. **Pre-Cutover Dry-Run Failure**: If any single record fails to transform or reconcile with zero error, the cutover is automatically halted.
2. **Post-Cutover Reversion Rule**: Never revert to MongoDB after PostgreSQL has accepted write transactions without performing reverse delta reconciliation.
