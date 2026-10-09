const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  createEnquiry,
  updateEnquiry,
  getLeads,
  createLead,
  updateLead,
  getCustomers,
  createCustomer
} = require('../controllers/commercialController');
const { protect, checkPermission } = require('../middleware/auth');

// Website contact form public endpoint
router.post('/enquiries', createEnquiry);

// Protected CRM endpoints
router.get('/enquiries', protect, checkPermission('crm.view'), getEnquiries);
router.put('/enquiries/:id', protect, checkPermission('crm.edit'), updateEnquiry);

router.get('/leads', protect, checkPermission('crm.view'), getLeads);
router.post('/leads', protect, checkPermission('crm.create'), createLead);
router.put('/leads/:id', protect, checkPermission('crm.edit'), updateLead);

router.get('/customers', protect, checkPermission('crm.view'), getCustomers);
router.post('/customers', protect, checkPermission('crm.create'), createCustomer);

module.exports = router;
