-- ============================================================================
-- Migration 002: Identity, Organization & Access Control
-- ============================================================================

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    contact_email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_designations_dept ON designations(department_id);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Users (Unified Application Authentication & User Logins)
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
    security_metadata JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_facility ON users(facility_id);

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

-- Employee Login Histories
CREATE TABLE IF NOT EXISTS employee_login_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID,
    employee_code VARCHAR(50),
    email VARCHAR(255),
    login_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_emp_log_hist_emp ON employee_login_histories(employee_id);
