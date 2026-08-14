const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  completeTask,
  deleteTask,
} = require('../controllers/taskController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// All task routes require authentication
router.use(verifyToken);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .delete(requireRole('admin'), deleteTask);

router.patch('/:id/complete', completeTask);

module.exports = router;
