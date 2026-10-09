import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Filter,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';
import { hrmsAPI } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

export const HRNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterRead, setFilterRead] = useState('ALL'); // ALL, UNREAD, READ

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await hrmsAPI.getNotifications();
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Notifications fetch error, fallback to demo alerts:', err.message);
      const demoNotifs = [
        {
          _id: 'notif-1',
          title: 'BLOCKING: Expired GMP Certification in Sterile Formulation',
          message: 'Dr. Rajesh Mehta has an expired WHO-GMP certification. Intelligent Rostering has blocked shift assignment until renewed.',
          category: 'CREDENTIAL',
          severity: 'BLOCKING',
          linkUrl: '/hrms/credentials',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          isDemo: true
        },
        {
          _id: 'notif-2',
          title: 'Shift Swap Approval Requested',
          message: 'Amit Patel requested to swap Night Shift B with Priya Sharma for Sep 26. Pre-flight 11h rest validation passed.',
          category: 'SHIFT',
          severity: 'INFO',
          linkUrl: '/hrms/rostering',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          isDemo: true
        },
        {
          _id: 'notif-3',
          title: 'Mandatory Cleanroom Gowning Training Overdue',
          message: '2 production technicians have missed the annual cleanroom gowning refresher deadline.',
          category: 'TRAINING',
          severity: 'URGENT',
          linkUrl: '/hrms/training',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
          isDemo: true
        },
        {
          _id: 'notif-4',
          title: 'September 2026 Payroll Run Calculated',
          message: 'Payroll calculation completed for 120 active employees. Total company CTC ₹59,30,000. Ready for CFO approval.',
          category: 'PAYROLL',
          severity: 'INFO',
          linkUrl: '/hrms/payroll',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
          isDemo: true
        },
        {
          _id: 'notif-5',
          title: 'Weekly Overtime Threshold Warning',
          message: 'Vikram Joshi reached 46 hours this week, approaching the statutory 48-hour limit under the Factories Act.',
          category: 'ATTENDANCE',
          severity: 'WARNING',
          linkUrl: '/hrms/attendance',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
          isDemo: true
        }
      ];
      setNotifications(demoNotifs);
      setUnreadCount(demoNotifs.filter((n) => !n.isRead).length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await hrmsAPI.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await hrmsAPI.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesCategory = filterCategory === 'ALL' || n.category === filterCategory;
    const matchesSeverity = filterSeverity === 'ALL' || n.severity === filterSeverity;
    const matchesRead =
      filterRead === 'ALL' ||
      (filterRead === 'UNREAD' && !n.isRead) ||
      (filterRead === 'READ' && n.isRead);
    return matchesCategory && matchesSeverity && matchesRead;
  });

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'BLOCKING':
        return <ShieldAlert size={18} className="text-rose-600 flex-shrink-0" />;
      case 'URGENT':
        return <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />;
      case 'WARNING':
        return <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0" />;
      default:
        return <Info size={18} className="text-bjk-teal flex-shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="text-bjk-teal" />
              Notifications & Workforce Attention Inbox
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold font-mono">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            Real-time critical events, compliance alerts, shift swap requests, and payroll approvals
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <CheckCheck size={16} className="text-bjk-teal" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Inbox"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-700">Status:</span>
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            >
              <option value="ALL">All Items</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-700">Severity:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            >
              <option value="ALL">All Severities</option>
              <option value="BLOCKING">Blocking</option>
              <option value="URGENT">Urgent</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Informational</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-700">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-bjk-teal/20"
            >
              <option value="ALL">All Categories</option>
              <option value="CREDENTIAL">Credential</option>
              <option value="SHIFT">Shift & Roster</option>
              <option value="TRAINING">Training</option>
              <option value="PAYROLL">Payroll</option>
              <option value="ATTENDANCE">Attendance</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredNotifications.length}</span> alerts
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <CheckCheck size={36} className="mx-auto text-emerald-500 mb-2" />
            <div className="font-bold text-slate-800">Inbox is clean!</div>
            <div className="text-xs text-slate-400">No notifications match your current filter settings.</div>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                notif.isRead
                  ? 'bg-white border-slate-200/80'
                  : 'bg-slate-50/80 border-bjk-teal/30 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">{getSeverityIcon(notif.severity)}</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{notif.title}</span>
                    <StatusBadge
                      status={
                        notif.severity === 'BLOCKING'
                          ? 'DANGER'
                          : notif.severity === 'URGENT'
                          ? 'WARNING'
                          : 'INFO'
                      }
                      text={notif.severity}
                    />
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                      {notif.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl">{notif.message}</p>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                    <Clock size={12} />
                    <span>{new Date(notif.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {notif.linkUrl && (
                  <Link
                    to={notif.linkUrl}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink size={12} />
                  </Link>
                )}

                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-bjk-teal hover:bg-bjk-teal/10 transition-colors"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HRNotifications;
