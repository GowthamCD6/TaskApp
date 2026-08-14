const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, uploadUserAvatar } = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware');

// All user routes require a valid JWT token
router.use(verifyToken);

router.route('/')
  .get(getUsers)
  .post(requireRole('admin'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(requireRole('admin'), deleteUser);

// Upload avatar directly to server filesystem & database
router.post('/:id/avatar', uploadAvatar.single('avatar'), uploadUserAvatar);

module.exports = router;
