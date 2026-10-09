/**
 * BJK Healthcare Enterprise Role-Based Access Control (RBAC)
 * Master Granular Permissions & Role Hierarchy for Pharmaceutical Operations
 */

const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  DIRECTOR: 'DIRECTOR',
  OPERATIONS_MANAGER: 'OPERATIONS_MANAGER',
  PRODUCTION_MANAGER: 'PRODUCTION_MANAGER',
  QC_MANAGER: 'QC_MANAGER',
  QA_MANAGER: 'QA_MANAGER',
  REGULATORY_MANAGER: 'REGULATORY_MANAGER',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  SALES_MANAGER: 'SALES_MANAGER',
  CRM_MANAGER: 'CRM_MANAGER',
  EXPORT_MANAGER: 'EXPORT_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  DOCUMENT_CONTROLLER: 'DOCUMENT_CONTROLLER',
  HR_ADMIN: 'HR_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  HR_EXECUTIVE: 'HR_EXECUTIVE',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  SENIOR_EMPLOYEE: 'SENIOR_EMPLOYEE',
  EMPLOYEE: 'EMPLOYEE',
  AUDITOR: 'AUDITOR',
  REGULATORY_VIEWER: 'REGULATORY_VIEWER',
  EXECUTIVE_VIEWER: 'EXECUTIVE_VIEWER',
  SYSTEM_ADMINISTRATOR: 'SYSTEM_ADMINISTRATOR',
  IT_ADMIN: 'IT_ADMIN',
  RECRUITER: 'RECRUITER',
  PAYROLL_ADMIN: 'PAYROLL_ADMIN',
  SUPPLY_CHAIN_MANAGER: 'SUPPLY_CHAIN_MANAGER',
  CANTEEN_ADMIN: 'CANTEEN_ADMIN'
};

