const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, resetPassword } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/reset-password', resetPassword);

module.exports = router;
