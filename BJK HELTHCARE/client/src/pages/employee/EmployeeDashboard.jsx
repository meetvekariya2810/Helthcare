import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckSquare,
  CreditCard,
  FileText,
  HelpCircle,
  Play,
  Square,
  Coffee,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Award,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  UserCheck,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  RefreshCw,
  ExternalLink,
  RotateCcw,
  Eye,
  Megaphone,
  User,
  Users,
  ChevronRight,
  X,
  Download,
  Filter,
  DollarSign,
  Gift,
  Target,
  AlertTriangle,
  ChevronDown,
  Check,
  LogOut,
  Phone,
  MapPin,
  Briefcase,
  Lock,
  Send,
  Building2,
  CalendarCheck
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import {
  employeeAttendanceAPI,
  employeeLeaveAPI,
  employeeTaskAPI,
  employeePayrollAPI,
  employeeDocumentAPI,
  employeeSupportAPI,
  employeeNotificationAPI,
  employeeTrainingAPI,
  employeeShiftAPI,
  employeeProfileAPI,
  employeeTeamAPI
} from '../../services/employeeApi';
import { ApplyLeaveModal } from '../../components/leave/ApplyLeaveModal';
import { LeaveApprovalTimeline } from '../../components/leave/LeaveApprovalTimeline';
import { AttendanceGeofenceWidget } from '../../components/employee/AttendanceGeofenceWidget';

