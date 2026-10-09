import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const CanteenProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div className="w-12 h-12 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-slate-300">
          Loading BJK Canteen Management Portal...
        </p>
      </div>
    );
  }

  // If unauthenticated, redirect strictly to Canteen login
  if (!user) {
    return <Navigate to="/canteen/login" state={{ from: location }} replace />;
  }

  // Allowed Canteen roles: CANTEEN_ADMIN, SUPER_ADMIN, DIRECTOR, HR_ADMIN, HR_MANAGER
  const isCanteenAuthorized = [
    'CANTEEN_ADMIN',
    'SUPER_ADMIN',
    'DIRECTOR',
    'HR_ADMIN',
    'HR_MANAGER'
  ].includes(user.role);

  if (!isCanteenAuthorized) {
    // If standard employee, redirect to employee portal
    if (['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(user.role)) {
      return <Navigate to="/employee/dashboard" replace />;
    }
    // Otherwise redirect to main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default CanteenProtectedRoute;
