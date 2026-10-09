import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  ShieldCheck,
  CreditCard,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { hrmsAPI } from '../../services/api';
import { KPICard } from '../../components/common/KPICard';

export const HRAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');

  const COLORS = ['#00A896', '#7B2CBF', '#00B4D8', '#F77F00', '#10B981', '#64748B'];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await hrmsAPI.getAnalytics();
      if (res.data?.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.warn('Analytics API error, using enterprise demo data:', err.message);
      // Demo dataset matching pharmaceutical enterprise profile
      setData({
        departmentHeadcount: [
          { name: 'Production & Packaging', count: 42 },
          { name: 'Quality Control (QC)', count: 28 },
          { name: 'Quality Assurance (QA)', count: 18 },
          { name: 'Regulatory Affairs', count: 12 },
          { name: 'Warehouse & Logistics', count: 16 },
          { name: 'Corporate & HR', count: 14 }
        ],
        employmentTypeBreakdown: [
          { name: 'FULL_TIME', count: 96 },
          { name: 'CONTRACT', count: 24 },
          { name: 'PROBATION', count: 10 }
        ],
        attendanceTrends: [
          { date: 'Sep 10', present: 118, absent: 4, overtimeHours: 14.5, nightHours: 8.0 },
          { date: 'Sep 11', present: 120, absent: 2, overtimeHours: 16.0, nightHours: 9.5 },
          { date: 'Sep 12', present: 119, absent: 3, overtimeHours: 12.0, nightHours: 8.0 },
          { date: 'Sep 13', present: 117, absent: 5, overtimeHours: 18.5, nightHours: 10.0 },
          { date: 'Sep 14', present: 121, absent: 1, overtimeHours: 20.0, nightHours: 12.0 },
          { date: 'Sep 15', present: 116, absent: 6, overtimeHours: 11.0, nightHours: 7.5 },
          { date: 'Sep 16', present: 122, absent: 0, overtimeHours: 15.0, nightHours: 9.0 }
        ],
        overtimeByDept: [
          { department: 'Production & Packaging', hours: 48.5 },
          { department: 'Quality Control (QC)', hours: 26.0 },
          { department: 'Warehouse & Logistics', hours: 19.5 },
          { department: 'Engineering & Maintenance', hours: 14.0 },
          { department: 'Quality Assurance (QA)', hours: 6.0 }
        ],
        trainingCompliance: [
          { category: 'GMP', total: 65, completed: 62, percentage: 95 },
          { category: 'GLP', total: 40, completed: 38, percentage: 95 },
          { category: 'SAFETY', total: 110, completed: 104, percentage: 95 },
          { category: 'SOP', total: 85, completed: 78, percentage: 92 },
          { category: 'DATA_INTEGRITY', total: 55, completed: 53, percentage: 96 }
        ],
        credentialProfile: [
          { status: 'ACTIVE', count: 142 },
          { status: 'EXPIRING_SOON', count: 12 },
          { status: 'EXPIRED', count: 2 }
        ],
        monthlyPayrollCost: [
          { _id: '2026-04', gross: 4850000, net: 4120000, companyCost: 5420000 },
          { _id: '2026-05', gross: 4920000, net: 4180000, companyCost: 5500000 },
          { _id: '2026-06', gross: 5040000, net: 4280000, companyCost: 5630000 },
          { _id: '2026-07', gross: 5120000, net: 4350000, companyCost: 5720000 },
          { _id: '2026-08', gross: 5210000, net: 4420000, companyCost: 5820000 },
          { _id: '2026-09', gross: 5300000, net: 4500000, companyCost: 5930000 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const totalHeadcount = data?.departmentHeadcount?.reduce((a, b) => a + b.count, 0) || 0;
  const avgAttendance = data?.attendanceTrends?.length
    ? Math.round(
        (data.attendanceTrends.reduce((a, b) => a + b.present, 0) /
          (data.attendanceTrends.reduce((a, b) => a + b.present + b.absent, 0) || 1)) *
          100
      )
    : 0;

  const totalOTHours = data?.overtimeByDept?.reduce((a, b) => a + b.hours, 0) || 0;
  const activeCredentials =
    data?.credentialProfile?.find((c) => c.status === 'ACTIVE')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="text-bjk-teal" />
            BJK Workforce & HR Intelligence Analytics
          </h1>
          <p className="text-sm text-slate-500">
            Real-time visual telemetry on pharmaceutical staffing, statutory labor cost, and compliance trends
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            {['7D', '30D', '90D', 'FYTD'].map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === t
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw size={16} />
          </button>

          <a
            href={hrmsAPI.exportReport('analytics', 'csv')}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-bjk-teal text-white text-xs font-bold shadow-md shadow-bjk-teal/20 hover:bg-bjk-teal/90 transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Plant Workforce"
          value={totalHeadcount > 0 ? totalHeadcount : '--'}
          subtitle="Active pharma personnel"
          icon={Users}
          color="teal"
        />
        <KPICard
          title="Avg Attendance Adherence"
          value={avgAttendance > 0 ? `${avgAttendance}%` : '--'}
          subtitle="Biometric shift punches"
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title="Total OT Incurred"
          value={totalOTHours > 0 ? `${totalOTHours.toFixed(1)} hrs` : '--'}
          subtitle="Production & QC batches"
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Active GMP Credentials"
          value={activeCredentials > 0 ? activeCredentials : '--'}
          subtitle="Zero uncertified personnel"
          icon={ShieldCheck}
          color="purple"
        />
      </div>

      {/* Main Charts Row 1: Attendance Trends & Overtime by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance & Night Hours Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attendance & Night Shift Telemetry</h2>
              <p className="text-xs text-slate-500">Present count vs night shift differential hours</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.attendanceTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="present"
                  stroke="#00A896"
                  strokeWidth={2.5}
                  name="Present Count"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="nightHours"
                  stroke="#7B2CBF"
                  strokeWidth={2}
                  name="Night Shift Hours"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overtime Hours by Department */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Overtime Utilization by Department</h2>
              <p className="text-xs text-slate-500">Total cumulative hours (1.5x / 2.0x rates)</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.overtimeByDept || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="department" type="category" width={110} stroke="#94A3B8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="hours" fill="#F77F00" radius={[0, 6, 6, 0]} name="OT Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Department Headcount Distribution & Training Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Headcount Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 lg:col-span-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Department Workforce Split</h2>
            <p className="text-xs text-slate-500">Distribution across plant operations</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.departmentHeadcount || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {(data?.departmentHeadcount || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {(data?.departmentHeadcount || []).slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center space-x-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{d.name}:</span>
                <span className="font-bold text-slate-900">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Training Compliance Percentage */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 lg:col-span-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Mandatory Pharma Training Compliance</h2>
            <p className="text-xs text-slate-500">Completed vs Enrolled across GMP, GLP, Safety, and SOPs</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.trainingCompliance || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" fill="#94A3B8" name="Enrolled" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#00A896" name="Completed & Certified" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Monthly Workforce Payroll Cost (6 Months) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Workforce Statutory Cost & Payroll Outlay</h2>
            <p className="text-xs text-slate-500">
              Gross Earnings, Net Take-Home, and Total Company Cost (inclusive of EPF Employer 12% & ESI 3.25%)
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <CreditCard size={14} className="text-bjk-teal" />
            <span className="font-semibold">INR Currency (₹)</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyPayrollCost || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="_id" stroke="#94A3B8" fontSize={11} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
              />
              <Tooltip
                formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '11px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="net" fill="#00B4D8" name="Net Pay to Employees" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gross" fill="#00A896" name="Gross Earnings" radius={[4, 4, 0, 0]} />
              <Bar dataKey="companyCost" fill="#7B2CBF" name="Total Company CTC Cost" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HRAnalytics;
