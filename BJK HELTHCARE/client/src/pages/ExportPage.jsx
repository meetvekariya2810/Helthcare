import React, { useState, useEffect } from 'react';
import {
  Plane,
  Ship,
  FileCheck,
  Plus,
  Globe,
  Anchor,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react';
import { exportAPI, crmAPI } from '../services/api';

export const ExportPage = () => {
  const [shipments, setShipments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Form
  const [form, setForm] = useState({
    shipmentNumber: '',
    country: 'Kenya',
    customer: '',
    invoiceNumber: '',
    packingListNumber: '',
    letterOfCredit: '',
    shippingMode: 'AIR_FREIGHT', // AIR_FREIGHT, SEA_FREIGHT, ROAD_FREIGHT
    portOfLoading: 'Nhava Sheva (JNPT), Mumbai',
    portOfDischarge: 'Mombasa Port',
    estimatedDeparture: '',
    estimatedArrival: '',
    notes: 'Pharmaceutical grade cold-chain temperature monitoring active'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [shipRes, custRes] = await Promise.all([
        exportAPI.getShipments().catch(() => ({ data: { data: [] } })),
        crmAPI.getCustomers().catch(() => ({ data: { data: [] } }))
      ]);

      setShipments(shipRes.data?.data || []);
      setCustomers(custRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load export data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await exportAPI.createShipment(form);
      setActionSuccess('Export consignment record created with customs documentation.');
      setShowShipmentModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create export shipment.');
    }
  };

  const handleUpdateStatus = async (shipmentId, newStatus) => {
    try {
      await exportAPI.updateStatus(shipmentId, { status: newStatus });
      setActionSuccess(`Shipment status advanced to ${newStatus}`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError('Failed to advance shipment status.');
    }
  };

  const filteredShipments = shipments.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      (s.shipmentNumber || '').toLowerCase().includes(q) ||
      (s.country || '').toLowerCase().includes(q) ||
      (s.invoiceNumber || '').toLowerCase().includes(q);
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const STAGES = [
    { key: 'CONFIRMED', label: 'Order Confirmed' },
    { key: 'DOCUMENTATION', label: 'Documentation & LC' },
    { key: 'CUSTOMS', label: 'Customs Clearance' },
    { key: 'SHIPPED', label: 'Dispatched / Port' },
    { key: 'IN_TRANSIT', label: 'In Transit' },
    { key: 'DELIVERED', label: 'Delivered / Cleared' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Global Export & Trade Logistics</h1>
              <p className="text-sm text-slate-400">Cross-Border Shipping, LC Verification & Customs Compliance</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowShipmentModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition shadow-lg shadow-blue-900/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Export Consignment
        </button>
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
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shipments</span>
            <Plane className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{shipments.length}</div>
          <p className="text-xs text-slate-400 mt-1">Air, Ocean & Overland</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Transit</span>
            <Ship className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {shipments.filter(s => s.status === 'IN_TRANSIT').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">High seas & international cargo</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Customs Stage</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {shipments.filter(s => s.status === 'CUSTOMS').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Inspection & clearance</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Destination Hubs</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">40+</div>
          <p className="text-xs text-slate-400 mt-1">Global export footprint</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search consignment #, country, invoice..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'CONFIRMED', 'DOCUMENTATION', 'CUSTOMS', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Consignment #</th>
                <th className="py-3.5 px-4">Destination Country</th>
                <th className="py-3.5 px-4">Invoice / LC</th>
                <th className="py-3.5 px-4">Shipping Mode & Port</th>
                <th className="py-3.5 px-4">Est. Arrival</th>
                <th className="py-3.5 px-4">Workflow Status</th>
                <th className="py-3.5 px-4">Advance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Loading export consignments...</td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No export shipments match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(ship => (
                  <tr key={ship._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-blue-400 font-bold">{ship.shipmentNumber || 'BJK-EXP-001'}</div>
                      <div className="text-[11px] text-slate-500">{new Date(ship.createdAt || Date.now()).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        {ship.country}
                      </div>
                      <div className="text-xs text-slate-400">{ship.customer?.name || 'International Partner'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-mono text-slate-300">Inv: {ship.invoiceNumber || 'INV-2026-EXP'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">LC: {ship.letterOfCredit || 'LC-UNCONFIRMED'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-200">{ship.shippingMode?.replace('_', ' ')}</div>
                      <div className="text-[11px] text-slate-500">{ship.portOfLoading} → {ship.portOfDischarge}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {ship.estimatedArrival ? new Date(ship.estimatedArrival).toLocaleDateString() : 'Pending Schedule'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full border ${
                        ship.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        ship.status === 'IN_TRANSIT' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        ship.status === 'CUSTOMS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {ship.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={ship.status || 'CONFIRMED'}
                        onChange={(e) => handleUpdateStatus(ship._id, e.target.value)}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                      >
                        {STAGES.map(st => (
                          <option key={st.key} value={st.key}>{st.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Shipment */}
      {showShipmentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-400" />
                Initiate Export Shipment
              </h3>
              <button onClick={() => setShowShipmentModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateShipment} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Consignment #</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BJK-EXP-2026-088"
                    value={form.shipmentNumber}
                    onChange={e => setForm({ ...form, shipmentNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Destination Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uzbekistan, Kenya, Vietnam"
                    value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Commercial Partner</label>
                  <select
                    value={form.customer}
                    onChange={e => setForm({ ...form, customer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Consignee</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.country})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Shipping Mode</label>
                  <select
                    value={form.shippingMode}
                    onChange={e => setForm({ ...form, shippingMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="AIR_FREIGHT">Air Freight (Temperature Sensitive)</option>
                    <option value="SEA_FREIGHT">Sea Freight (FCL / LCL Container)</option>
                    <option value="ROAD_FREIGHT">Road Freight Logistics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Invoice Number</label>
                  <input
                    type="text"
                    placeholder="INV-EXP-001"
                    value={form.invoiceNumber}
                    onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Packing List #</label>
                  <input
                    type="text"
                    placeholder="PL-EXP-001"
                    value={form.packingListNumber}
                    onChange={e => setForm({ ...form, packingListNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Letter of Credit (LC)</label>
                  <input
                    type="text"
                    placeholder="LC-884920"
                    value={form.letterOfCredit}
                    onChange={e => setForm({ ...form, letterOfCredit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Port of Loading</label>
                  <input
                    type="text"
                    value={form.portOfLoading}
                    onChange={e => setForm({ ...form, portOfLoading: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Port of Discharge</label>
                  <input
                    type="text"
                    value={form.portOfDischarge}
                    onChange={e => setForm({ ...form, portOfDischarge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-900/20"
                >
                  Create Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
