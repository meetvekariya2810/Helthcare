const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const { getPool } = require('../../config/postgres');
const dns = require('dns');

if (process.platform === 'win32') {
  try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}
}

// Map MongoDB Atlas collection names to target PostgreSQL table names and transformers
const COLLECTION_SPECS = [
  // Tier 1: Independent Tables
  { mongo: 'companies', target: 'companies', keyFields: ['name'] },
  { mongo: 'facilities', target: 'facilities', keyFields: ['name', 'code'] },
  { mongo: 'roles', target: 'roles', keyFields: ['name'] },
  { mongo: 'shifts', target: 'shifts', keyFields: ['name', 'code'] },
  { mongo: 'workschedules', target: 'work_schedules', keyFields: ['name', 'code'] },
  { mongo: 'leavetypes', target: 'leave_types', keyFields: ['name', 'code'] },
  { mongo: 'leavepolicies', target: 'leave_policies', keyFields: ['name', 'policy_code'] },
  { mongo: 'leaveblackoutperiods', target: 'leave_blackout_periods', keyFields: ['name'] },
  { mongo: 'holidaycalendars', target: 'holiday_calendars', keyFields: ['name', 'year'] },
  { mongo: 'workforceholidays', target: 'workforce_holidays', keyFields: ['name', 'date'] },
  { mongo: 'calendarspecialdays', target: 'calendar_special_days', keyFields: ['name', 'date'] },
  { mongo: 'companycalendarevents', target: 'company_calendar_events', keyFields: ['title'] },
  { mongo: 'productcategories', target: 'product_categories', keyFields: ['name', 'code'] },
  { mongo: 'warehouses', target: 'warehouses', keyFields: ['name', 'code'] },
  { mongo: 'productionlines', target: 'production_lines', keyFields: ['name', 'line_code'] },
  { mongo: 'canteensettings', target: 'canteen_settings', keyFields: ['is_enabled'] },
  { mongo: 'trainingprograms', target: 'training_programs', keyFields: ['title', 'code'] },
  { mongo: 'regulatoryrecords', target: 'regulatory_records', keyFields: ['title'] },
  { mongo: 'knowledgechunks', target: 'knowledge_chunks', keyFields: ['title'] },
  { mongo: 'knowledgeentities', target: 'knowledge_entities', keyFields: ['name'] },
  { mongo: 'enquiries', target: 'enquiries', keyFields: ['contact_name', 'email'] },
  { mongo: 'invoices', target: 'invoices', keyFields: ['invoice_number'] },

  // Tier 2: Organization & Identity
  { mongo: 'departments', target: 'departments', keyFields: ['name', 'code'] },
  { mongo: 'designations', target: 'designations', keyFields: ['title', 'code'] },
  { mongo: 'users', target: 'users', keyFields: ['email', 'username'] },
  { mongo: 'products', target: 'products', keyFields: ['product_code', 'name'] },
  { mongo: 'batches', target: 'batches', keyFields: ['batch_number'] },
  { mongo: 'inventoryitems', target: 'inventory_items', keyFields: ['item_code', 'name'] },
  { mongo: 'inventorytransactions', target: 'inventory_transactions', keyFields: ['transaction_type'] },
  { mongo: 'qcsamples', target: 'qc_samples', keyFields: ['sample_code'] },

  // Tier 3: Core Workforce & HRMS
  { mongo: 'employees', target: 'employees', keyFields: ['employee_id', 'email'] },
  { mongo: 'employee_bank_details', target: 'employee_bank_details', keyFields: ['account_number', 'employee_code'] },
  { mongo: 'credentials', target: 'credentials', keyFields: ['title', 'employee_code'] },
  { mongo: 'leavebalances', target: 'leave_balances', keyFields: ['employee_code', 'year'] },
  { mongo: 'leaveledgers', target: 'leave_ledgers', keyFields: ['employee_code', 'transaction_type'] },
  { mongo: 'trainingenrollments', target: 'training_enrollments', keyFields: ['program_id', 'employee_code'] },
  { mongo: 'employeetasks', target: 'employee_tasks', keyFields: ['title'] },
  { mongo: 'employeesupportrequests', target: 'employee_support_requests', keyFields: ['subject', 'category'] },
  { mongo: 'policyclarifications', target: 'policy_clarifications', keyFields: ['subject'] },
  { mongo: 'departmentstaffingthresholds', target: 'department_staffing_thresholds', keyFields: ['department_id'] },
  { mongo: 'employeefaceattendances', target: 'employee_face_attendances', keyFields: ['employee_code'] },

  // Tier 4: Attendance & High Volume Punches
  { mongo: 'attendance_import_batches', target: 'attendance_import_batches', keyFields: ['file_name'] },
  { mongo: 'attendance_import_snapshots', target: 'attendance_import_snapshots', keyFields: ['employee_code', 'raw_date'] },
  { mongo: 'attendances', target: 'attendances', keyFields: ['employee_code', 'date'] },
  { mongo: 'attendance_monthly_summaries', target: 'attendance_monthly_summaries', keyFields: ['employee_code', 'year', 'month'] },
  { mongo: 'attendanceregularizations', target: 'attendance_regularizations', keyFields: ['employee_code', 'date'] },
  { mongo: 'attendancereporthistories', target: 'attendance_report_histories', keyFields: ['report_type'] },
  { mongo: 'usersessions', target: 'user_sessions', keyFields: ['session_token'] },
  { mongo: 'loginactivities', target: 'login_activities', keyFields: ['email', 'status'] },
  { mongo: 'employeeloginhistories', target: 'employee_login_histories', keyFields: ['employee_code', 'login_time'] },
  { mongo: 'savedreporttemplates', target: 'saved_report_templates', keyFields: ['name', 'module'] },
  { mongo: 'hrnotifications', target: 'hr_notifications', keyFields: ['title'] },
  { mongo: 'auditlogs', target: 'audit_logs', keyFields: ['action', 'created_at'] }
];

