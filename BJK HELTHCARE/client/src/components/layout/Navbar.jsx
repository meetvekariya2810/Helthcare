import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Clock,
  LogOut,
  ChevronDown,
  Shield,
  Layers,
  User,
  Settings,
  Megaphone,
  Moon
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { SendNotificationModal } from '../hrms/SendNotificationModal';

export const Navbar = ({ setIsMobileOpen, onOpenSearch }) => {
  const { user, logout, can } = useAuth();
  const { unreadCount, healthStatus } = useNotification();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSendNotificationOpen, setIsSendNotificationOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const role = user?.role || 'EMPLOYEE';
  const isHRorAdmin = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'HR_ADMIN', 'HR_MANAGER', 'HR', 'HR_EXECUTIVE'].includes(role) || (can && (can('hr.announcements') || can('employee.edit')));

  // Role-specific operational subtitle
  const getRoleSubtitle = () => {
    switch (role) {
      case 'EMPLOYEE':
        return 'BJK Employee Self Service • Personal Workspace';
      case 'QA_MANAGER':
      case 'QC_MANAGER':
        return 'BJK Quality & Workforce Command Center • Quality Operations';
      case 'SUPER_ADMIN':
      case 'DIRECTOR':
        return 'BJK Healthcare Executive Command Center • Live Operations';
      case 'HR_MANAGER':
      case 'HR_ADMIN':
      default:
        return 'BJK Healthcare Command Center • Workforce Operations';
    }
  };

  // Scope label for profile menu
  const getScopeBadge = () => {
    if (user?.scopeLabel) return user.scopeLabel;
    switch (role) {
      case 'EMPLOYEE':
        return 'Self Service';
      case 'QA_MANAGER':
      case 'QC_MANAGER':
        return 'Quality Operations';
      case 'SUPER_ADMIN':
      case 'DIRECTOR':
        return 'Executive Command';
      case 'HR_MANAGER':
      case 'HR_ADMIN':
      default:
        return 'Workforce Operations';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Role-Specific Welcome Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Open Menu"
        >
          <Menu size={22} />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-800">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'},
            </span>
            <span className="text-xs font-bold text-bjk-teal">
              {user ? user.name.split(' ')[0] : 'Colleague'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {getRoleSubtitle()}
          </span>
        </div>
      </div>

      {/* Center: Search Any Menu Bar matching Screenshot 2/3 */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div
          onClick={onOpenSearch}
          className="cursor-pointer relative flex items-center w-full"
        >
          <input
            type="text"
            readOnly
            placeholder="Search Any Menu"
            className="w-full pl-4 pr-10 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-full text-xs text-slate-700 placeholder-slate-400 focus:outline-none transition-all cursor-pointer shadow-inner"
          />
          <div className="absolute right-3 text-slate-400">
            <Search size={15} />
          </div>
        </div>
      </div>

      {/* Right: Announcements, Notifications, + Ask AI, Dark mode & Profile */}
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        {/* Mobile Search Icon Trigger */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-full text-slate-500 hover:text-bjk-teal hover:bg-slate-100 transition-colors"
          title="Search Any Menu"
          aria-label="Search Any Menu"
        >
          <Search size={18} />
        </button>

        {/* Megaphone / Announcements Broadcast Trigger matching Screenshot 2 (for HR & Admin) */}
        {isHRorAdmin && (
          <button
            onClick={() => setIsSendNotificationOpen(true)}
            className="relative p-2 rounded-full text-slate-600 hover:text-teal-600 hover:bg-teal-50 transition-all transform hover:scale-105"
            title="SEND Notifications / Announcement to All Employees"
          >
            <Megaphone size={20} className="text-slate-700 hover:text-teal-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF5A36] text-white rounded-full flex items-center justify-center font-black text-[11px] ring-2 ring-white shadow-xs">
              +
            </span>
          </button>
        )}

        {/* Notification Bell matching Screenshot 2 */}
        <NavLink
          to="/hrms/notifications"
          className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
        >
          <Bell size={19} className="text-slate-700" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#FFA928] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
            {unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : '99+'}
          </span>
        </NavLink>

        {/* + Ask AI Pill Button matching Screenshots */}
        <NavLink
          to="/hrms/copilot"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-semibold shadow-sm transition-all transform hover:scale-[1.02]"
          title="BJK AI Copilot"
        >
          <span className="text-white font-bold">+</span>
          <Sparkles size={13} className="text-white" />
          <span>Ask AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse ml-0.5"></span>
        </NavLink>

        {/* Dark/Light mode toggle */}
        <button
          className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Toggle Theme"
        >
          <Moon size={16} className="text-slate-600" />
        </button>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-1 p-1 rounded-full hover:ring-2 hover:ring-bjk-teal/30 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm overflow-hidden">
              <User size={18} className="text-slate-600" />
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Authorized Operator'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'operator@bjkhealthcare.com'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bjk-teal/10 text-bjk-teal border border-bjk-teal/20">
                    {role}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {getScopeBadge()}
                  </span>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <NavLink
                  to="/hrms/me"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={14} className="text-slate-400" />
                  <span>My Portal (ESS)</span>
                </NavLink>

                {(can('settings:view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN') && (
                  <NavLink
                    to="/hrms/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings size={14} className="text-slate-400" />
                    <span>Admin Settings</span>
                  </NavLink>
                )}
              </div>

              {/* Sign Out */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEND Notifications Modal for HR / Admin */}
      <SendNotificationModal
        isOpen={isSendNotificationOpen}
        onClose={() => setIsSendNotificationOpen(false)}
      />
    </header>
  );
};

export default Navbar;
