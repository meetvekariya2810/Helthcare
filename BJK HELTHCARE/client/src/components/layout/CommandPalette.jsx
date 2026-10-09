import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  FileText,
  Boxes,
  X,
  ArrowRight
} from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Search items across modules
  const searchRegistry = [
    { title: 'HR Master Command Center', category: 'HR Master', subtitle: 'Workforce telemetry, metrics & KPIs', path: '/hr', icon: Building2 },
    { title: 'Active Sessions & Security', category: 'HR Master', subtitle: 'Real-time session monitoring & remote logout', path: '/hr/sessions', icon: ShieldCheck },
    { title: 'Login Activity & Audit', category: 'HR Master', subtitle: 'Authentication logs, failed attempts & IP trace', path: '/hr/login-activity', icon: ShieldCheck },
    { title: 'Employee Directory', category: 'HR Master', subtitle: 'Employee records, KYC & credentials', path: '/hr/employees', icon: Users },
    { title: 'Onboard New Employee', category: 'HR Master', subtitle: 'Identity creation, role & account provisioning', path: '/hr/onboarding', icon: Users },
    { title: 'Employee Offboarding', category: 'HR Master', subtitle: 'Account deactivation & session revocation', path: '/hr/offboarding', icon: Users },
    { title: 'Department Master (20 Divisions)', category: 'HR Master', subtitle: 'Heads, managers & department permissions', path: '/hr/departments', icon: Building2 },
    { title: 'Role Architecture & RBAC', category: 'HR Master', subtitle: 'Enterprise permission matrix & scopes', path: '/hr/roles', icon: ShieldCheck },
    { title: 'Dr. Vikram Mehta', category: 'Employees', subtitle: 'Lead QA Manager - BJK Unit 1', path: '/hr/employees', icon: Users },
    { title: 'Priya Sharma', category: 'Employees', subtitle: 'Senior QC Analyst - Analytical Lab', path: '/hr/employees', icon: Users },
    { title: 'Rajesh Patel', category: 'Employees', subtitle: 'Production Line Operator - Formulations', path: '/hr/employees', icon: Users },
    { title: 'Quality Assurance', category: 'Departments', subtitle: 'BJK Unit 1 - Formulations Facility', path: '/hr/departments', icon: Building2 },
    { title: 'Quality Control', category: 'Departments', subtitle: 'BJK Unit 1 - Formulations Facility', path: '/hr/departments', icon: Building2 },
    { title: 'Production Operations', category: 'Departments', subtitle: 'BJK Unit 1 - Formulations Facility', path: '/hr/departments', icon: Building2 },
    { title: 'Pharma Night Shift (22:00 - 06:30)', category: 'Shifts', subtitle: 'Night differential applicable', path: '/hrms/shifts', icon: CalendarCheck },
    { title: 'USFDA Lead Quality Auditor Certification', category: 'Credentials', subtitle: 'Valid until 2027', path: '/hrms/credentials', icon: ShieldCheck },
    { title: 'Data Integrity & 21 CFR Part 11', category: 'Training', subtitle: 'Quality Compliance Program', path: '/hrms/training', icon: GraduationCap },
    { title: 'Leave Management & Governance', category: 'Leave', subtitle: 'Workforce leave requests, balances & approvals', path: '/hrms/leave', icon: CalendarCheck },
    { title: 'Apply for Leave', category: 'Leave', subtitle: 'Submit controlled leave application', path: '/employee/leave', icon: CalendarCheck },
    { title: 'Team Leave Approval Queue', category: 'Leave', subtitle: 'Manager review & leave decisions', path: '/manager/leave', icon: CalendarCheck },
    { title: 'Monthly Payroll Run 2026-09', category: 'Payroll', subtitle: 'Statutory EPF, ESI & PT verified', path: '/hrms/payroll', icon: CreditCard },
    { title: 'Employee Master Registry', category: 'Reports', subtitle: 'Download Master CSV', path: '/hr/employees', icon: FileText }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { user } = useAuth();
  const userRole = user?.role || 'EMPLOYEE';

  // Role-filtered searchable items
  const authorizedRegistry = searchRegistry.filter(item => {
    if (userRole === 'EMPLOYEE') {
      // Employees cannot search company-wide personnel, payroll, or jobs
      if (item.category === 'Employees' || item.category === 'Departments' || item.category === 'Payroll' || item.category === 'Jobs' || item.category === 'Reports') {
        return false;
      }
      return true;
    }
    if (userRole === 'QA_MANAGER' || userRole === 'QC_MANAGER') {
      // QA Managers cannot search payroll or recruitment
      if (item.category === 'Payroll' || item.category === 'Jobs') {
        return false;
      }
      if (item.category === 'Employees' && !item.subtitle.includes('QA') && !item.subtitle.includes('QC')) {
        return false;
      }
      return true;
    }
    return true;
  });

  const filtered = searchTerm.trim() === ''
    ? authorizedRegistry.slice(0, 6)
    : authorizedRegistry.filter(
        item =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const handleSelect = (path) => {
    navigate(path);
    onClose(false);
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search size={20} className="text-bjk-teal mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search employees, departments, training, credentials, payroll..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 mr-2">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-block bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 rounded border border-slate-200">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No matching records found across BJK Digital Brain.
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left transition-colors group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-bjk-teal/10 text-bjk-teal flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-800 truncate">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-bjk-teal group-hover:translate-x-1 transition-all" />
              </button>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search BJK Healthcare Knowledge Graph</span>
          <span className="flex items-center space-x-1">
            <span>Powered by</span>
            <strong className="text-bjk-teal font-semibold">BJK Digital Brain</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
