import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Download,
  Eye,
  Archive,
  History,
  Clock
} from 'lucide-react';
import { documentAPI } from '../services/api';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // New Doc Form
  const [form, setForm] = useState({
    documentNumber: '',
    title: '',
    type: 'SOP', // SOP, COA, BATCH_RECORD, DOSSIER, REGULATORY, CERTIFICATE, CONTRACT
    department: 'QUALITY_ASSURANCE',
    version: '1.0',
    effectiveDate: '',
    expiryDate: '',
    fileLocation: '/documents/vault/controlled_spec.pdf',
    notes: 'Controlled master document under 21 CFR Part 11 revision controls'
  });

  // Version increment Form
  const [versionForm, setVersionForm] = useState({
    version: '1.1',
    changeDescription: 'Updated analytical method limits per USP 44 monograph'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await documentAPI.getAll();
      setDocuments(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await documentAPI.create(form);
      setActionSuccess('Document registered in controlled enterprise vault.');
      setShowUploadModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register document.');
    }
  };

  const handleApprove = async (docId) => {
    setActionError('');
    try {
      await documentAPI.approve(docId);
      setActionSuccess('Document officially APPROVED and electronically signed.');
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve document.');
    }
  };

  const handleAddVersion = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    setActionError('');
    try {
      await documentAPI.newVersion(selectedDoc._id, versionForm);
      setActionSuccess(`New version ${versionForm.version} created for ${selectedDoc.documentNumber}.`);
      setShowVersionModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create new revision.');
    }
  };

  const filteredDocs = documents.filter(d => {
    const q = search.toLowerCase();
    const matchesSearch =
      (d.title || '').toLowerCase().includes(q) ||
      (d.documentNumber || '').toLowerCase().includes(q);
    const matchesType = selectedType === 'ALL' || d.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Controlled Document Management Vault</h1>
              <p className="text-sm text-slate-400">SOPs, COAs, Batch Manufacturing Records & Version Integrity (Annex 11)</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition shadow-lg shadow-blue-900/20 text-sm"
        >
          <Plus className="w-4 h-4" />
          Register Controlled Document
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vault Records</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{documents.length}</div>
          <p className="text-xs text-slate-400 mt-1">Controlled enterprise docs</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved & Active</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {documents.filter(d => d.status === 'APPROVED').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Electronically verified</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Under Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {documents.filter(d => d.status === 'UNDER_REVIEW' || d.status === 'DRAFT').length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Pending QA sign-off</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revisions Tracked</span>
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">Immutable</div>
          <p className="text-xs text-slate-400 mt-1">Never overwritten</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search document #, title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'SOP', 'COA', 'BATCH_RECORD', 'DOSSIER', 'REGULATORY', 'CERTIFICATE', 'CONTRACT'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedType === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Document # / Version</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Effective / Expiry</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">Loading document vault...</td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No controlled documents found. Use 'Register Controlled Document' to upload.
                  </td>
                </tr>
              ) : (
                filteredDocs.map(doc => (
                  <tr key={doc._id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs text-blue-400 font-bold">{doc.documentNumber}</div>
                      <div className="text-[11px] font-mono text-cyan-400">v{doc.version || '1.0'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                      {doc.title}
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {doc.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {doc.department?.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      <div>Eff: {doc.effectiveDate ? new Date(doc.effectiveDate).toLocaleDateString() : 'Immediate'}</div>
                      <div className="text-[11px] text-slate-500">Exp: {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'Indefinite'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full border ${
                        doc.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        doc.status === 'UNDER_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {doc.status || 'DRAFT'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {doc.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprove(doc._id)}
                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs transition"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setVersionForm({
                              version: `1.${(parseInt(doc.version?.split('.')[1] || '0') + 1)}`,
                              changeDescription: ''
                            });
                            setShowVersionModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                        >
                          New Revision
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Document */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Register Controlled Master Document
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Doc Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOP-QA-042"
                    value={form.documentNumber}
                    onChange={e => setForm({ ...form, documentNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Document Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SOP">Standard Operating Procedure (SOP)</option>
                    <option value="COA">Certificate of Analysis (COA)</option>
                    <option value="BATCH_RECORD">Batch Manufacturing Record (BMR/BPR)</option>
                    <option value="DOSSIER">Common Technical Document (CTD)</option>
                    <option value="REGULATORY">Regulatory Certificate</option>
                    <option value="CONTRACT">Commercial Agreement / Quality Agreement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. In-Process Disintegration & Hardness Testing Protocol"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Initial Version</label>
                  <input
                    type="text"
                    required
                    value={form.version}
                    onChange={e => setForm({ ...form, version: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="QUALITY_ASSURANCE">Quality Assurance</option>
                    <option value="QUALITY_CONTROL">Quality Control</option>
                    <option value="MANUFACTURING">Manufacturing / Production</option>
                    <option value="REGULATORY_AFFAIRS">Regulatory Affairs</option>
                    <option value="WAREHOUSE">Warehouse & Supply Chain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={e => setForm({ ...form, effectiveDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Revision */}
      {showVersionModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                Create New Revision
              </h3>
              <button onClick={() => setShowVersionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddVersion} className="p-5 space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400">
                Incrementing revision for: <span className="font-bold text-white">{selectedDoc.documentNumber}</span> ({selectedDoc.title})
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">New Version Designation</label>
                <input
                  type="text"
                  required
                  value={versionForm.version}
                  onChange={e => setVersionForm({ ...versionForm, version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Change Justification / Reason</label>
                <textarea
                  rows="3"
                  required
                  placeholder="State the technical rationale and change control ticket number..."
                  value={versionForm.changeDescription}
                  onChange={e => setVersionForm({ ...versionForm, changeDescription: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Save Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
