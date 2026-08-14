const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Embedded SQLite Database File
const dbPath = path.join(dataDir, 'taskapp.sqlite');
const sqliteDb = new sqlite3.Database(dbPath);

// Initialize SQLite SQL Tables
sqliteDb.serialize(() => {
  // 1. Theme Modes & Themes Table
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS theme_modes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
  sqliteDb.run(`INSERT OR IGNORE INTO theme_modes (id, name) VALUES (1, 'light'), (2, 'dark');`);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );
  `);
  sqliteDb.run(`INSERT OR IGNORE INTO themes (id, name) VALUES (1, 'light'), (2, 'dark');`);

  // 2. Users Table
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE,
      reg_no TEXT UNIQUE,
      password TEXT DEFAULT '123456',
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'faculty',
      department TEXT,
      title TEXT,
      avatar TEXT,
      phone TEXT,
      office_hours TEXT,
      theme_mode_id INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Tasks Table
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      assigned_to TEXT NOT NULL,
      assigned_to_name TEXT,
      assigned_by TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'pending',
      completion_note TEXT,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Notifications Table
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'broadcast',
      is_read INTEGER DEFAULT 0,
      related_task_id TEXT,
      sender_name TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Initial SQL Database Users if empty
  sqliteDb.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (!err && row && row.count === 0) {
      const seedUsers = [
        ['admin-1', '109197831663137140571', '242IT163', '123456', 'Gowtham', 'gowthamcd.it24@bitsathy.ac.in', 'admin', 'Information Technology', 'System Administrator', 'https://lh3.googleusercontent.com/a/ACg8ocJX6QioVD5BsdmqJQ9Q8DtHn5GBo-gxaXsx_j2yWcB0YNhDD-4', '+91 9876543210', 'Mon - Fri, 09:00 AM - 05:00 PM', 1],
        ['fac-1', null, 'FAC-2026-101', '123456', 'Dr. Sarah Smith', 'sarah.smith@university.edu', 'faculty', 'Computer Science', 'Associate Professor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '+1 (555) 123-4567', 'Mon - Thu, 10:00 AM - 02:00 PM', 1],
        ['fac-2', null, 'FAC-2026-102', '123456', 'Prof. Alan Turing', 'alan.turing@university.edu', 'faculty', 'Artificial Intelligence', 'Department Head', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', '+1 (555) 987-6543', 'Tue - Fri, 11:00 AM - 03:00 PM', 1],
        ['fac-3', null, 'FAC-2026-103', '123456', 'Dr. Emily Watson', 'emily.watson@university.edu', 'faculty', 'Software Engineering', 'Assistant Professor', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '+1 (555) 456-7890', 'Mon - Wed, 01:00 PM - 04:00 PM', 1],
        ['fac-4', null, 'FAC-2026-104', '123456', 'Prof. Robert Miller', 'robert.miller@university.edu', 'faculty', 'Cyber Security', 'Senior Lecturer', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', '+1 (555) 321-7654', 'Wed - Fri, 09:00 AM - 01:00 PM', 1]
      ];
      const stmt = sqliteDb.prepare(`
        INSERT INTO users (id, google_id, reg_no, password, name, email, role, department, title, avatar, phone, office_hours, theme_mode_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of seedUsers) {
        stmt.run(u);
      }
      stmt.finalize();
      console.log('✅ Seeded initial database records into SQLite users table.');
    }
  });

  // Seed Initial SQL Database Notifications if empty
  sqliteDb.get('SELECT COUNT(*) as count FROM notifications', (err, row) => {
    if (!err && row && row.count === 0) {
      const seedNotifications = [
        ['notif-1', 'New Task Assignment', 'You have been assigned to prepare CS301 Curriculum Review.', 'task_assigned', 0, null, 'Gowtham'],
        ['notif-2', 'Academic Review Meeting', 'Departmental Review Meeting scheduled for tomorrow at 10:00 AM.', 'broadcast', 0, null, 'Academic Office'],
        ['notif-3', 'Task Status Update', 'Dr. Sarah Smith completed task CS301 Syllabus Update.', 'urgent', 1, null, 'System']
      ];
      const stmt = sqliteDb.prepare(`
        INSERT INTO notifications (id, title, message, type, is_read, related_task_id, sender_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const n of seedNotifications) {
        stmt.run(n);
      }
      stmt.finalize();
      console.log('✅ Seeded initial notifications into SQLite database table.');
    }
  });
});

let useLocalSQLite = false;

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskapp',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 5000,
});

// Helper to execute pure SQL queries on SQLite table engine
const querySQLite = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    let sanitizedSQL = sql.trim();
    // Normalize MySQL functions for SQLite (COALESCE, LOWER, etc.)
    const upperSQL = sanitizedSQL.toUpperCase();

    if (upperSQL.startsWith('SELECT')) {
      sqliteDb.all(sanitizedSQL, params, (err, rows) => {
        if (err) {
          console.error('SQLite SELECT Error:', err.message, 'SQL:', sanitizedSQL);
          return reject(err);
        }
        resolve([rows, []]);
      });
    } else {
      sqliteDb.run(sanitizedSQL, params, function (err) {
        if (err) {
          console.error('SQLite Statement Error:', err.message, 'SQL:', sanitizedSQL);
          return reject(err);
        }
        resolve([{ affectedRows: this.changes, insertId: this.lastID }, []]);
      });
    }
  });
};

const pool = {
  query: async (sql, params = []) => {
    if (useLocalSQLite) {
      return querySQLite(sql, params);
    }
    try {
      return await mysqlPool.query(sql, params);
    } catch (err) {
      if (!useLocalSQLite) {
        console.warn('⚠️ MySQL connection unavailable. Switching to pure SQLite SQL database table engine.');
        useLocalSQLite = true;
      }
      return querySQLite(sql, params);
    }
  },
  getConnection: async () => {
    if (useLocalSQLite) {
      return {
        query: (sql, params) => querySQLite(sql, params),
        release: () => { },
      };
    }
    try {
      return await mysqlPool.getConnection();
    } catch (err) {
      useLocalSQLite = true;
      return {
        query: (sql, params) => querySQLite(sql, params),
        release: () => { },
      };
    }
  },
};

module.exports = {
  pool,
  mysqlPool,
};
