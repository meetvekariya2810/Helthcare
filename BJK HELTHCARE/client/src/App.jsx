import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EmployeeAuthProvider } from './context/EmployeeAuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MainLayout } from './components/layout/MainLayout';
import { EmployeeLayout } from './components/employee/EmployeeLayout';
import { EmployeeProtectedRoute } from './components/employee/EmployeeProtectedRoute';

const lazyPage = (importFn, name) => React.lazy(() => importFn().then(m => ({ default: m[name] || m.default })));


// Employee Portal Pages
const EmployeeLogin = lazyPage(() => import('./pages/employee/EmployeeLogin'), 'EmployeeLogin');
const EmployeeDashboard = lazyPage(() => import('./pages/employee/EmployeeDashboard'), 'EmployeeDashboard');
const EmployeeProfilePage = lazyPage(() => import('./pages/employee/EmployeeProfilePage'), 'EmployeeProfilePage');
const EmployeeAttendancePage = lazyPage(() => import('./pages/employee/EmployeeAttendancePage'), 'EmployeeAttendancePage');
const EmployeeFaceAttendancePage = lazyPage(() => import('./pages/employee/EmployeeFaceAttendancePage'), 'EmployeeFaceAttendancePage');
const EmployeeShiftPage = lazyPage(() => import('./pages/employee/EmployeeShiftPage'), 'EmployeeShiftPage');
const EmployeeLeavePage = lazyPage(() => import('./pages/employee/EmployeeLeavePage'), 'EmployeeLeavePage');
const EmployeeTasksPage = lazyPage(() => import('./pages/employee/EmployeeTasksPage'), 'EmployeeTasksPage');
const EmployeePayrollPage = lazyPage(() => import('./pages/employee/EmployeePayrollPage'), 'EmployeePayrollPage');
const EmployeeDocumentsPage = lazyPage(() => import('./pages/employee/EmployeeDocumentsPage'), 'EmployeeDocumentsPage');
const EmployeeTrainingPage = lazyPage(() => import('./pages/employee/EmployeeTrainingPage'), 'EmployeeTrainingPage');
const EmployeePoliciesPage = lazyPage(() => import('./pages/employee/EmployeePoliciesPage'), 'EmployeePoliciesPage');
const EmployeeTeamPage = lazyPage(() => import('./pages/employee/EmployeeTeamPage'), 'EmployeeTeamPage');
const EmployeeCommunicationPage = lazyPage(() => import('./pages/employee/EmployeeCommunicationPage'), 'EmployeeCommunicationPage');
const EmployeeSupportPage = lazyPage(() => import('./pages/employee/EmployeeSupportPage'), 'EmployeeSupportPage');
const EmployeeSettingsPage = lazyPage(() => import('./pages/employee/EmployeeSettingsPage'), 'EmployeeSettingsPage');
const EmployeeIDCardPage = lazyPage(() => import('./pages/employee/EmployeeIDCardPage'), 'EmployeeIDCardPage');
const EmployeeCanteenPage = lazyPage(() => import('./pages/employee/EmployeeCanteenPage'), 'EmployeeCanteenPage');
const EmployeeCalendarPage = lazyPage(() => import('./pages/employee/EmployeeCalendarPage'), 'EmployeeCalendarPage');
const EmployeeIDCardManager = lazyPage(() => import('./pages/hrms/EmployeeIDCardManager'), 'EmployeeIDCardManager');
const PublicEmployeeVerification = lazyPage(() => import('./pages/PublicEmployeeVerification'), 'PublicEmployeeVerification');

// Digital Brain Pages
import { Login } from './pages/Login';
const ChangePasswordPage = lazyPage(() => import('./pages/auth/ChangePasswordPage'), 'ChangePasswordPage');

// Dedicated Canteen Portal Pages
const CanteenLogin = lazyPage(() => import('./pages/canteen/CanteenLogin'), 'CanteenLogin');
const CanteenDashboard = lazyPage(() => import('./pages/canteen/CanteenDashboard'), 'CanteenDashboard');
import { CanteenLayout } from './components/canteen/CanteenLayout';
import { CanteenProtectedRoute } from './components/canteen/CanteenProtectedRoute';

const CommandCenter = lazyPage(() => import('./pages/CommandCenter'), 'CommandCenter');
const DigitalBrainModules = lazyPage(() => import('./pages/DigitalBrainModules'), 'DigitalBrainModules');
const AuditLogs = lazyPage(() => import('./pages/AuditLogs'), 'AuditLogs');
const AdminDatabaseManager = lazyPage(() => import('./pages/AdminDatabaseManager'), 'AdminDatabaseManager');
const AccessRestricted = lazyPage(() => import('./pages/AccessRestricted'), 'AccessRestricted');
const FactoryPage = lazyPage(() => import('./pages/FactoryPage'), 'FactoryPage');
const ProductionPage = lazyPage(() => import('./pages/ProductionPage'), 'ProductionPage');
const QCPage = lazyPage(() => import('./pages/QCPage'), 'QCPage');
const QAPage = lazyPage(() => import('./pages/QAPage'), 'QAPage');
const RegulatoryPage = lazyPage(() => import('./pages/RegulatoryPage'), 'RegulatoryPage');
const InventoryPage = lazyPage(() => import('./pages/InventoryPage'), 'InventoryPage');
const CRMPage = lazyPage(() => import('./pages/CRMPage'), 'CRMPage');
const ExportPage = lazyPage(() => import('./pages/ExportPage'), 'ExportPage');
const FinancePage = lazyPage(() => import('./pages/FinancePage'), 'FinancePage');
const DocumentsPage = lazyPage(() => import('./pages/DocumentsPage'), 'DocumentsPage');
const AICopilotPage = lazyPage(() => import('./pages/AICopilotPage'), 'AICopilotPage');
const ProductsPage = lazyPage(() => import('./pages/ProductsPage'), 'ProductsPage');
const OperationsDashboard = lazyPage(() => import('./pages/OperationsDashboard'), 'OperationsDashboard');

