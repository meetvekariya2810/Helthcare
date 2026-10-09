import React, { useState, useEffect } from 'react';
import { hrmsAPI, downloadBlobFile } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import {
  UserPlus,
  Briefcase,
  Users,
  Search,
  Plus,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Download
} from 'lucide-react';

export const Recruitment = () => {
  const { showToast } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [pipelineCounts, setPipelineCounts] = useState({});
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Add Job Modal
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Production Operations',
    facility: 'BJK Unit 1 - Formulations Facility',
    positionsCount: 2,
    minQualification: 'B.Pharm',
    experienceRequiredYears: '2-4 years',
    requiredSkills: 'GMP, Cleanroom Area B',
    jobDescription: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [jobRes, candRes] = await Promise.all([
        hrmsAPI.getJobs(),
        hrmsAPI.getCandidates({ stage: selectedStage })
      ]);
      if (jobRes.data.success) setJobs(jobRes.data.jobs);
      if (candRes.data.success) {
        setCandidates(candRes.data.candidates);
        setPipelineCounts(candRes.data.pipelineCounts || {});
      }
    } catch (err) {
      console.warn('[BJK HRMS]: Fallback recruitment data:', err.message);
      setJobs([
        {
          _id: 'j-1',
          jobCode: 'BJK-JOB-0101',
          title: 'Cleanroom Production Line Supervisor',
          department: 'Production Operations',
          facility: 'BJK Unit 1 - Formulations Facility',
          positionsCount: 2,
          minQualification: 'B.Pharm',
          status: 'PUBLISHED',
          applicantCount: 8
        },
        {
          _id: 'j-2',
          jobCode: 'BJK-JOB-0102',
          title: 'Senior Analytical Chemist (HPLC/GC)',
          department: 'Quality Control',
          facility: 'BJK Unit 1 - Formulations Facility',
          positionsCount: 3,
          minQualification: 'M.Sc Chemistry',
          status: 'PUBLISHED',
          applicantCount: 14
        },
        {
          _id: 'j-3',
          jobCode: 'BJK-JOB-0103',
          title: 'Regulatory Affairs Executive',
          department: 'Regulatory Affairs',
          facility: 'BJK Corporate Headquarters',
          positionsCount: 1,
          minQualification: 'M.Pharm',
          status: 'PUBLISHED',
          applicantCount: 5
        }
      ]);
      setCandidates([
        {
          _id: 'c-1',
          fullName: 'Aniket Varma',
          email: 'aniket.varma@example.com',
          phone: '+91 98111 22334',
          jobTitle: 'Cleanroom Production Line Supervisor',
          qualification: 'B.Pharm',
          skills: ['GMP', 'Cleanroom B', 'Tablet Press'],
          totalExperienceYears: 3,
          stage: 'TECHNICAL_INTERVIEW'
        },
        {
          _id: 'c-2',
          fullName: 'Neha Joshi',
          email: 'neha.joshi@example.com',
          phone: '+91 98222 33445',
          jobTitle: 'Senior Analytical Chemist (HPLC/GC)',
          qualification: 'M.Sc Chemistry',
          skills: ['GLP', 'HPLC', 'Method Validation'],
          totalExperienceYears: 4,
          stage: 'OFFER_EXTENDED'
        }
      ]);
      setPipelineCounts({ applied: 12, screening: 6, shortlisted: 4, interview: 3, selected: 2, offer: 1, hired: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStage]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jobForm,
        requiredSkills: jobForm.requiredSkills.split(',').map(s => s.trim())
      };
      const res = await hrmsAPI.createJob(payload);
      if (res.data.success) {
        showToast('Job requisition published to talent board', 'success', 'Published');
        setIsAddJobModalOpen(false);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleStageAdvance = async (candidateId, nextStage) => {
    try {
      const res = await hrmsAPI.updateCandidateStage(candidateId, { stage: nextStage });
      if (res.data.success) {
        showToast(`Candidate moved to ${nextStage}`, 'success', 'Stage Advanced');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error', 'Error');
    }
  };

  const handleDownloadOffer = async (candidateId, name) => {
    try {
      showToast('Generating official BJK Offer Letter PDF...', 'info', 'Generating');
      const res = await hrmsAPI.downloadOfferLetterPDF(candidateId);
      downloadBlobFile(res.data, `BJK_Offer_Letter_${(name || 'Candidate').replace(/\s+/g, '_')}.pdf`);
      showToast('Offer letter PDF downloaded successfully', 'success', 'Downloaded');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to download offer letter', 'error', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Talent Acquisition & Pharma ATS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Requisitions for GMP operations, B.Pharm/M.Pharm qualifications, and candidate pipeline tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddJobModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
        >
          <Plus size={15} />
          <span>Post Job Requisition</span>
        </button>
      </div>

      {/* Recruitment Pipeline Stage Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {[
          { key: 'ALL', label: 'All Candidates', count: candidates.length },
          { key: 'APPLIED', label: 'Applied', count: pipelineCounts.applied || 0 },
          { key: 'SCREENING', label: 'Screening', count: pipelineCounts.screening || 0 },
          { key: 'SHORTLISTED', label: 'Shortlisted', count: pipelineCounts.shortlisted || 0 },
          { key: 'INTERVIEW', label: 'Interviews', count: pipelineCounts.interview || 0 },
          { key: 'SELECTED', label: 'Selected', count: pipelineCounts.selected || 0 },
          { key: 'OFFER_EXTENDED', label: 'Offer Sent', count: pipelineCounts.offer || 0 }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setSelectedStage(item.key)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedStage === item.key
                ? 'bg-bjk-teal text-white border-bjk-teal shadow-md'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block truncate">
              {item.label}
            </span>
            <span className="text-xl font-black mt-1 block">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Job Requisitions Active Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Active Job Openings ({jobs.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs bjk-card-glow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-bjk-teal bg-bjk-teal/10 px-2 py-0.5 rounded">
                    {job.jobCode}
                  </span>
                  <StatusBadge status={job.status} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{job.department} &bull; {job.facility?.split(' - ')[0]}</p>
                <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-[11px]">{job.minQualification}</span>
                  <span>{job.positionsCount} Positions Open</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{job.applicantCount || 0} Candidates in pipeline</span>
                <span className="text-bjk-teal font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates Pipeline Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Candidate Dossiers ({candidates.length})
        </h3>
        <div className="space-y-3">
          {candidates.map((cand) => (
            <div key={cand._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{cand.fullName}</h4>
                  <StatusBadge status={cand.stage} />
                </div>
                <p className="text-xs text-slate-600 mt-0.5">Applied for: <strong className="text-slate-800">{cand.jobTitle}</strong></p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                  <span>{cand.qualification}</span>
                  <span>&bull;</span>
                  <span>{cand.totalExperienceYears} yrs experience</span>
                  <span>&bull;</span>
                  <span>{cand.email}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadOffer(cand._id, cand.fullName)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                  title="Generate Official Offer Letter PDF"
                >
                  <Download size={13} className="text-bjk-teal" />
                  <span>Offer PDF</span>
                </button>
                <button
                  onClick={() => handleStageAdvance(cand._id, 'TECHNICAL_INTERVIEW')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => handleStageAdvance(cand._id, 'OFFER_EXTENDED')}
                  className="px-3 py-1.5 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Extend Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Job Requisition Modal */}
      <Modal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        title="Create Job Opening Requisition"
        subtitle="Specify pharma role qualifications, GMP requirements, and positions count"
      >
        <form onSubmit={handleCreateJob} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Position Title *</label>
            <input
              type="text"
              required
              value={jobForm.title}
              onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
              placeholder="e.g. Senior Formulation Scientist"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={jobForm.department}
                onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              >
                <option value="Production Operations">Production Operations</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Quality Assurance">Quality Assurance</option>
                <option value="Regulatory Affairs">Regulatory Affairs</option>
                <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Positions Count</label>
              <input
                type="number"
                min="1"
                value={jobForm.positionsCount}
                onChange={(e) => setJobForm({ ...jobForm, positionsCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Qualification *</label>
              <select
                value={jobForm.minQualification}
                onChange={(e) => setJobForm({ ...jobForm, minQualification: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              >
                <option value="B.Pharm">B.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
                <option value="Pharm.D">Pharm.D</option>
                <option value="B.Sc Chemistry">B.Sc Chemistry</option>
                <option value="M.Sc Chemistry">M.Sc Chemistry</option>
                <option value="Diploma in Pharmacy">Diploma in Pharmacy</option>
                <option value="Any Graduate">Any Graduate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
              <input
                type="text"
                value={jobForm.experienceRequiredYears}
                onChange={(e) => setJobForm({ ...jobForm, experienceRequiredYears: e.target.value })}
                placeholder="2-5 years"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-bjk-teal/20 focus:border-bjk-teal"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddJobModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-bjk-teal hover:bg-bjk-teal-dark text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              Publish Opening
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
