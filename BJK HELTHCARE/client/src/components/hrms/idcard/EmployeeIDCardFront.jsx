import React from 'react';
import { getEmployeeCardFields } from './idCardUtils';

/**
 * Reusable Master Employee ID Card Front Component
 * Reproduces "Krutika Parmar 1.pdf" master design faithfully.
 */
export const EmployeeIDCardFront = ({ employee, scale = 1, className = '', style = {} }) => {
  const fields = getEmployeeCardFields(employee);

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
      {/* 1. Master Background Graphic (Direct from Master PDF) */}
      <img
        src="/idcard-assets/card_front_master_blank_web.png"
        alt="BJK ID Card Front Template"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none"
      />

      {/* 2. Circular Employee Photo */}
      <div
        className="absolute overflow-hidden rounded-full flex items-center justify-center"
        style={{
          top: '22.70%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '44.20%',
          aspectRatio: '1 / 1',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
        }}
      >
        {fields.photo ? (
          <img
            src={fields.photo}
            alt={fields.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
            }}
          />
        ) : null}

        {/* Fallback when no photo is available */}
        <div
          className={`w-full h-full bg-[#003840] flex flex-col items-center justify-center p-2 text-center text-white ${fields.photo ? 'hidden' : 'flex'}`}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1">
            <svg
              className="w-5 h-5 text-teal-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <span
            style={{ fontSize: `${8 * scale}px`, fontWeight: 700, letterSpacing: '0.04em' }}
            className="text-white/90 leading-tight"
          >
            PHOTO NOT AVAILABLE
          </span>
        </div>
      </div>

      {/* 3. Employee Name (Upper Case, Bold White) */}
      <div
        className="absolute left-0 right-0 text-center px-4"
        style={{
          top: '53.6%',
          color: '#ffffff'
        }}
      >
        <h2
          className="tracking-tight uppercase leading-tight font-extrabold"
          style={{
            fontSize: fields.name.length > 20 ? `${15 * scale}px` : `${18.5 * scale}px`,
            fontWeight: 800,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
          }}
        >
          {fields.name}
        </h2>
      </div>

      {/* 4. Employee Designation (Upper Case, Medium White) */}
      <div
        className="absolute left-0 right-0 text-center px-4"
        style={{
          top: '59.6%',
          color: '#ffffff'
        }}
      >
        <p
          className="tracking-widest uppercase font-bold"
          style={{
            fontSize: `${12.5 * scale}px`,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
          }}
        >
          {fields.designation}
        </p>
      </div>

      {/* 5. Key-Value Data Rows on Textured Paper Wave */}
      <div
        className="absolute w-full"
        style={{
          top: '74.4%',
          left: '0%',
          paddingLeft: '12.85%',
          paddingRight: '6%'
        }}
      >
        <div
          className="flex flex-col"
          style={{
            gap: `${4.5 * scale}px`
          }}
        >
          {/* Row 1: IN NO */}
          <div className="flex items-baseline" style={{ height: `${22 * scale}px` }}>
            <span
              className="font-extrabold uppercase text-[#004851]"
              style={{ width: '23.8%', fontSize: `${12 * scale}px` }}
            >
              IN NO
            </span>
            <span
              className="font-extrabold text-[#004851]"
              style={{ width: '5%', fontSize: `${12 * scale}px` }}
            >
              :
            </span>
            <span
              className="font-bold text-[#004851] tracking-wide"
              style={{ fontSize: `${11.5 * scale}px` }}
            >
              {fields.code}
            </span>
          </div>

          {/* Row 2: BLOOD */}
          <div className="flex items-baseline" style={{ height: `${22 * scale}px` }}>
            <span
              className="font-extrabold uppercase text-[#004851]"
              style={{ width: '23.8%', fontSize: `${12 * scale}px` }}
            >
              BLOOD
            </span>
            <span
              className="font-extrabold text-[#004851]"
              style={{ width: '5%', fontSize: `${12 * scale}px` }}
            >
              :
            </span>
            <span
              className="font-bold text-[#004851]"
              style={{ fontSize: `${11.5 * scale}px` }}
            >
              {fields.blood}
            </span>
          </div>

          {/* Row 3: PHONE */}
          <div className="flex items-baseline" style={{ height: `${22 * scale}px` }}>
            <span
              className="font-extrabold uppercase text-[#004851]"
              style={{ width: '23.8%', fontSize: `${12 * scale}px` }}
            >
              PHONE
            </span>
            <span
              className="font-extrabold text-[#004851]"
              style={{ width: '5%', fontSize: `${12 * scale}px` }}
            >
              :
            </span>
            <span
              className="font-bold text-[#004851]"
              style={{ fontSize: `${11.5 * scale}px` }}
            >
              {fields.phone}
            </span>
          </div>

          {/* Row 4: E-MAIL */}
          <div className="flex items-baseline" style={{ height: `${22 * scale}px` }}>
            <span
              className="font-extrabold uppercase text-[#004851]"
              style={{ width: '23.8%', fontSize: `${12 * scale}px` }}
            >
              E-MAIL
            </span>
            <span
              className="font-extrabold text-[#004851]"
              style={{ width: '5%', fontSize: `${12 * scale}px` }}
            >
              :
            </span>
            <span
              className="font-bold text-[#004851] truncate"
              style={{
                fontSize: fields.email.length > 25 ? `${9.5 * scale}px` : `${11 * scale}px`
              }}
              title={fields.email}
            >
              {fields.email}
            </span>
          </div>

          {/* Row 5: DOB */}
          <div className="flex items-baseline" style={{ height: `${22 * scale}px` }}>
            <span
              className="font-extrabold uppercase text-[#004851]"
              style={{ width: '23.8%', fontSize: `${12 * scale}px` }}
            >
              DOB
            </span>
            <span
              className="font-extrabold text-[#004851]"
              style={{ width: '5%', fontSize: `${12 * scale}px` }}
            >
              :
            </span>
            <span
              className="font-bold text-[#004851]"
              style={{ fontSize: `${11.5 * scale}px` }}
            >
              {fields.dob}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
