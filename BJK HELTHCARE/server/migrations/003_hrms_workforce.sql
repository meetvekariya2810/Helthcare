-- ============================================================================
-- Migration 003: HRMS Workforce & Banking
-- ============================================================================

-- Employees (135 Live Master Profiles)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id VARCHAR(50) UNIQUE NOT NULL, -- Preserves leading zeros: DEMO-EMP-000001
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    personal_email VARCHAR(255),
    phone VARCHAR(50),
    gender VARCHAR(20),
    marital_status VARCHAR(50),
    blood_group VARCHAR(10),
    date_of_birth DATE,
    date_of_joining DATE,
    date_of_exit DATE,
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    
    -- Organizational References
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    department_name VARCHAR(255),
    designation_id UUID REFERENCES designations(id) ON DELETE SET NULL,
    designation_title VARCHAR(255),
    reporting_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Authentication Credentials for Direct Employee Portal Access
    password_hash VARCHAR(255),
    is_first_login BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Sensitive Statutory & Identification Fields (Masked in non-privileged endpoints)
    pan_number VARCHAR(50),
    aadhaar_number VARCHAR(50),
    passport_number VARCHAR(50),
    uan_number VARCHAR(50),
    esic_number VARCHAR(50),
    
    -- Structured Contact & Demographic Payloads
    current_address JSONB DEFAULT '{}'::jsonb,
    permanent_address JSONB DEFAULT '{}'::jsonb,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    family_details JSONB DEFAULT '[]'::jsonb,
    education_records JSONB DEFAULT '[]'::jsonb,
    experience_records JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    
    -- Compensation & Salary Structure (Strictly Restricted to SuperAdmin/Payroll)
    ctc NUMERIC(14, 2),
    basic_salary NUMERIC(14, 2),
    gross_salary NUMERIC(14, 2),
    net_salary NUMERIC(14, 2),
    salary_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Shift & Attendance Assignment
    shift_code VARCHAR(50),
    work_shift_id UUID,
    attendance_policy_id UUID,
    geofence_id UUID,
    
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_facility ON employees(facility_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);

-- Employee Bank Details (38 Live Sensitive Records)
CREATE TABLE IF NOT EXISTS employee_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    account_number VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    ifsc_code VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'SAVINGS',
    is_primary BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    verification_remarks TEXT,
    document_proof_url TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bank_details_emp ON employee_bank_details(employee_id);
CREATE INDEX IF NOT EXISTS idx_bank_details_code ON employee_bank_details(employee_code);
