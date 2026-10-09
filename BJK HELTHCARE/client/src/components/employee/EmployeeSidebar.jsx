import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  Clock,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  Users,
  Megaphone,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  CalendarDays,
  RotateCcw,
  Utensils,
  X
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const EmployeeSidebar = ({ isCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { employeeUser, logout } = useEmployeeAuth();
  const location = useLocation();

  const [openSections, setOpenSections] = useState({
    profile: location.pathname.startsWith('/employee/profile') || location.pathname.startsWith('/employee/id-card'),
    attendance: location.pathname.startsWith('/employee/attendance'),
    canteen: location.pathname.startsWith('/employee/canteen'),
    shift: location.pathname.startsWith('/employee/shift'),
    leave: location.pathname.startsWith('/employee/leave'),
    tasks: location.pathname.startsWith('/employee/tasks'),
    payroll: location.pathname.startsWith('/employee/payroll') || location.pathname.startsWith('/employee/payslips'),
    documents: location.pathname.startsWith('/employee/documents'),
    training: location.pathname.startsWith('/employee/training') || location.pathname.startsWith('/employee/compliance'),
    policies: location.pathname.startsWith('/employee/policies'),
    team: location.pathname.startsWith('/employee/team'),
    communication: location.pathname.startsWith('/employee/notifications') || location.pathname.startsWith('/employee/announcements'),
    support: location.pathname.startsWith('/employee/support'),
    settings: location.pathname.startsWith('/employee/settings'),
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/30'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
      isActive
        ? 'text-teal-700 font-bold bg-teal-50/80'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`;

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
      {/* Top Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img src="/bjk_logo.png" alt="BJK Healthcare" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-900 tracking-tight">BJK HEALTHCARE</span>
              <span className="text-[10px] text-teal-600 font-bold tracking-wide uppercase">Employee Self Service</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close Navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Card Snippet */}
        <div className="mx-3 mt-3 mb-2 p-3 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {(employeeUser?.name || employeeUser?.fullName || 'E').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {employeeUser?.name || employeeUser?.fullName || 'Employee'}
                </p>
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
              </div>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                {employeeUser?.employeeId || '--'} • {employeeUser?.department || '--'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (STRICTLY THE ONLY 14 MENU CATEGORIES) */}
        <nav className="space-y-0.5 px-3 py-1.5 overflow-y-auto max-h-[calc(100vh-235px)] scrollbar-thin">
          {/* 1. 🏠 Dashboard */}
          <NavLink to="/employee/dashboard" className={navItemClass}>
            <Home className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* 📅 MY WORK CALENDAR */}
          <NavLink to="/employee/calendar" className={navItemClass}>
            <Calendar className="h-4 w-4 shrink-0" />
            <span>My Calendar</span>
          </NavLink>

          {/* 2. 👤 MY PROFILE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/profile')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-teal-600 shrink-0" />
                <span>My Profile</span>
              </div>
              {openSections.profile ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.profile && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/id-card" className={subNavItemClass}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-teal-800">My ID Card (Front & Back)</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-teal-600 text-white">Official</span>
                  </div>
                </NavLink>
                <NavLink to="/employee/profile?tab=personal" className={subNavItemClass}>Personal Information</NavLink>
                <NavLink to="/employee/profile?tab=contact" className={subNavItemClass}>Contact Details</NavLink>
                <NavLink to="/employee/profile?tab=employment" className={subNavItemClass}>Employment Details</NavLink>
                <NavLink to="/employee/profile?tab=education" className={subNavItemClass}>Education</NavLink>
                <NavLink to="/employee/profile?tab=experience" className={subNavItemClass}>Experience</NavLink>
                <NavLink to="/employee/profile?tab=family" className={subNavItemClass}>Family Details</NavLink>
                <NavLink to="/employee/profile?tab=emergency" className={subNavItemClass}>Emergency Contact</NavLink>
                <NavLink to="/employee/profile?tab=nominees" className={subNavItemClass}>Nominees</NavLink>
                <NavLink to="/employee/profile?tab=card" className={subNavItemClass}>Business Card</NavLink>
              </div>
            )}

          </div>

          {/* 3. 🕐 ATTENDANCE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('attendance')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/attendance')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Attendance</span>
              </div>
              {openSections.attendance ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.attendance && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/attendance" className={subNavItemClass}>Today's Attendance</NavLink>
                <NavLink to="/employee/attendance" className={subNavItemClass}>Punch In / Punch Out</NavLink>
                <NavLink to="/employee/attendance" className={subNavItemClass}>Break</NavLink>
                <NavLink to="/employee/attendance?tab=history" className={subNavItemClass}>Attendance History</NavLink>
                <NavLink to="/employee/attendance-face" className={subNavItemClass}>Face Biometric</NavLink>
              </div>
            )}
          </div>

          {/* 3.5 🍽️ CANTEEN MANAGEMENT */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('canteen')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/canteen')
                  ? 'text-teal-700 bg-teal-50/50 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Utensils className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Canteen</span>
              </div>
              {openSections.canteen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.canteen && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/canteen" className={subNavItemClass}>Canteen</NavLink>
                <NavLink to="/employee/canteen?tab=today" className={subNavItemClass}>Today's Lunch</NavLink>
                <NavLink to="/employee/canteen?tab=history" className={subNavItemClass}>Lunch History</NavLink>
                <NavLink to="/employee/canteen?tab=summary" className={subNavItemClass}>My Canteen Summary</NavLink>
              </div>
            )}
          </div>

          {/* 4. 🕘 MY SHIFT */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('shift')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/shift')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-teal-600 shrink-0" />
                <span>My Shift</span>
              </div>
              {openSections.shift ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.shift && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/shift" className={subNavItemClass}>Current Shift</NavLink>
                <NavLink to="/employee/shift" className={subNavItemClass}>Shift Timing</NavLink>
                <NavLink to="/employee/shift" className={subNavItemClass}>Weekly Off</NavLink>
                <NavLink to="/employee/shift-swap" className={subNavItemClass}>Shift Swap</NavLink>
              </div>
            )}
          </div>

          {/* 5. 🏖️ LEAVE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('leave')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/leave')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Leave</span>
              </div>
              {openSections.leave ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.leave && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/leave" className={subNavItemClass}>Leave Balance</NavLink>
                <NavLink to="/employee/leave?action=apply" className={subNavItemClass}>Apply Leave</NavLink>
                <NavLink to="/employee/leave" className={subNavItemClass}>Leave History</NavLink>
              </div>
            )}
          </div>

          {/* 6. 📝 MY TASKS */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/tasks')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4 text-teal-600 shrink-0" />
                <span>My Tasks</span>
              </div>
              {openSections.tasks ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.tasks && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/tasks" className={subNavItemClass}>Pending</NavLink>
                <NavLink to="/employee/tasks" className={subNavItemClass}>In Progress</NavLink>
                <NavLink to="/employee/tasks" className={subNavItemClass}>Completed</NavLink>
              </div>
            )}
          </div>

          {/* 7. 💰 MY PAYROLL */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('payroll')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/payroll') || location.pathname.startsWith('/employee/payslips')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-teal-600 shrink-0" />
                <span>My Payroll</span>
              </div>
              {openSections.payroll ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.payroll && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/payroll" className={subNavItemClass}>Current Salary</NavLink>
                <NavLink to="/employee/payslips" className={subNavItemClass}>Payslips</NavLink>
                <NavLink to="/employee/payroll" className={subNavItemClass}>Salary History</NavLink>
              </div>
            )}
          </div>

          {/* 8. 📄 MY DOCUMENTS */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('documents')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/documents')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                <span>My Documents</span>
              </div>
              {openSections.documents ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.documents && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/documents" className={subNavItemClass}>Employment Documents</NavLink>
                <NavLink to="/employee/documents" className={subNavItemClass}>Certificates</NavLink>
                <NavLink to="/employee/documents" className={subNavItemClass}>Payslips</NavLink>
                <NavLink to="/employee/documents" className={subNavItemClass}>Other Documents</NavLink>
              </div>
            )}
          </div>

          {/* 9. 🎓 TRAINING & COMPLIANCE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('training')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/training') || location.pathname.startsWith('/employee/compliance')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Training & Compliance</span>
              </div>
              {openSections.training ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.training && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/training" className={subNavItemClass}>My Training</NavLink>
                <NavLink to="/employee/training" className={subNavItemClass}>GMP Training</NavLink>
                <NavLink to="/employee/training" className={subNavItemClass}>Quality Training</NavLink>
                <NavLink to="/employee/training" className={subNavItemClass}>Safety Training</NavLink>
                <NavLink to="/employee/training" className={subNavItemClass}>SOP Training</NavLink>
                <NavLink to="/employee/compliance" className={subNavItemClass}>Certificates & GMP Badge</NavLink>
              </div>
            )}
          </div>

          {/* 10. 📋 POLICIES & SOP */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('policies')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/policies')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Policies & SOP</span>
              </div>
              {openSections.policies ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.policies && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/policies" className={subNavItemClass}>Company Policies</NavLink>
                <NavLink to="/employee/policies" className={subNavItemClass}>Relevant SOP</NavLink>
                <NavLink to="/employee/policies" className={subNavItemClass}>Acknowledgements</NavLink>
              </div>
            )}
          </div>

          {/* 11. 👥 MY TEAM */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('team')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/team')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-teal-600 shrink-0" />
                <span>My Team</span>
              </div>
              {openSections.team ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.team && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/team" className={subNavItemClass}>Reporting Manager</NavLink>
                <NavLink to="/employee/team" className={subNavItemClass}>Team Lead</NavLink>
                <NavLink to="/employee/team" className={subNavItemClass}>Permitted Team Members</NavLink>
              </div>
            )}
          </div>

          {/* 12. 📢 COMMUNICATION */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('communication')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/notifications') || location.pathname.startsWith('/employee/announcements')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Communication</span>
              </div>
              {openSections.communication ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.communication && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/notifications" className={subNavItemClass}>Notifications</NavLink>
                <NavLink to="/employee/announcements" className={subNavItemClass}>Announcements</NavLink>
                <NavLink to="/employee/announcements" className={subNavItemClass}>Events</NavLink>
                <NavLink to="/employee/announcements" className={subNavItemClass}>Holidays</NavLink>
              </div>
            )}
          </div>

          {/* 13. 🎫 SUPPORT */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('support')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/support')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Support</span>
              </div>
              {openSections.support ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.support && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/support?action=create" className={subNavItemClass}>HR Support</NavLink>
                <NavLink to="/employee/support?action=create" className={subNavItemClass}>IT Support</NavLink>
                <NavLink to="/employee/support" className={subNavItemClass}>My Requests</NavLink>
              </div>
            )}
          </div>

          {/* 14. ⚙️ SETTINGS */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('settings')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.startsWith('/employee/settings')
                  ? 'text-teal-700 bg-teal-50/50'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Settings</span>
              </div>
              {openSections.settings ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>

            {openSections.settings && (
              <div className="mt-0.5 space-y-0.5 border-l-2 border-teal-100 ml-4 pl-1">
                <NavLink to="/employee/settings" className={subNavItemClass}>Account</NavLink>
                <NavLink to="/employee/settings" className={subNavItemClass}>Security</NavLink>
                <NavLink to="/employee/settings" className={subNavItemClass}>Change Password</NavLink>
                <NavLink to="/employee/settings" className={subNavItemClass}>Login History</NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeSidebar;
