-- ============================================================================
-- Migration 007: Enterprise Training, Operations & Intelligence
-- ============================================================================

-- Training Programs (6 Programs)
CREATE TABLE IF NOT EXISTS training_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    description TEXT,
    duration_hours NUMERIC(4, 1) DEFAULT 1.0,
    validity_months INT DEFAULT 12,
    passing_score NUMERIC(5, 2) DEFAULT 80.0,
    is_mandatory BOOLEAN DEFAULT FALSE,
    is_gxp_critical BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Training Enrollments (84 Enrollments)
CREATE TABLE IF NOT EXISTS training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    status VARCHAR(50) DEFAULT 'ENROLLED', -- 'ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED'
    score NUMERIC(5, 2),
    completion_date DATE,
    expiry_date DATE,
    certificate_id VARCHAR(100),
    certificate_url TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_train_enroll_emp ON training_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_train_enroll_prog ON training_enrollments(program_id);

-- Employee Credentials & Professional Certifications (8 Credentials)
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    license_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(50) DEFAULT 'VERIFIED',
    document_url TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_credentials_emp ON credentials(employee_id);

-- Saved Report Templates (54 Custom Configured Templates)
CREATE TABLE IF NOT EXISTS saved_report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    columns JSONB DEFAULT '[]'::jsonb,
    filters JSONB DEFAULT '{}'::jsonb,
    sort_by JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- HR & System Notifications (22 Notifications)
CREATE TABLE IF NOT EXISTS hr_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    recipient_id UUID,
    recipient_role VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Policy Clarification Inquiries (7 Clarifications)
CREATE TABLE IF NOT EXISTS policy_clarifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    employee_code VARCHAR(50),
    policy_id VARCHAR(100),
    subject VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    response TEXT,
    status VARCHAR(50) DEFAULT 'ANSWERED',
    answered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Department Staffing Thresholds (6 Thresholds)
CREATE TABLE IF NOT EXISTS department_staffing_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    min_staffing_percentage NUMERIC(5, 2) DEFAULT 70.0,
    max_simultaneous_leaves INT DEFAULT 2,
    critical_roles JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employee Tasks & Action Items (30 Tasks)
CREATE TABLE IF NOT EXISTS employee_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    due_date DATE,
    status VARCHAR(50) DEFAULT 'PENDING',
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employee Support Requests & Helpdesk (11 Requests)
CREATE TABLE IF NOT EXISTS employee_support_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Canteen Settings & Configuration (1 Record)
CREATE TABLE IF NOT EXISTS canteen_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    lunch_start_time VARCHAR(20),
    lunch_end_time VARCHAR(20),
    daily_subsidy_amount NUMERIC(8, 2) DEFAULT 0.0,
    employee_charge_amount NUMERIC(8, 2) DEFAULT 0.0,
    is_enabled BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- AI & Knowledge Intelligence (KnowledgeChunks & Entities)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    source_document VARCHAR(255),
    embedding JSONB,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    description TEXT,
    attributes JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Regulatory Records (1 Record)
CREATE TABLE IF NOT EXISTS regulatory_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    title VARCHAR(255) NOT NULL,
    authority VARCHAR(100),
    submission_date DATE,
    approval_date DATE,
    status VARCHAR(50),
    dossier_url TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries & CRM Leads (2 Enquiries)
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'NEW',
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Invoices & Financial Billings (2 Invoices)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    total_amount NUMERIC(14, 2) NOT NULL,
    tax_amount NUMERIC(14, 2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'PAID',
    items JSONB DEFAULT '[]'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Quality Control Samples (1 Sample)
CREATE TABLE IF NOT EXISTS qc_samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    sample_code VARCHAR(100) UNIQUE NOT NULL,
    product_code VARCHAR(100),
    batch_number VARCHAR(100),
    sample_type VARCHAR(50),
    stage VARCHAR(50),
    tested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    result VARCHAR(50) DEFAULT 'PASS',
    test_parameters JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
