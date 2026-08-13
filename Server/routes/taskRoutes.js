const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  completeTask,
  deleteTask,
} = require('../controllers/taskController');

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .delete(deleteTask);

router.patch('/:id/complete', completeTask);

module.exports = router;
