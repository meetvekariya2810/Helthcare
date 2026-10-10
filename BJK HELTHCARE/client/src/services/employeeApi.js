import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const employeeApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

employeeApiClient.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem('bjk_employee_token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      localStorage.getItem('bjk_employee_token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('bjk_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Request-ID'] = 'BJKE-EMP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return config;
  },
  (error) => Promise.reject(error)
);

employeeApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/employee') && window.location.pathname !== '/login') {
      sessionStorage.removeItem('bjk_employee_token');
      sessionStorage.removeItem('bjk_employee_user');
      localStorage.removeItem('bjk_employee_token');
      localStorage.removeItem('bjk_employee_user');
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const employeeAuthAPI = {
  login: (data) => employeeApiClient.post('/employee/auth/login', data),
  changePassword: (data) => employeeApiClient.post('/employee/auth/change-password', data),
  sendOtp: (identifier) => employeeApiClient.post('/employee/auth/send-otp', { identifier }),
  verifyOtp: (identifier, otp) => employeeApiClient.post('/employee/auth/verify-otp', { identifier, otp }),
  forgotPassword: (identifier) => employeeApiClient.post('/employee/auth/forgot-password', { identifier }),
  resetPassword: (data) => employeeApiClient.post('/employee/auth/reset-password', data),
  getMe: () => employeeApiClient.get('/employee/auth/me'),
  logout: () => employeeApiClient.post('/employee/auth/logout'),
};

// Profile Service
export const employeeProfileAPI = {
  getProfile: () => employeeApiClient.get('/employee/profile'),
  updatePhoto: (data) => employeeApiClient.put('/employee/profile/photo', data),
  updatePersonal: (data) => employeeApiClient.put('/employee/profile/personal', data),
  updateEmergency: (data) => employeeApiClient.put('/employee/profile/emergency', data),
  updateFamily: (data) => employeeApiClient.put('/employee/profile/family', data),
  updateEducation: (data) => employeeApiClient.put('/employee/profile/education', data),
  updateExperience: (data) => employeeApiClient.put('/employee/profile/experience', data),
  updateNominees: (data) => employeeApiClient.put('/employee/profile/nominees', data),
  getBusinessCard: () => employeeApiClient.get('/employee/profile/business-card'),
};

// Attendance Service (100-Meter Factory Geofenced)
export const employeeAttendanceAPI = {
  getToday: () => employeeApiClient.get('/employee/attendance/today'),
  locationCheck: (data) => employeeApiClient.post('/employee/attendance/location-check', data),
  punchIn: (data) => employeeApiClient.post('/employee/attendance/punch-in', data),
  checkIn: (data) => employeeApiClient.post('/employee/attendance/punch-in', data),
  punchOut: (data) => employeeApiClient.post('/employee/attendance/punch-out', data),
  checkOut: (data) => employeeApiClient.post('/employee/attendance/punch-out', data),
  startBreak: () => employeeApiClient.post('/employee/attendance/start-break'),
  endBreak: () => employeeApiClient.post('/employee/attendance/end-break'),
  getHistory: (params) => employeeApiClient.get('/employee/attendance/history', { params }),
  getSummary: () => employeeApiClient.get('/employee/attendance/summary'),
  getFaceStatus: () => employeeApiClient.get('/employee/attendance/face-status'),
  registerFace: () => employeeApiClient.post('/employee/attendance/face-register'),
};

