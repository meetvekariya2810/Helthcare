import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Building2,
  Globe,
  Tag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { crmAPI } from '../services/api';

export const CRMPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'pipeline' | 'customers'
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Enquiry Form
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: 'India',
    category: 'SALES',
    subject: '',
    message: '',
    priority: 'MEDIUM'
  });

  // Lead Form
  const [leadForm, setLeadForm] = useState({
    title: '',
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'India',
    stage: 'NEW',
    estimatedValue: 50000,
    probability: 25,
    expectedCloseDate: ''
  });

  // Customer Form
  const [customerForm, setCustomerForm] = useState({
    name: '',
    type: 'DISTRIBUTOR',
    country: 'India',
    contactPerson: '',
    email: '',
    phone: '',
    taxNumber: ''
  });

  const loadCRMData = async () => {
    try {
      setLoading(true);
      const [enqRes, leadRes, custRes] = await Promise.all([
        crmAPI.getEnquiries().catch(() => ({ data: { data: [] } })),
        crmAPI.getLeads().catch(() => ({ data: { data: [] } })),
        crmAPI.getCustomers().catch(() => ({ data: { data: [] } }))
      ]);

      setEnquiries(enqRes.data?.data || []);
      setLeads(leadRes.data?.data || []);
      setCustomers(custRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCRMData();
  }, []);

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await crmAPI.createEnquiry(enquiryForm);
      setActionSuccess('New commercial enquiry logged with AI classification.');
      setShowEnquiryModal(false);
      loadCRMData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit enquiry.');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await crmAPI.createLead(leadForm);
      setActionSuccess('Sales pipeline opportunity successfully created.');
      setShowLeadModal(false);
      loadCRMData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create lead.');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      await crmAPI.createCustomer(customerForm);
      setActionSuccess('B2B Partner / Customer account created.');
      setShowCustomerModal(false);
      loadCRMData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to register customer.');
    }
  };

  const handleUpdateLeadStage = async (leadId, newStage) => {
    try {
      await crmAPI.updateLead(leadId, { stage: newStage });
      loadCRMData();
    } catch (err) {
      setActionError('Failed to advance pipeline stage.');
    }
  };

  const filteredEnquiries = enquiries.filter(enq => {
    const q = search.toLowerCase();
    const matchesSearch =
      (enq.name || '').toLowerCase().includes(q) ||
      (enq.company || '').toLowerCase().includes(q) ||
      (enq.subject || '').toLowerCase().includes(q) ||
      (enq.country || '').toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'ALL' || enq.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const PIPELINE_STAGES = [
    { key: 'NEW', label: 'New Inquiries', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { key: 'CONTACTED', label: 'Contacted', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { key: 'QUALIFIED', label: 'Qualified (CDA/LOI)', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
    { key: 'PROPOSAL', label: 'Commercial Proposal', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { key: 'NEGOTIATION', label: 'Final Negotiation', color: 'border-orange-500/40 text-orange-400 bg-orange-500/10' },
    { key: 'WON', label: 'Won / Signed', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { key: 'LOST', label: 'Closed Lost', color: 'border-slate-500/40 text-slate-400 bg-slate-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Commercial Operations</h1>
              <p className="text-sm text-slate-400">B2B Enquiries, CMO / Loan Licensing, Global Distributor Network</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEnquiryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition shadow-lg shadow-blue-900/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Log Enquiry
          </button>
          <button
            onClick={() => setShowLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-900/20 text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            New Deal
          </button>
          <button
            onClick={() => setShowCustomerModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium transition text-sm"
          >
            <Building2 className="w-4 h-4" />
            Add Partner
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

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Website Enquiries</span>
            <Mail className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{enquiries.length}</div>
          <p className="text-xs text-slate-400 mt-1">Classified via AI Engine</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{leads.filter(l => l.stage !== 'LOST' && l.stage !== 'WON').length}</div>
          <p className="text-xs text-slate-400 mt-1">In active sales pipeline</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Commercial Partners</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{customers.length}</div>
          <p className="text-xs text-slate-400 mt-1">Distributors & Institutions</p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Categorized</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">100%</div>
          <p className="text-xs text-slate-400 mt-1">CMO, Loan Lic, Sales, Regulatory</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          Enquiries Inbox ({enquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'pipeline'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Sales Pipeline Kanban
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'customers'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Commercial Partners Directory
        </button>
      </div>

      {/* Tab: Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search contact, company, country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {['ALL', 'SALES', 'CMO', 'LOAN_LICENSING', 'REGULATORY', 'PARTNERSHIP', 'GENERAL'].map(cat => (
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
                    <th className="py-3.5 px-4">Enquiry ID / Date</th>
                    <th className="py-3.5 px-4">Contact Person</th>
                    <th className="py-3.5 px-4">Company & Country</th>
                    <th className="py-3.5 px-4">AI Category</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">Loading enquiries...</td>
                    </tr>
                  ) : filteredEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400">
                        No enquiries match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredEnquiries.map(enq => (
                      <tr key={enq._id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs text-blue-400 font-semibold">{enq.enquiryNumber || 'ENQ-2026-001'}</div>
                          <div className="text-[11px] text-slate-500">{new Date(enq.createdAt || Date.now()).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{enq.name}</div>
                          <div className="text-xs text-slate-400">{enq.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200">{enq.company || 'Private Entity'}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {enq.country || 'International'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            enq.category === 'CMO' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            enq.category === 'LOAN_LICENSING' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            enq.category === 'REGULATORY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {enq.category || 'SALES'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            enq.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            enq.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {enq.priority || 'NORMAL'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {enq.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedEnquiry(enq)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pipeline Kanban */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.key);
            return (
              <div key={stage.key} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex flex-col min-w-[220px]">
                <div className={`p-2 rounded-lg border text-xs font-semibold mb-3 flex justify-between items-center ${stage.color}`}>
                  <span>{stage.label}</span>
                  <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-[11px] font-bold">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-600">No active leads</div>
                  ) : (
                    stageLeads.map(lead => (
                      <div key={lead._id} className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-xl hover:border-blue-500/40 transition">
                        <div className="text-sm font-semibold text-white mb-1">{lead.title}</div>
                        <div className="text-xs text-slate-400 mb-2">{lead.company}</div>
                        <div className="text-xs font-bold text-emerald-400 mb-3">
                          ${(lead.estimatedValue || 0).toLocaleString()}
                        </div>

                        {/* Stage Progression Selector */}
                        <div className="pt-2 border-t border-slate-700/50 flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Stage:</span>
                          <select
                            value={lead.stage}
                            onChange={(e) => handleUpdateLeadStage(lead._id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-slate-300 text-[11px]"
                          >
                            {PIPELINE_STAGES.map(s => (
                              <option key={s.key} value={s.key}>{s.key}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Customers */}
      {activeTab === 'customers' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Commercial Accounts & Distribution Partners</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Partner Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Tax / GST / VAT ID</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">
                      No commercial partners registered yet. Use 'Add Partner' to register distributors.
                    </td>
                  </tr>
                ) : (
                  customers.map(cust => (
                    <tr key={cust._id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-white">{cust.name}</td>
                      <td className="py-3 px-4 text-slate-400">{cust.type || 'DISTRIBUTOR'}</td>
                      <td className="py-3 px-4 text-slate-300">{cust.country || 'India'}</td>
                      <td className="py-3 px-4 text-slate-300">{cust.contactPerson || cust.email}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{cust.taxNumber || 'GSTIN-PENDING'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {cust.status || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Enquiry */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Log Commercial / B2B Enquiry
              </h3>
              <button onClick={() => setShowEnquiryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEnquiry} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.name}
                    onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.company}
                    onChange={e => setEnquiryForm({ ...enquiryForm, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={enquiryForm.email}
                    onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={enquiryForm.country}
                    onChange={e => setEnquiryForm({ ...enquiryForm, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={enquiryForm.category}
                    onChange={e => setEnquiryForm({ ...enquiryForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="SALES">Sales Enquiry</option>
                    <option value="CMO">Contract Manufacturing (CMO)</option>
                    <option value="LOAN_LICENSING">Loan Licensing</option>
                    <option value="REGULATORY">Regulatory / Dossier</option>
                    <option value="PARTNERSHIP">Strategic Partnership</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={enquiryForm.priority}
                    onChange={e => setEnquiryForm({ ...enquiryForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMO inquiry for Metformin 500mg tablets"
                  value={enquiryForm.subject}
                  onChange={e => setEnquiryForm({ ...enquiryForm, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Message / Requirements</label>
                <textarea
                  rows="3"
                  required
                  value={enquiryForm.message}
                  onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Submit Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Deal / Lead */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Create Sales Opportunity
              </h3>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Paracetamol Export Contract - CIS Region"
                  value={leadForm.title}
                  onChange={e => setLeadForm({ ...leadForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={leadForm.company}
                    onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={leadForm.contactPerson}
                    onChange={e => setLeadForm({ ...leadForm, contactPerson: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Estimated Value ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={leadForm.estimatedValue}
                    onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Pipeline Stage</label>
                  <select
                    value={leadForm.stage}
                    onChange={e => setLeadForm({ ...leadForm, stage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {PIPELINE_STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-900/20"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Customer */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Register Commercial Account
              </h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Type</label>
                  <select
                    value={customerForm.type}
                    onChange={e => setCustomerForm({ ...customerForm, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="HOSPITAL">Hospital / Chain</option>
                    <option value="GOVERNMENT">Government Tender</option>
                    <option value="CMO_CLIENT">CMO Client</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={customerForm.country}
                    onChange={e => setCustomerForm({ ...customerForm, country: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  value={customerForm.contactPerson}
                  onChange={e => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedEnquiry.subject}</h3>
                <span className="text-xs font-mono text-blue-400">{selectedEnquiry.enquiryNumber}</span>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div>
                <span className="text-slate-500 text-xs uppercase block">Sender:</span>
                <span className="font-semibold text-white">{selectedEnquiry.name}</span> ({selectedEnquiry.email})
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block">Company & Country:</span>
                <span>{selectedEnquiry.company} — {selectedEnquiry.country}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs uppercase block">AI Category & Priority:</span>
                <span className="font-semibold text-blue-400">{selectedEnquiry.category}</span> | Priority: <span className="font-semibold text-amber-400">{selectedEnquiry.priority}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
                <span className="text-slate-500 uppercase block mb-1">Message Content:</span>
                {selectedEnquiry.message}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMPage;
