import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CalendarCheck,
  PlusCircle,
  Clock,
  Sparkles,
  Building,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2026-27');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    description: '',
    mandatoryForManufacturing: false
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
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/hr/policies/holidays', { headers }).catch(() => null);
      if (res?.data?.data && res.data.data.length > 0) {
        setHolidays(res.data.data);
      } else {
        // Fallback to official 10 public holidays from Slide 10 of handbook
        setHolidays([
          { srNo: 1, name: 'Independence Day', date: 'August 15, 2026', day: 'Saturday', type: 'NATIONAL' },
          { srNo: 2, name: 'Raksha Bandhan', date: 'August 28, 2026', day: 'Friday', type: 'GENERAL' },
          { srNo: 3, name: 'Janmashtami', date: 'September 4, 2026', day: 'Friday', type: 'GENERAL' },
          { srNo: 4, name: 'Dusshera', date: 'October 20, 2026', day: 'Tuesday', type: 'GENERAL' },
          { srNo: 5, name: 'Diwali', date: 'November 8, 2026', day: 'Sunday', type: 'NATIONAL' },
          { srNo: 6, name: 'Gujarati New Year', date: 'November 10, 2026', day: 'Tuesday', type: 'REGIONAL' },
          { srNo: 7, name: 'Bhai Bij', date: 'November 11, 2026', day: 'Wednesday', type: 'REGIONAL' },
          { srNo: 8, name: 'Makar Sankranti', date: 'January 15, 2027', day: 'Friday', type: 'REGIONAL' },
          { srNo: 9, name: 'Republic Day', date: 'January 26, 2027', day: 'Tuesday', type: 'NATIONAL' },
          { srNo: 10, name: 'Holi', date: 'March 22, 2027', day: 'Monday', type: 'GENERAL' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching holidays:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    const created = {
      srNo: holidays.length + 1,
      name: newHoliday.name,
      date: newHoliday.date,
      day: new Date(newHoliday.date).toLocaleDateString('en-US', { weekday: 'long' }),
      type: 'GENERAL'
    };
    setHolidays([...holidays, created]);
    setShowAddModal(false);
    setNewHoliday({ name: '', date: '', description: '', mandatoryForManufacturing: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                BJK-HR-POL-002
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                10 Public Holidays / Year
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Slide 10 Authoritative Source
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Public Holiday Calendar</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Configurable corporate and manufacturing holiday schedule. Manufacturing lines operating on holidays
              receive compensatory off (1:1 within 90 days) or pre-approved overtime.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              <option value="2026-27">Calendar Year 2026-27</option>
              <option value="2027-28">Calendar Year 2027-28 (Draft)</option>
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-bjk-teal hover:bg-bjk-teal/90 text-white px-3.5 py-2 rounded-xl font-medium text-xs shadow-lg shadow-teal-500/20 transition-all"
            >
              <PlusCircle size={15} />
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      {/* Operational Notice Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Manufacturing & Quality Operations During Holidays</h3>
            <p className="text-xs text-slate-400">
              Essential continuous manufacturing lines (sterile injectables, oral solid dosages) and QC stability testing may operate on general holidays. All staff working on declared holidays are entitled to 1:1 Compensatory Off within 90 days.
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono">
            Standard: 48h / 6-Day Week
          </span>
        </div>
      </div>

      {/* Holiday Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-bjk-teal" size={18} />
            <h2 className="text-sm font-bold text-white">Official 2026-27 Holiday Schedule</h2>
          </div>
          <span className="text-xs text-slate-400">Total: {holidays.length} Holidays</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-16">Sr No</th>
                <th className="py-3.5 px-4">Name of General Holiday</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Day of Week</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Manufacturing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {holidays.map((hol, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-bjk-teal">{hol.srNo || idx + 1}</td>
                  <td className="py-3.5 px-4 font-semibold text-white text-sm">{hol.name}</td>
                  <td className="py-3.5 px-4 font-mono text-cyan-300">{hol.date}</td>
                  <td className="py-3.5 px-4 text-slate-400">{hol.day || 'Scheduled'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        hol.type === 'NATIONAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : hol.type === 'REGIONAL'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {hol.type || 'GENERAL'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Comp-Off / OT Eligible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Holiday */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-base font-bold mb-1">Add Public Holiday</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new gazetted or plant-specific holiday to the corporate attendance engine.
            </p>
            <form onSubmit={handleAddHoliday} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Holiday Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahavir Jayanti"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bjk-teal hover:bg-bjk-teal/90 text-white text-xs font-medium shadow-md shadow-teal-500/30"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Holidays;
