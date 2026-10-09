import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeCopilotAPI } from '../../services/employeeApi';

export const EmployeeAssistantModal = ({ isOpen, onClose }) => {
  const { employeeUser } = useEmployeeAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${employeeUser?.name || 'Employee'}, I am your **BJK Employee AI Assistant**. I can help you with your leave balances, shifts, attendance punches, GMP compliance, latest payslips, and workplace policies.\n\nHow can I help you today?`
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'What is my leave balance?',
    'When is my next shift?',
    'Show my latest payslip.',
    'What training is pending?',
    'When does my GMP credential expire?',
    'How do I apply leave?',
    'Show my attendance.'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const q = (queryText || inputQuery).trim();
    if (!q || isSubmitting) return;

    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setInputQuery('');
    setIsSubmitting(true);

    try {
      const res = await employeeCopilotAPI.ask(q);
      if (res.data?.success && res.data.response) {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: res.data.response.answer || 'I could not find an answer to that request.',
            category: res.data.response.category
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: 'I am currently unable to process your request. Please try again shortly.'
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: err.response?.data?.message || 'Error communicating with BJK Employee AI Assistant.'
        }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full h-[600px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">BJK Employee AI Assistant</h3>
              <p className="text-[10px] text-teal-300 font-medium">
                Strict Employee Self-Service Scope • RBAC Enforced
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto scrollbar-none flex gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 text-slate-600 border border-slate-200 whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            const isRestricted = m.category === 'SECURITY_RESTRICTION';

            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-none shadow-sm'
                      : isRestricted
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-none font-medium'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  {m.text}
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isSubmitting && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs">
              <div className="h-7 w-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Searching your employee records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your leave, shift, payslip, attendance..."
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-teal-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Strictly bounded by Employee Role & Self-Service Data Protection
          </p>
        </div>
      </div>
    </div>
  );
};
