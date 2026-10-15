"use client";

import React, { useState } from "react";
import { LifeBuoy, Send, CheckCircle2, MessageSquare, Loader2 } from "lucide-react";

export default function EmployeeSupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          HR Helpdesk & Grievance Redressal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Confidential support tickets for payroll inquiries, workplace facilities, and HR assistance
        </p>
      </div>

      <div className="max-w-2xl bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        {sent && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ticket logged successfully! An HR executive will reach out within 24 hours.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Subject / Category</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Discrepancy in overtime hours calculation for Sep 28..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Detailed Message</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide specifics to help HR resolve your query promptly..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A896]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-[#00A896] hover:bg-[#009B8D] flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Transmit Ticket to HR</span>
          </button>
        </form>
      </div>
    </div>
  );
}
