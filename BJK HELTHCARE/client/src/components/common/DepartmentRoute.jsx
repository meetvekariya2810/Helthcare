import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccessRestricted } from '../../pages/AccessRestricted';

/**
 * Checks whether the logged-in user is authorized to access a specific department workspace.
 * Prevents non-HR users from directly accessing /dashboard/hr, etc.
 */
export const DepartmentRoute = ({ department, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Verifying authorization...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role || '').toUpperCase().trim();
  const userDept = (user.department || '').toLowerCase().trim();

  // Directors & Super Admins have universal access
  if (role === 'SUPER_ADMIN' || role === 'DIRECTOR') {
    return children;
  }

  // HR Department Route
  if (department === 'hr') {
    if (
      ['HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR', 'RECRUITER', 'PAYROLL_ADMIN'].includes(role) ||
      userDept.includes('human resource')
    ) {
      return children;
    }
    return <AccessRestricted message="Access Denied: The HR Workforce Command Center is strictly isolated to authorized Human Resources personnel." />;
  }

  // Production
  if (department === 'production') {
    if (role === 'PRODUCTION_MANAGER' || userDept.includes('production') || userDept.includes('manufacturing')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Production Command Center is restricted to Manufacturing & Production personnel." />;
  }

  // QC (Quality Control)
  if (department === 'qc' || department === 'quality-control') {
    if (role === 'QC_MANAGER' || userDept.includes('quality control') || userDept === 'qc') {
      return children;
    }
    return <AccessRestricted message="Access Denied: QC Command Center is restricted to Quality Control personnel." />;
  }

  // QA (Quality Assurance)
  if (department === 'qa' || department === 'quality-assurance') {
    if (role === 'QA_MANAGER' || userDept.includes('quality assurance') || userDept === 'qa') {
      return children;
    }
    return <AccessRestricted message="Access Denied: QA Command Center is restricted to Quality Assurance personnel." />;
  }

  // Warehouse & Inventory
  if (department === 'warehouse' || department === 'inventory') {
    if (role === 'WAREHOUSE_MANAGER' || role === 'SUPPLY_CHAIN_MANAGER' || userDept.includes('warehouse') || userDept.includes('inventory')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Warehouse & Inventory Command Center is restricted to Supply Chain personnel." />;
  }

  // Engineering
  if (department === 'engineering') {
    if (userDept.includes('engineering') || userDept.includes('maintenance')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Engineering Command Center is restricted to Plant Engineering & Maintenance personnel." />;
  }

  // Finance & Accounts
  if (department === 'finance') {
    if (role === 'FINANCE_MANAGER' || role === 'FINANCE' || userDept.includes('account') || userDept.includes('finance')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Finance & Accounting information is strictly confidential." />;
  }

  // Procurement / Purchase
  if (department === 'procurement' || department === 'purchase') {
    if (userDept.includes('purchase') || userDept.includes('procurement')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Procurement workspace is restricted to Purchase personnel." />;
  }

  // Regulatory Affairs
  if (department === 'regulatory') {
    if (role === 'REGULATORY_MANAGER' || role === 'REGULATORY_VIEWER' || userDept.includes('regulatory')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Regulatory workspace is restricted to Regulatory Affairs personnel." />;
  }

  // Sales & Marketing
  if (department === 'sales') {
    if (role === 'SALES_MANAGER' || role === 'CRM_MANAGER' || role === 'EXPORT_MANAGER' || userDept.includes('sales') || userDept.includes('commercial') || userDept.includes('crm') || userDept.includes('export')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Commercial workspace is restricted to Sales & Marketing personnel." />;
  }

  // Microbiology
  if (department === 'microbiology') {
    if (userDept.includes('micro') || userDept.includes('microbiology') || role === 'QC_MANAGER') {
      return children;
    }
    return <AccessRestricted message="Access Denied: Microbiology workspace is restricted to Microbiology laboratory personnel." />;
  }

  // Facilities
  if (department === 'facilities') {
    if (role === 'ADMIN' || userDept.includes('admin') || userDept.includes('facility')) {
      return children;
    }
    return <AccessRestricted message="Access Denied: Facilities workspace is restricted to General Admin & Facilities personnel." />;
  }

  return children;
};

export default DepartmentRoute;
