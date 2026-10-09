import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrmsAPI, downloadBlobFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

import { EmployeeDashboardView } from './dashboards/EmployeeDashboardView';
import { QAManagerDashboardView } from './dashboards/QAManagerDashboardView';
import { SuperAdminDashboardView } from './dashboards/SuperAdminDashboardView';
import { HRManagerDashboardView } from './dashboards/HRManagerDashboardView';

export const HRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const res = await hrmsAPI.getDashboard();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Dashboard fetch note:', err.message);
      // Fallback default state
      setData({
        connected: true,
        dashboardType: user?.role || 'EMPLOYEE',
        role: user?.role || 'EMPLOYEE',
        scope: user?.dataScope || 'SELF'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const handleDownloadSpecDoc = async () => {
    try {
      const res = await hrmsAPI.downloadMasterDoc();
      downloadBlobFile(res.data, 'BJK_HEALTHCARE_ENTERPRISE_HRMS_SPECIFICATION.docx');
    } catch (err) {
      console.error('Failed to download master doc:', err);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={32} className="animate-spin text-bjk-teal mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
          Loading Authorized Dashboard Telemetry...
        </p>
      </div>
    );
  }

  // Determine active view from backend telemetry or user role
  const activeRole = data?.role || user?.role || 'EMPLOYEE';
  const dashboardType = data?.dashboardType || activeRole;

  if (['SUPER_ADMIN', 'DIRECTOR'].includes(activeRole) || ['SUPER_ADMIN', 'DIRECTOR'].includes(dashboardType)) {
    return (
      <SuperAdminDashboardView
        data={data}
        user={user}
        onRefresh={fetchDashboardData}
        isRefreshing={isRefreshing}
      />
    );
  }

  if (['QA_MANAGER', 'QC_MANAGER'].includes(activeRole) || ['QA_MANAGER', 'QC_MANAGER'].includes(dashboardType)) {
    return (
      <QAManagerDashboardView
        data={data}
        user={user}
        onRefresh={fetchDashboardData}
        isRefreshing={isRefreshing}
      />
    );
  }

  if (
    ['HR_ADMIN', 'HR_MANAGER', 'HR', 'HR_EXECUTIVE', 'ADMIN'].includes(activeRole) ||
    ['HR_ADMIN', 'HR_MANAGER', 'ADMIN'].includes(dashboardType)
  ) {
    return (
      <HRManagerDashboardView
        data={data}
        user={user}
        onExportMasterDoc={handleDownloadSpecDoc}
        onRefresh={fetchDashboardData}
        isRefreshing={isRefreshing}
      />
    );
  }

  // Default: Authorized Employee & Operational Workspace (Dynamically renders assigned modules)
  return (
    <EmployeeDashboardView
      data={data}
      user={user}
      onRefresh={fetchDashboardData}
    />
  );
};

export default HRDashboard;