// Department-Specific RBAC Dashboards
import { DepartmentRoute } from './components/common/DepartmentRoute';
const DashboardDispatcher = lazyPage(() => import('./pages/dashboards/DashboardDispatcher'), 'DashboardDispatcher');
const ProductionDashboard = lazyPage(() => import('./pages/dashboards/ProductionDashboard'), 'ProductionDashboard');
const QCDashboard = lazyPage(() => import('./pages/dashboards/QCDashboard'), 'QCDashboard');
const QADashboard = lazyPage(() => import('./pages/dashboards/QADashboard'), 'QADashboard');
const WarehouseDashboard = lazyPage(() => import('./pages/dashboards/WarehouseDashboard'), 'WarehouseDashboard');
const EngineeringDashboard = lazyPage(() => import('./pages/dashboards/EngineeringDashboard'), 'EngineeringDashboard');
const FinanceDashboard = lazyPage(() => import('./pages/dashboards/FinanceDashboard'), 'FinanceDashboard');
const ProcurementDashboard = lazyPage(() => import('./pages/dashboards/ProcurementDashboard'), 'ProcurementDashboard');
const RegulatoryDashboard = lazyPage(() => import('./pages/dashboards/RegulatoryDashboard'), 'RegulatoryDashboard');
const SalesDashboard = lazyPage(() => import('./pages/dashboards/SalesDashboard'), 'SalesDashboard');
const MicrobiologyDashboard = lazyPage(() => import('./pages/dashboards/MicrobiologyDashboard'), 'MicrobiologyDashboard');
const FacilitiesDashboard = lazyPage(() => import('./pages/dashboards/FacilitiesDashboard'), 'FacilitiesDashboard');

