const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const initialUsers = [];

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
