# BJK Healthcare Digital Brain — Enterprise Platform

## Overview
BJK Healthcare Digital Brain is an Enterprise Pharmaceutical Operations & HRMS platform featuring:
- Executive Command Center & 30-Role Canonical RBAC
- 111-Product Official Pharmaceutical Catalogue
- 11-Step Guided Employee Onboarding & Compliance Workflows
- Cleanroom Staffing & 21 CFR Part 11 Electronic Signature Audit Logs
- Relational PostgreSQL 16 Data Engine (Azure-Ready Flexible Server / Local Staging)
- StorageProvider Architecture supporting Local Disk & AWS S3 Presigned URLs

---

## Architecture & Database Engine

The system supports PostgreSQL 16 as its target enterprise database:
- **134 Relational Tables** defined across 12 versioned migrations (`migrations/001_control_tables.sql` to `migrations/012_comprehensive_sql_permissions.sql`).
- **31 Parameterized SQL Repositories** in `server/repositories/` replacing direct ORM dependencies.
- **Fail-Fast Safety:** Production fails fast without `DATABASE_URL`; development defaults to a local persistent PostgreSQL staging engine (`.postgres_staging_data/`).
- **Audit Immutability:** Enforced via PostgreSQL trigger `trg_block_audit_mutation` preventing UPDATE and DELETE on `audit_logs`.

---

## Directory Architecture

```
Helthcare/ (Repository Root)
├── package.json              # Workspace root scripts
├── docker-compose.postgres.yml # PostgreSQL 16 local Docker environment
├── vercel.json               # Root Vercel SPA routing fallback configuration
├── .gitignore                # Workspace gitignore (ignores credentials, build, .env)
├── .env.example              # Master environment template (DATABASE_PROVIDER=postgres)
├── docs/
│   ├── database/             # Final migration reports and runbooks
│   └── migration/            # Status baselines, progress ledger, and owner runbooks
└── BJK HELTHCARE/
    ├── client/               # React 18 + Vite 5 Frontend
    │   ├── package.json
    │   ├── vite.config.js
    │   └── src/
    └── server/               # Node.js + Express REST API Backend
        ├── package.json
        ├── server.js
        ├── Dockerfile        # Production multi-stage Docker container
        ├── config/
        │   ├── postgres.js   # PostgreSQL Pool and adapter configuration
        │   └── rbac.js       # 30-Role Canonical RBAC matrix
        ├── migrations/       # 12 Versioned SQL migrations (001 to 012)
        ├── repositories/     # 31 Domain repositories extending BaseRepository
        ├── services/storage/ # StorageProvider (LocalStorageProvider & S3StorageProvider)
        ├── routes/
        └── controllers/
```

---

## Local Development & Testing

```bash
# Start local PostgreSQL 16 container (Docker)
docker-compose -f docker-compose.postgres.yml up -d

# Run all 12 PostgreSQL migrations
npm --prefix "BJK HELTHCARE/server" run db:schema

# Validate full database reconciliation, FK integrity & triggers (67/67 checks)
npm --prefix "BJK HELTHCARE/server" run db:validate

# Verify REST contract snapshots (8/8 domain fixtures)
npm --prefix "BJK HELTHCARE/server" run test:contracts

# Run HR policy engine and HRMS validation suites
npm --prefix "BJK HELTHCARE/server" run test:policies
npm --prefix "BJK HELTHCARE/server" run test:hrms

# Verify cutover and rollback readiness
npm --prefix "BJK HELTHCARE/server" run db:cutover-check
npm --prefix "BJK HELTHCARE/server" run db:rollback-check

# Start local server (Express on http://localhost:5000)
npm run dev
```

---

## Environment Variables

### Backend (`BJK HELTHCARE/server/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | API Server Port | `5000` |
| `NODE_ENV` | Environment Mode | `development` / `production` |
| `DATABASE_PROVIDER` | Active database engine | `postgres` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/bjk_healthcare` |
| `DATABASE_SSL` | Enable TLS for remote PostgreSQL | `true` (prod) / `false` (local) |
| `DATABASE_POOL_MAX` | Max pool connections (2 for serverless, 10 for server) | `10` |
| `JWT_SECRET` | 64-character cryptographic secret | `[REDACTED]` |
| `STORAGE_PROVIDER` | Active storage engine | `local` / `s3` |
| `AWS_S3_BUCKET` | S3 bucket for documents & payslips | `bjk-healthcare-vault` |

---

## Deployment Options

### 1. Azure Container Apps (Backend)
- Production workflow configured via `.github/workflows/deploy-azure.yml`.
- Multi-stage container builds using `BJK HELTHCARE/server/Dockerfile`.
- Database hosted on Azure Database for PostgreSQL Flexible Server.

### 2. Vercel Frontend (Vite Client)
- Framework Preset: `Vite`
- Root Directory: `BJK HELTHCARE/client`
- Output Directory: `dist`
