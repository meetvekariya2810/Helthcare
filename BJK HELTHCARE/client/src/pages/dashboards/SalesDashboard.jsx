import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Briefcase,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  Mail,
  Phone,
  FileSpreadsheet,
  Package
} from 'lucide-react';
import { DepartmentDashboardContainer } from './DepartmentDashboardContainer';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const SalesDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await apiClient.get('/dashboard/department-data');
      if (res.data?.success) {
        setData(res.data.departmentData);
      }
    } catch (err) {
      console.warn('Sales telemetry note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const kpis = [
    {
      title: 'Sales Pipeline Value',
      value: data?.kpis?.pipelineValue || '₹ 4,80,00,000',
      subtext: 'Active CRM Deals',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
      trend: '+18.5%',
      trendLabel: 'vs last month'
    },
    {
      title: 'B2B Leads & CMO Contracts',
      value: `${data?.kpis?.activeB2BLeads || 14} / ${data?.kpis?.cmoContractsActive || 6}`,
      subtext: 'Institutional Clients',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-indigo-600',
      trend: '6 Contracts Active',
      trendColor: 'text-indigo-600 font-bold'
    },
    {
      title: 'New Website Inquiries',
      value: data?.kpis?.newWebsiteEnquiries || 9,
      subtext: 'Domestic & Export Leads',
      icon: Mail,
      iconBg: 'bg-amber-50 text-amber-600',
      trend: '4 Need Follow-Up',
      trendColor: 'text-amber-600 font-bold'
    },
    {
      title: 'Catalog SKUs Available',
      value: data?.kpis?.catalogSKUsAvailable || 111,
      subtext: 'Tablets, Caps, Syrups',
      icon: Package,
      iconBg: 'bg-teal-50 text-teal-600',
      trend: '100% Ready for Supply',
      trendColor: 'text-emerald-600 font-bold'
    }
  ];

  const quickActions = [
    { label: 'Record Customer Lead', icon: Plus, primary: true },
    { label: 'Generate Commercial Quotation', icon: Briefcase },
    { label: 'Browse Products (111 SKUs)', icon: Package },
    { label: 'Export Sales Pipeline', icon: FileSpreadsheet }
  ];

  return (
    <DepartmentDashboardContainer
      departmentTitle="Commercial, Sales & Marketing Command Center — CRM & B2B Inquiries"
      departmentCode="SLS"
      departmentBadgeColor="indigo"
      kpiCards={kpis}
      quickActions={quickActions}
      onRefresh={loadData}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CRM Leads & Website Inquiries (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active CRM Leads & Institutional Deals</h3>
                  <p className="text-[11px] text-slate-400">Domestic Distributors & Global Export Buyers</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { company: 'Apollo Pharmacy Group (Central Sourcing)', deal: 'Supply of Antibiotics & Gastro Range', value: '₹ 85,00,000', stage: 'PROPOSAL_SENT', contact: 'procurement@apollopharmacy.org' },
                { company: 'MedPlus Health Services B2B', deal: 'Annual Rate Contract for Paracetamol & Cetirizine', value: '₹ 45,00,000', stage: 'NEGOTIATION', contact: 'vendor@medplusindia.com' },
                { company: 'Al-Madina Pharmaceuticals UAE', deal: 'Export of Solid Orals 500k Packs', value: '$ 180,000 USD', stage: 'CONTRACT_SIGNED', contact: 'trade@almadinauae.ae' },
                { company: 'Nairobi Health Supplies Kenya', deal: 'Government Tender Supply for Amoxicillin', value: '$ 120,000 USD', stage: 'QUOTATION_EVALUATION', contact: 'tenders@nairobihealth.co.ke' }
              ].map((lead, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-900">{lead.company}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        lead.stage === 'CONTRACT_SIGNED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {lead.stage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1">{lead.deal}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{lead.contact}</p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className="text-sm font-black text-slate-900">{lead.value}</span>
                    <button
                      onClick={() => alert(`Opening deal ${lead.company}`)}
                      className="px-3 py-1.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Products & Enquiry Inward (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Recent Web & B2B Inquiries</h3>
            <div className="space-y-2.5 text-xs">
              {[
                { name: 'Dr. Vivek Menon', company: 'Kerala Medical Services', requirement: 'Quote for Pantoprazole 40mg (10,000 Strips)', time: '2 hours ago' },
                { name: 'Mr. Tariq Mansoor', company: 'Gulf Pharma Distributor', requirement: 'Export catalogue inquiry for Cough Syrups', time: '5 hours ago' }
              ].map((inq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{inq.name}</span>
                    <span className="text-[9px] text-slate-400">{inq.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{inq.company}</p>
                  <p className="text-[11px] text-slate-700 font-medium">{inq.requirement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DepartmentDashboardContainer>
  );
};
