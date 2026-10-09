import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Truck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Building2,
  FileText
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ProcurementDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setData(res.data.departmentData);
      }
    } catch (err) {
      console.warn('Procurement telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Active Purchase Orders',
      value: data?.kpis?.activePurchaseOrders || 11,
      subtext: 'POs in pipeline',
      icon: ShoppingCart,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: '+4 Orders',
      trendLabel: 'this week'
    },
    {
      title: 'Approved Suppliers (ASL)',
      value: data?.kpis?.approvedSuppliersCount || 48,
      subtext: 'Audit-Qualified Vendors',
      icon: Building2,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: '100% Verified',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'Pending Quotations',
      value: data?.kpis?.pendingQuotations || 4,
      subtext: 'Under RFQ Evaluation',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'Lowest Bid Analysed',
      trendColor: 'text-amber-600 font-bold'
    },
    {
      title: 'Material Stock Cover',
      value: data?.kpis?.rawMaterialStockCoverDays || '45 Days',
      subtext: 'Safety Stock Days',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: 'High Reliability',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = [
    { label: 'Create Purchase Order (PO)', icon: Plus, primary: true },
    { label: 'Request Quotation (RFQ)', icon: FileText },
    { label: 'Search Approved Vendor (ASL)', icon: Building2 },
    { label: 'Track Inward Consignment', icon: Truck }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Purchase & Procurement Command Center — Raw Materials & Supplier ASL"
      departmentCode="PUR"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Purchase Orders (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active Purchase Orders & Raw Material Sourcing</h3>
                  <p className="text-[11px] text-slate-400">Approved Vendor Sourcing Pipeline</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { poNumber: 'PO-BJK-2026-041', supplier: 'Aarti Drugs & Pharmaceuticals Ltd', material: 'Paracetamol IP (Granular Grade)', quantity: '5,000 kg', status: 'DISPATCHED', eta: 'Tomorrow' },
                { poNumber: 'PO-BJK-2026-042', supplier: 'Colorcon Asia Packaging Ltd', material: 'Alu-Alu Cold Form Foil 25 Micron', quantity: '2,500 mtr', status: 'CONFIRMED', eta: 'In 3 Days' },
                { poNumber: 'PO-BJK-2026-043', supplier: 'Balaji Fine Chemicals Ltd', material: 'Microcrystalline Cellulose IP (Avicel)', quantity: '3,000 kg', status: 'IN_TRANSIT', eta: 'In 2 Days' },
                { poNumber: 'PO-BJK-2026-044', supplier: 'ACG Associated Capsules Group', material: 'Hard Gelatin Capsule Shells Size 0', quantity: '20,00,000 pcs', status: 'SUPPLIER_QC_PASSED', eta: 'In 6 Days' }
              ].map((po, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{po.poNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700">{po.status}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700">ETA: {po.eta}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{po.material}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Vendor: <strong className="text-slate-700">{po.supplier}</strong> &bull; Qty: {po.quantity}</p>
                  </div>

                  <button
                    onClick={() => alert(`Tracking PO ${po.poNumber}`)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-200 transition-all flex items-center space-x-1"
                  >
                    <span>Track Inward</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Approved Suppliers ASL (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Approved Supplier List (ASL)</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Aarti Drugs & Pharmaceuticals', category: 'API (Active Ingredients)', rating: 'Grade A (99.4%)' },
                { name: 'ACG Associated Capsules', category: 'Capsules Shells', rating: 'Grade A (100%)' },
                { name: 'Colorcon Asia Packaging', category: 'Primary Foil', rating: 'Grade A (98.8%)' },
                { name: 'Balaji Fine Chemicals', category: 'Excipients', rating: 'Grade A (99.1%)' }
              ].map((supp, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                  <p className="font-bold text-slate-800">{supp.name}</p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{supp.category}</span>
                    <span className="font-bold text-emerald-600">{supp.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
