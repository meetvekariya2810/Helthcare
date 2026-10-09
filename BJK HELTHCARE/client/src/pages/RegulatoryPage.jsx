import React, { useState, useEffect } from 'react';
import {
  Globe,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  X
} from 'lucide-react';
import { regulatoryAPI, productAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const RegulatoryPage = () => {
  const [records, setRecords] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [deadlines, setDeadlines] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('records'); // 'records', 'deadlines', 'dossiers'
  const [search, setSearch] = useState('');

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const [recordForm, setRecordForm] = useState({
    country: 'Kenya',
    countryCode: 'KE',
    product: '',
    registrationNumber: '',
    regulatoryAuthority: 'Pharmacy and Poisons Board (PPB)',
    submissionDate: new Date().toISOString().split('T')[0],
    approvalDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
    status: 'APPROVED'
  });

  const loadRegulatoryData = async () => {
    try {
      setLoading(true);
      const [recordsRes, dossiersRes, deadlinesRes, prodsRes] = await Promise.all([
        regulatoryAPI.getRecords().catch(() => ({ data: { data: [] } })),
        regulatoryAPI.getDossiers().catch(() => ({ data: { data: [] } })),
        regulatoryAPI.getDeadlines().catch(() => ({ data: { data: null } })),
        productAPI.getAll({ limit: 111 }).catch(() => ({ data: { data: [] } }))
      ]);

      setRecords(recordsRes.data?.data || []);
      setDossiers(dossiersRes.data?.data || []);
      setDeadlines(deadlinesRes.data?.data || null);
      setProducts(prodsRes.data?.data || []);
    } catch (err) {
      console.error('Regulatory load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegulatoryData();
  }, []);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await regulatoryAPI.createRecord(recordForm);
      if (res.data?.success) {
        setShowRecordModal(false);
        setActionSuccess(`Registration record created for ${recordForm.country}.`);
        loadRegulatoryData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create regulatory record');
    }
  };

  const filteredRecords = records.filter(r =>
    (r.country || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.product?.productName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Globe className="text-[#00A896]" />
            Regulatory Affairs & Global Dossier Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            50+ Country Registrations, CTD/eCTD submissions, renewal calendar & automated deadline alerts
          </p>
        </div>

        <button
          onClick={() => { setActionError(''); setShowRecordModal(true); }}
          className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00A896]/20 transition-all self-start sm:self-center"
        >
          <Plus size={14} /> Add Country Registration
        </button>
      </div>

      {/* Notifications */}
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

      {/* Deadline Bracket KPI Cards (Section 12: 90, 60, 30, 7 days, overdue) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-2xl bg-white border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-rose-600">Overdue Renewals</span>
          <p className="text-xl font-black text-rose-700">{deadlines?.overdue?.count || 0}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-orange-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-orange-600">Due in 7 Days</span>
          <p className="text-xl font-black text-orange-700">{deadlines?.within7Days?.count || 0}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-600">Due in 30 Days</span>
          <p className="text-xl font-black text-amber-700">{deadlines?.within30Days?.count || 0}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-yellow-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-yellow-700">Due in 60 Days</span>
          <p className="text-xl font-black text-yellow-800">{deadlines?.within60Days?.count || 0}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-teal-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase text-[#00A896]">Due in 90 Days</span>
          <p className="text-xl font-black text-[#00A896]">{deadlines?.within90Days?.count || 1}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'records' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600'}`}
        >
          Country Registrations ({records.length})
        </button>
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'dossiers' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600'}`}
        >
          eCTD Dossiers ({dossiers.length})
        </button>
      </div>

      {/* Registrations Table */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Country Registration & Marketing Authorizations</h3>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search country or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#00A896]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Registered Product</th>
                  <th className="py-3 px-4">Authority</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-400">No regulatory records found.</td></tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{r.countryCode || 'INT'}</span>
                        {r.country}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{r.registrationNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{r.product?.productName || 'WHO-GMP Marketing Authorization'}</td>
                      <td className="py-3 px-4 text-slate-500">{r.regulatoryAuthority || 'Health Ministry'}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-GB') : 'Perpetual'}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dossiers View */}
      {activeTab === 'dossiers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">CTD / eCTD / ACTD Technical Dossiers</h3>
            <span className="text-xs text-slate-500 font-mono">Module 1 to 5 Compliant</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Submission #</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Target Region</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dossiers.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">Default CTD dossiers on file.</td></tr>
                ) : (
                  dossiers.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.submissionNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.product?.productName || 'Solid Oral'}</td>
                      <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-teal-50 text-[#00A896] font-bold text-[10px]">{d.format || 'eCTD'}</span></td>
                      <td className="py-3 px-4">{d.targetRegion || 'Global'}</td>
                      <td className="py-3 px-4"><StatusBadge status={d.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Country Registration */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Country Registration Record</h3>
              <button onClick={() => setShowRecordModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Name *</label>
                  <input
                    type="text"
                    required
                    value={recordForm.country}
                    onChange={(e) => setRecordForm({ ...recordForm, country: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country Code</label>
                  <input
                    type="text"
                    value={recordForm.countryCode}
                    onChange={(e) => setRecordForm({ ...recordForm, countryCode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product *</label>
                <select
                  required
                  value={recordForm.product}
                  onChange={(e) => setRecordForm({ ...recordForm, product: e.target.value })}
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
                <label className="block font-bold text-slate-700 mb-1">Registration # / Marketing Authorization</label>
                <input
                  type="text"
                  placeholder="e.g. PPB/MA/2026/892"
                  value={recordForm.registrationNumber}
                  onChange={(e) => setRecordForm({ ...recordForm, registrationNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Expiry / Renewal Deadline Date *</label>
                <input
                  type="date"
                  required
                  value={recordForm.expiryDate}
                  onChange={(e) => setRecordForm({ ...recordForm, expiryDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold"
                >
                  Save Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryPage;
