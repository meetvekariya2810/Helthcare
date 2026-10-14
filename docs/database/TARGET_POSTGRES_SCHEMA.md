# TARGET POSTGRESQL SCHEMA SPECIFICATION
## PostgreSQL 15+ Architecture for Azure Flexible Server

**Target Database**: PostgreSQL 15+ (Azure Flexible Server Compatible)  
**Primary Driver**: `pg` (node-postgres) with Connection Pooling  
**Access Architecture**: Parameterized SQL Repository Pattern + Migration Engine  
**Identity Strategy**: Standard UUID primary keys (`gen_random_uuid()`) with source tracking via `source_mongo_id VARCHAR(32)`

---

## 1. Core Architectural Standards

1. **Primary Keys**: Every relational table has a `UUID PRIMARY KEY DEFAULT gen_random_uuid()`.
2. **Source ID Tracking**: Every migrated table retains `source_mongo_id VARCHAR(32)` with a unique constraint `UNIQUE(source_mongo_id)`.
3. **Foreign Keys**: Real relational foreign keys (`REFERENCES other_table(id) ON DELETE CASCADE/SET NULL`) with explicit B-tree indexes on every FK column.
4. **Data Types**:
   - Monetary/financial figures: `NUMERIC(14, 2)` or `NUMERIC(18, 4)`.
   - Date & Time: `TIMESTAMPTZ` for UTC timestamps; `DATE` for calendar dates.
   - Business codes: `VARCHAR(100)` preserving leading zeros (`DEMO-EMP-000001`, `BJK-EMP-001`).
   - Flexible attributes / unmapped legacy data: `JSONB DEFAULT '{}'::jsonb` in `legacy_extra`.
5. **Security & Immutability**:
   - `audit_logs` is append-only. A PostgreSQL `BEFORE UPDATE OR DELETE` trigger blocks any mutations or deletions.
   - Bank details and sensitive PII are masked in API responses and encrypted at rest.

---

## 2. Migration Control Tables

These tables manage migration batches, checkpoints, and deterministic ID mapping:

```sql
-- 1. Schema Migrations Ledger
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL
);

-- 2. Migration Runs
CREATE TABLE IF NOT EXISTS migration_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type VARCHAR(32) NOT NULL, -- 'DRY_RUN', 'FULL_MIGRATION', 'DELTA_SYNC'
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    total_source_docs INT DEFAULT 0,
    total_migrated INT DEFAULT 0,
    total_skipped INT DEFAULT 0,
    total_rejected INT DEFAULT 0,
    manifest_hash VARCHAR(128)
);

-- 3. Migration ID Map (Deterministic ObjectId to UUID)
CREATE TABLE IF NOT EXISTS migration_id_map (
    source_collection VARCHAR(64) NOT NULL,
    source_id VARCHAR(32) NOT NULL,
    target_table VARCHAR(64) NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (source_collection, source_id)
);
CREATE INDEX IF NOT EXISTS idx_mig_map_target ON migration_id_map (target_table, target_id);

-- 4. Migration Checkpoints
CREATE TABLE IF NOT EXISTS migration_checkpoints (
    collection_name VARCHAR(64) PRIMARY KEY,
    last_source_id VARCHAR(32),
    migrated_count INT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'PENDING',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Dead-Letter / Exceptions Table
CREATE TABLE IF NOT EXISTS migration_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name VARCHAR(64) NOT NULL,
    source_id VARCHAR(32) NOT NULL,
    error_message TEXT NOT NULL,
    payload_redacted JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Relational Table Definitions (Core Domains)

### Domain A: Identity, Authentication & Organization

```sql
-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    settings JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    location VARCHAR(255),
    facility_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_facilities_company ON facilities(company_id);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    head_employee_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_departments_facility ON departments(facility_id);

-- Designations
CREATE TABLE IF NOT EXISTS designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users (Identity Tier)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    employee_id UUID,
    profile JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_valid BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ NOT NULL,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);

-- Login Activities
CREATE TABLE IF NOT EXISTS login_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    failure_reason TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_login_act_user ON login_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_login_act_email ON login_activities(email);
```

### Domain B: HRMS Core & Workforce

```sql
-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id VARCHAR(50) UNIQUE NOT NULL, -- Preserves leading zeros: DEMO-EMP-000001
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    date_of_birth DATE,
    date_of_joining DATE,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
    reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    work_shift_id UUID,
    attendance_policy_id UUID,
    
    -- Sensitive Attributes (Masked per role)
    pan_number VARCHAR(50),
    aadhaar_number VARCHAR(50),
    passport_number VARCHAR(50),
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    address_permanent JSONB DEFAULT '{}'::jsonb,
    address_current JSONB DEFAULT '{}'::jsonb,
    
    -- Compensation & Payroll Metadata
    ctc NUMERIC(14, 2),
    basic_salary NUMERIC(14, 2),
    gross_salary NUMERIC(14, 2),
    net_salary NUMERIC(14, 2),
    salary_breakdown JSONB DEFAULT '{}'::jsonb,
    
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_facility ON employees(facility_id);

