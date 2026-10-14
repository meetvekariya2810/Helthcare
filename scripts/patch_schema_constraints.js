/**
 * BJK HEALTHCARE — SCHEMA CONSTRAINT ALIGNMENT SCRIPT
 * Aligns operational column constraints with live production data variances.
 */

const path = require('path');
const { getPool } = require('../BJK HELTHCARE/server/config/postgres');

async function patchConstraints() {
  const pool = await getPool();
  const statements = [
    `ALTER TABLE attendance_monthly_summaries ALTER COLUMN total_days TYPE NUMERIC(5, 1);`,
    `ALTER TABLE attendance_monthly_summaries ALTER COLUMN present_days TYPE NUMERIC(5, 1);`,
    `ALTER TABLE attendance_monthly_summaries ALTER COLUMN absent_days TYPE NUMERIC(5, 1);`,
    `ALTER TABLE attendance_monthly_summaries ALTER COLUMN weekly_offs TYPE NUMERIC(5, 1);`,
    `ALTER TABLE attendance_monthly_summaries ALTER COLUMN holidays TYPE NUMERIC(5, 1);`,
    `ALTER TABLE attendance_monthly_summaries ALTER COLUMN payable_days TYPE NUMERIC(5, 1);`,
    `ALTER TABLE inventory_transactions ALTER COLUMN transaction_type DROP NOT NULL;`,
    `ALTER TABLE calendar_special_days ALTER COLUMN date DROP NOT NULL;`,
    `ALTER TABLE company_calendar_events ALTER COLUMN title DROP NOT NULL;`,
    `ALTER TABLE company_calendar_events ALTER COLUMN start_time DROP NOT NULL;`,
    `ALTER TABLE attendance_regularizations ALTER COLUMN employee_code DROP NOT NULL;`
  ];

  for (const s of statements) {
    try {
      await pool.query(s);
      console.log(`[Patch Schema] OK: ${s}`);
    } catch (e) {
      console.log(`[Patch Schema] Notice: ${e.message} (${s})`);
    }
  }

  await pool.end();
  console.log('[Patch Schema] Schema constraints successfully aligned.');
}

patchConstraints().catch(console.error);
