import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  CheckSquare,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { hrmsAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const SendNotificationModal = ({ isOpen, onClose, onNotificationSent }) => {
  const { showToast } = useNotification();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photo: '',
    sendTo: 'All'
  });

  const [selectedFileName, setSelectedFileName] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo size exceeds 5MB limit.');
      return;
    }

    setSelectedFileName(file.name);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setPhotoPreview(base64);
      setFormData(prev => ({ ...prev, photo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setSelectedFileName('');
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Title is mandatory.');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMessage('Description is mandatory.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        message: formData.description.trim(),
        photo: formData.photo || '',
        sendTo: formData.sendTo || 'All',
        targetRole: formData.sendTo === 'All' ? 'ALL' : formData.sendTo,
        severity: 'INFO'
      };

      const res = await hrmsAPI.sendAnnouncement(payload);

      if (res.data?.success) {
        showToast(
          'Announcement broadcasted successfully to all employees!',
          'success',
          'Notification Sent'
        );
        if (onNotificationSent) {
          onNotificationSent(res.data.notification || res.data.announcement);
        }
        // Reset form
        setFormData({
          title: '',
          description: '',
          photo: '',
          sendTo: 'All'
        });
        setSelectedFileName('');
        setPhotoPreview(null);
        onClose();
      } else {
        setErrorMessage(res.data?.message || 'Failed to send notification.');
      }
    } catch (err) {
      console.error('[Send Notification Error]:', err);
      setErrorMessage(err.response?.data?.message || err.normalizedMessage || 'Error sending announcement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col my-auto transform transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching Screenshot 1 */}
        <div className="bg-[#249B95] px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-base font-bold tracking-wide">
            SEND Notifications
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-teal-100 hover:text-white transition-colors p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 flex items-center gap-2 text-xs text-rose-800 font-medium">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-xs font-semibold text-slate-700 sm:col-span-1">
              Title <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="sm:col-span-3">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Description * */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
            <label className="text-xs font-semibold text-slate-700 sm:col-span-1 pt-2">
              Description <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="sm:col-span-3">
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter detailed notification content..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-xs font-semibold text-slate-700 sm:col-span-1">
              Photo
            </label>
            <div className="sm:col-span-3 space-y-2">
              <div className="flex items-center border border-slate-300 rounded-md p-1 bg-white text-xs">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-slate-800 font-medium text-xs transition-colors shrink-0 shadow-2xs"
                >
                  Choose File
                </button>
                <span className="ml-3 text-slate-500 truncate text-xs">
                  {selectedFileName || 'No file chosen'}
                </span>
                {selectedFileName && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="ml-auto text-rose-500 hover:text-rose-700 p-1"
                    title="Remove photo"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {photoPreview && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* SEND To */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <label className="text-xs font-semibold text-slate-700 sm:col-span-1">
              SEND To
            </label>
            <div className="sm:col-span-3">
              <select
                value={formData.sendTo}
                onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white"
              >
                <option value="All">All</option>
                <option value="Technical Staff">Technical Staff (Formulations, QC, QA, R&D)</option>
                <option value="Non-Technical Staff">Non-Technical Staff (Admin, Housekeeping, Security)</option>
                <option value="Operations">Operations</option>
                <option value="Quality Control">Quality Control (QC)</option>
                <option value="Quality Assurance">Quality Assurance (QA)</option>
                <option value="Production">Production & Manufacturing</option>
                <option value="Warehouse & Inventory">Warehouse & Inventory</option>
                <option value="Corporate / HR">Corporate / HR</option>
                <option value="Ahmedabad Plant">Ahmedabad Plant (Unit 1)</option>
                <option value="Sanand Facility">Sanand Facility (Unit 2)</option>
              </select>
            </div>
          </div>

          {/* Horizontal Divider Line */}
          <div className="pt-2 border-t border-slate-200" />

          {/* Centered SEND Button matching Screenshot 1 */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-[#2E5E8A] hover:bg-[#234c70] disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center space-x-2 shadow-sm transition-all uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw size={14} className="animate-spin" />
                  <span>SENDING...</span>
                </>
              ) : (
                <>
                  <CheckSquare size={14} />
                  <span>SEND</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
