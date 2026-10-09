const express = require('express');
const router = express.Router();
const { getPermissions } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPermissions);

module.exports = router;
