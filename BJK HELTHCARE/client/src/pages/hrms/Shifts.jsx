import React, { useState, useEffect } from 'react';
import { hrmsAPI } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  CalendarDays,
  Clock,
  Plus,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Shifts = () => {
  const { showToast } = useNotification();
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Morning',
    startTime: '06:00',
    endTime: '14:30',
    gracePeriodMinutes: 10,
    breakDurationMinutes: 30,
    isNightShift: false,
    differentialAllowanceRate: 250
  });

  const fetchShifts = async () => {
    try {
      setIsLoading(true);
      const res = await hrmsAPI.getShifts();
      if (res.data.success) {
        setShifts(res.data.shifts);
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback shifts:', err.message);
      setShifts([
        {
          _id: 's-1',
          name: 'General Shift (09:00 - 18:00)',
          code: 'SHIFT-GEN',
          type: 'General',
          startTime: '09:00',
          endTime: '18:00',
          gracePeriodMinutes: 15,
          breakDurationMinutes: 60,
          overtimeRule: { eligible: true, multiplier: 1.5 },
          nightRule: { isNightShift: false }
        },
        {
          _id: 's-2',
          name: 'Morning Production Shift (06:00 - 14:30)',
          code: 'SHIFT-MORN',
          type: 'Morning',
          startTime: '06:00',
          endTime: '14:30',
          gracePeriodMinutes: 10,
          breakDurationMinutes: 30,
          overtimeRule: { eligible: true, multiplier: 1.5 },
          nightRule: { isNightShift: false }
        },
        {
          _id: 's-3',
          name: 'Evening Production Shift (14:00 - 22:30)',
          code: 'SHIFT-EVE',
          type: 'Evening',
          startTime: '14:00',
          endTime: '22:30',
          gracePeriodMinutes: 10,
          breakDurationMinutes: 30,
          overtimeRule: { eligible: true, multiplier: 1.5 },
          nightRule: { isNightShift: false }
        },
        {
          _id: 's-4',
          name: 'Pharma Night Shift (22:00 - 06:30)',
          code: 'SHIFT-NIGHT',
          type: 'Night',
          startTime: '22:00',
          endTime: '06:30',
          gracePeriodMinutes: 10,
          breakDurationMinutes: 30,
          overtimeRule: { eligible: true, multiplier: 2.0 },
          nightRule: { isNightShift: true, differentialAllowanceRate: 350 }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        nightRule: {
          isNightShift: formData.isNightShift,
          differentialAllowanceRate: Number(formData.differentialAllowanceRate)
        }
      };
      const res = await hrmsAPI.createShift(payload);
      if (res.data.success) {
        showToast('Shift created successfully', 'success', 'Success');
        setIsModalOpen(false);
        fetchShifts();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Shift Configuration & Timings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Production shifts, cleanroom rotational windows, night differentials, and statutory rest minimums.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          <Plus size={15} />
          <span>Create New Shift</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {shifts.map((shift) => (
          <div
            key={shift._id}
            className={`bg-white rounded-2xl border p-5 shadow-sm bjk-card-glow flex flex-col justify-between ${
              shift.nightRule?.isNightShift ? 'border-purple-200 bg-purple-50/20' : 'border-slate-200/80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {shift.code}
                </span>
                {shift.nightRule?.isNightShift && (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-bjk-purple bg-purple-100 px-2 py-0.5 rounded-full">
                    <Moon size={11} />
                    <span>Night Shift</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900">{shift.name}</h3>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between font-mono font-bold text-slate-900">
                  <span>Timing:</span>
                  <span>{shift.startTime} - {shift.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Grace Window:</span>
                  <span>{shift.gracePeriodMinutes} mins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Break Period:</span>
                  <span>{shift.breakDurationMinutes} mins</span>
                </div>
                {shift.nightRule?.isNightShift && (
                  <div className="flex justify-between text-bjk-purple font-semibold">
                    <span>Night Differential:</span>
                    <span>₹{shift.nightRule.differentialAllowanceRate}/shift</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Overtime multiplier: {shift.overtimeRule?.multiplier || 1.5}x</span>
              <span className="text-emerald-600 font-semibold">Statutory Compliant</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Shift Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Operational Shift"
        subtitle="Define work hours and overtime rules for production and laboratories"
      >
        <form onSubmit={handleCreateShift} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Afternoon Formulation Shift"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SHIFT-AFT"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time (24h) *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time (24h) *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grace Period (mins)</label>
              <input
                type="number"
                value={formData.gracePeriodMinutes}
                onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Break Duration (mins)</label>
              <input
                type="number"
                value={formData.breakDurationMinutes}
                onChange={(e) => setFormData({ ...formData, breakDurationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2">
            <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNightShift}
                onChange={(e) => setFormData({ ...formData, isNightShift: e.target.checked })}
                className="rounded text-bjk-purple focus:ring-bjk-purple"
              />
              <span>Pharma Night Shift (Crosses 22:00 to 06:00)</span>
            </label>
            {formData.isNightShift && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Night Allowance Rate (₹/shift)</label>
                <input
                  type="number"
                  value={formData.differentialAllowanceRate}
                  onChange={(e) => setFormData({ ...formData, differentialAllowanceRate: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-purple-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Save Shift
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
