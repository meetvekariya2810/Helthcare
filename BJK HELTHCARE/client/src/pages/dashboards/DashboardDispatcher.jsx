import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { HRDashboard } from '../hrms/HRDashboard';
import { ProductionDashboard } from './ProductionDashboard';
import { QCDashboard } from './QCDashboard';
import { QADashboard } from './QADashboard';
import { WarehouseDashboard } from './WarehouseDashboard';
import { EngineeringDashboard } from './EngineeringDashboard';
import { FinanceDashboard } from './FinanceDashboard';
import { ProcurementDashboard } from './ProcurementDashboard';
import { RegulatoryDashboard } from './RegulatoryDashboard';
import { SalesDashboard } from './SalesDashboard';
import { MicrobiologyDashboard } from './MicrobiologyDashboard';
import { FacilitiesDashboard } from './FacilitiesDashboard';

export const DashboardDispatcher = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00A896] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">Resolving Authorized Department Workspace...</p>
      </div>
    );
  }

  const role = (user?.role || '').toUpperCase().trim();
  const dept = (user?.department || '').toLowerCase().trim();

  // 1. Executive Management & Super Admin / Director / HR Roles -> HR / Workforce Command Center
  if (
    ['SUPER_ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR_EXECUTIVE', 'HR', 'RECRUITER', 'PAYROLL_ADMIN'].includes(role) ||
    dept.includes('human resource') ||
    dept.includes('executive management')
  ) {
    return <HRDashboard />;
  }

  // 2. QC Micro (must check before generic QC)
  if (dept.includes('micro') || dept.includes('microbiology')) {
    return <MicrobiologyDashboard />;
  }

  // 3. Production
  if (role === 'PRODUCTION_MANAGER' || dept.includes('production') || dept.includes('manufacturing')) {
    return <ProductionDashboard />;
  }

  // 4. Quality Control (QC)
  if (role === 'QC_MANAGER' || dept.includes('quality control') || dept === 'qc') {
    return <QCDashboard />;
  }

  // 5. Quality Assurance (QA)
  if (role === 'QA_MANAGER' || dept.includes('quality assurance') || dept === 'qa') {
    return <QADashboard />;
  }

  // 6. Warehouse & Inventory
  if (role === 'WAREHOUSE_MANAGER' || role === 'SUPPLY_CHAIN_MANAGER' || dept.includes('warehouse') || dept.includes('inventory') || dept.includes('logistics')) {
    return <WarehouseDashboard />;
  }

  // 7. Engineering & Maintenance
  if (dept.includes('engineering') || dept.includes('maintenance')) {
    return <EngineeringDashboard />;
  }

  // 8. Finance & Accounts
  if (role === 'FINANCE_MANAGER' || role === 'FINANCE' || dept.includes('account') || dept.includes('finance')) {
    return <FinanceDashboard />;
  }

  // 9. Purchase & Procurement
  if (dept.includes('purchase') || dept.includes('procurement')) {
    return <ProcurementDashboard />;
  }

  // 10. Regulatory Affairs
  if (role === 'REGULATORY_MANAGER' || role === 'REGULATORY_VIEWER' || dept.includes('regulatory')) {
    return <RegulatoryDashboard />;
  }

  // 11. Sales & Marketing
  if (role === 'SALES_MANAGER' || role === 'CRM_MANAGER' || role === 'EXPORT_MANAGER' || dept.includes('sales') || dept.includes('commercial') || dept.includes('crm') || dept.includes('export') || dept.includes('marketing')) {
    return <SalesDashboard />;
  }

  // 12. Facilities & Admin
  if (role === 'ADMIN' || dept.includes('admin') || dept.includes('facility') || dept.includes('facilities')) {
    return <FacilitiesDashboard />;
  }

  // Default fallback to generic Production / Employee workspace
  return <ProductionDashboard />;
};

export default DashboardDispatcher;
