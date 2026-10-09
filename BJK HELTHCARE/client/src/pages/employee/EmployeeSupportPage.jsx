import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LifeBuoy,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  FileQuestion
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeSupportAPI } from '../../services/employeeApi';

export const EmployeeSupportPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(searchParams.get('action') === 'create');
  const [createForm, setCreateForm] = useState({
    category: 'HR Request',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const res = await employeeSupportAPI.getRequests();
      if (res.data?.success) {
        setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error('[Load Requests Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');
    try {
      const res = await employeeSupportAPI.create(createForm);
      if (res.data?.success) {
        setMessage(res.data.message);
        setShowCreateModal(false);
        setCreateForm({
          category: 'HR Request',
          subject: '',
          description: '',
          priority: 'MEDIUM'
        });
        loadRequests();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create ticket.');
    }
  };

  const handleCloseTicket = async (id) => {
    try {
      const res = await employeeSupportAPI.close(id);
      if (res.data?.success) {
        setMessage('Ticket marked as closed.');
        loadRequests();
        if (selectedTicket && selectedTicket._id === id) {
          setSelectedTicket(prev => ({ ...prev, status: 'CLOSED' }));
        }
      }
    } catch (err) {
      setErrorMessage('Failed to close ticket.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;
    try {
      const res = await employeeSupportAPI.addComment(selectedTicket.ticketId || selectedTicket._id, commentText);
      if (res.data?.success) {
        setCommentText('');
        loadRequests();
        setSelectedTicket(prev => ({
          ...prev,
          comments: res.data.comments
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">HR & IT Support Desk</h1>
          <p className="text-xs text-slate-500">Raise confidential inquiries regarding payroll, biometric attendance, or technical IT needs</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>RAISE SUPPORT TICKET</span>
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.length > 0 ? (
          requests.map((t) => (
            <div
              key={t.ticketId || t._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-teal-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{t.ticketId}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      {t.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'RESOLVED' || t.status === 'CLOSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{t.subject}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{t.description}</p>

                {t.resolutionNotes && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900">
                    <span className="font-bold block">Resolution:</span>
                    <span>{t.resolutionNotes}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(t)}
                  className="flex items-center gap-1 text-teal-600 hover:underline font-bold text-[11px]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion ({t.comments?.length || 0})</span>
                </button>

                {t.status !== 'CLOSED' && (
                  <button
                    type="button"
                    onClick={() => handleCloseTicket(t.ticketId || t._id)}
                    className="text-slate-500 hover:text-slate-800 font-semibold text-[11px]"
                  >
                    Close Ticket
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            You have not submitted any support tickets.
          </div>
        )}
      </div>

      {/* Ticket Details & Discussion Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{selectedTicket.ticketId} • {selectedTicket.category}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-slate-700">
                <span className="font-bold block text-teal-900 mb-1">Original Description:</span>
                <p>{selectedTicket.description}</p>
              </div>

              {selectedTicket.comments?.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">{c.author}</span>
                    <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-600">{c.message}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'CLOSED' && (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type reply or follow-up note..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create Support Request</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="HR Request">HR Request</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Payroll Issue">Payroll Issue</option>
                  <option value="Attendance Correction">Attendance Correction</option>
                  <option value="Leave Issue">Leave Issue</option>
                  <option value="Document Request">Document Request</option>
                  <option value="Access Request">Access Request</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Summary of request"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={createForm.priority}
                  onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (Plant Critical)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your request in detail"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
