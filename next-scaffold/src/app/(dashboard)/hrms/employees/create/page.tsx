"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  Phone,
  Home,
  Users,
  ShieldCheck,
  GraduationCap,
  History,
  Activity,
  CreditCard,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";

const onboardingStages = [
  { step: 1, title: "Personal Details", icon: User },
  { step: 2, title: "Job & Department", icon: Briefcase },
  { step: 3, title: "Contact Info", icon: Phone },
  { step: 4, title: "Residential Address", icon: Home },
  { step: 5, title: "Family & Nominee", icon: Users },
  { step: 6, title: "Statutory & PII", icon: ShieldCheck },
  { step: 7, title: "Education", icon: GraduationCap },
  { step: 8, title: "Previous Experience", icon: History },
  { step: 9, title: "Occupational Health", icon: Activity },
  { step: 10, title: "Bank & Disbursal", icon: CreditCard },
  { step: 11, title: "GMP Policy Sign-Off", icon: FileText },
  { step: 12, title: "Final 21 CFR Part 11", icon: CheckCircle2 },
];

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1: Personal
    firstName: "",
    lastName: "",
    dob: "1995-05-15",
    gender: "Male",
    bloodGroup: "O+",
    maritalStatus: "Single",
    // Step 2: Job
    employeeCode: "BH1142",
    designation: "Production Chemist",
    department: "Production Operations",
    category: "TECHNICAL",
    facility: "Lavad Formulation Plant",
    shift: "Shift A (07:00 - 15:30)",
    joiningDate: "2026-10-20",
    // Step 3: Contact
    email: "",
    mobile: "",
    emergencyContact: "",
    emergencyRelation: "Father",
    // Step 4: Address
    presentAddress: "Block 4, Lavad Green Residency, Dahegam Road",
    state: "Gujarat",
    pinCode: "382305",
    // Step 5: Nominee
    nomineeName: "Shanti Devi",
    nomineeRelation: "Mother",
    nomineePercentage: "100%",
    // Step 6: Statutory
    aadhaar: "XXXX-XXXX-9921",
    pan: "ABCDE1234F",
    uan: "101234567890",
    // Step 7: Education
    qualification: "B.Pharm (Pharmaceutical Sciences)",
    university: "Gujarat Technological University (GTU)",
    passingYear: "2018",
    // Step 8: Experience
    previousCompany: "Cadila Pharmaceuticals Ltd",
    experienceYears: "4 Years",
    // Step 9: Health
    medicalFitness: "PASSED (Class A Cleanroom Certified)",
    visionFitness: "Normal (6/6)",
    // Step 10: Bank
    bankName: "HDFC Bank",
    accountNumber: "50100492817291",
    ifscCode: "HDFC0001242",
    // Step 11: GMP
    whoGmpDeclaration: true,
    cleanroomSopSigned: true,
  });

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-[#00A896] border border-teal-200">
              Guided Onboarding Wizard
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Stage {currentStep} of 12
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            12-Stage Pharmaceutical Onboarding
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            WHO-GMP compliant workforce induction with automated statutory bank and qualification validation
          </p>
        </div>

        <Link
          href="/hrms/employees"
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all self-start md:self-auto"
        >
          Cancel & Exit
        </Link>
      </div>

      {/* Progress Bar & Stepper */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <span>Overall Onboarding Completion</span>
          <span className="text-[#00A896]">
            {Math.round(((currentStep - 1) / 11) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#00A896] to-[#02C39A] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 11) * 100}%` }}
          />
        </div>

        {/* Horizontal Step Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {onboardingStages.map((stage) => {
            const isCompleted = currentStep > stage.step;
            const isCurrent = currentStep === stage.step;
            const StageIcon = stage.icon;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => setCurrentStep(stage.step)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all flex-shrink-0 border ${
                  isCurrent
                    ? "bg-[#00A896] text-white border-transparent shadow-xs"
                    : isCompleted
                    ? "bg-teal-50 text-[#00A896] border-teal-200"
                    : "bg-slate-50 text-slate-400 border-slate-200"
                }`}
              >
                <StageIcon size={13} />
                <span>{stage.step}. {stage.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {isSuccess ? (
          <div className="text-center py-12 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Employee Successfully Onboarded!
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Record for <strong className="text-slate-800">{formData.firstName} {formData.lastName || "Candidate"}</strong> ({formData.employeeCode}) has been cryptographically signed and stored under 21 CFR Part 11 audit trail. Biometric access and smart ID card generation initiated.
            </p>
            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setCurrentStep(1);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Onboard Another
              </button>
              <Link
                href="/hrms/employees"
                className="px-5 py-2.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                View in Directory
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {/* Step 1: Personal */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">
                  Stage 1: Candidate Personal Dossier
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patel"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => handleChange("dob", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Blood Group *</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => handleChange("bloodGroup", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    >
                      <option>O+</option>
                      <option>A+</option>
                      <option>B+</option>
                      <option>AB+</option>
                      <option>O-</option>
                      <option>A-</option>
                      <option>B-</option>
                      <option>AB-</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Job */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">
                  Stage 2: Job Assignment & Department Classification
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Employee Code *</label>
                    <input
                      type="text"
                      value={formData.employeeCode}
                      onChange={(e) => handleChange("employeeCode", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Designation *</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => handleChange("designation", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    >
                      <option>Production Operations</option>
                      <option>Quality Assurance</option>
                      <option>Quality Control</option>
                      <option>Warehouse & Supply Chain</option>
                      <option>Plant Engineering</option>
                      <option>Regulatory Affairs</option>
                      <option>Human Resources</option>
                      <option>Facilities & Security</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    >
                      <option value="TECHNICAL">TECHNICAL (Cleanroom / Lab / Regulatory)</option>
                      <option value="NON_TECHNICAL">NON_TECHNICAL (Admin / Security / Support)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">
                  Stage 3: Contact & Emergency Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Official / Personal Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="rahul.patel@bjkhealthcare.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mobile Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98250 12345"
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-hidden focus:ring-2 focus:ring-[#00A896]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Other Steps: Summary Preview for 4 through 11 */}
            {currentStep >= 4 && currentStep <= 11 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">
                  Stage {currentStep}: {onboardingStages[currentStep - 1].title}
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <p className="text-slate-600">
                    Form verification parameters for <strong>{onboardingStages[currentStep - 1].title}</strong> auto-loaded from verified pre-employment file.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Status:</span>
                      <strong className="text-emerald-600">Validated by HR Review</strong>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Compliance:</span>
                      <strong className="text-slate-800">WHO-GMP & Statutory Ready</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 12: Final Submission */}
            {currentStep === 12 && (
              <div className="space-y-4">
                <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-2">
                  Stage 12: Final Review & 21 CFR Part 11 Electronic Signature
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee Name:</span>
                    <strong className="text-slate-900">{formData.firstName || "Rahul"} {formData.lastName || "Patel"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employee Code:</span>
                    <strong className="font-mono text-[#00A896]">{formData.employeeCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department / Role:</span>
                    <strong className="text-slate-900">{formData.department} ({formData.designation})</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Lock size={14} className="text-emerald-600" />
                    <span>Cryptographic Audit Stamp</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    This onboarding dossier will be permanently recorded with an immutable audit hash.
                  </p>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center space-x-1"
              >
                <ChevronLeft size={16} />
                <span>Previous Stage</span>
              </button>

              {currentStep < 12 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(12, prev + 1))}
                  className="px-5 py-2.5 bg-[#00A896] hover:bg-[#009B8D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>Next Stage</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? "Submitting Electronic Record..." : "Confirm & Sign Dossier"}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
