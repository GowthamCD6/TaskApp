const { pool } = require('../config/db');

// Helper to format task object from SQL row
const formatTaskRow = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  assignedTo: row.assigned_to,
  assignedToName: row.assigned_to_name || '',
  assignedBy: row.assigned_by || '',
  date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
  startTime: row.start_time || '',
  endTime: row.end_time || '',
  priority: row.priority || 'Medium',
  status: row.status || 'pending',
  completionNote: row.completion_note || '',
  completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
});

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { facultyId, date, status } = req.query;
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (facultyId) {
      query += ' AND assigned_to = ?';
      params.push(facultyId);
    }

    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_time ASC, created_at DESC';

    const [rows] = await pool.query(query, params);
    const tasks = rows.map(formatTaskRow);

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: tasks,
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tasks',
    });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: formatTaskRow(rows[0]),
    });
  } catch (err) {
    console.error('Error fetching task by ID:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch task',
    });
  }
};

// POST /api/tasks (Admin creates & assigns task)
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, assignedBy, date, startTime, endTime, priority } = req.body;

    if (!title || !assignedTo || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, Faculty assignee, and Date are required',
      });
    }

    // Check if faculty user exists
    const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [assignedTo]);
    if (users.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Faculty assignee',
      });
    }

    const facultyName = users[0].name;

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      assignedTo,
      assignedToName: facultyName,
      assignedBy: assignedBy || '',
      date,
      startTime: startTime || '',
      endTime: endTime || '',
      priority: priority || 'Medium',
      status: 'pending',
      completionNote: '',
      completedAt: null,
    };

    await pool.query(
      `INSERT INTO tasks (id, title, description, assigned_to, assigned_to_name, assigned_by, date, start_time, end_time, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTask.id,
        newTask.title,
        newTask.description,
        newTask.assignedTo,
        newTask.assignedToName,
        newTask.assignedBy,
        newTask.date,
        newTask.startTime,
        newTask.endTime,
        newTask.priority,
        newTask.status,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: `Task successfully assigned to ${facultyName}`,
      data: newTask,
    });
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create task',
    });
  }
};

// PATCH /api/tasks/:id/complete (Faculty submits completion + remarks)
const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { completionNote } = req.body;

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    const now = new Date();
    const formattedCompletedAt = now.toISOString().slice(0, 19).replace('T', ' ');
    const note = completionNote || 'Completed task.';

    await pool.query(
      'UPDATE tasks SET status = ?, completion_note = ?, completed_at = ? WHERE id = ?',
      ['completed', note, formattedCompletedAt, id]
    );

    const [updatedRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Task completed successfully',
      data: formatTaskRow(updatedRows[0]),
    });
  } catch (err) {
    console.error('Error completing task:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete task',
    });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found',
      });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully',
      data: formatTaskRow(rows[0]),
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task',
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  completeTask,
  deleteTask,
};