// HRMS Operations Pages
const HRDashboard = lazyPage(() => import('./pages/hrms/HRDashboard'), 'HRDashboard');
const Employees = lazyPage(() => import('./pages/hrms/Employees'), 'Employees');
const EmployeeProfile = lazyPage(() => import('./pages/hrms/EmployeeProfile'), 'EmployeeProfile');
const AddEmployeeWizard = lazyPage(() => import('./pages/hrms/AddEmployeeWizard'), 'AddEmployeeWizard');
const EmployeeHierarchy = lazyPage(() => import('./pages/hrms/EmployeeHierarchy'), 'EmployeeHierarchy');
const FormerEmployees = lazyPage(() => import('./pages/hrms/FormerEmployees'), 'FormerEmployees');
const Organization = lazyPage(() => import('./pages/hrms/Organization'), 'Organization');
const Attendance = lazyPage(() => import('./pages/hrms/Attendance'), 'Attendance');
const AttendanceCommandCenter = lazyPage(() => import('./pages/hrms/AttendanceCommandCenter'), 'AttendanceCommandCenter');
const AttendanceReportBuilder = lazyPage(() => import('./pages/hrms/AttendanceReportBuilder'), 'AttendanceReportBuilder');
const CoreHRMSDashboard = lazyPage(() => import('./pages/hrms/CoreHRMSDashboard'), 'CoreHRMSDashboard');
const DailyAttendanceManagement = lazyPage(() => import('./pages/hrms/DailyAttendanceManagement'), 'DailyAttendanceManagement');
const TodayPresentEmployees = lazyPage(() => import('./pages/hrms/TodayPresentEmployees'), 'TodayPresentEmployees');
const TodayAbsentEmployees = lazyPage(() => import('./pages/hrms/TodayAbsentEmployees'), 'TodayAbsentEmployees');
const AttendanceHistory = lazyPage(() => import('./pages/hrms/AttendanceHistory'), 'AttendanceHistory');
const NonTechnicalEmployees = lazyPage(() => import('./pages/hrms/NonTechnicalEmployees'), 'NonTechnicalEmployees');
const AttendanceReports = lazyPage(() => import('./pages/hrms/AttendanceReports'), 'AttendanceReports');
const MyHRMSDashboard = lazyPage(() => import('./pages/hrms/MyHRMSDashboard'), 'MyHRMSDashboard');
const Shifts = lazyPage(() => import('./pages/hrms/Shifts'), 'Shifts');
const Rostering = lazyPage(() => import('./pages/hrms/Rostering'), 'Rostering');
const LeaveManagement = lazyPage(() => import('./pages/hrms/LeaveManagement'), 'LeaveManagement');
const Payroll = lazyPage(() => import('./pages/hrms/Payroll'), 'Payroll');
const Recruitment = lazyPage(() => import('./pages/hrms/Recruitment'), 'Recruitment');
const Onboarding = lazyPage(() => import('./pages/hrms/Onboarding'), 'Onboarding');
const Performance = lazyPage(() => import('./pages/hrms/Performance'), 'Performance');
const Training = lazyPage(() => import('./pages/hrms/Training'), 'Training');
const Credentials = lazyPage(() => import('./pages/hrms/Credentials'), 'Credentials');
const Documents = lazyPage(() => import('./pages/hrms/Documents'), 'Documents');
const Assets = lazyPage(() => import('./pages/hrms/Assets'), 'Assets');
const Expenses = lazyPage(() => import('./pages/hrms/Expenses'), 'Expenses');
const EmployeeSelfService = lazyPage(() => import('./pages/hrms/EmployeeSelfService'), 'EmployeeSelfService');
const ManagerSelfService = lazyPage(() => import('./pages/hrms/ManagerSelfService'), 'ManagerSelfService');
const HRAnalytics = lazyPage(() => import('./pages/hrms/HRAnalytics'), 'HRAnalytics');
const HRAutomation = lazyPage(() => import('./pages/hrms/HRAutomation'), 'HRAutomation');
const HRCompliance = lazyPage(() => import('./pages/hrms/HRCompliance'), 'HRCompliance');
const HRAICopilot = lazyPage(() => import('./pages/hrms/HRAICopilot'), 'HRAICopilot');
const HRNotifications = lazyPage(() => import('./pages/hrms/HRNotifications'), 'HRNotifications');
const HRSettings = lazyPage(() => import('./pages/hrms/HRSettings'), 'HRSettings');
const HROffboarding = lazyPage(() => import('./pages/hrms/HROffboarding'), 'HROffboarding');
const HRDepartments = lazyPage(() => import('./pages/hrms/HRDepartments'), 'HRDepartments');
const HRRoles = lazyPage(() => import('./pages/hrms/HRRoles'), 'HRRoles');
const HRSessions = lazyPage(() => import('./pages/hrms/HRSessions'), 'HRSessions');
const SetupDepartments = lazyPage(() => import('./pages/hrms/SetupDepartments'), 'SetupDepartments');
const SetupSubDepartments = lazyPage(() => import('./pages/hrms/SetupSubDepartments'), 'SetupSubDepartments');

// HR Login Credentials & Employee Access Control Layer
const HRLoginCredentials = lazyPage(() => import('./pages/hrms/HRLoginCredentials'), 'HRLoginCredentials');
const HRApprovalPermissions = lazyPage(() => import('./pages/hrms/HRApprovalPermissions'), 'HRApprovalPermissions');
const HRAccessAudit = lazyPage(() => import('./pages/hrms/HRAccessAudit'), 'HRAccessAudit');

// BJK Policy-Driven HRMS Modules (Official Handbook)
const PolicyCenter = lazyPage(() => import('./pages/hrms/PolicyCenter'), 'PolicyCenter');
const HRDisciplinaryCenter = lazyPage(() => import('./pages/hrms/HRDisciplinaryCenter'), 'HRDisciplinaryCenter');
const HRPoshCenter = lazyPage(() => import('./pages/hrms/HRPoshCenter'), 'HRPoshCenter');
const HRMaternityCenter = lazyPage(() => import('./pages/hrms/HRMaternityCenter'), 'HRMaternityCenter');
const HRSafetyCenter = lazyPage(() => import('./pages/hrms/HRSafetyCenter'), 'HRSafetyCenter');
const HRSeparationCenter = lazyPage(() => import('./pages/hrms/HRSeparationCenter'), 'HRSeparationCenter');
const HRDiversityCenter = lazyPage(() => import('./pages/hrms/HRDiversityCenter'), 'HRDiversityCenter');
const HRPrivacySecurityCenter = lazyPage(() => import('./pages/hrms/HRPrivacySecurityCenter'), 'HRPrivacySecurityCenter');
const Holidays = lazyPage(() => import('./pages/hrms/Holidays'), 'Holidays');
const EmployeePortal = lazyPage(() => import('./pages/hrms/EmployeePortal'), 'EmployeePortal');
const HRCanteenManagement = lazyPage(() => import('./pages/hrms/HRCanteenManagement'), 'HRCanteenManagement');
const HRWorkforceCalendar = lazyPage(() => import('./pages/hrms/HRWorkforceCalendar'), 'HRWorkforceCalendar');

