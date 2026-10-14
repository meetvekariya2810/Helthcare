-- ============================================================================
-- Migration 008: Forward Operational Domain Tables (Empty in Source Atlas)
-- ============================================================================
-- Each table provides clean forward compatibility for application modules
-- with UUID primary keys, source tracking, timestamps, and JSONB extra storage.

CREATE TABLE IF NOT EXISTS accommodation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_accommodation_requests_source_id ON accommodation_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_source_id ON ai_conversations(source_mongo_id);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_source_id ON ai_messages(source_mongo_id);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_alerts_source_id ON alerts(source_mongo_id);

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_source_id ON assets(source_mongo_id);

CREATE TABLE IF NOT EXISTS attendance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_logs_source_id ON attendance_audit_logs(source_mongo_id);

CREATE TABLE IF NOT EXISTS attendance_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_policies_source_id ON attendance_policies(source_mongo_id);

CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audits_source_id ON audits(source_mongo_id);

CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_source_id ON bank_accounts(source_mongo_id);

CREATE TABLE IF NOT EXISTS budget_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_budget_plans_source_id ON budget_plans(source_mongo_id);

CREATE TABLE IF NOT EXISTS calendar_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_calendar_exceptions_source_id ON calendar_exceptions(source_mongo_id);

CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_candidates_source_id ON candidates(source_mongo_id);

CREATE TABLE IF NOT EXISTS canteen_lunch_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_canteen_lunch_records_source_id ON canteen_lunch_records(source_mongo_id);

CREATE TABLE IF NOT EXISTS capas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_capas_source_id ON capas(source_mongo_id);

CREATE TABLE IF NOT EXISTS change_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_change_controls_source_id ON change_controls(source_mongo_id);

CREATE TABLE IF NOT EXISTS compoff_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_compoff_credits_source_id ON compoff_credits(source_mongo_id);

CREATE TABLE IF NOT EXISTS compoff_work_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_compoff_work_authorizations_source_id ON compoff_work_authorizations(source_mongo_id);

CREATE TABLE IF NOT EXISTS country_compliances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_country_compliances_source_id ON country_compliances(source_mongo_id);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_source_id ON customers(source_mongo_id);

CREATE TABLE IF NOT EXISTS data_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_data_breaches_source_id ON data_breaches(source_mongo_id);

CREATE TABLE IF NOT EXISTS deviations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_deviations_source_id ON deviations(source_mongo_id);

CREATE TABLE IF NOT EXISTS disciplinary_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_disciplinary_cases_source_id ON disciplinary_cases(source_mongo_id);

CREATE TABLE IF NOT EXISTS diversity_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_diversity_metrics_source_id ON diversity_metrics(source_mongo_id);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_source_id ON documents(source_mongo_id);

CREATE TABLE IF NOT EXISTS dossier_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dossier_submissions_source_id ON dossier_submissions(source_mongo_id);

CREATE TABLE IF NOT EXISTS emergency_drills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emergency_drills_source_id ON emergency_drills(source_mongo_id);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_expenses_source_id ON expenses(source_mongo_id);

CREATE TABLE IF NOT EXISTS export_shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_export_shipments_source_id ON export_shipments(source_mongo_id);

CREATE TABLE IF NOT EXISTS hr_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hr_automation_rules_source_id ON hr_automation_rules(source_mongo_id);

CREATE TABLE IF NOT EXISTS hr_compliances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_hr_compliances_source_id ON hr_compliances(source_mongo_id);

CREATE TABLE IF NOT EXISTS icc_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_icc_committees_source_id ON icc_committees(source_mongo_id);

CREATE TABLE IF NOT EXISTS job_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_job_requisitions_source_id ON job_requisitions(source_mongo_id);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leads_source_id ON leads(source_mongo_id);

CREATE TABLE IF NOT EXISTS leave_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_activities_source_id ON leave_activities(source_mongo_id);

CREATE TABLE IF NOT EXISTS leave_encashment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_encashment_requests_source_id ON leave_encashment_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS leave_grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_grievances_source_id ON leave_grievances(source_mongo_id);

CREATE TABLE IF NOT EXISTS leave_refresher_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_refresher_trainings_source_id ON leave_refresher_trainings(source_mongo_id);

