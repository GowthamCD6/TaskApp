const { pool } = require('../config/db');

// Helper to format user row
const formatUserRow = (row) => ({
  id: row.id,
  googleId: row.google_id || null,
  regNo: row.reg_no || (row.role === 'admin' ? 'ADM-2026-001' : 'FAC-2026-101'),
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department || 'Academic Department',
  title: row.title || 'Faculty Member',
  avatar: row.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  phone: row.phone || '+1 (555) 123-4567',
  officeHours: row.office_hours || 'Mon - Fri, 09:00 AM - 05:00 PM',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
});

// GET /api/users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM users';
    const params = [];

    if (role) {
      query += ' WHERE LOWER(role) = LOWER(?)';
      params.push(role);
    }

    query += ' ORDER BY created_at ASC';

    const [rows] = await pool.query(query, params);
    const users = rows.map(formatUserRow);

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
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: formatUserRow(rows[0]),
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
    const { name, email, department, title, avatar, phone, officeHours, regNo } = req.body;

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

    const newRegNo = regNo ? regNo.trim() : `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newUser = {
      id: `fac-${Date.now()}`,
      reg_no: newRegNo,
      password: '123456',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'faculty',
      department: department.trim(),
      title: title ? title.trim() : 'Assistant Professor',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: phone || '+1 (555) 123-4567',
      office_hours: officeHours || 'Mon - Fri, 09:00 AM - 05:00 PM',
    };

    await pool.query(
      `INSERT INTO users (id, reg_no, password, name, email, role, department, title, avatar, phone, office_hours)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUser.id,
        newUser.reg_no,
        newUser.password,
        newUser.name,
        newUser.email,
        newUser.role,
        newUser.department,
        newUser.title,
        newUser.avatar,
        newUser.phone,
        newUser.office_hours,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Faculty user created successfully',
      data: formatUserRow({ ...newUser, created_at: new Date() }),
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
    });
  }
};

// PUT /api/users/:id (Update existing user profile)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, title, avatar, phone, officeHours, regNo } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    const current = rows[0];
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const updatedDepartment = department !== undefined ? department.trim() : current.department;
    const updatedTitle = title !== undefined ? title.trim() : current.title;
    const updatedAvatar = avatar !== undefined ? avatar : current.avatar;
    const updatedPhone = phone !== undefined ? phone : current.phone;
    const updatedOfficeHours = officeHours !== undefined ? officeHours : current.office_hours;
    const updatedRegNo = regNo !== undefined ? regNo.trim() : current.reg_no;

    await pool.query(
      `UPDATE users SET name = ?, email = ?, department = ?, title = ?, avatar = ?, phone = ?, office_hours = ?, reg_no = ? WHERE id = ?`,
      [
        updatedName,
        updatedEmail,
        updatedDepartment,
        updatedTitle,
        updatedAvatar,
        updatedPhone,
        updatedOfficeHours,
        updatedRegNo,
        id,
      ]
    );

    const [updatedRows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'User profile updated successfully',
      data: formatUserRow(updatedRows[0]),
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
    });
  }
};

// DELETE /api/users/:id (Admin deletes a Faculty member)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Faculty user deleted successfully',
      data: formatUserRow(rows[0]),
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
