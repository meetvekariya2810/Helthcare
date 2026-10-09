import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Megaphone,
  CheckCircle2,
  Calendar,
  Award,
  CheckCheck,
  Building,
  CalendarDays
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeNotificationAPI } from '../../services/employeeApi';

export const EmployeeCommunicationPage = () => {
  const { employeeUser } = useEmployeeAuth();
  const location = useLocation();
  const defaultTab = location.pathname.includes('announcements') ? 'announcements' : 'notifications';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [notifRes, annRes] = await Promise.all([
        employeeNotificationAPI.getNotifications(),
        employeeNotificationAPI.getAnnouncements()
      ]);

      if (notifRes.data?.success) {
        setNotifications(notifRes.data.notifications || []);
      }
      if (annRes.data?.success) {
        setAnnouncements(annRes.data.announcements || []);
        setHolidays(annRes.data.holidays || []);
      }
    } catch (err) {
      console.error('[Communication Load Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await employeeNotificationAPI.markAllRead();
      if (res.data?.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await employeeNotificationAPI.markAsRead(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Communication & Corporate Notices</h1>
          <p className="text-xs text-slate-500">Official company announcements, statutory holidays, and personalized notifications</p>
        </div>

        {activeTab === 'notifications' && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-teal-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>My Notifications ({notifications.filter(n => !n.isRead).length} unread)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Announcements & Holiday Calendar</span>
        </button>
      </div>

      {/* Tab 1: Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleMarkRead(notif._id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-teal-50/60 border-teal-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      {notif.category}
                    </span>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900">{notif.title}</h3>
                  <p className="text-xs text-slate-600">{notif.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(notif.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
              No notifications at this time.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Announcements & Holidays */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Company Notices */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Circulars & Broadcasts</h2>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann._id || ann.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                        {ann.category || 'HR Announcement'}
                      </span>
                      {ann.sendTo && ann.sendTo !== 'All' && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          Target: {ann.sendTo}
                        </span>
                      )}
                      {ann.importance === 'HIGH' && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          High Priority
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{ann.date}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{ann.content || ann.description}</p>

                  {/* Attached Announcement Photo */}
                  {ann.photo && (
                    <div className="pt-2">
                      <div className="max-w-md max-h-64 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
                        <img
                          src={ann.photo}
                          alt={ann.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(ann.photo, '_blank')}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap justify-between items-center text-[11px] text-slate-500 border-t border-slate-100 gap-2">
                    <span className="font-medium">
                      Issued By: <strong className="text-slate-700">{ann.author || 'Corporate HR Department'}</strong>
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged & Active
                    </span>
                  </div>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
                  No announcements at this time.
                </div>
              )}
            </div>
          </div>

          {/* Plant Holiday Calendar */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">2026 Plant Holiday Calendar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {holidays.map((h, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-1">
                  <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded block w-fit">
                    {h.type}
                  </span>
                  <h4 className="font-bold text-slate-900 mt-1">{h.name}</h4>
                  <p className="text-slate-500 font-semibold">{h.date} ({h.day})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
