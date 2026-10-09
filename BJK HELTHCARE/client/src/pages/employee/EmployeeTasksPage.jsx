import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Play,
  Check,
  Send,
  UserCheck
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeTaskAPI } from '../../services/employeeApi';

export const EmployeeTasksPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await employeeTaskAPI.getTasks();
      if (res.data?.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      console.error('[Load Tasks Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await employeeTaskAPI.updateStatus(taskId, newStatus);
      if (res.data?.success) {
        setMessage(`Task updated to ${newStatus}`);
        loadTasks();
      }
    } catch (err) {
      console.error('[Update Task Status Error]:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTask) return;
    try {
      const res = await employeeTaskAPI.addComment(selectedTask.taskId || selectedTask._id, commentText);
      if (res.data?.success) {
        setCommentText('');
        loadTasks();
        setSelectedTask(prev => ({
          ...prev,
          comments: res.data.comments
        }));
      }
    } catch (err) {
      console.error('[Add Comment Error]:', err);
    }
  };

  const filteredTasks = statusFilter === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Tasks & Production Orders</h1>
          <p className="text-xs text-slate-500">Track and report completion of tasks allocated by supervisors</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                statusFilter === st ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Tasks' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((t) => (
            <div
              key={t.taskId || t._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{t.taskId}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.priority === 'HIGH' || t.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{t.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                  <p>Assigned By: <span className="font-semibold text-slate-700">{t.assignedByName || t.assignedBy}</span></p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Due Date: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Immediate'}</span>
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(t)}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-teal-600 font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments ({t.comments?.length || 0})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {t.status === 'TODO' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(t.taskId || t._id, 'IN_PROGRESS')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs border border-teal-200"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Start</span>
                    </button>
                  )}
                  {t.status === 'IN_PROGRESS' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(t.taskId || t._id, 'COMPLETED')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                  {t.status === 'COMPLETED' && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No tasks found in this status category.
          </div>
        )}
      </div>

      {/* Task Comments Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">{selectedTask.taskId}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
                ✕
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4 text-xs">
              {selectedTask.comments?.length > 0 ? (
                selectedTask.comments.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-600">{c.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-4">No comments on this task yet.</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                required
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a progress update or note..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
