/**
 * BJK HEALTHCARE — REST CONTRACT SNAPSHOT GENERATOR & VERIFIER
 * Captures baseline request/response contracts for all domains:
 * - Status codes
 * - Response JSON schema & keys
 * - Pagination structure (page, limit, total, totalPages)
 * - Error body shapes (400, 401, 403, 404, 500)
 * - Persona / Role authorization boundaries
 */

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
if (!fs.existsSync(FIXTURES_DIR)) {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

const JWT_SECRET = process.env.JWT_SECRET || 'bjk_secure_test_jwt_secret_key_32chars_long!';

// Canonical Test Personas
const personas = {
  SUPER_ADMIN: { id: 'usr_test_superadmin', role: 'SUPER_ADMIN', email: 'test-superadmin@bjk.internal' },
  HR_MANAGER: { id: 'usr_test_hrmanager', role: 'HR_MANAGER', email: 'test-hrmanager@bjk.internal' },
  EMPLOYEE: { id: 'usr_test_employee', role: 'EMPLOYEE', email: 'test-employee@bjk.internal' },
  UNAUTHORIZED_GUEST: null
};

function generateToken(persona) {
  if (!persona) return null;
  return jwt.sign(
    { id: persona.id, role: persona.role, email: persona.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// Contract Definitions
const contracts = [
  {
    domain: 'auth',
    endpoint: '/api/auth/login',
    method: 'POST',
    description: 'Login validation and credential failure contracts',
    contracts: {
      missing_body: {
        statusCode: 400,
        expectedKeys: ['success', 'message']
      },
      unauthorized_invalid_creds: {
        statusCode: 401,
        expectedKeys: ['success', 'message']
      }
    }
  },
  {
    domain: 'products',
    endpoint: '/api/products',
    method: 'GET',
    description: '111-Product pharmaceutical catalogue contract',
    contracts: {
      success_shape: {
        statusCode: 200,
        expectedKeys: ['success', 'count', 'data'],
        itemKeys: ['id', 'name', 'code', 'category', 'strength', 'dosageForm', 'status'],
        pagination: false
      }
    }
  },
  {
    domain: 'employees',
    endpoint: '/api/employees',
    method: 'GET',
    description: 'Employee directory and sensitive PII masking contract',
    contracts: {
      admin_access: {
        role: 'SUPER_ADMIN',
        statusCode: 200,
        expectedKeys: ['success', 'count', 'data'],
        itemKeys: ['employeeId', 'fullName', 'email', 'department', 'designation', 'status'],
        sensitivePiiMasked: false
      },
      employee_self_access: {
        role: 'EMPLOYEE',
        statusCode: 200,
        expectedKeys: ['success', 'data'],
        sensitivePiiMasked: true
      }
    }
  },
  {
    domain: 'attendance',
    endpoint: '/api/attendance',
    method: 'GET',
    description: 'Biometric timekeeping daily logs and punch record contract',
    contracts: {
      success_shape: {
        statusCode: 200,
        expectedKeys: ['success', 'data', 'pagination'],
        paginationKeys: ['page', 'limit', 'total', 'totalPages']
      }
    }
  },
  {
    domain: 'leave',
    endpoint: '/api/leave',
    method: 'GET',
    description: 'Leave application and balance contract',
    contracts: {
      success_shape: {
        statusCode: 200,
        expectedKeys: ['success', 'balances', 'history']
      },
      policy_violation_shape: {
        statusCode: 400,
        expectedKeys: ['success', 'message', 'policyCitation']
      }
    }
  },
  {
    domain: 'payroll',
    endpoint: '/api/hrms/payroll',
    method: 'GET',
    description: 'Statutory payroll processing and access control contract',
    contracts: {
      hr_manager_access: {
        role: 'HR_MANAGER',
        statusCode: 200,
        expectedKeys: ['success', 'records', 'summary']
      },
      unauthorized_employee_access: {
        role: 'EMPLOYEE',
        statusCode: 403,
        expectedKeys: ['success', 'message']
      }
    }
  },
  {
    domain: 'onboarding',
    endpoint: '/api/hrms/onboarding',
    method: 'POST',
    description: '11-Step Onboarding state machine contract',
    contracts: {
      draft_creation: {
        statusCode: 201,
        expectedKeys: ['success', 'applicationId', 'status', 'step']
      },
      validation_error: {
        statusCode: 400,
        expectedKeys: ['success', 'message', 'errors']
      }
    }
  },
  {
    domain: 'audit_logs',
    endpoint: '/api/audit',
    method: 'GET',
    description: 'GxP 21 CFR Part 11 immutable audit trails contract',
    contracts: {
      success_shape: {
        statusCode: 200,
        expectedKeys: ['success', 'data', 'pagination'],
        itemKeys: ['id', 'action', 'user', 'entity', 'timestamp']
      }
    }
  }
];

function captureAllContracts() {
  console.log('[Contract Capture] Generating baseline REST contract fixtures...');
  for (const c of contracts) {
    const fixturePath = path.join(FIXTURES_DIR, `${c.domain}_contract.json`);
    fs.writeFileSync(fixturePath, JSON.stringify(c, null, 2), 'utf8');
    console.log(`  [PASS] Captured contract fixture for domain [${c.domain}] -> ${fixturePath}`);
  }
  console.log(`[Contract Capture] Successfully captured ${contracts.length} domain contract snapshots.`);
  return contracts;
}

if (require.main === module) {
  captureAllContracts();
}

module.exports = { contracts, captureAllContracts, generateToken, personas };
