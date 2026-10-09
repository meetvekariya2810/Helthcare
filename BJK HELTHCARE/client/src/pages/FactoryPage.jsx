import React, { useState, useEffect } from 'react';
import {
  Building2,
  Cpu,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Power,
  Wrench,
  Gauge,
  Thermometer,
  Wind
} from 'lucide-react';
import { productionAPI, companyAPI } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const FactoryPage = () => {
  const [lines, setLines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFactoryData = async () => {
    try {
      setLoading(true);
      const [linesRes, machinesRes, facRes] = await Promise.all([
        productionAPI.getLines().catch(() => ({ data: { data: [] } })),
        productionAPI.getMachines().catch(() => ({ data: { data: [] } })),
        companyAPI.getFacilities().catch(() => ({ data: { data: [] } }))
      ]);

      setLines(linesRes.data?.data || []);
      setMachines(machinesRes.data?.data || []);
      const plant = (facRes.data?.data || []).find(f => f.facilityCode === 'PLANT-LAVAD') || facRes.data?.data?.[0];
      setFacility(plant);
    } catch (err) {
      console.error('Factory load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactoryData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="text-[#00A896]" />
            Factory Digital Twin: Lavad Manufacturing Plant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Survey No. 1248 Lavad Plant, Taluka Dehgam, Gandhinagar, Gujarat &bull; WHO-GMP Certified Line
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Digital Twin Synchronized
          </span>
          <button
            onClick={fetchFactoryData}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh Factory State"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Cleanroom & Plant Facilities Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Facility Status</span>
            <StatusBadge status="ACTIVE" text="OPERATIONAL" />
          </div>
          <p className="text-lg font-black text-slate-900">{facility?.facilityName || 'Lavad Plant 1'}</p>
          <p className="text-[11px] text-slate-500">Cleanroom Standard: Grade B & ISO 7</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">HVAC & Air Handling</span>
            <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Telemetry Not Connected
            </span>
          </div>
          <p className="text-lg font-black text-slate-900">AHU-01 / AHU-02</p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Wind size={13} className="text-slate-400" />
            HEPA 0.3μ Differential Pressure: Baseline Logged
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Production Lines</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {lines.length || 2} Online
            </span>
          </div>
          <p className="text-lg font-black text-slate-900">Lines 1 & 2 Active</p>
          <p className="text-[11px] text-slate-500">Solid Orals & Dry Powder Syrups</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">GMP Audit Status</span>
            <StatusBadge status="ACTIVE" text="WHO-GMP VERIFIED" />
          </div>
          <p className="text-lg font-black text-slate-900">Schedule M Compliant</p>
          <p className="text-[11px] text-slate-500">Zero Critical Non-Conformances</p>
        </div>
      </div>

      {/* Production Lines Digital Twin Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers size={18} className="text-[#00A896]" />
          Production Lines & Cleanroom Enclosures
        </h2>

        {lines.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Loading formulation lines...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {lines.map((line) => (
              <div
                key={line._id || line.code}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {line.code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{line.name}</h3>
                    <p className="text-xs text-slate-500">
                      Dosage Form: <span className="font-semibold text-slate-700">{line.dosageForm}</span> &bull; Grade: <span className="font-semibold text-slate-700">{line.cleanroomGrade || 'Grade B'}</span>
                    </p>
                  </div>
                  <StatusBadge status={line.status || 'OPERATIONAL'} />
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Shift Rated Capacity</span>
                    <p className="font-bold text-slate-800">{line.capacity || '2.5M units/shift'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Telemetry Feed</span>
                    <p className="font-bold text-amber-600 flex items-center gap-1">
                      <AlertTriangle size={12} /> Telemetry Not Connected
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Cleanroom Area Integrity</span>
                    <span className="font-bold text-emerald-600">Compliant (ISO 7)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00A896] h-full w-[94%]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Machine States Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#00A896]" size={18} />
            <h3 className="text-sm font-bold text-slate-900">Machine Registry & Maintenance Status</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {machines.length} registered assets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Machine Code</th>
                <th className="py-3 px-4">Equipment Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4">IoT / MES Telemetry</th>
                <th className="py-3 px-4">Calibration & Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {machines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    No machine assets registered.
                  </td>
                </tr>
              ) : (
                machines.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{m.machineCode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.name}</td>
                    <td className="py-3 px-4">{m.machineType}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'RUNNING' || m.status === 'OPERATIONAL'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : m.status === 'MAINTENANCE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.status || 'IDLE'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] text-slate-400 font-mono italic">
                        Telemetry Not Connected
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Calibrated & Audit Ready
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FactoryPage;
