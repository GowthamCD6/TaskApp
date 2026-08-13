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
    reg_no: 'FAC-2026-101',
    password: '123456',
    name: 'Dr. Sarah Smith',
    email: 'sarah.smith@university.edu',
    role: 'faculty',
    department: 'Computer Science',
    title: 'Associate Professor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    phone: '+1 (555) 123-4567',
    office_hours: 'Mon - Thu, 10:00 AM - 02:00 PM',
  },
  {
    id: 'fac-2',
    google_id: null,
    reg_no: 'FAC-2026-102',
    password: '123456',
    name: 'Prof. Alan Turing',
    email: 'alan.turing@university.edu',
    role: 'faculty',
    department: 'Artificial Intelligence',
    title: 'Department Head',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+1 (555) 987-6543',
    office_hours: 'Tue - Fri, 11:00 AM - 03:00 PM',
  },
  {
    id: 'fac-3',
    google_id: null,
    reg_no: 'FAC-2026-103',
    password: '123456',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@university.edu',
    role: 'faculty',
    department: 'Software Engineering',
    title: 'Assistant Professor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+1 (555) 456-7890',
    office_hours: 'Mon - Wed, 01:00 PM - 04:00 PM',
  },
  {
    id: 'fac-4',
    google_id: null,
    reg_no: 'FAC-2026-104',
    password: '123456',
    name: 'Prof. Robert Miller',
    email: 'robert.miller@university.edu',
    role: 'faculty',
    department: 'Cyber Security',
    title: 'Senior Lecturer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    phone: '+1 (555) 321-7654',
    office_hours: 'Wed - Fri, 09:00 AM - 01:00 PM',
  },
  {
    id: 'admin-1',
    google_id: null,
    reg_no: '242IT163',
    password: '123456',
    name: 'Gowtham',
    email: 'gowthamcd.it24@bitsathy.ac.in',
    role: 'admin',
    department: 'Information Technology',
    title: 'System Administrator',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    phone: '+91 9876543210',
    office_hours: 'Mon - Fri, 09:00 AM - 05:00 PM',
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

const initialNotifications = [
  {
    id: 'notif-1',
    userId: 'fac-1',
    title: 'Urgent Room Change Notice',
    message: 'The 2:00 PM Data Structures lecture has been moved to Auditorium 302 due to maintenance.',
    type: 'urgent',
    timestamp: '10 mins ago',
    isRead: false,
    senderName: 'Academic Office',
  },
  {
    id: 'notif-2',
    userId: 'fac-1',
    title: 'New Task Assigned by Dean',
    message: 'You have been assigned to evaluate mid-term examination answer scripts.',
    type: 'task_assigned',
    timestamp: '1 hour ago',
    isRead: false,
    senderName: 'Dean James Wilson',
  },
  {
    id: 'notif-3',
    userId: 'fac-1',
    title: 'Upcoming Lecture Reminder',
    message: 'Advanced Software Engineering lecture starts in 30 minutes at Room 104.',
    type: 'reminder',
    timestamp: '2 hours ago',
    isRead: true,
    senderName: 'System Reminder',
  },
  {
    id: 'notif-4',
    userId: 'fac-1',
    title: 'Departmental Faculty Meeting',
    message: 'Quarterly faculty progress review meeting scheduled for tomorrow at 4:00 PM in Conference Hall B.',
    type: 'broadcast',
    timestamp: '1 day ago',
    isRead: true,
    senderName: 'Head of Department',
  },
];

async function initTiDB() {
  console.log('🚀 Connecting to TiDB Cloud Host...');

  const rootConn = await mysql.createConnection(dbConfig);
  console.log(`📦 Creating Database '${DB_NAME}' if not exists...`);
  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await rootConn.end();

  const conn = await mysql.createConnection({ ...dbConfig, database: DB_NAME });

  try {
    // 0. Create Theme Modes Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS theme_modes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.query(`
      INSERT IGNORE INTO theme_modes (id, name) VALUES (1, 'light'), (2, 'dark');
    `);

    // 1. Create Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        reg_no VARCHAR(100) UNIQUE,
        password VARCHAR(255) DEFAULT '123456',
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role ENUM('admin', 'faculty') DEFAULT 'faculty',
        department VARCHAR(255),
        title VARCHAR(255),
        avatar TEXT,
        phone VARCHAR(50),
        office_hours VARCHAR(255),
        theme_mode_id INT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (theme_mode_id) REFERENCES theme_modes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Alter table to add any missing columns in existing deployments
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS reg_no VARCHAR(100)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT "123456"',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS office_hours VARCHAR(255)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_mode_id INT DEFAULT 1',
    ];
    for (const q of alterQueries) {
      try {
        await conn.query(q);
      } catch (err) {
        // Ignore column exists error
      }
    }
    console.log('✅ Users & Theme Modes tables created/updated on TiDB Cloud.');

    // 2. Create Tasks Table
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

    // 3. Create Notifications Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('task_assigned', 'reminder', 'broadcast', 'urgent') DEFAULT 'reminder',
        timestamp VARCHAR(100),
        is_read BOOLEAN DEFAULT FALSE,
        sender_name VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('✅ Notifications table created/verified on TiDB Cloud.');

    // 4. Seed Users
    const [existingUsers] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('🌱 Seeding initial Users into TiDB...');
      for (const u of initialUsers) {
        await conn.query(
          `INSERT INTO users (id, google_id, reg_no, password, name, email, role, department, title, avatar, phone, office_hours)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.google_id, u.reg_no, u.password, u.name, u.email, u.role, u.department, u.title, u.avatar, u.phone, u.office_hours]
        );
      }
      console.log('✅ Initial users seeded successfully.');
    } else {
      // Update existing users with reg_no, password, phone, office_hours, name, email
      for (const u of initialUsers) {
        await conn.query(
          `UPDATE users SET name = ?, email = ?, reg_no = ?, password = ?, role = ?, department = ?, title = ?, phone = ?, office_hours = ? WHERE id = ?`,
          [u.name, u.email, u.reg_no, u.password, u.role, u.department, u.title, u.phone, u.office_hours, u.id]
        );
      }
      console.log('✅ Existing users updated with credentials & profile attributes.');
    }

    // 5. Seed Tasks
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
    }

    // 6. Seed Notifications
    const [existingNotifications] = await conn.query('SELECT COUNT(*) as count FROM notifications');
    if (existingNotifications[0].count === 0) {
      console.log('🌱 Seeding initial Notifications into TiDB...');
      for (const n of initialNotifications) {
        await conn.query(
          `INSERT INTO notifications (id, user_id, title, message, type, timestamp, is_read, sender_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [n.id, n.userId, n.title, n.message, n.type, n.timestamp, n.isRead, n.senderName]
        );
      }
      console.log('✅ Initial notifications seeded successfully.');
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