// In-memory ObjectId -> UUID map for fast deterministic resolution
const idMap = new Map();

function redactDoc(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const copy = JSON.parse(JSON.stringify(doc));
  const sensitiveKeys = ['password', 'passwordHash', 'panNumber', 'aadhaarNumber', 'accountNumber', 'bankAccountNumber', 'secret'];
  function sanitize(o) {
    for (const k in o) {
      if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk.toLowerCase()))) {
        o[k] = '[REDACTED]';
      } else if (typeof o[k] === 'object' && o[k] !== null) {
        sanitize(o[k]);
      }
    }
  }
  sanitize(copy);
  return copy;
}

// Convert MongoDB BSON types to Postgres clean types
function cleanValue(v) {
  if (v === null || v === undefined) return null;
  if (v instanceof mongoose.Types.ObjectId || (v && v._bsontype === 'ObjectID')) return v.toString();
  if (v instanceof Date) return v.toISOString();
  if (v instanceof mongoose.Types.Decimal128 || (v && v._bsontype === 'Decimal128')) return parseFloat(v.toString());
  if (typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v);
  return v;
}

async function runETL({ isDryRun = false, batchSize = 500 } = {}) {
  const runType = isDryRun ? 'DRY_RUN' : 'FULL_MIGRATION';
  console.log(`================================================================`);
  console.log(`     BJK HEALTHCARE — ETL PIPELINE ENGINE (${runType})          `);
  console.log(`================================================================\n`);

  const pool = getPool();
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME || 'bjk_healthcare';

  console.log(`[ETL Engine] Connecting to MongoDB Atlas (${dbName}) read-only...`);
  const mConn = await mongoose.connect(uri, {
    dbName,
    readPreference: 'secondaryPreferred',
    serverSelectionTimeoutMS: 20000,
  });
  const mDb = mConn.connection.db;
  console.log('[ETL Engine] Connected to MongoDB Atlas.');

  // Initialize migration run record if not dry-run
  let runId = null;
  if (!isDryRun) {
    const runRes = await pool.query(
      `INSERT INTO migration_runs (run_type, status) VALUES ($1, 'RUNNING') RETURNING id;`,
      [runType]
    );
    runId = runRes.rows[0].id;

    // Load existing ID map into memory for fast FK resolution
    const mapRows = await pool.query(`SELECT source_collection, source_id, target_id FROM migration_id_map;`);
    for (const r of mapRows.rows) {
      idMap.set(`${r.source_collection}:${r.source_id}`, r.target_id);
    }
    console.log(`[ETL Engine] Loaded ${idMap.size} existing ID mappings into cache.`);
  }

  // Cache database schema columns dynamically
  const colRes = await pool.query(`SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';`);
  const tableColumnsMap = new Map();
  for (const r of colRes.rows) {
    if (!tableColumnsMap.has(r.table_name)) tableColumnsMap.set(r.table_name, new Set());
    tableColumnsMap.get(r.table_name).add(r.column_name);
  }
  console.log(`[ETL Engine] Cached schema columns for ${tableColumnsMap.size} tables.`);

  const manifestEntries = [];
  let grandTotalSource = 0;
  let grandTotalMigrated = 0;
  let grandTotalSkipped = 0;
  let grandTotalRejected = 0;

  for (const spec of COLLECTION_SPECS) {
    const collName = spec.mongo;
    const targetTable = spec.target;
    const mColl = mDb.collection(collName);
    const count = await mColl.countDocuments();
    grandTotalSource += count;

    if (count === 0) continue;

    console.log(`\n>>> Migrating [${collName}] (${count.toLocaleString()} docs) -> PostgreSQL [${targetTable}]...`);

    let processed = 0;
    let collMigrated = 0;
    let collSkipped = 0;
    let collRejected = 0;

    const cursor = mColl.find({}).batchSize(batchSize);

    while (await cursor.hasNext()) {
      const batchDocs = [];
      for (let i = 0; i < batchSize && await cursor.hasNext(); i++) {
        batchDocs.push(await cursor.next());
      }

      processed += batchDocs.length;

      for (const doc of batchDocs) {
        try {
          const sourceId = doc._id.toString();
          let targetUuid = idMap.get(`${collName}:${sourceId}`);

          if (!targetUuid) {
            targetUuid = crypto.randomUUID();
            idMap.set(`${collName}:${sourceId}`, targetUuid);
          }

          // Transform doc according to table schema
          const transformed = transformDoc(collName, targetTable, doc, targetUuid, tableColumnsMap);

          if (!isDryRun) {
            // Write ID map
            await pool.query(
              `INSERT INTO migration_id_map (source_collection, source_id, target_table, target_id)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (source_collection, source_id) DO NOTHING;`,
              [collName, sourceId, targetTable, targetUuid]
            );

            // Insert into target table
            await insertTargetRecord(pool, targetTable, transformed, tableColumnsMap);
          }

          collMigrated++;
          manifestEntries.push({ table: targetTable, id: targetUuid, sourceId });
        } catch (recordErr) {
          collRejected++;
          console.error(`[ETL ERROR] Failed record in ${collName} (_id: ${doc._id}):`, recordErr.message);


          if (!isDryRun) {
            try {
              await pool.query(
                `INSERT INTO migration_exceptions (collection_name, source_id, error_message, payload_redacted)
                 VALUES ($1, $2, $3, $4);`,
                [collName, doc._id.toString(), recordErr.message, JSON.stringify(redactDoc(doc))]
              );
            } catch (_) {}
          }
        }
      }

      process.stdout.write(`  Processed ${processed}/${count} documents (${collMigrated} migrated, ${collRejected} rejected)\r`);
    }

    grandTotalMigrated += collMigrated;
    grandTotalRejected += collRejected;
    console.log(`\n  Completed ${collName}: ${collMigrated} migrated, ${collRejected} rejected.`);
  }

  // Calculate manifest SHA-256 hash
  const manifestHash = crypto.createHash('sha256').update(JSON.stringify(manifestEntries)).digest('hex');

  if (!isDryRun && runId) {
    await pool.query(
      `UPDATE migration_runs 
       SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, 
           total_source_docs = $1, total_migrated = $2, total_skipped = $3, 
           total_rejected = $4, manifest_hash = $5
       WHERE id = $6;`,
      [grandTotalSource, grandTotalMigrated, grandTotalSkipped, grandTotalRejected, manifestHash, runId]
    );
  }

  await mongoose.disconnect();
  await pool.end();

  console.log('\n================================================================');
  console.log(`     ETL MIGRATION RUN COMPLETE (${runType})                   `);
  console.log('================================================================');
  console.log(`Total Source Documents:  ${grandTotalSource.toLocaleString()}`);
  console.log(`Total Migrated Records:  ${grandTotalMigrated.toLocaleString()}`);
  console.log(`Total Rejected Records:  ${grandTotalRejected.toLocaleString()}`);
  console.log(`Integrity Manifest Hash: ${manifestHash}`);
  console.log('================================================================\n');

  return {
    success: grandTotalRejected === 0,
    totalSource: grandTotalSource,
    totalMigrated: grandTotalMigrated,
    totalRejected: grandTotalRejected,
    manifestHash
  };
}

