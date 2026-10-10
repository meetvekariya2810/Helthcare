import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { useAuth } from '../../context/AuthContext';

export const EmployeeProtectedRoute = ({ children }) => {
  const { employeeUser, loading: employeeLoading } = useEmployeeAuth();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const location = useLocation();

  if (employeeLoading && authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-slate-300">
          Loading BJK Healthcare Employee Portal...
        </p>
      </div>
    );
  }

  const isEmployeeRole = (role) =>
    ['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(role);

  const hasSession =
    Boolean(employeeUser) ||
    Boolean(authUser && isEmployeeRole(authUser.role)) ||
    Boolean(
      (sessionStorage.getItem('bjk_employee_token') || sessionStorage.getItem('authToken') || sessionStorage.getItem('bjk_token') || localStorage.getItem('bjk_employee_token') || localStorage.getItem('authToken') || localStorage.getItem('bjk_token')) &&
      (sessionStorage.getItem('bjk_employee_user') || sessionStorage.getItem('authUser') || sessionStorage.getItem('bjk_user') || localStorage.getItem('bjk_employee_user') || localStorage.getItem('authUser') || localStorage.getItem('bjk_user'))
    );

  if (!hasSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let userMustChange = Boolean(employeeUser?.mustChangePassword || authUser?.mustChangePassword);
  if (!userMustChange) {
    try {
      const storedEmp = sessionStorage.getItem('bjk_employee_user') || localStorage.getItem('bjk_employee_user');
      const storedAuth = sessionStorage.getItem('authUser') || localStorage.getItem('authUser');
      if (storedEmp) userMustChange = Boolean(JSON.parse(storedEmp).mustChangePassword);
      if (!userMustChange && storedAuth) userMustChange = Boolean(JSON.parse(storedAuth).mustChangePassword);
    } catch (_) {}
  }

  if (userMustChange && location.pathname !== '/employee/change-password' && location.pathname !== '/change-password') {
    return <Navigate to="/employee/change-password" replace />;
  }

  return children;
};