-- Employee Bank Details
CREATE TABLE IF NOT EXISTS employee_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    account_number VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'SAVINGS',
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMPTZ,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bank_emp ON employee_bank_details(employee_id);
```

### Domain C: Biometrics, Attendance & Shifts

```sql
-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_minutes INT DEFAULT 15,
    half_day_hours NUMERIC(4, 2) DEFAULT 4.5,
    full_day_hours NUMERIC(4, 2) DEFAULT 8.0,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Daily Attendance Punches & Summaries (10,500+ records)
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    punch_in TIMESTAMPTZ,
    punch_out TIMESTAMPTZ,
    first_punch TIMESTAMPTZ,
    last_punch TIMESTAMPTZ,
    total_hours NUMERIC(5, 2) DEFAULT 0.0,
    effective_hours NUMERIC(5, 2) DEFAULT 0.0,
    overtime_hours NUMERIC(5, 2) DEFAULT 0.0,
    status VARCHAR(50) NOT NULL, -- 'PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF'
    punch_source VARCHAR(50) DEFAULT 'BIOMETRIC', -- 'BIOMETRIC', 'MANUAL', 'WEB', 'MOBILE'
    punches JSONB DEFAULT '[]'::jsonb,
    is_regularized BOOLEAN DEFAULT FALSE,
    regularization_reason TEXT,
    regularized_by UUID,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emp_attendance_date UNIQUE(employee_id, date)
);
CREATE INDEX IF NOT EXISTS idx_att_emp_date ON attendances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_att_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_att_status ON attendances(status);

-- Attendance Import Batches & Snapshots
CREATE TABLE IF NOT EXISTS attendance_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    month VARCHAR(20),
    year INT,
    total_records INT DEFAULT 0,
    success_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    metadata JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_import_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    batch_id UUID REFERENCES attendance_import_batches(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    raw_date VARCHAR(50),
    parsed_date DATE,
    punch_times JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50),
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_att_snap_batch ON attendance_import_snapshots(batch_id);
```

### Domain D: Leaves & Statutory Holidays

```sql
-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    annual_quota NUMERIC(5, 2) DEFAULT 0.0,
    carry_forward_max NUMERIC(5, 2) DEFAULT 0.0,
    encashable BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leave Balances
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    year INT NOT NULL,
    opening_balance NUMERIC(5, 2) DEFAULT 0.0,
    accrued NUMERIC(5, 2) DEFAULT 0.0,
    taken NUMERIC(5, 2) DEFAULT 0.0,
    applied NUMERIC(5, 2) DEFAULT 0.0,
    closing_balance NUMERIC(5, 2) DEFAULT 0.0,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_emp_leave_year UNIQUE(employee_id, leave_type_id, year)
);
CREATE INDEX IF NOT EXISTS idx_leave_bal_emp ON leave_balances(employee_id);

-- Leave Ledgers (Audit Trail of Every Leave Credit/Debit)
CREATE TABLE IF NOT EXISTS leave_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'ACCRUAL', 'DEDUCTION', 'LAPSE', 'ENCASHMENT', 'ADJUSTMENT'
    days NUMERIC(5, 2) NOT NULL,
    balance_before NUMERIC(5, 2) NOT NULL,
    balance_after NUMERIC(5, 2) NOT NULL,
    reference_id UUID,
    remarks TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_led_emp ON leave_ledgers(employee_id);
```

### Domain E: Product Catalogue & Inventory

```sql
-- Product Categories
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Products (111-Product Pharmaceutical Catalogue)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    generic_name VARCHAR(255),
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255),
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    pack_size VARCHAR(100),
    therapeutic_class VARCHAR(255),
    storage_conditions VARCHAR(255),
    shelf_life_months INT,
    unit_price NUMERIC(12, 2) DEFAULT 0.0,
    mrp NUMERIC(12, 2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    regulatory_status VARCHAR(100),
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
```

### Domain F: Regulatory Compliance & Append-Only Audit Trail

```sql
-- Audit Logs (Append-Only GxP Compliance Trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    actor_id UUID,
    actor_name VARCHAR(255),
    actor_role VARCHAR(100),
    actor_email VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    route VARCHAR(255),
    method VARCHAR(10),
    previous_state JSONB,
    new_state JSONB,
    diff JSONB,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'SUCCESS',
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- IMMUTABILITY TRIGGER: Prevents UPDATE or DELETE on audit_logs
CREATE OR REPLACE FUNCTION trg_block_audit_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'GxP / 21 CFR Part 11 Violation: Updates and deletions on audit_logs are strictly prohibited.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION trg_block_audit_mutation();
```

---

## 4. RBAC Role Definitions & Permission Matrix

PostgreSQL database roles maintain strict separation of privilege:

| PostgreSQL Role | Permissions | Use Case |
|---|---|---|
| `bjk_migrator` | Full DDL + DML on application tables; INSERT into `audit_logs` | Used exclusively by Phase 3 & Phase 6 migration tooling |
| `bjk_app` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on operational tables; `INSERT`, `SELECT` on `audit_logs` (NO UPDATE/DELETE, NO DDL) | Runtime connection pool for Node.js / Express backend |
| `bjk_readonly` | `SELECT` on all tables except sensitive columns | Read-only reporting and analytical dashboards |
| `postgres` / `azure_pg_admin`| Superuser / Cluster administrator | Database provisioning and extension management |
