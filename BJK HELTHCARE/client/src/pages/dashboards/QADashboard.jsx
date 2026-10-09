import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  CheckSquare,
  Search,
  Scale
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const QADashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isManager = user?.role === 'QA_MANAGER' || user?.role === 'SUPER_ADMIN' || user?.role === 'DIRECTOR';

  const loadData = async () => {
    try {
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setData(res.data.departmentData);
      }
    } catch (err) {
      console.warn('QA telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Batch Release Review',
      value: data?.kpis?.pendingBatchRelease || 3,
      subtext: 'Pending QA Sign-Off',
      icon: CheckSquare,
      iconBg: 'bg-rose-50 text-rose-600',
      trend: '3 Ready',
      trendLabel: 'for Dispatch'
    },
    {
      title: 'Open Deviations & CAPA',
      value: `${data?.kpis?.openDeviations || 2} / ${data?.kpis?.openCapas || 1}`,
      subtext: 'Active investigations',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'Zero Overdue',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'Change Control Records',
      value: data?.kpis?.activeChangeControls || 2,
      subtext: 'Under Evaluation',
      icon: RotateCcw,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: 'GMP Reviewed',
      trendColor: 'text-indigo-600 font-bold'
    },
    {
      title: 'GMP Compliance Rate',
      value: data?.kpis?.gmpComplianceRate || '100%',
      subtext: 'WHO-GMP & Schedule M',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: 'Audit-Ready',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = isManager ? [
    { label: 'Final Batch Release Sign-Off', icon: CheckSquare, primary: true },
    { label: 'Initiate CAPA Investigation', icon: AlertTriangle },
    { label: 'Approve SOP Version', icon: FileText },
    { label: 'Review Change Control', icon: RotateCcw }
  ] : [
    { label: 'Review Batch Record (eBR)', icon: FileCheck, primary: true },
    { label: 'Log Deviation Assessment', icon: AlertTriangle },
    { label: 'Review SOP Draft', icon: FileText }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle={isManager ? "Quality Assurance Command Center — Batch Release & GMP Compliance" : "QA Officer Workspace — Documentation & Review"}
      departmentCode="QA"
      departmentBadgeColor="rose"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Release Queue & Deviations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Batch Release Review Queue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <CheckSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Batch Release Review Queue (Final QA Sign-Off)</h3>
                  <p className="text-[11px] text-slate-400">Complete batch record review before commercial distribution</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { batchNo: 'BJK-TAB-2026-088', product: 'Paracetamol 500mg Tablets', qcStatus: 'QC_PASSED', ebrStatus: 'COMPLETED', qaStatus: 'AWAITING_QA_RELEASE', releaseQuantity: '5,00,000 Tablets' },
                { batchNo: 'BJK-CAP-2026-042', product: 'Amoxicillin 250mg Capsules', qcStatus: 'QC_PASSED', ebrStatus: 'COMPLETED', qaStatus: 'AWAITING_QA_RELEASE', releaseQuantity: '2,50,000 Capsules' },
                { batchNo: 'BJK-SYR-2026-019', product: 'Cetirizine 5mg/5ml Syrup', qcStatus: 'QC_PASSED', ebrStatus: 'UNDER_QA_AUDIT', qaStatus: 'DOCUMENTATION_CHECK', releaseQuantity: '20,000 Bottles' }
              ].map((batch, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-slate-900">{batch.batchNo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{batch.qcStatus}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{batch.ebrStatus}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{batch.product}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Quantity: <strong className="text-slate-700">{batch.releaseQuantity}</strong> &bull; Status: <span className="font-semibold text-rose-600">{batch.qaStatus}</span></p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => alert(`Reviewing Batch dossier for ${batch.batchNo}`)}
                      className="px-3 py-1.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-lg transition-all"
                    >
                      {isManager ? 'Release Batch' : 'Audit Dossier'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deviations & CAPA Management */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active Deviations & CAPA Logbook</h3>
                  <p className="text-[11px] text-slate-400">Root Cause Analysis & Corrective Actions</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { capaId: 'CAPA-2026-004', source: 'Internal Audit', title: 'Secondary Gowning Standard Operating Procedure Update', targetDate: '2026-04-20', status: 'IN_PROGRESS', owner: 'QA Officer' },
                { capaId: 'CAPA-2026-005', source: 'Environmental Monitoring', title: 'HEPA Filter Seal Reinforcement in Block B', targetDate: '2026-04-18', status: 'IMPLEMENTED', owner: 'Engineering Lead' }
              ].map((capa, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono font-bold text-slate-900">{capa.capaId}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">{capa.source}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{capa.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Assigned to: {capa.owner} &bull; Target Date: {capa.targetDate}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 self-start sm:self-center">
                    {capa.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Controlled SOPs & GMP Audits (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Controlled SOP Registry (QA)</h3>
            <div className="space-y-2 text-xs">
              {[
                { title: 'Good Manufacturing Practices (GMP)', code: 'SOP-QA-001', version: 'v4.0', status: 'ACTIVE' },
                { title: 'Out of Specification (OOS) Protocol', code: 'SOP-QA-008', version: 'v3.2', status: 'ACTIVE' },
                { title: 'CAPA Lifecycle & Effectiveness', code: 'SOP-QA-014', version: 'v2.1', status: 'ACTIVE' },
                { title: 'Annual Product Quality Review (APQR)', code: 'SOP-QA-022', version: 'v1.5', status: 'UNDER_REVISION' }
              ].map((sop, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{sop.title}</p>
                    <p className="text-[10px] font-mono text-slate-400">{sop.code} &bull; {sop.version}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    sop.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {sop.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Internal GMP Audit Status</h3>
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900">
              <p className="font-bold">Quarterly Audit 100% Completed</p>
              <p className="text-[11px] text-teal-700 mt-1">Self-inspection audit of Manufacturing, QC Lab, and Warehouse completed with Zero Critical Observations.</p>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
