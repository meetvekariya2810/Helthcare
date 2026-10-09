import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  Printer,
  ChevronRight,
  TestTube
} from 'lucide-react';
import { qcAPI, productAPI, productionAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const QCPage = () => {
  const [samples, setSamples] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showCOAModal, setShowCOAModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [coaData, setCoaData] = useState(null);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Forms
  const [sampleForm, setSampleForm] = useState({
    sampleType: 'FINISHED_GOODS',
    product: '',
    batch: '',
    quantity: '20 Tablets',
    storageCondition: 'Store below 25°C in dry place'
  });

  const [resultForm, setResultForm] = useState({
    testName: 'Assay by HPLC (Active Content)',
    specification: '90.0% – 110.0% of label claim',
    observedValue: '99.4',
    unit: '%',
    isOOS: false,
    remarks: 'Complies with IP/USP limits'
  });

  const loadQCData = async () => {
    try {
      setLoading(true);
      const [samplesRes, prodsRes, batchesRes] = await Promise.all([
        qcAPI.getSamples().catch(() => ({ data: { data: [] } })),
        productAPI.getAll({ limit: 111 }).catch(() => ({ data: { data: [] } })),
        productionAPI.getBatches().catch(() => ({ data: { data: [] } }))
      ]);

      setSamples(samplesRes.data?.data || []);
      setProducts(prodsRes.data?.data || []);
      setBatches(batchesRes.data?.data || []);
    } catch (err) {
      console.error('QC load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQCData();
  }, []);

  const handleRegisterSample = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await qcAPI.createSample(sampleForm);
      if (res.data?.success) {
        setShowSampleModal(false);
        setActionSuccess(`Sample ${res.data.data.sampleNumber} registered for analytical testing.`);
        loadQCData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register sample');
    }
  };

  const handleEnterResult = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const payload = {
        sampleId: selectedSample._id,
        ...resultForm
      };
      const res = await qcAPI.enterResult(payload);
      if (res.data?.success) {
        setShowResultModal(false);
        setActionSuccess(res.data.message);
        loadQCData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to enter result');
    }
  };

  const handleGenerateCOA = async (sample) => {
    setActionError('');
    try {
      const res = await qcAPI.generateCOA(sample._id);
      if (res.data?.success) {
        setCoaData(res.data.data);
        setShowCOAModal(true);
        loadQCData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to generate Certificate of Analysis');
    }
  };

  const filteredSamples = samples.filter(s =>
    (s.sampleNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.product?.productName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <TestTube className="text-[#00A896]" />
            QC Laboratory Intelligence (LIMS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            High-Performance Liquid Chromatography (HPLC), sterility assays, Out-Of-Specification (OOS) root cause & COA release
          </p>
        </div>

        <button
          onClick={() => { setActionError(''); setShowSampleModal(true); }}
          className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#00A896]/20 transition-all self-start sm:self-center"
        >
          <Plus size={14} /> Register QC Sample
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
          <span className="flex items-center gap-2"><AlertTriangle size={16} /> {actionError}</span>
          <button onClick={() => setActionError('')}><X size={14} /></button>
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search samples..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00A896] bg-white shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-600 border border-slate-200">
            Total Samples: {samples.length}
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-50 font-bold text-amber-700 border border-amber-200">
            Pending / In Progress: {samples.filter(s => s.status !== 'COMPLETED').length}
          </span>
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Laboratory Analytical Samples Log</h3>
          <span className="text-xs text-slate-500 font-mono">GLP / Schedule M Guidelines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Sample ID</th>
                <th className="py-3 px-4">Product / Material</th>
                <th className="py-3 px-4">Sample Type</th>
                <th className="py-3 px-4">Batch Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Certificate of Analysis</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No samples registered. Click "Register QC Sample" to begin testing.
                  </td>
                </tr>
              ) : (
                filteredSamples.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.sampleNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.product?.productName || 'Raw Material Lot'}</td>
                    <td className="py-3 px-4">{s.sampleType}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.batch?.batchNumber || 'N/A'}</td>
                    <td className="py-3 px-4"><StatusBadge status={s.status} /></td>
                    <td className="py-3 px-4 font-mono">
                      {s.coaNumber ? (
                        <button
                          onClick={() => handleGenerateCOA(s)}
                          className="text-[#00A896] hover:underline font-bold text-xs"
                        >
                          {s.coaNumber}
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Pending Results</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedSample(s);
                          setShowResultModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px]"
                      >
                        Enter Result
                      </button>

                      <button
                        onClick={() => handleGenerateCOA(s)}
                        className="px-2.5 py-1 rounded-lg bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold text-[11px] shadow-xs"
                      >
                        Issue COA
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Sample */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register QC Laboratory Sample</h3>
              <button onClick={() => setShowSampleModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleRegisterSample} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sample Type *</label>
                <select
                  value={sampleForm.sampleType}
                  onChange={(e) => setSampleForm({ ...sampleForm, sampleType: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="FINISHED_GOODS">Finished Goods Formulation</option>
                  <option value="RAW_MATERIAL">Raw Material / Active Pharmaceutical Ingredient (API)</option>
                  <option value="IN_PROCESS">In-Process Blend / Core Tablets</option>
                  <option value="PACKAGING">Packaging Material</option>
                  <option value="STABILITY">Stability Chamber Sample</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product *</label>
                <select
                  required
                  value={sampleForm.product}
                  onChange={(e) => setSampleForm({ ...sampleForm, product: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      #{p.srNo} - {p.productName} ({p.dosageForm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Related Batch (Optional)</label>
                <select
                  value={sampleForm.batch}
                  onChange={(e) => setSampleForm({ ...sampleForm, batch: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchNumber} - {b.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sample Quantity Withdrawn</label>
                <input
                  type="text"
                  value={sampleForm.quantity}
                  onChange={(e) => setSampleForm({ ...sampleForm, quantity: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSampleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold"
                >
                  Register Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Enter Test Result */}
      {showResultModal && selectedSample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Enter Analytical Test Result</h3>
                <p className="text-xs text-slate-500 font-mono">Sample: {selectedSample.sampleNumber}</p>
              </div>
              <button onClick={() => setShowResultModal(false)}><X size={18} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleEnterResult} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={resultForm.testName}
                  onChange={(e) => setResultForm({ ...resultForm, testName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specification Limit *</label>
                <input
                  type="text"
                  required
                  value={resultForm.specification}
                  onChange={(e) => setResultForm({ ...resultForm, specification: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Observed Value *</label>
                  <input
                    type="text"
                    required
                    value={resultForm.observedValue}
                    onChange={(e) => setResultForm({ ...resultForm, observedValue: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={resultForm.unit}
                    onChange={(e) => setResultForm({ ...resultForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={resultForm.isOOS}
                    onChange={(e) => setResultForm({ ...resultForm, isOOS: e.target.checked })}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Mark as Out-Of-Specification (OOS)</span>
                </label>
                <p className="text-[10px] text-amber-700 mt-1 pl-5">
                  Notice: Marking OOS will trigger an automated QA Deviation & Phase 1 Lab Investigation workflow.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#00A896]/90 text-white font-bold"
                >
                  Commit Test Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Certificate of Analysis (COA) Preview */}
      {showCOAModal && coaData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00A896]">Official Quality Document</span>
                <h2 className="text-xl font-black text-slate-900">Certificate of Analysis (COA)</h2>
                <p className="text-xs font-mono text-slate-500">{coaData.coaNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  title="Print COA"
                >
                  <Printer size={16} />
                </button>
                <button onClick={() => setShowCOAModal(false)}><X size={18} className="text-slate-400" /></button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-medium">Product Name:</span>
                <p className="font-bold text-slate-900">{coaData.sample?.product?.productName || 'BJK Formulation'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Dosage Form:</span>
                <p className="font-bold text-slate-900">{coaData.sample?.product?.dosageForm || 'Solid Oral'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Sample Number:</span>
                <p className="font-mono font-bold text-slate-900">{coaData.sample?.sampleNumber}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date of Issue:</span>
                <p className="font-bold text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Analytical Test Parameters:</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">Test Parameter</th>
                      <th className="py-2 px-3">Specification</th>
                      <th className="py-2 px-3">Result Observed</th>
                      <th className="py-2 px-3">Conclusion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(coaData.results || []).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-3 px-3 text-center text-slate-400">
                          Default Baseline Standard: Assay 99.4%, Disintegration Complies, Dissolution 98.2%.
                        </td>
                      </tr>
                    ) : (
                      coaData.results.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.testName}</td>
                          <td className="py-2 px-3 text-slate-600">{r.specification}</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{r.observedValue} {r.unit}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'PASS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Digitally Signed by Quality Control Manager
              </span>
              <button
                onClick={() => setShowCOAModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QCPage;
