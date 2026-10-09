const { JobRequisition, Candidate } = require('../../models/hrms/Recruitment');
const { recordAudit } = require('../../middleware/audit');
const { generateOfferLetterPDF } = require('../../services/hrms/pdfService');

// GET /api/hrms/recruitment/jobs
const getJobs = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (department && department !== 'ALL') query.department = department;

    const jobs = await JobRequisition.find(query).sort({ createdAt: -1 });
    
    // Add applicant counts
    const jobsWithCounts = await Promise.all(jobs.map(async (j) => {
      const applicantCount = await Candidate.countDocuments({ jobRequisition: j._id });
      return { ...j.toObject(), applicantCount };
    }));

    res.json({ success: true, jobs: jobsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/recruitment/jobs
const createJob = async (req, res) => {
  try {
    const count = await JobRequisition.countDocuments({});
    req.body.jobCode = `BJK-JOB-${String(count + 101).padStart(4, '0')}`;
    const job = await JobRequisition.create(req.body);
    
    await recordAudit({
      req,
      action: 'JOB_REQUISITION_CREATED',
      module: 'RECRUITMENT',
      recordId: job._id,
      details: `Created job posting ${job.jobCode}: ${job.title} in ${job.department}`
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/recruitment/candidates
const getCandidates = async (req, res) => {
  try {
    const { stage, jobId } = req.query;
    const query = {};
    if (stage && stage !== 'ALL') query.stage = stage;
    if (jobId) query.jobRequisition = jobId;

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });

    // Pipeline counts
    const pipelineCounts = {
      applied: await Candidate.countDocuments({ stage: 'APPLIED' }),
      screening: await Candidate.countDocuments({ stage: 'SCREENING' }),
      shortlisted: await Candidate.countDocuments({ stage: 'SHORTLISTED' }),
      interview: await Candidate.countDocuments({ stage: { $in: ['TECHNICAL_INTERVIEW', 'HR_INTERVIEW'] } }),
      selected: await Candidate.countDocuments({ stage: 'SELECTED' }),
      offer: await Candidate.countDocuments({ stage: { $in: ['OFFER_EXTENDED', 'OFFER_ACCEPTED'] } }),
      hired: await Candidate.countDocuments({ stage: 'HIRED' })
    };

    res.json({ success: true, candidates, pipelineCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/recruitment/candidates/:id/stage
const updateCandidateStage = async (req, res) => {
  try {
    const { stage, notes } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    candidate.stage = stage;
    if (notes) {
      candidate.interviewNotes.push({
        roundName: stage,
        interviewer: req.user ? req.user.name : 'Recruiter',
        feedback: notes,
        conductedDate: new Date()
      });
    }
    await candidate.save();

    await recordAudit({
      req,
      action: 'CANDIDATE_STAGE_CHANGED',
      module: 'RECRUITMENT',
      recordId: candidate._id,
      details: `Moved candidate ${candidate.fullName} to stage ${stage}`
    });

    res.json({ success: true, message: `Candidate moved to ${stage}`, candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/hrms/recruitment/candidates/:id/offer-pdf
const downloadOfferLetterPDF = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    const job = await JobRequisition.findById(candidate.jobRequisition);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=BJK_Offer_${candidate.fullName.replace(/\s+/g, '_')}.pdf`);

    await recordAudit({
      req,
      action: 'OFFER_LETTER_PDF_DOWNLOADED',
      module: 'RECRUITMENT',
      recordId: candidate._id,
      details: `Generated and downloaded offer letter PDF for candidate ${candidate.fullName}`
    });

    generateOfferLetterPDF(candidate, job, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// POST /api/hrms/recruitment/candidates/:id/initiate-onboarding
const initiateOnboardingFromCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });

    const job = await JobRequisition.findById(candidate.jobRequisition);

    const OnboardingApplication = require('../../models/hrms/OnboardingApplication');
    const nameParts = (candidate.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || 'Candidate';
    const lastName = nameParts.slice(1).join(' ') || 'Staff';

    const count = await OnboardingApplication.countDocuments({});
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const applicationId = `ONB-2026-${randomHex}`;
    const employeeId = `BJK-EMP-${String(count + 201).padStart(6, '0')}`;

    const onboardingApp = await OnboardingApplication.create({
      applicationId,
      employeeId,
      currentStep: 1,
      completionPercentage: 25,
      status: 'DRAFT',
      formData: {
        employeeId,
        firstName,
        lastName,
        officialEmail: candidate.email,
        personalEmail: candidate.email,
        mobileNumber: candidate.phone || '',
        department: job ? job.department : 'Quality Assurance',
        designation: candidate.jobTitle || (job ? job.title : 'Officer'),
        joiningDate: candidate.offerDetails?.joiningDate || new Date().toISOString().slice(0, 10),
        basicSalary: candidate.offerDetails?.offeredSalary ? Math.round(candidate.offerDetails.offeredSalary / 12 * 0.5) : 35000,
        employmentType: 'Full Time',
        facility: job?.facility || 'BJK Unit 1 - Formulations Facility'
      },
      createdBy: req.user?.name || 'Recruitment Lead',
      assignedHR: req.user?._id || null,
      assignedHRName: req.user?.name || 'HR Master Admin',
      lastAutoSavedAt: new Date()
    });

    candidate.stage = 'HIRED';
    await candidate.save();

    await recordAudit({
      req,
      action: 'CANDIDATE_INITIATED_ONBOARDING',
      module: 'RECRUITMENT',
      recordId: candidate._id,
      details: `Initiated guided onboarding for hired candidate ${candidate.fullName} [Application: ${applicationId}]`
    });

    res.json({
      success: true,
      message: 'Guided onboarding draft created from candidate profile.',
      application: onboardingApp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJobs,
  createJob,
  getCandidates,
  updateCandidateStage,
  downloadOfferLetterPDF,
  initiateOnboardingFromCandidate
};
