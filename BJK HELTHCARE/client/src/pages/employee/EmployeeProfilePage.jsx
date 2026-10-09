import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  ShieldCheck,
  Building,
  HeartHandshake,
  Users,
  Clock,
  IdCard,
  Edit2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Download,
  Share2,
  Printer,
  Camera,
  UploadCloud,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeProfileAPI, employeeCalendarAPI } from '../../services/employeeApi';
import { EmployeePhotoModal } from '../../components/employee/EmployeePhotoModal';
import { EmployeeBankDetailsCard } from '../../components/employee/EmployeeBankDetailsCard';

export const EmployeeProfilePage = () => {
  const navigate = useNavigate();
  const { employeeUser, refreshProfile } = useEmployeeAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || 'personal';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [businessCard, setBusinessCard] = useState(null);
  const [workSchedule, setWorkSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Edit Personal state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    personalEmail: '',
    personalMobile: '',
    alternateMobile: '',
    maritalStatus: 'Single',
    bloodGroup: 'B+'
  });

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const [profRes, cardRes, schRes] = await Promise.all([
        employeeProfileAPI.getProfile(),
        employeeProfileAPI.getBusinessCard(),
        employeeCalendarAPI.getMySchedule().catch(() => ({ data: { success: false } }))
      ]);

      if (schRes.data?.success) {
        setWorkSchedule(schRes.data.data);
      }

      if (profRes.data?.success) {
        setProfile(profRes.data.profile);
        setPersonalForm({
          personalEmail: profRes.data.profile.personalEmail || '',
          personalMobile: profRes.data.profile.personalMobile || '',
          alternateMobile: profRes.data.profile.alternateMobile || '',
          maritalStatus: profRes.data.profile.maritalStatus || 'Single',
          bloodGroup: profRes.data.profile.bloodGroup || 'B+'
        });
      }

      if (cardRes.data?.success) {
        setBusinessCard(cardRes.data.card);
      }
    } catch (err) {
      console.error('[Fetch Profile Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFeedbackMessage('');
    try {
      const res = await employeeProfileAPI.updatePersonal(personalForm);
      if (res.data?.success) {
        setFeedbackMessage('Personal information updated successfully.');
        setIsEditingPersonal(false);
        fetchProfileData();
        refreshProfile();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update personal information.');
    }
  };

  const handlePhotoUpdated = (newPhotoUrl) => {
    setFeedbackMessage('Profile photo updated successfully and synced with ID Card & HRMS records.');
    fetchProfileData();
    refreshProfile();
  };

  const currentPhotoUrl = profile?.profilePhotoUrl || profile?.photo || profile?.profilePhoto || profile?.avatar || null;
  const isPhotoMissing = !currentPhotoUrl;

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'employment', label: 'Employment Details', icon: Briefcase },
    { id: 'schedule', label: 'Work Schedule', icon: Calendar },
    { id: 'education', label: 'Education & Honors', icon: GraduationCap },
    { id: 'experience', label: 'Past Experience', icon: Award },
    { id: 'shift', label: 'Shift Details', icon: Clock },
    { id: 'emergency', label: 'Emergency Contacts', icon: ShieldCheck },
    { id: 'family', label: 'Family & Nominees', icon: Users },
    { id: 'card', label: 'Digital Business Card', icon: IdCard },
    { id: 'bank', label: 'Bank Details', icon: CreditCard }
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar Container with Interactive Photo Trigger */}
          <div className="relative group shrink-0">
            <div
              onClick={() => setIsPhotoModalOpen(true)}
              className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md ring-4 ring-teal-50 overflow-hidden cursor-pointer relative"
              title="Click to change profile photo"
            >
              {currentPhotoUrl ? (
                <img src={currentPhotoUrl} alt={profile?.fullName} className="h-full w-full object-cover" />
              ) : (
                <span>{(profile?.fullName || 'E').charAt(0).toUpperCase()}</span>
              )}

              {/* Hover overlay with Camera */}
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity">
                <Camera size={20} className="mb-0.5" />
                <span>Change</span>
              </div>
            </div>

            {/* Quick Camera Badge */}
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-transform hover:scale-110"
              title="Upload / Change Photo"
            >
              <Camera size={13} />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{profile?.fullName || employeeUser?.name}</h1>
              <span className="rounded-full bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-0.5 border border-teal-200 self-center sm:self-auto">
                {profile?.employeeId || employeeUser?.employeeId}
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 border border-slate-200 self-center sm:self-auto">
                {profile?.systemRole || employeeUser?.role || 'EMPLOYEE'}
              </span>
              {isPhotoMissing && (
                <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 border border-amber-300 self-center sm:self-auto flex items-center gap-1">
                  <AlertCircle size={12} className="text-amber-600" />
                  Photo Missing
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-600">
              {profile?.designationTitle || 'Healthcare Specialist'} • {profile?.departmentName || 'Operations'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-600" />
                <span>BJK Healthcare Pvt. Ltd. ({profile?.branch || 'Ahmedabad'})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-600" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                <span>{profile?.officialMobile || profile?.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs hover:border-teal-400 transition-all"
            >
              <Camera size={15} className="text-teal-600" />
              <span>{isPhotoMissing ? 'Add Passport Photo' : 'Change Photo'}</span>
            </button>
            <button
              onClick={() => navigate('/employee/id-card')}
              className="px-4 py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all"
            >
              <ShieldCheck size={16} />
              <span>View My ID Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Photo Alert Banner if Photo is missing */}
      {isPhotoMissing && (
        <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Camera size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Mandatory Profile Photo Required
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                All employees must upload a compliant passport-size photo or select a standard corporate avatar for official ID badge generation and HR records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-auto transition-colors"
          >
            Upload Photo Now
          </button>
        </div>
      )}

      {/* Photo Upload & Standard Avatar Modal */}
      <EmployeePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentPhoto={currentPhotoUrl}
        onPhotoUpdated={handlePhotoUpdated}
      />


      {/* Tab Navigation */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alerts */}
      {feedbackMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2 text-xs text-rose-800 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab 1: Personal Information */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
              <p className="text-xs text-slate-500">Employee personal profile & biographical records</p>
            </div>
            {!isEditingPersonal ? (
              <button
                type="button"
                onClick={() => setIsEditingPersonal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Edit Info</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePersonal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-xs font-bold text-white shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Full Name</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date of Birth</span>
              <span className="font-bold text-slate-800 text-sm">
                {profile?.dob ? new Date(profile.dob).toLocaleDateString() : '14 August 1994'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gender</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.gender || 'Male'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Marital Status</span>
              {isEditingPersonal ? (
                <select
                  value={personalForm.maritalStatus}
                  onChange={(e) => setPersonalForm({ ...personalForm, maritalStatus: e.target.value })}
                  className="mt-1 block w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              ) : (
                <span className="font-bold text-slate-800 text-sm">{profile?.maritalStatus || 'Married'}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Blood Group</span>
              {isEditingPersonal ? (
                <select
                  value={personalForm.bloodGroup}
                  onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })}
                  className="mt-1 block w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              ) : (
                <span className="font-bold text-slate-800 text-sm">{profile?.bloodGroup || 'B+'}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Nationality</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.nationality || 'Indian'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Personal Email</span>
              {isEditingPersonal ? (
                <input
                  type="email"
                  value={personalForm.personalEmail}
                  onChange={(e) => setPersonalForm({ ...personalForm, personalEmail: e.target.value })}
                  className="mt-1 block w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              ) : (
                <span className="font-bold text-slate-800 text-sm">{profile?.personalEmail || '--'}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Personal Mobile</span>
              {isEditingPersonal ? (
                <input
                  type="text"
                  value={personalForm.personalMobile}
                  onChange={(e) => setPersonalForm({ ...personalForm, personalMobile: e.target.value })}
                  className="mt-1 block w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              ) : (
                <span className="font-bold text-slate-800 text-sm">{profile?.personalMobile || profile?.phone}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Alternate Mobile</span>
              {isEditingPersonal ? (
                <input
                  type="text"
                  value={personalForm.alternateMobile}
                  onChange={(e) => setPersonalForm({ ...personalForm, alternateMobile: e.target.value })}
                  className="mt-1 block w-full p-2 rounded-lg border border-slate-300 text-xs"
                />
              ) : (
                <span className="font-bold text-slate-800 text-sm">{profile?.alternateMobile || '--'}</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <span className="text-slate-400 block font-medium text-xs mb-1">Residential Address</span>
            <p className="text-xs font-semibold text-slate-800">
              {profile?.currentAddress || 'A-402, Shivalik Platinum, S.G. Highway, Bodakdev, Ahmedabad, Gujarat 380054'}
            </p>
          </div>

          {/* Final Section in Personal Information: Bank Details (Section 1 & 26) */}
          <div className="border-t border-slate-100 pt-6">
            <EmployeeBankDetailsCard
              employeeData={profile}
              onUpdated={fetchProfileData}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Contact Details */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Official & Personal Contacts</h2>
            <p className="text-xs text-slate-500">Corporate communication endpoints and residential addresses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-teal-700 block">
                Official Workplace Contact
              </span>
              <div>
                <span className="text-slate-400 block">Work Email:</span>
                <span className="font-bold text-slate-800">{profile?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Official Mobile:</span>
                <span className="font-bold text-slate-800">{profile?.officialMobile || profile?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Work Facility:</span>
                <span className="font-bold text-slate-800">{profile?.workLocation || 'Ahmedabad Plant'}</span>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider text-teal-700 block">
                Personal Contact
              </span>
              <div>
                <span className="text-slate-400 block">Personal Email:</span>
                <span className="font-bold text-slate-800">{profile?.personalEmail || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Personal Phone:</span>
                <span className="font-bold text-slate-800">{profile?.personalMobile || profile?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Alternate Contact:</span>
                <span className="font-bold text-slate-800">{profile?.alternateMobile || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Employment Details */}
      {activeTab === 'employment' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Employment & Position Details</h2>
            <p className="text-xs text-slate-500">Official employment terms with BJK Healthcare</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Employee ID</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.departmentName}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Designation</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.designationTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Joining Date</span>
              <span className="font-bold text-slate-800 text-sm">
                {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : '15 Mar 2024'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Reporting Manager</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.reportingManagerName || 'Dr. Sunita Rao'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">HR Manager</span>
              <span className="font-bold text-slate-800 text-sm">Kritika Parmar</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Employment Type</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.employmentType || 'FULL TIME'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Plant Facility</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.facility || 'BJK Unit 1 - Formulations Facility'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Employment Status</span>
              <span className="font-bold text-emerald-600 text-sm">Confirmed (Active)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Work Schedule (Centrally Managed by HR) */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Workforce Schedule & Attendance Policy</h2>
              <p className="text-xs text-slate-500">Centrally configured HR working days, shift timings, and week off roster</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
              Read-Only • HR Policy Controlled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Department</span>
              <span className="font-bold text-slate-800 text-sm">{workSchedule?.department || profile?.department || 'Operations'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Assigned Shift</span>
              <span className="font-bold text-teal-600 text-sm">{workSchedule?.shift || 'General Shift (09:00 - 18:00)'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Effective Date</span>
              <span className="font-bold text-slate-800 text-sm">01 January 2026</span>
            </div>
          </div>

          {/* Weekly Pattern Visual Grid */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Weekly Schedule Breakdown (Monday – Sunday)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {workSchedule?.weekSchedule?.map((day, idx) => {
                const isOff = day.status === 'WEEK_OFF';
                const isHol = day.status === 'HOLIDAY' || day.status === 'SPECIAL_HOLIDAY';

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-center ${
                      isOff
                        ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                        : isHol
                        ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <p className="text-xs font-bold">{day.dayName}</p>
                    <span
                      className={`inline-block my-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        isOff
                          ? 'bg-amber-100 text-amber-800'
                          : isHol
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isOff ? 'WEEK OFF' : isHol ? 'HOLIDAY' : 'WORKING'}
                    </span>
                    <p className="text-[10px] text-slate-600 font-medium">
                      {isOff ? 'Rest Day' : `${day.startTime} - ${day.endTime}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              <strong>Employee Notice:</strong> Your workforce schedule is controlled by HR policies according to plant and operational requirements. If you require shift adjustments or roster swaps, please submit a formal request via Shift Swap or HR Help Desk.
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Education & Honors */}
      {activeTab === 'education' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Academic & Professional Qualifications</h2>
            <p className="text-xs text-slate-500">Degrees, specialized certifications, and achievements</p>
          </div>

          <div className="space-y-4">
            {(profile?.educationDetails && profile.educationDetails.length > 0) ? (
              profile.educationDetails.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-slate-900">{edu.degree} ({edu.qualification})</h3>
                    <p className="text-xs text-slate-600">{edu.institutionName} • {edu.universityBoard}</p>
                    <p className="text-xs text-teal-600 font-semibold mt-1">
                      Passing Year: {edu.passingYear} • Score: {edu.percentageOrCgpa}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-slate-900">Bachelor of Pharmacy (B.Pharm)</h3>
                  <p className="text-xs text-slate-600">L.M. College of Pharmacy • Gujarat Technological University</p>
                  <p className="text-xs text-teal-600 font-semibold mt-1">Passing Year: 2018 • CGPA: 8.4</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Past Experience */}
      {activeTab === 'experience' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Previous Employment History</h2>
            <p className="text-xs text-slate-500">Track record before joining BJK Healthcare</p>
          </div>

          <div className="space-y-4">
            {(profile?.previousEmployment && profile.previousEmployment.length > 0) ? (
              profile.previousEmployment.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-slate-900">{exp.companyName}</h3>
                    <span className="text-xs font-semibold text-teal-600">{exp.totalExperience}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5">{exp.designation} • {exp.department || 'Production'}</p>
                  <p className="text-xs text-slate-500 mt-2">{exp.majorResponsibilities}</p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-900">Cadila Healthcare Ltd.</h3>
                  <span className="text-xs font-semibold text-teal-600">5 Years 2 Months</span>
                </div>
                <p className="text-xs font-medium text-slate-700 mt-0.5">Junior Production Officer • Solid Orals</p>
                <p className="text-xs text-slate-500 mt-2">Granulation, compression and coating operation compliant with USFDA and WHO GMP standards.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Shift Details */}
      {activeTab === 'shift' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Shift & Working Roster</h2>
            <p className="text-xs text-slate-500">Shift configuration assigned by plant management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Assigned Shift</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.shift || 'General Shift'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Shift Timings</span>
              <span className="font-bold text-teal-600 text-sm">09:00 AM - 06:00 PM</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Break Duration</span>
              <span className="font-bold text-slate-800 text-sm">60 Minutes (Lunch + Tea)</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Weekly Working Days</span>
              <span className="font-bold text-slate-800 text-sm">6 Days</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Weekly Off</span>
              <span className="font-bold text-slate-800 text-sm">Sunday</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Work Location</span>
              <span className="font-bold text-slate-800 text-sm">{profile?.workLocation || 'Ahmedabad Plant'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Emergency Contacts */}
      {activeTab === 'emergency' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Emergency Contacts</h2>
            <p className="text-xs text-slate-500">Verified emergency contact numbers for plant health & safety</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profile?.emergencyContacts && profile.emergencyContacts.length > 0) ? (
              profile.emergencyContacts.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900">{c.name}</span>
                    {c.isPrimary && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">PRIMARY</span>
                    )}
                  </div>
                  <p className="text-slate-600">Relationship: <span className="font-semibold text-slate-800">{c.relationship}</span></p>
                  <p className="text-slate-600">Mobile: <span className="font-semibold text-slate-800">{c.mobile}</span></p>
                  <p className="text-slate-600">Address: <span className="font-semibold text-slate-800">{c.address || '--'}</span></p>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900">Pooja Joshi</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">PRIMARY</span>
                </div>
                <p className="text-slate-600">Relationship: <span className="font-semibold text-slate-800">Spouse</span></p>
                <p className="text-slate-600">Mobile: <span className="font-semibold text-slate-800">9825102949</span></p>
                <p className="text-slate-600">Address: <span className="font-semibold text-slate-800">Ahmedabad, Gujarat</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 8: Family & Nominees */}
      {activeTab === 'family' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Family Members & Benefit Nominees</h2>
            <p className="text-xs text-slate-500">Dependents covered under BJK Healthcare group benefits and PF nominees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 text-xs space-y-2">
              <span className="font-bold text-teal-900 uppercase text-[11px] block">PF & Gratuity Nominee</span>
              <p className="text-slate-600">Nominee Name: <span className="font-bold text-slate-800">{profile?.familyDetails?.nomineeName || 'Pooja Joshi'}</span></p>
              <p className="text-slate-600">Relationship: <span className="font-bold text-slate-800">{profile?.familyDetails?.nomineeRelationship || 'Spouse'}</span></p>
              <p className="text-slate-600">Contact: <span className="font-bold text-slate-800">{profile?.familyDetails?.nomineeContact || '9825102949'}</span></p>
              <p className="text-slate-600">Allocation: <span className="font-bold text-teal-700">100%</span></p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800 uppercase text-[11px] block">Family Dependents</span>
              <p className="text-slate-600">• Father: <span className="font-semibold text-slate-800">Mahesh Joshi</span> (Dependent)</p>
              <p className="text-slate-600">• Spouse: <span className="font-semibold text-slate-800">Pooja Joshi</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Digital Business Card */}
      {activeTab === 'card' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Digital Employee Business Card</h2>
              <p className="text-xs text-slate-500">Official digital identity card with QR verification</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 rounded-2xl text-white shadow-2xl border border-teal-500/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white p-1 flex items-center justify-center">
                  <span className="text-teal-900 font-extrabold text-xs">BJK</span>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-tight">BJK HEALTHCARE</p>
                  <p className="text-[10px] text-teal-300">Private Limited</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                {businessCard?.employeeId || profile?.employeeId}
              </span>
            </div>

            <div className="flex gap-4 items-center mb-5">
              <div className="h-16 w-16 rounded-xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center shrink-0 border-2 border-teal-400/50 overflow-hidden">
                {currentPhotoUrl ? (
                  <img src={currentPhotoUrl} alt={businessCard?.name || profile?.fullName} className="h-full w-full object-cover" />
                ) : (
                  (businessCard?.name || profile?.fullName || 'E').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{businessCard?.name || profile?.fullName}</h3>
                <p className="text-xs text-teal-300 font-medium">{businessCard?.designation || profile?.designationTitle}</p>
                <p className="text-[11px] text-slate-400">{businessCard?.department || profile?.departmentName}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 border-t border-white/10 pt-4 mb-4">
              <p>Email: <span className="font-medium text-white">{businessCard?.email || profile?.email}</span></p>
              <p>Mobile: <span className="font-medium text-white">{businessCard?.mobile || profile?.officialMobile}</span></p>
              <p>Address: <span className="font-medium text-white">{businessCard?.address || 'Ahmedabad Plant, Gujarat'}</span></p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-[10px] text-slate-400">
                <p>Authorized Corporate Card</p>
                <p>bjkhealthcare.com</p>
              </div>
              <div className="bg-white p-1.5 rounded-lg">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Tab: Bank Details (Section 51) */}
      {activeTab === 'bank' && (
        <EmployeeBankDetailsCard
          employeeData={profile}
          onUpdated={fetchProfileData}
        />
      )}
    </div>
  );
};
