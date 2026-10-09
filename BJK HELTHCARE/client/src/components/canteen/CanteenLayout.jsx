import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Calendar,
  BarChart3,
  Building2,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronDown,
  UserCheck,
  Shield,
  Clock,
  RefreshCw,
  Sparkles,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Menu,
  Bell
} from 'lucide-react';
import bjkLogo from '../../assets/bjk-healthcare-logo.svg';

export const CanteenLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Real-time clock formatted in Asia/Kolkata
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const formatted = d.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/canteen/dashboard' },
    { id: 'today', label: "Today's Lunch", icon: UtensilsCrossed, path: '/canteen/dashboard?tab=today' },
    { id: 'employees', label: 'Employee Lunch Data', icon: Users, path: '/canteen/dashboard?tab=employees' },
    { id: 'daily', label: 'Daily Reports', icon: Calendar, path: '/canteen/dashboard?tab=daily' },
    { id: 'monthly', label: 'Monthly Reports', icon: BarChart3, path: '/canteen/dashboard?tab=monthly' },
    { id: 'department', label: 'Department Summary', icon: Building2, path: '/canteen/dashboard?tab=department' },
    { id: 'export', label: 'Export Excel', icon: FileSpreadsheet, path: '/canteen/dashboard?tab=export' },
    { id: 'settings', label: 'Canteen Settings', icon: Settings, path: '/canteen/dashboard?tab=settings' },
  ];

  const currentTab = new URLSearchParams(location.search).get('tab') || 'dashboard';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const token = sessionStorage.getItem('authToken') || sessionStorage.getItem('bjk_token') || localStorage.getItem('authToken');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMsg({ type: '', text: '' });
        }, 1500);
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Failed to update password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Server error updating password. Please try again.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800">
      
      {/* TOPBAR */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/canteen/dashboard" className="flex items-center gap-2.5">
              <img src="/bjk_logo.png" alt="BJK Healthcare" className="h-10 w-auto object-contain" />
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">BJK HEALTHCARE</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#00A896]/20 text-[#00A896] border border-[#00A896]/30">
                    CANTEEN
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                  Canteen Department Portal
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Live Status Indicator & Clock */}
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Canteen Feed Active</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || 'Loading...'}</span>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-slate-600 transition-all text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-[#00A896]/20 border border-[#00A896]/40 flex items-center justify-center text-[#00A896] font-bold text-xs">
                CD
              </div>
              <div className="hidden sm:block pr-1">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {user?.name || 'BJK Canteen Department'}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold leading-tight">
                  {user?.role === 'CANTEEN_ADMIN' ? 'CANTEEN_ADMIN' : (user?.role || 'CANTEEN')}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name || 'BJK Canteen Department'}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || 'canteen@bjkhealthcare.com'}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Full Canteen Management Access</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-slate-500" />
                      <span>Canteen Account Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setShowPasswordModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>Change Password</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 text-xs font-bold transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* BODY LAYOUT (SIDEBAR + MAIN) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 p-4 space-y-6">
          
          <div>
            <div className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">
              CANTEEN OPERATIONS
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'dashboard' 
                  ? (currentTab === 'dashboard' && location.pathname === '/canteen/dashboard')
                  : currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'dashboard') {
                        navigate('/canteen/dashboard');
                      } else {
                        navigate(`/canteen/dashboard?tab=${item.id}`);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-[#00A896] to-[#028090] text-white shadow-md shadow-[#00A896]/20'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dedicated Scope Badge */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Dedicated Scope</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Exclusively authorized for BJK Healthcare Canteen operations & daily meal requirements.
            </p>
          </div>

          {/* Quick Logout */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all text-left"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
            <div className="relative w-72 max-w-[80vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#00A896] text-white flex items-center justify-center font-bold">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">Canteen Portal</span>
                  </div>
                  <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id || (item.id === 'dashboard' && currentTab === 'dashboard');

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsMobileSidebarOpen(false);
                          if (item.id === 'dashboard') {
                            navigate('/canteen/dashboard');
                          } else {
                            navigate(`/canteen/dashboard?tab=${item.id}`);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#00A896] text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Canteen Department Profile</h3>
                <p className="text-xs text-slate-500 font-medium">BJK Healthcare Enterprise Canteen Account</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Account Name</span>
                <span className="font-bold text-slate-900">{user?.name || 'BJK Healthcare Canteen Department'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Username / Email</span>
                <span className="font-bold text-slate-900">{user?.email || 'canteen@bjkhealthcare.com'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Assigned Role</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">CANTEEN_ADMIN</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-900">Canteen Department</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Access Scope</span>
                <span className="font-bold text-teal-700">Full Canteen Management Access</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active & Operational
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Change Canteen Password</h3>
                <p className="text-xs text-slate-500 font-medium">Update password for Canteen Department login</p>
              </div>
            </div>

            {passwordMsg.text && (
              <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}>
                {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#00A896] focus:bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#00A896] focus:bg-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-[#00A896] focus:bg-white outline-none"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#00A896] to-[#028090] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanteenLayout;
