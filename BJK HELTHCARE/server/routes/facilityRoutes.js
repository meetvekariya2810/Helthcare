const express = require('express');
const router = express.Router();
const { getFacilities } = require('../controllers/enterpriseController');

// Public/authenticated facilities endpoint
router.get('/', getFacilities);

module.exports = router;
