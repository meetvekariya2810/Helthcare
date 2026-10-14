-- ============================================================================
-- Migration 010: Database RBAC Roles & Least-Privilege Grants
-- ============================================================================

DO $$
BEGIN
    -- 1. Migration Role (Used by ETL engine for batch loading)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bjk_migrator') THEN
        CREATE ROLE bjk_migrator WITH LOGIN PASSWORD 'migrator_staging_pass_change_in_prod';
    END IF;

    -- 2. Application Runtime Role (Used by Node.js serverless/backend)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bjk_app') THEN
        CREATE ROLE bjk_app WITH LOGIN PASSWORD 'app_staging_pass_change_in_prod';
    END IF;

    -- 3. Read-Only Analytical Role (Used for BI and read-only reporting)
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'bjk_readonly') THEN
        CREATE ROLE bjk_readonly WITH LOGIN PASSWORD 'readonly_staging_pass_change_in_prod';
    END IF;
END
$$;

-- Grant permissions for bjk_migrator (Full DML and table access)
GRANT USAGE ON SCHEMA public TO bjk_migrator;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bjk_migrator;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bjk_migrator;

-- Grant permissions for bjk_app (Operational DML, strictly NO DDL, NO UPDATE/DELETE on audit_logs)
GRANT USAGE ON SCHEMA public TO bjk_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO bjk_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO bjk_app;
-- Explicitly revoke audit log mutation from runtime app
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM bjk_app;

-- Grant permissions for bjk_readonly (SELECT only)
GRANT USAGE ON SCHEMA public TO bjk_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bjk_readonly;
REVOKE SELECT ON employee_bank_details FROM bjk_readonly; -- Protect bank details from analytical role
