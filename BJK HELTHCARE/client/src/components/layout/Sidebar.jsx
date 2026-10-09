import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Gauge,
  Activity,
  Factory,
  Layers,
  ShieldCheck,
  Boxes,
  Globe,
  Users,
  Ship,
  DollarSign,
  FileText,
  Pill,
  Bot,
  Sliders,
  LineChart,
  Headphones,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  User,
  HelpCircle,
  Megaphone,
  CreditCard,
  Database,
  History,
  Building2,
  CalendarDays,
  UserPlus,
  UserX,
  FileSpreadsheet,
  Package,
  Wrench,
  Sparkles,
  Key,
  Utensils,
  Calendar,
  X,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const { user, hasPermission, hasRole, canAccessModule } = useAuth();
  const location = useLocation();
  const role = user?.role || 'EMPLOYEE';
  const dept = (user?.department || '').trim().toLowerCase();

  // Role & Department Scoping
  const isDirector = ['DIRECTOR', 'SUPER_ADMIN'].includes(role);
  const isHR = isDirector || ['HR_ADMIN', 'HR_MANAGER', 'HR', 'HR_EXECUTIVE'].includes(role) || 
    (dept.includes('human') || dept === 'hr');

  // Department identification
  const isProduction = dept.includes('production');
  const isQC = (dept.includes('quality control') || dept === 'qc') && !dept.includes('micro');
  const isQAMicro = dept.includes('micro') || dept.includes('qc micro');
  const isQA = (dept.includes('quality assurance') || dept === 'qa') && !isQAMicro;
  const isWarehouse = dept.includes('warehouse') || dept.includes('inventory');
  const isEngineering = dept.includes('engineering') || dept.includes('maintenance');
  const isFinance = dept.includes('account') || dept.includes('finance');
  const isPurchase = dept.includes('purchase') || dept.includes('procurement');
  const isRegulatory = dept.includes('regulatory');
  const isSales = dept.includes('sales') || dept.includes('marketing');
  const isFacilities = dept.includes('admin') || dept.includes('facility') || dept.includes('facilities') || dept.includes('general');

  const isEmpMgmtPath = [
    '/hr/employees',
    '/hr/id-cards',
    '/hr/login-credentials',
    '/hr/roles',
    '/hr/approval-permissions',
    '/hr/access-audit',
    '/hr/employees/create',
    '/hr/employees/former',
    '/hr/employees/hierarchy',
    '/hr/employees/import'
  ].some(p => location.pathname.startsWith(p));

  const isOpsShiftsPath = [
    '/hr/calendar',
    '/hrms/calendar',
    '/hr/attendance',
    '/hrms/attendance/command-center',
    '/attendance-command-center',
    '/hrms/attendance/reports',
    '/hr/attendance/reports',
    '/hrms/shifts',
    '/hrms/leave',
    '/hrms/recruitment',
    '/hrms/onboarding',
    '/hr/offboarding',
    '/hr/audit-logs'
  ].some(p => location.pathname.startsWith(p));

  const isCoreNonTechPath = [
    '/hrms/dashboard',
    '/hrms/employees',
    '/hrms/attendance',
    '/hrms/attendance/today',
    '/hrms/attendance/present',
    '/hrms/attendance/absent',
    '/hrms/attendance/history',
    '/hrms/reports',
    '/hrms/canteen',
    '/hr/canteen'
  ].some(p => location.pathname.startsWith(p));

  const [openSections, setOpenSections] = useState({
    setupConfig: location.pathname.includes('/setup') || location.pathname.includes('/hr/roles'),
    coreHrms: true,
    deptOperations: true,
    enterpriseDepts: true
  });

  const [openSubSections, setOpenSubSections] = useState({
    employeeManagement: isEmpMgmtPath || false,
    operationsShifts: isOpsShiftsPath || false,
    coreHrmsNonTech: isCoreNonTechPath || false
  });

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSubSection = (key) => {
    setOpenSubSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Determines if a path is active
  const isItemActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Primary Enterprise Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white text-slate-700 transition-all duration-300 border-r border-slate-200 shadow-lg ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header: BJK Official Logo */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-100 bg-white">
          <NavLink to="/dashboard" className="flex items-center space-x-2.5 overflow-hidden flex-1 group">
            <img
              src="/bjk_logo.png"
              alt="BJK Healthcare"
              className="h-10 w-auto object-contain flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-black text-xs tracking-wide text-slate-900 leading-tight truncate">
                  BJK HEALTHCARE
                </span>
                <span className="text-[10px] font-bold text-[#00A896] tracking-wider uppercase truncate">
                  Digital Brain
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile / Department Card */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 mb-2 p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs border border-teal-200/60 shadow-2xs flex-shrink-0">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate">
                  {user?.department || 'Department Workspace'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {user?.role?.replace(/_/g, ' ') || 'Authorized User'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 text-xs select-none">
          {/* 1. Dashboard (Primary Command Center) */}
          <NavLink
            to="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                isItemActive('/dashboard') || isActive
                  ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
            }
          >
            <Gauge size={17} className="text-[#00A896] flex-shrink-0" />
            {!isCollapsed && <span>{isHR ? 'HR Command Center' : 'Department Dashboard'}</span>}
          </NavLink>

          {/* ========================================================================= */}
          {/* A. HR ONLY SECTIONS: SETUP & CONFIG + CORE HRMS ACCORDIONS */}
          {/* ========================================================================= */}
          {isHR && (
            <>
              {/* Setup and Configuration (Collapsible) */}
              <div>
                <button
                  onClick={() => toggleSection('setupConfig')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                    openSections.setupConfig
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Sliders size={17} className="text-teal-600 flex-shrink-0" />
                    {!isCollapsed && <span>Setup and Configuration</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${openSections.setupConfig ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {openSections.setupConfig && !isCollapsed && (
                  <div className="pl-6 pr-1 mt-1 space-y-0.5 text-[11px] border-l-2 border-slate-200 ml-4">
                    <NavLink
                      to="/setup/departments"
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                          isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      Departments
                    </NavLink>
                    <NavLink
                      to="/setup/sub-departments"
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                          isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      Sub-Departments
                    </NavLink>
                    <NavLink
                      to="/hr/roles"
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                          isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      Roles & Permissions
                    </NavLink>
                    <NavLink
                      to="/hrms/settings"
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                          isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      System Settings
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Core HRMS */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('coreHrms')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                    openSections.coreHrms
                      ? 'text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <Users size={17} className="text-amber-600 flex-shrink-0" />
                    {!isCollapsed && <span>Core HRMS</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform ${openSections.coreHrms ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {openSections.coreHrms && !isCollapsed && (
                  <div className="pl-4 pr-1 mt-1 space-y-2 text-[11px] border-l-2 border-slate-200 ml-4">
                    {/* Sub-Header 1: EMPLOYEE & MANAGEMENT */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleSubSection('employeeManagement')}
                        className="w-full flex items-center justify-between pt-1.5 pb-1 px-2 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-[#00A896] hover:bg-teal-50/60 transition-colors group cursor-pointer text-left"
                      >
                        <span className="truncate">EMPLOYEE & MANAGEMENT</span>
                        <ChevronDown
                          size={12}
                          className={`text-slate-400 group-hover:text-[#00A896] transition-transform duration-200 flex-shrink-0 ml-1 ${
                            openSubSections.employeeManagement ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openSubSections.employeeManagement && (
                        <div className="space-y-0.5 pl-1.5 border-l border-teal-100/70 ml-1">
                          <NavLink
                            to="/hr/employees"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hr/employees' || location.pathname === '/hr/employees/technical'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Employees Directory
                          </NavLink>
                          <NavLink
                            to="/hr/id-cards"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname.includes('/id-cards') || isActive
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            <div className="flex items-center space-x-1.5">
                              <CreditCard size={13} className="text-[#00A896]" />
                              <span>Employee ID Cards</span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-teal-100 text-teal-800">
                              V1
                            </span>
                          </NavLink>
                          <NavLink
                            to="/hr/login-credentials"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname.includes('/login-credentials') || isActive
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            <div className="flex items-center space-x-1.5">
                              <Key size={13} className="text-[#00A896]" />
                              <span>Login Credentials</span>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Security Control" />
                          </NavLink>
                          <NavLink
                            to="/hr/roles"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hr/roles'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Roles & Permissions
                          </NavLink>
                          <NavLink
                            to="/hr/approval-permissions"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hr/approval-permissions'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Approval Permissions
                          </NavLink>
                          <NavLink
                            to="/hr/access-audit"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hr/access-audit'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Access Audit
                          </NavLink>
                          <NavLink
                            to="/hr/employees/create"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            + Add Employee (Wizard)
                          </NavLink>
                          <NavLink
                            to="/hr/employees/former"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Former Employees
                          </NavLink>
                          <NavLink
                            to="/hr/employees/hierarchy"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Employee Hierarchy & Org
                          </NavLink>
                          <NavLink
                            to="/hr/employees/import"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Bulk Upload / Import
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* Sub-Header 2: OPERATIONS & SHIFTS */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleSubSection('operationsShifts')}
                        className="w-full flex items-center justify-between pt-1.5 pb-1 px-2 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-[#00A896] hover:bg-teal-50/60 transition-colors group cursor-pointer text-left"
                      >
                        <span className="truncate">OPERATIONS & SHIFTS</span>
                        <ChevronDown
                          size={12}
                          className={`text-slate-400 group-hover:text-[#00A896] transition-transform duration-200 flex-shrink-0 ml-1 ${
                            openSubSections.operationsShifts ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openSubSections.operationsShifts && (
                        <div className="space-y-0.5 pl-1.5 border-l border-teal-100/70 ml-1">
                          <NavLink
                            to="/hr/calendar"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname.startsWith('/hr/calendar') || location.pathname.startsWith('/hrms/calendar') || isActive
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            <div className="flex items-center space-x-1.5">
                              <Calendar size={13} className="text-[#00A896]" />
                              <span>Workforce Calendar</span>
                            </div>
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-[#00A896]/20 text-[#00A896]">
                              Central
                            </span>
                          </NavLink>
                          <NavLink
                            to="/hr/attendance"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hr/attendance'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Attendance Dashboard
                          </NavLink>
                          <NavLink
                            to="/hrms/attendance/command-center"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/attendance/command-center' || location.pathname === '/attendance-command-center'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Attendance Command Center
                          </NavLink>
                          <NavLink
                            to="/hrms/attendance/reports"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/attendance/reports' || location.pathname === '/hr/attendance/reports'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Attendance Reports & Excel
                          </NavLink>
                          <NavLink
                            to="/hrms/shifts"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Shift Management
                          </NavLink>
                          <NavLink
                            to="/hrms/leave"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Leave & Holiday
                          </NavLink>
                          <NavLink
                            to="/hrms/recruitment"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Recruitment / ATS
                          </NavLink>
                          <NavLink
                            to="/hrms/onboarding"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Onboarding (90-Day)
                          </NavLink>
                          <NavLink
                            to="/hr/offboarding"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Offboarding / Exit
                          </NavLink>
                          <NavLink
                            to="/hr/audit-logs"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                isActive ? 'text-[#00A896] font-bold bg-teal-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Employee Audit Logs
                          </NavLink>
                        </div>
                      )}
                    </div>

                    {/* Sub-Header 3: CORE HRMS (NON-TECHNICAL & DAILY ATTENDANCE) */}
                    <div className="space-y-1 pt-1 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => toggleSubSection('coreHrmsNonTech')}
                        className="w-full flex items-center justify-between pt-1 pb-1 px-2 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-[#00A896] hover:bg-teal-50/60 transition-colors group cursor-pointer text-left"
                      >
                        <span className="truncate">CORE HRMS (NON-TECHNICAL)</span>
                        <ChevronDown
                          size={12}
                          className={`text-slate-400 group-hover:text-[#00A896] transition-transform duration-200 flex-shrink-0 ml-1 ${
                            openSubSections.coreHrmsNonTech ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openSubSections.coreHrmsNonTech && (
                        <div className="space-y-0.5 pl-1.5 border-l border-teal-100/70 ml-1">
                          <NavLink
                            to="/hrms/dashboard"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-bold transition-colors ${
                                location.pathname === '/hrms/dashboard' || location.pathname === '/hrms'
                                  ? 'text-[#00A896] font-bold bg-teal-50/80'
                                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                              }`
                            }
                          >
                            Core HRMS Dashboard
                          </NavLink>
                          <NavLink
                            to="/hrms/employees"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/employees'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Non-Technical Staff
                          </NavLink>
                          <NavLink
                            to="/hrms/attendance"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/attendance' || location.pathname === '/hrms/attendance/today'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Daily Attendance (Manual)
                          </NavLink>
                          <NavLink
                            to="/hrms/attendance/present"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/attendance/present'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Today's Present Staff
                          </NavLink>
                          <NavLink
                            to="/hrms/attendance/absent"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/attendance/absent'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Today's Absent Staff
                          </NavLink>
                          <NavLink
                            to="/hrms/attendance/history"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/attendance/history'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Attendance History
                          </NavLink>
                          <NavLink
                            to="/hrms/reports/attendance"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/reports/attendance' || location.pathname === '/hrms/reports'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            Attendance Reports
                          </NavLink>
                          <NavLink
                            to="/hrms/canteen"
                            onClick={() => setIsMobileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center justify-between py-1 px-2 rounded font-medium transition-colors ${
                                location.pathname === '/hrms/canteen' || location.pathname === '/hr/canteen'
                                  ? 'text-[#00A896] font-bold bg-teal-50/70'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`
                            }
                          >
                            <div className="flex items-center space-x-1.5">
                              <Utensils size={13} className="text-[#00A896]" />
                              <span>Canteen Management</span>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Live Canteen Sync" />
                          </NavLink>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* B1. SUPER ADMIN / DIRECTOR: ALL ENTERPRISE DEPARTMENT WORKSPACES */}
          {/* ========================================================================= */}
          {isDirector && (
            <div className="pt-2 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => toggleSection('enterpriseDepts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-medium ${
                  openSections.enterpriseDepts
                    ? 'text-slate-900 font-semibold bg-slate-50/80'
                    : 'text-slate-600 hover:bg-slate-50'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <Building2 size={17} className="text-teal-600 flex-shrink-0" />
                  {!isCollapsed && <span>Enterprise Workspaces</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform ${openSections.enterpriseDepts ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {openSections.enterpriseDepts && !isCollapsed && (
                <div className="pl-4 pr-1 mt-1 space-y-0.5 text-[11px] border-l-2 border-slate-200 ml-4">
                  <NavLink
                    to="/quality/qc"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <ShieldCheck size={14} className="text-amber-600 mr-2 flex-shrink-0" />
                    <span>Quality Control (QC)</span>
                  </NavLink>

                  <NavLink
                    to="/quality/qa"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <ShieldCheck size={14} className="text-rose-600 mr-2 flex-shrink-0" />
                    <span>Quality Assurance (QA)</span>
                  </NavLink>

                  <NavLink
                    to="/dashboard/microbiology"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <ShieldCheck size={14} className="text-teal-600 mr-2 flex-shrink-0" />
                    <span>QC Microbiology</span>
                  </NavLink>

                  <NavLink
                    to="/production"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Layers size={14} className="text-indigo-600 mr-2 flex-shrink-0" />
                    <span>Manufacturing (Production)</span>
                  </NavLink>

                  <NavLink
                    to="/inventory"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Boxes size={14} className="text-teal-600 mr-2 flex-shrink-0" />
                    <span>Warehouse & Inventory</span>
                  </NavLink>

                  <NavLink
                    to="/finance"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <CreditCard size={14} className="text-emerald-600 mr-2 flex-shrink-0" />
                    <span>Finance & Accounts</span>
                  </NavLink>

                  <NavLink
                    to="/dashboard/procurement"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Package size={14} className="text-amber-600 mr-2 flex-shrink-0" />
                    <span>Purchase & Procurement</span>
                  </NavLink>

                  <NavLink
                    to="/dashboard/engineering"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Wrench size={14} className="text-blue-600 mr-2 flex-shrink-0" />
                    <span>Engineering & Equipment</span>
                  </NavLink>

                  <NavLink
                    to="/regulatory"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Globe size={14} className="text-cyan-600 mr-2 flex-shrink-0" />
                    <span>Regulatory Dossiers</span>
                  </NavLink>

                  <NavLink
                    to="/crm"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Briefcase size={14} className="text-indigo-600 mr-2 flex-shrink-0" />
                    <span>Commercial & Sales (CRM)</span>
                  </NavLink>

                  <NavLink
                    to="/dashboard/facilities"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Building2 size={14} className="text-slate-600 mr-2 flex-shrink-0" />
                    <span>Facilities & Services</span>
                  </NavLink>

                  <NavLink
                    to="/products"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Pill size={14} className="text-emerald-600 mr-2 flex-shrink-0" />
                    <span>Products Master</span>
                  </NavLink>

                  <NavLink
                    to="/documents"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <FileText size={14} className="text-purple-600 mr-2 flex-shrink-0" />
                    <span>Controlled Documents & SOPs</span>
                  </NavLink>

                  <NavLink
                    to="/hrms/canteen"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Utensils size={14} className="text-[#00A896] mr-2 flex-shrink-0" />
                    <span>Canteen Management</span>
                  </NavLink>

                  <NavLink
                    to="/audit-logs"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center py-1.5 px-2 rounded font-medium transition-colors ${
                        isActive ? 'text-[#00A896] font-bold bg-teal-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <ShieldAlert size={14} className="text-rose-600 mr-2 flex-shrink-0" />
                    <span>Audit Logs & Compliance</span>
                  </NavLink>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* B2. DEPARTMENT-SPECIFIC OPERATIONAL SECTIONS (NON-SUPER ADMIN / NON-HR) */}
          {/* ========================================================================= */}
          {!isDirector && !isHR && (
            <div className="pt-2 border-t border-slate-100 mt-2">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {user?.department ? `${user.department} Operations` : 'Operations'}
                </div>
              )}

              {/* PRODUCTION */}
              {isProduction && (
                <>
                  <NavLink
                    to="/production"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Layers size={17} className="text-indigo-600 flex-shrink-0" />
                    {!isCollapsed && <span>Batch Manufacturing (eBR)</span>}
                  </NavLink>
                  <NavLink
                    to="/products"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Pill size={17} className="text-emerald-600 flex-shrink-0" />
                    {!isCollapsed && <span>Formulation Products</span>}
                  </NavLink>
                </>
              )}

              {/* QUALITY CONTROL (QC) */}
              {isQC && (
                <>
                  <NavLink
                    to="/quality/qc"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <ShieldCheck size={17} className="text-amber-600 flex-shrink-0" />
                    {!isCollapsed && <span>QC Lab & Testing</span>}
                  </NavLink>
                  <NavLink
                    to="/documents"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <FileText size={17} className="text-purple-600 flex-shrink-0" />
                    {!isCollapsed && <span>QC Test Specs & SOPs</span>}
                  </NavLink>
                </>
              )}

              {/* QUALITY ASSURANCE (QA) */}
              {isQA && (
                <>
                  <NavLink
                    to="/quality/qa"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <ShieldCheck size={17} className="text-rose-600 flex-shrink-0" />
                    {!isCollapsed && <span>QA Release & CAPA</span>}
                  </NavLink>
                  <NavLink
                    to="/documents"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <FileText size={17} className="text-purple-600 flex-shrink-0" />
                    {!isCollapsed && <span>Controlled Documents</span>}
                  </NavLink>
                </>
              )}

              {/* WAREHOUSE & INVENTORY */}
              {isWarehouse && (
                <>
                  <NavLink
                    to="/inventory"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Boxes size={17} className="text-teal-600 flex-shrink-0" />
                    {!isCollapsed && <span>Warehouse Ledger</span>}
                  </NavLink>
                  <NavLink
                    to="/products"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Pill size={17} className="text-emerald-600 flex-shrink-0" />
                    {!isCollapsed && <span>Stock SKUs</span>}
                  </NavLink>
                </>
              )}

              {/* ENGINEERING & MAINTENANCE */}
              {isEngineering && (
                <>
                  <NavLink
                    to="/dashboard/engineering"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Wrench size={17} className="text-blue-600 flex-shrink-0" />
                    {!isCollapsed && <span>Maintenance & Equipment</span>}
                  </NavLink>
                </>
              )}

              {/* ACCOUNTS & FINANCE */}
              {isFinance && (
                <>
                  <NavLink
                    to="/finance"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <CreditCard size={17} className="text-emerald-600 flex-shrink-0" />
                    {!isCollapsed && <span>Finance & Invoices</span>}
                  </NavLink>
                </>
              )}

              {/* PURCHASE & PROCUREMENT */}
              {isPurchase && (
                <>
                  <NavLink
                    to="/dashboard/procurement"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Package size={17} className="text-amber-600 flex-shrink-0" />
                    {!isCollapsed && <span>Procurement & POs</span>}
                  </NavLink>
                </>
              )}

              {/* REGULATORY AFFAIRS */}
              {isRegulatory && (
                <>
                  <NavLink
                    to="/regulatory"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Globe size={17} className="text-cyan-600 flex-shrink-0" />
                    {!isCollapsed && <span>Regulatory Dossiers</span>}
                  </NavLink>
                </>
              )}

              {/* SALES & MARKETING */}
              {isSales && (
                <>
                  <NavLink
                    to="/crm"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Briefcase size={17} className="text-indigo-600 flex-shrink-0" />
                    {!isCollapsed && <span>CRM & Leads</span>}
                  </NavLink>
                  <NavLink
                    to="/products"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Pill size={17} className="text-emerald-600 flex-shrink-0" />
                    {!isCollapsed && <span>Product Catalogue</span>}
                  </NavLink>
                </>
              )}

              {/* QC MICROBIOLOGY */}
              {isQAMicro && (
                <>
                  <NavLink
                    to="/dashboard/microbiology"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <ShieldCheck size={17} className="text-teal-600 flex-shrink-0" />
                    {!isCollapsed && <span>Microbiology Lab</span>}
                  </NavLink>
                </>
              )}

              {/* FACILITIES & GENERAL ADMIN */}
              {isFacilities && (
                <>
                  <NavLink
                    to="/dashboard/facilities"
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                        isActive
                          ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                    }
                  >
                    <Building2 size={17} className="text-slate-600 flex-shrink-0" />
                    {!isCollapsed && <span>Facilities & Services</span>}
                  </NavLink>
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* C. EMPLOYEE SELF-SERVICE (FOR ALL DEPARTMENTS & EMPLOYEES) */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100 mt-2">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Self-Service & Shifts
              </div>
            )}

            {/* My Attendance */}
            <NavLink
              to="/hrms/attendance"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
              }
            >
              <Clock size={17} className="text-teal-600 flex-shrink-0" />
              {!isCollapsed && <span>My Attendance</span>}
            </NavLink>

            {/* My Leaves */}
            <NavLink
              to="/hrms/leave"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
              }
            >
              <CalendarDays size={17} className="text-indigo-500 flex-shrink-0" />
              {!isCollapsed && <span>My Leaves & Holidays</span>}
            </NavLink>

            {/* My Shifts */}
            <NavLink
              to="/hrms/shifts"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
              }
            >
              <Calendar size={17} className="text-amber-500 flex-shrink-0" />
              {!isCollapsed && <span>My Shifts</span>}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* D. AI COPILOT & SHARED TOOLS */}
          {/* ========================================================================= */}
          <div className="pt-2 border-t border-slate-100 mt-2 space-y-0.5">
            {/* AI Copilot */}
            <NavLink
              to="/hrms/copilot"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
              }
            >
              <Bot size={17} className="text-cyan-500 flex-shrink-0" />
              {!isCollapsed && <span>AI Copilot</span>}
            </NavLink>

            {/* Notifications */}
            <NavLink
              to="/hrms/notifications"
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-[#E6F4F1] text-[#00A896] font-bold border-l-4 border-[#00A896]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
              }
            >
              <Headphones size={17} className="text-rose-500 flex-shrink-0" />
              {!isCollapsed && <span>Announcements</span>}
            </NavLink>
          </div>

          {/* Governance & Audit (Director / Super Admin Only) */}
          {isDirector && (
            <div className="pt-2 border-t border-slate-100 mt-2">
              {!isCollapsed && (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Governance & Audit
                </div>
              )}
              <NavLink
                to="/audit-logs"
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                    isActive
                      ? 'bg-teal-50 text-[#00A896] font-bold border-l-4 border-[#00A896]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                }
              >
                <History size={17} className="text-slate-500 flex-shrink-0" />
                {!isCollapsed && <span>Audit Trail</span>}
              </NavLink>
              <NavLink
                to="/admin/database"
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-xl transition-all font-medium ${
                    isActive
                      ? 'bg-teal-50 text-[#00A896] font-bold border-l-4 border-[#00A896]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center' : 'space-x-3'}`
                }
              >
                <Database size={17} className="text-teal-600 flex-shrink-0" />
                {!isCollapsed && <span>Atlas DB Manager</span>}
              </NavLink>
            </div>
          )}

          {/* Bottom Utilities */}
          <div className="pt-2 border-t border-slate-100 mt-2 space-y-0.5">
            <NavLink
              to="/hrms/notifications"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-medium space-x-3 group"
            >
              <div className="relative flex-shrink-0">
                <Megaphone size={15} className="text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
              </div>
              {!isCollapsed && <span className="text-[11px]">What's New</span>}
            </NavLink>

            <NavLink
              to="/hrms/settings"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-medium space-x-3 group"
            >
              <HelpCircle size={15} className="text-slate-400 group-hover:text-slate-600 group-hover:scale-110 transition-transform flex-shrink-0" />
              {!isCollapsed && <span className="text-[11px]">Contact Support</span>}
            </NavLink>
          </div>
        </div>

        {/* Bottom Footer: BJK Digital Brain Online */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-1 text-xs select-none">
            <div className="flex items-center justify-between px-2 py-0.5 text-[10px] text-slate-500">
              <span className="font-medium">BJK Digital Brain</span>
              <span className="font-mono text-emerald-600 font-bold">OnLine</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
