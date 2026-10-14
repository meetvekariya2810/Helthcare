-- ============================================================================
-- Migration 004: Shifts, Work Schedules & Attendance Biometrics
-- ============================================================================

-- Shifts (7 Live Shifts)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    grace_minutes INT DEFAULT 15,
    half_day_hours NUMERIC(4, 2) DEFAULT 4.5,
    full_day_hours NUMERIC(4, 2) DEFAULT 8.0,
    is_night_shift BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Work Schedules (3 Live Master Schedules)
CREATE TABLE IF NOT EXISTS work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    weekly_off_days JSONB DEFAULT '["Sunday"]'::jsonb,
    schedule_rules JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Import Batches (10 Batches)
CREATE TABLE IF NOT EXISTS attendance_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    month VARCHAR(20),
    year INT,
    imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    total_records INT DEFAULT 0,
    success_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    summary_stats JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Import Snapshots (2,258 Raw Biometric Snapshots)
CREATE TABLE IF NOT EXISTS attendance_import_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    batch_id UUID REFERENCES attendance_import_batches(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    raw_date VARCHAR(50),
    parsed_date DATE,
    punch_times JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50),
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_att_snap_batch ON attendance_import_snapshots(batch_id);
CREATE INDEX IF NOT EXISTS idx_att_snap_emp ON attendance_import_snapshots(employee_code);

-- Daily Attendance Punches & Ledger (10,527 Core Operational Records)
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255),
    department_name VARCHAR(255),
    date DATE NOT NULL,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    shift_code VARCHAR(50),
    
    first_punch TIMESTAMPTZ,
    last_punch TIMESTAMPTZ,
    punch_in TIMESTAMPTZ,
    punch_out TIMESTAMPTZ,
    punches JSONB DEFAULT '[]'::jsonb,
    
    total_hours NUMERIC(5, 2) DEFAULT 0.0,
    effective_hours NUMERIC(5, 2) DEFAULT 0.0,
    overtime_hours NUMERIC(5, 2) DEFAULT 0.0,
    late_minutes INT DEFAULT 0,
    early_exit_minutes INT DEFAULT 0,
    
    status VARCHAR(50) NOT NULL, -- 'PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF'
    source VARCHAR(50) DEFAULT 'BIOMETRIC', -- 'BIOMETRIC', 'EXCEL_IMPORT', 'MANUAL', 'WEB', 'MOBILE'
    
    is_regularized BOOLEAN DEFAULT FALSE,
    regularization_status VARCHAR(50),
    regularization_reason TEXT,
    regularized_by UUID REFERENCES users(id) ON DELETE SET NULL,
    regularized_at TIMESTAMPTZ,
    
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendances_emp_date ON attendances(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendances_code_date ON attendances(employee_code, date);
CREATE INDEX IF NOT EXISTS idx_attendances_date ON attendances(date);
CREATE INDEX IF NOT EXISTS idx_attendances_status ON attendances(status);

-- Monthly Attendance Summaries (363 Rollup Records)
CREATE TABLE IF NOT EXISTS attendance_monthly_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    month_name VARCHAR(20),
    total_days INT DEFAULT 0,
    present_days NUMERIC(4, 1) DEFAULT 0.0,
    absent_days NUMERIC(4, 1) DEFAULT 0.0,
    half_days NUMERIC(4, 1) DEFAULT 0.0,
    paid_leaves NUMERIC(4, 1) DEFAULT 0.0,
    unpaid_leaves NUMERIC(4, 1) DEFAULT 0.0,
    weekly_offs INT DEFAULT 0,
    holidays INT DEFAULT 0,
    payable_days NUMERIC(4, 1) DEFAULT 0.0,
    total_overtime_hours NUMERIC(6, 2) DEFAULT 0.0,
    summary_data JSONB DEFAULT '{}'::jsonb,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_att_month_sum_emp ON attendance_monthly_summaries(employee_code, year, month);

-- Attendance Regularization Requests (2 Records)
CREATE TABLE IF NOT EXISTS attendance_regularizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    attendance_id UUID REFERENCES attendances(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    requested_punch_in TIMESTAMPTZ,
    requested_punch_out TIMESTAMPTZ,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    comments TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Report Histories (3 Records)
CREATE TABLE IF NOT EXISTS attendance_report_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    report_type VARCHAR(100) NOT NULL,
    month INT,
    year INT,
    filters JSONB DEFAULT '{}'::jsonb,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_path TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Employee Face Attendance Enrollments (6 Records)
CREATE TABLE IF NOT EXISTS employee_face_attendances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    face_embedding JSONB,
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