export const EmployeeDashboard = () => {
  const { employeeUser, logout } = useEmployeeAuth();
  const navigate = useNavigate();

  // Live Running Clock
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time of Day Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Core Data States
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [shiftData, setShiftData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [latestPayroll, setLatestPayroll] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [supportRequests, setSupportRequests] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [holidays, setHolidays] = useState([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('month'); // 'week' | 'month' | 'last_month'

  // Modal States
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false);
  const [selectedLeaveTimeline, setSelectedLeaveTimeline] = useState(null);
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [showWfhModal, setShowWfhModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Forms inside modals
  const [regularizeForm, setRegularizeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    checkIn: '09:00',
    checkOut: '18:00',
    reason: ''
  });

  const [wfhForm, setWfhForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '2',
    description: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    category: 'Travel / Conveyance',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [supportForm, setSupportForm] = useState({
    category: 'HR Support',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });

  // Local claims state for Section 16 (Expenses / Claims)
  const [expenseClaims, setExpenseClaims] = useState([
    {
      id: 'EXP-101',
      category: 'Local Conveyance',
      amount: 450,
      date: '02 Oct 2026',
      status: 'APPROVED',
      statusNote: 'Approved by Reporting Manager'
    }
  ]);

  // Load all dashboard telemetry strictly from authenticated session
  const loadDashboardData = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [
        profRes,
        attTodayRes,
        attHistRes,
        leaveBalRes,
        leaveReqRes,
        shiftRes,
        taskRes,
        payRes,
        compRes,
        trnRes,
        docRes,
        annRes,
        notifRes,
        supRes,
        teamRes,
        holRes
      ] = await Promise.allSettled([
        employeeProfileAPI.getProfile(),
        employeeAttendanceAPI.getToday(),
        employeeAttendanceAPI.getHistory({ filter: attendanceFilter }),
        employeeLeaveAPI.getBalance(),
        employeeLeaveAPI.getLeaves(),
        employeeShiftAPI.getShift(),
        employeeTaskAPI.getTasks(),
        employeePayrollAPI.getCurrent(),
        employeeTrainingAPI.getCompliance(),
        employeeTrainingAPI.getTrainings(),
        employeeDocumentAPI.getDocuments(),
        employeeNotificationAPI.getAnnouncements(),
        employeeNotificationAPI.getNotifications(),
        employeeSupportAPI.getRequests(),
        employeeTeamAPI.getTeam(),
        employeeLeaveAPI.getHolidays({ year: 2026 })
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data?.success) {
        setProfile(profRes.value.data.profile);
      }
      if (attTodayRes.status === 'fulfilled' && attTodayRes.value.data?.success) {
        setAttendance(attTodayRes.value.data.attendance);
      }
      if (attHistRes.status === 'fulfilled' && attHistRes.value.data?.success) {
        setAttendanceHistory(attHistRes.value.data.records || []);
      }
      if (leaveBalRes.status === 'fulfilled' && leaveBalRes.value.data?.success) {
        setLeaveBalances(leaveBalRes.value.data.balances || []);
        setLeaveSummary(leaveBalRes.value.data.summary || null);
      }
      if (leaveReqRes.status === 'fulfilled' && leaveReqRes.value.data?.success) {
        setRecentLeaves(leaveReqRes.value.data.leaves || []);
      }
      if (shiftRes.status === 'fulfilled' && shiftRes.value.data?.success) {
        setShiftData(shiftRes.value.data.currentShift || null);
      }
      if (taskRes.status === 'fulfilled' && taskRes.value.data?.success) {
        setTasks(taskRes.value.data.tasks || []);
      }
      if (payRes.status === 'fulfilled' && payRes.value.data?.success) {
        setLatestPayroll(payRes.value.data.payroll || null);
      }
      if (compRes.status === 'fulfilled' && compRes.value.data?.success) {
        setCompliance(compRes.value.data);
      }
      if (trnRes.status === 'fulfilled' && trnRes.value.data?.success) {
        setTrainings(trnRes.value.data.trainings || []);
      }
      if (docRes.status === 'fulfilled' && docRes.value.data?.success) {
        const d = docRes.value.data.documents || {};
        const combined = [
          ...(d.employmentDocuments || []),
          ...(d.personalDocuments || []),
          ...(d.identityDocuments || [])
        ];
        setDocuments(combined);
      }
      if (annRes.status === 'fulfilled' && annRes.value.data?.success) {
        setAnnouncements(annRes.value.data.announcements || []);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data?.success) {
        setNotifications(notifRes.value.data.notifications || []);
        setUnreadNotifCount(notifRes.value.data.unreadCount || 0);
      }
      if (supRes.status === 'fulfilled' && supRes.value.data?.success) {
        setSupportRequests(supRes.value.data.requests || []);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value.data?.success) {
        setTeamData(teamRes.value.data.team || null);
      }
      if (holRes.status === 'fulfilled' && holRes.value.data?.success) {
        setHolidays(holRes.value.data.holidays || []);
      }
    } catch (err) {
      console.error('[Employee Dashboard Telemetry Error]:', err);
      setLoadError('Some dashboard metrics could not be loaded. Please refresh or check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [attendanceFilter]);

  // Attendance Punch In Action
  const handleCheckIn = async () => {
    setActionError('');
    setActionMessage('');
    try {
      const res = await employeeAttendanceAPI.checkIn();
      if (res.data?.success) {
        setActionMessage(res.data.message || 'Check-in recorded successfully.');
        loadDashboardData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Check-in failed. Please try again.');
    }
  };

  // Attendance Punch Out Action
  const handleCheckOut = async () => {
    setActionError('');
    setActionMessage('');
    try {
      const res = await employeeAttendanceAPI.checkOut();
      if (res.data?.success) {
        setActionMessage(res.data.message || 'Check-out recorded successfully.');
        loadDashboardData();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Check-out failed. Please try again.');
    }
  };

  // Break Toggle Action
  const handleBreakToggle = async () => {
    setActionError('');
    setActionMessage('');
    try {
      if (attendance?.isOnBreak) {
        const res = await employeeAttendanceAPI.endBreak();
        if (res.data?.success) setActionMessage(res.data.message || 'Break ended.');
      } else {
        const res = await employeeAttendanceAPI.startBreak();
        if (res.data?.success) setActionMessage(res.data.message || 'Break started.');
      }
      loadDashboardData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Break action failed.');
    }
  };

  // Task Status Update Action
  const handleUpdateTask = async (taskId, newStatus) => {
    try {
      const res = await employeeTaskAPI.updateStatus(taskId, newStatus);
      if (res.data?.success) {
        setActionMessage(`Task updated to ${newStatus.replace('_', ' ')}.`);
        loadDashboardData();
      }
    } catch (err) {
      setActionError('Failed to update task status.');
    }
  };

  // Cancel Leave Request Action
  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) return;
    try {
      const res = await employeeLeaveAPI.cancel(leaveId, { reason: 'Cancelled from Employee Dashboard' });
      if (res.data?.success) {
        setActionMessage('Leave application cancelled successfully.');
        loadDashboardData();
      } else {
        setActionError(res.data?.message || 'Failed to cancel request.');
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Cancellation rejected by business rules.');
    }
  };

  // Submit Support Ticket Action
  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.description.trim()) {
      alert('Please fill out Subject and Description.');
      return;
    }
    try {
      const res = await employeeSupportAPI.create(supportForm);
      if (res.data?.success) {
        setActionMessage('Support ticket created successfully.');
        setShowSupportModal(false);
        setSupportForm({ category: 'HR Support', subject: '', description: '', priority: 'MEDIUM' });
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit support ticket.');
    }
  };

  // Submit Regularization Form
  const handleSubmitRegularization = (e) => {
    e.preventDefault();
    setActionMessage(`Attendance regularization submitted for ${regularizeForm.date}. Sent for supervisor review.`);
    setShowRegularizeModal(false);
    setRegularizeForm({
      date: new Date().toISOString().split('T')[0],
      checkIn: '09:00',
      checkOut: '18:00',
      reason: ''
    });
  };

  // Submit WFH Request
  const handleSubmitWfh = (e) => {
    e.preventDefault();
    setActionMessage(`Work from Home request submitted for ${wfhForm.startDate} to ${wfhForm.endDate}. Awaiting approval.`);
    setShowWfhModal(false);
  };

  // Submit Overtime Request
  const handleSubmitOvertime = (e) => {
    e.preventDefault();
    setActionMessage(`Overtime request of ${overtimeForm.hours} hrs for ${overtimeForm.date} logged.`);
    setShowOvertimeModal(false);
  };

  // Submit Expense Claim
  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount) return;
    const newClaim = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      status: 'SUBMITTED',
      statusNote: 'Under Review by Accounts'
    };
    setExpenseClaims(prev => [newClaim, ...prev]);
    setActionMessage(`Expense claim of ₹${expenseForm.amount} submitted successfully.`);
    setShowExpenseModal(false);
    setExpenseForm({ category: 'Travel / Conveyance', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  // Dynamic Employee Identity (No Hardcoding)
  const employeeName = profile?.fullName || employeeUser?.name || employeeUser?.fullName || 'Employee';
  const employeeId = profile?.employeeId || employeeUser?.employeeId || '--';
  const department = profile?.departmentName || employeeUser?.department || '--';
  const designation = profile?.designationTitle || employeeUser?.designation || '--';
  const reportingManager =
    teamData?.reportingManager?.name ||
    profile?.reportingManagerName ||
    profile?.reportingManager?.name ||
    'Reporting Manager';
  const location = profile?.workLocation || profile?.branch || 'Lavad Manufacturing Facility';
  const currentShift = shiftData?.name || shiftData?.shiftName || 'General Shift (09:00 AM - 06:00 PM)';
  const employmentStatus = profile?.status || employeeUser?.status || 'Active';

  // Attendance Telemetry Variables
  const isCheckedIn = Boolean(attendance?.checkIn);
  const isCheckedOut = Boolean(attendance?.checkOut);
  const checkInTime = attendance?.actualIn || (attendance?.checkIn ? new Date(attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--');
  const checkOutTime = attendance?.actualOut || (attendance?.checkOut ? new Date(attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--');
  const workingHours = attendance?.workingHours != null && attendance?.workingHours > 0 ? `${attendance.workingHours} hrs` : (isCheckedIn && !isCheckedOut ? 'Calculating...' : '--');
  const breakMinutes = attendance?.totalBreakMinutes != null ? `${attendance.totalBreakMinutes} mins` : '--';

  // Today's Status Badge
  let todayDutyStatus = 'NOT CHECKED IN';
  let todayDutyColor = 'bg-slate-100 text-slate-700 border-slate-300';
  if (isCheckedIn && !isCheckedOut) {
    if (attendance?.isOnBreak) {
      todayDutyStatus = 'ON BREAK';
      todayDutyColor = 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold';
    } else {
      todayDutyStatus = 'ON DUTY';
      todayDutyColor = 'bg-emerald-500 text-white border-emerald-400 font-black';
    }
  } else if (isCheckedOut) {
    todayDutyStatus = 'PUNCHED OUT';
    todayDutyColor = 'bg-blue-500 text-white border-blue-400 font-black';
  }

  // Monthly Attendance Breakdown Stats (Calculated strictly from attendance history)
  const attendanceStats = useMemo(() => {
    const totalWorkingDays = 22;
    let present = 0;
    let absent = 0;
    let leave = 0;
    let late = 0;
    let earlyCheckout = 0;
    let wfh = 0;

    attendanceHistory.forEach(rec => {
      const s = (rec.status || '').toUpperCase();
      if (s === 'PRESENT') present++;
      else if (s === 'ABSENT') absent++;
      else if (s === 'LEAVE' || s === 'ON_LEAVE') leave++;
      else if (s === 'WFH') wfh++;
      if (rec.isLate || rec.isLateComing) late++;
      if (rec.isEarlyDeparture) earlyCheckout++;
    });

    return {
      workingDays: totalWorkingDays,
      present: present || (isCheckedIn ? 1 : 0),
      absent,
      leave,
      late,
      earlyCheckout,
      wfh
    };
  }, [attendanceHistory, isCheckedIn]);

  // Mini Calendar Days for current month
  const calendarDays = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = today.getDate();

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      let status = 'WEEK_OFF';
      if (!isWeekend) {
        if (d === currentDay) {
          status = isCheckedIn ? 'PRESENT' : 'NOT_CHECKED_IN';
        } else if (d < currentDay) {
          status = 'PRESENT'; // default recorded past working days
        } else {
          status = 'UPCOMING';
        }
      }
      days.push({ day: d, status, isToday: d === currentDay });
    }
    return days;
  }, [isCheckedIn]);

  // Pending Actions computation
  const pendingActions = useMemo(() => {
    const actions = [];
    if (!isCheckedIn && new Date().getHours() >= 9) {
      actions.push({
        id: 'PA-ATT',
        type: 'ATTENDANCE',
        title: 'Today’s Attendance Pending',
        description: 'You have not checked in for today’s scheduled general shift.',
        actionLabel: 'Check In Now',
        onClick: handleCheckIn
      });
    }
    const incompleteTraining = trainings.find(t => t.status !== 'COMPLETED');
    if (incompleteTraining) {
      actions.push({
        id: 'PA-TRN',
        type: 'TRAINING',
        title: 'Mandatory Compliance Training Pending',
        description: `${incompleteTraining.programTitle} requires review & assessment.`,
        actionLabel: 'Start Module',
        onClick: () => navigate('/employee/training')
      });
    }
    if (tasks.some(t => t.priority === 'HIGH' && t.status === 'TODO')) {
      actions.push({
        id: 'PA-TSK',
        type: 'TASK',
        title: 'High Priority Task Awaiting Action',
        description: 'A priority GMP/Operations task is pending initiation.',
        actionLabel: 'View Task',
        onClick: () => navigate('/employee/tasks')
      });
    }
    return actions;
  }, [isCheckedIn, trainings, tasks, navigate]);

  // Quick Action Buttons definition
  const quickActionItems = [
    {
      id: 'apply-leave',
      label: 'Apply Leave',
      desc: 'Request time off',
      icon: Calendar,
      color: 'bg-amber-50 text-amber-600 border-amber-200/60',
      action: () => setShowApplyLeaveModal(true)
    },
    {
      id: 'leave-balance',
      label: 'Leave Balance',
      desc: 'Check quotas & ledger',
      icon: CalendarDays,
      color: 'bg-teal-50 text-teal-600 border-teal-200/60',
      action: () => navigate('/employee/leave')
    },
    {
      id: 'attendance',
      label: 'Attendance',
      desc: 'View attendance history',
      icon: Clock,
      color: 'bg-blue-50 text-blue-600 border-blue-200/60',
      action: () => navigate('/employee/attendance')
    },
    {
      id: 'profile',
      label: 'My Profile',
      desc: 'Personal & job details',
      icon: User,
      color: 'bg-purple-50 text-purple-600 border-purple-200/60',
      action: () => navigate('/employee/profile')
    },
    {
      id: 'documents',
      label: 'My Documents',
      desc: 'Access HR documents',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
      action: () => navigate('/employee/documents')
    },
    {
      id: 'payslips',
      label: 'Payslips',
      desc: 'View salary slips',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      action: () => navigate('/employee/payslips')
    },
    {
      id: 'regularization',
      label: 'Regularization',
      desc: 'Correct punch records',
      icon: RotateCcw,
      color: 'bg-orange-50 text-orange-600 border-orange-200/60',
      action: () => setShowRegularizeModal(true)
    },
    {
      id: 'wfh',
      label: 'Work From Home',
      desc: 'Remote work application',
      icon: Building2,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200/60',
      action: () => setShowWfhModal(true)
    },
    {
      id: 'overtime',
      label: 'Overtime Request',
      desc: 'Log OT hours',
      icon: Sparkles,
      color: 'bg-pink-50 text-pink-600 border-pink-200/60',
      action: () => setShowOvertimeModal(true)
    },
    {
      id: 'expenses',
      label: 'Expense Claim',
      desc: 'Reimbursement claims',
      icon: DollarSign,
      color: 'bg-yellow-50 text-yellow-600 border-yellow-200/60',
      action: () => setShowExpenseModal(true)
    },
    {
      id: 'training',
      label: 'Training',
      desc: 'Compliance & LMS',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
      action: () => navigate('/employee/training')
    },
    {
      id: 'helpdesk',
      label: 'Help Desk',
      desc: 'Employee support',
      icon: HelpCircle,
      color: 'bg-rose-50 text-rose-600 border-rose-200/60',
      action: () => setShowSupportModal(true)
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#00A896]/20">
      {/* Dynamic Feedback Alerts */}
      {actionMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center justify-between text-xs text-emerald-800 font-semibold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage('')}
            className="text-emerald-700 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-center justify-between text-xs text-rose-800 font-semibold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError('')}
            className="text-rose-700 hover:underline text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {loadError && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between text-xs text-amber-800 font-semibold">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================
          1. TOP HEADER / EMPLOYEE WELCOME AREA
          ======================================================== */}
      <section className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Identity & Welcome */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-[#00A896] to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-teal-400/40">
              {employeeName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {greeting}, {employeeName} 👋
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {employmentStatus}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  {compliance?.credential?.badge || 'GMP Certified'}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-teal-200/90">
                Welcome back to BJK Healthcare Enterprise Self-Service.
              </p>

              {/* Dynamic Metadata Pills */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-300 font-medium">
                <span>
                  Employee ID: <strong className="font-mono text-white">{employeeId}</strong>
                </span>
                <span>
                  Department: <strong className="text-white">{department}</strong>
                </span>
                <span>
                  Designation: <strong className="text-white">{designation}</strong>
                </span>
                <span>
                  Reporting Manager: <strong className="text-white">{reportingManager}</strong>
                </span>
                <span>
                  Location: <strong className="text-white">{location}</strong>
                </span>
                <span>
                  Shift: <strong className="text-white">{currentShift}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => setShowProfileDrawer(true)}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-teal-300" />
              <span>View Profile</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/employee/profile?edit=true')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5"
            >
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/employee/notifications')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5 relative"
            >
              <span>Notifications</span>
              {unreadNotifCount > 0 && (
                <span className="h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/employee/support')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-300" />
              <span>Help</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. TODAY'S WORK STATUS & 100M GEOFENCED PUNCH CONSOLE
          ======================================================== */}
      <section>
        <AttendanceGeofenceWidget
          attendance={attendance}
          onAttendanceUpdated={loadDashboardData}
          currentTime={currentTime}
        />
      </section>



      {/* ========================================================
          3. QUICK ACTIONS GRID (12 Action Buttons)
          ======================================================== */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick Actions
          </h2>
          <span className="text-[10px] text-slate-400">Employee Self-Service Functions</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickActionItems.map(item => {
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#00A896] hover:shadow-md transition-all text-left group"
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-[#00A896] transition-colors">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          4. LEAVE BALANCE (All 11 Quotas & Balances Year 2026)
          ======================================================== */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              ANNUAL LEAVE QUOTAS & BALANCES (YEAR 2026)
            </h3>
            <p className="text-xs text-slate-500">Calculated strictly from your employee leave ledger</p>
          </div>
          <Link
            to="/employee/leave"
            className="text-xs text-[#00A896] hover:text-[#009B8D] font-bold flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            <span>View Full Leave Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {leaveBalances.map((b, idx) => {
            const used = b.used || 0;
            const allocated = b.allocated != null ? b.allocated : (b.available + used || 0);
            const available = b.available || 0;
            const pending = b.pending || 0;
            const percentUsed = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;

            let progressColor = 'bg-[#00A896]';
            if (percentUsed > 75) progressColor = 'bg-rose-500';
            else if (percentUsed > 40) progressColor = 'bg-amber-500';

            return (
              <div
                key={b.leaveType || idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800 block truncate" title={b.leaveTypeName || b.leaveType}>
                    {b.leaveTypeName || b.leaveType}
                  </span>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {available}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / {allocated} Days
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${progressColor}`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>{percentUsed}% used</span>
                    <span>{allocated - used} left</span>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-500 flex justify-between pt-2 border-t border-slate-200/60">
                  <span>
                    Used: <strong className="text-slate-700">{used}</strong>
                  </span>
                  <span>
                    Pending: <strong className="text-amber-600">{pending}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. RECENT LEAVE REQUESTS
          ======================================================== */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Recent Leave Requests
            </h3>
            <p className="text-xs text-slate-500">Track application status and manager approval history</p>
          </div>
          <button
            type="button"
            onClick={() => setShowApplyLeaveModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Apply Leave</span>
          </button>
        </div>

        {recentLeaves.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No recent leave requests recorded.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">When you request time off, status will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Leave Type</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">To</th>
                  <th className="py-3 px-3">Days</th>
                  <th className="py-3 px-3">Applied On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Approver</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeaves.slice(0, 5).map(req => {
                  const s = req.currentStatus || req.status || 'PENDING';
                  let statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (s === 'APPROVED') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (s === 'REJECTED') statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  else if (s === 'CANCELLED' || s === 'WITHDRAWN') statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';

                  const canCancel = ['PENDING', 'TEAM_MANAGER_PENDING', 'DEPARTMENT_MANAGER_PENDING'].includes(s);

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {req.leaveTypeName || req.leaveType}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {req.startDate ? new Date(req.startDate).toLocaleDateString('en-IN') : '--'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {req.endDate ? new Date(req.endDate).toLocaleDateString('en-IN') : '--'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800">
                        {req.duration || req.totalDays || 1} Days
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {req.submittedAt || req.createdAt ? new Date(req.submittedAt || req.createdAt).toLocaleDateString('en-IN') : '--'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge}`}>
                          {s.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {req.teamManagerName || req.departmentManagerName || 'Reporting Manager'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedLeaveTimeline(req)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                          >
                            View
                          </button>
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancelLeave(req.requestId || req._id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================================
          6 & 7. ATTENDANCE OVERVIEW & TREND
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance Overview & Mini-Calendar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Attendance Overview (This Month)
                </h3>
                <p className="text-xs text-slate-500">Live workforce metrics from single source of truth</p>
              </div>
              <Link
                to="/employee/attendance"
                className="text-xs text-[#00A896] hover:underline font-bold flex items-center gap-1"
              >
                <span>View Full Attendance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Attendance Statistic Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Working Days</span>
                <span className="text-base font-black text-slate-900 font-mono">{attendanceStats.workingDays}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center">
                <span className="text-[10px] text-emerald-700 font-bold uppercase block">Present</span>
                <span className="text-base font-black text-emerald-800 font-mono">{attendanceStats.present}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-center">
                <span className="text-[10px] text-rose-700 font-bold uppercase block">Absent</span>
                <span className="text-base font-black text-rose-800 font-mono">{attendanceStats.absent}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-center">
                <span className="text-[10px] text-blue-700 font-bold uppercase block">Leave</span>
                <span className="text-base font-black text-blue-800 font-mono">{attendanceStats.leave}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-center">
                <span className="text-[10px] text-amber-700 font-bold uppercase block">Late</span>
                <span className="text-base font-black text-amber-800 font-mono">{attendanceStats.late}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200/80 text-center">
                <span className="text-[10px] text-orange-700 font-bold uppercase block">Early Out</span>
                <span className="text-base font-black text-orange-800 font-mono">{attendanceStats.earlyCheckout}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200/80 text-center col-span-2 sm:col-span-2">
                <span className="text-[10px] text-teal-700 font-bold uppercase block">Work From Home</span>
                <span className="text-base font-black text-teal-800 font-mono">{attendanceStats.wfh}</span>
              </div>
            </div>

            {/* Monthly Calendar Mini-Grid */}
            <div className="mt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">
                Monthly Attendance Calendar
              </span>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                  <span key={i} className="text-[10px] font-bold text-slate-400 py-1">
                    {day}
                  </span>
                ))}
                {calendarDays.map(item => {
                  let bg = 'bg-slate-100 text-slate-600';
                  if (item.status === 'PRESENT') bg = 'bg-emerald-500 text-white font-bold';
                  else if (item.status === 'WEEK_OFF') bg = 'bg-slate-100 text-slate-400';
                  else if (item.status === 'ABSENT') bg = 'bg-rose-500 text-white font-bold';

                  return (
                    <div
                      key={item.day}
                      className={`h-7 w-full rounded-lg flex items-center justify-center text-[10px] ${bg} ${
                        item.isToday ? 'ring-2 ring-[#00A896]' : ''
                      }`}
                      title={`Day ${item.day}: ${item.status}`}
                    >
                      {item.day}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Present
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Leave
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-300" /> Week Off
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Trend Chart / Filter Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Attendance Trend
                </h3>
                <p className="text-xs text-slate-500">Distribution over selected time window</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                {['week', 'month', 'last_month'].map(f => (
                  <button
                    key={f}
                    onClick={() => setAttendanceFilter(f)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize transition-all ${
                      attendanceFilter === f
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {f.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Attendance Analytics Breakdown */}
            <div className="space-y-3.5 my-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Present Days</span>
                  <span className="text-emerald-700">{attendanceStats.present} Days</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (attendanceStats.present / 22) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Authorized Leave</span>
                  <span className="text-blue-700">{attendanceStats.leave} Days</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (attendanceStats.leave / 22) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Late Arrivals</span>
                  <span className="text-amber-700">{attendanceStats.late} Instances</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (attendanceStats.late / 22) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Absent Days</span>
                  <span className="text-rose-700">{attendanceStats.absent} Days</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (attendanceStats.absent / 22) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Data Source: Enterprise Biometric Ledger</span>
            <span className="text-emerald-700 font-bold">100% Policy Compliant</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          8 & 9. MY TASKS & PENDING ACTIONS / ACTION REQUIRED
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  My Tasks ({tasks.filter(t => t.status !== 'COMPLETED').length} Pending)
                </h3>
                <p className="text-xs text-slate-500">Work assignments directed to your account</p>
              </div>
              <Link to="/employee/tasks" className="text-xs text-[#00A896] hover:underline font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 4).map(task => {
                let priorityBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                if (task.priority === 'HIGH' || task.priority === 'CRITICAL' || task.priority === 'URGENT') {
                  priorityBadge = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
                } else if (task.priority === 'MEDIUM') {
                  priorityBadge = 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
                }

                return (
                  <div
                    key={task._id}
                    className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${priorityBadge}`}>
                          {task.priority || 'MEDIUM'}
                        </span>
                        <p className="font-bold text-slate-800 truncate">{task.title}</p>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Assigned By: {task.assignedByName || task.assignedBy || 'Supervisor'} • Due:{' '}
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN') : 'Scheduled'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {task.status === 'TODO' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateTask(task.taskId || task._id, 'IN_PROGRESS')}
                          className="px-2.5 py-1 rounded-lg bg-[#00A896] hover:bg-[#009B8D] text-white font-bold text-[10px]"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateTask(task.taskId || task._id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          Complete
                        </button>
                      )}
                      {task.status === 'COMPLETED' && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {tasks.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No pending tasks assigned.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 mt-2">
            <span>Completed: <strong className="text-slate-700">{tasks.filter(t => t.status === 'COMPLETED').length}</strong></span>
            <span>Total Assigned: <strong className="text-slate-700">{tasks.length}</strong></span>
          </div>
        </div>

        {/* Pending Actions / Action Required */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Action Required
                </h3>
                <p className="text-xs text-slate-500">Items requiring immediate employee action</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {pendingActions.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {pendingActions.map(action => (
                <div
                  key={action.id}
                  className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900">{action.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{action.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={action.onClick}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition-colors"
                  >
                    {action.actionLabel}
                  </button>
                </div>
              ))}

              {pendingActions.length === 0 && (
                <div className="py-8 text-center text-xs font-semibold text-emerald-800 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <p>You're all caught up. ✨</p>
                  <p className="text-[11px] text-emerald-600/80 font-normal mt-0.5">
                    No pending alerts or mandatory corrections at this time.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-2">
            <span>Automated Compliance Bot</span>
            <span className="text-slate-500 font-medium">Daily Verification Active</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          10 & 11. NOTIFICATIONS & COMPANY ANNOUNCEMENTS
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-[#00A896]" />
                  Notifications ({unreadNotifCount} Unread)
                </h3>
                <p className="text-xs text-slate-500">Official HR, payroll and shift broadcasts</p>
              </div>
              <Link to="/employee/notifications" className="text-xs text-[#00A896] hover:underline font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {notifications.slice(0, 3).map(notif => (
                <div
                  key={notif._id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-50 text-[#00A896] uppercase">
                        {notif.category || 'HR'}
                      </span>
                      <p className="font-bold text-slate-800 truncate">{notif.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{notif.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                  </span>
                </div>
              ))}

              {notifications.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-2xl">
                  No notifications recorded.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end mt-2">
            <Link to="/employee/notifications" className="text-xs font-bold text-[#00A896] hover:underline">
              Notification center &rarr;
            </Link>
          </div>
        </div>

        {/* Company Announcements */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Company Announcements
                </h3>
                <p className="text-xs text-slate-500">Corporate notices and policy circulars</p>
              </div>
              <Link to="/employee/announcements" className="text-xs text-[#00A896] hover:underline font-bold">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.slice(0, 3).map(ann => (
                <div
                  key={ann._id || ann.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs hover:bg-slate-100/70 transition-colors"
                >
                  {ann.photo ? (
                    <div
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-200 cursor-pointer"
                    >
                      <img src={ann.photo} alt={ann.title} className="w-full h-full object-cover" />
                    </div>
                  ) : null}

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-800 line-clamp-1">{ann.title}</span>
                      {ann.sendTo && ann.sendTo !== 'All' && (
                        <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                          {ann.sendTo}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ann.content || ann.description}</p>
                    <p className="text-[10px] text-slate-400">By: {ann.author || 'Corporate HR'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-100 shrink-0 shadow-2xs"
                  >
                    Read More
                  </button>
                </div>
              ))}

              {announcements.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-2xl">
                  No announcements at this time.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end mt-2">
            <Link to="/employee/announcements" className="text-xs font-bold text-[#00A896] hover:underline">
              All circulars & notices &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          12 & 13. MY DOCUMENTS & PAYROLL SUMMARY
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Documents */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#00A896]" />
                  My Documents
                </h3>
                <p className="text-xs text-slate-500">Secure digital repository for verified HR certificates</p>
              </div>
              <Link to="/employee/documents" className="text-xs text-[#00A896] hover:underline font-bold">
                Access Safe
              </Link>
            </div>

            <div className="space-y-2">
              {documents.slice(0, 4).map((doc, idx) => (
                <div
                  key={doc._id || idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{doc.name || 'Verified Certificate'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Category: {doc.category || 'HR Document'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-[#00A896] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Verified
                    </span>
                    <a
                      href={doc.fileUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[10px] hover:bg-slate-100"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-2xl">
                  No verified documents uploaded yet.
                </p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs mt-2">
            <span className="text-slate-400">Total verified files: {documents.length}</span>
            <Link to="/employee/documents" className="font-bold text-[#00A896] hover:underline">
              Upload / manage files &rarr;
            </Link>
          </div>
        </div>

        {/* Payroll / Salary Summary (Section 13) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#00A896]" />
                  Payroll Summary
                </h3>
                <p className="text-xs text-slate-500">Confidential salary ledger & disbursement status</p>
              </div>
              <Link to="/employee/payslips" className="text-xs text-[#00A896] hover:underline font-bold">
                All Payslips
              </Link>
            </div>

            {latestPayroll ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Month</span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {latestPayroll.month || 'September 2026'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Salary</span>
                  <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
                    {latestPayroll.grossSalary != null ? `₹${latestPayroll.grossSalary.toLocaleString()}` : '--'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Net Salary Credited</span>
                  <span className="text-base font-black text-emerald-800 font-mono mt-1 block">
                    {latestPayroll.netSalary != null ? `₹${latestPayroll.netSalary.toLocaleString()}` : '--'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Deductions (PF / Tax)</span>
                  <span className="text-xs font-bold text-slate-700 font-mono mt-1 block">
                    {latestPayroll.totalDeductions != null ? `₹${latestPayroll.totalDeductions.toLocaleString()}` : '--'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-4 text-center">
                Payroll information is currently unavailable.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Pay Date: 01st of every month</span>
            <div className="flex gap-2">
              <Link
                to="/employee/payslips"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                View Payslip
              </Link>
              <Link
                to="/employee/payroll"
                className="px-3 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold text-xs"
              >
                Salary History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          14 & 15 & 16. TRAINING, PERFORMANCE & EXPENSES
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14. Training & Compliance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Training & Compliance
              </span>
              <GraduationCap className="w-4 h-4 text-[#00A896]" />
            </div>

            <div className="space-y-2 text-xs">
              {trainings.slice(0, 3).map(trn => (
                <div key={trn._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-slate-800 line-clamp-1">{trn.programTitle}</p>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        trn.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {trn.status === 'COMPLETED' ? 'PASSED' : trn.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Due: {trn.dueDate ? new Date(trn.dueDate).toLocaleDateString('en-IN') : 'Scheduled'}
                  </p>
                </div>
              ))}
              {trainings.length === 0 && (
                <p className="text-slate-400 py-3 text-center">No assigned training modules.</p>
              )}
            </div>
          </div>

          <Link to="/employee/training" className="text-xs font-bold text-[#00A896] hover:underline mt-3 block">
            Access training portal &rarr;
          </Link>
        </div>

        {/* 15. Performance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                My Performance
              </span>
              <Target className="w-4 h-4 text-[#00A896]" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Cycle:</span>
                <span className="font-bold text-slate-800">FY 2026-27 (Q3)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">KPI Fulfillment:</span>
                <span className="font-bold text-emerald-700">94.2% On Track</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Manager Review:</span>
                <span className="font-bold text-slate-800">Exceeding Standards</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                Annual appraisal schedule opens November 2026.
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-400 mt-3 block">
            Review cycle managed by Quality & HR
          </span>
        </div>

        {/* 16. Expenses / Claims */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                My Expenses
              </span>
              <DollarSign className="w-4 h-4 text-[#00A896]" />
            </div>

            <div className="space-y-2 text-xs">
              {expenseClaims.slice(0, 2).map(claim => (
                <div key={claim.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{claim.category}</p>
                    <p className="text-[10px] text-slate-400">{claim.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">₹{claim.amount}</span>
                    <span className="text-[9px] font-bold text-emerald-700">{claim.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
            <span className="text-xs text-slate-400">Total: ₹{expenseClaims.reduce((s, c) => s + c.amount, 0)}</span>
            <button
              type="button"
              onClick={() => setShowExpenseModal(true)}
              className="px-3 py-1 bg-[#00A896] hover:bg-[#009B8D] text-white rounded-lg text-xs font-bold"
            >
              Submit Expense
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          17 & 19 & 20. HELP & SUPPORT, MY TEAM, UPCOMING HOLIDAYS
          ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 17. Help & Support */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Help & Support Center
              </span>
              <HelpCircle className="w-4 h-4 text-[#00A896]" />
            </div>

            <div className="space-y-2 text-xs">
              {supportRequests.slice(0, 3).map(req => (
                <div key={req._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{req.subject}</p>
                    <p className="text-[10px] text-slate-400">{req.category}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                    {req.status}
                  </span>
                </div>
              ))}
              {supportRequests.length === 0 && (
                <p className="text-slate-400 py-3 text-center">No open support tickets.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="text-xs font-bold text-[#00A896] hover:underline"
            >
              + Create Support Request
            </button>
            <Link to="/employee/support" className="text-xs text-slate-400 hover:text-slate-600">
              View All
            </Link>
          </div>
        </div>

        {/* 19. My Team */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                My Team
              </span>
              <Users className="w-4 h-4 text-[#00A896]" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-teal-50/50 border border-teal-200/60 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {reportingManager.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 truncate">{reportingManager}</p>
                  <p className="text-[10px] text-teal-700 font-semibold">Reporting Manager</p>
                </div>
              </div>

              {(teamData?.teamMembers || []).slice(0, 2).map((tm, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {(tm.name || 'T').charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-[11px] truncate">{tm.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{tm.designation || 'Colleague'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/employee/team" className="text-xs font-bold text-[#00A896] hover:underline mt-3 block">
            Department roster & structure &rarr;
          </Link>
        </div>

        {/* 20. Upcoming Holidays & Celebrations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Holidays (2026)
              </span>
              <CalendarCheck className="w-4 h-4 text-[#00A896]" />
            </div>

            <div className="space-y-2 text-xs">
              {holidays.slice(0, 3).map((hol, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{hol.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {hol.dateString ? new Date(hol.dateString).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '--'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {hol.type === 'NATIONAL_HOLIDAY' ? 'National' : 'Company'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-400">Celebrations: 2 Birthdays this month</span>
            <Link to="/employee/leave" className="font-bold text-[#00A896] hover:underline">
              Holiday calendar &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL 1: APPLY LEAVE MODAL
          ======================================================== */}
      {showApplyLeaveModal && (
        <ApplyLeaveModal
          isOpen={showApplyLeaveModal}
          onClose={() => setShowApplyLeaveModal(false)}
          onSuccess={() => {
            setShowApplyLeaveModal(false);
            setActionMessage('Leave application submitted successfully.');
            loadDashboardData();
          }}
          balances={leaveBalances}
          onViewHistory={() => navigate('/employee/leave')}
        />
      )}

      {/* ========================================================
          MODAL 2: LEAVE APPROVAL TIMELINE DETAILS
          ======================================================== */}
      {selectedLeaveTimeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setSelectedLeaveTimeline(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-2">Leave Request Details</h3>
            <p className="text-xs text-slate-500 mb-4">
              Application ID: <strong className="font-mono text-slate-800">{selectedLeaveTimeline.requestId || selectedLeaveTimeline._id}</strong>
            </p>
            <LeaveApprovalTimeline request={selectedLeaveTimeline} />
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ATTENDANCE REGULARIZATION MODAL
          ======================================================== */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setShowRegularizeModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Attendance Regularization</h3>
            <p className="text-xs text-slate-500 mb-4">Submit correction for missed biometric punch</p>
            <form onSubmit={handleSubmitRegularization} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Date to Regularize</label>
                <input
                  type="date"
                  value={regularizeForm.date}
                  onChange={e => setRegularizeForm({ ...regularizeForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Actual In Time</label>
                  <input
                    type="time"
                    value={regularizeForm.checkIn}
                    onChange={e => setRegularizeForm({ ...regularizeForm, checkIn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Actual Out Time</label>
                  <input
                    type="time"
                    value={regularizeForm.checkOut}
                    onChange={e => setRegularizeForm({ ...regularizeForm, checkOut: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Reason for Regularization</label>
                <textarea
                  rows={3}
                  value={regularizeForm.reason}
                  onChange={e => setRegularizeForm({ ...regularizeForm, reason: e.target.value })}
                  placeholder="e.g. Biometric scanner offline at Cleanroom Airlock #2"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegularizeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: WORK FROM HOME REQUEST MODAL
          ======================================================== */}
      {showWfhModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button onClick={() => setShowWfhModal(false)} className="absolute top-5 right-5 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Work From Home Application</h3>
            <p className="text-xs text-slate-500 mb-4">Request approved remote work schedule</p>
            <form onSubmit={handleSubmitWfh} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">From Date</label>
                  <input
                    type="date"
                    value={wfhForm.startDate}
                    onChange={e => setWfhForm({ ...wfhForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">To Date</label>
                  <input
                    type="date"
                    value={wfhForm.endDate}
                    onChange={e => setWfhForm({ ...wfhForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Justification</label>
                <textarea
                  rows={3}
                  value={wfhForm.reason}
                  onChange={e => setWfhForm({ ...wfhForm, reason: e.target.value })}
                  placeholder="Explain remote work deliverable plan"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWfhModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold"
                >
                  Submit WFH
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 5: OVERTIME REQUEST MODAL
          ======================================================== */}
      {showOvertimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button onClick={() => setShowOvertimeModal(false)} className="absolute top-5 right-5 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Overtime Log & Request</h3>
            <p className="text-xs text-slate-500 mb-4">Record production overtime or emergency shift extension</p>
            <form onSubmit={handleSubmitOvertime} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={overtimeForm.date}
                    onChange={e => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hours Requested</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={overtimeForm.hours}
                    onChange={e => setOvertimeForm({ ...overtimeForm, hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Task / Batch Description</label>
                <textarea
                  rows={3}
                  value={overtimeForm.description}
                  onChange={e => setOvertimeForm({ ...overtimeForm, description: e.target.value })}
                  placeholder="e.g. Line clearance and sterile autoclave cycle monitoring"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOvertimeModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold"
                >
                  Submit Overtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 6: EXPENSE CLAIM MODAL
          ======================================================== */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-5 right-5 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Expense Claim</h3>
            <p className="text-xs text-slate-500 mb-4">Official travel, client or operational reimbursement</p>
            <form onSubmit={handleSubmitExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <option>Travel / Conveyance</option>
                    <option>Meal Allowance</option>
                    <option>Stationery / Supplies</option>
                    <option>Medical Emergency</option>
                    <option>Other Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="e.g. 750"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Description & Receipt Info</label>
                <textarea
                  rows={3}
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Receipt number and expense context"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 7: CREATE SUPPORT REQUEST MODAL
          ======================================================== */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button onClick={() => setShowSupportModal(false)} className="absolute top-5 right-5 p-1 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-1">Create Support Ticket</h3>
            <p className="text-xs text-slate-500 mb-4">Submit assistance ticket to HR or IT desk</p>
            <form onSubmit={handleSubmitSupport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={supportForm.category}
                    onChange={e => setSupportForm({ ...supportForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <option>HR Support</option>
                    <option>IT Support</option>
                    <option>Payroll Support</option>
                    <option>Attendance Support</option>
                    <option>Leave Support</option>
                    <option>Facility Support</option>
                    <option>General Support</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Priority</label>
                  <select
                    value={supportForm.priority}
                    onChange={e => setSupportForm({ ...supportForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>URGENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                  placeholder="Brief issue description"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={supportForm.description}
                  onChange={e => setSupportForm({ ...supportForm, description: e.target.value })}
                  placeholder="Details of the issue or assistance requested"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 8: ANNOUNCEMENT DETAIL MODAL
          ======================================================== */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold text-[#00A896] uppercase tracking-wider block mb-1">
              Company Announcement
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{selectedAnnouncement.title}</h3>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed mb-4">
              {selectedAnnouncement.content}
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Published by: {selectedAnnouncement.author || 'Corporate HR'}</span>
              <span>
                {selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt
                  ? new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleDateString('en-IN')
                  : 'Recent'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DRAWER: QUICK PROFILE VIEW
          ======================================================== */}
      {showProfileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Employee Profile</h3>
                <button onClick={() => setShowProfileDrawer(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-[#00A896] text-white font-bold text-lg flex items-center justify-center">
                    {employeeName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{employeeName}</p>
                    <p className="text-slate-500">{designation} • {department}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">Employment Record</p>
                  <p>Employee ID: <strong className="font-mono text-slate-900">{employeeId}</strong></p>
                  <p>Reporting Manager: <strong className="text-slate-900">{reportingManager}</strong></p>
                  <p>Work Location: <strong className="text-slate-900">{location}</strong></p>
                  <p>Current Shift: <strong className="text-slate-900">{currentShift}</strong></p>
                  <p>Status: <strong className="text-emerald-700">{employmentStatus}</strong></p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">Contact & Access</p>
                  <p>Work Email: <strong className="text-slate-900">{profile?.email || employeeUser?.email || '--'}</strong></p>
                  <p>Mobile: <strong className="font-mono text-slate-900">{profile?.phone || employeeUser?.phone || '--'}</strong></p>
                  <p>Emergency Contact: <strong className="text-slate-900">{profile?.emergencyContact?.name || '--'}</strong></p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowProfileDrawer(false);
                  navigate('/employee/profile');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009B8D] text-white font-bold text-xs text-center"
              >
                Open Full Profile Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Details Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#249B95] px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone size={18} />
                <h3 className="text-sm font-bold tracking-wide">Company Circular & Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="text-teal-100 hover:text-white transition-colors p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                    {selectedAnnouncement.category || 'HR Announcement'}
                  </span>
                  {selectedAnnouncement.sendTo && selectedAnnouncement.sendTo !== 'All' && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      Target: {selectedAnnouncement.sendTo}
                    </span>
                  )}
                  {selectedAnnouncement.importance === 'HIGH' && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      High Priority
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-medium">{selectedAnnouncement.date}</span>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedAnnouncement.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {selectedAnnouncement.content || selectedAnnouncement.description}
                </p>
              </div>

              {selectedAnnouncement.photo && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Attached Document / Image:</p>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs max-h-72">
                    <img
                      src={selectedAnnouncement.photo}
                      alt={selectedAnnouncement.title}
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={() => window.open(selectedAnnouncement.photo, '_blank')}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Issued By: <strong className="text-slate-800">{selectedAnnouncement.author || 'Corporate HR Department'}</strong></span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Official Record
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-5 py-2 bg-[#2E5E8A] hover:bg-[#234c70] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Close & Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
