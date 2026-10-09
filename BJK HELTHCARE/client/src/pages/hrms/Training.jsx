import React, { useState, useEffect } from 'react';
import { hrmsAPI, downloadBlobFile } from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  GraduationCap,
  Award,
  CheckCircle,
  Clock,
  Plus,
  BookOpen,
  ShieldCheck,
  Search,
  Download
} from 'lucide-react';

export const Training = () => {
  const { showToast } = useNotification();
  const [programs, setPrograms] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Enroll modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    programId: '',
    employeeId: 'BJK-00101'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [progRes, enrRes] = await Promise.all([
        hrmsAPI.getTrainingPrograms(),
        hrmsAPI.getTrainingEnrollments({ category: selectedCategory })
      ]);
      if (progRes.data.success) {
        setPrograms(progRes.data.programs);
        if (progRes.data.programs.length > 0 && !enrollForm.programId) {
          setEnrollForm(prev => ({ ...prev, programId: progRes.data.programs[0]._id }));
        }
      }
      if (enrRes.data.success) {
        setEnrollments(enrRes.data.enrollments);
        setStats(enrRes.data.complianceStats || {});
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback training data:', err.message);
      setPrograms([
        {
          _id: 'p-1',
          code: 'TRN-GMP-2026',
          title: 'Current Good Manufacturing Practice (cGMP) Annual Recertification',
          category: 'GMP',
          durationHours: 6,
          isMandatory: true,
          passingScorePercentage: 85
        },
        {
          _id: 'p-2',
          code: 'TRN-DI-21CFR',
          title: 'Data Integrity & 21 CFR Part 11 Electronic Records Compliance',
          category: 'DATA_INTEGRITY',
          durationHours: 4,
          isMandatory: true,
          passingScorePercentage: 90
        },
        {
          _id: 'p-3',
          code: 'TRN-GLP-HPLC',
          title: 'Good Laboratory Practices & HPLC Method Validation SOP-04',
          category: 'GLP',
          durationHours: 5,
          isMandatory: true,
          passingScorePercentage: 85
        }
      ]);
      setEnrollments([
        {
          _id: 'e-1',
          programTitle: 'cGMP Annual Recertification',
          category: 'GMP',
          employeeName: 'Dr. Vikram Mehta',
          employeeId: 'BJK-00101',
          departmentName: 'Quality Assurance',
          scorePercentage: 96,
          status: 'COMPLETED',
          certificateNumber: 'CERT-GMP-9901'
        },
        {
          _id: 'e-2',
          programTitle: 'Data Integrity & 21 CFR Part 11',
          category: 'DATA_INTEGRITY',
          employeeName: 'Priya Sharma',
          employeeId: 'BJK-00102',
          departmentName: 'Quality Control',
          scorePercentage: 88,
          status: 'IN_PROGRESS'
        },
        {
          _id: 'e-3',
          programTitle: 'cGMP Annual Recertification',
          category: 'GMP',
          employeeName: 'Rajesh Patel',
          employeeId: 'BJK-00103',
          departmentName: 'Production Operations',
          status: 'OVERDUE'
        }
      ]);
      setStats({ total: 3, completed: 1, overdue: 1, inProgress: 1, complianceRate: 67 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    try {
      const res = await hrmsAPI.enrollEmployee(enrollForm);
      if (res.data.success) {
        showToast('Workforce participant enrolled in training program', 'success', 'Enrolled');
        setIsEnrollModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleMarkComplete = async (enrollmentId) => {
    try {
      const res = await hrmsAPI.completeTraining(enrollmentId, { scorePercentage: 94 });
      if (res.data.success) {
        showToast('Training marked as completed and certificate issued', 'success', 'Certified');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleDownloadCertificate = async (enrollmentId, empId, progCode) => {
    try {
      showToast('Generating official GxP Certificate PDF...', 'info', 'Generating');
      const res = await hrmsAPI.downloadCertificatePDF(enrollmentId);
      downloadBlobFile(res.data, `BJK_Certificate_${empId || 'Employee'}_${progCode || 'Training'}.pdf`);
      showToast('Certificate PDF downloaded successfully', 'success', 'Downloaded');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to download certificate', 'error', 'Error');
    }
  };

  const columns = [
    {
      header: 'Program Title',
      accessor: 'programTitle',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.programTitle}</span>
          <span className="text-[10px] uppercase font-bold text-bjk-teal">{row.category}</span>
        </div>
      )
    },
    {
      header: 'Enrolled Employee',
      accessor: 'employeeName',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-800 block">{row.employeeName}</span>
          <span className="text-[11px] font-mono text-slate-400">{row.employeeId} &bull; {row.departmentName}</span>
        </div>
      )
    },
    {
      header: 'Assessment Score',
      accessor: 'scorePercentage',
      render: (row) => (
        <span className="font-mono font-bold text-slate-800">
          {row.scorePercentage ? `${row.scorePercentage}%` : '--'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Certificate Ref',
      accessor: 'certificateNumber',
      render: (row) => (
        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {row.certificateNumber || 'Pending'}
        </span>
      )
    },
    {
      header: 'Action',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => {
        if (row.status !== 'COMPLETED') {
          return (
            <button
              onClick={() => handleMarkComplete(row._id)}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
            >
              Sign-off Pass
            </button>
          );
        }
        return (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => handleDownloadCertificate(row._id, row.employeeId, row.programCode)}
              className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
              title="Download Official Certificate PDF"
            >
              <Download size={12} className="text-bjk-teal" />
              <span>Certificate PDF</span>
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Training Academy & LMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical continuous retraining compliance: cGMP, GLP analytical SOPs, Data Integrity, and EHS safety.
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          <Plus size={15} />
          <span>Enroll Employee</span>
        </button>
      </div>

      {/* Compliance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Enrollments</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 text-xs">
          <span className="text-emerald-700 uppercase font-semibold text-[10px]">Certified Completed</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completed ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/20 text-xs">
          <span className="text-rose-700 uppercase font-semibold text-[10px]">Overdue Retraining</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.overdue ?? 0}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-bjk-teal/30 bg-emerald-50/10 text-xs">
          <span className="text-bjk-teal uppercase font-semibold text-[10px]">Pharma Compliance Rate</span>
          <p className="text-2xl font-black text-bjk-teal mt-1">{stats.complianceRate ?? 100}%</p>
        </div>
      </div>

      {/* Training Catalog Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Certified Curriculum Programs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programs.map((prog) => (
            <div key={prog._id} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-bjk-teal bg-bjk-teal/10 px-2 py-0.5 rounded">
                    {prog.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
                    {prog.category}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{prog.title}</h4>
                <div className="mt-3 flex items-center space-x-3 text-xs text-slate-500">
                  <span>Duration: {prog.durationHours} hrs</span>
                  <span>&bull;</span>
                  <span>Pass mark: {prog.passingScorePercentage}%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-emerald-600 font-semibold">Mandatory for Operations</span>
                <span className="text-slate-400">Annual renewal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollments Table */}
      <DataTable
        columns={columns}
        data={enrollments}
        isLoading={isLoading}
        filterComponent={
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-bjk-teal"
          >
            <option value="ALL">All Categories</option>
            <option value="GMP">cGMP Compliance</option>
            <option value="GLP">GLP Laboratory</option>
            <option value="DATA_INTEGRITY">Data Integrity 21 CFR</option>
          </select>
        }
      />

      {/* Enroll Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Employee in Training"
        subtitle="Mandate LMS course completion and set retraining target"
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Program *</label>
            <select
              value={enrollForm.programId}
              onChange={(e) => setEnrollForm({ ...enrollForm, programId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            >
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} - {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
            <input
              type="text"
              required
              value={enrollForm.employeeId}
              onChange={(e) => setEnrollForm({ ...enrollForm, employeeId: e.target.value })}
              placeholder="e.g. BJK-00103"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
