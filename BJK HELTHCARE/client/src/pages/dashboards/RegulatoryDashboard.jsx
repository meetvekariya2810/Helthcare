import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileCheck,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const RegulatoryDashboard = () => {
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
      console.warn('Regulatory telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Global Export Markets',
      value: data?.kpis?.globalTargetMarkets || 50,
      subtext: 'Countries in Portfolio',
      icon: Globe,
      iconBg: 'bg-cyan-50 text-cyan-600',
      trend: '42 Dossiers',
      trendLabel: 'Approved'
    },
    {
      title: 'Dossiers Under Review',
      value: data?.kpis?.filingsUnderReview || 6,
      subtext: 'CTD / eCTD / ACTD',
      icon: FileCheck,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: 'On-Track',
      trendColor: 'text-indigo-600 font-bold'
    },
    {
      title: 'Renewals Due (90 Days)',
      value: data?.kpis?.licensesExpiringIn90Days || 1,
      subtext: 'License Renewals',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'Renewal Drafted',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'CTD / eCTD Readiness',
      value: data?.kpis?.ctdEctdReadiness || '100%',
      subtext: 'ICH Module 1-5',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: 'Compliant',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = [
    { label: 'Register New Dossier Submission', icon: Plus, primary: true },
    { label: 'Upload Stability Study Data', icon: FileText },
    { label: 'Review Country Compliance Requirement', icon: Globe },
    { label: 'Check License Renewal Calendar', icon: Calendar }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Regulatory Affairs Command Center — Global Drug Dossiers & Country Filings"
      departmentCode="RA"
      departmentBadgeColor="cyan"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Submissions Tracker (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <Globe size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">International Regulatory Submissions Tracker</h3>
                  <p className="text-[11px] text-slate-400">NPRA, US FDA, EMA, PPB Kenya, FDA Philippines, DAV Vietnam</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'REG-MY-2026', country: 'Malaysia (NPRA)', product: 'Azithromycin Tablets 500mg', dossierType: 'ACTD Module 1-4', status: 'UNDER_EVALUATION', deadline: '2026-06-15' },
                { id: 'REG-PH-2026', country: 'Philippines (FDA)', product: 'Pantoprazole Gastro-Resistant 40mg', dossierType: 'eCTD', status: 'QUERY_SUBMITTED', deadline: '2026-05-20' },
                { id: 'REG-KE-2026', country: 'Kenya (PPB)', product: 'Amoxicillin & Potassium Clavulanate', dossierType: 'CTD Module 1-5', status: 'APPROVED', deadline: '2026-12-31' },
                { id: 'REG-VN-2026', country: 'Vietnam (DAV)', product: 'Cefixime Tablets 200mg', dossierType: 'ACTD', status: 'DOSSIER_PREPARATION', deadline: '2026-07-10' }
              ].map((sub, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{sub.id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-50 text-cyan-700">{sub.country}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 text-slate-700">{sub.dossierType}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{sub.product}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Target Decision Deadline: <strong className="text-slate-700">{sub.deadline}</strong></p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-center ${
                    sub.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : sub.status === 'QUERY_SUBMITTED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: CTD Modules & License Matrix (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">CTD Modules Repository Status</h3>
            <div className="space-y-2 text-xs">
              {[
                { module: 'Module 1: Administrative Information', status: '100% Ready' },
                { module: 'Module 2: Common Technical Document Summaries', status: '100% Ready' },
                { module: 'Module 3: Quality (CMC, Stability & Validation)', status: '100% Verified' },
                { module: 'Module 4: Non-Clinical Study Reports', status: 'Standard Reference' },
                { module: 'Module 5: Clinical Study Reports / BE Studies', status: 'BE Completed' }
              ].map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-800">{m.module}</p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{m.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
