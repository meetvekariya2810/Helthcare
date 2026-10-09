import React, { useState } from 'react';
import {
  Printer,
  Download,
  RotateCw,
  ShieldCheck,
  QrCode,
  FileText,
  Eye,
  CheckCircle2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { EmployeeIDCardFront } from './EmployeeIDCardFront';
import { EmployeeIDCardBack } from './EmployeeIDCardBack';
import {
  generateEmployeeIdCardPdf,
  downloadSingleCardImage,
  printEmployeeIdCard,
  getEmployeeCardFields
} from './idCardUtils';

export const EmployeeIDCardPreview = ({
  employee,
  scale = 1,
  showControls = true,
  onRegenerate = null,
  isRegenerating = false
}) => {
  const [activeView, setActiveView] = useState('both'); // 'front' | 'back' | 'both' | 'flip'
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  if (!employee) return null;

  const fields = getEmployeeCardFields(employee);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await generateEmployeeIdCardPdf(employee);
    } catch (e) {
      console.error('Download error:', e);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadFrontPng = async () => {
    try {
      await downloadSingleCardImage('front', employee);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadBackPng = async () => {
    try {
      await downloadSingleCardImage('back', employee);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    printEmployeeIdCard(employee);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Top Controls Toolbar */}
      {showControls && (
        <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 mb-6 shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveView('both')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeView === 'both' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers size={14} />
              <span>Side-by-Side</span>
            </button>

            <button
              onClick={() => setActiveView('front')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeView === 'front' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Front</span>
            </button>

            <button
              onClick={() => setActiveView('back')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeView === 'back' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Back</span>
            </button>

            <button
              onClick={() => setActiveView('flip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeView === 'flip' ? 'bg-teal-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <RotateCw size={14} />
              <span>Interactive Flip</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50"
                title="Regenerate Card with Latest Profile Data"
              >
                <RotateCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
                <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Printer size={14} />
              <span>Print Card</span>
            </button>

            <div className="relative group">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-md disabled:opacity-50"
              >
                <Download size={14} />
                <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>

            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
              title="Test QR Verification Link"
            >
              <QrCode size={14} />
              <span>Verify Link</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Rendering Area */}
      <div className="w-full flex items-center justify-center py-4 overflow-x-auto">
        {/* VIEW 1: SIDE BY SIDE */}
        {activeView === 'both' && (
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-fadeIn">
            {/* Front Container */}
            <div className="flex flex-col items-center">
              <div className="mb-2 text-xs font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Official Front Design
              </div>
              <EmployeeIDCardFront employee={employee} scale={scale} />
              <button
                onClick={handleDownloadFrontPng}
                className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
              >
                <Download size={12} /> Download Front PNG
              </button>
            </div>

            {/* Back Container */}
            <div className="flex flex-col items-center">
              <div className="mb-2 text-xs font-extrabold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Official Back Design
              </div>
              <EmployeeIDCardBack employee={employee} scale={scale} />
              <button
                onClick={handleDownloadBackPng}
                className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition-colors"
              >
                <Download size={12} /> Download Back PNG
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: FRONT ONLY */}
        {activeView === 'front' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="mb-2 text-xs font-extrabold tracking-wider text-slate-500 uppercase">
              Official Front Design
            </div>
            <EmployeeIDCardFront employee={employee} scale={scale * 1.1} />
            <button
              onClick={handleDownloadFrontPng}
              className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <Download size={12} /> Download Front PNG
            </button>
          </div>
        )}

        {/* VIEW 3: BACK ONLY */}
        {activeView === 'back' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="mb-2 text-xs font-extrabold tracking-wider text-slate-500 uppercase">
              Official Back Design
            </div>
            <EmployeeIDCardBack employee={employee} scale={scale * 1.1} />
            <button
              onClick={handleDownloadBackPng}
              className="mt-3 text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <Download size={12} /> Download Back PNG
            </button>
          </div>
        )}

        {/* VIEW 4: 3D INTERACTIVE FLIP */}
        {activeView === 'flip' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <p className="text-xs text-slate-500 mb-3 font-medium">
              Click the card or the button below to flip between front and back
            </p>
            <div
              className="cursor-pointer transition-transform duration-500"
              style={{
                perspective: '1200px'
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className="relative transition-all duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  width: `${340 * scale}px`,
                  height: `${540 * scale}px`
                }}
              >
                {/* Front Side */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <EmployeeIDCardFront employee={employee} scale={scale} />
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <EmployeeIDCardBack employee={employee} scale={scale} />
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow hover:bg-slate-800 transition-all"
            >
              <RotateCw size={14} />
              <span>Flip Card to {isFlipped ? 'Front' : 'Back'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Security & Specification Badge */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <ShieldCheck size={14} className="text-teal-600" />
          <span>Official Master Template: <strong>BJK-ID-2026-V1</strong></span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <CheckCircle2 size={14} className="text-teal-600" />
          <span>Status: <strong>Active & Authorized</strong></span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <FileText size={14} className="text-slate-600" />
          <span>Format: <strong>CR-80 High Precision Dual-Sided</strong></span>
        </div>
      </div>

      {/* Quick Verification URL Modal / Popup */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-teal-800 font-extrabold text-sm">
                <QrCode size={18} />
                <span>QR Verification Endpoint</span>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              This card is encoded with a unique QR code. When scanned by any smartphone camera or QR reader, it opens this safe verification page:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-teal-900 break-all mb-4 select-all">
              {fields.qrVerificationUrl}
            </div>
            <div className="flex items-center justify-end space-x-2">
              <a
                href={`/verify/employee/${fields.code}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5"
              >
                <span>Open Verification Page</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
