const { pool } = require('../config/db');

// Helper to format user row
const formatUserRow = (row) => {
  const modeId = row.theme_mode_id !== undefined ? Number(row.theme_mode_id) : (row.themeMode === 'dark' || row.theme_mode === 'dark' ? 2 : 1);
  return {
    id: row.id,
    googleId: row.google_id || null,
    regNo: row.reg_no || '',
    name: row.name || '',
    email: row.email || '',
    role: row.role || 'faculty',
    department: row.department || '',
    title: row.title || '',
    avatar: row.avatar || '',
    phone: row.phone || '',
    officeHours: row.office_hours || '',
    themeModeId: modeId,
    themeMode: modeId === 2 ? 'dark' : 'light',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
};

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
    const { name, email, department, title, avatar, phone, officeHours, regNo, password } = req.body;

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
      id: `fac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reg_no: regNo ? regNo.trim() : '',
      password: password ? password.trim() : '123456',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'faculty',
      department: department.trim(),
      title: title ? title.trim() : '',
      avatar: avatar ? avatar.trim() : '',
      phone: phone ? phone.trim() : '',
      office_hours: officeHours ? officeHours.trim() : '',
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
    const { name, email, department, title, avatar, phone, officeHours, regNo, password, themeMode, theme_mode, themeModeId } = req.body;

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

    const updatedPassword = (password && password.trim()) ? password.trim() : current.password;

    await pool.query(
      `UPDATE users SET name = ?, email = ?, department = ?, title = ?, avatar = ?, phone = ?, office_hours = ?, reg_no = ?, password = ? WHERE id = ?`,
      [
        updatedName,
        updatedEmail,
        updatedDepartment,
        updatedTitle,
        updatedAvatar,
        updatedPhone,
        updatedOfficeHours,
        updatedRegNo,
        updatedPassword,
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
