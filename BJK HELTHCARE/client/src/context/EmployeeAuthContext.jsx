import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { employeeAuthAPI } from '../services/employeeApi';
import { useAuth } from './AuthContext';

const EmployeeAuthContext = createContext(null);

export const EmployeeAuthProvider = ({ children }) => {
  const { user: authUser, token: authToken } = useAuth();

  const [employeeUser, setEmployeeUser] = useState(() => {
    try {
      const saved =
        sessionStorage.getItem('bjk_employee_user') ||
        sessionStorage.getItem('authUser') ||
        sessionStorage.getItem('bjk_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [employeeToken, setEmployeeToken] = useState(() => {
    return (
      sessionStorage.getItem('bjk_employee_token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      null
    );
  });

  const [loading, setLoading] = useState(false);

  // Synchronize EmployeeAuth state with AuthContext
  useEffect(() => {
    if (authUser && ['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(authUser.role)) {
      const empData = {
        id: authUser.id || authUser._id,
        employeeId: authUser.employeeId || 'BH1046',
        employeeCode: authUser.employeeId || 'BH1046',
        name: authUser.name,
        fullName: authUser.name,
        email: authUser.workEmail || authUser.email,
        department: authUser.department || 'Operations',
        designation: authUser.designation || 'Specialist',
        role: authUser.role,
        avatar: authUser.avatar || ''
      };
      setEmployeeUser(prev => {
        if (prev && prev.employeeId === empData.employeeId && prev.email === empData.email && prev.name === empData.name) {
          return prev;
        }
        return prev ? { ...prev, ...empData } : empData;
      });
      const effectiveToken =
        authToken ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('bjk_token');
      if (effectiveToken) {
        setEmployeeToken(prev => (prev === effectiveToken ? prev : effectiveToken));
        sessionStorage.setItem('bjk_employee_token', effectiveToken);
      }
      sessionStorage.setItem('bjk_employee_user', JSON.stringify(empData));
    }
  }, [authUser, authToken]);

  // Direct manual session setter for instantaneous synchronization
  const setEmployeeSession = useCallback((user, token) => {
    if (token) {
      setEmployeeToken(token);
      sessionStorage.setItem('bjk_employee_token', token);
    }
    if (user) {
      setEmployeeUser(user);
      sessionStorage.setItem('bjk_employee_user', JSON.stringify(user));
    }
  }, []);

  // Validate session on mount (strictly per-tab)
  useEffect(() => {
    let isMounted = true;
    const initEmployeeAuth = async () => {
      const token =
        sessionStorage.getItem('bjk_employee_token') ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('bjk_token');
      if (token) {
        try {
          const res = await employeeAuthAPI.getMe();
          if (res.data?.success && res.data.employee && isMounted) {
            setEmployeeUser(res.data.employee);
            sessionStorage.setItem('bjk_employee_user', JSON.stringify(res.data.employee));
            setEmployeeToken(token);
          }
        } catch (err) {
          if (err.response?.status === 401 && !authUser && isMounted) {
            sessionStorage.removeItem('bjk_employee_token');
            sessionStorage.removeItem('bjk_employee_user');
            setEmployeeUser(null);
            setEmployeeToken(null);
          }
        }
      }
    };

    initEmployeeAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const res = await employeeAuthAPI.login(credentials);
      if (res.data?.success) {
        const { token, employee, mustChangePassword } = res.data;
        setEmployeeToken(token);
        setEmployeeUser(employee);
        sessionStorage.setItem('bjk_employee_token', token);
        sessionStorage.setItem('bjk_employee_user', JSON.stringify(employee));
        return {
          success: true,
          employee,
          mustChangePassword: Boolean(mustChangePassword || employee?.mustChangePassword)
        };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Authentication error. Please check credentials.'
      };
    }
  }, []);

  const changePassword = useCallback(async (data) => {
    try {
      const res = await employeeAuthAPI.changePassword(data);
      if (res.data?.success) {
        const { token, employee } = res.data;
        if (token) {
          setEmployeeToken(token);
          sessionStorage.setItem('bjk_employee_token', token);
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('bjk_token', token);
          sessionStorage.setItem('bjk_auth_token', token);
          localStorage.setItem('bjk_employee_token', token);
          localStorage.setItem('authToken', token);
        }
        if (employee) {
          const updated = { ...employee, mustChangePassword: false };
          setEmployeeUser(updated);
          sessionStorage.setItem('bjk_employee_user', JSON.stringify(updated));
          sessionStorage.setItem('authUser', JSON.stringify(updated));
          localStorage.setItem('bjk_employee_user', JSON.stringify(updated));
          localStorage.setItem('authUser', JSON.stringify(updated));
        }
        return { success: true, ...res.data };
      }
      return { success: false, message: res.data?.message || 'Password update failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Password update failed.'
      };
    }
  }, []);

  const sendOtp = useCallback(async (identifier) => {
    try {
      const res = await employeeAuthAPI.sendOtp(identifier);
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send OTP.'
      };
    }
  }, []);

  const verifyOtp = useCallback(async (identifier, otp) => {
    try {
      const res = await employeeAuthAPI.verifyOtp(identifier, otp);
      if (res.data?.success) {
        const { token, employee } = res.data;
        setEmployeeToken(token);
        setEmployeeUser(employee);
        sessionStorage.setItem('bjk_employee_token', token);
        sessionStorage.setItem('bjk_employee_user', JSON.stringify(employee));
        return { success: true, employee };
      }
      return { success: false, message: res.data?.message || 'OTP verification failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid or expired OTP.'
      };
    }
  }, []);

  const forgotPassword = useCallback(async (identifier) => {
    try {
      const res = await employeeAuthAPI.forgotPassword(identifier);
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send reset code.'
      };
    }
  }, []);

  const resetPassword = useCallback(async (data) => {
    try {
      const res = await employeeAuthAPI.resetPassword(data);
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reset password.'
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await employeeAuthAPI.logout().catch(() => {});
    } finally {
      sessionStorage.removeItem('bjk_employee_token');
      sessionStorage.removeItem('bjk_employee_user');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('bjk_token');
      sessionStorage.removeItem('bjk_user');
      sessionStorage.removeItem('bjk_auth_token');
      localStorage.removeItem('bjk_employee_token');
      localStorage.removeItem('bjk_employee_user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('bjk_token');
      localStorage.removeItem('bjk_user');
      localStorage.removeItem('bjk_auth_token');
      setEmployeeUser(null);
      setEmployeeToken(null);
      window.location.href = '/login';
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await employeeAuthAPI.getMe();
      if (res.data?.success && res.data.employee) {
        setEmployeeUser(res.data.employee);
        sessionStorage.setItem('bjk_employee_user', JSON.stringify(res.data.employee));
      }
    } catch (err) {
      console.warn('[Employee Auth] Refresh failed:', err.message);
    }
  }, []);

  const isAuthenticated = !!employeeUser || !!(authUser && ['EMPLOYEE', 'SENIOR_EMPLOYEE', 'TEAM_LEAD', 'MANAGER'].includes(authUser?.role));

  const contextValue = React.useMemo(() => ({
    employeeUser,
    employeeToken,
    isAuthenticated,
    loading,
    setEmployeeSession,
    setEmployeeUser,
    setEmployeeToken,
    login,
    changePassword,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    refreshProfile
  }), [
    employeeUser,
    employeeToken,
    isAuthenticated,
    loading,
    setEmployeeSession,
    login,
    changePassword,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,
    logout,
    refreshProfile
  ]);

  return (
    <EmployeeAuthContext.Provider value={contextValue}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};

export const useEmployeeAuth = () => {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
};
