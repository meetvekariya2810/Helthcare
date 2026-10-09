/**
 * BJK Healthcare Enterprise Access Control Master Configuration
 * Centralized Definitions for Modules, Pages, Actions, Approvals, and Role Templates
 */

// Master List of Enterprise Modules & Pages
const MODULE_DEFINITIONS = [
  {
    id: 'dashboard',
    name: 'Executive & Operations Dashboard',
    path: '/dashboard',
    description: 'Executive overview, real-time plant KPIs, and operational dashboards',
    actions: ['view'],
    pages: [
      { id: 'executive_dashboard', name: 'Executive Overview', path: '/dashboard', actions: ['view'] },
      { id: 'operations_dashboard', name: 'Plant Operations Command', path: '/operations', actions: ['view'] },
      { id: 'factory_overview', name: 'Factory Live Status', path: '/factory', actions: ['view'] }
    ]
  },
  {
    id: 'production',
    name: 'Production & Manufacturing (eBR)',
    path: '/production',
    description: 'Electronic Batch Records (eBR), manufacturing orders, line statuses, and completions',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    pages: [
      { id: 'production_dashboard', name: 'Production Dashboard', path: '/production', actions: ['view', 'export'] },
      { id: 'production_orders', name: 'Production Orders', path: '/production', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { id: 'batch_scheduling', name: 'Batch Scheduling', path: '/production', actions: ['view', 'create', 'edit'] },
      { id: 'machine_status', name: 'Machine Status & Telemetry', path: '/production', actions: ['view', 'edit'] },
      { id: 'ebr', name: 'Electronic Batch Records (eBR)', path: '/production', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'production_completion', name: 'Production Completion & Handover', path: '/production', actions: ['view', 'edit', 'approve'] }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory & Warehouse Ledger',
    path: '/inventory',
    description: 'Raw materials, APIs, packaging materials, finished goods, and quarantine staging',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'transfer', 'adjust', 'release'],
    pages: [
      { id: 'inventory_dashboard', name: 'Warehouse Dashboard', path: '/inventory', actions: ['view', 'export'] },
      { id: 'raw_materials', name: 'Raw Materials & Active Pharmaceutical Ingredients', path: '/inventory', actions: ['view', 'create', 'edit'] },
      { id: 'packaging_materials', name: 'Packaging & Excipients', path: '/inventory', actions: ['view', 'create', 'edit'] },
      { id: 'finished_goods', name: 'Finished Pharmaceutical Goods', path: '/inventory', actions: ['view', 'create', 'edit', 'release'] },
      { id: 'stock_movements', name: 'Stock Movements & Transfers', path: '/inventory', actions: ['view', 'create', 'approve'] },
      { id: 'quarantine_sampling', name: 'Quarantine & Sampling Staging', path: '/inventory', actions: ['view', 'edit', 'approve'] }
    ]
  },
  {
    id: 'qc',
    name: 'Quality Control (QC / LIMS)',
    path: '/quality/qc',
    description: 'Sample registration, analytical testing, test results, OOS/OOT, and Certificate of Analysis (COA)',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'generate_coa', 'export'],
    pages: [
      { id: 'qc_dashboard', name: 'QC Command Center', path: '/quality/qc', actions: ['view', 'export'] },
      { id: 'sample_registration', name: 'Sample Registration & Logging', path: '/quality/qc', actions: ['view', 'create', 'edit'] },
      { id: 'qc_testing', name: 'Analytical Testing & Assignments', path: '/quality/qc', actions: ['view', 'create', 'edit'] },
      { id: 'qc_results', name: 'QC Test Results Entry', path: '/quality/qc', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'oos', name: 'Out of Specification (OOS)', path: '/quality/qc', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'oot', name: 'Out of Trend (OOT)', path: '/quality/qc', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'coa', name: 'Certificate of Analysis (COA) Generation', path: '/quality/qc', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'qc_reports', name: 'QC Stability & Release Reports', path: '/quality/qc', actions: ['view', 'export'] }
    ]
  },
  {
    id: 'qa',
    name: 'Quality Assurance (QA / QMS)',
    path: '/quality/qa',
    description: 'Deviations, Corrective and Preventive Actions (CAPA), Change Control, SOPs, and Batch Release',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    pages: [
      { id: 'qa_dashboard', name: 'QA Governance Dashboard', path: '/quality/qa', actions: ['view', 'export'] },
      { id: 'deviations', name: 'Deviation Management & Investigation', path: '/quality/qa', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'capa', name: 'CAPA (Corrective & Preventive Actions)', path: '/quality/qa', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'change_control', name: 'Change Control Procedures', path: '/quality/qa', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'batch_release', name: 'Commercial Batch Release & Disposition', path: '/quality/qa', actions: ['view', 'edit', 'approve'] },
      { id: 'sops', name: 'Standard Operating Procedures (SOP) Master', path: '/quality/qa', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'audits', name: 'Regulatory & Internal Audits', path: '/quality/qa', actions: ['view', 'create', 'edit', 'approve'] }
    ]
  },
  {
    id: 'regulatory',
    name: 'Regulatory Affairs',
    path: '/regulatory',
    description: 'Country registrations, CTD/eCTD/ACTD dossiers, health authority submissions, and renewals',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'submit', 'export'],
    pages: [
      { id: 'regulatory_dashboard', name: 'Regulatory Affairs Center', path: '/regulatory', actions: ['view', 'export'] },
      { id: 'country_registrations', name: 'Global Country Registrations', path: '/regulatory', actions: ['view', 'create', 'edit'] },
      { id: 'dossiers', name: 'eCTD / CTD / ACTD Dossiers', path: '/regulatory', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'submissions', name: 'Health Authority Submissions', path: '/regulatory', actions: ['view', 'create', 'edit', 'submit', 'approve'] },
      { id: 'renewals', name: 'Product Marketing Renewals & Variations', path: '/regulatory', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'compliance_deadlines', name: 'Compliance Deadlines Calendar', path: '/regulatory', actions: ['view', 'edit'] }
    ]
  },
  {
    id: 'crm',
    name: 'Commercial & CRM',
    path: '/crm',
    description: 'Leads, global customer accounts, website B2B inquiries, contract manufacturing (CMO) leads',
    actions: ['view', 'create', 'edit', 'delete', 'assign', 'close', 'export'],
    pages: [
      { id: 'crm_dashboard', name: 'Commercial Pipeline Dashboard', path: '/crm', actions: ['view', 'export'] },
      { id: 'leads', name: 'Commercial Leads & Opportunities', path: '/crm', actions: ['view', 'create', 'edit', 'assign'] },
      { id: 'website_enquiries', name: 'Website Inquiries & Pharma Requests', path: '/crm', actions: ['view', 'edit', 'assign', 'close'] },
      { id: 'customer_accounts', name: 'Distributor & Customer Accounts', path: '/crm', actions: ['view', 'create', 'edit'] },
      { id: 'cmo_enquiries', name: 'Contract Manufacturing (CMO) Requests', path: '/crm', actions: ['view', 'create', 'edit'] }
    ]
  },
  {
    id: 'export',
    name: 'Global Export Trade',
    path: '/export',
    description: 'International shipments, destination country orders, customs documentation, letters of credit',
    actions: ['view', 'create', 'edit', 'delete', 'ship', 'export'],
    pages: [
      { id: 'export_dashboard', name: 'Global Export Center', path: '/export', actions: ['view', 'export'] },
      { id: 'export_shipments', name: 'Export Consignments & Tracking', path: '/export', actions: ['view', 'create', 'edit', 'ship'] },
      { id: 'country_orders', name: 'Overseas Country Purchase Orders', path: '/export', actions: ['view', 'create', 'edit'] },
      { id: 'customs_docs', name: 'Customs & Letter of Credit (LC) Vault', path: '/export', actions: ['view', 'create', 'edit'] },
      { id: 'packing_lists', name: 'Packing Lists & Commercial Invoices', path: '/export', actions: ['view', 'create', 'edit', 'export'] }
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Accounting',
    path: '/finance',
    description: 'Commercial invoices, receivables, accounts payable, product batch costings, and financial reports',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    pages: [
      { id: 'finance_dashboard', name: 'Financial Operations Center', path: '/finance', actions: ['view', 'export'] },
      { id: 'invoices', name: 'Invoices & Receivables', path: '/finance', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'payments', name: 'Disbursements & Vendor Payments', path: '/finance', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'product_costing', name: 'Pharmaceutical Product Costing', path: '/finance', actions: ['view', 'create', 'edit'] },
      { id: 'financial_reports', name: 'Statutory & Profitability Reports', path: '/finance', actions: ['view', 'export'] }
    ]
  },
  {
    id: 'documents',
    name: 'Controlled Document Vault',
    path: '/documents',
    description: 'Secure vault for SOPs, certificates, product dossiers, validated batch records, and contracts',
    actions: ['view', 'upload', 'delete', 'approve', 'download', 'archive'],
    pages: [
      { id: 'vault_dashboard', name: 'Document Vault Overview', path: '/documents', actions: ['view', 'download'] },
      { id: 'sop_repository', name: 'Controlled SOP Repository', path: '/documents', actions: ['view', 'upload', 'approve', 'download'] },
      { id: 'coa_vault', name: 'Validated COA Archive', path: '/documents', actions: ['view', 'upload', 'download'] },
      { id: 'batch_records_vault', name: 'Executed Batch Records Archive', path: '/documents', actions: ['view', 'upload', 'download'] },
      { id: 'certificates_contracts', name: 'Regulatory Certificates & Contracts', path: '/documents', actions: ['view', 'upload', 'approve', 'download'] }
    ]
  },
  {
    id: 'ai_copilot',
    name: 'AI Copilot & Pharma Knowledge Brain',
    path: '/hrms/copilot',
    description: 'AI-assisted regulatory guidance, formula lookup, handbook search, and real-time operational copilot',
    actions: ['access'],
    pages: [
      { id: 'copilot_chat', name: 'Natural Language AI Assistant', path: '/hrms/copilot', actions: ['access'] },
      { id: 'regulatory_assistant', name: 'Pharmacopoeia & Guideline Search', path: '/hrms/copilot', actions: ['access'] },
      { id: 'pharma_knowledge_brain', name: 'BJK Healthcare Knowledge Brain', path: '/hrms/copilot', actions: ['access'] }
    ]
  },
  {
    id: 'hrms',
    name: 'HR & Employee Management',
    path: '/hr/employees',
    description: 'Employee Directory, Login Credentials, Attendance, Shifts, Leave, Payroll, and Org Structure',
    actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
    pages: [
      { id: 'hr_dashboard', name: 'HR Dashboard', path: '/dashboard', actions: ['view'] },
      { id: 'employees_directory', name: 'Employee Directory', path: '/hr/employees', actions: ['view', 'create', 'edit', 'delete'] },
      { id: 'login_credentials', name: 'Login Credentials & Access Control', path: '/hr/login-credentials', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
      { id: 'roles_permissions', name: 'Roles & Permissions', path: '/hr/roles', actions: ['view', 'edit'] },
      { id: 'approval_permissions', name: 'Approval Permissions Matrix', path: '/hr/approval-permissions', actions: ['view', 'edit'] },
      { id: 'access_audit', name: 'Access & Security Audit Trail', path: '/hr/access-audit', actions: ['view', 'export'] },
      { id: 'attendance_punch', name: 'Attendance & Biometrics', path: '/hrms/attendance', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'shift_management', name: 'Shifts & Rostering', path: '/hrms/shifts', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'leave_holiday', name: 'Leave Management & Holidays', path: '/hrms/leave', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'recruitment_ats', name: 'Recruitment & ATS', path: '/hrms/recruitment', actions: ['view', 'create', 'edit'] },
      { id: 'onboarding_portal', name: 'Onboarding & Probation', path: '/hrms/onboarding', actions: ['view', 'create', 'edit'] },
      { id: 'payroll_management', name: 'Payroll & Compensation', path: '/hrms/payroll', actions: ['view', 'create', 'edit', 'approve'] },
      { id: 'performance_training', name: 'Performance & Training', path: '/hrms/performance', actions: ['view', 'create', 'edit'] },
      { id: 'compliance_policy', name: 'Compliance & Official Handbook', path: '/hr/policies', actions: ['view', 'edit'] }
    ]
  }
];

// Dedicated Approval Responsibilities (Section 8)
const APPROVAL_DEFINITIONS = [
  // Production Approvals
  { key: 'production.order_approval', label: 'Production Order Approval', module: 'production', description: 'Approve execution of formulation production orders' },
  { key: 'production.batch_approval', label: 'Batch Record Approval', module: 'production', description: 'Authorize completed manufacturing batch records' },
  { key: 'production.completion_approval', label: 'Production Completion Approval', module: 'production', description: 'Authorize plant completion and handover to QC' },

  // QC Approvals
  { key: 'qc.result_approval', label: 'QC Test Result Approval', module: 'qc', description: 'Authorize analytical and microbial laboratory test results' },
  { key: 'qc.oos_approval', label: 'OOS / OOT Investigation Approval', module: 'qc', description: 'Approve Out of Specification and Out of Trend investigation findings' },
  { key: 'qc.coa_approval', label: 'Certificate of Analysis (COA) Approval', module: 'qc', description: 'Certify and digitally sign official product COAs' },

  // QA Approvals
  { key: 'qa.deviation_approval', label: 'Deviation Approval', module: 'qa', description: 'Approve root cause analysis and impact evaluation for deviations' },
  { key: 'qa.capa_approval', label: 'CAPA Approval', module: 'qa', description: 'Authorize corrective and preventive action plans and verifications' },
  { key: 'qa.change_control_approval', label: 'Change Control Approval', module: 'qa', description: 'Approve engineering, manufacturing, and operational change controls' },
  { key: 'qa.batch_release_approval', label: 'Commercial Batch Release Approval', module: 'qa', description: 'Execute final legal release or rejection of pharmaceutical batches' },
  { key: 'qa.audit_approval', label: 'Quality Audit Approval', module: 'qa', description: 'Approve internal and external regulatory audit responses' },

  // Regulatory Approvals
  { key: 'regulatory.dossier_approval', label: 'Dossier Filing Approval', module: 'regulatory', description: 'Authorize final CTD/eCTD registration dossier compilation' },
  { key: 'regulatory.submission_approval', label: 'Health Authority Submission Approval', module: 'regulatory', description: 'Approve submission to DCGI, FDA, MHRA, and international authorities' },
  { key: 'regulatory.renewal_approval', label: 'Marketing Authorization Renewal Approval', module: 'regulatory', description: 'Approve product marketing authorization renewal filings' },

  // Finance Approvals
  { key: 'finance.invoice_approval', label: 'Commercial Invoice Approval', module: 'finance', description: 'Authorize commercial invoices and payment settlements' },
  { key: 'finance.payment_approval', label: 'Vendor & Operational Payment Approval', module: 'finance', description: 'Approve vendor payments, raw material disbursements, and bank transfers' },
  { key: 'finance.expense_approval', label: 'Expense & Claim Approval', module: 'finance', description: 'Authorize employee and department expense reimbursements' },

  // HR Approvals
  { key: 'hr.employee_approval', label: 'Employee Onboarding Approval', module: 'hrms', description: 'Approve new employee offers, hires, and confirmations' },
  { key: 'hr.leave_approval', label: 'Statutory Leave Approval', module: 'hrms', description: 'Authorize employee leave and holiday requests' },
  { key: 'hr.attendance_approval', label: 'Attendance & Regularization Approval', module: 'hrms', description: 'Approve attendance regularization, overtime, and shift modifications' },
  { key: 'hr.login_access_approval', label: 'Login Access & Credential Approval', module: 'hrms', description: 'Approve user login provisioning, role assignments, and permission changes' }
];

// Team Head Capabilities (Section 11)
const TEAM_HEAD_CAPABILITIES = [
  { id: 'teamDashboard', label: 'Team Dashboard', description: 'View assigned team overview and activity' },
  { id: 'teamMembers', label: 'Team Members Directory', description: 'View and manage assigned direct report team members' },
  { id: 'teamAttendance', label: 'Team Attendance Supervision', description: 'Monitor and review daily team clock-ins and punches' },
  { id: 'teamTasks', label: 'Team Tasks & Assignments', description: 'Create and assign operational tasks to team members' },
  { id: 'teamPerformance', label: 'Team Performance Tracking', description: 'Track team deliverables and performance reviews' },
  { id: 'teamReports', label: 'Team Operational Reports', description: 'Generate and review team productivity reports' },
  { id: 'teamApprovals', label: 'Team Leave & Regularization Approvals', description: 'Approve leave and attendance regularization for direct reports' },
  { id: 'assignTask', label: 'Assign New Task', description: 'Directly dispatch tasks to employees in the team' },
  { id: 'reassignTask', label: 'Reassign Task', description: 'Rebalance workload by transferring tasks between team members' },
  { id: 'reviewWork', label: 'Review Employee Work', description: 'Inspect, sign-off or request revisions on employee task submissions' },
  { id: 'teamNotifications', label: 'Team Broadcast Notifications', description: 'Publish priority notices to the team' }
];

// Department Head Capabilities (Section 12)
const DEPARTMENT_HEAD_CAPABILITIES = [
  { id: 'deptDashboard', label: 'Department Dashboard', description: 'Executive department performance and operations overview' },
  { id: 'deptEmployees', label: 'Department Employees Directory', description: 'Complete roster of all personnel assigned to the department' },
  { id: 'deptKPIs', label: 'Department KPIs & Yield Tracking', description: 'Monitor department quality, yield, and SLA indicators' },
  { id: 'deptTasks', label: 'Department Workflow Oversight', description: 'Comprehensive visibility across all department tasks' },
  { id: 'deptReports', label: 'Department Operational & Audit Reports', description: 'Generate cross-shift departmental compliance reports' },
  { id: 'deptApprovals', label: 'Department Head Approvals', description: 'Final departmental sign-off for shifts, leaves, and requisitions' },
  { id: 'deptDocuments', label: 'Department Controlled Documents', description: 'Review and verify department-specific SOPs and logs' },
  { id: 'deptPerformance', label: 'Department Performance Reviews', description: 'Quarterly and annual performance appraisals' },
  { id: 'deptAnalytics', label: 'Department Analytics & Resource Allocation', description: 'Analyze headcount, overtime, and operational bottlenecks' },
  { id: 'deptNotifications', label: 'Department Broadcaster', description: 'Issue official departmental communications and safety alerts' }
];

// Configurable Role Default Templates (Section 10)
const ROLE_TEMPLATES = {
  EMPLOYEE: {
    roleName: 'EMPLOYEE',
    label: 'Employee',
    description: 'Basic operational access limited to profile, attendance, self-service, and AI Copilot',
    allowedModules: ['dashboard', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      ai_copilot: ['access']
    },
    allowedPages: ['executive_dashboard', 'copilot_chat', 'pharma_knowledge_brain'],
    approvalPermissions: [],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  TEAM_HEAD: {
    roleName: 'TEAM_HEAD',
    label: 'Team Head',
    description: 'Employee permissions + team-level management, task assignments, and team approvals',
    allowedModules: ['dashboard', 'ai_copilot', 'hrms'],
    moduleActions: {
      dashboard: ['view'],
      ai_copilot: ['access'],
      hrms: ['view']
    },
    allowedPages: ['executive_dashboard', 'operations_dashboard', 'employees_directory', 'attendance_punch', 'shift_management', 'leave_holiday', 'copilot_chat', 'pharma_knowledge_brain'],
    approvalPermissions: ['hr.leave_approval', 'hr.attendance_approval'],
    teamHeadAccess: {
      teamDashboard: true,
      teamMembers: true,
      teamAttendance: true,
      teamTasks: true,
      teamPerformance: true,
      teamReports: true,
      teamApprovals: true,
      assignTask: true,
      reassignTask: true,
      reviewWork: true,
      teamNotifications: true
    },
    departmentHeadAccess: {}
  },
  DEPARTMENT_HEAD: {
    roleName: 'DEPARTMENT_HEAD',
    label: 'Department Head',
    description: 'Department-wide operational visibility, departmental KPIs, approvals, and compliance oversight',
    allowedModules: ['dashboard', 'ai_copilot', 'hrms', 'documents'],
    moduleActions: {
      dashboard: ['view'],
      ai_copilot: ['access'],
      hrms: ['view', 'create', 'edit', 'approve'],
      documents: ['view', 'upload', 'download']
    },
    allowedPages: ['executive_dashboard', 'operations_dashboard', 'employees_directory', 'attendance_punch', 'shift_management', 'leave_holiday', 'vault_dashboard', 'sop_repository', 'copilot_chat', 'pharma_knowledge_brain'],
    approvalPermissions: ['hr.leave_approval', 'hr.attendance_approval'],
    teamHeadAccess: {
      teamDashboard: true,
      teamMembers: true,
      teamAttendance: true,
      teamTasks: true,
      teamPerformance: true,
      teamReports: true,
      teamApprovals: true,
      assignTask: true,
      reassignTask: true,
      reviewWork: true,
      teamNotifications: true
    },
    departmentHeadAccess: {
      deptDashboard: true,
      deptEmployees: true,
      deptKPIs: true,
      deptTasks: true,
      deptReports: true,
      deptApprovals: true,
      deptDocuments: true,
      deptPerformance: true,
      deptAnalytics: true,
      deptNotifications: true
    }
  },
  MANAGER: {
    roleName: 'MANAGER',
    label: 'Operations Manager',
    description: 'Managerial operational access + assigned workflow approvals and supervision',
    allowedModules: ['dashboard', 'production', 'inventory', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      production: ['view', 'create', 'edit', 'approve', 'export'],
      inventory: ['view', 'create', 'transfer'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: ['executive_dashboard', 'operations_dashboard', 'production_dashboard', 'production_orders', 'batch_scheduling', 'inventory_dashboard', 'vault_dashboard', 'copilot_chat'],
    approvalPermissions: ['production.order_approval', 'production.batch_approval'],
    teamHeadAccess: { teamDashboard: true, teamMembers: true, teamApprovals: true },
    departmentHeadAccess: { deptDashboard: true, deptTasks: true, deptReports: true }
  },
  HR: {
    roleName: 'HR',
    label: 'Human Resources (HR)',
    description: 'Employee management, login credentials, access control, attendance, payroll, and HR governance',
    allowedModules: ['dashboard', 'hrms', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      hrms: ['view', 'create', 'edit', 'delete', 'approve', 'export'],
      documents: ['view', 'upload', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'hr_dashboard',
      'employees_directory',
      'login_credentials',
      'roles_permissions',
      'approval_permissions',
      'access_audit',
      'attendance_punch',
      'shift_management',
      'leave_holiday',
      'recruitment_ats',
      'onboarding_portal',
      'payroll_management',
      'performance_training',
      'compliance_policy',
      'vault_dashboard',
      'copilot_chat'
    ],
    approvalPermissions: ['hr.employee_approval', 'hr.leave_approval', 'hr.attendance_approval', 'hr.login_access_approval'],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  QC: {
    roleName: 'QC',
    label: 'Quality Control (QC)',
    description: 'Sample registration, testing, test results, OOS, OOT, Certificate of Analysis (COA)',
    allowedModules: ['dashboard', 'qc', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      qc: ['view', 'create', 'edit', 'approve', 'generate_coa', 'export'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'qc_dashboard',
      'sample_registration',
      'qc_testing',
      'qc_results',
      'oos',
      'oot',
      'coa',
      'qc_reports',
      'vault_dashboard',
      'coa_vault',
      'copilot_chat'
    ],
    approvalPermissions: ['qc.result_approval', 'qc.oos_approval', 'qc.coa_approval'],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  QA: {
    roleName: 'QA',
    label: 'Quality Assurance (QA)',
    description: 'Deviations, CAPA, change controls, batch release approval, SOP verification, quality audit',
    allowedModules: ['dashboard', 'qa', 'qc', 'production', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      qa: ['view', 'create', 'edit', 'approve', 'export'],
      qc: ['view'],
      production: ['view'],
      documents: ['view', 'upload', 'approve', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'qa_dashboard',
      'deviations',
      'capa',
      'change_control',
      'batch_release',
      'sops',
      'audits',
      'qc_dashboard',
      'production_dashboard',
      'vault_dashboard',
      'sop_repository',
      'batch_records_vault',
      'copilot_chat'
    ],
    approvalPermissions: ['qa.deviation_approval', 'qa.capa_approval', 'qa.change_control_approval', 'qa.batch_release_approval', 'qa.audit_approval'],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  PRODUCTION: {
    roleName: 'PRODUCTION',
    label: 'Production & Manufacturing',
    description: 'Batch production orders, line operations, eBR execution, machine telemetry, and completions',
    allowedModules: ['dashboard', 'production', 'inventory', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      production: ['view', 'create', 'edit', 'approve', 'export'],
      inventory: ['view'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'operations_dashboard',
      'production_dashboard',
      'production_orders',
      'batch_scheduling',
      'machine_status',
      'ebr',
      'production_completion',
      'inventory_dashboard',
      'vault_dashboard',
      'copilot_chat'
    ],
    approvalPermissions: ['production.order_approval', 'production.batch_approval', 'production.completion_approval'],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  WAREHOUSE: {
    roleName: 'WAREHOUSE',
    label: 'Warehouse & Inventory',
    description: 'Raw materials, packaging, finished goods, batch quarantine, stock movement ledger',
    allowedModules: ['dashboard', 'inventory', 'production', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      inventory: ['view', 'create', 'edit', 'transfer', 'adjust', 'release'],
      production: ['view'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'inventory_dashboard',
      'raw_materials',
      'packaging_materials',
      'finished_goods',
      'stock_movements',
      'quarantine_sampling',
      'production_dashboard',
      'vault_dashboard',
      'copilot_chat'
    ],
    approvalPermissions: [],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  REGULATORY: {
    roleName: 'REGULATORY',
    label: 'Regulatory Affairs',
    description: 'Country registrations, CTD/eCTD/ACTD dossiers, health authority submissions, and renewals',
    allowedModules: ['dashboard', 'regulatory', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      regulatory: ['view', 'create', 'edit', 'submit', 'approve', 'export'],
      documents: ['view', 'upload', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'regulatory_dashboard',
      'country_registrations',
      'dossiers',
      'submissions',
      'renewals',
      'compliance_deadlines',
      'vault_dashboard',
      'certificates_contracts',
      'copilot_chat'
    ],
    approvalPermissions: ['regulatory.dossier_approval', 'regulatory.submission_approval', 'regulatory.renewal_approval'],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  CRM: {
    roleName: 'CRM',
    label: 'Commercial & CRM',
    description: 'Leads, customer accounts, website B2B inquiries, contract manufacturing inquiries',
    allowedModules: ['dashboard', 'crm', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      crm: ['view', 'create', 'edit', 'assign', 'close', 'export'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'crm_dashboard',
      'leads',
      'website_enquiries',
      'customer_accounts',
      'cmo_enquiries',
      'vault_dashboard',
      'copilot_chat'
    ],
    approvalPermissions: [],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  EXPORT: {
    roleName: 'EXPORT',
    label: 'Global Export Trade',
    description: 'International export shipments, customs clearance documents, packing lists, letters of credit',
    allowedModules: ['dashboard', 'export', 'crm', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      export: ['view', 'create', 'edit', 'ship', 'export'],
      crm: ['view'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'export_dashboard',
      'export_shipments',
      'country_orders',
      'customs_docs',
      'packing_lists',
      'crm_dashboard',
      'vault_dashboard',
      'copilot_chat'
    ],
    approvalPermissions: [],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  FINANCE: {
    roleName: 'FINANCE',
    label: 'Finance & Accounts',
    description: 'Invoices, receivables, vendor payments, product batch costing, and financial reporting',
    allowedModules: ['dashboard', 'finance', 'documents', 'ai_copilot'],
    moduleActions: {
      dashboard: ['view'],
      finance: ['view', 'create', 'edit', 'approve', 'export'],
      documents: ['view', 'download'],
      ai_copilot: ['access']
    },
    allowedPages: [
      'executive_dashboard',
      'finance_dashboard',
      'invoices',
      'payments',
      'product_costing',
      'financial_reports',
      'vault_dashboard',
      'copilot_chat'
    ],
    approvalPermissions: ['finance.invoice_approval', 'finance.payment_approval', 'finance.expense_approval'],
    teamHeadAccess: {},
    departmentHeadAccess: {}
  },
  SUPER_ADMIN: {
    roleName: 'SUPER_ADMIN',
    label: 'Super Administrator / Director',
    description: 'Full sovereign access across all company modules, pages, actions, and approvals',
    allowedModules: MODULE_DEFINITIONS.map(m => m.id),
    moduleActions: MODULE_DEFINITIONS.reduce((acc, m) => {
      acc[m.id] = [...m.actions];
      return acc;
    }, {}),
    allowedPages: MODULE_DEFINITIONS.flatMap(m => m.pages.map(p => p.id)),
    approvalPermissions: APPROVAL_DEFINITIONS.map(a => a.key),
    teamHeadAccess: {
      teamDashboard: true,
      teamMembers: true,
      teamAttendance: true,
      teamTasks: true,
      teamPerformance: true,
      teamReports: true,
      teamApprovals: true,
      assignTask: true,
      reassignTask: true,
      reviewWork: true,
      teamNotifications: true
    },
    departmentHeadAccess: {
      deptDashboard: true,
      deptEmployees: true,
      deptKPIs: true,
      deptTasks: true,
      deptReports: true,
      deptApprovals: true,
      deptDocuments: true,
      deptPerformance: true,
      deptAnalytics: true,
      deptNotifications: true
    }
  }
};

// Aliases for standard roles
ROLE_TEMPLATES.DIRECTOR = ROLE_TEMPLATES.SUPER_ADMIN;
ROLE_TEMPLATES.HR_ADMIN = ROLE_TEMPLATES.HR;
ROLE_TEMPLATES.HR_MANAGER = ROLE_TEMPLATES.HR;
ROLE_TEMPLATES.HR_EXECUTIVE = ROLE_TEMPLATES.HR;
ROLE_TEMPLATES.QC_MANAGER = ROLE_TEMPLATES.QC;
ROLE_TEMPLATES.QA_MANAGER = ROLE_TEMPLATES.QA;
ROLE_TEMPLATES.PRODUCTION_MANAGER = ROLE_TEMPLATES.PRODUCTION;
ROLE_TEMPLATES.WAREHOUSE_MANAGER = ROLE_TEMPLATES.WAREHOUSE;
ROLE_TEMPLATES.REGULATORY_MANAGER = ROLE_TEMPLATES.REGULATORY;
ROLE_TEMPLATES.SALES_MANAGER = ROLE_TEMPLATES.CRM;
ROLE_TEMPLATES.CRM_MANAGER = ROLE_TEMPLATES.CRM;
ROLE_TEMPLATES.EXPORT_MANAGER = ROLE_TEMPLATES.EXPORT;
ROLE_TEMPLATES.FINANCE_MANAGER = ROLE_TEMPLATES.FINANCE;
ROLE_TEMPLATES.DEPARTMENT_MANAGER = ROLE_TEMPLATES.DEPARTMENT_HEAD;
ROLE_TEMPLATES.TEAM_LEAD = ROLE_TEMPLATES.TEAM_HEAD;
ROLE_TEMPLATES.SENIOR_EMPLOYEE = ROLE_TEMPLATES.EMPLOYEE;

/**
 * Builds default access configuration object for a role
 */
const buildDefaultAccessConfig = (role, department) => {
  const normRole = (role || 'EMPLOYEE').toUpperCase().replace(/\s+/g, '_');
  const template = ROLE_TEMPLATES[normRole] || ROLE_TEMPLATES.EMPLOYEE;

  const modules = MODULE_DEFINITIONS.map(mod => {
    const isModuleAllowed = template.allowedModules.includes(mod.id);
    const modActionsAllowed = template.moduleActions?.[mod.id] || [];
    
    const actionsObj = {};
    for (const act of mod.actions) {
      actionsObj[act] = isModuleAllowed && modActionsAllowed.includes(act);
    }

    const pages = mod.pages.map(page => {
      const isPageAllowed = isModuleAllowed && (template.allowedPages.includes(page.id) || modActionsAllowed.includes('view'));
      const pageActionsObj = {};
      for (const pAct of page.actions) {
        pageActionsObj[pAct] = isPageAllowed && modActionsAllowed.includes(pAct);
      }
      return {
        id: page.id,
        name: page.name,
        path: page.path,
        enabled: isPageAllowed,
        actions: pageActionsObj
      };
    });

    return {
      id: mod.id,
      name: mod.name,
      path: mod.path,
      enabled: isModuleAllowed,
      actions: actionsObj,
      pages
    };
  });

  return {
    role: normRole,
    department: department || 'General',
    modules,
    approvalPermissions: [...template.approvalPermissions],
    teamHeadAccess: { ...(template.teamHeadAccess || {}) },
    departmentHeadAccess: { ...(template.departmentHeadAccess || {}) }
  };
};

/**
 * Resolves effective permissions for a user object.
 * Priority: user.accessConfig (HR custom overrides) > default role template > general RBAC
 */
const resolveEffectivePermissions = (user) => {
  if (!user) {
    return {
      allowedModules: [],
      allowedPages: [],
      allowedActions: {},
      approvalPermissions: [],
      teamHeadAccess: {},
      departmentHeadAccess: {},
      isSuperAdmin: false
    };
  }

  const roleUpper = (user.role || 'EMPLOYEE').toUpperCase().replace(/\s+/g, '_');
  const isSuperAdmin = roleUpper === 'SUPER_ADMIN' || roleUpper === 'DIRECTOR';

  if (isSuperAdmin) {
    const allModIds = MODULE_DEFINITIONS.map(m => m.id);
    const allPageIds = MODULE_DEFINITIONS.flatMap(m => m.pages.map(p => p.id));
    const allApprovals = APPROVAL_DEFINITIONS.map(a => a.key);
    const allActions = {};
    for (const m of MODULE_DEFINITIONS) {
      allActions[m.id] = [...m.actions];
    }

    return {
      allowedModules: allModIds,
      allowedPages: allPageIds,
      allowedActions: allActions,
      approvalPermissions: allApprovals,
      teamHeadAccess: {
        teamDashboard: true, teamMembers: true, teamAttendance: true, teamTasks: true,
        teamPerformance: true, teamReports: true, teamApprovals: true, assignTask: true,
        reassignTask: true, reviewWork: true, teamNotifications: true
      },
      departmentHeadAccess: {
        deptDashboard: true, deptEmployees: true, deptKPIs: true, deptTasks: true,
        deptReports: true, deptApprovals: true, deptDocuments: true, deptPerformance: true,
        deptAnalytics: true, deptNotifications: true
      },
      isSuperAdmin: true
    };
  }

  // If user has custom accessConfig set by HR
  if (user.accessConfig && typeof user.accessConfig === 'object') {
    // 1. Array of modules format: { modules: [{ id: 'qc', enabled: true, ... }] }
    if (Array.isArray(user.accessConfig.modules) && user.accessConfig.modules.length > 0) {
      const allowedModules = [];
      const allowedPages = [];
      const allowedActions = {};

      for (const mod of user.accessConfig.modules) {
        if (mod.enabled) {
          allowedModules.push(mod.id);
          const activeModActions = [];
          if (mod.actions && typeof mod.actions === 'object') {
            for (const [actionKey, isAllowed] of Object.entries(mod.actions)) {
              if (isAllowed) activeModActions.push(actionKey);
            }
          }
          allowedActions[mod.id] = activeModActions;

          if (Array.isArray(mod.pages)) {
            for (const pg of mod.pages) {
              if (pg.enabled) {
                allowedPages.push(pg.id);
              }
            }
          }
        }
      }

      const approvals = Array.isArray(user.accessConfig.approvalPermissions)
        ? user.accessConfig.approvalPermissions
        : (Array.isArray(user.approvalPermissions) ? user.approvalPermissions : []);

      const thAccess = user.accessConfig.teamHeadAccess || user.accessConfig.teamHead || {};
      const dhAccess = user.accessConfig.departmentHeadAccess || user.accessConfig.departmentHead || {};

      return {
        allowedModules,
        allowedPages,
        allowedActions,
        approvalPermissions: approvals,
        teamHeadAccess: thAccess,
        teamHeadCapabilities: thAccess,
        departmentHeadAccess: dhAccess,
        departmentHeadCapabilities: dhAccess,
        customConfig: user.accessConfig,
        isSuperAdmin: false
      };
    }

    // 2. Object key-value map format: { qc: { enabled: true, actions: { view: true } }, dashboard: { enabled: true } }
    const allowedModules = [];
    const allowedPages = [];
    const allowedActions = {};

    for (const [key, val] of Object.entries(user.accessConfig)) {
      if (['approvalPermissions', 'teamHead', 'teamHeadAccess', 'departmentHead', 'departmentHeadAccess', 'role', 'department'].includes(key)) {
        continue;
      }
      if (val && (val.enabled === true || val === true)) {
        allowedModules.push(key);
        const activeModActions = [];
        if (val.actions && typeof val.actions === 'object') {
          for (const [actionKey, isAllowed] of Object.entries(val.actions)) {
            if (isAllowed) activeModActions.push(actionKey);
          }
        } else {
          activeModActions.push('view');
        }
        allowedActions[key] = activeModActions;

        if (val.pages && typeof val.pages === 'object') {
          if (Array.isArray(val.pages)) {
            for (const pg of val.pages) {
              if (pg && (pg.enabled || typeof pg === 'string')) {
                allowedPages.push(pg.id || pg);
              }
            }
          } else {
            for (const [pageKey, pageEnabled] of Object.entries(val.pages)) {
              if (pageEnabled) allowedPages.push(pageKey);
            }
          }
        }
      }
    }

    if (allowedModules.length > 0 || user.accessConfig.teamHead || user.accessConfig.teamHeadAccess || user.accessConfig.departmentHead || user.accessConfig.departmentHeadAccess) {
      const approvals = Array.isArray(user.accessConfig.approvalPermissions)
        ? user.accessConfig.approvalPermissions
        : (Array.isArray(user.approvalPermissions) ? user.approvalPermissions : []);

      const thAccess = user.accessConfig.teamHeadAccess || user.accessConfig.teamHead || {};
      const dhAccess = user.accessConfig.departmentHeadAccess || user.accessConfig.departmentHead || {};

      return {
        allowedModules,
        allowedPages,
        allowedActions,
        approvalPermissions: approvals,
        teamHeadAccess: thAccess,
        teamHeadCapabilities: thAccess,
        departmentHeadAccess: dhAccess,
        departmentHeadCapabilities: dhAccess,
        customConfig: user.accessConfig,
        isSuperAdmin: false
      };
    }
  }

  // Fallback to role template
  const template = ROLE_TEMPLATES[roleUpper] || ROLE_TEMPLATES.EMPLOYEE;
  return {
    allowedModules: [...template.allowedModules],
    allowedPages: [...template.allowedPages],
    allowedActions: { ...template.moduleActions },
    approvalPermissions: [...(user.approvalPermissions?.length ? user.approvalPermissions : template.approvalPermissions)],
    teamHeadAccess: { ...(template.teamHeadAccess || {}) },
    teamHeadCapabilities: { ...(template.teamHeadAccess || {}) },
    departmentHeadAccess: { ...(template.departmentHeadAccess || {}) },
    departmentHeadCapabilities: { ...(template.departmentHeadAccess || {}) },
    customConfig: null,
    isSuperAdmin: false
  };
};

/**
 * Checks if a user has access to a specific module (e.g. 'qc', 'production', 'finance')
 */
const hasModuleAccess = (user, moduleId) => {
  if (!user || !user.isActive || user.isLocked || user.status === 'DISABLED' || user.status === 'SUSPENDED') {
    return false;
  }
  const effective = resolveEffectivePermissions(user);
  if (effective.isSuperAdmin) return true;
  return effective.allowedModules.includes(moduleId);
};

/**
 * Checks if a user has access to a specific page
 */
const hasPageAccess = (user, moduleId, pageId) => {
  if (!hasModuleAccess(user, moduleId)) return false;
  const effective = resolveEffectivePermissions(user);
  if (effective.isSuperAdmin) return true;
  return effective.allowedPages.includes(pageId);
};

/**
 * Checks if a user has permission to perform an action on a module
 */
const hasActionAccess = (user, moduleId, action) => {
  if (!hasModuleAccess(user, moduleId)) return false;
  const effective = resolveEffectivePermissions(user);
  if (effective.isSuperAdmin) return true;
  const moduleActions = effective.allowedActions[moduleId] || [];
  return moduleActions.includes(action);
};

/**
 * Checks if a user has a specific approval permission
 */
const hasApprovalAccess = (user, approvalKey) => {
  if (!user || !user.isActive || user.isLocked) return false;
  const effective = resolveEffectivePermissions(user);
  if (effective.isSuperAdmin) return true;
  return effective.approvalPermissions.includes(approvalKey);
};

module.exports = {
  MODULE_DEFINITIONS,
  APPROVAL_DEFINITIONS,
  TEAM_HEAD_CAPABILITIES,
  DEPARTMENT_HEAD_CAPABILITIES,
  ROLE_TEMPLATES,
  buildDefaultAccessConfig,
  resolveEffectivePermissions,
  hasModuleAccess,
  hasPageAccess,
  hasActionAccess,
  hasApprovalAccess
};
