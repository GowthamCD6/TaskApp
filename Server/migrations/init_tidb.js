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

const initialUsers = [];
const initialTasks = [];
const initialNotifications = [];

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
