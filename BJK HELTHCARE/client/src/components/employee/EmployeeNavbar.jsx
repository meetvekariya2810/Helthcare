import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  User,
  Shield,
  Key,
  HelpCircle,
  LogOut,
  ChevronDown,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  Users,
  Settings,
  X
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeNotificationAPI } from '../../services/employeeApi';
import { EmployeeAssistantModal } from './EmployeeAssistantModal';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

const EMPLOYEE_SEARCH_ITEMS = [
  { title: 'Dashboard', path: '/employee/dashboard', category: 'Overview', keywords: 'home dashboard stats punch summary' },
  { title: 'My Profile', path: '/employee/profile', category: 'Profile', keywords: 'profile personal contact bank address identity card emergency' },
  { title: 'Today\'s Attendance', path: '/employee/attendance', category: 'Attendance', keywords: 'attendance punch checkin checkout break working hours' },
  { title: 'Face Biometric Registration', path: '/employee/attendance-face', category: 'Attendance', keywords: 'face biometric attendance scan camera recognition' },
  { title: 'My Shift & Schedule', path: '/employee/shift', category: 'Shift', keywords: 'shift timing weekly off roster schedule plant station' },
  { title: 'Request Shift Swap', path: '/employee/shift-swap', category: 'Shift', keywords: 'swap shift swap change mutual adjustment exchange' },
  { title: 'Leave Quotas & Balances', path: '/employee/leave', category: 'Leave', keywords: 'leave balance casual sick earned comp off cl sl el' },
  { title: 'Apply for Leave', path: '/employee/leave?action=apply', category: 'Leave', keywords: 'apply leave request absence vacation medical sick' },
  { title: 'My Tasks & Work Orders', path: '/employee/tasks', category: 'Tasks', keywords: 'tasks todo assigned work orders pending in progress completed' },
  { title: 'My Payroll & Salary', path: '/employee/payroll', category: 'Payroll', keywords: 'payroll salary gross deductions net pay pf tax payslip' },
  { title: 'View Payslips', path: '/employee/payslips', category: 'Payroll', keywords: 'payslip salary slip download print earnings statement' },
  { title: 'My Documents', path: '/employee/documents', category: 'Documents', keywords: 'documents certificates appointment letter offer upload verified files' },
  { title: 'Training & LMS', path: '/employee/training', category: 'Training', keywords: 'training gmp 21 cfr compliance lms cert certificate exam score' },
  { title: 'GMP Cleanroom Credential', path: '/employee/compliance', category: 'Compliance', keywords: 'gmp credential qualification cleanroom authorization validity days' },
  { title: 'Company Policies & SOP', path: '/employee/policies', category: 'Policies', keywords: 'policies sop handbook ethics safety attendance rules acknowledge' },
  { title: 'My Team & Manager', path: '/employee/team', category: 'Team', keywords: 'team manager team lead supervisor colleagues hierarchy' },
  { title: 'Notifications & Alerts', path: '/employee/notifications', category: 'Communication', keywords: 'notifications alerts notices unread messages updates' },
  { title: 'Company Announcements', path: '/employee/announcements', category: 'Communication', keywords: 'announcements notices holidays circulars events notices' },
  { title: 'HR & IT Support Desk', path: '/employee/support', category: 'Support', keywords: 'support help ticket hr query it issue assistance' },
  { title: 'Account Settings & Security', path: '/employee/settings', category: 'Settings', keywords: 'settings security password change login history sessions' },
];

export const EmployeeNavbar = ({ setIsMobileOpen, isMobileOpen }) => {
  const { employeeUser, logout } = useEmployeeAuth();
  const navigate = useNavigate();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await employeeNotificationAPI.getNotifications();
        if (res.data?.success) {
          setUnreadCount(res.data.unreadCount || 0);
          setRecentNotifications(res.data.notifications?.slice(0, 5) || []);
        }
      } catch (err) {
        // Silent fail
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = EMPLOYEE_SEARCH_ITEMS.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
    ).slice(0, 6);

    setSearchResults(matches);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (path) => {
    setSearchQuery('');
    setIsSearchFocused(false);
    navigate(path);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur shadow-sm">
        {/* Left: Mobile hamburger & branding */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2.5">
            <img src="/bjk_logo.png" alt="BJK Healthcare" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-slate-900">BJK HEALTHCARE</span>
                <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-teal-700 border border-teal-200 uppercase">
                  Employee Self Service
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">BJK Employee Self Service Portal</p>
            </div>
          </div>
        </div>

        {/* Center: Search My Employee Portal (Desktop / Tablet) */}
        <div className="hidden md:block flex-1 max-w-md mx-4 relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search My Employee Portal (leave, payslip, shift, training...)"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Employee Portal Menus ({searchResults.length})
              </div>
              <div className="py-1 divide-y divide-slate-50">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSearchResultClick(item.path)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-teal-50/60 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Category: {item.category}
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Notifications, Ask AI, Profile Menu, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Search Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="md:hidden rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            title="Search Employee Portal"
            aria-label="Search Employee Portal"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Ask AI Button */}
          <button
            type="button"
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 shadow-sm transition-all"
            title="BJK Employee AI Assistant"
          >
            <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-800">Notifications</span>
                  <Link
                    to="/employee/notifications"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-teal-600 hover:underline font-semibold"
                  >
                    View all
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notif, idx) => (
                      <div
                        key={notif._id || idx}
                        className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                          !notif.isRead ? 'bg-teal-50/40' : ''
                        }`}
                      >
                        <p className="font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {(employeeUser?.name || employeeUser?.fullName || 'E').charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {employeeUser?.name || employeeUser?.fullName || 'Employee'}
                </span>
                <span className="text-[10px] text-teal-600 font-semibold truncate max-w-[120px]">
                  {employeeUser?.employeeId || 'BJK-EMP-003'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{employeeUser?.name || 'Employee'}</p>
                  <p className="text-[10px] text-teal-600 font-semibold">{employeeUser?.employeeId || 'BJK-EMP-003'}</p>
                  <p className="text-[10px] text-slate-500">{employeeUser?.department || 'Quality Control'}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/employee/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/employee/settings"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account Security</span>
                  </Link>
                  <Link
                    to="/employee/support"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span>HR / IT Support</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Search Bar Dropdown */}
      {isMobileSearchOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 shadow-md relative z-20 animate-in slide-in-from-top-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (leave, payslip, shift, training...)"
              className="w-full pl-9 pr-8 py-2 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsMobileSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-xl border border-slate-200 divide-y divide-slate-50 max-h-60 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSearchResultClick(item.path);
                    setIsMobileSearchOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-teal-50 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.title}</p>
                    <p className="text-[10px] text-slate-400">{item.category}</p>
                  </div>
                  <span className="text-[10px] text-teal-600 font-semibold">Open &rarr;</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Assistant Modal */}
      <EmployeeAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </>
  );
};

export default EmployeeNavbar;
