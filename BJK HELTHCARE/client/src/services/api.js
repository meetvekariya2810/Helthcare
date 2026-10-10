import axios from 'axios';

// Base URL configured via environment or default to /api for Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Lightweight in-flight request deduplicator for identical concurrent GET requests
const inFlightRequests = new Map();
const originalGet = apiClient.get.bind(apiClient);
apiClient.get = function (url, config = {}) {
  if (!config.cancelToken && !config.signal && !config.responseType) {
    const key = url + (config.params ? JSON.stringify(config.params) : '');
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key);
    }
    const requestPromise = originalGet(url, config).finally(() => {
      inFlightRequests.delete(key);
    });
    inFlightRequests.set(key, requestPromise);
    return requestPromise;
  }
  return originalGet(url, config);
};

// Intercept requests to add JWT token and Request-ID
apiClient.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      sessionStorage.getItem('bjk_auth_token') ||
      sessionStorage.getItem('bjk_employee_token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('bjk_token') ||
      localStorage.getItem('bjk_auth_token') ||
      localStorage.getItem('bjk_employee_token') ||
      localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-ID'] = 'BJKE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors and normalize error messages (Step 11 & Step 26)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const url = error.config?.url || '';
    const method = error.config?.method?.toUpperCase() || 'GET';

    // Detailed diagnostic console logging
    console.error(
      `[API ERROR] ${method} ${url}`,
      'Status:', status || 'No Response (Network / CORS / Timeout)',
      'Backend Message:', error.response?.data?.message || error.message
    );

    let normalizedMessage = 'An unexpected error occurred. Please try again.';

    if (!error.response) {
      // Step 4 & Step 11: Network / Server unavailable
      normalizedMessage = 'Unable to connect to BJK Healthcare server. Please ensure the backend is running.';
    } else if (status === 409) {
      normalizedMessage = error.response.data?.message || 'An employee with this email already exists.';
    } else if (status === 401) {
      normalizedMessage = 'Your session does not have permission or has expired.';
      if (window.location.pathname !== '/login') {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem('bjk_token');
        sessionStorage.removeItem('bjk_user');
        sessionStorage.removeItem('bjk_auth_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('bjk_token');
        localStorage.removeItem('bjk_user');
      }
    } else if (status === 403) {
      if (error.response.data?.code === 'FIRST_LOGIN_PASSWORD_CHANGE_REQUIRED') {
        normalizedMessage = 'First-time login password change is required.';
      } else {
        normalizedMessage = error.response.data?.message || 'Access restricted: You do not have permission for this operation.';
      }
    } else if (status === 503) {
      normalizedMessage = 'Database is temporarily unavailable. Your information has not been lost.';
    } else if (status === 400 || status === 422) {
      normalizedMessage = error.response.data?.message || 'Please check the highlighted fields.';
    } else if (status >= 500) {
      normalizedMessage = error.response?.data?.message || 'Server error or database connection issue. Please verify database connectivity.';
    } else {
      normalizedMessage = error.response.data?.message || error.message;
    }

    error.normalizedMessage = normalizedMessage;
    return Promise.reject(error);
  }
);

