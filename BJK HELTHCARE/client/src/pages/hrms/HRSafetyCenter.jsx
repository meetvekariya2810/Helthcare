import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Flame,
  Activity,
  Users,
  CheckCircle2,
  AlertTriangle,
  Plus,
  HeartPulse,
  HardHat,
  FileCheck2,
  Calendar
} from 'lucide-react';

export const HRSafetyCenter = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    philosophy: 'ZERO HARM (Safety > Production)',
    incidents: [],
    committee: null,
    drills: [],
    kpis: { ltifr: 0, trir: 0, nearMissCount: 0, ppeCompliancePercent: 99.4, fireDrillParticipationRate: 100 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reportIncident', 'committee', 'drills'
  const [form, setForm] = useState({
    incidentType: 'NEAR_MISS',
    severity: 'LOW',
    locationExact: '',
    description: '',
    injuredPersonType: 'NONE',
    injuredPersonName: '',
    lostTimeDays: 0
  });

  useEffect(() => {
    fetchSafety();
  }, []);

  const fetchSafety = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/hr/policies/safety');
      if (res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Safety fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/hr/policies/safety/incident', form);
      alert('Safety incident / near-miss logged under Zero Harm protocol.');
      setForm({
        incidentType: 'NEAR_MISS',
        severity: 'LOW',
        locationExact: '',
        description: '',
        injuredPersonType: 'NONE',
        injuredPersonName: '',
        lostTimeDays: 0
      });
      setActiveTab('overview');
      fetchSafety();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to submit incident');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Policy BJK-HR-POL-011 (Zero Harm)
              </span>
              <span className="text-xs text-slate-400">
                Safety &gt; Production Philosophy
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center">
              <HardHat className="mr-3 text-bjk-teal" size={26} />
              Health, Safety & Environment Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Zero harm operating philosophy: EHS Plan-Do-Check-Act management, joint worker-management safety committee, continuous PPE compliance, cleanroom hygiene, and quarterly fire evacuation drills.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('reportIncident')}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500 transition-all flex items-center shadow-lg shadow-rose-600/20"
          >
            <ShieldAlert size={14} className="mr-1.5" />
            Report Incident / Near Miss
          </button>
        </div>

        {/* Safety KPIs Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-4 border-t border-slate-700/60 text-center">
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">LTIFR Rate</span>
            <span className="text-base font-black text-emerald-400">{data.kpis?.ltifr || '0.00'}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">TRIR Rate</span>
            <span className="text-base font-black text-emerald-400">{data.kpis?.trir || '0.00'}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Near Misses Logged</span>
            <span className="text-base font-black text-bjk-teal">{data.kpis?.nearMissCount || 0}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">PPE Compliance</span>
            <span className="text-base font-black text-emerald-400">{data.kpis?.ppeCompliancePercent}%</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Fire Drill Coverage</span>
            <span className="text-base font-black text-white">{data.kpis?.fireDrillParticipationRate}%</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-bjk-teal text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incidents & Near Misses
          </button>
          <button
            onClick={() => setActiveTab('committee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'committee' ? 'bg-bjk-teal text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Joint Safety Committee (&ge;50% Workers)
          </button>
          <button
            onClick={() => setActiveTab('drills')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'drills' ? 'bg-bjk-teal text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Emergency & Fire Drills
          </button>
        </div>
      </div>

      {/* Incidents Table */}
      {activeTab === 'overview' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center">
              <Activity size={18} className="mr-2 text-rose-400" />
              Safety Incident Register (No-Blame Culture)
            </h3>
            <span className="text-xs text-slate-400">Serious Injuries: Factory Inspector SLA within 4 Hours</span>
          </div>

          {(!data.incidents || data.incidents.length === 0) ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">Zero active safety incidents.</p>
              <p className="text-xs text-slate-500 mt-0.5">Maintain proactive reporting of near misses and unsafe conditions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Incident ID</th>
                    <th className="py-3 px-4">Date/Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Control Hierarchy</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.incidents.map((i) => (
                    <tr key={i.incidentId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-bjk-teal">{i.incidentId}</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(i.incidentDateTime).toLocaleString()}</td>
                      <td className="py-3 px-4 font-semibold text-white">{i.incidentType.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-slate-300">{i.locationExact}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          i.severity === 'CRITICAL_FATAL' ? 'bg-rose-500/20 text-rose-400' :
                          i.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {i.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{i.controlHierarchyLevel}</td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-amber-400">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Safety Committee Tab */}
      {activeTab === 'committee' && data.committee && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center">
              <Users className="mr-2 text-bjk-teal" size={18} />
              {data.committee.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Statutory joint consultative body meeting monthly with minimum 50% shop-floor worker representation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Worker Representatives</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">
                {data.committee.workerRepresentativeCount} / {data.committee.totalMembers} Members (60%)
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Exceeds statutory 50% requirement</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Meeting Cadence</span>
              <span className="text-xl font-black text-white mt-1 block">{data.committee.meetingFrequency}</span>
              <p className="text-[11px] text-slate-400 mt-1">Last Meeting: 15 March 2026</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Action Items</span>
              <span className="text-xl font-black text-bjk-teal mt-1 block">{data.committee.actionItemsPending}</span>
              <p className="text-[11px] text-slate-400 mt-1">Tracked under EHS PDCA cycle</p>
            </div>
          </div>
        </div>
      )}

      {/* Report Incident Form */}
      {activeTab === 'reportIncident' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white">Report Safety Incident or Near Miss</h3>
            <button onClick={() => setActiveTab('overview')} className="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Incident Type</label>
                <select
                  value={form.incidentType}
                  onChange={(e) => setForm({ ...form, incidentType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="NEAR_MISS">Near Miss (No injury occurred)</option>
                  <option value="UNSAFE_CONDITION">Unsafe Condition / Hazard</option>
                  <option value="FIRST_AID">First Aid Case</option>
                  <option value="MEDICAL_TREATMENT">Medical Treatment Case</option>
                  <option value="LOST_TIME_INJURY_LTIFR">Lost Time Injury (LTIFR)</option>
                  <option value="CHEMICAL_SPILL">Chemical Solvent Spill</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="LOW">Low (Minor scratch, negligible spill)</option>
                  <option value="MEDIUM">Medium (Requires clinic attention)</option>
                  <option value="HIGH">High (Hospitalization / severe damage)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Exact Location in Plant</label>
              <input
                type="text"
                required
                placeholder="e.g. Compression Suite 3, Unit 1"
                value={form.locationExact}
                onChange={(e) => setForm({ ...form, locationExact: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Description of Occurrence & Hazard</label>
              <textarea
                required
                rows={3}
                placeholder="Factual sequence of events, equipment involved, and any immediate containment actions..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-all shadow-lg"
            >
              Submit Safety Report (Zero Harm Protocol)
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default HRSafetyCenter;
