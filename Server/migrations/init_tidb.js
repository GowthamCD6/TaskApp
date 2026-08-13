const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

const DB_NAME = process.env.DB_NAME || 'taskapp';

const initialUsers = [
  {
    id: 'fac-1',
    google_id: null,
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@university.edu',
    role: 'faculty',
    department: 'Computer Science',
    title: 'Associate Professor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: 'fac-2',
    google_id: null,
    name: 'Prof. Alan Turing',
    email: 'alan.turing@university.edu',
    role: 'faculty',
    department: 'Artificial Intelligence',
    title: 'Department Head',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'fac-3',
    google_id: null,
    name: 'Dr. Emily Watson',
    email: 'emily.watson@university.edu',
    role: 'faculty',
    department: 'Software Engineering',
    title: 'Assistant Professor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'fac-4',
    google_id: null,
    name: 'Prof. Robert Miller',
    email: 'robert.miller@university.edu',
    role: 'faculty',
    department: 'Cyber Security',
    title: 'Senior Lecturer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
  {
    id: 'admin-1',
    google_id: null,
    name: 'Dean James Wilson',
    email: 'admin.dean@university.edu',
    role: 'admin',
    department: 'Academic Administration',
    title: 'Chief Academic Officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
];

const formatDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const initialTasks = [
  {
    id: 'task-101',
    title: 'Grade Midterm Lab Exam',
    description: 'Evaluate lab reports and enter grades into portal for CS-302.',
    assignedTo: 'fac-1',
    assignedToName: 'Dr. Sarah Smith',
    assignedBy: 'Dean James Wilson',
    date: formatDate(0),
    startTime: '09:00',
    endTime: '11:30',
    priority: 'High',
    status: 'pending',
    completionNote: '',
    completedAt: null,
  },
  {
    id: 'task-102',
    title: 'AI Curriculum Review Meeting',
    description: 'Review syllabus updates for modern Generative AI modules.',
    assignedTo: 'fac-2',
    assignedToName: 'Prof. Alan Turing',
    assignedBy: 'Dean James Wilson',
    date: formatDate(0),
    startTime: '14:00',
    endTime: '15:30',
    priority: 'Medium',
    status: 'pending',
    completionNote: '',
    completedAt: null,
  },
  {
    id: 'task-103',
    title: 'Prepare Lecture Slides on React Native',
    description: 'Create slide deck on state management and navigation primitives.',
    assignedTo: 'fac-3',
    assignedToName: 'Dr. Emily Watson',
    assignedBy: 'Dean James Wilson',
    date: formatDate(0),
    startTime: '11:00',
    endTime: '13:00',
    priority: 'High',
    status: 'completed',
    completionNote: 'Finished slides and uploaded PDF to course repository for students.',
    completedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  },
  {
    id: 'task-104',
    title: 'Cyber Security Accreditation Audit',
    description: 'Compile ISO compliance report for lab infrastructure.',
    assignedTo: 'fac-4',
    assignedToName: 'Prof. Robert Miller',
    assignedBy: 'Dean James Wilson',
    date: formatDate(1),
    startTime: '10:00',
    endTime: '12:00',
    priority: 'High',
    status: 'pending',
    completionNote: '',
    completedAt: null,
  },
];

async function initTiDB() {
  console.log('🚀 Connecting to TiDB Cloud Host...');
  
  // 1. Connect without selecting database to ensure DB_NAME exists
  const rootConn = await mysql.createConnection(dbConfig);
  console.log(`📦 Creating Database '${DB_NAME}' if not exists...`);
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await rootConn.end();

  // 2. Connect with DB selected
  const conn = await mysql.createConnection({ ...dbConfig, database: DB_NAME });

  try {
    // 3. Create Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role ENUM('admin', 'faculty') DEFAULT 'faculty',
        department VARCHAR(255),
        title VARCHAR(255),
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Users table created/verified on TiDB Cloud.');

    // 4. Create Tasks Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        assigned_to VARCHAR(50) NOT NULL,
        assigned_to_name VARCHAR(255),
        assigned_by VARCHAR(255) DEFAULT 'Dean James Wilson',
        date DATE NOT NULL,
        start_time VARCHAR(10) DEFAULT '09:00',
        end_time VARCHAR(10) DEFAULT '10:00',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        status ENUM('pending', 'completed') DEFAULT 'pending',
        completion_note TEXT,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Tasks table created/verified on TiDB Cloud.');

    // 5. Seed Users
    const [existingUsers] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('🌱 Seeding initial Users into TiDB...');
      for (const u of initialUsers) {
        await conn.query(
          `INSERT INTO users (id, google_id, name, email, role, department, title, avatar)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.google_id, u.name, u.email, u.role, u.department, u.title, u.avatar]
        );
      }
      console.log('✅ Initial users seeded successfully.');
    } else {
      console.log('ℹ️ Users table already contains data.');
    }

    // 6. Seed Tasks
    const [existingTasks] = await conn.query('SELECT COUNT(*) as count FROM tasks');
    if (existingTasks[0].count === 0) {
      console.log('🌱 Seeding initial Tasks into TiDB...');
      for (const t of initialTasks) {
        await conn.query(
          `INSERT INTO tasks (id, title, description, assigned_to, assigned_to_name, assigned_by, date, start_time, end_time, priority, status, completion_note, completed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.id,
            t.title,
            t.description,
            t.assignedTo,
            t.assignedToName,
            t.assignedBy,
            t.date,
            t.startTime,
            t.endTime,
            t.priority,
            t.status,
            t.completionNote,
            t.completedAt,
          ]
        );
      }
      console.log('✅ Initial tasks seeded successfully.');
    } else {
      console.log('ℹ️ Tasks table already contains data.');
    }

    console.log('🎉 TiDB Database Setup Complete!');
  } catch (err) {
    console.error('❌ Error during TiDB initialization:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  initTiDB()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { initTiDB };
