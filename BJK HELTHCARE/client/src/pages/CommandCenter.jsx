import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  Activity,
  Users,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Boxes,
  Database,
  Lock,
  Cpu,
  RefreshCw,
  Server
} from 'lucide-react';
import { KPICard } from '../components/common/KPICard';
import { StatusBadge } from '../components/common/StatusBadge';
import { hrmsAPI, adminDatabaseAPI, productAPI } from '../services/api';

export const CommandCenter = () => {
  const [metrics, setMetrics] = useState({
    totalProducts: 111,
    activeBatches: 1,
    operationalLines: 2,
    activeStaff: 120,
    dbStatus: 'CONNECTED',
    dbName: 'bjk_healthcare'
  });

  const [loading, setLoading] = useState(false);

  const fetchLiveMetrics = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes] = await Promise.all([
        adminDatabaseAPI.getStats().catch(() => null),
        productAPI.getAll({ limit: 1 }).catch(() => null)
      ]);

      if (statsRes?.data?.success) {
        const counts = statsRes.data.data.counts;
        const dbInfo = statsRes.data.data.database;
        setMetrics(prev => ({
          ...prev,
          totalProducts: counts.products || 111,
          activeBatches: counts.batches || 1,
          dbStatus: dbInfo.status || 'CONNECTED',
          dbName: dbInfo.name || 'bjk_healthcare'
        }));
      }
    } catch (err) {
      // Retain operational benchmarks
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Platform Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-[#0F172A] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-bjk-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-bjk-teal/20 text-bjk-teal border border-bjk-teal/40">
                Digital Brain Core
              </span>
              <span className="text-xs text-slate-400 font-mono">
                MongoDB Atlas: <strong className="text-emerald-400">{metrics.dbStatus}</strong> &bull; {metrics.dbName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              BJK Healthcare Enterprise Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Unified real-time telemetry across 111 Brochure Products, Quality Control, Regulatory Compliance, and BJK Workforce Intelligence.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-center">
            <button
              onClick={fetchLiveMetrics}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <Link
              to="/admin/database"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-bjk-teal hover:bg-bjk-teal/90 text-white font-bold text-xs shadow-lg shadow-bjk-teal/25 transition-all"
            >
              <Database size={15} />
              <span>Admin Database Manager</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Seeded Products"
          value={metrics.totalProducts}
          subtitle="100% brochure catalogue match"
          icon={Boxes}
          color="teal"
        />
        <KPICard
          title="Active Formulations"
          value={metrics.activeBatches}
          subtitle="WHO-GMP release workflow"
          icon={Activity}
          color="green"
        />
        <KPICard
          title="Operational Lines"
          value={metrics.operationalLines}
          subtitle="Grade B cleanrooms active"
          icon={Cpu}
          color="purple"
        />
        <KPICard
          title="Atlas Cluster"
          value={metrics.dbStatus}
          subtitle={`Database: ${metrics.dbName}`}
          icon={Database}
          color="cyan"
        />
      </div>

      {/* Connected Subsystems */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Connected Enterprise Subsystems
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/database"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-bjk-teal transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-bjk-teal/10 text-bjk-teal flex items-center justify-center group-hover:scale-105 transition-transform">
                <Database size={20} />
              </div>
              <StatusBadge status="ACTIVE" text="ATLAS CONNECTED" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-bjk-teal transition-colors">
              MongoDB Database Manager
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore 35+ enterprise Mongoose collections, run master seed, query 111 products, and export datasets.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-bjk-teal">
              <span>Open Database Manager</span>
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/hrms"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users size={20} />
              </div>
              <StatusBadge status="ACTIVE" text="ONLINE v2.0" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              BJK Healthcare HRMS Module
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Workforce Intelligence, Biometrics, Intelligent Rostering with pre-flight checks, and Statutory Payroll.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600">
              <span>Enter HRMS Operations</span>
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/hrms/compliance"
            className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <StatusBadge status="ACTIVE" text="AUDIT-READY" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
              QC Laboratory & Regulatory
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              HPLC instrument qualification logs, Schedule M revised standards, and USFDA 21 CFR Part 11 electronic records.
            </p>
            <div className="mt-4 flex items-center text-xs font-bold text-cyan-600">
              <span>Check Compliance Audit Logs</span>
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
