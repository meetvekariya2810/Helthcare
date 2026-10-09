import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Star,
  UserCheck,
  FileCheck,
  Filter,
  Eye,
  Edit3,
  Calendar
} from 'lucide-react';
import { hrmsAPI } from '../../services/api';
import { KPICard } from '../../components/common/KPICard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export const Performance = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewFormData, setReviewFormData] = useState({
    overallManagerRating: 4,
    finalCalibratedScore: 4.2,
    developmentPlan: '',
    status: 'REVIEWED_BY_MANAGER'
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hrmsAPI.getReviews();
      if (res.data?.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.warn('API fetch failed, checking fallback:', err.message);
      // Demo dataset if backend is empty / disconnected
      setReviews([
        {
          _id: 'rev-001',
          cycleTitle: 'FY 2025-26 Annual Pharma Quality & Ops Appraisal',
          employeeId: 'BJK-EMP-001',
          employeeName: 'Dr. Rajesh Mehta',
          departmentName: 'Quality Control',
          reviewerName: 'Priya Sharma (QA Head)',
          overallSelfRating: 4.5,
          overallManagerRating: 4.8,
          finalCalibratedScore: 4.7,
          status: 'FINALIZED',
          isDemo: true,
          goals: [
            {
              title: 'Zero OOS/OOT Laboratory Investigation Delays',
              weightagePercentage: 35,
              selfRating: 5,
              managerRating: 5,
              selfComments: 'Maintained 100% adherence to 30-day investigation closure SLA.',
              managerComments: 'Exceptional rigour and audit defensibility.'
            },
            {
              title: 'HPLC Column Efficiency & Method Validation',
              weightagePercentage: 35,
              selfRating: 4,
              managerRating: 4.5,
              selfComments: 'Validated 6 new assay protocols under USFDA guidelines.',
              managerComments: 'Met all validation protocols ahead of schedule.'
            },
            {
              title: 'Junior QC Analyst Mentorship & SOP Training',
              weightagePercentage: 30,
              selfRating: 4.5,
              managerRating: 5,
              selfComments: 'Trained 4 newly inducted QC technicians.',
              managerComments: 'Great leadership and zero deviations reported in trained cohort.'
            }
          ],
          developmentPlan: 'Advanced Mass Spectrometry (LC-MS/MS) certification planned for Q3.'
        },
        {
          _id: 'rev-002',
          cycleTitle: 'FY 2025-26 Annual Pharma Quality & Ops Appraisal',
          employeeId: 'BJK-EMP-002',
          employeeName: 'Sunita Verma',
          departmentName: 'Production & Packaging',
          reviewerName: 'Vikram Joshi (Plant Director)',
          overallSelfRating: 4.0,
          overallManagerRating: 4.2,
          finalCalibratedScore: 4.1,
          status: 'REVIEWED_BY_MANAGER',
          isDemo: true,
          goals: [
            {
              title: 'Cleanroom HVAC & Particle Count Compliance',
              weightagePercentage: 50,
              selfRating: 4,
              managerRating: 4,
              selfComments: 'No ISO Class 7 particulate excursions during operating shifts.',
              managerComments: 'Strict adherence to gowning protocol observed.'
            },
            {
              title: 'Batch Yield Optimization',
              weightagePercentage: 50,
              selfRating: 4,
              managerRating: 4.5,
              selfComments: 'Achieved 99.2% line efficiency in blister packaging.',
              managerComments: 'Exceeded yield target by 0.8%.'
            }
          ],
          developmentPlan: 'Lean Six Sigma Green Belt training.'
        },
        {
          _id: 'rev-003',
          cycleTitle: 'FY 2025-26 Annual Pharma Quality & Ops Appraisal',
          employeeId: 'BJK-EMP-003',
          employeeName: 'Amit Patel',
          departmentName: 'Warehouse & Cold Chain',
          reviewerName: 'Rajiv Malhotra (Supply Chain VP)',
          overallSelfRating: 4.2,
          overallManagerRating: null,
          finalCalibratedScore: null,
          status: 'SUBMITTED_BY_EMPLOYEE',
          isDemo: true,
          goals: [
            {
              title: 'Cold Storage (2°C - 8°C) Continuous Data Logging',
              weightagePercentage: 60,
              selfRating: 4.5,
              managerRating: null,
              selfComments: 'Zero temperature excursions over the entire fiscal period.',
              managerComments: ''
            },
            {
              title: 'Inventory FEFO Protocol Compliance',
              weightagePercentage: 40,
              selfRating: 4,
              managerRating: null,
              selfComments: 'Audited stock rotation with zero expired lot dispatches.',
              managerComments: ''
            }
          ],
          developmentPlan: 'Cold chain IoT telemetry advanced system operator course.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenReview = (rev) => {
    setSelectedReview(rev);
    setReviewFormData({
      overallManagerRating: rev.overallManagerRating || 4,
      finalCalibratedScore: rev.finalCalibratedScore || 4,
      developmentPlan: rev.developmentPlan || '',
      status: rev.status === 'SUBMITTED_BY_EMPLOYEE' ? 'REVIEWED_BY_MANAGER' : rev.status
    });
    setIsModalOpen(true);
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;
    try {
      setIsSubmitting(true);
      await hrmsAPI.updateReview(selectedReview._id, reviewFormData);
      setReviews((prev) =>
        prev.map((r) =>
          r._id === selectedReview._id
            ? { ...r, ...reviewFormData }
            : r
        )
      );
      setIsModalOpen(false);
    } catch (err) {
      // Optimistic update for demo mode
      setReviews((prev) =>
        prev.map((r) =>
          r._id === selectedReview._id
            ? { ...r, ...reviewFormData }
            : r
        )
      );
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      r.departmentName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReviews = reviews.length;
  const finalized = reviews.filter((r) => r.status === 'FINALIZED').length;
  const pendingManager = reviews.filter((r) => r.status === 'SUBMITTED_BY_EMPLOYEE').length;
  const avgScore =
    reviews.filter((r) => r.finalCalibratedScore).length > 0
      ? (
          reviews
            .filter((r) => r.finalCalibratedScore)
            .reduce((acc, curr) => acc + curr.finalCalibratedScore, 0) /
          reviews.filter((r) => r.finalCalibratedScore).length
        ).toFixed(1)
      : '--';

  const columns = [
    {
      header: 'Employee',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.employeeName}</div>
          <div className="text-xs text-slate-500 font-mono">{row.employeeId} &bull; {row.departmentName}</div>
        </div>
      )
    },
    {
      header: 'Appraisal Cycle',
      accessor: (row) => (
        <div className="text-xs text-slate-700 max-w-xs truncate" title={row.cycleTitle}>
          {row.cycleTitle}
        </div>
      )
    },
    {
      header: 'Reviewer',
      accessor: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.reviewerName || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Self / Mgr Score',
      accessor: (row) => (
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
            Self: {row.overallSelfRating || '--'}
          </span>
          <span className="px-2 py-0.5 rounded bg-bjk-teal/10 font-semibold text-bjk-teal">
            Mgr: {row.overallManagerRating || '--'}
          </span>
        </div>
      )
    },
    {
      header: 'Final Score',
      accessor: (row) => (
        <div className="flex items-center space-x-1">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="font-bold text-slate-900 text-sm">
            {row.finalCalibratedScore ? `${row.finalCalibratedScore} / 5.0` : '--'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <StatusBadge
          status={
            row.status === 'FINALIZED'
              ? 'ACTIVE'
              : row.status === 'SUBMITTED_BY_EMPLOYEE'
              ? 'WARNING'
              : 'INFO'
          }
          text={row.status.replace(/_/g, ' ')}
        />
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleOpenReview(row)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-bjk-teal hover:bg-bjk-teal/10 rounded-lg transition-colors"
        >
          <Eye size={14} />
          <span>Appraise</span>
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="text-bjk-teal" />
            Performance & Appraisal Management
          </h1>
          <p className="text-sm text-slate-500">
            Pharma workforce KRAs, Good Laboratory Practice (GLP) metrics, and 360° reviews
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5">
            <Calendar size={14} />
            Cycle: FY 2025-26 Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Appraisals"
          value={totalReviews}
          subtitle="Employees in cycle"
          icon={Award}
          color="teal"
        />
        <KPICard
          title="Manager Pending"
          value={pendingManager}
          subtitle="Awaiting manager sign-off"
          icon={Clock}
          color="amber"
        />
        <KPICard
          title="Completed & Finalized"
          value={finalized}
          subtitle="Calibrated evaluations"
          icon={CheckCircle2}
          color="green"
        />
        <KPICard
          title="Avg Plant Rating"
          value={avgScore !== '--' ? `${avgScore} / 5` : '--'}
          subtitle="Across audited departments"
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Active Performance Cycle Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-bjk-teal/80 text-white rounded-2xl p-5 shadow-lg border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-bjk-teal text-white">
              Current Evaluation Phase
            </span>
            <span className="text-xs text-slate-300">Target Completion: Nov 30, 2026</span>
          </div>
          <h2 className="text-lg font-bold">FY 2025-26 Annual Quality & Technical Calibration</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Covers GMP compliance adherence, zero OOS laboratory investigations, equipment uptime, cleanroom gowning validations, and statutory safety logs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur border border-white/20">
            Stage 3: Manager Assessment
          </span>
        </div>
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee, ID, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED_BY_EMPLOYEE">Submitted by Employee</option>
              <option value="REVIEWED_BY_MANAGER">Reviewed by Manager</option>
              <option value="FINALIZED">Finalized</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredReviews}
          loading={loading}
          emptyMessage="No performance reviews found matching criteria."
        />
      </div>

      {/* Review & Appraisal Modal */}
      {selectedReview && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Appraisal Dossier — ${selectedReview.employeeName}`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSaveReview} className="space-y-6">
            {/* Employee Meta */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <div>
                <span className="text-slate-400">Employee ID: </span>
                <span className="font-mono font-bold text-slate-800">{selectedReview.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400">Department: </span>
                <span className="font-semibold text-slate-800">{selectedReview.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400">Cycle: </span>
                <span className="font-semibold text-slate-800">{selectedReview.cycleTitle}</span>
              </div>
            </div>

            {/* Individual Goals / KRAs */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Key Performance Indicators & Pharma Deliverables
              </h3>
              {selectedReview.goals?.map((goal, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{goal.title}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Weightage: {goal.weightagePercentage}%
                    </span>
                  </div>
                  {goal.selfComments && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-700">Self Assessment (Score {goal.selfRating}/5):</span>{' '}
                      {goal.selfComments}
                    </div>
                  )}
                  {goal.managerComments && (
                    <div className="text-[11px] text-bjk-teal bg-bjk-teal/5 p-2 rounded-lg border border-bjk-teal/10">
                      <span className="font-semibold text-bjk-teal">Manager Appraisal (Score {goal.managerRating}/5):</span>{' '}
                      {goal.managerComments}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Manager Scoring and Calibration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Manager Overall Rating (1.0 - 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={reviewFormData.overallManagerRating}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      overallManagerRating: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Calibrated Score (1.0 - 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={reviewFormData.finalCalibratedScore}
                  onChange={(e) =>
                    setReviewFormData({
                      ...reviewFormData,
                      finalCalibratedScore: parseFloat(e.target.value) || 0
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
                  required
                />
              </div>
            </div>

            {/* Development Plan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Individual Development & Pharma Skill Enhancement Plan
              </label>
              <textarea
                rows={3}
                value={reviewFormData.developmentPlan}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, developmentPlan: e.target.value })
                }
                placeholder="E.g., Complete USFDA 21 CFR Part 11 electronic records certification, advanced HPLC method development..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Appraisal Workflow Status
              </label>
              <select
                value={reviewFormData.status}
                onChange={(e) =>
                  setReviewFormData({ ...reviewFormData, status: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED_BY_EMPLOYEE">Submitted by Employee</option>
                <option value="REVIEWED_BY_MANAGER">Reviewed by Manager</option>
                <option value="FINALIZED">Finalized & Locked</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-bjk-teal hover:bg-bjk-teal/90 rounded-xl transition-colors shadow-md shadow-bjk-teal/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Submit Appraisal'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Performance;
