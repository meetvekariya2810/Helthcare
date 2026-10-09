const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, disableUser } = require('../controllers/userController');
const { protect, checkPermission } = require('../middleware/auth');

router.use(protect);

router.get('/', checkPermission('users.view'), getUsers);
router.get('/:id', checkPermission('users.view'), getUserById);
router.post('/', checkPermission('users.create'), createUser);
router.put('/:id', checkPermission('users.edit'), updateUser);
router.delete('/:id', checkPermission('users.disable'), disableUser);

module.exports = router;
