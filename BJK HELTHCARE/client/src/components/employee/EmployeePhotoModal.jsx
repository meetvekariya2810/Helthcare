import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { STANDARD_CORPORATE_AVATARS } from '../../utils/standardAvatars';
import { employeeProfileAPI } from '../../services/employeeApi';

export const EmployeePhotoModal = ({ isOpen, onClose, currentPhoto, onPhotoUpdated }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'avatars'
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarCategoryFilter, setAvatarCategoryFilter] = useState('ALL');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Process and optimize image file to high-quality base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas normalization for standard passport aspect ratio (1:1 / 400x400)
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Center crop
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        ctx.drawImage(img, startX, startY, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewImage(dataUrl);
        setSelectedAvatarUrl(null);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setErrorMessage('Failed to load image. Please try a different photo.');
        setIsProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectAvatar = (url) => {
    setSelectedAvatarUrl(url);
    setPreviewImage(url);
    setErrorMessage('');
  };

  const handleSavePhoto = async () => {
    const photoToSave = previewImage || selectedAvatarUrl;
    if (!photoToSave) {
      setErrorMessage('Please upload a passport photo or select a standard avatar.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      const res = await employeeProfileAPI.updatePhoto({
        photo: photoToSave,
        profilePhoto: photoToSave,
        profilePhotoUrl: photoToSave,
        avatar: photoToSave
      });

      if (res.data?.success) {
        if (onPhotoUpdated) {
          onPhotoUpdated(photoToSave);
        }
        onClose();
      } else {
        setErrorMessage(res.data?.message || 'Failed to update profile photo.');
      }
    } catch (err) {
      console.error('[Update Photo Error]:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = ['ALL', 'Executive', 'Clinical', 'Pharmacy & Lab', 'Operations', 'Technical', 'Corporate'];

  const filteredAvatars = avatarCategoryFilter === 'ALL'
    ? STANDARD_CORPORATE_AVATARS
    : STANDARD_CORPORATE_AVATARS.filter(a => a.category === avatarCategoryFilter);

  const activeDisplayPhoto = previewImage || selectedAvatarUrl || currentPhoto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Employee Profile Photo
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Mandatory
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Upload your official passport photo or pick a standard corporate avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switching */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-slate-50/70 shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud size={16} />
            <span>Upload Passport Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatars')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'avatars'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={16} />
            <span>Standard Corporate Avatars</span>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded-full font-bold">
              {STANDARD_CORPORATE_AVATARS.length}
            </span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-center gap-2 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD PASSPORT PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Upload Drop Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/30 hover:bg-teal-50/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3 shadow-xs">
                    <UploadCloud size={26} />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse or drag & drop photo
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    PNG, JPG, or WEBP (Max 5MB)
                  </p>
                  <div className="mt-3 px-3 py-1 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-teal-700 shadow-2xs">
                    Browse File
                  </div>
                </div>

                {/* Live Passport Frame Preview */}
                <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 border border-slate-200 min-h-[220px]">
                  <p className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
                    Passport Size Preview
                  </p>
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-2 ring-teal-500/50 bg-slate-200 flex items-center justify-center">
                    {activeDisplayPhoto ? (
                      <img
                        src={activeDisplayPhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <ImageIcon size={32} />
                        <span className="text-[10px] mt-1 font-semibold">No photo</span>
                      </div>
                    )}
                  </div>
                  {activeDisplayPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedAvatarUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      <span>Clear selection</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Passport Photo Rules & Compliance Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Standard Passport Photo Guidelines (Mandatory Rules)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Plain white or light off-white background</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Direct front-facing camera with neutral expression</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Professional / formal corporate or healthcare attire</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>No sunglasses, head coverings (unless religious), or filters</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDARD CORPORATE AVATARS */}
          {activeTab === 'avatars' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAvatarCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      avatarCategoryFilter === cat
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto p-1">
                {filteredAvatars.map((avatar) => {
                  const isSelected = selectedAvatarUrl === avatar.url || previewImage === avatar.url;
                  return (
                    <div
                      key={avatar.id}
                      onClick={() => handleSelectAvatar(avatar.url)}
                      className={`relative p-2.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 shadow-md ring-2 ring-teal-400/40 scale-102'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Check size={12} />
                        </div>
                      )}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xs border border-white/50 mb-1.5">
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {avatar.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {avatar.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info size={14} className="text-teal-600 shrink-0" />
            <span>Syncs automatically with ID Card & HRMS records</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={isSaving || isProcessing || (!previewImage && !selectedAvatarUrl)}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              {isSaving ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save & Apply Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
