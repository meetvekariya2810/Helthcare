-- ============================================================================
-- Migration 005: Leaves, Calendars & Statutory Holidays
-- ============================================================================

-- Leave Types (13 Master Leave Categories)
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
    requires_attachment BOOLEAN DEFAULT FALSE,
    min_service_days INT DEFAULT 0,
    applicable_gender VARCHAR(20) DEFAULT 'ALL',
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leave Policies (2 Comprehensive Policy Engines)
CREATE TABLE IF NOT EXISTS leave_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    policy_code VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules JSONB DEFAULT '{}'::jsonb,
    accrual_frequency VARCHAR(50) DEFAULT 'MONTHLY',
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Leave Balances (58 Employee Entitlement Records)
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
    leave_type_code VARCHAR(50),
    year INT NOT NULL,
    opening_balance NUMERIC(5, 2) DEFAULT 0.0,
    accrued NUMERIC(5, 2) DEFAULT 0.0,
    taken NUMERIC(5, 2) DEFAULT 0.0,
    applied NUMERIC(5, 2) DEFAULT 0.0,
    closing_balance NUMERIC(5, 2) DEFAULT 0.0,
    encashed NUMERIC(5, 2) DEFAULT 0.0,
    lapsed NUMERIC(5, 2) DEFAULT 0.0,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_bal_emp ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_bal_code ON leave_balances(employee_code);

-- Leave Ledgers (48 Transaction Audit Trail Records)
CREATE TABLE IF NOT EXISTS leave_ledgers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    leave_type_id UUID REFERENCES leave_types(id) ON DELETE SET NULL,
    leave_type_code VARCHAR(50),
    transaction_type VARCHAR(50) NOT NULL, -- 'ACCRUAL', 'DEDUCTION', 'LAPSE', 'ENCASHMENT', 'ADJUSTMENT'
    days NUMERIC(5, 2) NOT NULL,
    balance_before NUMERIC(5, 2) NOT NULL,
    balance_after NUMERIC(5, 2) NOT NULL,
    reference_id VARCHAR(100),
    remarks TEXT,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_leave_led_emp ON leave_ledgers(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_led_code ON leave_ledgers(employee_code);

-- Leave Blackout Periods (1 Record)
CREATE TABLE IF NOT EXISTS leave_blackout_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    departments JSONB DEFAULT '[]'::jsonb,
    reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Holiday Calendars (12 Monthly / Annual Calendars)
CREATE TABLE IF NOT EXISTS holiday_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Workforce Holidays (15 Live Statutory Holidays)
CREATE TABLE IF NOT EXISTS workforce_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    calendar_id UUID REFERENCES holiday_calendars(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    holiday_type VARCHAR(50) DEFAULT 'MANDATORY', -- 'MANDATORY', 'RESTRICTED', 'OPTIONAL'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workforce_hol_date ON workforce_holidays(date);

-- Calendar Special Days (3 Special Days)
CREATE TABLE IF NOT EXISTS calendar_special_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    day_type VARCHAR(50),
    description TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Company Calendar Events (5 Events)
CREATE TABLE IF NOT EXISTS company_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_mongo_id VARCHAR(32) UNIQUE,
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    location VARCHAR(255),
    description TEXT,
    legacy_extra JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
