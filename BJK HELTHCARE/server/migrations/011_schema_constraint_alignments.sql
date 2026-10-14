-- 011_schema_constraint_alignments.sql
-- BJK HEALTHCARE DIGITAL BRAIN: SCHEMA CONSTRAINT ALIGNMENTS
-- Aligns operational column constraints with live production data variances.

-- 1. Support fractional day precision (half-day leaves, shift fractions) in monthly summaries
ALTER TABLE attendance_monthly_summaries ALTER COLUMN total_days TYPE NUMERIC(5, 1);
ALTER TABLE attendance_monthly_summaries ALTER COLUMN present_days TYPE NUMERIC(5, 1);
ALTER TABLE attendance_monthly_summaries ALTER COLUMN absent_days TYPE NUMERIC(5, 1);
ALTER TABLE attendance_monthly_summaries ALTER COLUMN weekly_offs TYPE NUMERIC(5, 1);
ALTER TABLE attendance_monthly_summaries ALTER COLUMN holidays TYPE NUMERIC(5, 1);
ALTER TABLE attendance_monthly_summaries ALTER COLUMN payable_days TYPE NUMERIC(5, 1);

-- 2. Relax optional operational fields to permit NULL where live source data permits omissions
ALTER TABLE inventory_transactions ALTER COLUMN transaction_type DROP NOT NULL;
ALTER TABLE calendar_special_days ALTER COLUMN date DROP NOT NULL;
ALTER TABLE company_calendar_events ALTER COLUMN title DROP NOT NULL;
ALTER TABLE company_calendar_events ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE attendance_regularizations ALTER COLUMN employee_code DROP NOT NULL;
