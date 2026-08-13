const fs = require('fs');
const path = require('path');
const { readUsersFromFile } = require('./userController');
const { runMigrations } = require('../migrations/migrate');

const DATA_DIR = path.join(__dirname, '../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Helper to read tasks from data store with auto-migration fallback
const readTasksFromFile = () => {
  if (!fs.existsSync(TASKS_FILE)) {
    console.log('⚡ Tasks data store missing. Auto-running database migrations...');
    runMigrations();
  }
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return [];
  }
};

// Helper to save tasks to data store
const writeTasksToFile = (tasks) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
};

// GET /api/tasks
const getTasks = (req, res) => {
  const { facultyId, date, status } = req.query;
  let tasks = readTasksFromFile();

  if (facultyId) {
    tasks = tasks.filter(t => t.assignedTo === facultyId);
  }

  if (date) {
    tasks = tasks.filter(t => t.date === date);
  }

  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }

  // Sort by startTime
  tasks.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: tasks,
  });
};

// GET /api/tasks/:id
const getTaskById = (req, res) => {
  const { id } = req.params;
  const tasks = readTasksFromFile();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({
      status: 'error',
      message: 'Task not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: task,
  });
};

// POST /api/tasks (Admin creates & assigns task)
const createTask = (req, res) => {
  const { title, description, assignedTo, date, startTime, endTime, priority } = req.body;

  if (!title || !assignedTo || !date) {
    return res.status(400).json({
      status: 'error',
      message: 'Title, Faculty assignee, and Date are required',
    });
  }

  const users = readUsersFromFile();
  const faculty = users.find(u => u.id === assignedTo);
  if (!faculty) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid Faculty assignee',
    });
  }

  const tasks = readTasksFromFile();

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    description: description || '',
    assignedTo,
    assignedToName: faculty.name,
    assignedBy: 'Dean James Wilson',
    date,
    startTime: startTime || '09:00',
    endTime: endTime || '10:00',
    priority: priority || 'Medium',
    status: 'pending',
    completionNote: '',
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(newTask);
  writeTasksToFile(tasks);

  res.status(201).json({
    status: 'success',
    message: `Task successfully assigned to ${faculty.name}`,
    data: newTask,
  });
};

// PATCH /api/tasks/:id/complete (Faculty submits completion + remarks)
const completeTask = (req, res) => {
  const { id } = req.params;
  const { completionNote } = req.body;

  const tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Task not found',
    });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status: 'completed',
    completionNote: completionNote || 'Completed task.',
    completedAt: new Date().toISOString(),
  };

  writeTasksToFile(tasks);

  res.status(200).json({
    status: 'success',
    message: 'Task completed successfully',
    data: tasks[taskIndex],
  });
};

// DELETE /api/tasks/:id
const deleteTask = (req, res) => {
  const { id } = req.params;
  const tasks = readTasksFromFile();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Task not found',
    });
  }

  const deleted = tasks.splice(taskIndex, 1)[0];
  writeTasksToFile(tasks);

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
    data: deleted,
  });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  completeTask,
  deleteTask,
};
