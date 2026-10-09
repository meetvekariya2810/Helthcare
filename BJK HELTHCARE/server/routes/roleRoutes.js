const express = require('express');
const router = express.Router();
const { getRoles } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getRoles);

module.exports = router;
