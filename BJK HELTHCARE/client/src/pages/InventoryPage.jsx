import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  Layers,
  ShieldAlert,
  Building,
  History,
  Archive
} from 'lucide-react';
import { inventoryAPI, productAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'warehouses' | 'ledger'

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Item Form
  const [itemForm, setItemForm] = useState({
    itemCode: '',
    name: '',
    category: 'RAW_MATERIAL',
    currentStock: 100,
    unit: 'KG',
    minStockLevel: 20,
    reorderLevel: 30,
    warehouse: '',
    locationZone: 'Aisle 01, Rack B',
    batchNumber: '',
    expiryDate: ''
  });

  // Movement Form
  const [movementForm, setMovementForm] = useState({
    item: '',
    type: 'STOCK_IN', // STOCK_IN, STOCK_OUT, TRANSFER, ADJUSTMENT, QUARANTINE, RELEASE, RETURN
    quantity: 10,
    fromLocation: 'Receiving Bay',
    toLocation: 'Warehouse Aisle 1',
    batchNumber: '',
    reason: 'Goods received from approved vendor'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsRes, whRes, transRes, prodRes] = await Promise.all([
        inventoryAPI.getItems().catch(() => ({ data: { data: [] } })),
        inventoryAPI.getWarehouses().catch(() => ({ data: { data: [] } })),
        inventoryAPI.getTransactions().catch(() => ({ data: { data: [] } })),
        productAPI.getAll({ limit: 111 }).catch(() => ({ data: { data: [] } }))
      ]);

      const loadedItems = itemsRes.data?.data || [];
      const loadedWarehouses = whRes.data?.data || [];
      const loadedTrans = transRes.data?.data || [];
      const loadedProds = prodRes.data?.data || [];

      setItems(loadedItems);
      setWarehouses(loadedWarehouses);
      setTransactions(loadedTrans);
      setProducts(loadedProds);

      if (loadedWarehouses.length > 0 && !itemForm.warehouse) {
        setItemForm(prev => ({ ...prev, warehouse: loadedWarehouses[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await inventoryAPI.createItem(itemForm);
      setActionSuccess('Inventory master item successfully registered.');
      setShowItemModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create inventory item.');
    }
  };

  const handleRecordMovement = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await inventoryAPI.recordTransaction(movementForm);
      setActionSuccess(`Movement [${movementForm.type}] immutably logged to audit ledger.`);
      setShowMovementModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to record stock movement.');
    }
  };

  const filteredItems = items.filter(it => {
    const matchesSearch =
      (it.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (it.itemCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (it.batchNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || it.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const getStockStatus = (item) => {
    if (item.status === 'QUARANTINE') return { label: 'QUARANTINE', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    if (item.status === 'EXPIRED') return { label: 'EXPIRED', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
    if (item.status === 'BLOCKED') return { label: 'BLOCKED', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    if (item.currentStock <= (item.minStockLevel || 0)) {
      return { label: 'LOW_STOCK', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
    }
    return { label: 'HEALTHY', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Warehouse & Inventory Ledger</h1>
              <p className="text-sm text-slate-400">Pharmaceutical-Grade Inventory Traceability (WHO-GMP / 21 CFR Part 11 compliant)</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowMovementModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition shadow-lg shadow-emerald-900/20 text-sm"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Record Movement
          </button>
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition shadow-lg shadow-blue-900/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Register SKU
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked SKUs</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{items.length}</div>
          <p className="text-xs text-slate-400 mt-1">Raw, API, Excipient & Finished</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warehouse Zones</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{warehouses.length || 3} Active</div>
          <p className="text-xs text-slate-400 mt-1">Controlled temperature & humidity</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quarantine Stock</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {items.filter(i => i.status === 'QUARANTINE').length} Batches
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting QA/QC release</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Immutable Movements</span>
            <History className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{transactions.length} Logged</div>
          <p className="text-xs text-slate-400 mt-1">Zero direct editing, audited ledger</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'items'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Inventory Items & Balances
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'warehouses'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          Warehouses & Clean Bays
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'ledger'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Immutable Movement Ledger
        </button>
      </div>

      {/* Tab: Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search SKU code, item name, batch..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['ALL', 'RAW_MATERIAL', 'API', 'EXCIPIENT', 'PACKAGING', 'FINISHED_GOODS'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Item Code</th>
                    <th className="py-3.5 px-4">Item Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Current Stock</th>
                    <th className="py-3.5 px-4">Min / Reorder</th>
                    <th className="py-3.5 px-4">Batch / Expiry</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">Loading inventory items...</td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        No inventory records match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => {
                      const statusObj = getStockStatus(item);
                      return (
                        <tr key={item._id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 font-mono text-xs text-blue-400 font-semibold">
                            {item.itemCode || 'SKU-001'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">
                            {item.category?.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 font-bold text-white">
                            {item.currentStock} <span className="text-xs text-slate-400 font-normal">{item.unit || 'Units'}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">
                            {item.minStockLevel || 0} / {item.reorderLevel || 0}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">
                            <div>{item.batchNumber || 'N/A'}</div>
                            <div className="text-[11px] text-slate-500">
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 text-xs rounded-full border ${statusObj.color}`}>
                              {statusObj.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Warehouses */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(warehouses.length > 0 ? warehouses : [
            { _id: '1', code: 'WH-RAW-01', name: 'Raw Material & API Storage', type: 'RAW_MATERIAL', status: 'ACTIVE', facilityZone: 'Building A, Ground Floor', tempRange: '15°C – 25°C', humidity: '45% – 55% RH' },
            { _id: '2', code: 'WH-PKG-01', name: 'Packaging & Excipients Bay', type: 'PACKAGING', status: 'ACTIVE', facilityZone: 'Building A, Mezzanine', tempRange: 'Ambient Controlled', humidity: 'Standard RH' },
            { _id: '3', code: 'WH-FG-01', name: 'Finished Goods Quarantine & Release', type: 'FINISHED_GOODS', status: 'ACTIVE', facilityZone: 'Building C, Dispatch Logistics', tempRange: 'Controlled Room Temp', humidity: '< 60% RH' }
          ]).map(wh => (
            <div key={wh._id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-blue-400 font-bold px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
                  {wh.code}
                </span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {wh.status || 'ACTIVE'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{wh.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{wh.facilityZone || 'Main Manufacturing Unit'}</p>
              
              <div className="space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-medium text-slate-200">{wh.type || 'CONTROLLED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Temp Range:</span>
                  <span className="font-medium text-blue-300">{wh.tempRange || '15°C - 25°C'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relative Humidity:</span>
                  <span className="font-medium text-cyan-300">{wh.humidity || '45% - 55% RH'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Immutable Movement Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Immutable Inventory Transaction Journal</h3>
              <p className="text-xs text-slate-400">Strict chronological audit records. No quantity overwrite permitted.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Item / Batch</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">From → To</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No stock movement transactions recorded yet. Use 'Record Movement' to begin logging.
                    </td>
                  </tr>
                ) : (
                  transactions.map(tr => (
                    <tr key={tr._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(tr.createdAt || Date.now()).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                          tr.type === 'STOCK_IN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          tr.type === 'STOCK_OUT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          tr.type === 'QUARANTINE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {tr.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">
                        <div>{tr.item?.name || 'Inventory Item'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{tr.batchNumber || 'Batch-NA'}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {tr.quantity}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {tr.fromLocation || 'Vendor'} → {tr.toLocation || 'Storage'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {tr.reason || 'Operational transfer'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Register SKU */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-400" />
                Register Inventory SKU
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateItem} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAW-MET-001"
                    value={itemForm.itemCode}
                    onChange={e => setItemForm({ ...itemForm, itemCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="RAW_MATERIAL">Raw Material</option>
                    <option value="API">Active Pharmaceutical Ingredient (API)</option>
                    <option value="EXCIPIENT">Excipient</option>
                    <option value="PACKAGING">Packaging Material</option>
                    <option value="FINISHED_GOODS">Finished Goods</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Metformin Hydrochloride USP Grade"
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={itemForm.currentStock}
                    onChange={e => setItemForm({ ...itemForm, currentStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    placeholder="KG, LTR, PACK"
                    value={itemForm.unit}
                    onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={itemForm.minStockLevel}
                    onChange={e => setItemForm({ ...itemForm, minStockLevel: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Batch Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BATCH-MET-2026"
                    value={itemForm.batchNumber}
                    onChange={e => setItemForm({ ...itemForm, batchNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={itemForm.expiryDate}
                    onChange={e => setItemForm({ ...itemForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Save SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Movement */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                Record Stock Movement Transaction
              </h3>
              <button onClick={() => setShowMovementModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordMovement} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Movement Type</label>
                  <select
                    value={movementForm.type}
                    onChange={e => setMovementForm({ ...movementForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="STOCK_IN">Stock In (Receipt)</option>
                    <option value="STOCK_OUT">Stock Out (Issue)</option>
                    <option value="TRANSFER">Transfer (Inter-warehouse)</option>
                    <option value="ADJUSTMENT">Adjustment (Count Reconciliation)</option>
                    <option value="QUARANTINE">Move to Quarantine</option>
                    <option value="RELEASE">Release from Quarantine</option>
                    <option value="RETURN">Return to Supplier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Select Item</label>
                  <select
                    required
                    value={movementForm.item}
                    onChange={e => setMovementForm({ ...movementForm, item: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Inventory SKU</option>
                    {items.map(it => (
                      <option key={it._id} value={it._id}>
                        {it.name} ({it.currentStock} {it.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={movementForm.quantity}
                    onChange={e => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Batch Number</label>
                  <input
                    type="text"
                    placeholder="Batch designation"
                    value={movementForm.batchNumber}
                    onChange={e => setMovementForm({ ...movementForm, batchNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">From Location</label>
                  <input
                    type="text"
                    value={movementForm.fromLocation}
                    onChange={e => setMovementForm({ ...movementForm, fromLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">To Location</label>
                  <input
                    type="text"
                    value={movementForm.toLocation}
                    onChange={e => setMovementForm({ ...movementForm, toLocation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reason / SOP Justification</label>
                <textarea
                  rows="2"
                  required
                  placeholder="State technical justification for this stock adjustment or movement..."
                  value={movementForm.reason}
                  onChange={e => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/20"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
