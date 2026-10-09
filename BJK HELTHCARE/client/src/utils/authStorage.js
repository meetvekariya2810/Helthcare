// Tab-isolated auth storage utility (sessionStorage per browser tab)
// Guarantees independent sessions across multiple browser tabs (Employee, HR, Admin, etc.)

export const getAuthToken = () => {
  try {
    return (
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      sessionStorage.getItem('bjk_auth_token') ||
      sessionStorage.getItem('bjk_employee_token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('bjk_token') ||
      localStorage.getItem('bjk_auth_token') ||
      localStorage.getItem('bjk_employee_token') ||
      localStorage.getItem('token') ||
      null
    );
  } catch (e) {
    return null;
  }
};

export const getEmployeeToken = () => {
  try {
    return (
      sessionStorage.getItem('bjk_employee_token') ||
      sessionStorage.getItem('authToken') ||
      sessionStorage.getItem('bjk_token') ||
      localStorage.getItem('bjk_employee_token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('bjk_token') ||
      null
    );
  } catch (e) {
    return null;
  }
};

export const getStoredAuthUser = () => {
  try {
    const raw =
      sessionStorage.getItem('authUser') ||
      sessionStorage.getItem('bjk_user') ||
      localStorage.getItem('authUser') ||
      localStorage.getItem('bjk_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const getStoredEmployeeUser = () => {
  try {
    const raw =
      sessionStorage.getItem('bjk_employee_user') ||
      sessionStorage.getItem('authUser') ||
      sessionStorage.getItem('bjk_user') ||
      localStorage.getItem('bjk_employee_user') ||
      localStorage.getItem('authUser') ||
      localStorage.getItem('bjk_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const setAuthSession = (user, token) => {
  try {
    if (token) {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('bjk_token', token);
      sessionStorage.setItem('bjk_auth_token', token);
    }
    if (user) {
      sessionStorage.setItem('authUser', JSON.stringify(user));
      sessionStorage.setItem('bjk_user', JSON.stringify(user));
    }
  } catch (e) {}
};

export const setEmployeeSessionData = (user, token) => {
  try {
    if (token) {
      sessionStorage.setItem('bjk_employee_token', token);
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('bjk_token', token);
      sessionStorage.setItem('bjk_auth_token', token);
    }
    if (user) {
      sessionStorage.setItem('bjk_employee_user', JSON.stringify(user));
      sessionStorage.setItem('authUser', JSON.stringify(user));
      sessionStorage.setItem('bjk_user', JSON.stringify(user));
    }
  } catch (e) {}
};

export const clearAllAuthSessions = () => {
  const keys = [
    'authToken',
    'authUser',
    'bjk_token',
    'bjk_user',
    'bjk_auth_token',
    'bjk_employee_token',
    'bjk_employee_user',
    'token'
  ];
  keys.forEach((key) => {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch (e) {}
  });
};