CREATE TABLE IF NOT EXISTS leave_regularization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_regularization_requests_source_id ON leave_regularization_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_requests_source_id ON leave_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS loan_liabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_loan_liabilities_source_id ON loan_liabilities(source_mongo_id);

CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_machines_source_id ON machines(source_mongo_id);

CREATE TABLE IF NOT EXISTS manufacturing_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_manufacturing_capabilities_source_id ON manufacturing_capabilities(source_mongo_id);

CREATE TABLE IF NOT EXISTS maternity_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_maternity_cases_source_id ON maternity_cases(source_mongo_id);

CREATE TABLE IF NOT EXISTS medical_fitness_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_medical_fitness_records_source_id ON medical_fitness_records(source_mongo_id);

CREATE TABLE IF NOT EXISTS missed_punches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_missed_punches_source_id ON missed_punches(source_mongo_id);

CREATE TABLE IF NOT EXISTS onboarding_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onboarding_applications_source_id ON onboarding_applications(source_mongo_id);

CREATE TABLE IF NOT EXISTS onboardings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_onboardings_source_id ON onboardings(source_mongo_id);

CREATE TABLE IF NOT EXISTS operational_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_operational_expenses_source_id ON operational_expenses(source_mongo_id);

CREATE TABLE IF NOT EXISTS overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_source_id ON overtime_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payrolls_source_id ON payrolls(source_mongo_id);

CREATE TABLE IF NOT EXISTS payroll_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payroll_rules_source_id ON payroll_rules(source_mongo_id);

CREATE TABLE IF NOT EXISTS performance_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_performance_cycles_source_id ON performance_cycles(source_mongo_id);

CREATE TABLE IF NOT EXISTS performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_source_id ON performance_reviews(source_mongo_id);

CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_policies_source_id ON policies(source_mongo_id);

CREATE TABLE IF NOT EXISTS policy_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_policy_acknowledgments_source_id ON policy_acknowledgments(source_mongo_id);

CREATE TABLE IF NOT EXISTS policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_policy_rules_source_id ON policy_rules(source_mongo_id);

CREATE TABLE IF NOT EXISTS posh_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_posh_cases_source_id ON posh_cases(source_mongo_id);

CREATE TABLE IF NOT EXISTS privacy_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_source_id ON privacy_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS probation_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_probation_reviews_source_id ON probation_reviews(source_mongo_id);

CREATE TABLE IF NOT EXISTS product_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_product_costs_source_id ON product_costs(source_mongo_id);

CREATE TABLE IF NOT EXISTS production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_production_orders_source_id ON production_orders(source_mongo_id);

CREATE TABLE IF NOT EXISTS qc_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_qc_results_source_id ON qc_results(source_mongo_id);

CREATE TABLE IF NOT EXISTS qc_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_qc_tests_source_id ON qc_tests(source_mongo_id);

CREATE TABLE IF NOT EXISTS remote_work_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_remote_work_requests_source_id ON remote_work_requests(source_mongo_id);

CREATE TABLE IF NOT EXISTS rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rosters_source_id ON rosters(source_mongo_id);

CREATE TABLE IF NOT EXISTS safety_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_safety_committees_source_id ON safety_committees(source_mongo_id);

CREATE TABLE IF NOT EXISTS safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_source_id ON safety_incidents(source_mongo_id);

CREATE TABLE IF NOT EXISTS sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sales_orders_source_id ON sales_orders(source_mongo_id);

CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_security_incidents_source_id ON security_incidents(source_mongo_id);

CREATE TABLE IF NOT EXISTS separation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_separation_cases_source_id ON separation_cases(source_mongo_id);

CREATE TABLE IF NOT EXISTS shift_handover_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_shift_handover_logs_source_id ON shift_handover_logs(source_mongo_id);

CREATE TABLE IF NOT EXISTS sops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sops_source_id ON sops(source_mongo_id);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_source_id ON tasks(source_mongo_id);

CREATE TABLE IF NOT EXISTS tax_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tax_records_source_id ON tax_records(source_mongo_id);

CREATE TABLE IF NOT EXISTS whistleblower_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whistleblower_cases_source_id ON whistleblower_cases(source_mongo_id);

CREATE TABLE IF NOT EXISTS workforce_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    code VARCHAR(100),
    title VARCHAR(255),
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    payload JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workforce_rosters_source_id ON workforce_rosters(source_mongo_id);