const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_ARCHIVE: 'products.archive',

  // Production
  PRODUCTION_VIEW: 'production.view',
  PRODUCTION_CREATE: 'production.create',
  PRODUCTION_EDIT: 'production.edit',
  PRODUCTION_APPROVE: 'production.approve',

  // Inventory
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_TRANSFER: 'inventory.transfer',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_RELEASE: 'inventory.release',

  // QC (Quality Control)
  QC_VIEW: 'qc.view',
  QC_CREATE_SAMPLE: 'qc.create_sample',
  QC_ENTER_RESULT: 'qc.enter_result',
  QC_REVIEW: 'qc.review',
  QC_GENERATE_COA: 'qc.generate_coa',

  // QA (Quality Assurance)
  QA_VIEW: 'qa.view',
  QA_REVIEW: 'qa.review',
  QA_APPROVE_BATCH: 'qa.approve_batch',
  QA_REJECT_BATCH: 'qa.reject_batch',
  QA_MANAGE_CAPA: 'qa.manage_capa',

  // Regulatory
  REGULATORY_VIEW: 'regulatory.view',
  REGULATORY_CREATE: 'regulatory.create',
  REGULATORY_EDIT: 'regulatory.edit',
  REGULATORY_SUBMIT: 'regulatory.submit',
  REGULATORY_APPROVE: 'regulatory.approve',

  // Commercial & CRM
  CRM_VIEW: 'crm.view',
  CRM_CREATE: 'crm.create',
  CRM_EDIT: 'crm.edit',
  CRM_ASSIGN: 'crm.assign',
  CRM_CLOSE: 'crm.close',

  // Export
  EXPORT_VIEW: 'export.view',
  EXPORT_CREATE: 'export.create',
  EXPORT_EDIT: 'export.edit',
  EXPORT_SHIP: 'export.ship',

  // Finance
  FINANCE_VIEW: 'finance.view',
  FINANCE_CREATE_INVOICE: 'finance.create_invoice',
  FINANCE_APPROVE_INVOICE: 'finance.approve_invoice',
  FINANCE_VIEW_REPORTS: 'finance.view_reports',

  // Documents
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_REVIEW: 'documents.review',
  DOCUMENTS_APPROVE: 'documents.approve',
  DOCUMENTS_ARCHIVE: 'documents.archive',

  // Users & Roles
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DISABLE: 'users.disable',

  // Audit
  AUDIT_VIEW: 'audit.view',

  // Employee & HRMS Legacy / Compatible permissions
  EMPLOYEE_VIEW: 'employee:view',
  EMPLOYEE_CREATE: 'employee:create',
  EMPLOYEE_UPDATE: 'employee:update',
  EMPLOYEE_DELETE: 'employee:delete',
  EMPLOYEE_VIEW_SENSITIVE: 'employee:view_sensitive',
  EMPLOYEE_PERSONAL_VIEW: 'employee:personal_view',
  EMPLOYEE_PERSONAL_UPDATE: 'employee:personal_update',
  EMPLOYEE_DOCUMENT_VIEW: 'employee:document_view',
  EMPLOYEE_DOCUMENT_UPLOAD: 'employee:document_upload',
  EMPLOYEE_DOCUMENT_DELETE: 'employee:document_delete',
  EMPLOYEE_LOGIN_VIEW: 'employee:login_view',
  EMPLOYEE_ACTIVITY_VIEW: 'employee:activity_view',

  DEPARTMENT_VIEW: 'department:view',
  DEPARTMENT_CREATE: 'department:create',
  DEPARTMENT_UPDATE: 'department:update',
  DEPARTMENT_DELETE: 'department:delete',
  MANAGER_VIEW: 'manager:view',
  MANAGER_CREATE: 'manager:create',
  MANAGER_UPDATE: 'manager:update',

  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DISABLE: 'user:disable',
  USER_RESET_PASSWORD: 'user:reset_password',
  SECURITY_VIEW: 'security:view',
  SESSION_MANAGE: 'session:manage',

  ATTENDANCE_VIEW: 'attendance:view',
  ATTENDANCE_MARK: 'attendance:mark',
  ATTENDANCE_EDIT: 'attendance:edit',
  ATTENDANCE_APPROVE: 'attendance:approve',

  SHIFT_VIEW: 'shift:view',
  SHIFT_MANAGE: 'shift:manage',
  SHIFT_SWAP_REQUEST: 'shift:swap_request',
  SHIFT_SWAP_APPROVE: 'shift:swap_approve',
  ROSTER_VIEW: 'roster:view',
  ROSTER_MANAGE: 'roster:manage',
  ROSTER_PUBLISH: 'roster:publish',

  LEAVE_VIEW: 'leave:view',
  LEAVE_CREATE: 'leave:create',
  LEAVE_APPROVE: 'leave:approve',

  PAYROLL_VIEW_ALL: 'payroll:view_all',
  PAYROLL_VIEW_SELF: 'payroll:view_self',
  PAYROLL_PROCESS: 'payroll:process',
  PAYROLL_CONFIGURE: 'payroll:configure',

  RECRUITMENT_VIEW: 'recruitment:view',
  RECRUITMENT_MANAGE: 'recruitment:manage',
  ONBOARDING_VIEW: 'onboarding:view',
  ONBOARDING_MANAGE: 'onboarding:manage',

  PERFORMANCE_VIEW: 'performance:view',
  PERFORMANCE_REVIEW: 'performance:review',
  PERFORMANCE_MANAGE: 'performance:manage',

  TRAINING_VIEW: 'training:view',
  TRAINING_ENROLL: 'training:enroll',
  TRAINING_MANAGE: 'training:manage',

  CREDENTIAL_VIEW: 'credential:view',
  CREDENTIAL_VERIFY: 'credential:verify',
  CREDENTIAL_MANAGE: 'credential:manage',

  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_VERIFY: 'document:verify',

  ASSET_VIEW: 'asset:view',
  ASSET_MANAGE: 'asset:manage',
  EXPENSE_VIEW: 'expense:view',
  EXPENSE_CLAIM: 'expense:claim',
  EXPENSE_APPROVE: 'expense:approve',

  ANALYTICS_VIEW: 'analytics:view',
  AUTOMATION_VIEW: 'automation:view',
  AUTOMATION_MANAGE: 'automation:manage',
  COMPLIANCE_VIEW: 'compliance:view',
  COMPLIANCE_MANAGE: 'compliance:manage',
  COPILOT_ACCESS: 'copilot:access',

  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',

  // Employee Bank Details (Strictly additive)
  BANK_DETAILS_VIEW: 'bank_details:view',
  BANK_DETAILS_MANAGE: 'bank_details:manage',
  BANK_DETAILS_VERIFY: 'bank_details:verify'
};

