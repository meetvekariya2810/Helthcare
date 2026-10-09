const { PerformanceCycle, PerformanceReview } = require('../../models/hrms/Performance');
const Employee = require('../../models/hrms/Employee');
const { recordAudit } = require('../../middleware/audit');

// GET /api/hrms/performance/reviews
const getReviews = async (req, res) => {
  try {
    const { employeeId, department, status } = req.query;
    const query = {};
    if (employeeId) query.employeeId = employeeId;
    if (department && department !== 'ALL') query.departmentName = department;
    if (status && status !== 'ALL') query.status = status;

    const reviews = await PerformanceReview.find(query).sort({ createdAt: -1 });
    const cycles = await PerformanceCycle.find({}).sort({ year: -1 });

    res.json({ success: true, reviews, cycles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/hrms/performance/reviews/:id
const updateReview = async (req, res) => {
  try {
    const { goals, overallSelfRating, overallManagerRating, status, developmentPlan } = req.body;
    const review = await PerformanceReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review record not found' });

    if (goals) review.goals = goals;
    if (overallSelfRating !== undefined) review.overallSelfRating = overallSelfRating;
    if (overallManagerRating !== undefined) review.overallManagerRating = overallManagerRating;
    if (status) review.status = status;
    if (developmentPlan) review.developmentPlan = developmentPlan;

    await review.save();

    await recordAudit({
      req,
      action: 'PERFORMANCE_REVIEW_UPDATED',
      module: 'PERFORMANCE',
      recordId: review._id,
      details: `Updated appraisal review for ${review.employeeName}`
    });

    res.json({ success: true, message: 'Review updated', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/performance/cycles
const createCycle = async (req, res) => {
  try {
    const { title, year, startDate, endDate, status } = req.body;
    const cycle = await PerformanceCycle.create({
      title,
      year: year || new Date().getFullYear(),
      startDate: new Date(startDate || Date.now()),
      endDate: new Date(endDate || Date.now() + 365 * 86400000),
      status: status || 'GOAL_SETTING'
    });

    await recordAudit({
      req,
      action: 'PERFORMANCE_CYCLE_CREATED',
      module: 'PERFORMANCE',
      recordId: cycle._id,
      details: `Created appraisal cycle: ${cycle.title} (${cycle.year})`
    });

    res.status(201).json({ success: true, cycle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/hrms/performance/reviews
const createReview = async (req, res) => {
  try {
    const { cycleId, employeeId, goals, reviewerId } = req.body;
    const cycle = await PerformanceCycle.findById(cycleId);
    if (!cycle) return res.status(404).json({ success: false, message: 'Performance cycle not found' });

    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    let reviewer = null;
    if (reviewerId) {
      reviewer = await Employee.findOne({ employeeId: reviewerId });
    }

    const review = await PerformanceReview.create({
      cycle: cycle._id,
      cycleTitle: cycle.title,
      employee: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      departmentName: employee.departmentName,
      reviewer: reviewer ? reviewer._id : null,
      reviewerName: reviewer ? reviewer.fullName : 'Department Manager',
      goals: goals || [
        { title: 'Quality & cGMP Compliance', description: 'Zero deviations in batch records and SOP adherence', weightagePercentage: 30 },
        { title: 'Operational Efficiency', description: 'Timely milestone delivery within production/QA schedule', weightagePercentage: 30 },
        { title: 'Continuous Improvement', description: 'CAPA suggestions and 5S compliance', weightagePercentage: 20 },
        { title: 'Safety & Gowning Standards', description: 'Full adherence to EHS & aseptic gowning protocols', weightagePercentage: 20 }
      ],
      status: 'DRAFT'
    });

    await recordAudit({
      req,
      action: 'PERFORMANCE_REVIEW_CREATED',
      module: 'PERFORMANCE',
      recordId: review._id,
      details: `Initialized appraisal review for ${employee.fullName} under ${cycle.title}`
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getReviews, updateReview, createCycle, createReview };
