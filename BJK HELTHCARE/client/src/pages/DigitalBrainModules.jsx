import React from 'react';
import { Link } from 'react-router-dom';
import {
  BrainCircuit,
  Building2,
  Users,
  Boxes,
  ShieldCheck,
  FileText,
  Truck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Layers,
  Database
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';

export const DigitalBrainModules = () => {
  const modules = [
    {
      title: 'Enterprise HRMS & Workforce Intelligence',
      code: 'MODULE-HRMS',
      status: 'ACTIVE_OPERATIONAL',
      description: 'Pharma staffing, biometric attendance, intelligent rostering with pre-flight checks, Indian statutory payroll, and LMS compliance.',
      link: '/hrms',
      color: 'teal',
      badge: 'Native Enterprise Module v2.0',
      features: ['Pre-Flight Roster Validation', 'Statutory EPF & ESI Engine', '360° Employee Dossier', 'AI Copilot Assistant']
    },
    {
      title: 'Production & Manufacturing Execution (MES)',
      code: 'MODULE-MES',
      status: 'SYNCHRONIZED',
      description: 'Cleanroom batch execution records, formulation line telemetry, HVAC environmental logging, and machine downtime tracking.',
      link: '/dashboard',
      color: 'purple',
      badge: 'MES Integrated',
      features: ['Formulation Line 1 & 2', 'Cleanroom Particle Counts', 'Electronic Batch Records (eBR)', 'Sterile Gowning Check']
    },
    {
      title: 'QC Laboratory Intelligence (LIMS)',
      code: 'MODULE-LIMS',
      status: 'ACTIVE_OPERATIONAL',
      description: 'High-Performance Liquid Chromatography (HPLC) analytical runs, microbial assay testing, and zero-delay OOS/OOT logging.',
      link: '/hrms/training',
      color: 'cyan',
      badge: 'GLP Certified',
      features: ['HPLC Assay Analytics', 'OOS/OOT Root Cause Log', 'Reagent Expiry Tracking', 'Analyst Certification Validation']
    },
    {
      title: 'QA & CAPA Deviation Management',
      code: 'MODULE-QA',
      status: 'ACTIVE_OPERATIONAL',
      description: 'Good Manufacturing Practice (GMP) deviations, Corrective & Preventive Actions (CAPA), and annual product quality reviews (APQR).',
      link: '/hrms/compliance',
      color: 'amber',
      badge: 'WHO-GMP Compliant',
      features: ['CAPA Workflow Sign-off', 'Change Control Logs', 'Audit Trail Analysis', 'Risk Assessment Matrix']
    },
    {
      title: 'Regulatory Affairs & eCTD Dossier Vault',
      code: 'MODULE-RA',
      status: 'AUDIT_READY',
      description: 'Centralized repository of state drug licenses, manufacturing permissions, USFDA filings, and Schedule M documentation.',
      link: '/hrms/documents',
      color: 'teal',
      badge: '21 CFR Part 11',
      features: ['Drug License Vault', 'Marketing Authorizations', 'FDA Audit Preparation', 'SHA-256 Document Integrity']
    },
    {
      title: 'Warehouse, Cold Chain & FEFO Logistics',
      code: 'MODULE-SCM',
      status: 'ACTIVE_OPERATIONAL',
      description: 'Raw material quarantine, First-Expiry-First-Out (FEFO) dispensing, and IoT 2°C–8°C cold chain continuous telemetry.',
      link: '/hrms/assets',
      color: 'green',
      badge: 'IoT Connected',
      features: ['Cold Chain Continuous Logging', 'FEFO Dispensing Protocols', 'Active Quarantined Lots', 'Barcode & RFID Asset Tracking']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="text-bjk-teal" />
            BJK Healthcare Digital Brain Platform Architecture
          </h1>
          <p className="text-sm text-slate-500">
            Enterprise application suite unifying healthcare manufacturing, laboratory quality, and workforce automation
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Architecture: Modular Monolith / Microservices Ready
        </span>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m) => (
          <div
            key={m.code}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {m.code}
                </span>
                <StatusBadge status="ACTIVE" text={m.badge} />
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-snug">{m.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Core Capabilities:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 font-medium">
                  {m.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-bjk-teal" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={13} /> Synchronized
              </span>
              <Link
                to={m.link}
                className="inline-flex items-center space-x-1 text-xs font-bold text-bjk-teal hover:text-bjk-teal/80 transition-colors"
              >
                <span>Launch Module</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalBrainModules;
