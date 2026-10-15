"use client";

import React, { useState } from "react";
import { FileText, Download, Upload, CheckCircle2, ShieldCheck } from "lucide-react";

interface DocItem {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  size: string;
  status: "VERIFIED" | "PENDING";
}

const mockDocs: DocItem[] = [
  { id: "D1", name: "Official BJK Appointment Letter.pdf", category: "HR Contract", uploadDate: "01 Mar 2024", size: "1.2 MB", status: "VERIFIED" },
  { id: "D2", name: "Master of Pharmacy Degree Certificate.pdf", category: "Education Qualification", uploadDate: "01 Mar 2024", size: "2.4 MB", status: "VERIFIED" },
  { id: "D3", name: "State Pharmacy Council Registration.pdf", category: "Regulatory License", uploadDate: "05 Mar 2024", size: "840 KB", status: "VERIFIED" },
  { id: "D4", name: "Annual Cleanroom Gowning Clearance (2026).pdf", category: "GMP Standard", uploadDate: "15 Jan 2026", size: "1.8 MB", status: "VERIFIED" },
];

export default function EmployeeDocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Compliance Dossier & Uploaded Documents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verified electronic records stored under 21 CFR Part 11 compliance standards
          </p>
        </div>

        <button
          onClick={() => alert("Upload dialog...")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00A896] hover:bg-[#009B8D] shadow-xs transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {mockDocs.map((doc) => (
          <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-[#00A896]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{doc.category}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>Uploaded {doc.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </span>
              <button
                onClick={() => alert(`Downloading ${doc.name}...`)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
