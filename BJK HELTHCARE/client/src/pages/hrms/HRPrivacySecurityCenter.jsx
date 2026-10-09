import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Key,
  AlertTriangle,
  FileCheck2,
  Database,
  Server,
  UserCheck,
  Clock,
  CheckCircle2,
  FileText,
  AlertOctagon,
  Eye,
  PlusCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';
import axios from 'axios';

export const HRPrivacySecurityCenter = () => {
  const [activeTab, setActiveTab] = useState('dpdp');
  const [privacyRequests, setPrivacyRequests] = useState([]);
  const [securityIncidents, setSecurityIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBreachModal, setShowBreachModal] = useState(false);
  const [showSecurityIncidentModal, setShowSecurityIncidentModal] = useState(false);

  // Form states
  const [breachForm, setBreachForm] = useState({
    title: '',
    severity: 'MEDIUM',
    affectedDataClassification: 'CONFIDENTIAL',
    estimatedRecordsAffected: 0,
    description: ''
  });

  const [incidentForm, setIncidentForm] = useState({
    title: '',
    severity: 'HIGH',
    systemAffected: 'GMP SCADA / MES',
    description: ''
  });

  const token =
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    sessionStorage.getItem('bjk_auth_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    localStorage.getItem('bjk_auth_token') ||
    localStorage.getItem('token') ||
    '';
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Data subject requests under DPDP Act 2023
      setPrivacyRequests([
        {
          _id: 'PR-001',
          requestNumber: 'DSR-2026-001',
          requestType: 'ACCESS',
          requesterName: 'Aarav Patel (EMP-014)',
          status: 'COMPLETED',
          submittedAt: '2026-04-03',
          resolvedAt: '2026-04-06',
          dpoOfficer: 'dpo@bjkhealthcare.com'
        },
        {
          _id: 'PR-002',
          requestNumber: 'DSR-2026-002',
          requestType: 'CORRECTION',
          requesterName: 'Meera Desai (EMP-045)',
          status: 'IN_REVIEW',
          submittedAt: '2026-04-10',
          resolvedAt: null,
          dpoOfficer: 'dpo@bjkhealthcare.com'
        }
      ]);

      setSecurityIncidents([
        {
          _id: 'SEC-001',
          incidentNumber: 'SEC-2026-001',
          title: 'Multiple Brute-Force Password Failures on Formulation Server (Zero Trust Lock)',
          severity: 'HIGH',
          status: 'CONTAINED',
          reportedAt: '2026-04-05 14:15',
          certInNotified: false,
          owner: 'ciso@bjkhealthcare.com'
        }
      ]);
    } catch (err) {
      console.error('Error fetching privacy/security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportBreach = (e) => {
    e.preventDefault();
    alert('Data breach logged with immediate dispatch to DPO (dpo@bjkhealthcare.com) and Legal. 24h internal & 72h DPB timers initiated.');
    setShowBreachModal(false);
  };

  const handleReportSecurityIncident = (e) => {
    e.preventDefault();
    alert('Security incident registered. 1-hour IT Security response & 6-hour CERT-In evaluation timer started.');
    setShowSecurityIncidentModal(false);
  };

  const dataClassifications = [
    {
      level: 'PUBLIC',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Approved marketing brochures, published press releases, public product monographs.',
      examples: 'Approved website content, published patents'
    },
    {
      level: 'INTERNAL',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description: 'General internal communications, HR circulars, training guidelines, standard operating manuals.',
      examples: 'General SOPs, internal announcements, cafeteria menu'
    },
    {
      level: 'CONFIDENTIAL',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Employee personal files, compensation matrices, vendor contracts, business development financials.',
      examples: 'Salaries, Aadhaar reference, employee performance reviews'
    },
    {
      level: 'RESTRICTED',
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      description: 'Master Formula Records (MFR), active API synthesis steps, patient clinical batch trial records, biometric keys.',
      examples: 'Proprietary drug formulas, R&D dossiers, raw biometrics'
    }
  ];

  const dpdpRights = [
    { title: 'Right to Access', desc: 'Summary of personal data processed, identities of sharing entities, and processing basis.' },
    { title: 'Right to Correction', desc: 'Correction of inaccurate personal data, updating obsolete records, and completing omissions.' },
    { title: 'Right to Erasure', desc: 'Erasure of personal data when specified purpose is fulfilled and retention not legally mandated.' },
    { title: 'Right to Nominate', desc: 'Nomination of an authorized individual to exercise privacy rights in event of incapacity or death.' },
    { title: 'Right to Grievance Redressal', desc: 'Readily accessible redressal from DPO with statutory escalation to Data Protection Board of India.' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                BJK-HR-POL-014 / 015
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                DPDP Act 2023 & CERT-In Compliant
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                21 CFR Part 11 / Zero Trust
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Data Privacy & IT Security Center</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Enterprise governance of pharmaceutical information assets, DPDP Act 2023 employee rights,
              data breach response protocols, and CIA-triad information security.
            </p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowBreachModal(true)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-xl font-medium text-xs shadow-lg shadow-rose-600/20 transition-all"
            >
              <AlertOctagon size={15} />
              Report Data Breach (24h SLA)
            </button>
            <button
              onClick={() => setShowSecurityIncidentModal(true)}
              className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl font-medium text-xs shadow-lg shadow-cyan-600/20 transition-all"
            >
              <AlertTriangle size={15} />
              Report IT Security Incident (1h SLA)
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-t border-slate-800/80 pt-4">
          {[
            { id: 'dpdp', label: 'DPDP Privacy & Rights', icon: Shield },
            { id: 'classification', label: 'Data Classification Matrix', icon: Database },
            { id: 'security', label: 'IT Security & Password Governance', icon: Lock },
            { id: 'incidents', label: 'Incident & Breach Register', icon: AlertOctagon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: DPDP Privacy & Rights */}
      {activeTab === 'dpdp' && (
        <div className="space-y-6">
          {/* Statutory Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Internal Breach SLA
              </span>
              <span className="text-2xl font-extrabold text-cyan-400">Within 24 Hours</span>
              <p className="text-[11px] text-slate-400 mt-2">To DPO & Response Team (IT, Legal, HR)</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                DPB Statutory Notice
              </span>
              <span className="text-2xl font-extrabold text-amber-400">Within 72 Hours</span>
              <p className="text-[11px] text-slate-400 mt-2">Notification to Data Protection Board of India</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                DPDP Statutory Penalties
              </span>
              <span className="text-2xl font-extrabold text-rose-400">Up to ₹250 Crores</span>
              <p className="text-[11px] text-slate-400 mt-2">Slide 41: Strict financial risk for failures</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Appointed DPO
              </span>
              <span className="text-sm font-bold text-white font-mono block mt-1">dpo@bjkhealthcare.com</span>
              <p className="text-[11px] text-slate-400 mt-2">Hotline: +91 9624729729 (Slide 54)</p>
            </div>
          </div>

          {/* Core Privacy Principles & Rights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <FileCheck2 size={18} className="text-cyan-400" />
                8 Core DPDP Privacy Principles (Slide 40)
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { title: '1. Lawfulness & Fairness', sub: 'Strict legal basis for processing' },
                  { title: '2. Purpose Limitation', sub: 'Only for stated HR/GMP purpose' },
                  { title: '3. Data Minimization', sub: 'Collect only what is necessary' },
                  { title: '4. Accuracy', sub: 'Maintain accurate employee files' },
                  { title: '5. Storage Limitation', sub: 'Retain only for statutory duration' },
                  { title: '6. Security & Encryption', sub: 'Protect data at rest and in transit' },
                  { title: '7. Accountability', sub: 'Documented audits & DPO oversight' },
                  { title: '8. Transparency', sub: 'Clear privacy notices to employees' }
                ].map((p, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                    <span className="font-semibold text-white block mb-0.5">{p.title}</span>
                    <span className="text-[11px] text-slate-400">{p.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <UserCheck size={18} className="text-emerald-400" />
                5 Employee Data Subject Rights (DPDP Act)
              </h2>
              <div className="space-y-2.5 text-xs">
                {dpdpRights.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-white block">{r.title}</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Data Classification Matrix */}
      {activeTab === 'classification' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-2">4-Tier Data Classification Matrix (Handbook Slide 40)</h2>
            <p className="text-xs text-slate-400 mb-6">
              All electronic files, databases, documents, and paper records at BJK Healthcare are categorized into 4 tiers with distinct handling, encryption, and access control standards.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataClassifications.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${item.color}`}>
                      LEVEL {idx + 1}: {item.level}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">21 CFR §11.10</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">Examples:</span>
                    <span className="text-xs text-slate-300 font-mono">{item.examples}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IT Security Governance */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CIA Triad */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock size={16} className="text-cyan-400" />
                The CIA Triad Governance (Slide 43)
              </h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="font-semibold text-cyan-300 block mb-0.5">Confidentiality</span>
                  <p className="text-slate-400">Strictly authorized access only. Zero Trust validation for all requests.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="font-semibold text-indigo-300 block mb-0.5">Integrity</span>
                  <p className="text-slate-400">ALCOA+ principles for GMP data: accurate, unaltered, and auditable.</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="font-semibold text-emerald-300 block mb-0.5">Availability</span>
                  <p className="text-slate-400">3-2-1 backup strategy; GMP RTO 4-8 hours; Email/HR RTO 24 hours.</p>
                </div>
              </div>
            </div>

            {/* Password Policy */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Key size={16} className="text-amber-400" />
                Password & Authentication Rules (Slide 43)
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Minimum 12 characters length</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Uppercase, lowercase, numbers & special symbols</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Mandatory change every 90 days</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>Cannot reuse previous 12 passwords</span>
                </div>
                <div className="flex items-center gap-2 text-rose-300 font-semibold pt-2 border-t border-slate-800">
                  <AlertOctagon size={14} className="text-rose-400 flex-shrink-0" />
                  <span>Account lock after 5 consecutive failed attempts</span>
                </div>
              </div>
            </div>

            {/* Mandatory MFA */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield size={16} className="text-indigo-400" />
                MFA Enforced Domains (Slide 43)
              </h2>
              <div className="space-y-2 text-xs">
                {['Remote VPN & Cloud Access', 'Privileged / Admin Accounts', 'GMP / SCADA Production Systems', 'Financial ERP & Payroll Systems', 'Official Email (Exchange/M365)'].map((dom, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 text-slate-300">
                    <span>{dom}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">ENFORCED</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prohibited Activities Box */}
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} />
              Strictly Prohibited IT Activities (Handbook Slide 44)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Unauthorized access or security bypass
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Malware, hacking tools, unlicensed software
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Data exfiltration to personal cloud or emails
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Shadow IT & unauthorized cloud sync tools
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Cryptocurrency mining on company assets
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Sharing user credentials or OTPs
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Disabling endpoint antivirus or firewall
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
                &bull; Unauthorized USB thumb drives or external storage
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Penalties under Indian IT Act: Up to 3 years imprisonment</span>
              <span className="text-rose-400 font-semibold">DPDP Act Fine: Up to ₹250 Crores</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Incident & Breach Register */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Active IT Security Incidents & CERT-In Escalation</h3>
                <p className="text-xs text-slate-400">Mandatory reporting within 1 hour; CERT-In notice within 6 hours.</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                CERT-In SLA: 6 Hours
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Incident ID</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reported Time</th>
                    <th className="py-3 px-4">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {securityIncidents.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-300">{inc.incidentNumber}</td>
                      <td className="py-3 px-4 font-medium text-white">{inc.title}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold">
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">
                          {inc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{inc.reportedAt}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{inc.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">DPDP Data Subject Requests (DSR)</h3>
                <p className="text-xs text-slate-400">Formal rights exercised by employees under the DPDP Act 2023.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Req #</th>
                    <th className="py-3 px-4">Right Exercised</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">DPO Reviewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {privacyRequests.map((pr) => (
                  <tr key={pr._id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-medium text-purple-300">{pr.requestNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{pr.requestType}</td>
                    <td className="py-3 px-4 text-slate-300">{pr.requesterName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          pr.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {pr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{pr.submittedAt}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{pr.dpoOfficer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Modal: Report Data Breach */}
      {showBreachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <h3 className="text-base font-bold mb-1 text-rose-400 flex items-center gap-2">
              <AlertOctagon size={18} /> Emergency Data Breach Intake (24h SLA)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Under BJK-HR-POL-014 and the DPDP Act 2023, data breaches must be escalated immediately to the DPO and legal counsel.
            </p>
            <form onSubmit={handleReportBreach} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Breach Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized export of batch validation records"
                  value={breachForm.title}
                  onChange={(e) => setBreachForm({ ...breachForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Severity</label>
                  <select
                    value={breachForm.severity}
                    onChange={(e) => setBreachForm({ ...breachForm, severity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Data Classification</label>
                  <select
                    value={breachForm.affectedDataClassification}
                    onChange={(e) => setBreachForm({ ...breachForm, affectedDataClassification: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500"
                  >
                    <option value="RESTRICTED">RESTRICTED</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    <option value="INTERNAL">INTERNAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description & Immediate Containment Actions Taken</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail systems affected, containment actions (e.g. network isolation, account revocation)..."
                  value={breachForm.description}
                  onChange={(e) => setBreachForm({ ...breachForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreachModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-600/30"
                >
                  Dispatch Emergency Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report Security Incident */}
      {showSecurityIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
            <h3 className="text-base font-bold mb-1 text-cyan-400 flex items-center gap-2">
              <AlertTriangle size={18} /> IT Security Incident (1h SLA)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Under BJK-HR-POL-015, all security incidents must be reported to IT Security within 1 hour.
            </p>
            <form onSubmit={handleReportSecurityIncident} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspected phishing email payload detected on production network"
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Systems / Endpoints Affected</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workstation WS-QC-04, Local subnet"
                  value={incidentForm.systemAffected}
                  onChange={(e) => setIncidentForm({ ...incidentForm, systemAffected: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Incident Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed observations, IP addresses, error codes, evidence..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecurityIncidentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md shadow-cyan-600/30"
                >
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPrivacySecurityCenter;
