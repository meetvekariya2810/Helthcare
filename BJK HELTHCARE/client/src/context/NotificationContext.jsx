import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hrmsAPI } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [healthStatus, setHealthStatus] = useState({ database: 'checking', module: 'HRMS' });

  // System health monitoring with 60s interval and clean mount/unmount handling
  useEffect(() => {
    let isMounted = true;
    const checkSystem = async () => {
      try {
        const res = await hrmsAPI.getHealth();
        if (res.data && isMounted) {
          setHealthStatus({ database: res.data.database, module: res.data.module });
        }
      } catch (err) {
        if (isMounted) {
          setHealthStatus({ database: 'disconnected', module: 'HRMS' });
        }
      }
    };

    checkSystem();
    const interval = setInterval(checkSystem, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const showToast = useCallback((arg1, arg2 = 'info', arg3 = '') => {
    let message = arg1;
    let type = arg2;
    let title = arg3;

    // Support both showToast('success', 'message') and showToast('message', 'success', 'title')
    if (['success', 'error', 'warning', 'info'].includes(arg1) && typeof arg2 === 'string' && arg2 !== 'info') {
      type = arg1;
      message = arg2;
      title = arg3 || '';
    } else if (typeof arg2 === 'boolean') {
      type = arg2 ? 'error' : 'success';
    }

    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue = React.useMemo(() => ({
    toasts,
    showToast,
    removeToast,
    unreadCount,
    setUnreadCount,
    healthStatus
  }), [toasts, showToast, removeToast, unreadCount, healthStatus]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-rose-900/90 border-rose-500 text-white'
                : toast.type === 'warning'
                ? 'bg-amber-900/90 border-amber-500 text-white'
                : 'bg-[#0F172A]/95 border-bjk-teal/50 text-white'
            }`}
          >
            <div className="flex-1">
              {toast.title && <h5 className="font-semibold text-sm mb-0.5">{toast.title}</h5>}
              <p className="text-xs text-slate-200 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