// Error Boundary to prevent display failures or stuck screens
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[BJK ErrorBoundary Caught Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
            <span className="text-2xl text-rose-400 font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Display Notice</h2>
          <p className="text-xs text-slate-400 mb-4 max-w-md">
            A temporary display error occurred during navigation. Click below to return to the sign-in portal.
          </p>
          {this.state.error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-left max-w-xl overflow-x-auto text-[11px] font-mono text-rose-200">
              <p className="font-bold text-rose-400">{this.state.error?.toString()}</p>
              <pre className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">{this.state.error?.stack}</pre>
            </div>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/login';
            }}
            className="px-5 py-2.5 bg-[#00A896] hover:bg-[#009B8D] text-white rounded-xl text-xs font-bold transition-all"
          >
            Return to Sign In
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected Route Component for Main Admin/HR Platform
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-bjk-teal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-slate-400">Loading BJK Digital Brain...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword) {
    return <Navigate to="/employee/change-password" replace />;
  }

  if (user.role === 'CANTEEN_ADMIN') {
    return <Navigate to="/canteen/dashboard" replace />;
  }

  // Department members and authorized staff have direct access to their dedicated department workspace
  const userDept = (user.department || '').toLowerCase();
  const isDepartmentUser = [
    'production',
    'manufacturing',
    'quality control',
    'qc',
    'quality assurance',
    'qa',
    'warehouse',
    'inventory',
    'engineering',
    'maintenance',
    'accounts',
    'finance',
    'purchase',
    'procurement',
    'regulatory',
    'sales',
    'micro',
    'admin',
    'facility'
  ].some(d => userDept.includes(d));

  const hasDigitalBrainAccess = 
    (user.role !== 'EMPLOYEE' && user.role !== 'SENIOR_EMPLOYEE') ||
    isDepartmentUser ||
    (user.allowedModules && user.allowedModules.length > 0) ||
    (user.accessConfig && Object.values(user.accessConfig).some(m => m && m.enabled));

  if (!hasDigitalBrainAccess && (user.role === 'EMPLOYEE' || user.role === 'SENIOR_EMPLOYEE')) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

// Permission & Role Aware Protected Route Component
const PermissionRoute = ({ permission, allowedRoles, module, children }) => {
  const { user, can, canAccessModule } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'DIRECTOR') {
    return children;
  }

  // 1. If explicit module check is requested:
  if (module) {
    if (!canAccessModule(module)) {
      return <AccessRestricted />;
    }
    // If HR explicitly granted access to this module for this user, allow access
    return children;
  }

  // 2. Check allowed roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <AccessRestricted />;
    }
  }

  // 3. Check permission if specified
  if (permission && !can(permission)) {
    return <AccessRestricted />;
  }

  return children;
};


const PageLoadingFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-slate-400">
    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold text-slate-400 tracking-wider">Loading Module...</span>
  </div>
);

