# BJK HEALTHCARE — DATABASE TARGET ARCHITECTURAL DECISION
**Document ID:** BJK-ADR-DB-001  
**Status:** APPROVED & FINAL  
**Decision:** Target Relational Database is **POSTGRESQL 16**  
**Author:** Principal Database Architect & Migration Lead  
**Date:** 2026-10-15  

---

## 1. Context & Problem Statement

During migration exploration, an experimental MySQL 8.0 parallel track was created alongside the primary PostgreSQL track. To ensure architectural integrity, avoid split-brain persistence logic, and satisfy project safety Rule R13, a single canonical target relational database engine must be formally decided, committed, and standardized across all environments (local development, test pipelines, staging, and Azure cloud production).

---

## 2. Decision: Standardize on PostgreSQL 16 (Flexible Server Ready)

The definitive database target for BJK Healthcare Digital Brain is **PostgreSQL 16**.

All active development, schema migrations, repositories, and cloud deployment pipelines shall target PostgreSQL exclusively.

---

## 3. Rationale & Evidence

1. **Versioned SQL Migration Foundation (Rule R13):**
   - 12 complete, reproducible PostgreSQL migration scripts (`001_control_tables.sql` through `012_comprehensive_sql_permissions.sql`) are already codified, version-controlled, and verified with SHA-256 checksums in `schema_migrations`.
   - 134 PostgreSQL tables with native UUID primary keys, foreign key constraints, `NUMERIC` financial precision, and `TIMESTAMPTZ` instant handling are fully designed and deployed.

2. **Automated Verification & Data Reconciliation:**
   - The PostgreSQL validation suite (`npm run db:validate`) demonstrates **67 / 67 automated tests passing (100%)**.
   - Full data parity achieved: 53 populated MongoDB Atlas collections mapped to 53 relational tables (16,541 rows in PostgreSQL matching Atlas source documents).
   - Deterministic ID mapping (`migration_id_map`) contains 16,543 mapped UUID-to-ObjectId records.

3. **Regulatory Compliance (21 CFR Part 11 & GxP Immutability):**
   - Audit logs table (`audit_logs`) enforces immutability via PostgreSQL native PL/pgSQL function and trigger `trg_block_audit_mutation`.
   - Automated tests confirm that attempted `UPDATE` or `DELETE` operations executed by application roles are strictly rejected by the PostgreSQL engine.

4. **Azure Cloud Production Architecture:**
   - Production infrastructure is designed for **Azure Database for PostgreSQL — Flexible Server** with built-in PgBouncer connection pooling on port 6432.
   - Automated GitHub Actions deployment pipeline (`.github/workflows/deploy-azure.yml`) and production Dockerfile are tailored specifically for PostgreSQL client libraries and environment configurations.

5. **Local Embedded Engine (PGlite):**
   - In non-production environments where Docker is not installed or when running automated CI tests, the system transparently utilizes `@electric-sql/pglite` (WebAssembly-compiled PostgreSQL 16).
   - This eliminates dependency on external local database servers while executing the identical PostgreSQL SQL dialect, constraints, and triggers.

---

## 4. Disposition of MySQL Exploration Track

1. **Preservation without Data Loss:**
   - All experimental MySQL scripts, MySQL migrations (`001` through `008`), and associated persistence prototypes have been safely committed and preserved in the dedicated Git branch:
     ```
     archive/mysql-track
     ```
   - No code or research has been destroyed; full history remains accessible if historical reference is ever needed.

2. **Restoration of Active Working Tree:**
   - The active development branch (`migration/postgres`) has been restored to the committed PostgreSQL state.
   - `BJK HELTHCARE/server/.env.example` and the root `.env.example` explicitly define `DATABASE_PROVIDER=postgres` and `DATABASE_URL` connection strings.
   - Database connection management in `config/postgres.js` and repositories in `server/repositories/` operate exclusively against PostgreSQL.
