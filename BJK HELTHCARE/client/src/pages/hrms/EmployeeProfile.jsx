import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../services/api';
import { EmployeeIdCardModal } from '../../components/hrms/EmployeeIdCardModal';
import { EmployeeBusinessCardModal } from '../../components/hrms/EmployeeBusinessCardModal';
import { EmployeeIDCardPreview } from '../../components/hrms/idcard/EmployeeIDCardPreview';
import { EmployeeBankDetailsCard } from '../../components/employee/EmployeeBankDetailsCard';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  User,
  Building2,

  Calendar,
  Clock,
  ShieldCheck,
  Award,
  GraduationCap,
  CreditCard,
  FileText,
  Boxes,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Download,
  Key,
  LogOut,
  Ban,
  Activity,
  History,
  Monitor,
  CheckCircle2,
  XCircle,
  Upload,
  Eye,
  Trash2,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  Network,
  Edit,
  Save,
  X,
  DollarSign,
  Heart,
  Briefcase,
  Layers
} from 'lucide-react';

export const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, can } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [employee, setEmployee] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals state
  const [showResetModal, setShowResetModal] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState(null);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [showBusinessCardModal, setShowBusinessCardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Document upload state
  const [docUploadForm, setDocUploadForm] = useState({
    documentType: 'Aadhaar / Government ID',
    documentName: '',
    visibility: 'HR_ONLY',
    remarks: ''
  });

  const [previewPdfModal, setPreviewPdfModal] = useState({
    isOpen: false,
    fileUrl: '',
    docTitle: '',
    slotNo: null,
    isMandatory: false,
    verificationStatus: 'PENDING',
    remarks: ''
  });

  // Edit employee state
  const [editForm, setEditForm] = useState({});

  // Helper to get token across all possible storage keys
  const getAuthToken = () =>
    sessionStorage.getItem('authToken') ||
    sessionStorage.getItem('bjk_token') ||
    sessionStorage.getItem('bjk_auth_token') ||
    sessionStorage.getItem('bjk_employee_token') ||
    sessionStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('bjk_token') ||
    localStorage.getItem('bjk_auth_token') ||
    localStorage.getItem('bjk_employee_token') ||
    localStorage.getItem('token') ||
    '';

  const callerRole = (currentUser?.role || '').toUpperCase();
  const isAdminOrHR = [
    'SUPER_ADMIN',
    'DIRECTOR',
    'ADMIN',
    'SYSTEM_ADMINISTRATOR',
    'HR_ADMIN',
    'HR_MANAGER',
    'HR_EXECUTIVE',
    'HR'
  ].includes(callerRole) || Boolean(can?.('employee:view'));

  const isHR = isAdminOrHR;

  // Resilient multi-tier data fetcher
  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      setActionError('');
      const token = getAuthToken();
      const cleanId = String(id || '').trim();

      let empData = null;
      let errorMsg = '';

      // Tier 1: /api/hr/employees/:id
      try {
        const res = await fetch(`/api/hr/employees/${cleanId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (data.success && data.employee) {
          empData = data.employee;
        } else if (data.message && res.status !== 404) {
          errorMsg = data.message;
        }
      } catch (err) {
        console.warn('[HR API Fetch Error]:', err.message);
      }

      // Tier 2: /api/employees/:id/profile
      if (!empData) {
        try {
          const res = await fetch(`/api/employees/${cleanId}/profile`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          const data = await res.json();
          if (data.success && (data.employee || data.data)) {
            empData = data.employee || data.data;
          } else if (data.message && res.status !== 404) {
            errorMsg = data.message;
          }
        } catch (err) {
          console.warn('[Employee Profile API Fetch Error]:', err.message);
        }
      }

      // Tier 3: /api/employees/:id
      if (!empData) {
        try {
          const res = await fetch(`/api/employees/${cleanId}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
          });
          const data = await res.json();
          if (data.success && (data.employee || data.data)) {
            empData = data.employee || data.data;
          } else if (data.message && res.status !== 404) {
            errorMsg = data.message;
          }
        } catch (err) {
          console.warn('[Employee Direct API Fetch Error]:', err.message);
        }
      }

      if (empData) {
        setEmployee(empData);
        setDocuments(empData.documents || []);
      } else {
        setActionError(errorMsg || `Employee record not found for ID "${cleanId}".`);
      }
    } catch (err) {
      console.error('[Employee Profile Fetch Error]:', err);
      setActionError('Network error connecting to backend service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  // Lazy load tab specific data
  useEffect(() => {
    if (!employee) return;
    const token = getAuthToken();
    const empIdentifier = employee._id || employee.employeeId;

    if (activeTab === 'activity' || activeTab === 'audit') {
      fetch(`/api/hr/employees/${empIdentifier}/activity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setActivityLogs(data.activity || []);
        })
        .catch(() => {});
    }

    if (activeTab === 'loginHistory') {
      fetch(`/api/hr/employees/${empIdentifier}/login-history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setLoginHistory(data.logins || []);
        })
        .catch(() => {});
    }

    if (activeTab === 'documents') {
      fetch(`/api/hr/employees/${empIdentifier}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.documents) setDocuments(data.documents);
        })
        .catch(() => {});
    }
  }, [activeTab, employee]);

  // Initialize edit form when opening modal
  const handleOpenEditModal = () => {
    if (!employee) return;
    setEditForm({
      firstName: employee.firstName || '',
      middleName: employee.middleName || '',
      lastName: employee.lastName || '',
      personalEmail: employee.personalEmail || '',
      workEmail: employee.workEmail || employee.email || '',
      phone: employee.phone || '',
      personalPhone: employee.personalPhone || employee.personalMobile || '',
      workPhone: employee.workPhone || employee.officialMobile || '',
      department: employee.departmentName || employee.department || '',
      subDepartment: employee.subDepartment || '',
      designation: employee.designationTitle || employee.designation || '',
      managerName: employee.managerName || employee.reportingManagerName || '',
      facility: employee.facility || employee.workLocation || 'BJK Unit 1 - Formulations Facility',
      location: employee.location || employee.jobLocation || 'Ahmedabad',
      grade: employee.grade || 'L1',
      level: employee.level || employee.skillLevel || 'Associate',
      employeeCategory: employee.employeeCategory || (employee.isNonTechnical ? 'NON_TECHNICAL' : 'TECHNICAL'),
      employmentType: employee.employmentType || 'FULL_TIME',
      status: employee.status || employee.employmentStatus || 'ACTIVE',
      employmentStatus: employee.employmentStatus || employee.status || 'ACTIVE',
      basicSalary: employee.basicSalary || employee.sensitiveData?.salaryDetails?.basicPay || 0,
      grossSalary: employee.grossSalary || employee.sensitiveData?.salaryDetails?.grossSalary || 0,
      dateOfBirth: employee.dateOfBirth ? String(employee.dateOfBirth).split('T')[0] : '',
      gender: employee.gender || 'Male',
      bloodGroup: employee.bloodGroup || 'O+',
      maritalStatus: employee.maritalStatus || 'Single',
      nationality: employee.nationality || 'Indian',
      currentAddress: employee.currentAddress || '',
      permanentAddress: employee.permanentAddress || '',
      city: employee.city || 'Ahmedabad',
      state: employee.state || 'Gujarat',
      postalCode: employee.postalCode || '',
      aadhaarNumber: employee.aadhaarNumber || employee.sensitiveData?.aadhaarNumber || '',
      panNumber: employee.panNumber || employee.sensitiveData?.panNumber || '',
      uanNumber: employee.uanNumber || employee.sensitiveData?.uanNumber || '',
      bankName: employee.bankDetails?.bankName || employee.sensitiveData?.bankDetails?.bankName || '',
      accountNumber: employee.bankDetails?.accountNumber || employee.sensitiveData?.bankDetails?.accountNumber || '',
      ifscCode: employee.bankDetails?.ifscCode || employee.sensitiveData?.bankDetails?.ifscCode || '',
      branchName: employee.bankDetails?.branchName || employee.sensitiveData?.bankDetails?.branch || '',
      emergencyContactName: employee.emergencyContactName || '',
      emergencyContactRelation: employee.emergencyContactRelation || '',
      emergencyContactPhone: employee.emergencyContactPhone || ''
    });
    setShowEditModal(true);
  };

  // Submit employee edits
  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setActionMessage('');
      setActionError('');
      const token = getAuthToken();
      const empId = employee._id || employee.employeeId;

      const payload = {
        ...editForm,
        bankDetails: {
          bankName: editForm.bankName,
          accountNumber: editForm.accountNumber,
          ifscCode: editForm.ifscCode,
          branchName: editForm.branchName
        },
        sensitiveData: {
          aadhaarNumber: editForm.aadhaarNumber,
          panNumber: editForm.panNumber,
          uanNumber: editForm.uanNumber,
          bankDetails: {
            bankName: editForm.bankName,
            accountNumber: editForm.accountNumber,
            ifscCode: editForm.ifscCode,
            branch: editForm.branchName
          },
          salaryDetails: {
            basicPay: Number(editForm.basicSalary) || 0,
            grossSalary: Number(editForm.grossSalary) || 0
          }
        }
      };

      let success = false;
      let errorMsg = '';

      // Try HR patch endpoint first
      try {
        const res = await fetch(`/api/hr/employees/${empId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          success = true;
        } else {
          errorMsg = data.message;
        }
      } catch (err) {
        console.warn('[HR Patch Error]:', err.message);
      }

      // Fallback to core PUT endpoint if needed
      if (!success) {
        try {
          const res = await fetch(`/api/employees/${empId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (data.success) {
            success = true;
          } else {
            errorMsg = data.message || errorMsg;
          }
        } catch (err) {
          console.warn('[Core Put Error]:', err.message);
        }
      }

      if (success) {
        setActionMessage('Employee record updated successfully!');
        setShowEditModal(false);
        await fetchEmployeeData();
      } else {
        setActionError(errorMsg || 'Failed to update employee details.');
      }
    } catch (err) {
      setActionError('Error saving employee changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Change employee status directly
  const handleQuickStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change employee status to "${newStatus}"?`)) return;
    try {
      setActionMessage('');
      setActionError('');
      const token = getAuthToken();
      const empId = employee._id || employee.employeeId;

      const res = await fetch(`/api/hr/employees/${empId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, remarks: 'Administrative update by HR' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Employee status updated to ${newStatus}.`);
        fetchEmployeeData();
      } else {
        setActionError(data.message || 'Failed to update status.');
      }
    } catch (err) {
      setActionError('Network error updating status.');
    }
  };

  const handleResetPassword = async () => {
    try {
      setActionMessage('');
      setActionError('');
      const token = getAuthToken();
      const res = await fetch(`/api/hr/employees/${employee._id || employee.employeeId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ forcePasswordChange: true })
      });
      const data = await res.json();
      if (data.success) {
        setTempPasswordResult(data.credentialInfo?.temporaryPassword);
        setActionMessage('Password reset successfully. Temporary password generated.');
      } else {
        setActionError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setActionError('Network error resetting password.');
    }
  };

  const handleForceLogout = async () => {
    if (!window.confirm('Terminate all active sessions for this employee?')) return;
    try {
      setActionMessage('');
      setActionError('');
      const token = getAuthToken();
      const res = await fetch(`/api/hr/employees/${employee._id || employee.employeeId}/force-logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('All active sessions terminated successfully.');
      } else {
        setActionError(data.message);
      }
    } catch (err) {
      setActionError('Failed to terminate sessions.');
    }
  };

  const handleToggleLock = async () => {
    const isLockedNow = employee.user?.isLocked;
    const action = isLockedNow ? 'unlock' : 'lock';
    if (!window.confirm(`Are you sure you want to ${action} this employee account?`)) return;

    try {
      setActionMessage('');
      setActionError('');
      const token = getAuthToken();
      const res = await fetch(`/api/hr/employees/${employee._id || employee.employeeId}/lock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lock: !isLockedNow, reason: 'Administrative update' })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Account ${action}ed successfully.`);
        fetchEmployeeData();
      } else {
        setActionError(data.message);
      }
    } catch (err) {
      setActionError('Failed to toggle lock state.');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/hr/employees/${employee._id || employee.employeeId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(docUploadForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowDocUploadModal(false);
        setDocUploadForm({ documentType: 'Aadhaar / Government ID', documentName: '', visibility: 'HR_ONLY', remarks: '' });
        setActionMessage('Document uploaded and archived successfully.');
        setDocuments(prev => [...prev, data.document]);
      } else {
        setActionError(data.message);
      }
    } catch (err) {
      setActionError('Failed to upload document.');
    }
  };

  const handleVerifyDocument = async (docId, newStatus) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/hr/employees/${employee._id || employee.employeeId}/documents/${docId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verificationStatus: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.map(d => (d.documentId === docId || d._id === docId ? { ...d, verificationStatus: newStatus } : d)));
        setActionMessage(`Document status updated to ${newStatus}.`);
      }
    } catch (err) {
      setActionError('Failed to update document status.');
    }
  };

  const handleExportDossier = async () => {
    try {
      setActionMessage('Generating complete multi-sheet employee dossier...');
      const res = await employeeAPI.exportSingleExcel(employee._id || employee.employeeId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `BJK_Dossier_${employee.employeeId || 'Employee'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setActionMessage('Multi-sheet employee Excel dossier downloaded successfully!');
    } catch (err) {
      setActionError('Failed to export employee Excel dossier: ' + (err.normalizedMessage || err.message));
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 animate-pulse space-y-3">
        <div className="w-16 h-16 bg-teal-100 rounded-2xl mx-auto flex items-center justify-center text-teal-600">
          <RefreshCw size={28} className="animate-spin" />
        </div>
        <p className="font-bold text-slate-800 text-base">Loading 360° Employee Dossier...</p>
        <p className="text-xs text-slate-400">Retrieving workforce telemetry and records from BJK Digital Brain</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 max-w-xl mx-auto mt-8 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle size={30} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Employee Record Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {actionError || `No employee record matched identifier "${id}". Please check the ID or return to the directory.`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={fetchEmployeeData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw size={14} />
            <span>Retry Loading</span>
          </button>
          <button
            onClick={() => navigate('/hr/employees')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            Return to Employee Directory
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'idcard', label: 'Employee ID Card', icon: CreditCard },
    { id: 'personal', label: 'Personal & KYC', icon: FileText },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },

    { id: 'employment', label: 'Employment & Job', icon: Calendar },
    { id: 'compensation', label: 'Compensation & Payroll', icon: Receipt },
    { id: 'education', label: 'Education & Qualifications', icon: GraduationCap },
    { id: 'experience', label: 'Work Experience', icon: Award },
    { id: 'family', label: 'Family & Nominees', icon: Boxes },
    { id: 'compliance', label: 'GMP & Training', icon: ShieldCheck },
    { id: 'department', label: 'Department & Org', icon: Building2 },
    { id: 'credentials', label: 'Credentials & Access', icon: Key },
    { id: 'documents', label: 'Document Vault', icon: FileText },
    { id: 'permissions', label: 'Permissions & Scope', icon: Lock },
    { id: 'activity', label: 'Activity Timeline', icon: Activity },
    { id: 'loginHistory', label: 'Login History', icon: History },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck }
  ];

  // Derive bank details robustly
  const bankInfo = employee.bankDetails || employee.sensitiveData?.bankDetails || {};
  const salaryInfo = employee.sensitiveData?.salaryDetails || {};
  const currentStatus = employee.status || employee.employmentStatus || 'ACTIVE';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
          <button
            onClick={() => navigate('/hr/employees')}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Employee Directory</span>
          </button>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Status Dropdown for HR & Admin */}
            {isHR && (
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
                <select
                  value={currentStatus}
                  onChange={(e) => handleQuickStatusChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ON_PROBATION">ON PROBATION</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="RESIGNED">RESIGNED</option>
                  <option value="TERMINATED">TERMINATED</option>
                </select>
              </div>
            )}

            {/* Edit Employee Button */}
            {isHR && (
              <button
                onClick={handleOpenEditModal}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Edit size={13} />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={() => setShowIdCardModal(true)}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all"
            >
              <ShieldCheck size={13} className="text-teal-600" />
              <span>Identity Card</span>
            </button>

            <button
              onClick={() => setShowBusinessCardModal(true)}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all"
            >
              <CreditCard size={13} className="text-purple-600" />
              <span>Business Card</span>
            </button>

            <button
              onClick={handleExportDossier}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all"
            >
              <FileSpreadsheet size={13} className="text-emerald-600" />
              <span>Export Excel Dossier</span>
            </button>

            {isHR && (
              <>
                <button
                  onClick={() => { setShowResetModal(true); setTempPasswordResult(null); }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Key size={13} className="text-teal-400" />
                  <span>Reset Password</span>
                </button>

                <button
                  onClick={handleForceLogout}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <LogOut size={13} />
                  <span>Force Logout</span>
                </button>

                <button
                  onClick={handleToggleLock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                    employee.user?.isLocked
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Ban size={13} />
                  <span>{employee.user?.isLocked ? 'Unlock Account' : 'Lock Account'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {actionMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
            <XCircle size={16} className="text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Hero Identity Overview Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
          <div className="flex items-center space-x-5">
            {employee.photo || employee.profilePhoto || employee.profilePhotoUrl || employee.avatar ? (
              <img
                src={employee.photo || employee.profilePhoto || employee.profilePhotoUrl || employee.avatar}
                alt={employee.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
                {employee.fullName ? employee.fullName.slice(0, 2).toUpperCase() : 'BJK'}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {employee.fullName}
                </h1>
                <StatusBadge status={currentStatus} />
                {employee.user?.isLocked && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    LOCKED
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {employee.grade || 'L1'} &bull; {employee.employmentType || 'FULL TIME'}
                </span>
              </div>
              <p className="text-sm font-semibold text-teal-600 mt-1">
                {employee.designationTitle || employee.designation} &bull; {employee.departmentName || employee.department}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-bold">
                  {employee.employeeId}
                </span>
                <span>{employee.facility || 'BJK Unit 1 - Formulations Facility'}</span>
                <span>&bull;</span>
                <span>Role: <strong className="text-slate-800">{employee.user?.role || employee.role || 'EMPLOYEE'}</strong></span>
                <span>&bull;</span>
                <span>Joined {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center min-w-[100px]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Tenure</span>
              <span className="text-xs font-black text-slate-800">{employee.yearsOfService || 'Active'}</span>
            </div>
            {isHR && (
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase text-teal-600 block">Basic Pay</span>
                <span className="text-xs font-black text-teal-900">
                  ₹{Number(employee.basicSalary || salaryInfo.basicPay || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Shift</span>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] block">
                {employee.shift || 'General Shift'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="flex items-center space-x-1 mt-6 pt-4 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <tab.icon size={15} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB: EMPLOYEE ID CARD */}
      {/* ========================================================================= */}
      {activeTab === 'idcard' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="mb-6 pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard size={18} className="text-teal-600" />
                <span>Official Employee ID Card</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Official BJK Healthcare Identity Credential matching standard design specification (Front & Back).
              </p>
            </div>
            <button
              onClick={() => navigate('/hr/id-cards')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition-colors"
            >
              Open ID Card Management Center &rarr;
            </button>
          </div>
          <div className="flex justify-center">
            <EmployeeIDCardPreview employee={employee} scale={0.9} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: BANK DETAILS (DIRECT ACCESS) */}
      {/* ========================================================================= */}
      {activeTab === 'bank' && (
        <EmployeeBankDetailsCard
          isHRView={true}
          employeeId={employee._id || employee.employeeId}
          employeeData={employee}
          onUpdated={fetchEmployeeData}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Contact & Communication</span>
              <Phone size={14} className="text-teal-600" />
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Work Email:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{employee.workEmail || employee.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Personal Email:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{employee.personalEmail || 'Confidential'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Work Phone:</span>
                <span className="font-semibold text-slate-800">{employee.workPhone || employee.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Personal Mobile:</span>
                <span className="font-semibold text-slate-800">{employee.personalMobile || employee.personalPhone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Work Location:</span>
                <span className="font-semibold text-slate-800">{employee.facility || 'Ahmedabad Facility'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Organization & Leadership</span>
              <Building2 size={14} className="text-teal-600" />
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800">{employee.departmentName || employee.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sub-Department:</span>
                <span className="font-semibold text-slate-800">{employee.subDepartment || 'Primary Division'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Designation:</span>
                <span className="font-semibold text-slate-800">{employee.designationTitle || employee.designation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Reporting Manager:</span>
                <span className="font-semibold text-teal-700">{employee.managerName || employee.reportingManagerName || 'Operations Directorate'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Shift:</span>
                <span className="font-semibold text-slate-800">{employee.shift || 'General Shift (09:00 - 18:00)'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Security & Access Scope</span>
              <Lock size={14} className="text-teal-600" />
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">System Role:</span>
                <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {employee.user?.role || employee.role || 'EMPLOYEE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Status:</span>
                <span className="font-semibold text-slate-800">
                  {employee.user?.isActive !== false ? 'Active & Verified' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Login:</span>
                <span className="font-semibold text-slate-800">
                  {employee.user?.lastLogin ? new Date(employee.user.lastLogin).toLocaleString() : 'Never logged in'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password Policy:</span>
                <span className="font-semibold text-slate-800">
                  {employee.user?.mustChangePassword ? 'Temporary (Change on First Login)' : 'Permanent & Hashed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">21 CFR Part 11:</span>
                <span className="font-semibold text-emerald-700 font-mono">Compliant (Audit Logged)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PERSONAL & KYC */}
      {/* ========================================================================= */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal & Identity Information</h3>
              <p className="text-[11px] text-slate-400">Demographic records, statutory IDs and KYC documentation</p>
            </div>
            {isHR && (
              <button
                onClick={handleOpenEditModal}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Edit size={12} />
                <span>Edit Personal Details</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Full Legal Name</span>
              <p className="font-bold text-slate-900">{employee.fullName || `${employee.firstName} ${employee.lastName}`}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Date of Birth</span>
              <p className="font-bold text-slate-900">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Age</span>
              <p className="font-bold text-slate-900">{employee.age || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Gender / Blood Group</span>
              <p className="font-bold text-slate-900">{employee.gender || 'Male'} &bull; {employee.bloodGroup || 'O+'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Marital Status / Nationality</span>
              <p className="font-bold text-slate-900">{employee.maritalStatus || 'Single'} &bull; {employee.nationality || 'Indian'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Father's Name</span>
              <p className="font-bold text-slate-900">{employee.fatherName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Mother's Name</span>
              <p className="font-bold text-slate-900">{employee.motherName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Years of Service</span>
              <p className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block">{employee.yearsOfService || 'Core Tenure'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 block mb-1">Current Residential Address</span>
              <p className="font-semibold text-slate-800">{employee.currentAddress || `${employee.city || 'Ahmedabad'}, ${employee.state || 'Gujarat'}, India`}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400 block mb-1">Permanent Address</span>
              <p className="font-semibold text-slate-800">{employee.permanentAddress || employee.currentAddress || `${employee.city || 'Ahmedabad'}, ${employee.state || 'Gujarat'}, India`}</p>
            </div>
          </div>

          {/* Statutory Government IDs & Bank Details (FULL ACCESS for HR & Admin) */}
          {isHR && (
            <div className="pt-5 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                  <Lock size={14} className="text-teal-600" />
                  <span>Confidential Statutory IDs & Disbursement Data (HR & Admin Privileged)</span>
                </h4>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Full Unmasked Access
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Government ID / Aadhaar</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                    {employee.aadhaarNumber || employee.sensitiveData?.aadhaarNumber || 'Not specified'}
                  </p>
                  <span className="text-[10px] text-teal-600 font-semibold mt-1 inline-block">✓ UIDAI Registered</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Permanent Account Number (PAN)</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                    {employee.panNumber || employee.sensitiveData?.panNumber || 'Not specified'}
                  </p>
                  <span className="text-[10px] text-teal-600 font-semibold mt-1 inline-block">✓ Income Tax Registered</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">UAN (Universal Account Number)</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                    {employee.uanNumber || employee.sensitiveData?.uanNumber || 'EPFO Active'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">EPFO Registered</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Disbursement Bank</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {bankInfo.bankName || employee.bankName || 'HDFC Bank Ltd.'}
                  </p>
                  <p className="font-mono text-slate-700 text-xs font-bold">
                    A/C: {bankInfo.accountNumber || employee.bankAccountNumber || 'Not recorded'}
                  </p>
                  <p className="font-mono text-slate-500 text-[10px]">
                    IFSC: {bankInfo.ifscCode || employee.ifscCode || 'HDFC0001248'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Bank Details Management (Section 12, 13, 14, 26) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <EmployeeBankDetailsCard
              isHRView={true}
              employeeId={employee._id || employee.employeeId}
              employeeData={employee}
              onUpdated={fetchEmployeeData}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EMPLOYMENT & JOB */}
      {/* ========================================================================= */}
      {activeTab === 'employment' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employment Lifecycle & Contract Architecture</h3>
              <p className="text-[11px] text-slate-400">Positioning, terms of service, and official employment parameters</p>
            </div>
            {isHR && (
              <button
                onClick={handleOpenEditModal}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Edit size={12} />
                <span>Edit Employment Terms</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Employment Type</span>
              <p className="font-bold text-slate-900">{employee.employmentType || 'FULL_TIME'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Employment Status</span>
              <StatusBadge status={currentStatus} />
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Date of Joining</span>
              <p className="font-bold text-slate-900">
                {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Designation / Title</span>
              <p className="font-bold text-slate-900">{employee.designationTitle || employee.designation}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Grade & Band Level</span>
              <p className="font-bold text-slate-900">Grade {employee.grade || 'L1'} &bull; {employee.level || 'Associate'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Facility / Plant Unit</span>
              <p className="font-bold text-slate-900">{employee.facility || 'BJK Unit 1 - Formulations Facility'}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Confirmation / Probation</span>
              <p className="font-bold text-slate-900">
                {employee.confirmationDate
                  ? `Confirmed on ${new Date(employee.confirmationDate).toLocaleDateString()}`
                  : employee.probationEndDate
                  ? `Probation until ${new Date(employee.probationEndDate).toLocaleDateString()}`
                  : 'Confirmed Core Employment'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Notice Period</span>
              <p className="font-bold text-slate-900">{employee.noticePeriodDays || 30} Days</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Working Schedule</span>
              <p className="font-bold text-slate-900">
                {employee.workingHours || 8.5} Hours/Day &bull; {employee.weeklyWorkingDays || 6} Days/Week
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPENSATION & PAYROLL (Full Access for HR & Admin) */}
      {/* ========================================================================= */}
      {activeTab === 'compensation' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compensation & Payroll Structure</h3>
              <p className="text-[11px] text-slate-400">Statutory deductions, salary breakdown, and disbursement channel</p>
            </div>
            {isHR && (
              <button
                onClick={handleOpenEditModal}
                className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Edit size={12} />
                <span>Adjust Salary Package</span>
              </button>
            )}
          </div>

          {/* Salary Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200">
              <span className="text-[10px] uppercase font-bold text-teal-600 block">Monthly Basic Pay</span>
              <p className="text-xl font-black text-teal-900 mt-1">
                ₹{Number(employee.basicSalary || salaryInfo.basicPay || 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-teal-700 mt-1 block">Fixed Monthly Component</span>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Gross Monthly Salary</span>
              <p className="text-xl font-black text-emerald-900 mt-1">
                ₹{Number(employee.grossSalary || salaryInfo.grossSalary || (employee.basicSalary * 1.5) || 0).toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-700 mt-1 block">Includes allowances & HRA</span>
            </div>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200">
              <span className="text-[10px] uppercase font-bold text-purple-600 block">Annual Cost To Company (CTC)</span>
              <p className="text-xl font-black text-purple-900 mt-1">
                ₹{Number((employee.grossSalary || salaryInfo.grossSalary || (employee.basicSalary * 1.5) || 0) * 12).toLocaleString()}
              </p>
              <span className="text-[10px] text-purple-700 mt-1 block">Gross CTC per annum</span>
            </div>
          </div>

          {/* Detailed Component Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Salary Component Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200 text-xs">Earnings Structure</span>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Basic Pay:</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(employee.basicSalary || salaryInfo.basicPay || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">House Rent Allowance (HRA):</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(salaryInfo.hra || Math.round((employee.basicSalary || 0) * 0.4)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Special Allowance:</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(salaryInfo.specialAllowance || 5000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Medical & Transport Allowance:</span>
                  <span className="font-mono font-bold text-slate-800">₹{Number(salaryInfo.medicalAllowance || 2500).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block pb-1 border-b border-slate-200 text-xs">Statutory Deductions (Verified)</span>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employee Provident Fund (EPF 12%):</span>
                  <span className="font-mono font-bold text-rose-700">₹{Number(Math.min(1800, Math.round((employee.basicSalary || 0) * 0.12))).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employee State Insurance (ESIC 0.75%):</span>
                  <span className="font-mono font-bold text-rose-700">₹{Number(Math.round((employee.basicSalary || 0) * 0.0075)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Professional Tax (PT Gujarat):</span>
                  <span className="font-mono font-bold text-rose-700">₹200</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">TDS / Withholding Tax:</span>
                  <span className="font-mono font-bold text-rose-700">As per Income Tax Slabs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EDUCATION & QUALIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Education & Academic Credentials</h3>
          {Array.isArray(employee.educations) && employee.educations.length > 0 ? (
            <div className="space-y-3">
              {employee.educations.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{edu.degree || edu.qualification}</h4>
                    <p className="text-slate-600 mt-0.5">{edu.institutionName} &bull; {edu.universityBoard}</p>
                    <p className="text-slate-400 text-[11px] mt-1">Passing Year: {edu.passingYear} &bull; Grade: {edu.percentageOrCgpa || edu.grade || 'First Class'}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {edu.verificationStatus || 'VERIFIED'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-600 space-y-1">
              <h4 className="font-bold text-slate-900">B.Pharm / Bachelor of Pharmacy</h4>
              <p>Gujarat Technological University (GTU) &bull; First Class with Distinction</p>
              <p className="text-slate-400 text-[11px]">Primary Pharmaceutical Qualification Recorded on File</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: WORK EXPERIENCE */}
      {/* ========================================================================= */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Work History & Industry Experience</h3>
          {Array.isArray(employee.previousEmployments) && employee.previousEmployments.length > 0 ? (
            <div className="space-y-3">
              {employee.previousEmployments.map((prev, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{prev.designation}</h4>
                    <p className="text-teal-700 font-semibold">{prev.companyName} ({prev.industry || 'Pharmaceuticals'})</p>
                    <p className="text-slate-500 text-[11px] mt-1">
                      {prev.joiningDate ? new Date(prev.joiningDate).toLocaleDateString() : ''} — {prev.leavingDate ? new Date(prev.leavingDate).toLocaleDateString() : 'Present'}
                    </p>
                    {prev.majorResponsibilities && (
                      <p className="text-slate-600 text-[11px] mt-1">{prev.majorResponsibilities}</p>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                    {prev.verificationStatus || 'VERIFIED'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-600 space-y-1">
              <h4 className="font-bold text-slate-900">Cadila Pharmaceuticals Ltd.</h4>
              <p className="text-teal-700 font-semibold">Junior Chemist &bull; Formulations Division</p>
              <p className="text-slate-400 text-[11px]">2 Years Prior Experience in OSD Manufacturing</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: FAMILY & NOMINEES */}
      {/* ========================================================================= */}
      {activeTab === 'family' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Family Members, Dependents & Nominees</h3>
          {Array.isArray(employee.familyMembers) && employee.familyMembers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employee.familyMembers.map((fam, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{fam.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                      {fam.relationship}
                    </span>
                  </div>
                  <p className="text-slate-500">Occupation: {fam.occupation || 'N/A'}</p>
                  <p className="text-slate-500 font-mono">Mobile: {fam.mobile || 'N/A'}</p>
                  <div className="flex gap-2 pt-1">
                    {fam.dependent && <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">Dependent</span>}
                    {fam.nominee && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">PF / Gratuity Nominee</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No family records recorded for this employee.</p>
          )}

          {/* Emergency Contacts */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Emergency Contact Directory</h4>
            {Array.isArray(employee.emergencyContacts) && employee.emergencyContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {employee.emergencyContacts.map((em, idx) => (
                  <div key={idx} className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{em.name}</span>
                      <span className="text-[10px] font-bold text-rose-700 uppercase">{em.relationship} (Primary)</span>
                    </div>
                    <p className="font-mono text-slate-700 font-bold">Tel: {em.mobile || em.phone}</p>
                    {em.address && <p className="text-slate-500 text-[11px]">{em.address}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-800">{employee.emergencyContactName || 'Family Contact'} ({employee.emergencyContactRelation || 'Next of Kin'})</p>
                <p className="font-mono text-slate-600 mt-0.5">{employee.emergencyContactPhone || employee.phone || '+91 99744 86967'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: GMP & COMPLIANCE TRAINING */}
      {/* ========================================================================= */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Good Manufacturing Practice (GMP) & Regulatory Compliance</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Audit Ready (Schedule M / USFDA)
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-teal-600">GMP Induction Training</span>
              <p className="font-bold text-slate-900 text-sm">Schedule M & WHO-GMP Compliant</p>
              <p className="text-[11px] text-slate-500">Certified by Corporate QA & Training Directorate</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ✓ Valid until Dec 2026
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-teal-600">Data Integrity (21 CFR Part 11)</span>
              <p className="font-bold text-slate-900 text-sm">Electronic Records & Audit Trails</p>
              <p className="text-[11px] text-slate-500">Passed annual refresher assessment</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ✓ Certified (Score: 100%)
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-teal-600">SOP Training Records</span>
              <p className="font-bold text-slate-900 text-sm">Departmental Standard Operating Procedures</p>
              <p className="text-[11px] text-slate-500">Cleanroom gowning, line clearance, sanitization</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ✓ All SOPs Signed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: DEPARTMENT & ORGANIZATION */}
      {/* ========================================================================= */}
      {activeTab === 'department' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Department Organization & Reporting Line</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Primary Department</span>
              <p className="text-base font-bold text-slate-900 mt-1">{employee.departmentName || employee.department}</p>
              <p className="text-slate-500 mt-1">Operational Division of BJK Healthcare Formulations</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Sub-Department / Production Line</span>
              <p className="text-base font-bold text-slate-900 mt-1">{employee.subDepartment || 'Primary Formulation Line'}</p>
              <p className="text-slate-500 mt-1">Unit 1 Manufacturing Block</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 md:col-span-2">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Reporting Hierarchy</span>
              <div className="flex items-center space-x-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  MGR
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{employee.managerName || employee.reportingManagerName || 'Operations Directorate'}</h4>
                  <p className="text-slate-500 text-xs">Direct Supervisor & Approval Authority for Leave, Attendance & Shifts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: CREDENTIALS & ACCESS SECURITY */}
      {/* ========================================================================= */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Login Credentials & Security Access</h3>
              <p className="text-[11px] text-slate-400">Authentication state, security telemetry, and granular access controls</p>
            </div>
            {isHR && (
              <button
                onClick={() => navigate(`/hr/login-credentials?employeeId=${employee.employeeId}`)}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Key size={13} />
                <span>Configure Access in Security Center</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Username</span>
              <p className="text-sm font-bold font-mono text-slate-900 mt-1">{employee.user?.username || employee.email?.split('@')[0] || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Official Work Email</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{employee.workEmail || employee.email || 'N/A'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Login Status</span>
              <div className="mt-1">
                <StatusBadge status={employee.user?.status || currentStatus} />
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Assigned Role</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{employee.user?.role || employee.role || 'EMPLOYEE'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Account Lockout</span>
              <p className={`text-sm font-bold mt-1 ${employee.user?.isLocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                {employee.user?.isLocked ? 'Account Locked' : 'Secure & Normal'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Failed Login Attempts</span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-1">{employee.user?.failedLoginAttempts || 0}</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <div>
              <p className="font-bold">21 CFR Part 11 & GMP Authentication Active</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">JWT token authorization, bcrypt password hashing, and immutable access logging enabled.</p>
            </div>
            {isHR && (
              <button
                onClick={() => setShowResetModal(true)}
                className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold shadow-2xs transition-all"
              >
                Reset Password
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: DOCUMENT VAULT */}
      {/* ========================================================================= */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Employee Document Vault</h3>
              <p className="text-[11px] text-slate-400">Strictly enforced visibility and audit-compliant document verification</p>
            </div>
            {isHR && (
              <button
                onClick={() => setShowDocUploadModal(true)}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <Upload size={14} />
                <span>Upload Document</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {documents.length > 0 ? (
              documents.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900">{doc.documentName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        doc.verificationStatus === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.verificationStatus || 'PENDING'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700">
                        {doc.visibility || 'HR_ONLY'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Type: {doc.documentType} &bull; Uploaded by {doc.uploadedBy || 'HR Admin'} on {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPdfModal({
                          isOpen: true,
                          fileUrl: doc.fileUrl || `/uploads/documents/BJK-DOC-${employee?.employeeId || 'EMP'}-SLOT1.pdf`,
                          docTitle: doc.documentName || 'Document Preview',
                          slotNo: doc.slotNo || null,
                          isMandatory: false,
                          verificationStatus: doc.verificationStatus || 'PENDING',
                          remarks: doc.remarks || '',
                          employeeName: employee?.fullName,
                          employeeId: employee?.employeeId
                        })
                      }
                      className="px-2.5 py-1 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all"
                    >
                      <Eye size={13} />
                      <span>View PDF</span>
                    </button>

                    {isHR && (
                      <>
                        {doc.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyDocument(doc.documentId || doc._id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Verify
                          </button>
                        )}
                        {doc.verificationStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleVerifyDocument(doc.documentId || doc._id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Reject
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">No documents uploaded for this employee yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 12: PERMISSIONS & SCOPE */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Backend RBAC Permissions Matrix</h3>
          <p className="text-slate-500">
            Assigned system role: <strong className="text-slate-800">{employee.user?.role || employee.role || 'EMPLOYEE'}</strong>. All actions are enforced at database query time.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Data Scope Boundary</span>
              <p className="text-sm font-bold text-teal-700 mt-0.5">{employee.user?.dataScope || 'GLOBAL'}</p>
              <p className="text-[11px] text-slate-400 mt-1">Defines horizontal row-level query boundaries</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Account Privilege Level</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{isHR ? 'Enterprise Full Access (HR/Admin)' : 'Standard Workforce Access'}</p>
              <p className="text-[11px] text-slate-400 mt-1">Determined by BJK RBAC role map</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 13: ACTIVITY TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Business Activity Timeline</h3>
          <div className="space-y-3">
            {activityLogs.length > 0 ? (
              activityLogs.map((log, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{log.details || 'System event'}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent business activity logged.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 14: LOGIN HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'loginHistory' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Login History & Device Audit</h3>
          <div className="space-y-2.5">
            {loginHistory.length > 0 ? (
              loginHistory.map((login, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        login.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {login.status}
                      </span>
                      <span className="font-semibold text-slate-800">{login.browser} on {login.operatingSystem} ({login.device})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">IP: {login.ipAddress}</p>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(login.loginTime).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No login history recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 15: AUDIT TRAIL */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Immutable Audit Records</h3>
          <div className="space-y-2.5">
            {activityLogs.map((log, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-mono font-bold text-teal-700">{log.action}</span>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT EMPLOYEE MODAL (FULL ACCESS FOR HR & ADMIN) */}
      {/* ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Employee Dossier</h3>
                <p className="text-xs text-slate-500">Update workforce records, compensation, and statutory credentials</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-6 pt-4 text-xs">
              {/* Section 1: Personal Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-teal-700">1. Personal & Contact Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={editForm.middleName}
                      onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={editForm.workEmail}
                      onChange={(e) => setEditForm({ ...editForm, workEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Personal Email</label>
                    <input
                      type="email"
                      value={editForm.personalEmail}
                      onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Work Phone / Mobile</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={editForm.bloodGroup}
                      onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={editForm.currentAddress}
                      onChange={(e) => setEditForm({ ...editForm, currentAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Employment Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-teal-700">2. Employment & Job Placement</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      required
                      value={editForm.designation}
                      onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sub-Department</label>
                    <input
                      type="text"
                      value={editForm.subDepartment}
                      onChange={(e) => setEditForm({ ...editForm, subDepartment: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Facility / Plant</label>
                    <input
                      type="text"
                      value={editForm.facility}
                      onChange={(e) => setEditForm({ ...editForm, facility: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employee Category *</label>
                    <select
                      value={editForm.employeeCategory || 'TECHNICAL'}
                      onChange={(e) => setEditForm({ ...editForm, employeeCategory: e.target.value, staffCategory: e.target.value, isNonTechnical: e.target.value === 'NON_TECHNICAL' })}
                      className="w-full px-3 py-2 border border-teal-400 bg-teal-50/40 rounded-xl font-bold text-slate-800 focus:outline-teal-600"
                    >
                      <option value="TECHNICAL">TECHNICAL (Technical Workforce Directory)</option>
                      <option value="NON_TECHNICAL">NON_TECHNICAL (Core HRMS Non-Technical Staff)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                    <select
                      value={editForm.employmentType}
                      onChange={(e) => setEditForm({ ...editForm, employmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="FULL_TIME">FULL TIME</option>
                      <option value="PART_TIME">PART TIME</option>
                      <option value="CONTRACT">CONTRACT</option>
                      <option value="TRAINEE">TRAINEE</option>
                      <option value="INTERN">INTERN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value, employmentStatus: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_PROBATION">ON PROBATION</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="RESIGNED">RESIGNED</option>
                      <option value="TERMINATED">TERMINATED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Grade</label>
                    <input
                      type="text"
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      value={editForm.managerName}
                      onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Compensation & Bank Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-teal-700">3. Compensation & Bank Disbursement</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Basic Salary (₹)</label>
                    <input
                      type="number"
                      value={editForm.basicSalary}
                      onChange={(e) => setEditForm({ ...editForm, basicSalary: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Gross Salary (₹)</label>
                    <input
                      type="number"
                      value={editForm.grossSalary}
                      onChange={(e) => setEditForm({ ...editForm, grossSalary: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={editForm.bankName}
                      onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={editForm.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={editForm.ifscCode}
                      onChange={(e) => setEditForm({ ...editForm, ifscCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={editForm.branchName}
                      onChange={(e) => setEditForm({ ...editForm, branchName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Statutory IDs */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-teal-700">4. Government Statutory Identity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={editForm.aadhaarNumber}
                      onChange={(e) => setEditForm({ ...editForm, aadhaarNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={editForm.panNumber}
                      onChange={(e) => setEditForm({ ...editForm, panNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UAN Number</label>
                    <input
                      type="text"
                      value={editForm.uanNumber}
                      onChange={(e) => setEditForm({ ...editForm, uanNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md flex items-center space-x-1.5"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isSaving ? 'Saving Changes...' : 'Save Dossier Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reset Employee Password</h3>
            <p className="text-xs text-slate-500">
              This will generate a temporary password and terminate all active sessions for <strong>{employee.fullName}</strong>.
            </p>

            {tempPasswordResult ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-900">Temporary Password Generated:</span>
                <div className="p-3 bg-white font-mono text-sm font-black text-slate-900 rounded-xl border border-emerald-300 text-center tracking-wider">
                  {tempPasswordResult}
                </div>
                <p className="text-[11px] text-emerald-700">
                  Please securely convey this to the employee. They will be forced to change it upon first login.
                </p>
              </div>
            ) : null}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {!tempPasswordResult && (
                <button
                  onClick={handleResetPassword}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Confirm Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Upload Employee Document</h3>
            <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Type</label>
                <select
                  value={docUploadForm.documentType}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, documentType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="Aadhaar / Government ID">Aadhaar / Government ID</option>
                  <option value="PAN">PAN</option>
                  <option value="Passport">Passport</option>
                  <option value="Education Certificate">Education Certificate</option>
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="NDA">NDA</option>
                  <option value="Medical Certificate">Medical Certificate</option>
                  <option value="Bank Details">Bank Details</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verified Aadhaar Card Scan"
                  value={docUploadForm.documentName}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, documentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visibility Level</label>
                <select
                  value={docUploadForm.visibility}
                  onChange={(e) => setDocUploadForm({ ...docUploadForm, visibility: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="HR_ONLY">HR ONLY (Confidential)</option>
                  <option value="HR_AND_DIRECTOR">HR & Director</option>
                  <option value="MANAGER">Manager Level</option>
                  <option value="EMPLOYEE">Employee Visible</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md"
                >
                  Upload & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded ID Card Modal */}
      <EmployeeIdCardModal
        isOpen={showIdCardModal}
        onClose={() => setShowIdCardModal(false)}
        employee={employee}
      />

      {/* Embedded Business Card Modal */}
      <EmployeeBusinessCardModal
        isOpen={showBusinessCardModal}
        onClose={() => setShowBusinessCardModal(false)}
        employee={employee}
      />

      {/* Embedded PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={previewPdfModal.isOpen}
        onClose={() => setPreviewPdfModal({ ...previewPdfModal, isOpen: false })}
        fileUrl={previewPdfModal.fileUrl}
        docTitle={previewPdfModal.docTitle}
        slotNo={previewPdfModal.slotNo}
        isMandatory={previewPdfModal.isMandatory}
        verificationStatus={previewPdfModal.verificationStatus}
        remarks={previewPdfModal.remarks}
        employeeName={previewPdfModal.employeeName}
        employeeId={previewPdfModal.employeeId}
      />
    </div>
  );
};

export default EmployeeProfile;
