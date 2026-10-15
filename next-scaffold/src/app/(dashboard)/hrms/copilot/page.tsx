"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  ArrowLeft,
  Sparkles,
  Send,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileText,
  ShieldCheck,
  Building,
  User
} from "lucide-react";

interface CopilotMessage {
  id: string;
  sender: "USER" | "AI";
  text: string;
  timestamp: string;
  citation?: {
    policyNumber: string;
    policyTitle: string;
    section: string;
  };
}

const initialConversation: CopilotMessage[] = [
  {
    id: "MSG-1",
    sender: "AI",
    text: "Hello! I am the BJK Healthcare Digital Brain Copilot, trained on all 13 official plant policy handbooks and SOPs. How may I assist you with cleanroom protocols, leave rules, or statutory compliance today?",
    timestamp: "17:00",
  },
  {
    id: "MSG-2",
    sender: "USER",
    text: "What is the maximum permissible continuous duration inside the Grade A/B cleanroom formulation area?",
    timestamp: "17:01",
  },
  {
    id: "MSG-3",
    sender: "AI",
    text: "Under Policy POL-02 (Cleanroom Hygiene & Gowning) Section 4.3, personnel in Grade A/B aseptic areas are permitted a maximum continuous stay of 3 hours and 30 minutes. Following this, a mandatory 30-minute airlock egress and hydration rest interval is required before re-gowning.",
    timestamp: "17:01",
    citation: {
      policyNumber: "POL-02",
      policyTitle: "Cleanroom Hygiene & Sterile Gowning Handbook",
      section: "Section 4.3 (Continuous Ingress Limits)"
    }
  }
];

export default function PolicyCopilotPage() {
  const [messages, setMessages] = useState<CopilotMessage[]>(initialConversation);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "What are the casual leave encashment terms?",
    "What is the SOP for 21 CFR Part 11 password resets?",
    "What are the Gujarat Factories Act overtime rules?",
    "Can emergency utility expenses be claimed without prior PO?",
  ];

  const handleSend = (queryToSend?: string) => {
    const text = queryToSend || inputText;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `MSG-${Date.now()}`,
      sender: "USER",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let aiReply = "Under BJK Healthcare plant policies, all operations must strictly adhere to WHO-GMP Schedule M standards and electronic audit trails under 21 CFR Part 11.";
      let citation = {
        policyNumber: "POL-01",
        policyTitle: "Master Code of Conduct & Operational Manual",
        section: "Section 2.1 (Statutory Compliance)"
      };

      if (text.toLowerCase().includes("leave") || text.toLowerCase().includes("encashment")) {
        aiReply = "Under Policy POL-04 (Leave & Attendance Rules) Section 6.2, Casual Leave (CL) of 12 days lapses at the calendar year-end. However, Earned Leave (EL) can be accumulated up to 30 days and encashed upon retirement or annual appraisal cycle.";
        citation = {
          policyNumber: "POL-04",
          policyTitle: "Leave & Attendance Regulations Handbook",
          section: "Section 6.2 (EL Accumulation & Encashment)"
        };
      } else if (text.toLowerCase().includes("password") || text.toLowerCase().includes("cfr")) {
        aiReply = "Under Policy POL-07 Section 3.1 & 21 CFR Part 11 rules, user passwords expire every 90 days. Failed login lockouts occur after 3 attempts. Resetting requires HR/IT admin authorization with documented reason.";
        citation = {
          policyNumber: "POL-07",
          policyTitle: "IT Security & 21 CFR Part 11 Electronic Records",
          section: "Section 3.1 (Credential Lifecycles)"
        };
      } else if (text.toLowerCase().includes("overtime")) {
        aiReply = "Under the Factories Act 1948 Section 59 and Policy POL-04, any work beyond 9 hours in a day or 48 hours in a week is compensated at double the normal wage rate.";
        citation = {
          policyNumber: "POL-04",
          policyTitle: "Leave & Attendance Regulations Handbook",
          section: "Section 5.4 (Factories Act Section 59 Double Wages)"
        };
      }

      const aiMsg: CopilotMessage = {
        id: `MSG-${Date.now() + 1}`,
        sender: "AI",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citation
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Link
            href="/hrms"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                13-Policy AI Copilot
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center space-x-1">
                <Sparkles size={12} />
                <span>Internal RAG Intelligence</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Instant conversational guidance referencing official BJK Healthcare handbooks, SOPs, and labor laws
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/hrms/policies"
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
          >
            <BookOpen size={14} />
            <span>Browse 13 Policy Handbooks</span>
          </Link>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Quick Inquiries:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 text-slate-700 font-medium shrink-0 transition-all text-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Conversation Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === "USER";
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-slate-900 text-white"
                      : "bg-teal-50 text-[#00A896] border border-teal-200"
                  }`}
                >
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`max-w-[80%] space-y-1.5 ${isUser ? "items-end text-right" : ""}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-2xs"
                    }`}
                  >
                    {m.text}

                    {m.citation && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-teal-800 bg-teal-50/80 p-2 rounded-xl flex items-start space-x-2">
                        <BookOpen size={14} className="text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Citation: {m.citation.policyNumber} — {m.citation.policyTitle}</strong>
                          <span className="text-slate-600 font-mono text-[10px]">{m.citation.section}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 px-1 font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
              <Bot size={16} className="text-teal-600 animate-spin" />
              <span>Searching official 13 BJK policy handbooks...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Ask anything about BJK leave policies, cleanroom SOPs, or 21 CFR Part 11..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
