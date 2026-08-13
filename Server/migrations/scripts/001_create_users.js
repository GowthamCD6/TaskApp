const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const initialUsers = [
  {
    id: 'fac-1',
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@university.edu',
    role: 'faculty',
    department: 'Computer Science',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    title: 'Associate Professor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fac-2',
    name: 'Prof. Alan Turing',
    email: 'alan.turing@university.edu',
    role: 'faculty',
    department: 'Artificial Intelligence',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    title: 'Department Head',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fac-3',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@university.edu',
    role: 'faculty',
    department: 'Software Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    title: 'Assistant Professor',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fac-4',
    name: 'Prof. Robert Miller',
    email: 'robert.miller@university.edu',
    role: 'faculty',
    department: 'Cyber Security',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    title: 'Senior Lecturer',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin-1',
    name: 'Dean James Wilson',
    email: 'admin.dean@university.edu',
    role: 'admin',
    department: 'Academic Administration',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    title: 'Chief Academic Officer',
    createdAt: new Date().toISOString(),
  },
];

async function up() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
  console.log(' Migration 001_create_users: Successfully seeded users data.');
}

async function down() {
  if (fs.existsSync(USERS_FILE)) {
    fs.unlinkSync(USERS_FILE);
    console.log(' Migration 001_create_users: Rolled back users data.');
  }
}

module.exports = {
  name: '001_create_users',
  up,
  down,
};