// Export standard alias
const api = apiClient;

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout')
};

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  getQuickView: (id) => api.get(`/employees/${id}/quick-view`),
  getProfile: (id) => api.get(`/employees/${id}/profile`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  updatePersonal: (id, data) => api.put(`/employees/${id}/personal`, data),
  updateJob: (id, data) => api.put(`/employees/${id}/job`, data),
  updateContact: (id, data) => api.put(`/employees/${id}/contact`, data),
  updateWfh: (id, data) => api.put(`/employees/${id}/wfh`, data),
  updateFamily: (id, data) => api.put(`/employees/${id}/family`, data),
  updateEmergency: (id, data) => api.put(`/employees/${id}/emergency`, data),
  updateEducation: (id, data) => api.put(`/employees/${id}/education`, data),
  updateExperience: (id, data) => api.put(`/employees/${id}/experience`, data),
  updateTeam: (id, data) => api.put(`/employees/${id}/team`, data),
  updateSocial: (id, data) => api.put(`/employees/${id}/social`, data),
  updateStatus: (id, status, remarks) => api.patch(`/employees/${id}/status`, { status, remarks }),
  delete: (id) => api.delete(`/employees/${id}`),
  getIdCard: (id) => api.get(`/employees/${id}/id-card`),
  generateIdCard: (id, data) => api.post(`/employees/${id}/id-card`, data),
  getBusinessCard: (id) => api.get(`/employees/${id}/business-card`),
  generateBusinessCard: (id, data) => api.post(`/employees/${id}/business-card`, data),
  getDocuments: (id) => api.get(`/employees/${id}/documents`),
  uploadDocument: (id, data) => api.post(`/employees/${id}/documents`, data),
  getAudit: (id) => api.get(`/employees/${id}/audit`),
  exportBulkExcel: (params) => api.get('/employees/export', { params, responseType: 'blob' }),
  exportSingleExcel: (id) => api.get(`/employees/${id}/export`, { responseType: 'blob' }),
  downloadTemplate: () => api.get('/employees/template', { responseType: 'blob' }),
  importExcel: (formData) => api.post('/employees/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  testSave: () => api.post('/employees/test'),
  getUnclassified: () => api.get('/employees/unclassified'),
  classify: (id, category) => api.post(`/employees/${id}/classify`, { category }),
  bulkClassify: (classifications) => api.post('/employees/classify', { classifications }),
};

// Enterprise HR Onboarding API
export const onboardingAPI = {
  saveDraft: (data) => api.post('/hr/onboarding', data),
  getAll: (params) => api.get('/hr/onboarding', { params }),
  getById: (id) => api.get(`/hr/onboarding/${id}`),
  updateStep: (id, data) => api.put(`/hr/onboarding/${id}`, data),
  submit: (id) => api.post(`/hr/onboarding/${id}/submit`),
  verifyStep: (id, data) => api.post(`/hr/onboarding/${id}/verify-step`, data),
  approve: (id, data) => api.post(`/hr/onboarding/${id}/approve`, data),
  reject: (id, data) => api.post(`/hr/onboarding/${id}/reject`, data)
};

// HR Login Credentials & Employee Access Control API
export const credentialsAPI = {
  getAll: (params) => api.get('/hr/credentials', { params }),
  getStats: () => api.get('/hr/credentials/stats'),
  getById: (id) => api.get(`/hr/credentials/${id}`),
  create: (data) => api.post('/hr/credentials', data),
  update: (id, data) => api.put(`/hr/credentials/${id}`, data),
  updatePermissions: (id, data) => api.put(`/hr/credentials/${id}/permissions`, data),
  resetPassword: (id, data) => api.post(`/hr/credentials/${id}/reset-password`, data),
  updateStatus: (id, data) => api.post(`/hr/credentials/${id}/status`, data),
  bulkUpdate: (data) => api.post('/hr/credentials/bulk', data),
  getTemplates: () => api.get('/hr/credentials/templates'),
  getAudit: (id) => api.get(`/hr/credentials/${id}/audit`),
};

export const hrmsAPI = {
  // Dashboard
  getDashboard: () => api.get('/hrms/dashboard'),
  getDashboardWorkforce: (params) => api.get('/hrms/dashboard/workforce', { params }),
  getDashboardActivity: (params) => api.get('/hrms/dashboard/activity', { params }),
  getDashboardDataQuality: () => api.get('/hrms/dashboard/data-quality'),

  // Employees (Supports both /employees and /hrms/employees)
  getEmployees: (params) => api.get('/employees', { params }).catch(() => api.get('/hrms/employees', { params })),
  getEmployeeById: (id) => api.get(`/employees/${id}`).catch(() => api.get(`/hrms/employees/${id}`)),
  createEmployee: (data) => api.post('/employees', data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data),
  deleteEmployee: (id) => api.patch(`/employees/${id}/status`, { status: 'ARCHIVED' }),
  testEmployeeSave: () => api.post('/employees/test'),

  // Organization
  getDepartments: () => api.get('/hrms/organization/departments'),
  createDepartment: (data) => api.post('/hrms/organization/departments', data),
  getDesignations: (params) => api.get('/hrms/organization/designations', { params }),
  createDesignation: (data) => api.post('/hrms/organization/designations', data),
  getHierarchyTree: () => api.get('/hrms/organization/hierarchy'),

  // Attendance & Custom Report Engine
  getDailyAttendance: (params) => api.get('/hrms/attendance/today', { params }),
  // Core HRMS: Non-Technical Staff & Daily Attendance Management
  getCoreDashboard: (params) => api.get('/hrms/core/dashboard', { params }),
  getNonTechnicalStaff: (params) => api.get('/hrms/core/employees', { params }),
  createNonTechnicalStaff: (data) => api.post('/hrms/core/employees', data),
  deleteNonTechnicalStaff: (id) => api.delete(`/hrms/core/employees/${id}`),
  markAttendance: (data) => api.post('/hrms/core/attendance/mark', data),
  bulkMarkAttendance: (data) => api.post('/hrms/core/attendance/bulk', data),
  getAttendanceHistory: (params) => api.get('/hrms/core/attendance/history', { params }),
  getMyAttendance: (params) => api.get('/hrms/core/my-attendance', { params }),

  getAttendance: (params) => api.get('/hrms/attendance', { params }),
  getAttendanceDashboard: (params) => api.get('/hrms/attendance/dashboard', { params }),
  getAttendanceCommandCenter: (params) => api.get('/hrms/attendance/command-center', { params }),
  previewAttendanceReport: (data) => api.post('/hrms/attendance/reports/preview', data),
  generateAttendanceExcel: (data) => api.post('/hrms/attendance/reports/excel', data, { responseType: 'blob' }),
  generateAttendanceCsv: (data) => api.post('/hrms/attendance/reports/csv', data, { responseType: 'blob' }),
  getReportTemplates: (params) => api.get('/hrms/attendance/reports/templates', { params }),
  saveReportTemplate: (data) => api.post('/hrms/attendance/reports/templates', data),
  deleteReportTemplate: (id) => api.delete(`/hrms/attendance/reports/templates/${id}`),
  getReportHistory: (params) => api.get('/hrms/attendance/reports/history', { params }),
  getRegularizationRequests: (params) => api.get('/hrms/attendance/regularization', { params }),
  submitRegularization: (data) => api.post('/hrms/attendance/regularization', data),
  approveRegularization: (id, data) => api.put(`/hrms/attendance/regularization/${id}/approve`, data),
  rejectRegularization: (id, data) => api.put(`/hrms/attendance/regularization/${id}/reject`, data),
  markPunch: (data) => api.post('/hrms/attendance/punch', data),
  requestCorrection: (data) => api.post('/hrms/attendance/correction', data),

  // Attendance Upload, Verification & Rollback (BJK August 2026 Engine)
  validateAttendanceImport: (formDataOrData) => api.post('/attendance/import/validate', formDataOrData),
  executeAttendanceImport: (formDataOrData) => api.post('/attendance/import', formDataOrData),
  getAttendanceImports: () => api.get('/attendance/imports'),
  getAttendanceImportById: (batchId) => api.get(`/attendance/imports/${batchId}`),
  rollbackAttendanceImport: (batchId, reason) => api.post(`/attendance/imports/${batchId}/rollback`, { reason }),
  getAttendanceByEmployeeCode: (code) => api.get(`/attendance/employee/${code}`),
  getMonthAttendance: (year, month) => api.get(`/attendance/month/${year}/${month}`),
  getDepartmentAttendance: (deptId) => api.get(`/attendance/department/${deptId}`),
  getMasterValidation: (formData) => formData ? api.post('/attendance/master-validation', formData) : api.get('/attendance/master-validation'),
  enrichMasterProfiles: (formData) => api.post('/attendance/master-enrich', formData || {}),


  // Shifts & Rostering
  getShifts: () => api.get('/hrms/shifts'),
  createShift: (data) => api.post('/hrms/shifts', data),
  updateShift: (id, data) => api.put(`/hrms/shifts/${id}`, data),
  getRosters: (params) => api.get('/hrms/rostering', { params }),
  assignShift: (data) => api.post('/hrms/rostering/assign', data),
  requestShiftSwap: (data) => api.post('/hrms/rostering/swap-request', data),
  approveShiftSwap: (data) => api.put('/hrms/rostering/swap-approve', data),

  // Leave Management (Compatible with /api/hrms/leaves and /api/leave)
  getLeaveTypes: () => api.get('/leave/types').catch(() => api.get('/hrms/leaves/types')),
  getLeaveBalances: (employeeId) => api.get(`/leave/balances/${employeeId || ''}`).catch(() => api.get(`/hrms/leaves/balances/${employeeId || ''}`)),
  getLeaveRequests: (params) => api.get('/leave/requests', { params }).catch(() => api.get('/hrms/leaves/requests', { params })),
  applyLeave: (data) => api.post('/leave/requests', data).catch(() => api.post('/hrms/leaves/apply', data)),
  updateLeaveStatus: (id, data) => api.put(`/hrms/leaves/${id}/status`, data),

  // Leave Management Enterprise API
  leave: {
    getTypes: (params) => api.get('/leave/types', { params }),
    createType: (data) => api.post('/leave/types', data),
    updateType: (id, data) => api.put(`/leave/types/${id}`, data),
    getPolicies: () => api.get('/leave/policies'),
    savePolicy: (data) => api.post('/leave/policies', data),
    getHolidays: (params) => api.get('/leave/holidays', { params }),
    createHoliday: (data) => api.post('/leave/holidays', data),
    getBalances: (employeeId) => api.get(`/leave/balances/${employeeId || ''}`),
    getAllBalances: (params) => api.get('/leave/balances/all', { params }),
    adjustBalance: (employeeId, data) => api.post(`/leave/balances/${employeeId}/adjust`, data),
    getRequests: (params) => api.get('/leave/requests', { params }),
    getRequestById: (id) => api.get(`/leave/requests/${id}`),
    apply: (data) => api.post('/leave/requests', data),
    withdraw: (id, data) => api.patch(`/leave/requests/${id}/withdraw`, data),
    cancel: (id, data) => api.patch(`/leave/requests/${id}/cancel`, data),
    teamApprove: (id, data) => api.post(`/leave/requests/${id}/team-approve`, data),
    teamReject: (id, data) => api.post(`/leave/requests/${id}/team-reject`, data),
    deptApprove: (id, data) => api.post(`/leave/requests/${id}/department-approve`, data),
    deptReject: (id, data) => api.post(`/leave/requests/${id}/department-reject`, data),
    hrApprove: (id, data) => api.post(`/leave/requests/${id}/hr-approve`, data),
    hrReject: (id, data) => api.post(`/leave/requests/${id}/hr-reject`, data),
    hrOverride: (id, data) => api.post(`/leave/requests/${id}/hr-override`, data),
    bulkApprove: (data) => api.post('/leave/bulk-approve', data),
    getCalendar: (params) => api.get('/leave/calendar', { params }),
    getActivity: (params) => api.get('/leave/activity', { params }),
    getReports: (params) => api.get('/leave/reports', { params }),

    // 2026 Master Leave Ledger Integration
    getLedger: (params) => api.get('/leave/ledger', { params }),
    getEmployeeDetail: (employeeCode) => api.get(`/leave/employee/${employeeCode}`),
    getMonthlyMatrix: (params) => api.get('/leave/monthly', { params }),
    getDepartments: (params) => api.get('/leave/departments', { params }),
    getEmployeeAttendance: (employeeCode) => api.get(`/leave/attendance/employee/${employeeCode}`),
    importCSV: (formData) => api.post('/leave/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    exportCSV: (params) => api.get('/leave/export', { params, responseType: 'blob' }),

    // BJK-HR-POL-001 Policy & Controls API
    getPolicyConfig: () => api.get('/leave/policy-config'),
    getPolicyClarifications: () => api.get('/leave/policy-clarifications'),
    updatePolicyClarification: (key, data) => api.put(`/leave/policy-clarifications/${key}`, data),

    // Comp-Off API
    getCompOffAuthorizations: (params) => api.get('/leave/comp-off/authorizations', { params }),
    createCompOffAuthorization: (data) => api.post('/leave/comp-off/authorizations', data),
    approveCompOffRM: (id, data) => api.put(`/leave/comp-off/authorizations/${id}/approve-rm`, data),
    approveCompOffHR: (id, data) => api.put(`/leave/comp-off/authorizations/${id}/approve-hr`, data),
    verifyCompOffWork: (id, data) => api.put(`/leave/comp-off/authorizations/${id}/verify-work`, data),
    getCompOffCredits: (params) => api.get('/leave/comp-off/credits', { params }),

    // GMP Pharma Controls API
    getBlackoutPeriods: () => api.get('/leave/gmp/blackout-periods'),
    createBlackoutPeriod: (data) => api.post('/leave/gmp/blackout-periods', data),
    deleteBlackoutPeriod: (id) => api.delete(`/leave/gmp/blackout-periods/${id}`),
    getStaffingThresholds: () => api.get('/leave/gmp/staffing-thresholds'),
    updateStaffingThreshold: (dept, data) => api.put(`/leave/gmp/staffing-thresholds/${dept}`, data),
    getRefresherTrainings: (params) => api.get('/leave/gmp/refresher-trainings', { params }),
    verifyRefresherTraining: (id, data) => api.put(`/leave/gmp/refresher-trainings/${id}/verify`, data),
    getMedicalFitnessRecords: (params) => api.get('/leave/gmp/medical-fitness', { params }),
    verifyMedicalFitnessRecord: (id, data) => api.put(`/leave/gmp/medical-fitness/${id}/verify`, data),

    // Encashment & Regularization API
    getEncashments: (params) => api.get('/leave/encashment', { params }),
    createEncashment: (data) => api.post('/leave/encashment', data),
    approveEncashment: (id, data) => api.put(`/leave/encashment/${id}/approve`, data),
    getRegularizations: (params) => api.get('/leave/regularization', { params }),
    createRegularization: (data) => api.post('/leave/regularization', data),
    approveRegularization: (id, data) => api.put(`/leave/regularization/${id}/approve`, data),

    // Year-End & LOP API
    previewYearEnd: (params) => api.get('/leave/year-end/preview', { params }),
    executeYearEnd: (data) => api.post('/leave/year-end/execute', data),
    calculateLOP: (data) => api.post('/leave/lop/calculate', data),

    // Grievances API
    getGrievances: (params) => api.get('/leave/grievances', { params }),
    createGrievance: (data) => api.post('/leave/grievances', data),
    advanceGrievance: (id, data) => api.put(`/leave/grievances/${id}/advance`, data)
  },


  // Payroll
  getPayrollRuns: (params) => api.get('/hrms/payroll', { params }),
  getPayslipById: (id) => api.get(`/hrms/payroll/${id}`),
  processPayroll: (data) => api.post('/hrms/payroll/process', data),
  approvePayroll: (id, data) => api.put(`/hrms/payroll/${id}/approve`, data),
  getPayrollRules: () => api.get('/hrms/payroll/rules'),

  // Recruitment & Onboarding
  getJobs: (params) => api.get('/hrms/recruitment/jobs', { params }),
  createJob: (data) => api.post('/hrms/recruitment/jobs', data),
  getCandidates: (params) => api.get('/hrms/recruitment/candidates', { params }),
  updateCandidateStage: (id, data) => api.put(`/hrms/recruitment/candidates/${id}/stage`, data),
  getOnboardingList: (params) => api.get('/hrms/onboarding', { params }),
  updateOnboardingTask: (id, data) => api.put(`/hrms/onboarding/${id}/task`, data),

  // Training & LMS
  getTrainingPrograms: () => api.get('/hrms/training/programs'),
  getTrainingEnrollments: (params) => api.get('/hrms/training/enrollments', { params }),
  enrollEmployee: (data) => api.post('/hrms/training/enroll', data),
  completeTraining: (id, data) => api.put(`/hrms/training/complete/${id}`, data),

  // Credentials
  getCredentials: (params) => api.get('/hrms/credentials', { params }),
  addCredential: (data) => api.post('/hrms/credentials', data),
  verifyCredential: (id) => api.put(`/hrms/credentials/${id}/verify`),

  // Documents
  getDocuments: (params) => api.get('/hrms/documents', { params }),
  getMasterChecklist: () => api.get('/hrms/documents/master-checklist'),
  getEmployeeChecklists: (params) => api.get('/hrms/documents/employee-checklists', { params }),
  getEmployee12Documents: (employeeId) => api.get(`/hrms/documents/employee/${employeeId}`),
  verifyDocumentSlot: (data) => api.put('/hrms/documents/verify', data),
  uploadDocument: (data) => api.post('/hrms/documents', data),

  // Assets & Expenses
  getAssets: (params) => api.get('/hrms/assets', { params }),
  assignAsset: (data) => api.post('/hrms/assets/assign', data),
  getExpenses: (params) => api.get('/hrms/expenses', { params }),
  createExpense: (data) => api.post('/hrms/expenses', data),
  updateExpenseStatus: (id, data) => api.put(`/hrms/expenses/${id}/status`, data),

  // Performance
  getReviews: (params) => api.get('/hrms/performance', { params }),
  updateReview: (id, data) => api.put(`/hrms/performance/${id}`, data),

  // Analytics, Automation & Compliance
  getAnalytics: () => api.get('/hrms/analytics'),
  getAutomationRules: () => api.get('/hrms/automation/rules'),
  toggleAutomationRule: (id) => api.put(`/hrms/automation/rules/${id}/toggle`),
  runAutomationCycle: () => api.post('/hrms/automation/run-eval'),
  getCompliance: () => api.get('/hrms/compliance'),

  // Notifications
  getNotifications: (params) => api.get('/hrms/notifications', { params }),
  sendAnnouncement: (data) => api.post('/hrms/notifications/announcement', data),
  markNotificationRead: (id) => api.put(`/hrms/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/hrms/notifications/mark-all-read'),

  // AI Copilot
  askCopilot: (query) => api.post('/hrms/copilot/ask', { query }),

  // PDF & Document Generation & Exports
  downloadPayslipPDF: (id) => api.get(`/hrms/payroll/${id}/pdf`, { responseType: 'blob' }),
  downloadCertificatePDF: (id) => api.get(`/hrms/training/enrollments/${id}/certificate-pdf`, { responseType: 'blob' }),
  downloadOfferLetterPDF: (id) => api.get(`/hrms/recruitment/candidates/${id}/offer-pdf`, { responseType: 'blob' }),
  downloadExperiencePDF: (id) => api.get(`/hrms/employees/${id}/experience-pdf`, { responseType: 'blob' }),
  downloadReportPDF: (type) => api.get(`/hrms/reports/export?type=${type}&format=pdf`, { responseType: 'blob' }),
  downloadMasterDoc: () => api.get('/hrms/reports/master-doc', { responseType: 'blob' }),

  // Reports
  exportReport: (type, format) => `/api/hrms/reports/export?type=${type}&format=${format}`,

  // System Health & Audit
  getHealth: () => api.get('/health'),
  getDatabaseHealth: () => api.get('/health/database'),
  getServicesHealth: () => api.get('/health/services'),
  getAuditLogs: (params) => api.get('/audit', { params })
};

// Step 32: Product & Brochure Catalogue API
export const leaveAPI = hrmsAPI.leave;

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getCategories: () => api.get('/products/categories'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`)
};

// Step 27 & 31: Admin Database Management API
export const adminDatabaseAPI = {
  getStats: () => api.get('/admin/database/stats'),
  getCollections: () => api.get('/admin/database/collections'),
  queryCollection: (params) => api.get('/admin/database/query', { params }),
  triggerSeed: () => api.post('/admin/database/seed'),
  importData: (payload) => api.post('/admin/database/import', payload),
  exportCollection: (collection, format = 'json') => api.get(`/admin/database/export/${collection}?format=${format}`, { responseType: format === 'csv' ? 'blob' : 'json' })
};

// Enterprise Company & Facilities API
export const companyAPI = {
  getCompany: () => api.get('/company'),
  getFacilities: () => api.get('/facilities')
};

// Enterprise Unified Telemetry Dashboard API
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary')
};

// Manufacturing & Production MES API
export const productionAPI = {
  getOrders: (params) => api.get('/production/orders', { params }),
  createOrder: (data) => api.post('/production/orders', data),
  updateOrder: (id, data) => api.put(`/production/orders/${id}`, data),
  getLines: () => api.get('/production/lines'),
  createLine: (data) => api.post('/production/lines', data),
  getMachines: () => api.get('/production/machines'),
  updateMachineStatus: (id, data) => api.put(`/production/machines/${id}/status`, data),
  getBatches: (params) => api.get('/batches', { params }),
  getBatchById: (id) => api.get(`/batches/${id}`),
  createBatch: (data) => api.post('/batches', data),
  updateBatchStage: (id, data) => api.put(`/batches/${id}/stage`, data),
  submitBatchToQC: (id) => api.post(`/batches/${id}/submit-qc`),
  qaBatchRelease: (id, data) => api.post(`/batches/${id}/qa-release`, data)
};

// Warehouse & Inventory Management API
export const inventoryAPI = {
  getItems: (params) => api.get('/inventory', { params }),
  createItem: (data) => api.post('/inventory/items', data),
  getWarehouses: () => api.get('/inventory/warehouses'),
  createWarehouse: (data) => api.post('/inventory/warehouses', data),
  getTransactions: (params) => api.get('/inventory/transactions', { params }),
  recordTransaction: (data) => api.post('/inventory/transactions', data),
  getAlerts: () => api.get('/inventory/alerts')
};

// Quality Control LIMS API
export const qcAPI = {
  getSamples: (params) => api.get('/qc/samples', { params }),
  createSample: (data) => api.post('/qc/samples', data),
  getTests: () => api.get('/qc/tests'),
  enterResult: (data) => api.post('/qc/results', data),
  generateCOA: (sampleId) => api.post(`/qc/samples/${sampleId}/generate-coa`)
};

// Quality Assurance QMS API
export const qaAPI = {
  getDeviations: (params) => api.get('/qa/deviations', { params }),
  createDeviation: (data) => api.post('/qa/deviations', data),
  updateDeviation: (id, data) => api.put(`/qa/deviations/${id}`, data),
  getCAPAs: (params) => api.get('/qa/capas', { params }),
  createCAPA: (data) => api.post('/qa/capas', data),
  updateCAPA: (id, data) => api.put(`/qa/capas/${id}`, data),
  getSOPs: (params) => api.get('/qa/sops', { params }),
  createSOP: (data) => api.post('/qa/sops', data),
  getChangeControls: () => api.get('/qa/change-controls')
};

// Regulatory Affairs & eCTD API
export const regulatoryAPI = {
  getRecords: (params) => api.get('/regulatory/records', { params }),
  createRecord: (data) => api.post('/regulatory/records', data),
  updateRecord: (id, data) => api.put(`/regulatory/records/${id}`, data),
  getCountries: () => api.get('/regulatory/countries'),
  getDossiers: (params) => api.get('/regulatory/dossiers', { params }),
  createDossier: (data) => api.post('/regulatory/dossiers', data),
  getDeadlines: () => api.get('/regulatory/deadlines')
};

// CRM & Commercial Operations API
export const crmAPI = {
  getEnquiries: (params) => api.get('/crm/enquiries', { params }),
  createEnquiry: (data) => api.post('/crm/enquiries', data),
  updateEnquiry: (id, data) => api.put(`/crm/enquiries/${id}`, data),
  getLeads: (params) => api.get('/crm/leads', { params }),
  createLead: (data) => api.post('/crm/leads', data),
  updateLead: (id, data) => api.put(`/crm/leads/${id}`, data),
  getCustomers: (params) => api.get('/crm/customers', { params }),
  createCustomer: (data) => api.post('/crm/customers', data)
};

// Export Logistics API
export const exportAPI = {
  getShipments: (params) => api.get('/export/shipments', { params }),
  createShipment: (data) => api.post('/export/shipments', data),
  updateStatus: (id, data) => api.put(`/export/shipments/${id}/status`, data)
};

// Finance & Product Costing API
export const financeAPI = {
  getDashboard: (params) => api.get('/finance/dashboard', { params }),
  getInvoices: (params) => api.get('/finance/invoices', { params }),
  createInvoice: (data) => api.post('/finance/invoices', data),
  getReceivables: () => api.get('/finance/receivables'),
  getPayables: () => api.get('/finance/payables'),
  getProductCosts: (params) => api.get('/finance/product-costs', { params }),
  saveProductCost: (data) => api.post('/finance/product-costs', data),
  getExpenses: (params) => api.get('/finance/expenses', { params }),
  createExpense: (data) => api.post('/finance/expenses', data),
  getBankAccounts: () => api.get('/finance/bank-accounts'),
  reconcileBankAccount: (id) => api.put(`/finance/bank-accounts/${id}/reconcile`),
  getReports: () => api.get('/finance/reports')
};

// Document Vault API
export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data),
  newVersion: (id, data) => api.post(`/documents/${id}/version`, data),
  approve: (id) => api.put(`/documents/${id}/approve`)
};

