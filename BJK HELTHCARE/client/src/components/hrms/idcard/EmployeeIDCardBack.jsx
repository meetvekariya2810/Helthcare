import React, { useState, useEffect } from 'react';
import { getEmployeeCardFields, generateQRCodeDataUrl } from './idCardUtils';

/**
 * Reusable Master Employee ID Card Back Component
 * Reproduces "Krutika Parmar 2.pdf" master design faithfully.
 */
export const EmployeeIDCardBack = ({ employee, scale = 1, className = '', style = {} }) => {
  const fields = getEmployeeCardFields(employee);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    generateQRCodeDataUrl(fields.qrVerificationUrl).then((url) => {
      if (isMounted) setQrUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [fields.qrVerificationUrl]);

  return (
    <div
      className={`relative select-none overflow-hidden shadow-2xl transition-all ${className}`}
      style={{
        width: `${340 * scale}px`,
        height: `${540 * scale}px`,
        aspectRatio: '638 / 1013',
        borderRadius: `${16 * scale}px`,
        backgroundColor: '#ffffff',
        fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        ...style
      }}
    >
      {/* 1. Master Background Graphic (Direct from Master Back PDF) */}
      <img
        src="/idcard-assets/card_back_master_blank_web.png"
        alt="BJK ID Card Back Template"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
      />

      {/* 2. Dynamic QR Code inside the pre-rendered framed white square */}
      <div
        className="absolute flex items-center justify-center p-1 bg-white"
        style={{
          top: '67.2%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '29.8%',
          aspectRatio: '1 / 1',
          borderRadius: `${4 * scale}px`
        }}
      >
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="Employee Verification QR Code"
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
            Loading QR...
          </div>
        )}
      </div>
    </div>
  );
};
