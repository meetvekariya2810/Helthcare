const express = require('express');
const router = express.Router();
const { authenticateEmployee } = require('../middleware/employeeAuth');
const {
  getMyBankDetails,
  saveMyBankDetails,
  submitMyBankDetails,
  lookupIFSC
} = require('../controllers/hrms/bankDetailsController');

// All employee bank routes require authenticated employee session
router.use(authenticateEmployee);

router.get('/', getMyBankDetails);
router.post('/', saveMyBankDetails);
router.put('/', saveMyBankDetails);
router.post('/submit', submitMyBankDetails);
router.get('/lookup-ifsc/:ifsc', lookupIFSC);

module.exports = router;
