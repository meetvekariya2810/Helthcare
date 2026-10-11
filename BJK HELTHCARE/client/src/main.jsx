import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Catch dynamic chunk import errors when a new deployment is published on Vercel (Production only)
if (!import.meta.env.DEV) {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[Vite Deployment Auto-Sync] Dynamic module chunk missing after deployment. Refreshing application...');
    event.preventDefault();
    const reloadKey = 'bjk_app_auto_reload_ts';
    const lastReload = Number(sessionStorage.getItem(reloadKey) || 0);
    const now = Date.now();
    if (now - lastReload > 8000) {
      sessionStorage.setItem(reloadKey, String(now));
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
