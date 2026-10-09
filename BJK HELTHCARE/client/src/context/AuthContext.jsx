import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser =
        sessionStorage.getItem('authUser') ||
        sessionStorage.getItem('bjk_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return (
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      sessionStorage.getItem('bjk_auth_token') ||
      null
    );
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and validate session on application startup (strictly per-tab)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken =
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('bjk_token') ||
        sessionStorage.getItem('bjk_auth_token');

      const storedUser =
        sessionStorage.getItem('authUser') ||
        sessionStorage.getItem('bjk_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (isMounted) {
            setUser(parsedUser);
            setToken(storedToken);
          }

          // Verify token and fetch fresh user profile from backend
          const res = await authAPI.getMe();
          if (res.data?.success && isMounted) {
            const verifiedUser = res.data.user;
            setUser(verifiedUser);
            sessionStorage.setItem('authUser', JSON.stringify(verifiedUser));
            sessionStorage.setItem('authToken', storedToken);
            sessionStorage.setItem('bjk_token', storedToken);
            sessionStorage.setItem('bjk_auth_token', storedToken);
          }
        } catch (err) {
          // If server reports invalid or expired session, clear credentials for this tab
          if (err.response?.status === 401) {
            console.warn('[BJK Auth]: Session expired or invalid. Clearing credentials.');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('authUser');
            sessionStorage.removeItem('bjk_token');
            sessionStorage.removeItem('bjk_user');
            sessionStorage.removeItem('bjk_auth_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
            localStorage.removeItem('bjk_token');
            localStorage.removeItem('bjk_user');
            if (isMounted) {
              setUser(null);
              setToken(null);
            }
          } else {
            console.warn('[BJK Auth]: Session verification network note:', err.message);
          }
        }
      } else {
        // No session stored in this tab - unauthenticated state
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real backend authentication with per-tab session isolation
  const login = async (identifier, password) => {
    try {
      const cleanIdentifier = (identifier || '').trim();
      const res = await authAPI.login({
        identifier: cleanIdentifier,
        email: cleanIdentifier.toLowerCase(),
        password
      });

      if (res.data && res.data.success) {
        const receivedUser = res.data.user;
        const receivedToken = res.data.token;

        setUser(receivedUser);
        setToken(receivedToken);

        // Standardized session storage (per-tab isolation)
        sessionStorage.setItem('authToken', receivedToken);
        sessionStorage.setItem('authUser', JSON.stringify(receivedUser));
        sessionStorage.setItem('bjk_token', receivedToken);
        sessionStorage.setItem('bjk_user', JSON.stringify(receivedUser));
        sessionStorage.setItem('bjk_auth_token', receivedToken);

        return { success: true, user: receivedUser, token: receivedToken };
      }

      return {
        success: false,
        message: res.data?.message || 'Invalid email or password.'
      };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.normalizedMessage ||
        (err.code === 'ECONNABORTED'
          ? 'Connection timeout. Please verify backend status.'
          : err.message?.includes('Network Error')
          ? 'Unable to connect to BJK Healthcare server.'
          : 'Invalid email or password.');

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
    sessionStorage.removeItem('bjk_token');
    sessionStorage.removeItem('bjk_user');
    sessionStorage.removeItem('bjk_employee_token');
    sessionStorage.removeItem('bjk_employee_user');
    sessionStorage.removeItem('bjk_auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('bjk_token');
    localStorage.removeItem('bjk_user');
    localStorage.removeItem('bjk_employee_token');
    localStorage.removeItem('bjk_employee_user');
    localStorage.removeItem('bjk_auth_token');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'DIRECTOR') return true;
    if (user.permissions && user.permissions.includes('*')) return true;
    if (user.permissions && user.permissions.includes(permission)) return true;

    // Check module or page permission from allowedModules or allowedPages
    const permParts = String(permission).split(/[\.:]/);
    const mod = permParts[0];
    const act = permParts[1] || 'view';

    if (user.allowedModules && user.allowedModules.includes(mod)) {
      if (act === 'view') return true;
      if (user.accessConfig?.modules) {
        const modObj = user.accessConfig.modules.find(m => m.id === mod);
        if (modObj && modObj.actions && modObj.actions[act]) return true;
      }
    }

    if (user.allowedPages && user.allowedPages.includes(mod)) {
      return true;
    }

    return false;
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'DIRECTOR') return true;
    return roles.includes(user.role);
  };

  // Checks if user can access an enterprise module (e.g. 'qc', 'production', 'finance')
  const canAccessModule = (moduleId) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'DIRECTOR') return true;
    if (Array.isArray(user.allowedModules)) {
      return user.allowedModules.includes(moduleId);
    }
    if (user.accessConfig?.modules) {
      const found = user.accessConfig.modules.find(m => m.id === moduleId);
      return found ? Boolean(found.enabled) : false;
    }
    // Fallback role default checks
    if (moduleId === 'dashboard' || moduleId === 'ai_copilot') return true;
    if (moduleId === 'hrms' && ['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR'].includes(user.role)) return true;
    if (moduleId === 'qc' && ['QC_MANAGER', 'QC'].includes(user.role)) return true;
    if (moduleId === 'qa' && ['QA_MANAGER', 'QA'].includes(user.role)) return true;
    if (moduleId === 'production' && ['PRODUCTION_MANAGER', 'PRODUCTION', 'OPERATIONS_MANAGER'].includes(user.role)) return true;
    if (moduleId === 'inventory' && ['WAREHOUSE_MANAGER', 'WAREHOUSE', 'OPERATIONS_MANAGER'].includes(user.role)) return true;
    if (moduleId === 'regulatory' && ['REGULATORY_MANAGER', 'REGULATORY', 'REGULATORY_VIEWER'].includes(user.role)) return true;
    if (moduleId === 'finance' && ['FINANCE_MANAGER', 'FINANCE', 'PAYROLL_ADMIN'].includes(user.role)) return true;
    if (moduleId === 'crm' && ['CRM_MANAGER', 'SALES_MANAGER', 'CRM'].includes(user.role)) return true;
    if (moduleId === 'export' && ['EXPORT_MANAGER', 'EXPORT'].includes(user.role)) return true;
    if (moduleId === 'documents') return true;
    return false;
  };

  // Checks if user can access an individual page
  const canAccessPage = (moduleId, pageId) => {
    if (!canAccessModule(moduleId)) return false;
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR') return true;
    if (Array.isArray(user?.allowedPages)) {
      return user.allowedPages.includes(pageId);
    }
    return true;
  };

  // Checks button/action access (e.g. 'approve', 'edit', 'delete')
  const canPerformAction = (moduleId, action) => {
    if (!canAccessModule(moduleId)) return false;
    if (user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR') return true;
    if (user?.accessConfig?.modules) {
      const modObj = user.accessConfig.modules.find(m => m.id === moduleId);
      if (modObj && modObj.actions) {
        return Boolean(modObj.actions[action]);
      }
    }
    if (action === 'view') return true;
    return hasPermission(`${moduleId}.${action}`);
  };

  // Checks specific approval permission (Section 8)
  const canApprove = (approvalKey) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'DIRECTOR') return true;
    if (Array.isArray(user.approvalPermissions)) {
      return user.approvalPermissions.includes(approvalKey);
    }
    return false;
  };

  const contextValue = React.useMemo(() => ({
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    loading: isLoading, // backward compatibility
    login,
    logout,
    hasRole,
    hasPermission,
    can: hasPermission, // backward compatibility
    canAccessModule,
    canAccessPage,
    canPerformAction,
    canApprove,
    setUser
  }), [user, token, isLoading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
