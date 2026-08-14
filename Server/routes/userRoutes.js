const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All user routes require a valid JWT token
router.use(verifyToken);

router.route('/')
  .get(getUsers)
  .post(requireRole('admin'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(requireRole('admin'), deleteUser);

module.exports = router;
