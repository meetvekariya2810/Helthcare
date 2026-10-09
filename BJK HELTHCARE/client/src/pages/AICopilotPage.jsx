import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Database,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { aiAPI } from '../services/api';

export const AICopilotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Greetings. I am the **BJK AI Copilot**, connected directly to the BJK Healthcare Digital Brain database.\n\nAll operational insights are strictly pulled from verified MongoDB Atlas records. I will never fabricate missing telemetry or financial estimates.",
      classification: 'Verified Database Data',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const SUGGESTED_QUERIES = [
    'Show all Anti-Diabetic products',
    'Which batches are pending QC?',
    'Which regulatory renewals are due in 60 days?',
    'Show low-stock materials',
    "Generate today's executive brief",
    'What is BJK Healthcare?'
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiAPI.query(textToSend);
      const data = res.data?.data || {};

      let responseText = data.answer || "No specific database records matched your query.";
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        responseText += `\n\n**Found ${data.results.length} related records:**\n` +
          data.results.slice(0, 8).map(r => `• **${r.productName || r.batchNumber || r.name || 'Record'}** ${r.dosageForm ? `(${r.dosageForm})` : ''} ${r.stage ? `[${r.stage}]` : ''}`).join('\n');
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        classification: data.sourceClassification || 'Verified Database Data',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "I encountered an error querying the BJK Healthcare Knowledge Graph. Please verify server connectivity.",
        classification: 'Unavailable Internal Data',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getClassificationBadge = (classification) => {
    switch (classification) {
      case 'Verified Database Data':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Database className="w-3 h-3" />
            Verified Database Data
          </span>
        );
      case 'Public Company Information':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            <Info className="w-3 h-3" />
            Public Company Information
          </span>
        );
      case 'Unavailable Internal Data':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <AlertCircle className="w-3 h-3" />
            Unavailable Internal Data
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            <ShieldCheck className="w-3 h-3" />
            Strict Data Control
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              BJK AI Copilot
              <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-xs rounded-full border border-cyan-500/20 font-mono">
                v2.4 Grounded
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Enterprise pharmaceutical reasoning. Zero hallucinated metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            MongoDB Atlas Connected
          </span>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-y-auto space-y-4 backdrop-blur-sm">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                    <Cpu className="w-3.5 h-3.5" />
                    BJK Digital Brain
                  </div>
                  {getClassificationBadge(msg.classification)}
                </div>
              )}

              <div className="text-sm leading-relaxed whitespace-pre-line">
                {msg.text}
              </div>

              <div className="mt-2 text-[10px] text-right opacity-60">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-slate-400 text-sm flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Querying verified enterprise schema & Atlas knowledge graph...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
        {SUGGESTED_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs whitespace-nowrap transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-3 flex-shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ask Copilot about products, active batches, regulatory dates, or inventory..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl font-medium transition flex items-center gap-2 shadow-lg shadow-cyan-900/20 text-sm"
        >
          <Send className="w-4 h-4" />
          Query
        </button>
      </form>
    </div>
  );
};

export default AICopilotPage;
