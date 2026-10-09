import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  X,
  Search,
  Filter,
  CheckSquare,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { qaAPI, productionAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const QAPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('deviations'); // 'deviations', 'capas', 'batchRelease', 'sops'
  const [deviations, setDeviations] = useState([]);
  const [capas, setCapas] = useState([]);
  const [batchesToRelease, setBatchesToRelease] = useState([]);
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showDevModal, setShowDevModal] = useState(false);
  const [showCapaModal, setShowCapaModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Forms
  const [devForm, setDevForm] = useState({
    title: '',
    severity: 'MAJOR',
    category: 'MANUFACTURING',
    description: ''
  });

  const [capaForm, setCapaForm] = useState({
    title: '',
    capaType: 'CORRECTIVE_ACTION',
    rootCauseAnalysis: '',
    correctiveActionPlan: '',
    preventiveActionPlan: ''
  });

  const [releaseForm, setReleaseForm] = useState({
    decision: 'RELEASED',
    remarks: 'WHO-GMP Release Review Completed. Batch records & QC results verified.'
  });

  const loadQAData = async () => {
    try {
      setLoading(true);
      const [devsRes, capasRes, batchesRes, sopsRes] = await Promise.all([
        qaAPI.getDeviations().catch(() => ({ data: { data: [] } })),
        qaAPI.getCAPAs().catch(() => ({ data: { data: [] } })),
        productionAPI.getBatches().catch(() => ({ data: { data: [] } })),
        qaAPI.getSOPs().catch(() => ({ data: { data: [] } }))
      ]);

      setDeviations(devsRes.data?.data || []);
      setCapas(capasRes.data?.data || []);
      const pendingBatches = (batchesRes.data?.data || []).filter(b => ['IN_PROCESS_QC', 'COMPLETED', 'QA_REVIEW'].includes(b.status));
      setBatchesToRelease(pendingBatches);
      setSops(sopsRes.data?.data || []);
    } catch (err) {
      console.error('QA load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQAData();
  }, []);

  const handleCreateDeviation = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await qaAPI.createDeviation(devForm);
      if (res.data?.success) {
        setShowDevModal(false);
        setActionSuccess(`Deviation ${res.data.data.deviationNumber} logged.`);
        loadQAData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to log deviation');
    }
  };

  const handleCreateCAPA = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await qaAPI.createCAPA(capaForm);
      if (res.data?.success) {
        setShowCapaModal(false);
        setActionSuccess(`CAPA ${res.data.data.capaNumber} registered.`);
        loadQAData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create CAPA');
    }
  };

  const handleBatchReleaseDecision = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await productionAPI.qaBatchRelease(selectedBatch._id, releaseForm);
      if (res.data?.success) {
        setShowReleaseModal(false);
        setActionSuccess(res.data.message);
        loadQAData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to authorize batch release');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-[#00A896]" />
            QA & Quality Management System (QMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            GMP Deviations, CAPA Root Cause Analysis, SOP Sign-Off & Official Final Batch Release Gatekeeper
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActionError(''); setShowDevModal(true); }}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} /> Log Deviation
          </button>
          <button
            onClick={() => { setActionError(''); setShowCapaModal(true); }}
            className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00A896]/20"
          >
            <Plus size={14} /> Initiate CAPA
          </button>
        </div>
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
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> {actionError}</span>
          <button onClick={() => setActionError('')}><X size={14} /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('deviations')}
          className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'deviations' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600'}`}
        >
          Deviations ({deviations.length})
        </button>
        <button
          onClick={() => setActiveTab('capas')}
          className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'capas' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600'}`}
        >
          CAPA Investigations ({capas.length})
        </button>
        <button
          onClick={() => setActiveTab('batchRelease')}
          className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'batchRelease' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600'}`}
        >
          Batch Release Gate ({batchesToRelease.length})
        </button>
        <button
          onClick={() => setActiveTab('sops')}
          className={`px-4 py-1.5 rounded-lg transition-all ${activeTab === 'sops' ? 'bg-white text-[#00A896] shadow-xs' : 'text-slate-600'}`}
        >
          SOP Registry ({sops.length})
        </button>
      </div>

      {/* Deviations Table */}
      {activeTab === 'deviations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Good Manufacturing Practice (GMP) Deviations</h3>
            <span className="text-xs text-slate-500 font-mono">21 CFR Part 211 / Schedule M Compliant</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Deviation #</th>
                  <th className="py-3 px-4">Title / Scope</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Logged Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deviations.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-400">No open deviations.</td></tr>
                ) : (
                  deviations.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.deviationNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{d.title}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.severity === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          d.severity === 'MAJOR' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {d.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">{d.category}</td>
                      <td className="py-3 px-4"><StatusBadge status={d.status} /></td>
                      <td className="py-3 px-4 text-slate-400">{new Date(d.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAPA Lifecycle View */}
      {activeTab === 'capas' && (
        <div className="space-y-4">
          {capas.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No CAPA records currently open. Click "Initiate CAPA" to begin investigation.
            </div>
          ) : (
            capas.map((c) => (
              <div key={c._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                      {c.capaNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  </div>
                  <StatusBadge status={c.status || 'OPEN'} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Root Cause Identified</span>
                    <p className="text-slate-800 mt-0.5">{c.rootCauseAnalysis || 'Root cause investigation in progress'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Corrective Action</span>
                    <p className="text-slate-800 mt-0.5">{c.correctiveActionPlan || 'Plan being formulated'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Preventive Action</span>
                    <p className="text-slate-800 mt-0.5">{c.preventiveActionPlan || 'Standard operating procedure update'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                  <span>Lifecycle: OPEN &rarr; INVESTIGATION &rarr; ROOT_CAUSE &rarr; CORRECTIVE &rarr; PREVENTIVE &rarr; QA_REVIEW &rarr; CLOSED</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Batch Release Gatekeeper View */}
      {activeTab === 'batchRelease' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Batches Awaiting Final QA Release Decision</h3>
              <p className="text-xs text-slate-500">Only QA Manager can authorize batch disposition.</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">{batchesToRelease.length} Pending</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Batch Size</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Authorize Disposition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batchesToRelease.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">No batches currently pending QA release.</td></tr>
                ) : (
                  batchesToRelease.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{b.productName}</td>
                      <td className="py-3 px-4">{b.batchSize?.toLocaleString()} units</td>
                      <td className="py-3 px-4"><StatusBadge status={b.status} /></td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedBatch(b);
                            setShowReleaseModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold text-xs shadow-xs"
                        >
                          Review & Release
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SOPs View */}
      {activeTab === 'sops' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Standard Operating Procedures (SOP) Master Index</h3>
            <span className="text-xs text-slate-500 font-mono">{sops.length} Registered</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">SOP #</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sops.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">Default SOPs indexed in document vault.</td></tr>
                ) : (
                  sops.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.sopNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{s.title}</td>
                      <td className="py-3 px-4">{s.department}</td>
                      <td className="py-3 px-4 font-mono">v{s.version}</td>
                      <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Log Deviation */}
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Log GMP Deviation Record</h3>
              <button onClick={() => setShowDevModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateDeviation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Temperature excursion in Granulation Area"
                  value={devForm.title}
                  onChange={(e) => setDevForm({ ...devForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Severity</label>
                  <select
                    value={devForm.severity}
                    onChange={(e) => setDevForm({ ...devForm, severity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="MAJOR">Major</option>
                    <option value="MINOR">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={devForm.category}
                    onChange={(e) => setDevForm({ ...devForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="MANUFACTURING">Manufacturing</option>
                    <option value="QUALITY_CONTROL">Quality Control</option>
                    <option value="ENVIRONMENTAL">Environmental / HVAC</option>
                    <option value="PACKAGING">Packaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Immediate Action *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed description of anomaly..."
                  value={devForm.description}
                  onChange={(e) => setDevForm({ ...devForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDevModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold"
                >
                  Commit Deviation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Initiate CAPA */}
      {showCapaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Initiate CAPA Investigation</h3>
              <button onClick={() => setShowCapaModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateCAPA} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">CAPA Title *</label>
                <input
                  type="text"
                  required
                  value={capaForm.title}
                  onChange={(e) => setCapaForm({ ...capaForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Root Cause Analysis</label>
                <textarea
                  rows="2"
                  value={capaForm.rootCauseAnalysis}
                  onChange={(e) => setCapaForm({ ...capaForm, rootCauseAnalysis: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corrective Action Plan</label>
                <textarea
                  rows="2"
                  value={capaForm.correctiveActionPlan}
                  onChange={(e) => setCapaForm({ ...capaForm, correctiveActionPlan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preventive Action Plan</label>
                <textarea
                  rows="2"
                  value={capaForm.preventiveActionPlan}
                  onChange={(e) => setCapaForm({ ...capaForm, preventiveActionPlan: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCapaModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold"
                >
                  Submit CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Authorize Batch Release */}
      {showReleaseModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Authorize Batch Release Disposition</h3>
                <p className="text-xs text-slate-500 font-mono">Batch: {selectedBatch.batchNumber}</p>
              </div>
              <button onClick={() => setShowReleaseModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p><span className="text-slate-400">Product:</span> <span className="font-bold text-slate-900">{selectedBatch.productName}</span></p>
              <p><span className="text-slate-400">Size:</span> <span className="font-bold text-slate-900">{selectedBatch.batchSize?.toLocaleString()} units</span></p>
            </div>

            <form onSubmit={handleBatchReleaseDecision} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official QA Disposition *</label>
                <select
                  value={releaseForm.decision}
                  onChange={(e) => setReleaseForm({ ...releaseForm, decision: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white font-bold"
                >
                  <option value="RELEASED">QA Approved - Formal Commercial Release</option>
                  <option value="REJECTED">QA Rejected - Lot Quarantined / Scrapped</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">QA Review Remarks & Justification *</label>
                <textarea
                  rows="3"
                  required
                  value={releaseForm.remarks}
                  onChange={(e) => setReleaseForm({ ...releaseForm, remarks: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                Authorized Signatory: <strong>{user?.name || 'QA Manager'}</strong> &bull; This action will permanently generate an immutable 21 CFR Part 11 audit trail entry.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow-md ${
                    releaseForm.decision === 'RELEASED' ? 'bg-[#00A896] hover:bg-[#00A896]/90' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Authorize {releaseForm.decision}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAPage;
