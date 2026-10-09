/**
 * BJK Healthcare Enterprise HRMS - Role Dashboard & Navigation Configuration
 * Enforces role-based dashboard selection, data scopes, and route protection
 */

export const DATA_SCOPES = {
  SELF: 'SELF',
  TEAM: 'TEAM',
  DEPARTMENT: 'DEPARTMENT',
  FACILITY: 'FACILITY',
  COMPANY: 'COMPANY',
  SYSTEM: 'SYSTEM'
};

export const ROLE_CONFIG = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    dashboard: 'executive',
    scope: DATA_SCOPES.SYSTEM,
    scopeLabel: 'Executive Command',
    title: 'BJK Healthcare Executive Command Center',
    subtitle: 'Enterprise Multi-Facility Orchestration, Cross-Departmental Operations & System Administration',
    homeRoute: '/hrms'
  },
  DIRECTOR: {
    role: 'DIRECTOR',
    dashboard: 'executive',
    scope: DATA_SCOPES.SYSTEM,
    scopeLabel: 'Executive Command',
    title: 'BJK Healthcare Executive Command Center',
    subtitle: 'Executive Leadership & Multi-Facility Operations',
    homeRoute: '/hrms'
  },
  HR_ADMIN: {
    role: 'HR_ADMIN',
    dashboard: 'hr-manager',
    scope: DATA_SCOPES.COMPANY,
    scopeLabel: 'Workforce Operations',
    title: 'BJK Healthcare HR Command Center',
    subtitle: 'Live workforce orchestration, pharmaceutical GMP compliance verification, shift rostering, and intelligent operations.',
    homeRoute: '/hrms'
  },
  HR_MANAGER: {
    role: 'HR_MANAGER',
    dashboard: 'hr-manager',
    scope: DATA_SCOPES.COMPANY,
    scopeLabel: 'Workforce Operations',
    title: 'BJK Healthcare HR Command Center',
    subtitle: 'Live workforce orchestration, pharmaceutical GMP compliance verification, shift rostering, and intelligent operations.',
    homeRoute: '/hrms'
  },
  QA_MANAGER: {
    role: 'QA_MANAGER',
    dashboard: 'qa-manager',
    scope: DATA_SCOPES.DEPARTMENT,
    scopeLabel: 'Quality Operations',
    title: 'BJK Quality & Workforce Command Center',
    subtitle: 'Live Quality Operations, GMP/GLP Compliance, QA Staffing & Shift Validation',
    homeRoute: '/hrms'
  },
  QC_MANAGER: {
    role: 'QC_MANAGER',
    dashboard: 'qa-manager',
    scope: DATA_SCOPES.DEPARTMENT,
    scopeLabel: 'Quality Operations',
    title: 'BJK Quality & Workforce Command Center',
    subtitle: 'Analytical Lab Operations, GLP Compliance & Shift Rostering',
    homeRoute: '/hrms'
  },
  EMPLOYEE: {
    role: 'EMPLOYEE',
    dashboard: 'employee',
    scope: DATA_SCOPES.SELF,
    scopeLabel: 'Self Service',
    title: 'BJK Employee Self Service',
    subtitle: 'Personal Workforce Portal • Shifts, Attendance, Leaves, Training & Documents',
    homeRoute: '/hrms'
  }
};

export const getRoleConfig = (role) => {
  return ROLE_CONFIG[role] || ROLE_CONFIG.EMPLOYEE;
};
