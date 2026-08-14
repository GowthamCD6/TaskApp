const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

const formatDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const todayStr = formatDate(0);
const tomorrowStr = formatDate(1);

const initialTasks = [];

async function up() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(TASKS_FILE, JSON.stringify(initialTasks, null, 2), 'utf-8');
  console.log(' Migration 002_create_tasks: Successfully seeded tasks data.');
}

async function down() {
  if (fs.existsSync(TASKS_FILE)) {
    fs.unlinkSync(TASKS_FILE);
    console.log(' Migration 002_create_tasks: Rolled back tasks data.');
  }
}

module.exports = {
  name: '002_create_tasks',
  up,
  down,
};
