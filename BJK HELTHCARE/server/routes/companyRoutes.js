const express = require('express');
const router = express.Router();
const { getCompany } = require('../controllers/enterpriseController');

// Public company endpoint
router.get('/', getCompany);

module.exports = router;
