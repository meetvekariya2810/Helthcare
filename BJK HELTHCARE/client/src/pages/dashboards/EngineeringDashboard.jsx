import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Cpu,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  RotateCw,
  Gauge,
  Sliders
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const EngineeringDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'OPERATIONS_MANAGER' || user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR';

  const loadData = async () => {
    try {
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setData(res.data.departmentData);
      }
    } catch (err) {
      console.warn('Engineering telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Equipment Operational',
      value: `${data?.kpis?.operationalEquipment || 16} / ${data?.kpis?.totalEquipment || 18}`,
      subtext: 'Machines running',
      icon: Cpu,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: data?.kpis?.equipmentUptime || '98.9%',
      trendLabel: 'Uptime Score'
    },
    {
      title: 'Preventive Maintenance Due',
      value: data?.kpis?.preventiveMaintenanceDue || 2,
      subtext: 'Scheduled PM tasks',
      icon: Wrench,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'This Week',
      trendColor: 'text-amber-600 font-bold'
    },
    {
      title: 'Under Maintenance',
      value: data?.kpis?.underMaintenance || 2,
      subtext: 'Minor Calibration',
      icon: Sliders,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: 'Planned',
      trendColor: 'text-indigo-600 font-bold'
    },
    {
      title: 'HVAC Cleanroom Status',
      value: 'Optimal (ISO 7)',
      subtext: 'Pressure & HEPA Normal',
      icon: Zap,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: '100% Compliant',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = isManager ? [
    { label: 'Issue Maintenance Work Order', icon: Plus, primary: true },
    { label: 'Schedule Preventive Calibration', icon: Wrench },
    { label: 'Review Spare Parts Requisition', icon: Sliders },
    { label: 'Check Water System Telemetry', icon: Gauge }
  ] : [
    { label: 'Log Equipment Checklist', icon: Plus, primary: true },
    { label: 'Record Machine Service Activity', icon: Wrench },
    { label: 'Request Replacement Spare Part', icon: Sliders }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle={isManager ? "Plant Engineering & Maintenance Command Center" : "Engineering Technician Workspace — Equipment Maintenance"}
      departmentCode="ENG"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Orders & Machine Registry (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Maintenance Work Orders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Wrench size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Maintenance Work Orders & Schedules</h3>
                  <p className="text-[11px] text-slate-400">Preventive & Breakdown Maintenance Tasks</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'WO-ENG-101', equipment: 'Fluid Bed Dryer #2 (Manufacturing Block A)', type: 'Preventive Maintenance', priority: 'HIGH', due: 'Today', status: 'IN_PROGRESS', technician: 'Test Engineering Technician' },
                { id: 'WO-ENG-102', equipment: 'Blister Packaging Line #1 (Optical Sensor)', type: 'Sensor Calibration', priority: 'MEDIUM', due: 'Tomorrow', status: 'PENDING', technician: 'Assigned' },
                { id: 'WO-ENG-103', equipment: 'AHU Unit Block-A (Air Handling Unit)', type: 'HEPA Filter Pressure Drop Check', priority: 'HIGH', due: 'In 3 Days', status: 'SCHEDULED', technician: 'Utility Team' },
                { id: 'WO-ENG-104', equipment: 'Purified Water Loop Pump #1', type: 'Mechanical Seal Inspection', priority: 'LOW', due: 'In 5 Days', status: 'SCHEDULED', technician: 'Maintenance Tech' }
              ].map((wo, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{wo.id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700">{wo.type}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700">{wo.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{wo.equipment}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Assigned to: <strong className="text-slate-700">{wo.technician}</strong> &bull; Due: {wo.due}</p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => alert(`Opening maintenance checklist for ${wo.id}`)}
                      className="px-3 py-1.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-lg transition-all"
                    >
                      {isManager ? 'Manage Order' : 'Complete Checklist'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Utility Telemetry */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Critical Plant Utilities & Facilities Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">Purified Water (PW) Generation</span>
                <p className="text-emerald-600 font-bold">Conductivity: 0.88 µS/cm (Norm &lt; 1.3 µS/cm)</p>
                <p className="text-[10px] text-slate-400">TOC: 120 ppb (Norm &lt; 500 ppb)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">Pure Steam Generator (PSG)</span>
                <p className="text-emerald-600 font-bold">Pressure: 3.2 bar (Stable)</p>
                <p className="text-[10px] text-slate-400">Non-Condensable Gases &lt; 3.5%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">Oil-Free Compressed Air System</span>
                <p className="text-emerald-600 font-bold">Dew Point: -40 °C (ISO 8573 Class 1)</p>
                <p className="text-[10px] text-slate-400">Pressure: 7.0 bar</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800">Main DG Generator (500 kVA)</span>
                <p className="text-emerald-600 font-bold">Auto-Mains Failure Ready</p>
                <p className="text-[10px] text-slate-400">Fuel Tank: 95% Full</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Spare Parts & Calibrations (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Critical Spare Parts Registry</h3>
            <div className="space-y-2 text-xs">
              {[
                { part: 'HEPA Filters (610x610x150mm)', stock: '12 Units in Store', status: 'ADEQUATE' },
                { part: 'PTFE Sanitary Gaskets 1.5"', stock: '85 pcs', status: 'ADEQUATE' },
                { part: 'Pneumatic Solenoid Valves 24V', stock: '8 pcs', status: 'ADEQUATE' },
                { part: 'Silicone Peristaltic Tubing 8mm', stock: '2 Rolls', status: 'REORDER_DUE' }
              ].map((spare, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{spare.part}</p>
                    <p className="text-[10px] text-slate-400">{spare.stock}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    spare.status === 'ADEQUATE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {spare.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
