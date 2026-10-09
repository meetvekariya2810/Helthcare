import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileText,
  ShieldCheck,
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';

export const PdfViewerModal = ({
  isOpen,
  onClose,
  fileUrl,
  docTitle = 'Document Preview',
  slotNo = null,
  isMandatory = false,
  verificationStatus = 'PENDING',
  employeeName = '',
  employeeId = '',
  remarks = ''
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 60));
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // Normalize file URL: prepend origin if relative
  const fullFileUrl = fileUrl?.startsWith('http')
    ? fileUrl
    : `${window.location.origin}${fileUrl?.startsWith('/') ? fileUrl : '/' + fileUrl}`;

  const statusBadge = () => {
    switch (verificationStatus) {
      case 'VERIFIED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED & APPROVED</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>REJECTED (NEEDS RE-UPLOAD)</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>PENDING HR VERIFICATION</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 text-white rounded-2xl shadow-2xl flex flex-col border border-slate-700/80 overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-screen h-screen rounded-none'
            : 'w-full max-w-5xl h-[90vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {slotNo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-500 text-slate-950 uppercase tracking-wide">
                    SLOT #{slotNo}
                  </span>
                )}
                {isMandatory && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white uppercase tracking-wide">
                    MANDATORY
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {docTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                {employeeName && (
                  <span>
                    {employeeName} {employeeId && `(${employeeId})`} &bull;{' '}
                  </span>
                )}
                <span className="text-teal-400 font-medium">Standard PDF Viewer</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {statusBadge()}

            {/* Viewer Controls */}
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60 text-slate-300">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 60}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-2 text-slate-300 font-bold select-none">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="p-1.5 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <a
              href={fullFileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-300 hover:text-teal-300 hover:bg-slate-800 rounded-xl transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={fullFileUrl}
              download={`${docTitle.replace(/\s+/g, '_')}.pdf`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition-colors"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Remarks Banner if rejected or has notes */}
        {remarks && (
          <div className="px-4 py-2 bg-slate-800/90 border-b border-slate-700/60 text-xs flex items-center gap-2 text-slate-300">
            <span className="font-bold text-teal-400 uppercase tracking-wide text-[10px]">
              Review Notes:
            </span>
            <span>{remarks}</span>
          </div>
        )}

        {/* PDF Rendering Container */}
        <div className="flex-1 bg-slate-950 relative overflow-auto flex items-center justify-center p-2 sm:p-4">
          {!iframeError ? (
            <div
              className="w-full h-full transition-transform duration-200 origin-top flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <iframe
                src={`${fullFileUrl}#toolbar=1&navpanes=0`}
                title={docTitle}
                className="w-full h-full bg-slate-800 rounded-xl border border-slate-700/60 shadow-2xl"
                onError={() => setIframeError(true)}
              />
            </div>
          ) : (
            <div className="text-center p-8 max-w-md bg-slate-900 border border-slate-800 rounded-2xl">
              <FileText className="w-12 h-12 text-teal-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">In-App Preview Notice</h4>
              <p className="text-xs text-slate-400 mb-4">
                Your browser plugin or security settings prefer opening this verified PDF in a dedicated view window.
              </p>
              <div className="flex justify-center gap-3">
                <a
                  href={fullFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Open PDF in New Window
                </a>
                <a
                  href={fullFileUrl}
                  download
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Download PDF File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Safety & Integrity Bar */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>256-Bit Encrypted BJK Healthcare Document Safe &bull; PDF Format Only</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">
            Press ESC to exit preview
          </span>
        </div>
      </div>
    </div>
  );
};
