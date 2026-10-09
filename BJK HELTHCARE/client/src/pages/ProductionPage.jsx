import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Activity,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  X,
  FileCheck,
  ChevronRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { productionAPI, productAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const ProductionPage = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' or 'orders'
  const [search, setSearch] = useState('');

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Form states
  const [batchForm, setBatchForm] = useState({
    product: '',
    batchSize: 100000,
    line: '',
    batchNumber: ''
  });

  const [orderForm, setOrderForm] = useState({
    product: '',
    batchSize: 100000,
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchesRes, ordersRes, prodsRes, linesRes] = await Promise.all([
        productionAPI.getBatches().catch(() => ({ data: { data: [] } })),
        productionAPI.getOrders().catch(() => ({ data: { data: [] } })),
        productAPI.getAll({ limit: 111 }).catch(() => ({ data: { data: [] } })),
        productionAPI.getLines().catch(() => ({ data: { data: [] } }))
      ]);

      setBatches(batchesRes.data?.data || []);
      setOrders(ordersRes.data?.data || []);
      setProducts(prodsRes.data?.data || []);
      setLines(linesRes.data?.data || []);
    } catch (err) {
      console.error('Error loading production data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await productionAPI.createBatch(batchForm);
      if (res.data?.success) {
        setShowBatchModal(false);
        setActionSuccess(`Batch ${res.data.data.batchNumber} created successfully.`);
        loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create batch');
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await productionAPI.createOrder(orderForm);
      if (res.data?.success) {
        setShowOrderModal(false);
        setActionSuccess('Production order created successfully.');
        loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create production order');
    }
  };

  const handleAdvanceStage = async (batchId, currentProgress) => {
    setActionError('');
    setActionSuccess('');
    try {
      const nextProgress = Math.min(100, currentProgress + 25);
      const res = await productionAPI.updateBatchStage(batchId, {
        progressPercent: nextProgress,
        status: nextProgress === 100 ? 'COMPLETED' : 'MANUFACTURING'
      });
      if (res.data?.success) {
        setActionSuccess('Batch stage progress updated.');
        loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to advance stage');
    }
  };

  const handleSubmitToQC = async (batchId) => {
    setActionError('');
    setActionSuccess('');
    try {
      const res = await productionAPI.submitBatchToQC(batchId);
      if (res.data?.success) {
        setActionSuccess(res.data.message);
        loadData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit batch to QC');
    }
  };

  const filteredBatches = batches.filter(b =>
    (b.batchNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.productName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="text-[#00A896]" />
            Pharmaceutical MES: Production & Batch Execution
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Formulation scheduling, Electronic Batch Records (eBR), in-process stages & QC submission
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActionError(''); setShowOrderModal(true); }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus size={14} /> Plan Order
          </button>
          <button
            onClick={() => { setActionError(''); setShowBatchModal(true); }}
            className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00A896]/20 transition-all"
          >
            <Plus size={14} /> Create Batch
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {actionSuccess}</span>
          <button onClick={() => setActionSuccess('')}><X size={14} /></button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertCircle size={16} /> {actionError}</span>
          <button onClick={() => setActionError('')}><X size={14} /></button>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'batches' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Active Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Production Orders ({orders.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by batch # or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00A896] bg-white shadow-xs"
          />
        </div>
      </div>

      {/* Batches View */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {filteredBatches.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No batches match the search or none scheduled yet. Click "Create Batch" above to start formulation.
            </div>
          ) : (
            filteredBatches.map((batch) => (
              <div
                key={batch._id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#00A896]/50 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {batch.batchNumber}
                      </span>
                      <StatusBadge status={batch.status} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {batch.productName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Dosage: <span className="font-semibold text-slate-700">{batch.dosageForm}</span> &bull; Batch Size: <span className="font-semibold text-slate-700">{batch.batchSize?.toLocaleString()} units</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {/* Action buttons based on lifecycle */}
                    {['PLANNED', 'SCHEDULED', 'MANUFACTURING'].includes(batch.status) && (
                      <button
                        onClick={() => handleAdvanceStage(batch._id, batch.progressPercent || 0)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        Advance eBR Stage <ChevronRight size={14} />
                      </button>
                    )}

                    {['COMPLETED', 'MANUFACTURING'].includes(batch.status) && (
                      <button
                        onClick={() => handleSubmitToQC(batch._id)}
                        className="px-3 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Send size={13} /> Submit to QC
                      </button>
                    )}

                    {batch.status === 'RELEASED' && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <CheckCircle2 size={14} /> QA Released
                      </span>
                    )}
                  </div>
                </div>

                {/* eBR Stage Progress Bar & Stepper */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">
                      Current Stage: <span className="text-[#00A896]">{batch.currentStage || 'Dispensing'}</span>
                    </span>
                    <span className="font-mono font-bold text-slate-600">{batch.progressPercent || 0}% Complete</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00A896] h-full transition-all duration-500 rounded-full"
                      style={{ width: `${batch.progressPercent || 15}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-5 text-[10px] text-slate-500 pt-1 font-medium text-center">
                    <span className={(batch.progressPercent || 0) >= 20 ? 'text-[#00A896] font-bold' : ''}>1. Dispensing</span>
                    <span className={(batch.progressPercent || 0) >= 40 ? 'text-[#00A896] font-bold' : ''}>2. Granulation</span>
                    <span className={(batch.progressPercent || 0) >= 60 ? 'text-[#00A896] font-bold' : ''}>3. Compression</span>
                    <span className={(batch.progressPercent || 0) >= 80 ? 'text-[#00A896] font-bold' : ''}>4. Coating</span>
                    <span className={(batch.progressPercent || 0) >= 100 ? 'text-[#00A896] font-bold' : ''}>5. Packaging</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Production Orders View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Production Planning Orders</h3>
            <span className="text-xs text-slate-500 font-mono">{orders.length} Planned</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Product Formulation</th>
                  <th className="py-3 px-4">Batch Size</th>
                  <th className="py-3 px-4">Planned Dates</th>
                  <th className="py-3 px-4">Assigned Line</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No production orders found. Click "Plan Order" to schedule formulation.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{o.orderNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{o.productName}</td>
                      <td className="py-3 px-4">{o.batchSize?.toLocaleString()} units</td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(o.plannedStartDate).toLocaleDateString('en-GB')} &rarr; {new Date(o.plannedEndDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-3 px-4">{o.assignedLine?.name || 'Line 1 (Tablet)'}</td>
                      <td className="py-3 px-4"><StatusBadge status={o.status || 'PLANNED'} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Batch */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Production Batch (eBR)</h3>
              <button onClick={() => setShowBatchModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Formulation Product *</label>
                <select
                  required
                  value={batchForm.product}
                  onChange={(e) => setBatchForm({ ...batchForm, product: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#00A896]"
                >
                  <option value="">-- Choose from 111 Brochure Products --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      #{p.srNo} - {p.productName} ({p.dosageForm}) - {p.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Number (Leave blank to auto-generate)</label>
                <input
                  type="text"
                  placeholder="e.g. BJK-2026-001"
                  value={batchForm.batchNumber}
                  onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Size (Units) *</label>
                <input
                  type="number"
                  required
                  value={batchForm.batchSize}
                  onChange={(e) => setBatchForm({ ...batchForm, batchSize: parseInt(e.target.value) || 100000 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Manufacturing Line</label>
                <select
                  value={batchForm.line}
                  onChange={(e) => setBatchForm({ ...batchForm, line: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Select Line --</option>
                  {lines.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.code} - {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold shadow-md shadow-[#00A896]/20"
                >
                  Initialize Batch eBR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Plan Production Order */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Plan Production Order</h3>
              <button onClick={() => setShowOrderModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product *</label>
                <select
                  required
                  value={orderForm.product}
                  onChange={(e) => setOrderForm({ ...orderForm, product: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      #{p.srNo} - {p.productName} ({p.dosageForm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Planned Quantity (Units) *</label>
                <input
                  type="number"
                  required
                  value={orderForm.batchSize}
                  onChange={(e) => setOrderForm({ ...orderForm, batchSize: parseInt(e.target.value) || 100000 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={orderForm.plannedStartDate}
                    onChange={(e) => setOrderForm({ ...orderForm, plannedStartDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target End Date</label>
                  <input
                    type="date"
                    value={orderForm.plannedEndDate}
                    onChange={(e) => setOrderForm({ ...orderForm, plannedEndDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold"
                >
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPage;