export const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <EmployeeAuthProvider>
            <NotificationProvider>
            <React.Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public Auth & QR Verification Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/employee/change-password" element={<ChangePasswordPage />} />
              <Route path="/employee/login" element={<EmployeeLogin />} />
              <Route path="/canteen/login" element={<CanteenLogin />} />
              <Route path="/verify/employee/:employeeCode" element={<PublicEmployeeVerification />} />
              <Route path="/verify-id/:code" element={<PublicEmployeeVerification />} />

              {/* Dedicated BJK Healthcare Canteen Management Portal */}
              <Route
                path="/canteen"
                element={
                  <CanteenProtectedRoute>
                    <CanteenLayout />
                  </CanteenProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/canteen/dashboard" replace />} />
                <Route path="dashboard" element={<CanteenDashboard />} />
                <Route path="today" element={<CanteenDashboard />} />
                <Route path="employees" element={<CanteenDashboard />} />
                <Route path="daily" element={<CanteenDashboard />} />
                <Route path="monthly" element={<CanteenDashboard />} />
                <Route path="department" element={<CanteenDashboard />} />
                <Route path="export" element={<CanteenDashboard />} />
                <Route path="settings" element={<CanteenDashboard />} />
              </Route>

              {/* Dedicated BJK Healthcare Employee Self-Service Portal (Employee Only) */}
              <Route
                path="/employee"
                element={
                  <EmployeeProtectedRoute>
                    <EmployeeLayout />
                  </EmployeeProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/employee/dashboard" replace />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="calendar" element={<EmployeeCalendarPage />} />
                <Route path="profile" element={<EmployeeProfilePage />} />
                <Route path="id-card" element={<EmployeeIDCardPage />} />
                <Route path="attendance" element={<EmployeeAttendancePage />} />

                <Route path="attendance/history" element={<EmployeeAttendancePage />} />
                <Route path="attendance/regularization" element={<EmployeeAttendancePage />} />
                <Route path="attendance-face" element={<EmployeeFaceAttendancePage />} />
                <Route path="shift" element={<EmployeeShiftPage />} />
                <Route path="shift-swap" element={<EmployeeShiftPage />} />
                <Route path="leave" element={<EmployeeLeavePage />} />
                <Route path="leave/apply" element={<EmployeeLeavePage />} />
                <Route path="leave/requests" element={<EmployeeLeavePage />} />
                <Route path="leave/balance" element={<EmployeeLeavePage />} />
                <Route path="leave/calendar" element={<EmployeeLeavePage />} />
                <Route path="tasks" element={<EmployeeTasksPage />} />
                <Route path="payroll" element={<EmployeePayrollPage />} />
                <Route path="payslips" element={<EmployeePayrollPage />} />
                <Route path="documents" element={<EmployeeDocumentsPage />} />
                <Route path="training" element={<EmployeeTrainingPage />} />
                <Route path="compliance" element={<EmployeeTrainingPage />} />
                <Route path="performance" element={<EmployeeDashboard />} />
                <Route path="expenses" element={<EmployeeDashboard />} />
                <Route path="policies" element={<EmployeePoliciesPage />} />
                <Route path="team" element={<EmployeeTeamPage />} />
                <Route path="notifications" element={<EmployeeCommunicationPage />} />
                <Route path="announcements" element={<EmployeeCommunicationPage />} />
                <Route path="support" element={<EmployeeSupportPage />} />
                <Route path="canteen" element={<EmployeeCanteenPage />} />
                <Route path="settings" element={<EmployeeSettingsPage />} />
              </Route>

            {/* Authenticated Platform Application with MainLayout (Director, Admin, HRMS) */}
            <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
              <Route index element={<Navigate to="/login" replace />} />

              {/* Central Department & Role-Based Command Dashboards */}
              <Route path="dashboard" element={<DashboardDispatcher />} />
              <Route path="dashboard/hr" element={<DepartmentRoute department="hr"><HRDashboard /></DepartmentRoute>} />
              <Route path="dashboard/production" element={<DepartmentRoute department="production"><ProductionDashboard /></DepartmentRoute>} />
              <Route path="dashboard/quality-control" element={<DepartmentRoute department="quality-control"><QCDashboard /></DepartmentRoute>} />
              <Route path="dashboard/qc" element={<DepartmentRoute department="quality-control"><QCDashboard /></DepartmentRoute>} />
              <Route path="dashboard/quality-assurance" element={<DepartmentRoute department="quality-assurance"><QADashboard /></DepartmentRoute>} />
              <Route path="dashboard/qa" element={<DepartmentRoute department="quality-assurance"><QADashboard /></DepartmentRoute>} />
              <Route path="dashboard/warehouse" element={<DepartmentRoute department="warehouse"><WarehouseDashboard /></DepartmentRoute>} />
              <Route path="dashboard/inventory" element={<DepartmentRoute department="warehouse"><WarehouseDashboard /></DepartmentRoute>} />
              <Route path="dashboard/engineering" element={<DepartmentRoute department="engineering"><EngineeringDashboard /></DepartmentRoute>} />
              <Route path="dashboard/finance" element={<DepartmentRoute department="finance"><FinanceDashboard /></DepartmentRoute>} />
              <Route path="dashboard/accounts" element={<DepartmentRoute department="finance"><FinanceDashboard /></DepartmentRoute>} />
              <Route path="dashboard/procurement" element={<DepartmentRoute department="procurement"><ProcurementDashboard /></DepartmentRoute>} />
              <Route path="dashboard/purchase" element={<DepartmentRoute department="procurement"><ProcurementDashboard /></DepartmentRoute>} />
              <Route path="dashboard/regulatory" element={<DepartmentRoute department="regulatory"><RegulatoryDashboard /></DepartmentRoute>} />
              <Route path="dashboard/sales" element={<DepartmentRoute department="sales"><SalesDashboard /></DepartmentRoute>} />
              <Route path="dashboard/crm" element={<DepartmentRoute department="sales"><SalesDashboard /></DepartmentRoute>} />
              <Route path="dashboard/microbiology" element={<DepartmentRoute department="microbiology"><MicrobiologyDashboard /></DepartmentRoute>} />
              <Route path="dashboard/micro" element={<DepartmentRoute department="microbiology"><MicrobiologyDashboard /></DepartmentRoute>} />
              <Route path="dashboard/facilities" element={<DepartmentRoute department="facilities"><FacilitiesDashboard /></DepartmentRoute>} />
              <Route path="dashboard/admin" element={<DepartmentRoute department="facilities"><FacilitiesDashboard /></DepartmentRoute>} />

              {/* Digital Brain Platform Deep Routes */}
              <Route
                path="operations"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'OPERATIONS_MANAGER', 'PRODUCTION_MANAGER']}>
                    <OperationsDashboard />
                  </PermissionRoute>
                }
              />
              <Route
                path="factory"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'OPERATIONS_MANAGER', 'PRODUCTION_MANAGER']}>
                    <FactoryPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="production"
                element={
                  <PermissionRoute module="production" permission="production.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'OPERATIONS_MANAGER', 'PRODUCTION_MANAGER', 'EMPLOYEE']}>
                    <ProductionPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="quality/qc"
                element={
                  <PermissionRoute module="qc" permission="qc.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'OPERATIONS_MANAGER', 'QC_MANAGER', 'EMPLOYEE']}>
                    <QCPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="quality/qa"
                element={
                  <PermissionRoute module="qa" permission="qa.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'QA_MANAGER', 'EMPLOYEE']}>
                    <QAPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="regulatory"
                element={
                  <PermissionRoute module="regulatory" permission="regulatory.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'REGULATORY_MANAGER', 'REGULATORY_VIEWER', 'EMPLOYEE']}>
                    <RegulatoryPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="inventory"
                element={
                  <PermissionRoute module="inventory" permission="inventory.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'OPERATIONS_MANAGER', 'WAREHOUSE_MANAGER', 'EMPLOYEE']}>
                    <InventoryPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="crm"
                element={
                  <PermissionRoute module="crm" permission="crm.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'CRM_MANAGER', 'SALES_MANAGER', 'EMPLOYEE']}>
                    <CRMPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="export"
                element={
                  <PermissionRoute module="export" permission="export.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'EXPORT_MANAGER']}>
                    <ExportPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="finance"
                element={
                  <PermissionRoute module="finance" permission="finance.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'FINANCE_MANAGER', 'FINANCE', 'EMPLOYEE']}>
                    <FinancePage />
                  </PermissionRoute>
                }
              />
              <Route
                path="documents"
                element={
                  <PermissionRoute module="documents" permission="documents.view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'DOCUMENT_CONTROLLER', 'QA_MANAGER', 'QC_MANAGER', 'REGULATORY_MANAGER']}>
                    <DocumentsPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="products"
                element={
                  <PermissionRoute module="inventory" permission="products.view">
                    <ProductsPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="ai"
                element={
                  <PermissionRoute module="copilot">
                    <AICopilotPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="modules"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR']}>
                    <DigitalBrainModules />
                  </PermissionRoute>
                }
              />
              <Route
                path="audit-logs"
                element={
                  <PermissionRoute permission="audit:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'AUDITOR', 'HR_MANAGER']}>
                    <AuditLogs />
                  </PermissionRoute>
                }
              />
              <Route
                path="admin/database"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'AUDITOR']}>
                    <AdminDatabaseManager />
                  </PermissionRoute>
                }
              />

              {/* Role-Based Command Dashboards (Legacy Compatibility Mappings) */}
              <Route
                path="admin/dashboard"
                element={<DepartmentRoute department="facilities"><FacilitiesDashboard /></DepartmentRoute>}
              />
              <Route
                path="admin"
                element={<DepartmentRoute department="facilities"><FacilitiesDashboard /></DepartmentRoute>}
              />
              <Route
                path="director/dashboard"
                element={<DepartmentRoute department="hr"><HRDashboard /></DepartmentRoute>}
              />
              <Route
                path="director"
                element={<DepartmentRoute department="hr"><HRDashboard /></DepartmentRoute>}
              />
              <Route
                path="qa/dashboard"
                element={<DepartmentRoute department="quality-assurance"><QADashboard /></DepartmentRoute>}
              />
              <Route
                path="qa"
                element={<DepartmentRoute department="quality-assurance"><QADashboard /></DepartmentRoute>}
              />
              <Route
                path="finance/dashboard"
                element={<DepartmentRoute department="finance"><FinanceDashboard /></DepartmentRoute>}
              />
              <Route
                path="finance"
                element={
                  <PermissionRoute allowedRoles={['FINANCE_MANAGER', 'FINANCE', 'SUPER_ADMIN', 'DIRECTOR']}>
                    <Payroll />
                  </PermissionRoute>
                }
              />

              {/* Master HRMS & HR Command Center Routes */}
              <Route path="hrms" element={<CoreHRMSDashboard />} />
              <Route path="hrms/dashboard" element={<CoreHRMSDashboard />} />
              <Route path="hrms/attendance" element={<DailyAttendanceManagement />} />
              <Route path="hrms/attendance/today" element={<DailyAttendanceManagement />} />
              <Route path="hrms/attendance/present" element={<TodayPresentEmployees />} />
              <Route path="hrms/attendance/absent" element={<TodayAbsentEmployees />} />
              <Route path="hrms/attendance/history" element={<AttendanceHistory />} />
              <Route path="hrms/reports" element={<AttendanceReports />} />
              <Route path="hrms/reports/attendance" element={<AttendanceReports />} />
              <Route path="hrms/canteen" element={<HRCanteenManagement />} />
              <Route path="hrms/departments" element={<SetupDepartments />} />
              <Route path="hrms/designations" element={<Organization />} />
              <Route path="hrms/leave" element={<LeaveManagement />} />
              <Route path="hrms/audit" element={<AuditLogs />} />
              <Route path="hrms/settings" element={<HRSettings />} />
              <Route path="hrms/my" element={<MyHRMSDashboard />} />

              <Route path="hr" element={<HRDashboard />} />
              <Route path="hr/canteen" element={<HRCanteenManagement />} />
              <Route path="hr/attendance/today" element={<DailyAttendanceManagement />} />
              <Route path="hr/attendance/present" element={<TodayPresentEmployees />} />
              <Route path="hr/attendance/absent" element={<TodayAbsentEmployees />} />
              <Route path="hr/attendance/history" element={<AttendanceHistory />} />

              {/* HR Master Routes */}
              <Route
                path="hr/employees"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <Employees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/technical"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <Employees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/non-technical"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <NonTechnicalEmployees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/create"
                element={
                  <PermissionRoute permission="employee:create" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <AddEmployeeWizard />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/employees/create"
                element={
                  <PermissionRoute permission="employee:create" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <AddEmployeeWizard />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/import"
                element={
                  <PermissionRoute permission="employee:create" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <Employees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/employees/import"
                element={
                  <PermissionRoute permission="employee:create" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <Employees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/former"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <FormerEmployees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/employees/former"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <FormerEmployees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/hierarchy"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <EmployeeHierarchy />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/employees/hierarchy"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <EmployeeHierarchy />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/:id"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <EmployeeProfile />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/employees/:id"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <EmployeeProfile />
                  </PermissionRoute>
                }
              />

              {/* Official BJK Healthcare Employee ID Card Management */}
              <Route
                path="hr/id-cards"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'DEPARTMENT_MANAGER']}>
                    <EmployeeIDCardManager />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/id-cards"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'DEPARTMENT_MANAGER']}>
                    <EmployeeIDCardManager />
                  </PermissionRoute>
                }
              />
              <Route
                path="admin/id-cards"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <EmployeeIDCardManager />
                  </PermissionRoute>
                }
              />

              <Route
                path="hr/onboarding"
                element={
                  <PermissionRoute permission="onboarding:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'RECRUITER']}>
                    <Onboarding />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/employees/onboarding"
                element={
                  <PermissionRoute permission="onboarding:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'RECRUITER']}>
                    <Onboarding />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/onboarding"
                element={
                  <PermissionRoute permission="onboarding:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'RECRUITER']}>
                    <Onboarding />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/offboarding"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HROffboarding />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/departments"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <HRDepartments />
                  </PermissionRoute>
                }
              />
              <Route
                path="admin/setup/departments"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <SetupDepartments />
                  </PermissionRoute>
                }
              />
              <Route
                path="setup/departments"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <SetupDepartments />
                  </PermissionRoute>
                }
              />
              <Route
                path="admin/setup/branches"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <Organization />
                  </PermissionRoute>
                }
              />
              <Route
                path="setup/branches"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <Organization />
                  </PermissionRoute>
                }
              />
              <Route
                path="admin/setup/sub-departments"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <SetupSubDepartments />
                  </PermissionRoute>
                }
              />
              <Route
                path="setup/sub-departments"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <SetupSubDepartments />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/roles"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']}>
                    <HRRoles />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/login-credentials"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HRLoginCredentials />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/login-credentials"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HRLoginCredentials />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/approval-permissions"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HRApprovalPermissions />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/approval-permissions"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HRApprovalPermissions />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/access-audit"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR']}>
                    <HRAccessAudit />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/access-audit"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR']}>
                    <HRAccessAudit />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/sessions"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HRSessions />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/login-activity"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'AUDITOR']}>
                    <HRSessions />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/documents"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <Documents />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/settings"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']}>
                    <HRSettings />
                  </PermissionRoute>
                }
              />
              <Route
                path="hr/audit-logs"
                element={
                  <PermissionRoute permission="audit:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'AUDITOR', 'HR_MANAGER']}>
                    <AuditLogs />
                  </PermissionRoute>
                }
              />

              {/* Official BJK Policy & HR Management Submodules (Handbook) */}
              <Route path="hr/dashboard" element={<HRDashboard />} />
              <Route path="hr/attendance" element={<Attendance />} />
              <Route path="hr/attendance/reports" element={<AttendanceReportBuilder />} />
              <Route path="hr/leave" element={<LeaveManagement />} />
              <Route path="hr/shifts" element={<Shifts />} />
              <Route path="hr/holidays" element={<Holidays />} />
              <Route path="hr/probation" element={<Onboarding />} />
              <Route path="hr/training" element={<Training />} />
              <Route path="hr/performance" element={<Performance />} />
              <Route path="hr/disciplinary" element={<HRDisciplinaryCenter />} />
              <Route path="hr/grievances" element={<HRDisciplinaryCenter />} />
              <Route
                path="hr/posh"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'POSH_ICP_MEMBER']}>
                    <HRPoshCenter />
                  </PermissionRoute>
                }
              />
              <Route path="hr/diversity" element={<HRDiversityCenter />} />
              <Route path="hr/maternity" element={<HRMaternityCenter />} />
              <Route path="hr/separation" element={<HRSeparationCenter />} />
              <Route path="hr/safety" element={<HRSafetyCenter />} />
              <Route path="hr/policies" element={<PolicyCenter />} />
              <Route path="hr/compliance" element={<HRCompliance />} />
              <Route path="hr/reports" element={<HRAnalytics />} />
              <Route path="hr/audit" element={<AuditLogs />} />
              <Route path="hr/privacy-security" element={<HRPrivacySecurityCenter />} />


              {/* Employees Master List & Profile (HRMS aliases) */}
              <Route
                path="hrms/employees"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <NonTechnicalEmployees />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/employees/:id"
                element={
                  <PermissionRoute permission="employee:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <EmployeeProfile />
                  </PermissionRoute>
                }
              />


              {/* Organization & Hierarchy */}
              <Route
                path="hrms/organization"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <Organization />
                  </PermissionRoute>
                }
              />

              {/* Attendance & Rostering */}
              <Route path="hr/calendar" element={<HRWorkforceCalendar />} />
              <Route path="hrms/calendar" element={<HRWorkforceCalendar />} />
              <Route path="admin/calendar" element={<HRWorkforceCalendar />} />
              <Route path="hr/attendance" element={<Attendance />} />
              <Route
                path="hr/attendance/command-center"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR', 'ADMIN']}>
                    <AttendanceCommandCenter />
                  </PermissionRoute>
                }
              />
              <Route path="hr/attendance/reports" element={<AttendanceReportBuilder />} />

              <Route path="hrms/attendance" element={<Attendance />} />
              <Route
                path="hrms/attendance/command-center"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR', 'ADMIN']}>
                    <AttendanceCommandCenter />
                  </PermissionRoute>
                }
              />
              <Route
                path="attendance-command-center"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR', 'ADMIN']}>
                    <AttendanceCommandCenter />
                  </PermissionRoute>
                }
              />
              <Route path="hrms/attendance/reports" element={<AttendanceReportBuilder />} />
              <Route path="hrms/shifts" element={<Shifts />} />
              <Route
                path="hrms/rostering"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <Rostering />
                  </PermissionRoute>
                }
              />

              {/* Leave Management Suite & Role Specific Routes */}
              <Route path="hrms/leave" element={<LeaveManagement />} />
              <Route path="employee/leave/*" element={<LeaveManagement />} />
              <Route path="manager/leave/*" element={<LeaveManagement />} />
              <Route path="department-manager/leave/*" element={<LeaveManagement />} />
              <Route path="hr/leave" element={<LeaveManagement />} />
              <Route path="hr/leave/employee/:employeeCode" element={<LeaveManagement />} />
              <Route path="hr/leave/*" element={<LeaveManagement />} />
              <Route path="admin/leave" element={<LeaveManagement />} />
              <Route path="admin/leave/employee/:employeeCode" element={<LeaveManagement />} />
              <Route path="admin/leave/*" element={<LeaveManagement />} />

              {/* Payroll (Strict RBAC: QA_MANAGER blocked, EMPLOYEE view self) */}
              <Route
                path="hrms/payroll"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'PAYROLL_ADMIN', 'FINANCE_MANAGER', 'EMPLOYEE']}>
                    <Payroll />
                  </PermissionRoute>
                }
              />

              {/* Recruitment & Onboarding */}
              <Route
                path="hrms/recruitment"
                element={
                  <PermissionRoute permission="recruitment:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'RECRUITER']}>
                    <Recruitment />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/onboarding"
                element={
                  <PermissionRoute permission="onboarding:view" allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'RECRUITER']}>
                    <Onboarding />
                  </PermissionRoute>
                }
              />

              {/* Performance, Training, Credentials, Documents */}
              <Route path="hrms/performance" element={<Performance />} />
              <Route path="hrms/training" element={<Training />} />
              <Route path="hrms/credentials" element={<Credentials />} />
              <Route path="hrms/documents" element={<Documents />} />

              {/* Assets & Expenses */}
              <Route path="hrms/assets" element={<Assets />} />
              <Route path="hrms/expenses" element={<Expenses />} />

              {/* Portals */}
              <Route path="hrms/me" element={<EmployeeSelfService />} />
              <Route path="hrms/ess" element={<EmployeeSelfService />} />
              <Route
                path="hrms/manager"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <ManagerSelfService />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/mss"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'QA_MANAGER', 'QC_MANAGER', 'PRODUCTION_MANAGER', 'DEPARTMENT_MANAGER']}>
                    <ManagerSelfService />
                  </PermissionRoute>
                }
              />

              {/* Analytics, Automation, Compliance, Reports */}
              <Route
                path="hrms/analytics"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER']}>
                    <HRAnalytics />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/reports"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER']}>
                    <HRAnalytics />
                  </PermissionRoute>
                }
              />
              <Route
                path="hrms/automation"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER']}>
                    <HRAutomation />
                  </PermissionRoute>
                }
              />
              <Route path="hrms/compliance" element={<HRCompliance />} />

              {/* Intelligence, Notifications & Settings */}
              <Route path="hrms/copilot" element={<HRAICopilot />} />
              <Route path="hrms/notifications" element={<HRNotifications />} />
              <Route
                path="hrms/settings"
                element={
                  <PermissionRoute allowedRoles={['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN']}>
                    <HRSettings />
                  </PermissionRoute>
                }
              />

              {/* 403 Forbidden Access Page */}
              <Route path="restricted" element={<AccessRestricted />} />
            </Route>

            {/* Catch-all redirects safely to role portal */}
            <Route path="*" element={<SmartRedirect />} />
          </Routes>
            </React.Suspense>
        </NotificationProvider>
        </EmployeeAuthProvider>
      </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

// Smart Portal Catch-all Redirect Component
const SmartRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'CANTEEN_ADMIN') {
    return <Navigate to="/canteen/dashboard" replace />;
  }
  if (['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(user.role)) {
    return <Navigate to="/employee/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export default App;