// Task Management API
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data)
};

// Centralized Notifications API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/mark-all-read')
};

// AI Copilot API
export const aiAPI = {
  query: (query) => api.post('/ai/query', { query }),
  chat: (data) => api.post('/ai/chat', data)
};

// User & Role Admin API
export const userAdminAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  disableUser: (id) => api.delete(`/users/${id}`),
  getRoles: () => api.get('/roles'),
  getPermissions: () => api.get('/permissions')
};

// Canteen Management API (Employee, HR & Dedicated Canteen Department)
export const canteenAPI = {
  // Employee Self-Service
  lunchIn: (data) => api.post('/hrms/canteen/lunch-in', data),
  lunchOut: (data) => api.post('/hrms/canteen/lunch-out', data),
  getMyToday: () => api.get('/hrms/canteen/my-today'),
  getMyHistory: (params) => api.get('/hrms/canteen/my-history', { params }),
  getMySummary: (params) => api.get('/hrms/canteen/my-summary', { params }),

  // HR & Canteen Management Shared
  getTodayHR: (params) => api.get('/hrms/canteen/today', { params }),
  getHistoryHR: (params) => api.get('/hrms/canteen/history', { params }),
  getDepartmentSummary: (params) => api.get('/hrms/canteen/department-summary', { params }),
  finalizeDay: (data) => api.post('/hrms/canteen/finalize', data),
  reopenDay: (data) => api.post('/hrms/canteen/reopen', data),
  correctRecord: (data) => api.post('/hrms/canteen/correction', data),
  exportExcel: (params) => api.get('/hrms/canteen/export', { params, responseType: 'blob' }),
  exportMonthlyExcel: (params) => api.get('/hrms/canteen/export-monthly', { params, responseType: 'blob' }),
  getAuditLogs: (params) => api.get('/hrms/canteen/audit', { params }),

  // Dedicated Canteen Department Operations
  getDashboard: (params) => api.get('/canteen/dashboard', { params }),
  getToday: (params) => api.get('/canteen/today', { params }),
  getEmployees: (params) => api.get('/canteen/employees', { params }),
  getEmployeeHistory: (employeeId, params) => api.get(`/canteen/employee/${employeeId}`, { params }),
  getHistory: (params) => api.get('/canteen/history', { params }),
  getDailyReport: (params) => api.get('/canteen/daily-report', { params }),
  getMonthlyReport: (params) => api.get('/canteen/monthly-report', { params }),
  getCanteenDepartmentSummary: (params) => api.get('/canteen/department-summary', { params }),
  exportDailyExcel: (params) => api.get('/canteen/export', { params, responseType: 'blob' }),
  exportMonthlyReportExcel: (params) => api.get('/canteen/export-monthly', { params, responseType: 'blob' }),
  getSettings: () => api.get('/canteen/settings'),
  updateSettings: (data) => api.put('/canteen/settings', data),
  resetAllData: () => api.post('/canteen/reset-all-data')
};