// Leave Service (Single Source of Truth HR Leave Engine)
export const employeeLeaveAPI = {
  getTypes: () => employeeApiClient.get('/employee/leave/types'),
  getHolidays: (params) => employeeApiClient.get('/employee/leave/holidays', { params }),
  calculateDays: (data) => employeeApiClient.post('/employee/leave/calculate-days', data),
  getBalance: () => employeeApiClient.get('/employee/leave/balance'),
  getLedger: () => employeeApiClient.get('/employee/leave/ledger'),
  getLeaves: () => employeeApiClient.get('/employee/leave'),
  getLeaveById: (id) => employeeApiClient.get(`/employee/leave/${id}`),
  apply: (data) => employeeApiClient.post('/employee/leave/apply', data),
  withdraw: (id, data) => employeeApiClient.post(`/employee/leave/${id}/withdraw`, data),
  cancel: (id, data) => employeeApiClient.post(`/employee/leave/${id}/cancel`, data),
  delete: (id) => employeeApiClient.delete(`/employee/leave/${id}`),
  uploadDocument: (formData) =>
    employeeApiClient.post('/employee/leave/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getTeamLeaves: () => employeeApiClient.get('/employee/leave/team'),
  approveTeamLeave: (id, data) => employeeApiClient.post(`/employee/leave/team/${id}/action`, data),
};

// Payroll Service
export const employeePayrollAPI = {
  getCurrent: () => employeeApiClient.get('/employee/payroll/current'),
  getPayslips: () => employeeApiClient.get('/employee/payroll/payslips'),
  downloadPayslip: (id) => employeeApiClient.get(`/employee/payroll/payslips/${id}/download`),
};

// Document Service
export const employeeDocumentAPI = {
  getDocuments: () => employeeApiClient.get('/employee/documents'),
  upload: (data) => employeeApiClient.post('/employee/documents/upload', data),
  delete: (id) => employeeApiClient.delete(`/employee/documents/${id}`),
  resetAll: () => employeeApiClient.post('/employee/documents/reset-all'),
};

// Task Service
export const employeeTaskAPI = {
  getTasks: () => employeeApiClient.get('/employee/tasks'),
  updateStatus: (id, status) => employeeApiClient.patch(`/employee/tasks/${id}/status`, { status }),
  addComment: (id, message) => employeeApiClient.post(`/employee/tasks/${id}/comment`, { message }),
};

// Support Service
export const employeeSupportAPI = {
  getRequests: () => employeeApiClient.get('/employee/support'),
  create: (data) => employeeApiClient.post('/employee/support', data),
  close: (id) => employeeApiClient.patch(`/employee/support/${id}/close`),
  addComment: (id, message) => employeeApiClient.post(`/employee/support/${id}/comment`, { message }),
};

// Notification & Announcement Service
export const employeeNotificationAPI = {
  getNotifications: () => employeeApiClient.get('/employee/notifications'),
  markAsRead: (id) => employeeApiClient.patch(`/employee/notifications/${id}/read`),
  markAllRead: () => employeeApiClient.patch('/employee/notifications/read-all'),
  getAnnouncements: () => employeeApiClient.get('/employee/notifications/announcements'),
};

// Team Service
export const employeeTeamAPI = {
  getTeam: () => employeeApiClient.get('/employee/team'),
};

// Settings Service
export const employeeSettingsAPI = {
  changePassword: (data) => employeeApiClient.post('/employee/settings/change-password', data),
  getLoginHistory: () => employeeApiClient.get('/employee/settings/login-history'),
  logoutOtherDevices: () => employeeApiClient.post('/employee/settings/logout-other-devices'),
};

// Shift Service
export const employeeShiftAPI = {
  getShift: () => employeeApiClient.get('/employee/shift'),
  requestSwap: (data) => employeeApiClient.post('/employee/shift/swap', data),
  getSwaps: () => employeeApiClient.get('/employee/shift/swaps'),
};

// Training & Compliance Service
export const employeeTrainingAPI = {
  getTrainings: () => employeeApiClient.get('/employee/training'),
  getCompliance: () => employeeApiClient.get('/employee/training/compliance'),
  startTraining: (id) => employeeApiClient.post(`/employee/training/${id}/start`),
  completeTraining: (id, score) => employeeApiClient.post(`/employee/training/${id}/complete`, { score }),
  getCertificate: (id) => employeeApiClient.get(`/employee/training/${id}/certificate`),
};

// Policies & SOP Service
export const employeePolicyAPI = {
  getPolicies: () => employeeApiClient.get('/employee/policies'),
  acknowledge: (policyNumber, data) => employeeApiClient.post(`/employee/policies/${policyNumber}/acknowledge`, data || {}),
};

// Employee AI Copilot Service
export const employeeCopilotAPI = {
  ask: (query) => employeeApiClient.post('/employee/copilot/ask', { query }),
};

// Employee Work Calendar API (Self-Service)
export const employeeCalendarAPI = {
  getMyCalendar: (params) => employeeApiClient.get('/employee/calendar', { params }),
  getMySchedule: () => employeeApiClient.get('/employee/calendar/schedule'),
  getMyTodaySummary: () => employeeApiClient.get('/employee/calendar/today'),
  getMyHolidays: (params) => employeeApiClient.get('/employee/calendar/holidays', { params }),
  getMyEvents: (params) => employeeApiClient.get('/employee/calendar/events', { params }),
  validateLeave: (data) => employeeApiClient.post('/employee/calendar/validate-leave', data),
};

// Employee Bank Details Service (Self-Service)
export const employeeBankAPI = {
  getBankDetails: () => employeeApiClient.get('/employee/bank-details'),
  saveBankDetails: (data) => employeeApiClient.post('/employee/bank-details', data),
  updateBankDetails: (data) => employeeApiClient.put('/employee/bank-details', data),
  submitBankDetails: (data) => employeeApiClient.post('/employee/bank-details/submit', data),
  lookupIFSC: (ifsc) => employeeApiClient.get(`/employee/bank-details/lookup-ifsc/${ifsc}`)
};