// Granular mapping per role
const ALL_PERMISSIONS_LIST = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS = {
  // 1. DIRECTOR & SUPER_ADMIN: Full operational visibility
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS_LIST,
  [ROLES.DIRECTOR]: ALL_PERMISSIONS_LIST,

  // 2. OPERATIONS_MANAGER: Production, inventory, batch progress, tasks, reports (no regulatory master, no QA final release, no security config)
  [ROLES.OPERATIONS_MANAGER]: [
    'products.view',
    'production.view', 'production.create', 'production.edit',
    'inventory.view', 'inventory.create', 'inventory.transfer', 'inventory.adjust',
    'qc.view',
    'qa.view',
    'regulatory.view',
    'export.view',
    'documents.view', 'documents.upload',
    'tasks.view', 'tasks.manage',
    'analytics:view', 'copilot:access', 'audit.view',
    'employee:view', 'department:view', 'attendance:view', 'shift:view', 'roster:view'
  ],

  // 3. PRODUCTION_MANAGER: Orders, schedule batches, machine status, eBR, submit to QC (cannot QA release)
  [ROLES.PRODUCTION_MANAGER]: [
    'products.view',
    'production.view', 'production.create', 'production.edit',
    'inventory.view',
    'qc.view',
    'documents.view', 'documents.upload',
    'employee:view', 'department:view', 'attendance:view', 'shift:view', 'roster:view',
    'copilot:access'
  ],

  // 4. QC_MANAGER: Sample registration, test assignments, test results, mark OOS/OOT, generate COA, submit to QA
  [ROLES.QC_MANAGER]: [
    'products.view',
    'qc.view', 'qc.create_sample', 'qc.enter_result', 'qc.review', 'qc.generate_coa',
    'qa.view',
    'documents.view', 'documents.upload',
    'employee:view', 'department:view', 'attendance:view', 'shift:view', 'roster:view',
    'copilot:access'
  ],

  // 5. QA_MANAGER: Review QC & batch records, deviations, CAPA, change control, SOPs, audits, approve/reject batch release
  [ROLES.QA_MANAGER]: [
    'products.view',
    'production.view',
    'qc.view',
    'qa.view', 'qa.review', 'qa.approve_batch', 'qa.reject_batch', 'qa.manage_capa',
    'regulatory.view',
    'documents.view', 'documents.upload', 'documents.review', 'documents.approve',
    'audit.view', 'audit:view',
    'compliance:view', 'training:view', 'credential:view',
    'employee:view', 'department:view', 'attendance:view',
    'copilot:access'
  ],

  // 6. REGULATORY_MANAGER: Country registrations, CTD/eCTD/ACTD, dossiers, submissions, renewals, deadlines
  [ROLES.REGULATORY_MANAGER]: [
    'products.view',
    'regulatory.view', 'regulatory.create', 'regulatory.edit', 'regulatory.submit', 'regulatory.approve',
    'documents.view', 'documents.upload', 'documents.review',
    'audit.view',
    'employee:view', 'department:view', 'attendance:view',
    'copilot:access'
  ],

  // 7. WAREHOUSE_MANAGER: Raw materials, APIs, excipients, packaging, finished goods, stock movements, quarantine
  [ROLES.WAREHOUSE_MANAGER]: [
    'products.view',
    'inventory.view', 'inventory.create', 'inventory.transfer', 'inventory.adjust', 'inventory.release',
    'production.view',
    'documents.view', 'documents.upload',
    'employee:view', 'department:view', 'attendance:view', 'shift:view', 'roster:view',
    'copilot:access'
  ],

  // 8. CRM_MANAGER / SALES_MANAGER: Website enquiries, leads pipeline, customers, B2B partners, CMO enquiries
  [ROLES.CRM_MANAGER]: [
    'products.view',
    'crm.view', 'crm.create', 'crm.edit', 'crm.assign', 'crm.close',
    'documents.view',
    'copilot:access'
  ],
  [ROLES.SALES_MANAGER]: [
    'products.view',
    'crm.view', 'crm.create', 'crm.edit', 'crm.assign', 'crm.close',
    'documents.view',
    'copilot:access'
  ],

  // 9. EXPORT_MANAGER: Export shipments, country orders, customs documents, LC, packing lists
  [ROLES.EXPORT_MANAGER]: [
    'products.view',
    'export.view', 'export.create', 'export.edit', 'export.ship',
    'crm.view',
    'documents.view', 'documents.upload',
    'copilot:access'
  ],

  // 10. FINANCE_MANAGER: Invoices, receivables, payables, product costs, financial reports
  [ROLES.FINANCE_MANAGER]: [
    'products.view',
    'finance.view', 'finance.create_invoice', 'finance.approve_invoice', 'finance.view_reports',
    'payroll:view_all', 'expense:view', 'expense:approve',
    'analytics:view', 'documents.view', 'copilot:access'
  ],

  // 11. DOCUMENT_CONTROLLER: SOP, COA, batch records, dossiers, certificates, contracts, versions
  [ROLES.DOCUMENT_CONTROLLER]: [
    'products.view',
    'documents.view', 'documents.upload', 'documents.review', 'documents.approve', 'documents.archive',
    'audit.view',
    'copilot:access'
  ],

  // 12. HR_ADMIN & HR_MANAGER: Employees, departments, roles, user accounts, access permissions (no QC/QA/Finance/Reg editing)
  [ROLES.HR_ADMIN]: [
    'products.view',
    'users.view', 'users.create', 'users.edit', 'users.disable',
    'employee:view', 'employee:create', 'employee:update', 'employee:delete', 'employee:view_sensitive',
    'employee:personal_view', 'employee:personal_update', 'employee:document_view', 'employee:document_upload',
    'employee:login_view', 'employee:activity_view', 'department:view', 'department:create', 'department:update',
    'attendance:view', 'attendance:edit', 'attendance:approve', 'shift:view', 'shift:manage', 'roster:view',
    'roster:manage', 'leave:view', 'leave:create', 'leave:approve', 'payroll:view_all', 'payroll:process',
    'recruitment:view', 'recruitment:manage', 'onboarding:view', 'onboarding:manage', 'performance:view',
    'performance:manage', 'training:view', 'training:manage', 'credential:view', 'credential:verify',
    'document:view', 'document:upload', 'documents.view', 'documents.upload',
    'analytics:view', 'compliance:view', 'copilot:access', 'settings:view', 'settings:manage', 'audit.view', 'audit:view',
    'bank_details:view', 'bank_details:manage', 'bank_details:verify'
  ],
  [ROLES.HR_MANAGER]: [
    'products.view',
    'users.view', 'users.create', 'users.edit',
    'employee:view', 'employee:create', 'employee:update', 'employee:view_sensitive',
    'department:view', 'attendance:view', 'attendance:approve', 'shift:view', 'roster:view',
    'leave:view', 'leave:approve', 'payroll:view_all', 'recruitment:view', 'onboarding:view',
    'training:view', 'credential:view', 'documents.view', 'documents.upload',
    'analytics:view', 'compliance:view', 'copilot:access', 'audit.view',
    'bank_details:view', 'bank_details:manage', 'bank_details:verify'
  ],
  [ROLES.HR_EXECUTIVE]: [
    'employee:view', 'employee:create', 'employee:update', 'employee:document_view',
    'attendance:view', 'attendance:edit', 'shift:view', 'roster:view', 'leave:view',
    'recruitment:view', 'onboarding:view', 'training:view', 'documents.view', 'copilot:access',
    'bank_details:view'
  ],

  // 13. EMPLOYEE: Profile, tasks, attendance, leave, self payslip, training, notifications
  [ROLES.EMPLOYEE]: [
    'products.view',
    'self:view', 'attendance:mark', 'attendance:view', 'shift:view', 'shift:swap_request',
    'roster:view', 'leave:create', 'leave:view', 'payroll:view_self', 'training:view', 'training:enroll',
    'credential:view', 'document:view', 'expense:claim', 'copilot:access'
  ],
  [ROLES.SENIOR_EMPLOYEE]: [
    'products.view',
    'self:view', 'attendance:mark', 'attendance:view', 'shift:view', 'roster:view',
    'leave:create', 'leave:view', 'payroll:view_self', 'training:view', 'credential:view',
    'document:view', 'copilot:access'
  ],

  // 14. AUDITOR: Read-only access across all records, documents, batch history, QC, QA, regulatory, inventory, audit logs
  [ROLES.AUDITOR]: [
    'products.view', 'production.view', 'inventory.view', 'qc.view', 'qa.view',
    'regulatory.view', 'documents.view', 'audit.view', 'audit:view',
    'employee:view', 'attendance:view', 'compliance:view', 'analytics:view'
  ],

  // 15. REGULATORY_VIEWER: Read-only regulatory access
  [ROLES.REGULATORY_VIEWER]: [
    'products.view', 'regulatory.view', 'documents.view'
  ],

  // 16. EXECUTIVE_VIEWER: Dashboard-only overview (KPIs, production, inventory, quality, regulatory, CRM, export overview)
  [ROLES.EXECUTIVE_VIEWER]: [
    'products.view', 'production.view', 'inventory.view', 'qc.view', 'qa.view',
    'regulatory.view', 'crm.view', 'export.view', 'documents.view', 'analytics:view'
  ],

  // 17. SYSTEM_ADMINISTRATOR / IT_ADMIN: Technical config, users, roles, system settings, logs (no QA batch release)
  [ROLES.SYSTEM_ADMINISTRATOR]: [
    'products.view',
    'users.view', 'users.create', 'users.edit', 'users.disable',
    'security:view', 'session:manage', 'settings:view', 'settings:manage',
    'audit.view', 'audit:view', 'documents.view'
  ],
  [ROLES.IT_ADMIN]: [
    'users.view', 'users.create', 'users.edit', 'users.disable',
    'security:view', 'session:manage', 'audit.view', 'audit:view', 'copilot:access'
  ],

  [ROLES.RECRUITER]: [
    'employee:view', 'recruitment:view', 'recruitment:manage', 'onboarding:view', 'onboarding:manage', 'copilot:access'
  ],
  [ROLES.PAYROLL_ADMIN]: [
    'employee:view', 'employee:view_sensitive', 'payroll:view_all', 'payroll:process', 'payroll:configure',
    'expense:view', 'expense:approve', 'audit.view'
  ],
  [ROLES.DEPARTMENT_MANAGER]: [
    'products.view', 'employee:view', 'department:view', 'attendance:view', 'attendance:approve',
    'shift:view', 'roster:view', 'roster:manage', 'leave:view', 'leave:approve', 'training:view', 'copilot:access'
  ],
  [ROLES.MANAGER]: [
    'products.view', 'employee:view', 'department:view', 'attendance:view', 'attendance:approve',
    'shift:view', 'roster:view', 'leave:view', 'leave:approve', 'training:view', 'copilot:access'
  ],
  [ROLES.TEAM_LEAD]: [
    'employee:view', 'attendance:view', 'shift:view', 'roster:view', 'leave:view', 'training:view', 'copilot:access'
  ],
  [ROLES.SUPPLY_CHAIN_MANAGER]: [
    'products.view', 'inventory.view', 'inventory.create', 'inventory.transfer', 'inventory.adjust',
    'export.view', 'copilot:access'
  ],
  [ROLES.CANTEEN_ADMIN]: [
    'canteen.dashboard.view',
    'canteen.employeeData.view',
    'canteen.lunchRecords.view',
    'canteen.history.view',
    'canteen.dailyReports.view',
    'canteen.monthlyReports.view',
    'canteen.departmentSummary.view',
    'canteen.reports.generate',
    'canteen.excel.export',
    'canteen.settings.manage'
  ]
};

/**
 * Checks if a user with a given role has the required permission.
 * Handles both dot notation ("products.view") and colon notation ("product:view" / "employee:view").
 */
const hasPermission = (userRole, requiredPermission) => {
  if (!userRole) return false;
  if (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.DIRECTOR) return true;

  const permissions = ROLE_PERMISSIONS[userRole] || [];
  if (permissions.includes('*')) return true;
  if (permissions.includes(requiredPermission)) return true;

  // Check normalized variations (e.g. "product:read" vs "products.view")
  const dotForm = requiredPermission.replace(':', '.');
  const colonForm = requiredPermission.replace('.', ':');
  if (permissions.includes(dotForm) || permissions.includes(colonForm)) return true;

  // Custom aliases
  if (requiredPermission === 'product:delete' && (userRole === ROLES.SUPER_ADMIN || userRole === ROLES.DIRECTOR)) {
    return true;
  }

  return false;
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission
};
