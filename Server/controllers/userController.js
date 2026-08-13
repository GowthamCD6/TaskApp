const { pool } = require('../config/db');

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, google_id as googleId, name, email, role, department, title, avatar, created_at as createdAt FROM users';
    const params = [];

    if (role) {
      query += ' WHERE LOWER(role) = LOWER(?)';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
    });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT id, google_id as googleId, name, email, role, department, title, avatar, created_at as createdAt FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: users[0],
    });
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
    });
  }
};

// POST /api/users (Admin adds a new Faculty member)
const createUser = async (req, res) => {
  try {
    const { name, email, department, title, avatar } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, Email, and Department are required',
      });
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [
      email.trim(),
    ]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'A user with this email already exists',
      });
    }

    const newUser = {
      id: `fac-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'faculty',
      department: department.trim(),
      title: title ? title.trim() : 'Assistant Professor',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    await pool.query(
      `INSERT INTO users (id, name, email, role, department, title, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.role,
        newUser.department,
        newUser.title,
        newUser.avatar,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: `Faculty member ${newUser.name} created successfully`,
      data: newUser,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
};
