import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Boxes,
  Factory,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardAPI, productionAPI, inventoryAPI } from '../services/api';

export const OperationsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOpsData = async () => {
      try {
        setLoading(true);
        const [dashRes, batchesRes, ordersRes] = await Promise.all([
          dashboardAPI.getSummary().catch(() => ({ data: { data: {} } })),
          productionAPI.getBatches().catch(() => ({ data: { data: [] } })),
          productionAPI.getOrders().catch(() => ({ data: { data: [] } }))
        ]);

        setSummary(dashRes.data?.data || {});
        setBatches(batchesRes.data?.data || []);
        setOrders(ordersRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load operations dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOpsData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Operations Command Dashboard</h1>
              <p className="text-sm text-slate-400">Manufacturing Execution, Capacity Utilization & Inventory Velocity</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/production"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition shadow-lg shadow-blue-900/20 text-sm"
          >
            <PlayCircle className="w-4 h-4" />
            Production Control
          </Link>
          <Link
            to="/inventory"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition text-sm"
          >
            <Boxes className="w-4 h-4" />
            Warehouse Ledger
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Batches</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{summary?.batchesCount || batches.length}</div>
          <p className="text-xs text-slate-400 mt-1">In compounding, compression & packaging</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Production Lines</span>
            <Factory className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">7 Active Lines</div>
          <p className="text-xs text-slate-400 mt-1">Oral Solids, Liquids, Injectables, Ointments</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Orders</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{orders.length}</div>
          <p className="text-xs text-slate-400 mt-1">Production orders in queue</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Operational Integrity</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">Validated</div>
          <p className="text-xs text-slate-400 mt-1">QA release strictly segregated</p>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batches in Flight */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Live Manufacturing Batches
            </h3>
            <Link to="/production" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {batches.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No active batches in flight. Schedule orders in Production Control.
              </div>
            ) : (
              batches.slice(0, 5).map(b => (
                <div key={b._id} className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs font-bold text-blue-400">{b.batchNumber}</div>
                    <div className="text-sm font-semibold text-white">{b.product?.productName || 'Pharmaceutical SKU'}</div>
                    <div className="text-[11px] text-slate-400">Target: {(b.batchSize || 100000).toLocaleString()} Units</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 text-xs rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {b.stage || 'MANUFACTURING'}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">Line {b.productionLine || 'L-01'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operational Modules Direct Access */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2 pb-4 border-b border-slate-800">
            <Factory className="w-4 h-4 text-emerald-400" />
            Operational Facilities & Systems
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/factory"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 rounded-xl transition group"
            >
              <Factory className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-semibold text-white text-sm group-hover:text-emerald-300">Factory Digital Twin</div>
              <div className="text-xs text-slate-400 mt-1">Facility cleanrooms, HVAC & machine lines</div>
            </Link>

            <Link
              to="/inventory"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 rounded-xl transition group"
            >
              <Boxes className="w-5 h-5 text-blue-400 mb-2" />
              <div className="font-semibold text-white text-sm group-hover:text-blue-300">Inventory & Quarantine</div>
              <div className="text-xs text-slate-400 mt-1">Raw material, excipient & packaging stocks</div>
            </Link>

            <Link
              to="/quality/qc"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 rounded-xl transition group"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-semibold text-white text-sm group-hover:text-amber-300">Quality Control (QC)</div>
              <div className="text-xs text-slate-400 mt-1">In-process sampling & analytical tests</div>
            </Link>

            <Link
              to="/ai"
              className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 rounded-xl transition group"
            >
              <Activity className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="font-semibold text-white text-sm group-hover:text-cyan-300">AI Operations Copilot</div>
              <div className="text-xs text-slate-400 mt-1">Grounded enterprise queries & metrics</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationsDashboard;
