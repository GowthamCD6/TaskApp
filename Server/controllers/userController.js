const fs = require('fs');
const path = require('path');
const { runMigrations } = require('../migrations/migrate');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Helper to read users from data store with auto-migration fallback
const readUsersFromFile = () => {
  if (!fs.existsSync(USERS_FILE)) {
    console.log('⚡ Users data store missing. Auto-running database migrations...');
    runMigrations();
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

// Helper to save users to data store
const writeUsersToFile = (users) => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
};

const getUsers = (req, res) => {
  const { role } = req.query;
  const users = readUsersFromFile();
  let filteredUsers = users;

  if (role) {
    filteredUsers = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  res.status(200).json({
    status: 'success',
    results: filteredUsers.length,
    data: filteredUsers,
  });
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const users = readUsersFromFile();
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: 'User not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

// POST /api/users (Admin adds a new Faculty member)
const createUser = (req, res) => {
  const { name, email, department, title, avatar } = req.body;

  if (!name || !email || !department) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, Email, and Department are required',
    });
  }

  const users = readUsersFromFile();

  // Check if email already exists
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
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
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).json({
    status: 'success',
    message: `Faculty member ${newUser.name} created successfully`,
    data: newUser,
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  readUsersFromFile,
};
