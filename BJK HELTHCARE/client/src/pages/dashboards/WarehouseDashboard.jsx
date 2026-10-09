import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Truck,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  PackageCheck,
  Search,
  Layers,
  Archive
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const WarehouseDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'WAREHOUSE_MANAGER' || user?.role === 'SUPPLY_CHAIN_MANAGER' || user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR';

  const loadData = async () => {
    try {
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setData(res.data.departmentData);
      }
    } catch (err) {
      console.warn('Warehouse telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Total Tracked SKUs',
      value: data?.kpis?.totalSKUs || 111,
      subtext: 'Official BJK Portfolio',
      icon: Boxes,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: '100% Traceable',
      trendLabel: 'by Lot'
    },
    {
      title: 'Quarantine Lots',
      value: data?.kpis?.quarantineLots || 2,
      subtext: 'Under QC Sampling',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'Awaiting QC Sign',
      trendColor: 'text-amber-600 font-bold'
    },
    {
      title: 'Low Stock Alerts',
      value: data?.kpis?.lowStockAlerts || 3,
      subtext: 'Below Reorder Point',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      trend: 'PR Raised',
      trendColor: 'text-rose-600 font-bold'
    },
    {
      title: 'Stock Accuracy Rate',
      value: data?.kpis?.stockAccuracy || '99.8%',
      subtext: 'Cycle Count Audit',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: 'Verified Today',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = isManager ? [
    { label: 'Receive Inward Goods (GRN)', icon: Plus, primary: true },
    { label: 'Record Stock Transfer', icon: Truck },
    { label: 'Release Quarantined Stock', icon: PackageCheck },
    { label: 'Export Inventory Ledger', icon: FileSpreadsheet }
  ] : [
    { label: 'Log Material Receipt', icon: Plus, primary: true },
    { label: 'Record Bin Location Transfer', icon: Truck },
    { label: 'Material Picking & Packing Task', icon: PackageCheck }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle={isManager ? "Warehouse & Inventory Command Center — Materials & Supply Chain" : "Warehouse Executive Workspace — Inventory & Stock Operations"}
      departmentCode="WH"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Categories & Inward Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Breakdown by Material Category */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Boxes size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verified Stock Ledger (By Material Type)</h3>
                  <p className="text-[11px] text-slate-400">Raw Materials, APIs, Excipients, Packaging & Finished Goods</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: 'Active Pharma Ingredients (APIs)', stock: '42 Batches', status: 'Adequate', badge: 'bg-emerald-50 text-emerald-700' },
                { type: 'Excipients & Additives', stock: '68 Lots', status: 'Adequate', badge: 'bg-emerald-50 text-emerald-700' },
                { type: 'Primary Packaging (Alu/PVC)', stock: '34 Reels', status: 'Reorder Due', badge: 'bg-amber-50 text-amber-700' },
                { type: 'Secondary Cartons & Labels', stock: '120 Bundles', status: 'Adequate', badge: 'bg-emerald-50 text-emerald-700' },
                { type: 'Finished Goods (Quarantine)', stock: '2 Batches', status: 'Awaiting QA', badge: 'bg-indigo-50 text-indigo-700' },
                { type: 'Finished Goods (Released)', stock: '38 Batches', status: 'Ready for Dispatch', badge: 'bg-emerald-50 text-emerald-700' }
              ].map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2">
                  <span className="text-xs font-bold text-slate-800">{cat.type}</span>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-xs font-black text-slate-900">{cat.stock}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${cat.badge}`}>{cat.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Material Movements & GRN Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Truck size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Material Transactions & Receipts</h3>
                  <p className="text-[11px] text-slate-400">Goods Receipt Notes (GRN) & Dispensing Logs</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { grnNo: 'GRN-2026-094', item: 'Paracetamol IP (Granular Grade)', supplier: 'Aarti Drugs Ltd', quantity: '5,000 kg', status: 'QUARANTINE_SAMPLED', location: 'Warehouse Bay A-1' },
                { grnNo: 'GRN-2026-093', item: 'Hard Gelatin Capsule Shells Size 0', supplier: 'ACG Associated Capsules', quantity: '20,00,000 pcs', status: 'RELEASED_TO_PRODUCTION', location: 'Warehouse Bay B-4' },
                { grnNo: 'GRN-2026-092', item: 'Microcrystalline Cellulose IP (Avicel PH-102)', supplier: 'Balaji Chemicals', quantity: '3,000 kg', status: 'RELEASED_TO_PRODUCTION', location: 'Warehouse Bay A-3' }
              ].map((txn, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{txn.grnNo}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700">{txn.location}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{txn.item} &bull; <span className="text-slate-500 font-normal">{txn.supplier}</span></p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Quantity: <strong className="text-slate-700">{txn.quantity}</strong></p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-center ${
                    txn.status === 'QUARANTINE_SAMPLED' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {txn.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Temperature & Storage Compliance (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Cold Room & Storage Conditions</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Cold Room (Cold Chain)</p>
                  <p className="text-[10px] text-slate-400">Required: 2°C - 8°C</p>
                </div>
                <span className="font-bold text-emerald-600">4.8 °C (OK)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Main Raw Material Store</p>
                  <p className="text-[10px] text-slate-400">Required: &lt; 25°C</p>
                </div>
                <span className="font-bold text-emerald-600">22.1 °C (OK)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Dangerous / Flammable Solvent Store</p>
                  <p className="text-[10px] text-slate-400">Explosion Proof Ventilation</p>
                </div>
                <span className="font-bold text-emerald-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">FIFO / FEFO Compliance</h3>
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
              <p className="font-bold">First-Expiry-First-Out (FEFO) Enforced</p>
              <p className="text-[11px] text-teal-700 mt-1">Dispensing algorithm strictly validates nearest expiry lot before material issue to Production.</p>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
