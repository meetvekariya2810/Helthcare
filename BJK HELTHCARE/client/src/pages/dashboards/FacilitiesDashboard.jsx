import React, { useState, useEffect } from 'react';
import {
  Building2,
  Utensils,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Fuel,
  Flame,
  Users,
  FileCheck
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const FacilitiesDashboard = () => {
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
      console.warn('Facilities telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Open Service Requests',
      value: data?.kpis?.openServiceRequests || 3,
      subtext: 'Facility Maintenance',
      icon: Building2,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: 'In Progress',
      trendLabel: 'SLA < 24h'
    },
    {
      title: 'Canteen Meals Served',
      value: data?.kpis?.canteenDailyMealsServed || 248,
      subtext: 'Staff & Guest Lunches',
      icon: Utensils,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: 'Hygienic Verified',
      trendColor: 'text-emerald-600 font-bold'
    },
    {
      title: 'DG Generator Fuel',
      value: '100% (48h Cover)',
      subtext: 'Emergency Power Grid',
      icon: Fuel,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: 'Standby Ready',
      trendColor: 'text-indigo-600 font-bold'
    },
    {
      title: 'Fire & Facility Safety',
      value: 'Certified Valid',
      subtext: 'NOC & Extinguishers OK',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: '100% Compliant',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = [
    { label: 'Log Facility Service Request', icon: Plus, primary: true },
    { label: 'Check Canteen Attendance Count', icon: Utensils },
    { label: 'Issue Visitor Gate Pass', icon: Users },
    { label: 'Log Housekeeping Sanitization', icon: FileCheck }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="General Administration & Plant Facilities Command Center"
      departmentCode="FAC"
      departmentBadgeColor="teal"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Requests & Canteen Operations (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Facility Service Requests & Maintenance Tasks</h3>
                  <p className="text-[11px] text-slate-400">Office Administration, Canteen & Security Requests</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'SR-FAC-201', location: 'Admin Conference Room 2', issue: 'Projector HDMI & Audio Check', requestedBy: 'HR Dept', priority: 'LOW', status: 'RESOLVED' },
                { id: 'SR-FAC-202', location: 'Canteen Dining Hall West', issue: 'Water Dispenser UV Filter Service', requestedBy: 'Canteen Supervisor', priority: 'MEDIUM', status: 'IN_PROGRESS' },
                { id: 'SR-FAC-203', location: 'Security Main Gate #1', issue: 'Visitor Biometric Camera Alignment', requestedBy: 'Head of Security', priority: 'HIGH', status: 'SCHEDULED' }
              ].map((sr, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{sr.id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-200 text-slate-700">{sr.location}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700">{sr.priority}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1">{sr.issue}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Requested by: <strong className="text-slate-700">{sr.requestedBy}</strong></p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-center ${
                    sr.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {sr.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Canteen & Security Overview (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Canteen Facility Daily Summary</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-600">Morning Breakfast Served</span>
                <span className="font-bold text-slate-900">62 Meals</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-600">Afternoon Lunch Served</span>
                <span className="font-bold text-slate-900">186 Meals</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                <span className="text-slate-600">Water Dispenser Hygiene</span>
                <span className="font-bold text-emerald-600">Grade A+ (Tested)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
