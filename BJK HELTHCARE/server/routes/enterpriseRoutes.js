const express = require('express');
const router = express.Router();
const {
  getCompany,
  getFacilities,
  getDepartments,
  getProductionLines,
  getBatches,
  getInventory,
  getQCSamples,
  getDeviations,
  getRegulatoryRecords,
  getEnquiries,
  createEnquiry,
  getDashboardSummary
} = require('../controllers/enterpriseController');
const { protect } = require('../middleware/auth');

// Public endpoints
router.get('/company', getCompany);
router.get('/facilities', getFacilities);
router.get('/departments', getDepartments);
router.get('/dashboard/summary', getDashboardSummary);

// CRM Enquiry endpoint
router.get('/crm/enquiries', protect, getEnquiries);
router.post('/crm/enquiries', createEnquiry);

// Operational routes
router.get('/production-lines', protect, getProductionLines);
router.get('/batches', protect, getBatches);
router.get('/inventory', protect, getInventory);
router.get('/qc/samples', protect, getQCSamples);
router.get('/qa/deviations', protect, getDeviations);
router.get('/regulatory/records', protect, getRegulatoryRecords);

module.exports = router;