export const downloadBlobFile = (data, defaultFilename = 'BJK_Document.pdf') => {
  const isDocx = defaultFilename.endsWith('.docx');
  const isXlsx = defaultFilename.endsWith('.xlsx');
  const mimeType = isXlsx
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : isDocx
    ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    : 'application/pdf';

  const blob = new Blob([data], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

// Central HR Workforce Calendar API
export const workforceCalendarAPI = {
  getMasterOverview: (params) => api.get('/hr/calendar/master', { params }),
  getMonthCalendar: (params) => api.get('/hr/calendar/month', { params }),
  getEmployeeCalendar: (employeeCode, params) => api.get(`/hr/calendar/employee/${employeeCode}`, { params }),
  getSchedules: (params) => api.get('/hr/calendar/schedules', { params }),
  createSchedule: (data) => api.post('/hr/calendar/schedules', data),
  updateSchedule: (id, data) => api.put(`/hr/calendar/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/hr/calendar/schedules/${id}`),
  getRosters: (params) => api.get('/hr/calendar/rosters', { params }),
  createRoster: (data) => api.post('/hr/calendar/rosters', data),
  assignRoster: (data) => api.post('/hr/calendar/rosters/assign', data),
  getHolidays: (params) => api.get('/hr/calendar/holidays', { params }),
  createHoliday: (data) => api.post('/hr/calendar/holidays', data),
  updateHoliday: (id, data) => api.put(`/hr/calendar/holidays/${id}`, data),
  deleteHoliday: (id) => api.delete(`/hr/calendar/holidays/${id}`),
  getSpecialDays: (params) => api.get('/hr/calendar/special-days', { params }),
  createSpecialDay: (data) => api.post('/hr/calendar/special-days', data),
  deleteSpecialDay: (id) => api.delete(`/hr/calendar/special-days/${id}`),
  getEvents: (params) => api.get('/hr/calendar/events', { params }),
  createEvent: (data) => api.post('/hr/calendar/events', data),
  deleteEvent: (id) => api.delete(`/hr/calendar/events/${id}`),
  createException: (data) => api.post('/hr/calendar/exceptions', data),
  getPendingLeaves: (params) => api.get('/hr/calendar/leaves/pending', { params }),
  approveLeave: (id, data) => api.post(`/hr/calendar/leaves/${id}/approve`, data),
  rejectLeave: (id, data) => api.post(`/hr/calendar/leaves/${id}/reject`, data),
  publishWizardCalendar: (data) => api.post('/hr/calendar/wizard/publish', data),
  getCalendarReports: (params) => api.get('/hr/calendar/reports', { params })
};

// HR Employee Bank Details Management API
export const hrBankAPI = {
  getAllBankDetails: (params) => api.get('/hr/bank-details', { params }),
  getEmployeeBankDetails: (employeeId) => api.get(`/hr/bank-details/${employeeId}`),
  updateEmployeeBankDetails: (employeeId, data) => api.put(`/hr/bank-details/${employeeId}`, data),
  verifyBankDetails: (employeeId, data) => api.post(`/hr/bank-details/${employeeId}/verify`, data),
  rejectBankDetails: (employeeId, data) => api.post(`/hr/bank-details/${employeeId}/reject`, data),
  requestCorrection: (employeeId, data) => api.post(`/hr/bank-details/${employeeId}/request-correction`, data)
};

export default api;