function ensureJsonb(val) {
  if (val === null || val === undefined) return '{}';
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (typeof parsed === 'object' && parsed !== null) return JSON.stringify(parsed);
      return JSON.stringify({ text: val });
    } catch (_) {
      return JSON.stringify({ text: val });
    }
  }
  try {
    return JSON.stringify(val);
  } catch (_) {
    return '{}';
  }
}


function transformDoc(collName, table, doc, targetUuid, tableColumnsMap) {
  const sourceId = doc._id.toString();
  const validCols = tableColumnsMap ? tableColumnsMap.get(table) : null;
  const res = {
    id: targetUuid,
    source_mongo_id: sourceId
  };

  if (!validCols || validCols.has('created_at')) {
    res.created_at = doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString();
  }
  if (!validCols || validCols.has('updated_at')) {
    res.updated_at = doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString();
  }

  const copy = { ...doc };
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  delete copy.__v;

  if (table === 'companies') {
    res.name = doc.name || doc.companyName || 'BJK Healthcare';
    res.legal_name = doc.legalName || res.name;
    res.registration_number = doc.registrationNumber || null;
    res.contact_email = doc.email || doc.contactEmail || null;
    res.phone = doc.phone || null;
    res.address = doc.address || {};
    res.settings = doc.settings || {};
  } else if (table === 'facilities') {
    res.name = doc.name || 'Main Facility';
    res.code = doc.code || doc.facilityCode || null;
    res.location = doc.location || null;
    res.facility_type = doc.facilityType || doc.type || 'MANUFACTURING';
    res.is_active = doc.isActive !== false;
  } else if (table === 'departments') {
    res.name = doc.name || doc.departmentName || 'General';
    res.code = doc.code || doc.departmentCode || null;
    res.description = doc.description || null;
    res.is_active = doc.isActive !== false;
  } else if (table === 'designations') {
    res.title = doc.title || doc.name || 'Staff';
    res.code = doc.code || null;
    res.level = doc.level || null;
    res.is_active = doc.isActive !== false;
  } else if (table === 'roles') {
    res.name = doc.name || 'USER';
    res.display_name = doc.displayName || doc.name;
    res.description = doc.description || null;
    res.permissions = doc.permissions || [];
    res.is_system = Boolean(doc.isSystem);
  } else if (table === 'users') {
    res.username = doc.username || doc.email.split('@')[0];
    res.email = doc.email;
    res.password_hash = doc.password; // bcrypt hash preserved as-is
    res.role = doc.role || 'EMPLOYEE';
    res.is_active = doc.isActive !== false;
    res.is_locked = Boolean(doc.isLocked);
    res.failed_login_attempts = doc.failedLoginAttempts || 0;
    res.profile = doc.profile || {};
  } else if (table === 'employees') {
    res.employee_id = doc.employeeId || doc.empId || doc.employeeCode;
    res.first_name = doc.firstName || doc.name?.split(' ')[0] || 'Employee';
    res.middle_name = doc.middleName || null;
    res.last_name = doc.lastName || doc.name?.split(' ').slice(1).join(' ') || 'BJK';
    res.full_name = doc.fullName || `${res.first_name} ${res.last_name}`;
    res.email = doc.email || doc.workEmail || `${res.employee_id.toLowerCase()}@bjk.com`;
    res.personal_email = doc.personalEmail || null;
    res.phone = doc.phone || doc.mobile || doc.officialMobile || null;
    res.gender = doc.gender || null;
    res.marital_status = doc.maritalStatus || null;
    res.blood_group = doc.bloodGroup || null;
    res.date_of_birth = doc.dateOfBirth ? new Date(doc.dateOfBirth).toISOString().split('T')[0] : null;
    res.date_of_joining = doc.dateOfJoining ? new Date(doc.dateOfJoining).toISOString().split('T')[0] : null;
    res.employment_type = doc.employmentType || 'FULL_TIME';
    res.employment_status = doc.employmentStatus || 'ACTIVE';
    res.department_name = typeof doc.department === 'string' ? doc.department : (doc.department?.name || null);
    res.designation_title = typeof doc.designation === 'string' ? doc.designation : (doc.designation?.title || null);
    res.password_hash = doc.password || null;
    res.is_first_login = doc.isFirstLogin !== false;
    res.is_active = doc.isActive !== false;
    res.pan_number = doc.panNumber || null;
    res.aadhaar_number = doc.aadhaarNumber || null;
    res.passport_number = doc.passportNumber || null;
    res.current_address = ensureJsonb(doc.currentAddress || doc.currentAddressDetails || doc.address);
    res.permanent_address = ensureJsonb(doc.permanentAddress || doc.permanentAddressDetails);
    res.emergency_contact = ensureJsonb(doc.emergencyContact || doc.emergencyContacts);
    res.ctc = doc.ctc || doc.salary || null;
    res.basic_salary = doc.basicSalary || null;
    res.gross_salary = doc.grossSalary || null;
    res.net_salary = doc.netSalary || null;
    res.salary_breakdown = ensureJsonb(doc.salaryDetails || doc.salaryBreakdown);
  } else if (table === 'employee_bank_details') {
    res.employee_code = doc.employeeId || doc.employeeCode || doc.empCode || 'UNKNOWN';
    res.bank_name = doc.bankName || 'Bank';
    res.branch_name = doc.branchName || null;
    res.account_number = doc.accountNumber || doc.bankAccountNumber || 'ACC000000';
    res.account_holder_name = doc.accountHolderName || doc.accountName || 'Employee';
    res.ifsc_code = doc.ifscCode || 'IFSC0000000';
    res.account_type = doc.accountType || 'SAVINGS';
    res.is_primary = doc.isPrimary !== false;
    res.is_verified = Boolean(doc.isVerified);
  } else if (table === 'products') {
    res.product_code = doc.productCode || doc.sku || doc.code || (doc.srNo ? `BJK-PRD-${String(doc.srNo).padStart(4, '0')}` : ('PRD-' + sourceId.slice(-6)));
    res.name = doc.productName || doc.name || ('Product ' + (doc.srNo || sourceId.slice(-4)));
    res.brand_name = doc.brandName || null;
    res.generic_name = doc.genericName || null;
    res.category_name = doc.category || null;
    res.dosage_form = doc.dosageForm || null;
    res.strength = doc.strength || (Array.isArray(doc.availableStrengths) ? doc.availableStrengths.join(', ') : null);
    res.pack_size = doc.packSize || null;
    res.therapeutic_class = doc.classification || doc.therapeuticClass || null;
    res.shelf_life_months = doc.shelfLifeMonths || null;
    res.unit_price = doc.unitPrice || doc.price || 0.0;
    res.mrp = doc.mrp || 0.0;
    res.is_active = doc.isActive !== false;
    res.regulatory_status = doc.regulatoryStatus || doc.verificationStatus || 'APPROVED';
  } else if (table === 'shifts') {
    res.name = doc.name;
    res.code = doc.code || doc.shiftCode;
    res.start_time = doc.startTime || '09:00';
    res.end_time = doc.endTime || '18:00';
    res.grace_minutes = doc.graceMinutes || 15;
    res.is_active = doc.isActive !== false;
  } else if (table === 'attendances') {
    res.employee_code = doc.employeeCode || doc.employeeId || doc.empCode || 'UNKNOWN';
    res.employee_name = doc.employeeName || null;
    res.department_name = doc.department || null;
    res.date = doc.date ? new Date(doc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    res.shift_code = doc.shift || doc.shiftCode || null;
    res.first_punch = doc.firstPunch ? new Date(doc.firstPunch).toISOString() : null;
    res.last_punch = doc.lastPunch ? new Date(doc.lastPunch).toISOString() : null;
    res.punch_in = doc.punchIn ? new Date(doc.punchIn).toISOString() : res.first_punch;
    res.punch_out = doc.punchOut ? new Date(doc.punchOut).toISOString() : res.last_punch;
    res.punches = doc.punches || [];
    res.total_hours = doc.totalHours || 0.0;
    res.effective_hours = doc.effectiveHours || doc.totalHours || 0.0;
    res.overtime_hours = doc.overtimeHours || 0.0;
    res.status = doc.status || 'PRESENT';
    res.source = doc.source || 'BIOMETRIC';
    res.is_regularized = Boolean(doc.isRegularized);
  } else if (table === 'attendance_monthly_summaries') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.month = parseInt(doc.month, 10) || 1;
    res.year = parseInt(doc.year, 10) || 2026;
    res.month_name = doc.monthName || null;
    res.total_days = doc.totalDays !== undefined ? parseFloat(doc.totalDays) : 30.0;
    res.present_days = doc.present !== undefined ? parseFloat(doc.present) : (doc.presentDays !== undefined ? parseFloat(doc.presentDays) : 0.0);
    res.absent_days = doc.absentPayDays !== undefined ? parseFloat(doc.absentPayDays) : (doc.absentDays !== undefined ? parseFloat(doc.absentDays) : 0.0);
    res.weekly_offs = doc.weeklyOff !== undefined ? parseFloat(doc.weeklyOff) : 0.0;
    res.holidays = doc.publicHoliday !== undefined ? parseFloat(doc.publicHoliday) : 0.0;
    res.payable_days = res.present_days;
    res.total_overtime_hours = doc.totalOvertimeHours || 0;
  } else if (table === 'attendance_import_batches') {
    res.file_name = doc.fileName || doc.filename || 'import.xlsx';
    res.month = doc.month || null;
    res.year = doc.year || null;
    res.total_records = doc.totalRecords || 0;
    res.success_count = doc.successCount || 0;
    res.error_count = doc.errorCount || 0;
    res.status = doc.status || 'COMPLETED';
  } else if (table === 'attendance_import_snapshots') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.raw_date = doc.rawDate || doc.date || null;
    res.parsed_date = doc.parsedDate ? new Date(doc.parsedDate).toISOString().split('T')[0] : null;
    res.punch_times = doc.punchTimes || [];
    res.status = doc.status || 'PARSED';
  } else if (table === 'attendance_regularizations') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.date = doc.date ? new Date(doc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    res.reason = doc.reason || 'Regularization request';
    res.status = doc.status || 'PENDING';
  } else if (table === 'attendance_report_histories') {
    res.report_type = doc.reportType || doc.type || 'REPORT';
    res.month = doc.month || 1;
    res.year = doc.year || 2026;
  } else if (table === 'leave_types') {
    res.name = doc.name;
    res.code = doc.code || doc.leaveCode;
    res.annual_quota = doc.annualQuota || doc.quota || 0;
    res.carry_forward_max = doc.carryForwardMax || 0;
    res.encashable = Boolean(doc.encashable);
    res.is_paid = doc.isPaid !== false;
  } else if (table === 'leave_balances') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.leave_type_code = doc.leaveTypeCode || doc.leaveType || 'PL';
    res.year = doc.year || 2026;
    res.opening_balance = doc.openingBalance || 0;
    res.accrued = doc.accrued || 0;
    res.taken = doc.taken || 0;
    res.applied = doc.applied || 0;
    res.closing_balance = doc.closingBalance || doc.balance || 0;
  } else if (table === 'leave_ledgers') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.leave_type_code = doc.leaveTypeCode || doc.leaveType || 'PL';
    res.transaction_type = doc.transactionType || doc.type || 'ADJUSTMENT';
    res.days = doc.days || 0;
    res.balance_before = doc.balanceBefore || 0;
    res.balance_after = doc.balanceAfter || 0;
    res.remarks = doc.remarks || doc.reason || null;
  } else if (table === 'saved_report_templates') {
    res.name = doc.name || 'Report Template';
    res.module = doc.module || doc.reportType || doc.category || 'REPORTS';
    res.description = doc.description || null;
    res.columns = doc.columns || [];
    res.filters = doc.filters || {};
    res.sort_by = doc.sortBy || {};
  } else if (table === 'hr_notifications') {
    res.title = doc.title || doc.subject || doc.heading || (doc.message ? doc.message.substring(0, 50) : 'Notification');
    res.message = doc.message || doc.body || 'No message content';
    res.category = doc.category || doc.type || 'GENERAL';
    res.recipient_role = doc.recipientRole || doc.role || null;
  } else if (table === 'credentials') {
    res.employee_code = doc.employeeId || doc.employeeCode || 'UNKNOWN';
    res.title = doc.title || doc.credentialName || doc.name || 'Credential';
    res.issuing_authority = doc.issuingAuthority || null;
    res.license_number = doc.certificateNumber || doc.licenseNumber || null;
    res.issue_date = doc.issueDate ? new Date(doc.issueDate).toISOString().split('T')[0] : null;
    res.expiry_date = doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : null;
    res.verification_status = doc.status || 'VERIFIED';
  } else if (table === 'employee_tasks') {
    res.title = doc.title || doc.taskName || 'Assigned Task';
    res.description = doc.description || null;
    res.priority = doc.priority || 'MEDIUM';
    res.status = doc.status || 'PENDING';
    res.due_date = doc.dueDate ? new Date(doc.dueDate).toISOString().split('T')[0] : null;
  } else if (table === 'holiday_calendars') {
    res.name = doc.name || 'Holiday Calendar';
    res.year = doc.year || (doc.date ? new Date(doc.date).getUTCFullYear() : (doc.dateString ? parseInt(doc.dateString.split('-')[0], 10) : 2026));
    res.is_active = doc.isActive !== false;
  } else if (table === 'workforce_holidays') {
    res.name = doc.name || 'Holiday';
    res.date = doc.dateString || (doc.date ? new Date(doc.date).toISOString().split('T')[0] : '2026-01-01');
    res.holiday_type = doc.type || 'MANDATORY';
    res.description = doc.description || null;
    res.is_active = doc.status !== 'INACTIVE';
  } else if (table === 'batches') {
    res.batch_number = doc.batchNumber || doc.batchNo || ('BATCH-' + sourceId.slice(-6));
    res.product_name = doc.productName || null;
    res.batch_size = doc.batchSize || doc.quantity || 1000;
    res.manufacturing_date = doc.manufacturingDate ? new Date(doc.manufacturingDate).toISOString().split('T')[0] : null;
    res.expiry_date = doc.expiryDate ? new Date(doc.expiryDate).toISOString().split('T')[0] : null;
    res.status = doc.status || 'RELEASED';
  } else if (table === 'invoices') {
    res.invoice_number = doc.invoiceNumber || doc.invoiceNo || ('INV-' + sourceId.slice(-6));
    res.customer_name = doc.partyName || doc.customerName || 'Customer';
    res.invoice_date = doc.invoiceDate ? new Date(doc.invoiceDate).toISOString().split('T')[0] : (doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '2026-01-01');
    res.due_date = doc.dueDate ? new Date(doc.dueDate).toISOString().split('T')[0] : null;
    res.total_amount = doc.totalAmount || doc.subtotal || 0.0;
    res.tax_amount = doc.taxAmount || 0.0;
    res.status = doc.paymentStatus || doc.status || 'PAID';
    res.items = doc.items || [];
  } else if (table === 'qc_samples') {
    res.sample_code = doc.sampleNumber || doc.sampleCode || ('QC-' + sourceId.slice(-6));
    res.product_code = doc.product || null;
    res.batch_number = doc.batchNumber || null;
    res.sample_type = doc.sampleType || 'IN_PROCESS';
    res.result = doc.status || 'PASS';
  } else if (table === 'inventory_items') {
    res.item_code = doc.item_code || doc.batchNumber || ('ITEM-' + sourceId.slice(-6));
    res.name = doc.name || doc.productName || 'Inventory Item';
    res.quantity_on_hand = doc.quantity || doc.availableQuantity || 0.0;
    res.reorder_level = doc.reorderLevel || 0.0;
    res.unit_of_measure = doc.unit || 'Units';
  } else if (table === 'inventory_transactions') {
    res.transaction_type = doc.transactionType || 'INBOUND_RECEIPT';
    res.quantity = doc.quantity || 0.0;
    res.batch_number = doc.batchNumber || null;
    res.remarks = doc.reason || doc.notes || null;
  } else if (table === 'calendar_special_days') {
    res.name = doc.name || 'Special Day';
    res.date = doc.date ? new Date(doc.date).toISOString().split('T')[0] : '2026-01-01';
    res.day_type = doc.dayType || doc.type || 'SPECIAL';
  } else if (table === 'company_calendar_events') {
    res.title = doc.title || 'Event';
    res.event_type = doc.eventType || doc.type || 'MEETING';
    const dateStr = doc.dateString || (doc.date ? new Date(doc.date).toISOString().split('T')[0] : '2026-01-01');
    const timeStr = doc.startTime && doc.startTime.includes(':') ? (doc.startTime.length === 5 ? doc.startTime : doc.startTime.padStart(5, '0')) : '09:00';
    res.start_time = `${dateStr}T${timeStr}:00.000Z`;
    const endTimeStr = doc.endTime && doc.endTime.includes(':') ? (doc.endTime.length === 5 ? doc.endTime : doc.endTime.padStart(5, '0')) : '17:00';
    res.end_time = `${dateStr}T${endTimeStr}:00.000Z`;
    res.location = doc.location || null;
    res.description = doc.description || null;

  } else if (table === 'employee_face_attendances') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'EMP-FACE';
    res.face_embedding = doc.embedding || doc.faceData || {};
  } else if (table === 'login_activities') {
    res.email = doc.email || doc.userEmail || (doc.userId ? 'user_' + doc.userId : 'system@bjk.com');
    res.status = doc.status || 'SUCCESS';
    res.ip_address = doc.ipAddress || doc.ip || null;
    res.user_agent = doc.userAgent || null;
    res.failure_reason = doc.reason || doc.failureReason || null;
  } else if (table === 'user_sessions') {
    res.session_token = doc.sessionToken || doc.token || doc.sessionId || ('sess_' + sourceId);
    res.ip_address = doc.ipAddress || doc.ip || null;
    res.user_agent = doc.userAgent || null;
    res.expires_at = doc.expiresAt ? new Date(doc.expiresAt).toISOString() : new Date(Date.now() + 86400000).toISOString();
  } else if (table === 'enquiries') {
    res.contact_name = doc.contactName || doc.name || 'Enquiry Contact';
    res.email = doc.email || null;
    res.phone = doc.phone || null;
    res.company_name = doc.companyName || null;
    res.message = doc.message || null;
  } else if (table === 'regulatory_records') {
    res.title = doc.title || doc.name || 'Regulatory Dossier';
    res.authority = doc.authority || null;
    res.status = doc.status || 'SUBMITTED';
  } else if (table === 'policy_clarifications') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.subject = doc.subject || doc.title || 'Policy Inquiry';
    res.question = doc.question || doc.message || 'Clarification requested';
    res.status = doc.status || 'ANSWERED';
  } else if (table === 'employee_support_requests') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.category = doc.category || 'GENERAL';
    res.subject = doc.subject || doc.title || 'Support Request';
    res.description = doc.description || doc.message || 'Help requested';
    res.status = doc.status || 'OPEN';
  } else if (table === 'canteen_settings') {
    res.is_enabled = doc.isEnabled !== false;
    res.lunch_start_time = doc.lunchStartTime || '12:30';
    res.lunch_end_time = doc.lunchEndTime || '14:30';
  } else if (table === 'knowledge_chunks') {
    res.title = doc.title || 'Knowledge Chunk';
    res.content = doc.content || doc.text || doc.chunk || 'Content';
  } else if (table === 'knowledge_entities') {
    res.name = doc.name || doc.title || 'Entity';
    res.entity_type = doc.entityType || doc.type || 'CONCEPT';
  } else if (table === 'leave_blackout_periods') {
    res.name = doc.name || 'Blackout Period';
    res.start_date = doc.startDate ? new Date(doc.startDate).toISOString().split('T')[0] : '2026-01-01';
    res.end_date = doc.endDate ? new Date(doc.endDate).toISOString().split('T')[0] : '2026-01-01';
  } else if (table === 'training_programs') {
    res.title = doc.title || doc.name;
    res.code = doc.code || null;
    res.category = doc.category || null;
    res.duration_hours = doc.durationHours || 1.0;
    res.passing_score = doc.passingScore || 80.0;
  } else if (table === 'training_enrollments') {
    res.employee_code = doc.employeeCode || doc.employeeId || 'UNKNOWN';
    res.status = doc.status || 'ENROLLED';
    res.score = doc.score || null;
    res.completion_date = doc.completionDate ? new Date(doc.completionDate).toISOString().split('T')[0] : null;
  } else if (table === 'audit_logs') {
    res.actor_name = doc.actorName || doc.userName || null;
    res.actor_role = doc.actorRole || doc.userRole || null;
    res.actor_email = doc.actorEmail || doc.userEmail || null;
    res.action = doc.action || 'ACCESS';
    res.entity_type = doc.entityType || doc.resource || 'SYSTEM';
    res.entity_id = doc.entityId ? doc.entityId.toString() : null;
    res.ip_address = doc.ipAddress || doc.ip || null;
    res.user_agent = doc.userAgent || null;
    res.route = doc.route || doc.path || null;
    res.method = doc.method || null;
    res.previous_state = doc.previousState || {};
    res.new_state = doc.newState || {};
    res.diff = doc.diff || {};
    res.status = doc.status || 'SUCCESS';
  } else {
    // Generic fallback for any other table
    res.name = doc.name || doc.title || 'Record';
    res.payload = doc.payload || {};
  }

  // Preserve all remaining unmapped fields in legacy_extra
  if (!validCols || validCols.has('legacy_extra')) {
    res.legacy_extra = copy;
  }
  return res;
}


