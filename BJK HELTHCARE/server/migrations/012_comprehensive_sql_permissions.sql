-- ============================================================================
-- Migration 012: Comprehensive PostgreSQL RBAC Permissions & Default Privileges
-- BJK HEALTHCARE DIGITAL BRAIN: SECURE ROLE-BASED ACCESS & LEAST-PRIVILEGE GRANTS
-- ============================================================================

DO $$
BEGIN
    -- 1. Migration Role (Used by ETL engine for batch loading and administrative DDL/DML)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bjk_migrator') THEN
        CREATE ROLE bjk_migrator WITH LOGIN PASSWORD 'migrator_staging_pass_change_in_prod';
    END IF;

    -- 2. Application Runtime Role (Used by Node.js serverless/backend API pool)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bjk_app') THEN
        CREATE ROLE bjk_app WITH LOGIN PASSWORD 'app_staging_pass_change_in_prod';
    END IF;

    -- 3. Read-Only Analytical Role (Used for BI reporting and analytics)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bjk_readonly') THEN
        CREATE ROLE bjk_readonly WITH LOGIN PASSWORD 'readonly_staging_pass_change_in_prod';
    END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- Schema-Level Grants
-- ----------------------------------------------------------------------------
GRANT USAGE, CREATE ON SCHEMA public TO bjk_migrator;
GRANT USAGE ON SCHEMA public TO bjk_app;
GRANT USAGE ON SCHEMA public TO bjk_readonly;
GRANT USAGE ON SCHEMA public TO PUBLIC;

-- ----------------------------------------------------------------------------
-- 1. bjk_migrator Privileges (Full DDL/DML for schema migrations and batch ETL)
-- ----------------------------------------------------------------------------
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bjk_migrator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bjk_migrator;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO bjk_migrator;

-- ----------------------------------------------------------------------------
-- 2. bjk_app Privileges (Runtime operational DML: SELECT, INSERT, UPDATE, DELETE)
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bjk_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO bjk_app;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA public TO bjk_app;

-- GxP / 21 CFR Part 11 Audit Log Immutability Defense
-- Application runtime can only INSERT and SELECT audit_logs, strictly NO mutations
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM bjk_app;

-- ----------------------------------------------------------------------------
-- 3. bjk_readonly Privileges (SELECT only for BI and reporting)
-- ----------------------------------------------------------------------------
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bjk_readonly;
-- Protect sensitive employee PII from analytical / read-only role
REVOKE SELECT ON employee_bank_details FROM bjk_readonly;

-- ----------------------------------------------------------------------------
-- 4. Current Connected Administrator Privileges
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    curr_user TEXT := CURRENT_USER;
BEGIN
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %I;', curr_user);
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %I;', curr_user);
    EXECUTE format('GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO %I;', curr_user);
END
$$;

-- ----------------------------------------------------------------------------
-- 5. Default Privileges for Any Future Tables, Sequences, and Routines
-- ----------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO bjk_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO bjk_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON ROUTINES TO bjk_migrator;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO bjk_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO bjk_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON ROUTINES TO bjk_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO bjk_readonly;
