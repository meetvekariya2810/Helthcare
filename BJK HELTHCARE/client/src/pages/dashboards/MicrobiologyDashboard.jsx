import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Thermometer,
  Sparkles
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const MicrobiologyDashboard = () => {
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
      console.warn('Microbiology telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Active Micro Samples',
      value: data?.kpis?.assignedMicroSamples || 8,
      subtext: 'Testing in progress',
      icon: FlaskConical,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: 'Zero Growth OOS',
      trendLabel: 'Incubating'
    },
    {
      title: 'Environmental Points (EM)',
      value: data?.kpis?.environmentalMonitoringPoints || 24,
      subtext: 'Air, Settle & Swab',
      icon: Activity,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: 'All Within Action Limit',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'Active Incubators',
      value: '4 / 4 Normal',
      subtext: '20-25°C & 30-35°C',
      icon: Thermometer,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'Calibrated',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'Endotoxin (LAL) Compliance',
      value: '100% (< 0.25 EU/ml)',
      subtext: 'Water & Sterile Line',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: 'Pyrogen-Free',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = [
    { label: 'Log Bioburden / Sterility Sample', icon: Plus, primary: true },
    { label: 'Record Cleanroom Settle Plate Count', icon: Activity },
    { label: 'Log Incubator Temperature & Reading', icon: Thermometer },
    { label: 'View Microbiology Lab SOPs', icon: FileCheck }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Quality Control Microbiology Workspace — Environmental Monitoring & Sterility"
      departmentCode="MIC"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Micro Sample Queue & Observations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <FlaskConical size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active Microbiological Testing & Incubation Queue</h3>
                  <p className="text-[11px] text-slate-400">Purified Water, Bioburden, Sterility & Endotoxin (LAL)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { sampleId: 'MIC-2026-112', testName: 'Purified Water System Bioburden', location: 'Loop Return Sampling Point #3', media: 'R2A Agar (30-35°C)', incubationDay: 'Day 3 of 5', status: 'IN_INCUBATION' },
                { sampleId: 'MIC-2026-113', testName: 'Cleanroom Grade B Air Settle Plate', location: 'Filling Station Line #1', media: 'SDA & TSA Plates', incubationDay: 'Day 2 of 5', status: 'IN_INCUBATION' },
                { sampleId: 'MIC-2026-114', testName: 'Amoxicillin Finished Batch Sterility Test', location: 'Sterility Testing Isolator', media: 'FTM / TSB Broth', incubationDay: 'Day 7 of 14', status: 'NO_GROWTH_OBSERVED' },
                { sampleId: 'MIC-2026-115', testName: 'Personnel Gown Glove Fingerprint Swab', location: 'Gowning Air Lock Block-A', media: 'TSA with Neutralizer', incubationDay: 'Day 1 of 3', status: 'IN_INCUBATION' }
              ].map((test, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{test.sampleId}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700">{test.incubationDay}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{test.testName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Location: <strong className="text-slate-700">{test.location}</strong> &bull; Media: {test.media}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-center ${
                    test.status === 'NO_GROWTH_OBSERVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {test.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Cleanroom Environmental Monitoring Schedule (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Cleanroom EM Daily Schedule</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { area: 'Manufacturing Block A - Granulation', freq: 'Daily', time: '10:00 AM', status: 'COMPLETED' },
                { area: 'Sterile Filling Zone Grade A/B', freq: 'Per Shift', time: '02:00 PM', status: 'PENDING_NEXT_SHIFT' },
                { area: 'Raw Material Sampling Laminar Hood', freq: 'Daily', time: '11:30 AM', status: 'COMPLETED' }
              ].map((sch, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{sch.area}</p>
                    <p className="text-[10px] text-slate-400">{sch.freq} &bull; {sch.time}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    sch.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {sch.status}
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