async function insertTargetRecord(pool, table, record, tableColumnsMap) {
  const validCols = tableColumnsMap ? tableColumnsMap.get(table) : null;
  const keys = Object.keys(record).filter(k => validCols ? validCols.has(k) : true);
  const values = keys.map(k => cleanValue(record[k]));
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const colList = keys.map(k => `"${k}"`).join(', ');

  // For audit_logs or append-only tables, always DO NOTHING to avoid triggering the immutability trigger
  if (table === 'audit_logs') {
    const sql = `
      INSERT INTO "${table}" (${colList})
      VALUES (${placeholders})
      ON CONFLICT (source_mongo_id) DO NOTHING;
    `;
    await pool.query(sql, values);
    return;
  }

  // Update set for ON CONFLICT DO UPDATE
  const updateCols = keys.filter(k => k !== 'id' && k !== 'source_mongo_id');
  let conflictClause = 'ON CONFLICT (source_mongo_id) DO NOTHING;';
  if (updateCols.length > 0) {
    const updateList = updateCols.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ');
    conflictClause = `ON CONFLICT (source_mongo_id) DO UPDATE SET ${updateList};`;
  }

  const sql = `
    INSERT INTO "${table}" (${colList})
    VALUES (${placeholders})
    ${conflictClause}
  `;

  await pool.query(sql, values);
}



module.exports = { runETL };

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry');
  runETL({ isDryRun })
    .then(res => {
      process.exit(res.success ? 0 : 1);
    })
    .catch(err => {
      console.error('[ETL Engine] FATAL:', err);
      process.exit(1);
    });
}
